"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { PlanInput } from "@/data/content";
import { buildPlan, type PlanDay } from "@/lib/plan";
import { getProfile, planOptions, saveProfile, type Profile } from "@/lib/profile";
import { currentPlanDay, getDoneDays, getVisitedTasks, markTaskVisited, restartPlan, setDayDone } from "@/lib/progress";
import { ArrowUpRightIcon, CheckIcon } from "./Icons";

function useProgress() {
  const [today, setToday] = useState<number | null>(null);
  const [done, setDone] = useState<number[]>([]);
  const [visited, setVisited] = useState<string[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  useEffect(() => {
    // Plan start, progress and the chosen length live in localStorage, which only exists after mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setToday(currentPlanDay());
    setDone(getDoneDays());
    setVisited(getVisitedTasks());
    setProfile(getProfile());
  }, []);
  return {
    today,
    done,
    visited,
    profile,
    toggle(day: number, value: boolean) {
      setDayDone(day, value);
      setDone(getDoneDays());
    },
    visit(href: string) {
      markTaskVisited(href);
      setVisited(getVisitedTasks());
    },
    /** Choosing a new length starts the plan again from today. */
    choose(exam: Profile["exam"]) {
      saveProfile({ exam });
      restartPlan();
      setProfile({ exam });
      setToday(currentPlanDay());
      setDone([]);
      setVisited([]);
    },
  };
}

function DayTasks({ day, visited, onVisit }: { day: PlanDay; visited: string[]; onVisit: (href: string) => void }) {
  return (
    <ul className="flex flex-col gap-2">
      {day.tasks.map((t) => {
        const seen = visited.includes(t.href);
        return (
          <li key={t.href + t.label}>
            <Link
              href={t.href}
              onClick={() => onVisit(t.href)}
              className={`flex min-h-12 items-center gap-3 rounded-xl border px-4 py-2 text-[15px] ${
                t.optional ? "border-dashed border-line-strong text-muted" : "border-line-strong bg-paper"
              }`}
            >
              {seen ? <CheckIcon size={18} className="shrink-0 text-accent" aria-label="begonnen" /> : null}
              <span className={`flex-1 ${seen ? "text-muted" : ""}`}>
                {t.label}
                {t.optional && <span className="ml-1 text-xs">(freiwillig)</span>}
              </span>
              {t.minutes && <span className="text-xs text-muted tabular-nums">{t.minutes} Min.</span>}
              <ArrowUpRightIcon size={16} className="text-faint" />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

const LENGTHS: { exam: Profile["exam"]; label: string }[] = [
  { exam: "1w", label: "1 Woche" },
  { exam: "2w", label: "2 Wochen" },
  { exam: "3w", label: "3 Wochen" },
];

/** The study plan: pick how long until the exam, then one day after another. */
export function PlanList({ input }: { input: PlanInput }) {
  const { today, done, visited, profile, toggle, visit, choose } = useProgress();
  const plan = useMemo(
    () => buildPlan(input.firstPage, input.lastPage, input.passages, planOptions(profile)),
    [input, profile],
  );
  const current = profile?.exam ?? "3w";
  const todayNo = today === null ? null : Math.min(today, plan.length);

  return (
    <div className="flex flex-col gap-5">
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-sm font-semibold">Deine Prüfung ist in</legend>
        <div className="grid grid-cols-3 gap-2" role="radiogroup">
          {LENGTHS.map((l) => (
            <button
              key={l.exam}
              type="button"
              role="radio"
              aria-checked={current === l.exam}
              onClick={() => current !== l.exam && choose(l.exam)}
              className={`h-11 rounded-xl border text-sm font-medium ${
                current === l.exam ? "border-accent bg-accent-soft font-semibold text-accent-soft-ink" : "border-line-strong"
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
      </fieldset>

      <ol className="flex flex-col gap-3">
        {plan.map((d) => {
          const isToday = d.day === todayNo;
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
              {isToday && <DayTasks day={d} visited={visited} onVisit={visit} />}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
