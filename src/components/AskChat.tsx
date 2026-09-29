"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { citationHref, findCitations, formatCitation, type Citation } from "@/lib/citations";
import { Hint } from "./Hint";
import { MicIcon } from "./Icons";

type CheckedCitation = Citation & { valid?: boolean };

type Turn = {
  id: number;
  question: string;
  answer: string;
  status: "streaming" | "done" | "error";
  error?: string;
  citations?: CheckedCitation[];
};

type SourceLines = { page: number; from: number; to: number; lines: { line: number; text: string; cited: boolean }[] };

const suggestions = [
  "Warum lässt sich Mario hypnotisieren?",
  "Wer ist Cipolla und wie tritt er auf?",
  "Warum reist die Familie nicht früher ab?",
  "Wie ist der Schluss zu deuten?",
];

const MAX = 500;
const key = (c: Citation) => `${c.page}:${c.line}-${c.lineEnd ?? c.line}`;
const isDesktop = () => typeof window !== "undefined" && window.matchMedia("(min-width: 1024px)").matches;

/** Answer text with every "S. 42, Z. 17" turned into a link (or, on desktop, a button for the source panel). */
function AnswerText({
  text,
  checked,
  onSelect,
}: {
  text: string;
  checked?: CheckedCitation[];
  onSelect: (c: Citation) => void;
}) {
  const parts: ReactNode[] = [];
  let pos = 0;
  for (const { index, length, citation } of findCitations(text)) {
    if (index > pos) parts.push(text.slice(pos, index));
    const valid = checked ? checked.find((c) => key(c) === key(citation))?.valid !== false : true;
    parts.push(
      valid ? (
        <a
          key={index}
          href={citationHref(citation)}
          onClick={(e) => {
            if (isDesktop()) {
              e.preventDefault();
              onSelect(citation);
            }
          }}
          className="font-semibold whitespace-nowrap text-accent-soft-ink underline decoration-accent/40 underline-offset-2"
        >
          {text.slice(index, index + length)}
        </a>
      ) : (
        <span key={index} title="Diese Stelle gibt es im Buch nicht" className="whitespace-nowrap text-muted line-through">
          {text.slice(index, index + length)}
        </span>
      ),
    );
    pos = index + length;
  }
  if (pos < text.length) parts.push(text.slice(pos));
  return <>{parts}</>;
}

