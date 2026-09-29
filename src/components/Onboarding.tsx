"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import type { PlanInput } from "@/data/content";
import { averageMinutes, buildPlan } from "@/lib/plan";
import { getProfile, ONBOARDING_EVENT, planOptions, saveProfile, type Profile } from "@/lib/profile";
import { markTaskVisited, restartPlan } from "@/lib/progress";
import { BackIcon } from "./Icons";
import { PROFILE_EVENT } from "./PlanView";

/**
 * First-run onboarding, modelled on learning apps like Duolingo: a promise, three quick questions,
 * a personal plan, and straight into the first real task. No tour of buttons.
 */

type Answers = { exam?: Profile["exam"]; minutes?: Profile["minutes"]; read?: Profile["read"] };

type Question<K extends keyof Answers> = {
  key: K;
  title: string;
  hint: string;
  options: { value: NonNullable<Answers[K]>; label: string; detail?: string }[];
};

const QUESTIONS = [
  {
    key: "exam",
    title: "Wann ist deine Prüfung?",
    hint: "Danach richtet sich, wie viele Tage dein Plan hat.",
    options: [
      { value: "1w", label: "In einer Woche", detail: "Kompakter Plan, 7 Tage" },
      { value: "2w", label: "In zwei Wochen", detail: "14 Tage" },
      { value: "3w", label: "In drei Wochen oder später", detail: "21 Tage, ganz entspannt" },
      { value: "unknown", label: "Weiss ich noch nicht", detail: "Wir planen mit 21 Tagen" },
    ],
  } satisfies Question<"exam">,
  {
    key: "minutes",
    title: "Wie viel Zeit hast du pro Tag?",
    hint: "Lieber jeden Tag ein bisschen als einmal viel.",
    options: [
      { value: 10, label: "10 Minuten", detail: "Kurz und regelmässig" },
      { value: 20, label: "20 Minuten", detail: "Empfohlen" },
      { value: 30, label: "30 Minuten", detail: "Gründlich" },
    ],
  } satisfies Question<"minutes">,
  {
    key: "read",
    title: "Hast du das Buch schon gelesen?",
    hint: "Wer es kennt, startet mit Fragen statt mit Lesen.",
    options: [
      { value: "no", label: "Noch nicht", detail: "Kein Problem, genau dafür ist Narra da" },
      { value: "partly", label: "Teilweise" },
      { value: "yes", label: "Ja, ganz", detail: "Dann frischen wir es gezielt auf" },
    ],
  } satisfies Question<"read">,
] as const;

