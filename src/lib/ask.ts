import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { book } from "@/data/book";
import { citedLines, findCitations, type Citation } from "@/lib/citations";

/**
 * The question feature: the whole novella goes into the (cached) system prompt, so answers can cite
 * exact page and line numbers without any retrieval step.
 */

export const ASK_MODEL = process.env.ANTHROPIC_MODEL ?? "claude-opus-5";

// USD per million tokens (input, output). Cache reads cost 0.1x input; 1-hour cache writes 2x input.
const PRICES: Record<string, { input: number; output: number }> = {
  "claude-opus-5": { input: 5, output: 25 },
  "claude-opus-5-5": { input: 4, output: 20 },
  "claude-sonnet-5": { input: 2, output: 10 },
  "claude-haiku-4-5": { input: 1, output: 5 },
};

// Models with server-side refusal fallbacks and the effort parameter.
const SUPPORTS_FALLBACKS = /^claude-(opus-5|fable-5)/.test(ASK_MODEL);
const SUPPORTS_EFFORT = !ASK_MODEL.startsWith("claude-haiku-4-5");

const INSTRUCTIONS = `Du bist ein Lernbegleiter für Thomas Manns Novelle «Mario und der Zauberer» in der Ausgabe Fischer Taschenbuch. Du hilfst Schülerinnen und Schülern in der Schweiz bei der Prüfungsvorbereitung und schreibst Deutsch mit Schweizer Rechtschreibung (ss statt ß in deinen eigenen Sätzen).

Deine einzige Quelle ist der Novellentext unten. Seiten beginnen mit «=== S. 42 ===», jede Zeile beginnt mit ihrer Zeilennummer.

So antwortest du:
- Belege jede Aussage über den Inhalt mit einer Stellenangabe im Format (S. 42, Z. 17) oder (S. 42, Z. 17–19). Die Zahlen müssen genau zu den Seiten- und Zeilennummern im Text passen, denn die App verlinkt sie auf diese Stelle.
- Kurze wörtliche Zitate in «…» sind willkommen, genau so geschrieben wie im Text.
- Steht etwas nicht im Text, sag das offen und rate nicht. Deutungen sind erlaubt, wenn du sie als Deutung kennzeichnest und am Text festmachst.
- Antworte knapp, meist in drei bis sechs Sätzen, als Fliesstext ohne Überschriften, Listen oder Markdown.
- Fragen ohne Bezug zum Buch beantwortest du nicht, sondern lenkst freundlich zum Buch zurück.
- Beginne sofort mit der Antwort.`;

const BOOK_TEXT = book.pages
  .map((p) => `=== S. ${p.page} ===\n${p.lines.map((l) => `${l.line} ${l.text}`).join("\n")}`)
  .join("\n");

let client: Anthropic | null = null;

/** Local UI testing without an API key: ASK_MOCK=1 streams a canned answer. Never active in production. */
const MOCK = process.env.ASK_MOCK === "1" && process.env.VERCEL_ENV !== "production";
export const isAskConfigured = () => MOCK || Boolean(process.env.ANTHROPIC_API_KEY);

const MOCK_ANSWER =
  "Das ist eine Testantwort ohne KI. Der Erzähler nennt den Aufenthalt gleich zu Beginn «atmosphärisch unangenehm» (S. 9, Z. 1–2) " +
  "und kündigt den «Chok» mit Cipolla an (S. 9, Z. 4–5). Diese Angabe gibt es nicht: (S. 200, Z. 3).";

export type AskUsage = {
  model: string;
  input_tokens: number;
  output_tokens: number;
  cache_read_tokens: number;
  cache_write_tokens: number;
  cost_usd: number;
  stop_reason: string | null;
};

export type CheckedCitation = Citation & { valid: boolean };

export type AskEvent =
  | { t: "delta"; text: string }
  | { t: "done"; citations: CheckedCitation[] }
  | { t: "error"; message: string };

function costOf(u: Omit<AskUsage, "cost_usd" | "model" | "stop_reason">, model: string) {
  const p = PRICES[model];
  if (!p) return 0;
  const usd =
    u.input_tokens * p.input +
    u.cache_write_tokens * p.input * 2 +
    u.cache_read_tokens * p.input * 0.1 +
    u.output_tokens * p.output;
  return Math.round((usd / 1_000_000) * 1_000_000) / 1_000_000;
}

/** Every citation in the answer, checked against the book: does that page and line exist? */
export function checkCitations(answer: string): CheckedCitation[] {
  return findCitations(answer).map(({ citation }) => ({ ...citation, valid: citedLines(book, citation) !== null }));
}

/**
 * Streams an answer. `emit` receives text deltas; the returned promise resolves with usage and the
 * full answer once the model is done.
 */
export async function streamAnswer(
  question: string,
  emit: (text: string) => void,
): Promise<{ answer: string; usage: AskUsage; refused: boolean }> {
  if (MOCK) {
    for (const word of MOCK_ANSWER.split(/(?<= )/)) {
      emit(word);
      await new Promise((r) => setTimeout(r, 30));
    }
    const usage = { input_tokens: 0, output_tokens: 0, cache_read_tokens: 0, cache_write_tokens: 0 };
    return { answer: MOCK_ANSWER, refused: false, usage: { model: "mock", ...usage, cost_usd: 0, stop_reason: "end_turn" } };
  }

  client ??= new Anthropic();

  const stream = client.beta.messages.stream({
    model: ASK_MODEL,
    // Room for adaptive thinking plus a short answer.
    max_tokens: 8000,
    system: [
      { type: "text", text: INSTRUCTIONS },
      // The book never changes between requests, so the whole prefix is cached for an hour.
      { type: "text", text: BOOK_TEXT, cache_control: { type: "ephemeral", ttl: "1h" } },
    ],
    messages: [{ role: "user", content: question }],
    ...(SUPPORTS_EFFORT ? { output_config: { effort: "medium" as const } } : {}),
    ...(SUPPORTS_FALLBACKS ? { betas: ["server-side-fallback-2026-07-01"], fallbacks: "default" as const } : {}),
  });

  let answer = "";
  for await (const event of stream) {
    if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
      answer += event.delta.text;
      emit(event.delta.text);
    }
  }
  const message = await stream.finalMessage();
  const u = message.usage;
  const tokens = {
    input_tokens: u.input_tokens,
    output_tokens: u.output_tokens,
    cache_read_tokens: u.cache_read_input_tokens ?? 0,
    cache_write_tokens: u.cache_creation_input_tokens ?? 0,
  };
  return {
    answer,
    refused: message.stop_reason === "refusal",
    usage: { model: message.model, ...tokens, cost_usd: costOf(tokens, ASK_MODEL), stop_reason: message.stop_reason },
  };
}
