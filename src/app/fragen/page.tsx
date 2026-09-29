"use client";

import { useState } from "react";
import { MicIcon } from "@/components/Icons";

const suggestions = ["Warum lässt sich Mario hypnotisieren?", "Wer ist Cipolla?", "Was bedeutet der Schluss?"];

export default function AskPage() {
  const [question, setQuestion] = useState("");
  const [asked, setAsked] = useState<string | null>(null);

  function submit(q: string) {
    const trimmed = q.trim();
    if (!trimmed) return;
    setAsked(trimmed);
    setQuestion("");
  }

  return (
    <div className="flex flex-1 lg:h-dvh">
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex flex-col gap-1 px-6 pt-8 pb-2 lg:h-[72px] lg:shrink-0 lg:justify-center lg:gap-0.5 lg:border-b lg:border-line lg:px-8 lg:py-0">
          <h1 className="font-display text-3xl font-bold tracking-tight lg:text-[22px]">Fragen</h1>
          <p className="text-sm text-muted lg:text-[13px]">Antworten nur aus dem Buch, immer mit Beleg.</p>
        </header>

        <div className="flex flex-1 justify-center overflow-y-auto px-5 py-3.5 lg:p-8">
          <div className="flex w-full flex-col gap-4 lg:w-[620px] lg:gap-5">
            {asked ? (
              <>
                <p className="max-w-[78%] self-end rounded-2xl rounded-br-sm bg-bubble px-4 py-3 text-[15px] leading-snug text-bubble-ink lg:text-base">
                  {asked}
                </p>
                <div className="flex flex-col gap-2 rounded-2xl border border-line bg-surface p-[18px] lg:p-[22px]">
                  <p className="text-xs font-semibold tracking-[0.08em] text-accent uppercase">Bald verfügbar</p>
                  <p className="font-serif text-[15.5px] leading-relaxed lg:text-[17px]">
                    Die Frage-Funktion wird gerade angeschlossen. Sobald der Buchtext erfasst ist, bekommst du hier
                    Antworten mit Seiten- und Zeilenangabe.
                  </p>
                </div>
              </>
            ) : (
              <div className="flex flex-wrap gap-2">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => submit(s)}
                    className="h-11 rounded-xl border border-line-strong bg-paper px-3.5 text-sm hover:bg-surface"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-center border-t border-line px-4 py-3 lg:border-0 lg:px-8 lg:pt-0 lg:pb-7">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              submit(question);
            }}
            className="flex w-full items-center gap-2.5 lg:w-[620px]"
          >
            <label className="flex-1">
              <span className="sr-only">Frage zum Buch</span>
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                maxLength={500}
                placeholder="Frag etwas zum Buch …"
                className="h-[46px] w-full rounded-xl border border-line-strong bg-surface px-4 text-[15px] placeholder:text-faint lg:h-[52px] lg:rounded-[14px] lg:text-base"
              />
            </label>
            <button
              type="button"
              aria-label="Frage sprechen"
              className="flex size-[46px] shrink-0 items-center justify-center rounded-xl bg-accent text-accent-ink lg:size-[52px] lg:rounded-[14px]"
            >
              <MicIcon size={20} />
            </button>
          </form>
        </div>
      </div>

      {/* Desktop source panel: the cited passage opens here next to the answer. */}
      <aside
        aria-label="Quelle im Buch"
        className="hidden w-[440px] shrink-0 flex-col gap-5 border-l border-line bg-surface px-7 py-6 lg:flex"
      >
        <div className="flex flex-col gap-0.5">
          <p className="text-xs font-semibold tracking-[0.08em] text-accent uppercase">Quelle</p>
          <p className="font-display text-xl font-bold">Originalstelle</p>
        </div>
        <p className="rounded-2xl border border-dashed border-line-strong p-4 text-sm text-muted">
          Tippe in einer Antwort auf einen Beleg wie „S. 12, Z. 4“. Die Stelle öffnet sich hier, die belegten Zeilen
          hervorgehoben.
        </p>
      </aside>
    </div>
  );
}
