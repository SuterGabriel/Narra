import Link from "next/link";
import { SearchIcon } from "@/components/Icons";
import { book } from "@/data/book";
import { citationHref, searchBook } from "@/lib/citations";

export const metadata = { title: "Suche · Narra" };

const LIMIT = 100;

export default async function SearchPage(props: PageProps<"/suche">) {
  const { q } = await props.searchParams;
  const query = typeof q === "string" ? q.slice(0, 80) : "";
  const hits = query ? searchBook(book, query, LIMIT) : [];

  return (
    <div className="flex w-full flex-col gap-6 px-6 pt-8 pb-6 lg:mx-auto lg:max-w-3xl lg:px-10 lg:pt-12">
      <header className="flex flex-col gap-1">
        <h1 className="font-display text-3xl font-bold tracking-tight">Suche</h1>
        <p className="text-sm text-muted">Im ganzen Novellentext, auch über Zeilenumbrüche hinweg.</p>
      </header>

      <form action="/suche" role="search" className="flex gap-2">
        <label className="flex h-12 flex-1 items-center gap-2 rounded-xl border border-line-strong bg-surface px-3.5 text-faint">
          <SearchIcon size={18} />
          <span className="sr-only">Suchbegriff</span>
          <input
            type="search"
            name="q"
            defaultValue={query}
            placeholder="z. B. Peitsche, Silvestra, Freiheit"
            autoFocus
            className="flex-1 bg-transparent text-[15px] text-ink outline-none placeholder:text-faint"
          />
        </label>
        <button type="submit" className="h-12 rounded-xl bg-accent px-5 text-sm font-semibold text-accent-ink">
          Suchen
        </button>
      </form>

      {query && (
        <section aria-live="polite" className="flex flex-col gap-3">
          <p className="text-sm text-muted">
            {hits.length === 0
              ? `Keine Treffer für „${query}“.`
              : `${hits.length}${hits.length === LIMIT ? "+" : ""} Treffer für „${query}“`}
          </p>
          <ul className="flex flex-col divide-y divide-line rounded-2xl border border-line">
            {hits.map((h) => (
              <li key={`${h.page}-${h.line}`}>
                <Link
                  href={citationHref({ page: h.page, line: h.line })}
                  className="flex items-baseline gap-4 px-4 py-3 hover:bg-surface"
                >
                  <span className="w-24 shrink-0 text-xs font-semibold text-accent">
                    S. {h.page}, Z. {h.line}
                  </span>
                  <span className="font-serif text-[15px]">{h.text}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
