"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { PlanDay } from "@/lib/plan";
import { currentPlanDay, getDoneDays, restartPlan, setDayDone } from "@/lib/progress";
import { ArrowUpRightIcon } from "./Icons";

function useProgress() {
  const [today, setToday] = useState<number | null>(null);
  const [done, setDone] = useState<number[]>([]);
  useEffect(() => {
    // Plan start and progress live in localStorage, which only exists after mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setToday(currentPlanDay());
    setDone(getDoneDays());
  }, []);
  const toggle = (day: number, value: boolean) => {
    setDayDone(day, value);
    setDone(getDoneDays());
  };
  const restart = () => {
    restartPlan();
    setToday(currentPlanDay());
    setDone([]);
  };
  return { today, done, toggle, restart };
}

function DayTasks({ day }: { day: PlanDay }) {
  return (
    <ul className="flex flex-col gap-2">
      {day.tasks.map((t) => (
        <li key={t.href + t.label}>
          <Link
            href={t.href}
            className={`flex min-h-12 items-center gap-3 rounded-xl border px-4 py-2 text-[15px] ${
              t.optional ? "border-dashed border-line-strong text-muted" : "border-line-strong bg-paper"
            }`}
          >
            <span className="flex-1">
              {t.label}
              {t.optional && <span className="ml-1 text-xs">(optional)</span>}
            </span>
            {t.minutes && <span className="text-xs text-muted tabular-nums">{t.minutes} Min.</span>}
            <ArrowUpRightIcon size={16} className="text-faint" />
          </Link>
        </li>
      ))}
    </ul>
  );
}

/** Today's card on the start page. */
export function TodayPlan({ plan }: { plan: PlanDay[] }) {
  const { today, done, toggle } = useProgress();
  const day = plan.find((d) => d.day === (today ?? 1)) ?? plan[0];
  const isDone = done.includes(day.day);
  const progress = Math.round((done.length / plan.length) * 100);

  return (
    <section aria-labelledby="today" className="flex flex-col gap-4 rounded-2xl border border-line bg-surface p-5">
      <div className="flex items-baseline justify-between gap-3">
        <p id="today" className="text-xs font-semibold tracking-[0.08em] text-accent uppercase">
          Heute · Tag {today ?? "–"} von {plan.length}
        </p>
        <Link href="/lernplan" className="text-sm font-medium text-accent-soft-ink hover:underline">
          Ganzer Plan
        </Link>
      </div>
      <p className="font-serif text-lg leading-snug">
        {day.kind === "read" && day.pages ? `S. ${day.pages.from}–${day.pages.to}: ${day.title}` : day.title}
      </p>
      <div className="h-1 rounded-full bg-line-strong" aria-label={`${progress} % des Plans erledigt`}>
        <div className="h-1 rounded-full bg-accent" style={{ width: `${progress}%` }} />
      </div>
      <DayTasks day={day} />
      <label className="flex min-h-11 items-center gap-3 text-[15px]">
        <input
          type="checkbox"
          checked={isDone}
          onChange={(e) => toggle(day.day, e.target.checked)}
          className="size-5 accent-[var(--accent)]"
        />
        Tag {day.day} erledigt
      </label>
    </section>
  );
}

/** The full 21-day list. */
export function PlanList({ plan }: { plan: PlanDay[] }) {
  const { today, done, toggle, restart } = useProgress();

  return (
    <div className="flex flex-col gap-4">
      <ol className="flex flex-col gap-3">
        {plan.map((d) => {
          const isToday = d.day === today;
          const isDone = done.includes(d.day);
          return (
            <li
              key={d.day}
              aria-current={isToday ? "date" : undefined}
              className={`flex flex-col gap-3 rounded-2xl border p-4 ${isToday ? "border-accent bg-accent-soft/40" : "border-line"}`}
            >
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={isDone}
                  onChange={(e) => toggle(d.day, e.target.checked)}
                  aria-label={`Tag ${d.day} erledigt`}
                  className="size-5 shrink-0 accent-[var(--accent)]"
                />
                <p className="flex-1">
                  <span className="mr-2 text-xs font-semibold text-accent uppercase">
                    Tag {d.day}
                    {isToday ? " · heute" : ""}
                  </span>
                  <span className={`font-medium ${isDone ? "text-muted line-through" : ""}`}>
                    {d.pages ? `S. ${d.pages.from}–${d.pages.to} · ` : ""}
                    {d.title}
                  </span>
                </p>
              </div>
              {isToday && <DayTasks day={d} />}
            </li>
          );
        })}
      </ol>
      <button type="button" onClick={restart} className="h-11 self-start rounded-xl border border-line-strong px-4 text-sm">
        Plan ab heute neu starten
      </button>
    </div>
  );
}
