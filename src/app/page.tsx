import Link from "next/link";
import { DailyCard } from "@/components/DailyQuiz";
import { CompassIcon } from "@/components/Icons";
import { NextStep } from "@/components/PlanView";
import { ThemeToggle } from "@/components/ThemeToggle";
import { TourButton } from "@/components/Tour";
import { plan } from "@/data/content";

/**
 * Start page: one next step, the daily quiz, and the overview for newcomers. Everything else
 * lives in the navigation (Überblick, Lesen, Üben, Fragen).
 */
export default function StartPage() {
  return (
    <div className="flex w-full flex-col gap-5 px-6 pt-8 pb-6 lg:mx-auto lg:max-w-3xl lg:px-10 lg:pt-12">
      <header className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="font-display text-3xl tracking-tight">Mario und der Zauberer</h1>
          <p className="text-sm text-muted">Das Wichtige aus dem Buch, jede Aussage mit Seite und Zeile belegt.</p>
        </div>
        <div className="lg:hidden">
          <ThemeToggle />
        </div>
      </header>

      <NextStep plan={plan} />

      <div className="grid gap-3 sm:grid-cols-2">
        <DailyCard />
        <Link href="/ueberblick" className="flex items-center gap-4 rounded-2xl border border-line p-4 hover:bg-surface">
          <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-surface-2 text-accent" aria-hidden="true">
            <CompassIcon size={26} />
          </span>
          <span className="flex flex-col gap-0.5">
            <span className="font-display text-lg">Das Buch in 20 Minuten</span>
            <span className="text-sm text-muted">Handlung, Figuren und Motive auf einen Blick.</span>
          </span>
        </Link>
      </div>

      <TourButton className="self-start text-sm text-muted underline-offset-2 hover:text-ink hover:underline" />
    </div>
  );
}
