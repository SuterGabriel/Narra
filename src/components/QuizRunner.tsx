"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { QuizItem } from "@/data/types";
import { getWrongQuestions, recordAnswer } from "@/lib/progress";
import { Cite } from "./Cite";

type Props = {
  items: QuizItem[];
  /** Only questions answered wrong before (read from this browser's progress). */
  onlyMistakes?: boolean;
  scopeLabel: string;
};

type Result = { id: string; correct: boolean };

const difficultyLabel = { 1: "Wissen", 2: "Verstehen", 3: "Deuten" } as const;

export function QuizRunner({ items, onlyMistakes = false, scopeLabel }: Props) {
  const [mistakeIds, setMistakeIds] = useState<string[] | null>(null);
  useEffect(() => {
    // Progress lives in localStorage, which only exists after mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (onlyMistakes) setMistakeIds(getWrongQuestions());
  }, [onlyMistakes]);

  const questions = useMemo(
    () => (onlyMistakes ? items.filter((q) => mistakeIds?.includes(q.id)) : items),
    [items, onlyMistakes, mistakeIds],
  );

  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [results, setResults] = useState<Result[]>([]);

  if (onlyMistakes && mistakeIds === null) return null;

  if (questions.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-line-strong p-5 text-sm text-muted">
        {onlyMistakes ? "Keine falsch beantworteten Fragen gespeichert. Stark!" : "Für diesen Abschnitt gibt es keine Fragen."}
      </p>
    );
  }

  const done = index >= questions.length;
  const score = results.filter((r) => r.correct).length;

  if (done) {
    const wrong = results.filter((r) => !r.correct).map((r) => questions.find((q) => q.id === r.id)!);
    return (
      <section className="flex flex-col gap-5" aria-live="polite">
        <div className="flex flex-col gap-2 rounded-2xl border border-line bg-surface p-5">
          <p className="text-xs font-semibold tracking-[0.08em] text-accent uppercase">Ergebnis · {scopeLabel}</p>
          <p className="font-display text-3xl font-bold">
            {score} von {results.length} richtig
          </p>
          <p className="text-sm text-muted">Falsche Antworten sind gespeichert und lassen sich gezielt wiederholen.</p>
        </div>
        {wrong.length > 0 && (
          <div className="flex flex-col gap-3">
            <h2 className="text-xs font-semibold tracking-[0.08em] text-muted uppercase">Nochmal anschauen</h2>
            <ul className="flex flex-col gap-2">
              {wrong.map((q) => (
                <li key={q.id} className="flex flex-col gap-2 rounded-xl border border-line p-4">
                  <p className="text-[15px] font-medium">{q.question}</p>
                  <p className="font-serif text-[15px] text-muted">{q.answer}</p>
                  <div>
                    <Cite c={q.citation} />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => {
              setIndex(0);
              setResults([]);
              setPicked(null);
              setRevealed(false);
            }}
            className="h-11 rounded-xl bg-accent px-4 text-sm font-semibold text-accent-ink"
          >
            Nochmal von vorn
          </button>
          <Link href="/ueben/quiz?nur=fehler" className="flex h-11 items-center rounded-xl border border-line-strong px-4 text-sm font-medium">
            Nur Fehler wiederholen
          </Link>
        </div>
      </section>
    );
  }

  const q = questions[index];
  const answered = q.type === "mc" ? picked !== null : revealed;

  function finish(correct: boolean) {
    recordAnswer(q.id, correct);
    setResults((r) => [...r, { id: q.id, correct }]);
  }

  function next() {
    setIndex((i) => i + 1);
    setPicked(null);
    setRevealed(false);
  }

  const lastResult = results.find((r) => r.id === q.id);

  return (
    <section className="flex flex-col gap-5">
      <div className="flex items-center justify-between text-sm text-muted">
        <span>
          Frage {index + 1} von {questions.length}
        </span>
        <span>
          {score} richtig
        </span>
      </div>
      <div className="h-1 rounded-full bg-line-strong" aria-hidden="true">
        <div className="h-1 rounded-full bg-accent" style={{ width: `${(index / questions.length) * 100}%` }} />
      </div>

      <div className="flex flex-col gap-4 rounded-2xl border border-line bg-surface p-5">
        <p className="text-xs font-semibold tracking-[0.08em] text-accent uppercase">
          {q.topic} · {difficultyLabel[q.difficulty] ?? "Frage"}
        </p>
        <h2 className="font-serif text-lg leading-snug">{q.question}</h2>

        {q.type === "mc" && q.options && (
          <div className="flex flex-col gap-2" role="group" aria-label="Antwortmöglichkeiten">
            {q.options.map((opt, i) => {
              const isAnswer = i === q.answerIndex;
              const isPicked = i === picked;
              const state =
                picked === null
                  ? "border-line-strong bg-paper hover:border-accent"
                  : isAnswer
                    ? "border-accent bg-accent-soft font-semibold"
                    : isPicked
                      ? "border-name bg-paper text-name line-through"
                      : "border-line bg-paper text-muted";
              return (
                <button
                  key={i}
                  type="button"
                  disabled={picked !== null}
                  onClick={() => {
                    setPicked(i);
                    finish(i === q.answerIndex);
                  }}
                  className={`min-h-12 rounded-xl border px-4 py-3 text-left text-[15px] ${state}`}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        )}

        {q.type === "open" && !revealed && (
          <div className="flex flex-col gap-2">
            <label className="flex flex-col gap-1.5 text-sm text-muted">
              Deine Antwort (nur für dich, wird nicht gespeichert)
              <textarea rows={3} className="rounded-xl border border-line-strong bg-paper p-3 text-[15px] text-ink" />
            </label>
            <button
              type="button"
              onClick={() => setRevealed(true)}
              className="h-11 self-start rounded-xl bg-accent px-4 text-sm font-semibold text-accent-ink"
            >
              Musterantwort zeigen
            </button>
          </div>
        )}

        {answered && (
          <div className="flex flex-col gap-3 border-t border-line pt-4" aria-live="polite">
            {q.type === "mc" && (
              <p className={`text-sm font-semibold ${picked === q.answerIndex ? "text-accent" : "text-name"}`}>
                {picked === q.answerIndex ? "Richtig." : "Nicht ganz."}
              </p>
            )}
            {q.type === "open" && <p className="font-serif text-[15.5px] leading-relaxed">{q.answer}</p>}
            <p className="text-[15px] leading-relaxed text-muted">{q.explanation}</p>
            <div>
              <Cite c={q.citation} />
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {q.type === "open" && revealed && !lastResult && (
          <>
            <button type="button" onClick={() => finish(true)} className="h-11 rounded-xl bg-accent px-4 text-sm font-semibold text-accent-ink">
              Gewusst
            </button>
            <button type="button" onClick={() => finish(false)} className="h-11 rounded-xl border border-line-strong px-4 text-sm font-medium">
              Nicht gewusst
            </button>
          </>
        )}
        {lastResult && (
          <button type="button" onClick={next} className="h-11 rounded-xl bg-accent px-5 text-sm font-semibold text-accent-ink">
            {index + 1 < questions.length ? "Nächste Frage" : "Ergebnis anzeigen"}
          </button>
        )}
      </div>
    </section>
  );
}
