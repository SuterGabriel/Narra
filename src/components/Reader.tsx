"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { setLastRead } from "@/lib/profile";
import type { BookPage } from "@/lib/citations";
import type { Pronunciation } from "@/data/types";
import { BackIcon, MicIcon, PlayIcon, SearchIcon } from "./Icons";
import { PronunciationCard } from "./PronunciationCard";
import { Hint } from "./Hint";
import { ReaderLine, termIndex } from "./ReaderLine";

export type LineRange = { page: number; from: number; to: number };
export type NavLink = { href: string; label: string };

type Props = {
  /** Small label above the title, e.g. "Schlüsselpassage 3" or "Buch". */
  kicker: string;
  title: string;
  subtitle?: string;
  backHref: string;
  pages: BookPage[];
  highlight?: LineRange[];
  pronunciations: Pronunciation[];
  prev?: NavLink;
  next?: NavLink;
  /** Passage views show the audiobook bar; plain book pages show page navigation. */
  audioTitle?: string;
  /** Extra desktop side-panel sections, rendered on the server. */
  aside?: ReactNode;
};

const sectionLabel = "text-xs font-semibold tracking-[0.08em] text-muted uppercase";

export function Reader({
  kicker,
  title,
  subtitle,
  backHref,
  pages,
  highlight = [],
  pronunciations,
  prev,
  next,
  audioTitle,
  aside,
}: Props) {
  const [openTerm, setOpenTerm] = useState<string | null>(null);
  const pathname = usePathname();

  // Remember where the reader left off, for "Weiter, wo du warst" on the start page.
  useEffect(() => {
    setLastRead({ href: pathname, title: kicker === "Buch" ? `Seite ${pages[0]?.page}` : title });
  }, [pathname, kicker, title, pages]);
  const selected = pronunciations.find((p) => p.term === openTerm) ?? null;

  // Mark only the first occurrence of each term per page, so frequent names don't clutter the text.
  const termsByLine = useMemo(() => {
    const map = new Map<string, Pronunciation[]>();
    for (const p of pages) {
      const seen = new Set<string>();
      for (const l of p.lines) {
        const found = pronunciations.filter((t) => !seen.has(t.term) && termIndex(l.text, t.term) >= 0);
        found.forEach((t) => seen.add(t.term));
        if (found.length) map.set(`${p.page}:${l.line}`, found);
      }
    }
    return map;
  }, [pages, pronunciations]);

  const isHighlighted = (page: number, line: number) =>
    highlight.some((r) => r.page === page && line >= r.from && line <= r.to);

  const pageLabel =
    pages.length > 1 ? `Seiten ${pages[0].page}–${pages[pages.length - 1].page}` : `Seite ${pages[0]?.page}`;

  return (
    <div className="flex flex-1 lg:h-dvh lg:min-h-0 lg:flex-none lg:overflow-hidden">
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center justify-between px-4 pt-[18px] pb-2 lg:h-[72px] lg:shrink-0 lg:border-b lg:border-line lg:px-8 lg:py-0">
          <Link
            href={backHref}
            aria-label="Zurück"
            className="flex size-11 items-center justify-center rounded-xl bg-surface-2 lg:hidden"
          >
            <BackIcon />
          </Link>
          <div className="flex flex-col items-center gap-0.5 lg:hidden">
            <p className="text-xs font-semibold tracking-[0.08em] text-accent uppercase">{kicker}</p>
            <p className="text-[13px] text-muted">{pageLabel}</p>
          </div>
          <p className="hidden gap-2 text-sm text-muted lg:flex">
            <Link href={backHref} className="hover:text-ink">
              {kicker}
            </Link>
            <span>/</span>
            <span className="font-semibold text-ink">{pageLabel}</span>
          </p>
          <Link
            href="/suche"
            aria-label="Im Buch suchen"
            className="flex size-11 items-center justify-center rounded-xl bg-surface-2 lg:hidden"
          >
            <SearchIcon />
          </Link>
          <form action="/suche" className="hidden lg:block">
            <label className="flex h-11 w-[300px] items-center gap-2 rounded-xl border border-line-strong bg-surface px-3.5 text-faint">
              <SearchIcon size={18} />
              <span className="sr-only">Im Buch suchen</span>
              <input
                type="search"
                name="q"
                placeholder="Im ganzen Buch suchen …"
                className="flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-faint"
              />
            </label>
          </form>
        </div>

        <div className="flex min-h-0 flex-1 justify-center overflow-y-auto px-5 pt-3 lg:px-8 lg:pt-10">
          <article className="flex w-full min-w-0 flex-col gap-[18px] lg:w-[640px] lg:gap-7">
            <header className="flex flex-col gap-1 pl-[38px] lg:gap-1.5 lg:pl-[52px]">
              <h1 className="font-display text-2xl leading-tight font-bold tracking-tight lg:text-[38px]">{title}</h1>
              {subtitle && <p className="text-[13px] text-muted lg:text-[15px]">{subtitle}</p>}
            </header>
            <Hint id="reader-names" className="lg:ml-[52px]">
              Die Zeilennummern entsprechen deinem Buch. Unterstrichene Namen kannst du antippen, um zu sehen, wie man sie ausspricht.
            </Hint>
            <div className="flex flex-col pb-6">
              {pages.map((p, i) => (
                <section key={p.page} aria-label={`Seite ${p.page}`} className="flex flex-col">
                  {(pages.length > 1 || i > 0) && (
                    <p className="mt-4 mb-2 flex items-center gap-3 pl-[38px] text-xs font-semibold text-faint lg:pl-[52px]">
                      S. {p.page}
                      <span className="h-px flex-1 bg-line" />
                    </p>
                  )}
                  {p.lines.map((l) => (
                    <ReaderLine
                      key={l.line}
                      page={p.page}
                      line={l.line}
                      text={l.text}
                      highlighted={isHighlighted(p.page, l.line)}
                      terms={termsByLine.get(`${p.page}:${l.line}`) ?? []}
                      openTerm={openTerm}
                      onTermClick={(t) => setOpenTerm((cur) => (cur === t.term ? null : t.term))}
                    />
                  ))}
                </section>
              ))}
            </div>
          </article>
        </div>

        {audioTitle ? (
          <div className="border-t border-line bg-surface px-5 pt-3.5 pb-3 lg:mx-8 lg:mb-6 lg:rounded-2xl lg:border lg:px-[18px] lg:py-3.5">
            <div className="flex items-center gap-3.5 lg:gap-[18px]">
              <button
                type="button"
                disabled
                aria-label="Abspielen"
                className="flex size-[52px] shrink-0 items-center justify-center rounded-2xl bg-accent text-accent-ink opacity-60"
              >
                <PlayIcon />
              </button>
              <div className="flex flex-1 flex-col gap-2">
                <div className="flex justify-between gap-3 text-[13px] lg:text-sm">
                  <span className="truncate font-semibold">
                    <span className="hidden lg:inline">Hörbuch · </span>
                    {audioTitle}
                  </span>
                  <span className="shrink-0 text-muted">Hörbuch folgt</span>
                </div>
                <div className="h-1 rounded-full bg-line-strong" />
              </div>
              {next && (
                <Link
                  href={next.href}
                  className="hidden h-11 items-center rounded-xl border border-line-strong bg-paper px-4 text-sm font-medium lg:flex"
                >
                  {next.label}
                </Link>
              )}
            </div>
          </div>
        ) : (
          <nav
            aria-label="Blättern"
            className="flex items-center justify-between gap-3 border-t border-line px-4 py-3 lg:mx-8 lg:mb-6 lg:rounded-2xl lg:border"
          >
            {prev ? (
              <Link href={prev.href} className="flex h-11 items-center rounded-xl border border-line-strong px-4 text-sm font-medium">
                ← {prev.label}
              </Link>
            ) : (
              <span />
            )}
            {next && (
              <Link href={next.href} className="flex h-11 items-center rounded-xl border border-line-strong px-4 text-sm font-medium">
                {next.label} →
              </Link>
            )}
          </nav>
        )}
      </div>

      <aside
        aria-label="Begleiter"
        className="hidden w-[380px] shrink-0 flex-col gap-6 overflow-y-auto border-l border-line p-6 lg:flex"
      >
        <section className="flex flex-col gap-3">
          <h2 className={sectionLabel}>Aussprache</h2>
          {selected ? (
            <PronunciationCard term={selected} />
          ) : (
            <p className="rounded-2xl border border-dashed border-line-strong p-4 text-sm text-muted">
              Tippe einen unterstrichenen Namen im Text an, um die Aussprache zu sehen und zu üben.
            </p>
          )}
        </section>

        {aside}

        <section className="mt-auto flex flex-col gap-2.5">
          <h2 className={sectionLabel}>Frag zu dieser Stelle</h2>
          <div className="flex gap-2">
            <Link
              href="/fragen"
              className="flex h-[46px] flex-1 items-center rounded-xl border border-line-strong bg-surface px-3.5 text-sm text-faint"
            >
              Eigene Frage …
            </Link>
            <Link
              href="/fragen"
              aria-label="Frage sprechen"
              className="flex size-[46px] shrink-0 items-center justify-center rounded-xl bg-accent text-accent-ink"
            >
              <MicIcon size={20} />
            </Link>
          </div>
        </section>
      </aside>
    </div>
  );
}
