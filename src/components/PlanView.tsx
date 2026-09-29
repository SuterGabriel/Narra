"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { PlanInput } from "@/data/content";
import { buildPlan, type PlanDay, type PlanTask } from "@/lib/plan";
import { getProfile, ONBOARDING_EVENT, planOptions, type Profile } from "@/lib/profile";
import {
  currentPlanDay,
  getDoneDays,
  getVisitedTasks,
  markTaskVisited,
  setDayDone,
} from "@/lib/progress";
import { ArrowUpRightIcon, CheckIcon } from "./Icons";

export const PROFILE_EVENT = "narra:profile-changed";

/** The personal plan: built from the onboarding answers, rebuilt when they change. */
export function usePlan(input: PlanInput) {
  const [profile, setProfile] = useState<Profile | null>(null);
  useEffect(() => {
    // The profile lives in localStorage, which only exists after mount.
    const load = () => setProfile(getProfile());
    load();
    window.addEventListener(PROFILE_EVENT, load);
    return () => window.removeEventListener(PROFILE_EVENT, load);
  }, []);
  const plan = useMemo(
    () => buildPlan(input.firstPage, input.lastPage, input.passages, planOptions(profile)),
    [input, profile],
  );
  return { plan, profile };
}

function useProgress() {
  const [today, setToday] = useState<number | null>(null);
  const [done, setDone] = useState<number[]>([]);
  const [visited, setVisited] = useState<string[]>([]);
  useEffect(() => {
    // Plan start and progress live in localStorage, which only exists after mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setToday(currentPlanDay());
    setDone(getDoneDays());
    setVisited(getVisitedTasks());
  }, []);
  const toggle = (day: number, value: boolean) => {
    setDayDone(day, value);
    setDone(getDoneDays());
  };
  const visit = (href: string) => {
    markTaskVisited(href);
    setVisited(getVisitedTasks());
  };
  return { today, done, visited, toggle, visit };
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

const verb = (t: PlanTask) => (t.href.startsWith("/ueben") ? "Üben" : t.href.startsWith("/ueberblick") ? "Lesen" : "Lesen");

/**
 * The start page's one clear call to action: the next unfinished task of today's plan,
 * with what comes after it in one line.
 */
export function NextStep({ input }: { input: PlanInput }) {
  const { plan } = usePlan(input);
  const { today, done, visited, toggle, visit } = useProgress();
  const day = plan.find((d) => d.day === Math.min(today ?? 1, plan.length)) ?? plan[0];
  const required = day.tasks.filter((t) => !t.optional);
  const next = required.find((t) => !visited.includes(t.href));
  const after = required.filter((t) => t !== next && !visited.includes(t.href));
  const started = required.length - required.filter((t) => !visited.includes(t.href)).length;
  const isDone = done.includes(day.day);
  const tomorrow = plan.find((d) => d.day === day.day + 1);

  return (
    <section aria-labelledby="next-title" data-tour="plan" className="flex flex-col gap-4 rounded-2xl bg-accent-soft p-5 lg:p-6">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-xs font-semibold tracking-[0.08em] text-accent-soft-ink uppercase">
          Tag {today ?? "–"} von {plan.length}
          {day.pages ? ` · S. ${day.pages.from}–${day.pages.to}` : ""}
        </p>
        <Link href="/lernplan" className="text-sm font-medium text-accent-soft-ink underline-offset-2 hover:underline">
          Ganzer Plan
        </Link>
      </div>

      {next ? (
        <>
          <div className="flex flex-col gap-1">
            <p className="text-sm text-muted">{started === 0 ? "Heute zuerst" : "Als Nächstes"}</p>
            <h2 id="next-title" className="font-display text-2xl leading-tight lg:text-3xl">
              {next.label}
            </h2>
            {next.minutes && (
              <p className="text-sm text-muted">
                {verb(next)} · etwa {next.minutes} Minuten
              </p>
            )}
          </div>
          <Link
            href={next.href}
            onClick={() => visit(next.href)}
            className="flex h-12 items-center justify-center rounded-xl bg-accent px-5 text-[15px] font-semibold text-accent-ink sm:self-start"
          >
            {started === 0 ? "Los geht’s" : "Weiter"}
          </Link>
          {after.length > 0 && (
            <p className="text-sm text-muted">Danach: {after.map((t) => t.label.replace(/^Schlüsselpassage \d+: /, "")).join(" · ")}</p>
          )}
        </>
      ) : (
        <div className="flex flex-col gap-3">
          <h2 id="next-title" className="font-display text-2xl leading-tight">
            {isDone ? "Heute geschafft" : "Alles für heute begonnen"}
          </h2>
          <p className="text-[15px] text-muted">
            {tomorrow ? `Morgen: ${tomorrow.title}.` : "Das war der letzte Tag des Plans."}
            {day.tasks.find((t) => t.optional) ? " Wer mag, liest die Seiten von heute ganz." : ""}
          </p>
          <label className="flex min-h-11 items-center gap-3 text-[15px]">
            <input
              type="checkbox"
              checked={isDone}
              onChange={(e) => toggle(day.day, e.target.checked)}
              className="size-5 accent-[var(--accent)]"
            />
            Tag {day.day} abhaken
          </label>
        </div>
      )}
    </section>
  );
}

/** The full 21-day list. */
export function PlanList({ input }: { input: PlanInput }) {
  const { plan } = usePlan(input);
  const { today, done, visited, toggle, visit } = useProgress();

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
              {isToday && <DayTasks day={d} visited={visited} onVisit={visit} />}
            </li>
          );
        })}
      </ol>
      <button
        type="button"
        onClick={() => window.dispatchEvent(new Event(ONBOARDING_EVENT))}
        className="h-11 self-start rounded-xl border border-line-strong px-4 text-sm"
      >
        Plan anpassen
      </button>
    </div>
  );
}
