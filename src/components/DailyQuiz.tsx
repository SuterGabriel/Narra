"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { QuizItem } from "@/data/types";
import { pickDaily, previousDate, zurichDate } from "@/lib/daily";
import { getStreak, recordDaily, visibleStreak, type Streak } from "@/lib/progress";
import { QuizRunner } from "./QuizRunner";

function useToday() {
  const [today, setToday] = useState<{ date: string; yesterday: string } | null>(null);
  const [streak, setStreak] = useState<Streak | null>(null);
  useEffect(() => {
    // The date and the streak depend on the viewer's clock and storage, so they are read after mount.
    const date = zurichDate();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setToday({ date, yesterday: previousDate(date) });
    setStreak(getStreak());
  }, []);
  return { today, streak, setStreak };
}

/** The daily card on the start page. */
export function DailyCard() {
  const { today, streak } = useToday();
  const current = today && streak ? visibleStreak(streak, today.date, today.yesterday) : 0;
  const doneToday = Boolean(today && streak?.lastDate === today.date);
  const score = today && streak ? streak.scores[today.date] : undefined;

  return (
    <Link
      href="/ueben/taeglich"
      data-tour="daily"
      className="flex items-center gap-4 rounded-2xl border border-line p-4 hover:bg-surface"
    >
      <span
        className={`flex size-14 shrink-0 flex-col items-center justify-center rounded-2xl ${current > 0 ? "bg-accent text-accent-ink" : "bg-surface-2 text-muted"}`}
        aria-hidden="true"
      >
        <span className="font-display text-xl leading-none font-bold tabular-nums">{today ? current : " "}</span>
        <span className="text-[10px] font-semibold">{current === 1 ? "Tag" : "Tage"}</span>
      </span>
      <span className="flex flex-1 flex-col gap-0.5">
        <span className="font-display text-lg font-bold">Mini-Quiz des Tages</span>
        <span className="text-sm text-muted">
          {doneToday
            ? `Heute erledigt: ${score} von 5 richtig. Morgen gibt es neue Fragen.`
            : current > 0
              ? `${current} ${current === 1 ? "Tag" : "Tage"} am Stück. Fünf Fragen, zwei Minuten.`
              : "Fünf Fragen, zwei Minuten. Jeden Tag neu."}
        </span>
      </span>
      <span className="sr-only">{`Streak: ${current} ${current === 1 ? "Tag" : "Tage"}`}</span>
    </Link>
  );
}

/** The daily quiz itself. */
export function DailyQuiz({ pool }: { pool: QuizItem[] }) {
  const { today, streak, setStreak } = useToday();
  if (!today || !streak) return null;

  const items = pickDaily(pool, today.date);
  const current = visibleStreak(streak, today.date, today.yesterday);

  return (
    <div className="flex flex-col gap-5">
      <p className="text-sm text-muted">
        {current > 0 ? `Streak: ${current} ${current === 1 ? "Tag" : "Tage"} · ` : ""}Bester Wert: {streak.best}{" "}
        {streak.best === 1 ? "Tag" : "Tage"}
      </p>
      <QuizRunner
        key={today.date}
        items={items}
        scopeLabel={`Mini-Quiz ${today.date.split("-").reverse().join(".")}`}
        compactResult
        onFinish={(correct) => setStreak(recordDaily(today.date, today.yesterday, correct))}
      />
    </div>
  );
}
