"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

/**
 * First-visit guided tour: a welcome card, a spotlight that glides between the key parts of the
 * start page, and a clear place to begin. Targets are marked with data-tour="…"; when the same
 * target exists twice (sidebar on desktop, bottom nav on phones) the visible one is used.
 */

const DONE_KEY = "narra:tour-done";
export const TOUR_EVENT = "narra:start-tour";

type Step = { target?: string; title: string; text: string };

const STEPS: Step[] = [
  {
    title: "Willkommen bei Narra",
    text: "Dein Lernbegleiter für «Mario und der Zauberer». Du musst nicht das ganze Buch lesen: Narra zeigt dir, was du wissen musst und wo es steht, jede Aussage mit Seite und Zeile.",
  },
  { target: "plan", title: "Jeden Tag ein Stück", text: "Hier steht, was heute dran ist. In drei Wochen bist du auf Prüfungsniveau, ohne jeden Tag stundenlang zu lesen." },
  { target: "nav-lesen", title: "Lesen", text: "Die 18 Stellen, die in Prüfungen zählen, zusammen etwa 45 Minuten. Und das ganze Buch mit Suche, wenn du mehr willst." },
  { target: "nav-fragen", title: "Fragen", text: "Frag, was du nicht verstehst. Jede Antwort zeigt die Stelle im Buch, damit du sie nachlesen und zitieren kannst." },
  { target: "nav-ueben", title: "Üben", text: "Quiz, Karteikarten, Zitat-Duell und eine Probeprüfung. So siehst du, wo du noch Lücken hast." },
  { target: "daily", title: "Fünf Fragen am Tag", text: "Das Mini-Quiz dauert zwei Minuten. Mach es täglich, dann wächst dein Streak." },
  {
    title: "Bereit?",
    text: "Am besten fängst du mit dem Schnellüberblick an: das ganze Buch in 20 Minuten. Den Rundgang findest du jederzeit wieder auf der Startseite.",
  },
];

function visibleTarget(name: string): HTMLElement | null {
  const all = Array.from(document.querySelectorAll<HTMLElement>(`[data-tour="${name}"]`));
  return all.find((el) => el.getClientRects().length > 0 && getComputedStyle(el).visibility !== "hidden") ?? null;
}

type Rect = { top: number; left: number; width: number; height: number };
const PAD = 8;