function SourcePanel({ citation }: { citation: Citation | null }) {
  const [data, setData] = useState<SourceLines | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!citation) return;
    let cancelled = false;
    const range = citation.lineEnd && citation.lineEnd !== citation.line ? `${citation.line}-${citation.lineEnd}` : `${citation.line}`;
    fetch(`/api/stelle?s=${citation.page}&z=${range}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d: SourceLines) => {
        if (!cancelled) {
          setData(d);
          setError(false);
        }
      })
      .catch(() => !cancelled && setError(true));
    return () => {
      cancelled = true;
    };
  }, [citation]);

  if (!citation) {
    return (
      <p className="rounded-2xl border border-dashed border-line-strong p-4 text-sm text-muted">
        Tippe in einer Antwort auf einen Beleg wie „S. 12, Z. 4“. Die Stelle öffnet sich hier, die belegten Zeilen hervorgehoben.
      </p>
    );
  }
  if (error) return <p className="text-sm text-muted">Die Stelle konnte nicht geladen werden.</p>;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <p className="font-display text-xl font-bold">{formatCitation(citation)}</p>
        <Link href={citationHref(citation)} className="flex h-11 items-center rounded-xl border border-line-strong px-3 text-sm font-medium">
          Im Buch öffnen
        </Link>
      </div>
      <div className="flex flex-col">
        {(data?.page === citation.page ? data.lines : []).map((l) => (
          <div key={l.line} className={`-mx-2 flex items-baseline gap-3 rounded-md px-2 py-1 ${l.cited ? "bg-accent-soft" : ""}`}>
            <span className={`w-6 shrink-0 text-right text-xs tabular-nums ${l.cited ? "font-semibold text-accent" : "text-faint"}`}>
              {l.line}
            </span>
            <span className={`font-serif text-[15px] leading-relaxed ${l.cited ? "" : "text-muted"}`}>{l.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AskChat() {
  const [turns, setTurns] = useState<Turn[]>([]);
  const [question, setQuestion] = useState("");
  const [selected, setSelected] = useState<Citation | null>(null);
  const busy = turns.some((t) => t.status === "streaming");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end", behavior: "smooth" });
  }, [turns]);

  // A question typed on the start page arrives as ?q=… and is asked once.
  const askedFromUrl = useRef(false);
  useEffect(() => {
    if (askedFromUrl.current) return;
    askedFromUrl.current = true;
    const q = new URLSearchParams(window.location.search).get("q");
    if (q) {
      window.history.replaceState(null, "", "/fragen");
      void ask(q);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function ask(raw: string) {
    const q = raw.trim().slice(0, MAX);
    if (q.length < 3 || busy) return;
    const id = Date.now();
    setQuestion("");
    setTurns((t) => [...t, { id, question: q, answer: "", status: "streaming" }]);
    const update = (patch: Partial<Turn> | ((t: Turn) => Partial<Turn>)) =>
      setTurns((all) => all.map((t) => (t.id === id ? { ...t, ...(typeof patch === "function" ? patch(t) : patch) } : t)));

    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q }),
      });
      if (!res.ok || !res.body) {
        const body = await res.json().catch(() => ({}));
        update({ status: "error", error: body.error ?? "Die Antwort ist gerade fehlgeschlagen." });
        return;
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.trim()) continue;
          const ev = JSON.parse(line);
          if (ev.t === "delta") update((t) => ({ answer: t.answer + ev.text }));
          else if (ev.t === "done") {
            update({ status: "done", citations: ev.citations });
            const first = (ev.citations as CheckedCitation[]).find((c) => c.valid);
            if (first) setSelected(first);
          } else if (ev.t === "error") update({ status: "error", error: ev.message });
        }
      }
      update((t) => (t.status === "streaming" ? { status: "done" } : {}));
    } catch {
      update({ status: "error", error: "Keine Verbindung. Bitte versuch es gleich nochmal." });
    }
  }

  return (
    <div className="flex flex-1 lg:h-dvh lg:min-h-0 lg:flex-none lg:overflow-hidden">
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex flex-col gap-1 px-6 pt-8 pb-2 lg:h-[72px] lg:shrink-0 lg:justify-center lg:gap-0.5 lg:border-b lg:border-line lg:px-8 lg:py-0">
          <h1 className="font-display text-3xl font-bold tracking-tight lg:text-[22px]">Fragen</h1>
          <p className="text-sm text-muted lg:text-[13px]">Antworten nur aus dem Buch, immer mit Beleg.</p>
        </header>

        <div className="flex min-h-0 flex-1 justify-center overflow-y-auto px-5 py-3.5 lg:p-8">
          <div className="flex w-full flex-col gap-4 lg:w-[620px] lg:gap-5" aria-live="polite">
            {turns.map((t) => (
              <div key={t.id} className="flex flex-col gap-3">
                <p className="max-w-[85%] self-end rounded-2xl rounded-br-sm bg-bubble px-4 py-3 text-[15px] leading-snug text-bubble-ink lg:text-base">
                  {t.question}
                </p>
                <article className="flex flex-col gap-2 rounded-2xl border border-line bg-surface p-[18px] lg:p-[22px]">
                  <p className="text-xs font-semibold tracking-[0.08em] text-accent uppercase">
                    {t.status === "error" ? "Hinweis" : "Aus dem Text"}
                  </p>
                  {t.answer && (
                    <p className="font-serif text-[15.5px] leading-relaxed whitespace-pre-line lg:text-[17px]">
                      <AnswerText text={t.answer} checked={t.citations} onSelect={setSelected} />
                    </p>
                  )}
                  {t.status === "streaming" && !t.answer && <p className="text-sm text-muted">Sucht im Buch …</p>}
                  {t.status === "error" && <p className="text-[15px] text-muted">{t.error}</p>}
                  {t.status === "done" && t.citations && t.citations.some((c) => !c.valid) && (
                    <p className="text-xs text-muted">Durchgestrichene Angaben gibt es im Buch nicht. Prüf die Aussage am Text.</p>
                  )}
                </article>
              </div>
            ))}

            {turns.length === 0 && (
              <Hint id="ask-citations">
                Narra antwortet nur aus dem Buch. Jede Antwort enthält Stellen wie «S. 42, Z. 17». Tipp darauf, um sie im Text zu sehen.
              </Hint>
            )}
            {turns.length === 0 && (
              <div className="flex flex-wrap gap-2">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => ask(s)}
                    className="min-h-11 rounded-xl border border-line-strong bg-paper px-3.5 py-2 text-left text-sm hover:bg-surface"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
            <div ref={endRef} />
          </div>
        </div>

        <div className="flex justify-center border-t border-line px-4 py-3 lg:border-0 lg:px-8 lg:pt-0 lg:pb-7">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              ask(question);
            }}
            className="flex w-full items-center gap-2.5 lg:w-[620px]"
          >
            <label className="flex-1">
              <span className="sr-only">Frage zum Buch</span>
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                maxLength={MAX}
                disabled={busy}
                placeholder={busy ? "Antwort läuft …" : "Frag etwas zum Buch …"}
                className="h-[46px] w-full rounded-xl border border-line-strong bg-surface px-4 text-[15px] placeholder:text-faint disabled:opacity-60 lg:h-[52px] lg:rounded-[14px] lg:text-base"
              />
            </label>
            <button
              type="button"
              disabled
              title="Spracheingabe folgt mit ElevenLabs"
              aria-label="Frage sprechen (folgt)"
              className="flex size-[46px] shrink-0 items-center justify-center rounded-xl bg-accent text-accent-ink opacity-50 lg:size-[52px] lg:rounded-[14px]"
            >
              <MicIcon size={20} />
            </button>
          </form>
        </div>
      </div>

      <aside aria-label="Quelle im Buch" className="hidden w-[440px] shrink-0 flex-col gap-5 overflow-y-auto border-l border-line bg-surface px-7 py-6 lg:flex">
        <p className="text-xs font-semibold tracking-[0.08em] text-accent uppercase">Quelle</p>
        <SourcePanel citation={selected} />
      </aside>
    </div>
  );
}
