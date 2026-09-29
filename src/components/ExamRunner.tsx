"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { QuizItem } from "@/data/types";
import { shuffle } from "@/lib/daily";
import { getExams, recordAnswer, recordExam, type ExamResult } from "@/lib/progress";
import { Cite } from "./Cite";

const QUESTIONS = 20;
const MINUTES = 25;

type Phase = "intro" | "running" | "done";

function fmt(sec: number) {
  const s = Math.max(0, sec);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

/** Mock exam: multiple-choice questions over the whole book, a timer, no feedback until the end. */
export function ExamRunner({ pool }: { pool: QuizItem[] }) {
  const [phase, setPhase] = useState<Phase>("intro");
  const [seed, setSeed] = useState("");
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [index, setIndex] = useState(0);
  const [startedAt, setStartedAt] = useState(0);
  const [now, setNow] = useState(0);
  const [history, setHistory] = useState<ExamResult[]>([]);

  useEffect(() => {
    // Past results live in localStorage, which only exists after mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHistory(getExams());
  }, []);

  // A balanced draw: questions spread over the book, shuffled per attempt.
  const questions = useMemo(() => {
    if (!seed) return [];
    const sorted = [...pool].sort((a, b) => a.citation.page - b.citation.page);
    const step = sorted.length / QUESTIONS;
    const picked = Array.from({ length: QUESTIONS }, (_, i) => {
      const bucket = sorted.slice(Math.floor(i * step), Math.floor((i + 1) * step));
      return shuffle(bucket, `${seed}-${i}`)[0];
    }).filter(Boolean);
    return shuffle(picked, seed);
  }, [pool, seed]);

  const elapsed = Math.floor((now - startedAt) / 1000);
  const remaining = MINUTES * 60 - elapsed;

  function finish() {
    const seconds = Math.floor((Date.now() - startedAt) / 1000);
    let correct = 0;
    for (const q of questions) {
      const ok = answers[q.id] === q.answerIndex;
      if (ok) correct++;
      recordAnswer(q.id, ok);
    }
    const result = { date: new Date().toISOString(), correct, total: questions.length, seconds };
    recordExam(result);
    setHistory(getExams());
    setPhase("done");
  }

  useEffect(() => {
    if (phase !== "running") return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [phase]);

  useEffect(() => {
    // Time is up: hand in automatically.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (phase === "running" && remaining <= 0) finish();
  });

  if (phase === "intro") {
    const best = history.reduce((m, r) => Math.max(m, Math.round((r.correct / r.total) * 100)), 0);
    return (
      <section className="flex flex-col gap-5">
        <div className="flex flex-col gap-3 rounded-2xl border border-line bg-surface p-5">
          <p className="font-serif text-lg leading-snug">
            {QUESTIONS} Fragen über das ganze Buch, {MINUTES} Minuten. Die Auflösung gibt es erst am Ende, wie in der echten Prüfung.
          </p>
          {history.length > 0 && (
            <p className="text-sm text-muted">
              Bisher {history.length} {history.length === 1 ? "Versuch" : "Versuche"}, bestes Ergebnis {best} %.
            </p>
          )}
          <button
            type="button"
            onClick={() => {
              setSeed(String(Date.now()));
              setAnswers({});
              setIndex(0);
              setStartedAt(Date.now());
              setNow(Date.now());
              setPhase("running");
            }}
            className="h-12 self-start rounded-xl bg-accent px-5 text-[15px] font-semibold text-accent-ink"
          >
            Prüfung starten
          </button>
        </div>
      </section>
    );
  }

  if (phase === "done") {
    const correct = questions.filter((q) => answers[q.id] === q.answerIndex).length;
    const byTopic = new Map<string, { ok: number; total: number }>();
    for (const q of questions) {
      const t = byTopic.get(q.topic) ?? { ok: 0, total: 0 };
      t.total++;
      if (answers[q.id] === q.answerIndex) t.ok++;
      byTopic.set(q.topic, t);
    }
    const wrong = questions.filter((q) => answers[q.id] !== q.answerIndex);
    const pct = Math.round((correct / questions.length) * 100);

    return (
      <section className="flex flex-col gap-6" aria-live="polite">
        <div className="flex flex-col gap-2 rounded-2xl border border-line bg-surface p-5">
          <p className="text-xs font-semibold tracking-[0.08em] text-accent uppercase">Ergebnis</p>
          <p className="font-display text-3xl font-bold">
            {correct} von {questions.length} richtig ({pct} %)
          </p>
          <p className="text-sm text-muted">Zeit: {fmt(Math.min(elapsed, MINUTES * 60))} Minuten</p>
        </div>

        <div className="flex flex-col gap-3">
          <h2 className="text-xs font-semibold tracking-[0.08em] text-muted uppercase">Nach Themen</h2>
          <ul className="flex flex-col gap-2">
            {[...byTopic.entries()]
              .sort((a, b) => a[1].ok / a[1].total - b[1].ok / b[1].total)
              .map(([topic, t]) => (
                <li key={topic} className="flex items-center gap-3">
                  <span className="w-28 shrink-0 text-sm">{topic}</span>
                  <span className="h-2 flex-1 rounded-full bg-line-strong" aria-hidden="true">
                    <span className="block h-2 rounded-full bg-accent" style={{ width: `${(t.ok / t.total) * 100}%` }} />
                  </span>
                  <span className="w-12 text-right text-sm text-muted tabular-nums">
                    {t.ok}/{t.total}
                  </span>
                </li>
              ))}
          </ul>
        </div>

        {wrong.length > 0 && (
          <div className="flex flex-col gap-3">
            <h2 className="text-xs font-semibold tracking-[0.08em] text-muted uppercase">Das solltest du nochmals anschauen</h2>
            <ul className="flex flex-col gap-2">
              {wrong.map((q) => (
                <li key={q.id} className="flex flex-col gap-2 rounded-xl border border-line p-4">
                  <p className="text-[15px] font-medium">{q.question}</p>
                  <p className="text-sm">
                    <span className="text-muted">Richtig: </span>
                    {q.options?.[q.answerIndex ?? 0]}
                  </p>
                  <p className="text-sm text-muted">{q.explanation}</p>
                  <div>
                    <Cite c={q.citation} />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => setPhase("intro")} className="h-11 rounded-xl bg-accent px-4 text-sm font-semibold text-accent-ink">
            Neue Prüfung
          </button>
          <Link href="/ueben/quiz?nur=fehler" className="flex h-11 items-center rounded-xl border border-line-strong px-4 text-sm font-medium">
            Fehler gezielt üben
          </Link>
        </div>
      </section>
    );
  }

  const q = questions[index];
  const answeredCount = Object.keys(answers).length;

  return (
    <section className="flex flex-col gap-5">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted">
          Frage {index + 1} von {questions.length} · {answeredCount} beantwortet
        </span>
        <span className={`font-semibold tabular-nums ${remaining < 120 ? "text-name" : "text-ink"}`} role="timer" aria-label="Verbleibende Zeit">
          {fmt(remaining)}
        </span>
      </div>

      <div className="flex flex-col gap-4 rounded-2xl border border-line bg-surface p-5">
        <p className="text-xs font-semibold tracking-[0.08em] text-accent uppercase">{q.topic}</p>
        <h2 className="font-serif text-lg leading-snug">{q.question}</h2>
        <div className="flex flex-col gap-2" role="radiogroup" aria-label="Antwortmöglichkeiten">
          {q.options?.map((opt, i) => (
            <button
              key={i}
              type="button"
              role="radio"
              aria-checked={answers[q.id] === i}
              onClick={() => setAnswers((a) => ({ ...a, [q.id]: i }))}
              className={`min-h-12 rounded-xl border px-4 py-3 text-left text-[15px] ${
                answers[q.id] === i ? "border-accent bg-accent-soft font-semibold" : "border-line-strong bg-paper hover:border-accent"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={index === 0}
          onClick={() => setIndex((i) => i - 1)}
          className="h-11 rounded-xl border border-line-strong px-4 text-sm font-medium disabled:opacity-40"
        >
          Zurück
        </button>
        {index + 1 < questions.length ? (
          <button type="button" onClick={() => setIndex((i) => i + 1)} className="h-11 rounded-xl bg-accent px-5 text-sm font-semibold text-accent-ink">
            Weiter
          </button>
        ) : (
          <button type="button" onClick={finish} className="h-11 rounded-xl bg-accent px-5 text-sm font-semibold text-accent-ink">
            Abgeben
          </button>
        )}
        {answeredCount === questions.length && index + 1 < questions.length && (
          <button type="button" onClick={finish} className="h-11 rounded-xl border border-accent px-4 text-sm font-semibold text-accent-soft-ink">
            Jetzt abgeben
          </button>
        )}
      </div>
    </section>
  );
}