export function Onboarding({ input }: { input: PlanInput }) {
  const router = useRouter();
  const pathname = usePathname();
  // Rendered on the server too, so it can appear on the very first frame; see the gate in globals.css.
  const [open, setOpen] = useState(true);
  const [step, setStep] = useState(0); // 0 welcome, 1-3 questions, 4 summary
  const [answers, setAnswers] = useState<Answers>({});
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // First visit: no profile yet. "Plan anpassen" reopens it from anywhere.
    const reopen = () => {
      const p = getProfile();
      setAnswers(p ? { exam: p.exam, minutes: p.minutes, read: p.read } : {});
      setStep(1);
      setOpen(true);
      document.documentElement.dataset.onboarding = "1";
    };
    const root = document.documentElement;
    const reopenGate = () => (root.dataset.onboarding = "1");
    if (!getProfile() && pathname === "/") {
      reopenGate();
    } else if (!root.dataset.onboarding) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setOpen(false);
    }
    window.addEventListener(ONBOARDING_EVENT, reopen);
    return () => window.removeEventListener(ONBOARDING_EVENT, reopen);
  }, [pathname]);

  useEffect(() => {
    if (open) panelRef.current?.focus();
  }, [open, step]);

  const profile: Profile = {
    exam: answers.exam ?? "unknown",
    minutes: answers.minutes ?? 20,
    read: answers.read ?? "no",
    createdAt: new Date().toISOString(),
  };
  const plan = useMemo(
    () => buildPlan(input.firstPage, input.lastPage, input.passages, planOptions(profile)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [input, answers.exam, answers.read],
  );

  if (!open) return null;

  function finish(goToFirstTask: boolean) {
    saveProfile(profile);
    restartPlan();
    window.dispatchEvent(new Event(PROFILE_EVENT));
    delete document.documentElement.dataset.onboarding;
    setOpen(false);
    const first = plan[0].tasks.find((t) => !t.optional);
    if (goToFirstTask && first) {
      markTaskVisited(first.href);
      router.push(first.href);
    } else {
      router.refresh();
    }
  }

  function choose<K extends keyof Answers>(key: K, value: Answers[K]) {
    setAnswers((a) => ({ ...a, [key]: value }));
    // A short pause so the choice is visible before the next question slides in.
    setTimeout(() => setStep((s) => s + 1), 220);
  }

  const q = step >= 1 && step <= 3 ? QUESTIONS[step - 1] : null;
  const avg = averageMinutes(plan);
  const firstTask = plan[0].tasks.find((t) => !t.optional);

  return (
    <div className="onboarding-gate fixed inset-0 z-50 flex-col overflow-y-auto bg-paper" role="dialog" aria-modal="true" aria-labelledby="ob-title">
      <div className="flex min-h-full flex-1">
      {/* Desktop: the book page stays on the left as a calm anchor through every step. */}
      <aside aria-hidden="true" className="hidden w-1/2 flex-col justify-between bg-surface p-12 lg:flex">
        <p className="font-display text-3xl">Narra</p>
        <WelcomeArt large />
        <p className="max-w-sm text-sm text-muted">Jede Aussage mit Seite und Zeile aus der Fischer-Ausgabe belegt.</p>
      </aside>
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-6 pt-5 pb-8 lg:justify-center lg:py-12">
        {/* Top bar: back and progress through the three questions */}
        <div className="flex h-11 items-center gap-3">
          {step >= 1 && step <= 4 ? (
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              aria-label="Zurück"
              className="flex size-11 items-center justify-center rounded-xl text-muted hover:bg-surface-2"
            >
              <BackIcon />
            </button>
          ) : (
            <span className="size-11" />
          )}
          {step >= 1 && (
            <div className="flex flex-1 gap-1.5" aria-label={`Frage ${Math.min(step, 3)} von 3`}>
              {[1, 2, 3].map((i) => (
                <span key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${i <= step ? "bg-accent" : "bg-line-strong"}`} />
              ))}
            </div>
          )}
        </div>

        <div ref={panelRef} key={step} tabIndex={-1} className="anim-in flex flex-1 flex-col justify-center gap-8 py-8 outline-none lg:flex-none">
          {step === 0 && (
            <>
              <div className="lg:hidden">
                <WelcomeArt />
              </div>
              <div className="flex flex-col gap-3">
                <h1 id="ob-title" className="font-display text-4xl leading-tight">
                  Bereit für die Prüfung zu «Mario und der Zauberer».
                </h1>
                <p className="text-[17px] leading-relaxed text-muted">
                  Auch ohne das ganze Buch zu lesen. Narra zeigt dir, was du wissen musst und wo es steht, mit Seite und Zeile.
                </p>
              </div>
            </>
          )}

          {q && (
            <>
              <div className="flex flex-col gap-2">
                <h1 id="ob-title" className="font-display text-3xl leading-tight">
                  {q.title}
                </h1>
                <p className="text-[15px] text-muted">{q.hint}</p>
              </div>
              <div className="flex flex-col gap-2.5" role="radiogroup" aria-labelledby="ob-title">
                {q.options.map((o) => {
                  const selected = answers[q.key] === o.value;
                  return (
                    <button
                      key={String(o.value)}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() => choose(q.key, o.value as never)}
                      className={`flex min-h-16 flex-col justify-center rounded-2xl border-2 px-5 py-3 text-left transition-colors ${
                        selected ? "border-accent bg-accent-soft" : "border-line-strong hover:border-accent"
                      }`}
                    >
                      <span className="text-[17px] font-semibold">{o.label}</span>
                      {o.detail && <span className="text-sm text-muted">{o.detail}</span>}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {step === 4 && (
            <>
              <div className="flex flex-col gap-2">
                <p className="text-sm font-semibold tracking-[0.08em] text-accent uppercase">Fertig</p>
                <h1 id="ob-title" className="font-display text-4xl leading-tight">
                  Dein Plan steht.
                </h1>
              </div>
              <ul className="flex flex-col gap-3 text-[17px]">
                <li className="flex gap-3">
                  <span className="font-display text-2xl text-accent tabular-nums">{plan.length}</span>
                  <span className="pt-1">Tage bis zur Prüfung, jeden Tag ein kleines Stück</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-display text-2xl text-accent tabular-nums">{avg}</span>
                  <span className="pt-1">
                    Minuten pro Tag im Schnitt
                    {avg > profile.minutes + 5 ? `, an manchen Tagen mehr als deine ${profile.minutes}` : ""}
                  </span>
                </li>
                {firstTask && (
                  <li className="flex gap-3">
                    <span className="font-display text-2xl text-accent">1</span>
                    <span className="pt-1">Heute zuerst: {firstTask.label}</span>
                  </li>
                )}
              </ul>
              <p className="text-sm text-muted">Kein Konto nötig. Dein Fortschritt bleibt nur in diesem Browser.</p>
            </>
          )}
        </div>

        {/* Bottom actions */}
        {step === 0 && (
          <div className="flex flex-col gap-2">
            <button type="button" onClick={() => setStep(1)} className="h-14 rounded-2xl bg-accent text-[17px] font-semibold text-accent-ink">
              Meinen Plan erstellen
            </button>
            <button type="button" onClick={() => finish(false)} className="h-12 rounded-2xl text-[15px] text-muted hover:text-ink">
              Erst umschauen
            </button>
          </div>
        )}
        {step === 4 && (
          <div className="flex flex-col gap-2">
            <button type="button" onClick={() => finish(true)} className="h-14 rounded-2xl bg-accent text-[17px] font-semibold text-accent-ink">
              Los geht’s
            </button>
            <button type="button" onClick={() => finish(false)} className="h-12 rounded-2xl text-[15px] text-muted hover:text-ink">
              Zur Startseite
            </button>
          </div>
        )}
      </div>
      </div>
    </div>
  );
}

/** The real first lines of the book: they appear, line 4 lights up, its citation pops out. */
const OPENING = [
  "Die Erinnerung an Torre di Venere ist atmo-",
  "sphärisch unangenehm. Ärger, Gereizt-",
  "heit, Überspannung lagen von Anfang an in der",
  "Luft, und zum Schluß kam dann der Chok mit",
  "diesem schrecklichen Cipolla, in dessen Person",
];

function WelcomeArt({ large = false }: { large?: boolean }) {
  return (
    <div aria-hidden="true" className={large ? "flex justify-center" : "flex justify-center rounded-3xl bg-surface px-4 pt-6 pb-8"}>
      {/* The chip is anchored to the page card itself, so it sits on its corner at every size. */}
      <div className={`relative w-full ${large ? "max-w-[520px]" : "max-w-[330px]"}`}>
        <div className={`flex flex-col gap-1.5 rounded-xl border border-line-strong bg-paper shadow-sm ${large ? "px-8 py-7" : "px-4 py-4"}`}>
          <p className="mb-1 text-[10px] font-semibold tracking-[0.08em] text-faint uppercase">Seite 9</p>
          {OPENING.map((text, i) => (
            <p key={i} className="anim-in flex items-baseline gap-2.5" style={{ animationDelay: `${120 + i * 110}ms` }}>
              <span className="w-3 shrink-0 text-right text-[10px] text-faint tabular-nums">{i + 1}</span>
              <span className={`rounded px-1 font-serif whitespace-nowrap ${large ? "text-[19px] leading-9" : "text-[12.5px] leading-6"} ${i === 3 ? "anim-hit-soft" : ""}`}>
                {text}
              </span>
            </p>
          ))}
        </div>
        <span
          className={`anim-chip absolute rounded-lg bg-accent font-semibold text-accent-ink shadow-md ${
            large ? "-right-4 -bottom-4 px-3.5 py-1.5 text-base" : "-right-2 -bottom-3 px-2.5 py-1 text-xs"
          }`}
        >
          S. 9, Z. 4
        </span>
      </div>
    </div>
  );
}

/** Link-style button that reopens onboarding to change the plan. */
export function AdjustPlanButton({ className = "" }: { className?: string }) {
  return (
    <button type="button" onClick={() => window.dispatchEvent(new Event(ONBOARDING_EVENT))} className={className}>
      Plan anpassen
    </button>
  );
}
