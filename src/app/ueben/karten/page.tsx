import Link from "next/link";
import { CardDeck } from "@/components/CardDeck";
import { flashcards } from "@/data/content";

export const metadata = { title: "Karteikarten · Narra" };

export default async function CardsPage(props: PageProps<"/ueben/karten">) {
  const { thema } = await props.searchParams;
  const topics = [...new Set(flashcards.map((c) => c.topic))];
  const topic = typeof thema === "string" && topics.includes(thema) ? thema : undefined;
  const cards = topic ? flashcards.filter((c) => c.topic === topic) : flashcards;

  return (
    <div className="flex w-full flex-col gap-6 px-6 pt-8 pb-6 lg:mx-auto lg:max-w-2xl lg:px-10 lg:pt-12">
      <header className="flex flex-col gap-3">
        <p className="text-xs font-semibold tracking-[0.08em] text-accent uppercase">
          <Link href="/ueben">Üben</Link> · Karteikarten
        </p>
        <h1 className="font-display text-3xl font-bold tracking-tight">{topic ?? "Alle Karten"}</h1>
        <nav aria-label="Themen" className="flex flex-wrap gap-2">
          <Link
            href="/ueben/karten"
            aria-current={!topic ? "page" : undefined}
            className={`flex h-11 items-center rounded-xl border px-3.5 text-sm ${!topic ? "border-accent bg-accent-soft font-semibold" : "border-line-strong"}`}
          >
            Alle
          </Link>
          {topics.map((t) => (
            <Link
              key={t}
              href={`/ueben/karten?thema=${encodeURIComponent(t)}`}
              aria-current={t === topic ? "page" : undefined}
              className={`flex h-11 items-center rounded-xl border px-3.5 text-sm ${t === topic ? "border-accent bg-accent-soft font-semibold" : "border-line-strong"}`}
            >
              {t}
            </Link>
          ))}
        </nav>
      </header>

      <CardDeck key={topic ?? "all"} cards={cards} />

      <a
        href="/karteikarten.csv"
        download="narra-mario-karteikarten.csv"
        className="flex min-h-14 items-center justify-between rounded-xl border border-line-strong px-4 text-[15px]"
      >
        Alle Karten für Anki herunterladen (CSV)
        <span className="text-xs text-muted">Anki: Datei › Importieren</span>
      </a>
    </div>
  );
}
