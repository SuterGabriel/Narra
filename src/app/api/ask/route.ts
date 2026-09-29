import { after } from "next/server";
import { checkCitations, isAskConfigured, streamAnswer, type AskEvent, type AskUsage } from "@/lib/ask";
import { log, withLogging } from "@/lib/log";
import { consumeQuota, quotaMessages, recordRequest } from "@/lib/quota";

export const dynamic = "force-dynamic";
// Answers with thinking can take a while; the stream keeps the connection busy.
export const maxDuration = 60;

const MAX_QUESTION = 500;

/**
 * POST { question } -> newline-delimited JSON events:
 *   {"t":"delta","text":"…"}*  then  {"t":"done","citations":[…]}  or  {"t":"error","message":"…"}
 */
export const POST = withLogging("/api/ask", async (req, ctx) => {
  if (!isAskConfigured()) {
    return Response.json({ error: "Die Frage-Funktion ist noch nicht eingerichtet." }, { status: 503 });
  }

  const body = (await req.json().catch(() => null)) as { question?: unknown } | null;
  const question = typeof body?.question === "string" ? body.question.trim() : "";
  if (question.length < 3 || question.length > MAX_QUESTION) {
    return Response.json({ error: `Bitte stell eine Frage mit 3 bis ${MAX_QUESTION} Zeichen.` }, { status: 400 });
  }

  const quota = await consumeQuota(req);
  if (!quota.allowed) {
    ctx.fields.quota = quota.reason;
    const status = quota.reason === "client_limit" || quota.reason === "daily_budget" ? 429 : 503;
    return Response.json({ error: quotaMessages[quota.reason] }, { status });
  }

  const start = performance.now();
  const encoder = new TextEncoder();
  let resolveDone: (v: { usage?: AskUsage; error?: string; citations: number; invalid: number }) => void;
  const done = new Promise<Parameters<typeof resolveDone>[0]>((r) => (resolveDone = r));

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (e: AskEvent) => controller.enqueue(encoder.encode(JSON.stringify(e) + "\n"));
      try {
        const { answer, usage, refused } = await streamAnswer(question, (text) => send({ t: "delta", text }));
        if (refused) {
          send({ t: "error", message: "Diese Frage kann ich nicht beantworten. Versuch es mit einer Frage zum Buch." });
        }
        const citations = checkCitations(answer);
        send({ t: "done", citations });
        resolveDone({ usage, citations: citations.length, invalid: citations.filter((c) => !c.valid).length });
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        send({ t: "error", message: "Die Antwort ist gerade fehlgeschlagen. Bitte versuch es gleich nochmal." });
        resolveDone({ error: message, citations: 0, invalid: 0 });
      } finally {
        controller.close();
      }
    },
  });

  // Runs after the stream has finished: one detailed log entry and one database row per AI request.
  after(async () => {
    const result = await done;
    const duration_ms = Math.round(performance.now() - start);
    const fields = {
      request_id: ctx.requestId,
      route: "/api/ask",
      duration_ms,
      question_chars: question.length,
      citations_total: result.citations,
      citations_invalid: result.invalid,
      ...(result.usage ?? {}),
      cache_hit: (result.usage?.cache_read_tokens ?? 0) > 0,
      ...(result.error ? { error: result.error } : {}),
    };
    log(result.error ? "error" : result.invalid > 0 ? "warn" : "info", "ai_request", fields);
    await recordRequest({
      request_id: ctx.requestId,
      route: "/api/ask",
      model: result.usage?.model,
      input_tokens: result.usage?.input_tokens,
      output_tokens: result.usage?.output_tokens,
      cache_read_tokens: result.usage?.cache_read_tokens,
      cache_write_tokens: result.usage?.cache_write_tokens,
      cost_usd: result.usage?.cost_usd,
      duration_ms,
      status: result.error ? 500 : 200,
      error: result.error,
    });
  });

  return new Response(stream, {
    headers: { "Content-Type": "application/x-ndjson; charset=utf-8", "Cache-Control": "no-store" },
  });
});
