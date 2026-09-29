import Link from "next/link";
import { flashcards, pronunciations, quiz } from "@/data/content";

export const metadata = { title: "Üben · Narra" };

export default function PracticePage() {
  const modes = [
    {
      href: "/ueben/quiz",
      title: "Quiz",
      text: `${quiz.length} Fragen über das ganze Buch, Multiple Choice und offene Fragen, jede mit Beleg.`,
    },
    {
      href: "/ueben/karten",
      title: "Karteikarten",
      text: `${flashcards.length} Karten zu Figuren, Motiven und Zitaten. Auch als Anki-Export.`,
    },
    {
      href: "/ueben/aussprache",
      title: "Aussprache",
      text: `${pronunciations.length} italienische und fremde Namen und Ausdrücke mit Lautschrift.`,
    },
    { href: "/ueben/quiz?nur=fehler", title: "Lücken", text: "Nur die Fragen, die du zuletzt falsch beantwortet hast." },
  ];

  return (
    <div className="flex w-full flex-col gap-6 px-6 pt-8 pb-6 lg:mx-auto lg:max-w-3xl lg:px-10 lg:pt-12">
      <header className="flex flex-col gap-1">
        <h1 className="font-display text-3xl font-bold tracking-tight">Üben</h1>
        <p className="text-sm text-muted">Finde heraus, wo du noch Lücken hast.</p>
      </header>
      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:gap-4">
        {modes.map((m) => (
          <li key={m.href}>
            <Link href={m.href} className="flex h-full flex-col gap-2 rounded-2xl border border-line bg-surface p-5 hover:border-accent">
              <h2 className="font-display text-xl font-bold">{m.title}</h2>
              <p className="text-sm leading-snug text-muted">{m.text}</p>
            </Link>
          </li>
        ))}
      </ul>
      <p className="text-sm text-muted">
        Zitat-Duell und tägliches Mini-Quiz mit Bestenliste folgen in Woche 2.
      </p>
    </div>
  );
}