export function Tour() {
  const pathname = usePathname();
  const router = useRouter();
  const [step, setStep] = useState<number | null>(null);
  const [rect, setRect] = useState<Rect | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const close = useCallback((markDone = true) => {
    setStep(null);
    setRect(null);
    if (markDone) {
      try {
        localStorage.setItem(DONE_KEY, "1");
      } catch {
        // Storage unavailable: the tour may show again next visit.
      }
    }
  }, []);

  // Auto-start on the first visit to the start page; manual start from anywhere via the event.
  useEffect(() => {
    const start = () => {
      if (pathname !== "/") router.push("/");
      setStep(0);
    };
    window.addEventListener(TOUR_EVENT, start);
    let seen = true;
    try {
      seen = localStorage.getItem(DONE_KEY) === "1";
    } catch {
      // Without storage we cannot remember the tour, so we don't force it on every visit.
    }
    const timer = !seen && pathname === "/" ? setTimeout(() => setStep(0), 600) : undefined;
    return () => {
      window.removeEventListener(TOUR_EVENT, start);
      if (timer) clearTimeout(timer);
    };
  }, [pathname, router]);

  // Measure the spotlight target, and keep measuring while the page scrolls or resizes.
  useLayoutEffect(() => {
    if (step === null) return;
    const target = STEPS[step].target;
    const el = target ? visibleTarget(target) : null;
    // Tall targets scroll to the top so the card at the bottom edge covers as little as possible.
    if (el) el.scrollIntoView({ block: el.offsetHeight > window.innerHeight * 0.5 ? "start" : "center", behavior: "instant" as ScrollBehavior });
    // Steps without a (visible) target show a centred card instead of a spotlight.
    const measure = () => {
      if (!el) return setRect(null);
      const r = el.getBoundingClientRect();
      setRect({ top: r.top - PAD, left: r.left - PAD, width: r.width + PAD * 2, height: r.height + PAD * 2 });
    };
    measure();
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    return () => {
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
    };
  }, [step]);

  // Focus the card for keyboard and screen-reader users; arrows and Escape navigate.
  useEffect(() => {
    if (step === null) return;
    cardRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") setStep((s) => (s !== null && s < STEPS.length - 1 ? s + 1 : s));
      if (e.key === "ArrowLeft") setStep((s) => (s !== null && s > 0 ? s - 1 : s));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [step, close]);

  if (step === null) return null;

  const s = STEPS[step];
  const last = step === STEPS.length - 1;
  const centered = !rect;

  // Place the card below the target, or above it when there is no room (e.g. the bottom nav).
  let cardStyle: React.CSSProperties = {};
  if (rect) {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const width = Math.min(360, vw - 32);
    const CARD_H = 260; // generous estimate of the card's height
    const below = rect.top + rect.height + 12;
    const fitsBelow = below + CARD_H < vh;
    const fitsAbove = rect.top - 12 - CARD_H > 0;
    const left = Math.min(Math.max(16, rect.left + rect.width / 2 - width / 2), vw - width - 16);
    const nextToSidebar = rect.left + rect.width < 300 && vw >= 1024;
    cardStyle = nextToSidebar
      ? { width, left: rect.left + rect.width + 16, top: Math.min(Math.max(16, rect.top), vh - CARD_H) }
      : fitsBelow
        ? { width, left, top: below }
        : fitsAbove
          ? { width, left, bottom: vh - rect.top + 12 }
          : // Tall targets (the study plan on a phone): the card sits at the bottom edge, over the target.
            { width: vw - 32, left: 16, bottom: 16 };
  }

  return (
    <div className="fixed inset-0 z-50" role="presentation">
      {/* Dimmed backdrop; the spotlight cuts a hole with a huge box-shadow and glides between targets. */}
      {rect ? (
        <div
          aria-hidden="true"
          className="tour-spot pointer-events-none fixed rounded-2xl ring-2 ring-accent"
          style={{ top: rect.top, left: rect.left, width: rect.width, height: rect.height, boxShadow: "0 0 0 9999px rgb(10 10 14 / 0.62)" }}
        />
      ) : (
        <div aria-hidden="true" className="tour-fade fixed inset-0 bg-[rgb(10_10_14/0.62)]" />
      )}
      <div className="fixed inset-0" onClick={() => close()} aria-hidden="true" />

      <div
        ref={cardRef}
        key={step}
        role="dialog"
        aria-modal="true"
        aria-labelledby="tour-title"
        aria-describedby="tour-text"
        tabIndex={-1}
        className={`tour-card fixed flex flex-col gap-4 rounded-2xl border border-line bg-paper p-5 shadow-2xl outline-none ${
          centered ? "top-1/2 left-1/2 w-[min(420px,calc(100vw-32px))] -translate-x-1/2 -translate-y-1/2" : ""
        }`}
        style={cardStyle}
      >
        {step === 0 && <WelcomeArt />}
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold tracking-[0.08em] text-accent uppercase">
            {step === 0 ? "Rundgang" : `Schritt ${step} von ${STEPS.length - 2}`}
          </p>
          <h2 id="tour-title" className="font-display text-2xl leading-tight">
            {s.title}
          </h2>
          <p id="tour-text" className="text-[15px] leading-relaxed text-muted">
            {s.text}
          </p>
        </div>

        <div className="flex items-center gap-1.5" aria-hidden="true">
          {STEPS.map((_, i) => (
            <span key={i} className={`h-1.5 rounded-full transition-all ${i === step ? "w-6 bg-accent" : "w-1.5 bg-line-strong"}`} />
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {last ? (
            <>
              <Link href="/ueberblick" onClick={() => close()} className="flex h-11 items-center rounded-xl bg-accent px-4 text-sm font-semibold text-accent-ink">
                Zum Schnellüberblick
              </Link>
              <button type="button" onClick={() => close()} className="h-11 rounded-xl border border-line-strong px-4 text-sm font-medium">
                Selbst umschauen
              </button>
            </>
          ) : (
            <>
              <button type="button" onClick={() => setStep(step + 1)} className="h-11 rounded-xl bg-accent px-4 text-sm font-semibold text-accent-ink">
                {step === 0 ? "Rundgang starten" : "Weiter"}
              </button>
              {step > 0 && (
                <button type="button" onClick={() => setStep(step - 1)} className="h-11 rounded-xl border border-line-strong px-4 text-sm font-medium">
                  Zurück
                </button>
              )}
              <button type="button" onClick={() => close()} className="ml-auto h-11 px-2 text-sm text-muted hover:text-ink">
                Überspringen
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/** A tiny animated book page: lines appear, one lights up, its citation pops out. */
function WelcomeArt() {
  const lines = [92, 84, 96, 70, 88];
  return (
    <div aria-hidden="true" className="relative flex h-36 items-center justify-center overflow-hidden rounded-xl bg-surface">
      <div className="tour-page flex w-56 flex-col gap-2.5 rounded-lg border border-line-strong bg-paper p-4 shadow-sm">
        {lines.map((w, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="w-3 text-right text-[9px] text-faint tabular-nums">{i + 1}</span>
            <span
              className={`tour-line h-2 rounded-full ${i === 3 ? "tour-hit" : "bg-line-strong"}`}
              style={{ width: `${w}%`, animationDelay: `${150 + i * 90}ms` }}
            />
          </div>
        ))}
      </div>
      <span className="tour-chip absolute right-6 bottom-5 rounded-lg bg-accent px-2.5 py-1 text-xs font-semibold text-accent-ink shadow-md">
        S. 9, Z. 4
      </span>
    </div>
  );
}

/** A small link-style button that restarts the tour. */
export function TourButton({ className = "" }: { className?: string }) {
  return (
    <button type="button" onClick={() => window.dispatchEvent(new Event(TOUR_EVENT))} className={className}>
      Rundgang starten
    </button>
  );
}
