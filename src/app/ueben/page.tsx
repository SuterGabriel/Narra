import Link from "next/link";
import { flashcards, pronunciations, quiz, quotes } from "@/data/content";

export const metadata = { title: "Üben · Narra" };

type Mode = { href: string; title: string; text: string };

export default function PracticePage() {
  const groups: { title: string; hint: string; modes: Mode[] }[] = [
    {
      title: "Täglich",
      hint: "Zwei Minuten, jeden Tag.",
      modes: [{ href: "/ueben/taeglich", title: "Mini-Quiz des Tages", text: "Fünf Fragen, jeden Tag neu. Baue deinen Streak auf." }],
    },
    {
      title: "Üben",
      hint: "In deinem Tempo, so oft du willst.",
      modes: [
        { href: "/ueben/quiz", title: "Quiz", text: `${quiz.length} Fragen, jede mit Beleg im Buch.` },
        { href: "/ueben/karten", title: "Karteikarten", text: `${flashcards.length} Karten zu Figuren, Motiven und Zitaten.` },
        { href: "/ueben/zitate", title: "Zitat-Duell", text: `Wer sagt das? Welche Szene? ${quotes.length} Zitate.` },
        { href: "/ueben/aussprache", title: "Aussprache", text: `${pronunciations.length} italienische und fremde Namen.` },
      ],
    },
    {
      title: "Prüfen",
      hint: "Wie gut sitzt es wirklich?",
      modes: [
        { href: "/ueben/pruefung", title: "Probeprüfung", text: "20 Fragen, 25 Minuten, Auswertung nach Themen." },
        { href: "/ueben/quiz?nur=fehler", title: "Lücken schliessen", text: "Nur die Fragen, die du zuletzt falsch hattest." },
      ],
    },
  ];

  return (
    <div className="flex w-full flex-col gap-8 px-6 pt-8 pb-6 lg:mx-auto lg:max-w-3xl lg:px-10 lg:pt-12">
      <header className="flex flex-col gap-1">
        <h1 className="font-display text-3xl tracking-tight">Üben</h1>
        <p className="text-sm text-muted">Finde heraus, wo du noch Lücken hast.</p>
      </header>
      {groups.map((g) => (
        <section key={g.title} aria-labelledby={`g-${g.title}`} className="flex flex-col gap-3">
          <div className="flex items-baseline justify-between gap-3">
            <h2 id={`g-${g.title}`} className="text-xs font-semibold tracking-[0.08em] text-accent uppercase">
              {g.title}
            </h2>
            <p className="text-xs text-muted">{g.hint}</p>
          </div>
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {g.modes.map((m) => (
              <li key={m.href}>
                <Link href={m.href} className="flex h-full flex-col gap-1.5 rounded-2xl border border-line bg-surface p-5 hover:border-accent">
                  <span className="font-display text-xl">{m.title}</span>
                  <span className="text-sm leading-snug text-muted">{m.text}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
