import Link from "next/link";
import { ArrowUpRightIcon } from "@/components/Icons";
import { bookMeta } from "@/data/book";
import { passages } from "@/data/content";

export const metadata = { title: "Schlüsselpassagen · Narra" };

const pagesOf = (p: (typeof passages)[number]) => p.end.page - p.start.page + 1;

export default function PassagesPage() {
  const totalPages = passages.reduce((n, p) => n + pagesOf(p), 0);
  const minutes = Math.round(totalPages * 1.5 + passages.length);

  return (
    <div className="flex w-full flex-col gap-6 px-6 pt-8 pb-6 lg:mx-auto lg:max-w-3xl lg:px-10 lg:pt-12">
      <header className="flex flex-col gap-1">
        <h1 className="font-display text-3xl font-bold tracking-tight">Schlüsselpassagen</h1>
        <p className="text-sm text-muted">
          Die {passages.length} Stellen, die in Prüfungen und Aufsätzen zählen. Zusammen etwa {minutes} Minuten Lesezeit.
        </p>
      </header>

      <ol className="flex flex-col gap-3">
        {passages.map((p) => (
          <li key={p.id}>
            <Link href={`/lesen/${p.slug}`} className="flex gap-4 rounded-2xl border border-line p-4 hover:bg-surface">
              <span className="font-display text-2xl font-bold text-accent tabular-nums">{p.id}</span>
              <span className="flex flex-1 flex-col gap-1.5">
                <span className="flex flex-wrap items-baseline justify-between gap-x-3">
                  <span className="font-display text-lg font-bold">{p.title}</span>
                  <span className="text-xs text-muted">
                    S. {p.start.page}
                    {p.end.page !== p.start.page ? `–${p.end.page}` : ""}
                  </span>
                </span>
                <span className="text-sm leading-snug text-muted">{p.summary}</span>
                <span className="flex flex-wrap gap-1.5 pt-1">
                  {p.themes.map((t) => (
                    <span key={t} className="rounded-lg bg-accent-soft px-2 py-1 text-xs font-semibold text-accent-soft-ink">
                      {t}
                    </span>
                  ))}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ol>

      <Link
        href={`/buch/${bookMeta.firstPage}`}
        className="flex min-h-14 items-center justify-between rounded-xl border border-line-strong px-4 text-[15px]"
      >
        Ganzes Buch lesen (S. {bookMeta.firstPage}–{bookMeta.lastPage})
        <ArrowUpRightIcon size={16} className="text-faint" />
      </Link>
    </div>
  );
}
