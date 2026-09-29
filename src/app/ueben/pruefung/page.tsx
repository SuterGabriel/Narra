import Link from "next/link";
import { ExamRunner } from "@/components/ExamRunner";
import { quiz } from "@/data/content";

export const metadata = { title: "Probeprüfung · Narra" };

export default function ExamPage() {
  const pool = quiz.filter((q) => q.type === "mc");
  return (
    <div className="flex w-full flex-col gap-6 px-6 pt-8 pb-6 lg:mx-auto lg:max-w-2xl lg:px-10 lg:pt-12">
      <header className="flex flex-col gap-1">
        <p className="text-xs font-semibold tracking-[0.08em] text-accent uppercase">
          <Link href="/ueben">Üben</Link> · Prüfung
        </p>
        <h1 className="font-display text-3xl font-bold tracking-tight">Probeprüfung</h1>
      </header>
      <ExamRunner pool={pool} />
    </div>
  );
}
