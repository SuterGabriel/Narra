import Link from "next/link";
import { QuoteDuel } from "@/components/QuoteDuel";
import { quotes } from "@/data/content";

export const metadata = { title: "Zitat-Duell · Narra" };

export default function QuoteDuelPage() {
  return (
    <div className="flex w-full flex-col gap-6 px-6 pt-8 pb-6 lg:mx-auto lg:max-w-2xl lg:px-10 lg:pt-12">
      <header className="flex flex-col gap-1">
        <p className="text-xs font-semibold tracking-[0.08em] text-accent uppercase">
          <Link href="/ueben">Üben</Link> · Spiel
        </p>
        <h1 className="font-display text-3xl font-bold tracking-tight">Zitat-Duell</h1>
        <p className="text-sm text-muted">Zehn Zitate: Wer sagt das, in welcher Szene? Richtige Antworten in Serie geben Bonuspunkte.</p>
      </header>
      <QuoteDuel quotes={quotes} />
    </div>
  );
}
