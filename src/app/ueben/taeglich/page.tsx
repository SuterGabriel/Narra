import Link from "next/link";
import { DailyQuiz } from "@/components/DailyQuiz";
import { quiz } from "@/data/content";

export const metadata = { title: "Mini-Quiz des Tages · Narra" };

export default function DailyPage() {
  // Multiple-choice only: the daily quiz should take two minutes.
  const pool = quiz.filter((q) => q.type === "mc");
  return (
    <div className="flex w-full flex-col gap-6 px-6 pt-8 pb-6 lg:mx-auto lg:max-w-2xl lg:px-10 lg:pt-12">
      <header className="flex flex-col gap-1">
        <p className="text-xs font-semibold tracking-[0.08em] text-accent uppercase">
          <Link href="/ueben">Üben</Link> · Täglich
        </p>
        <h1 className="font-display text-3xl font-bold tracking-tight">Mini-Quiz des Tages</h1>
        <p className="text-sm text-muted">Fünf Fragen, für alle gleich, jeden Tag neu. Mach es täglich, damit dein Streak wächst.</p>
      </header>
      <DailyQuiz pool={pool} />
    </div>
  );
}
