"use client";

import Link from "next/link";
import { useState } from "react";
import type { Line, Pronunciation } from "@/data/sample";
import { BackIcon, MicIcon, PlayIcon, SearchIcon } from "./Icons";
import { PronunciationCard } from "./PronunciationCard";
import { ReaderLine } from "./ReaderLine";

type Props = {
  passageTitle: string;
  lines: Line[];
  pronunciations: Pronunciation[];
};

const sectionLabel = "text-xs font-semibold tracking-[0.08em] text-muted uppercase";

export function Reader({ passageTitle, lines, pronunciations }: Props) {
  const [selected, setSelected] = useState<Pronunciation | null>(null);
  const page = lines[0]?.page;

  function toggleTerm(term: Pronunciation) {
    setSelected((cur) => (cur?.term === term.term ? null : term));
  }

  return (
    <div className="flex flex-1 lg:h-dvh">
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar: back + title on mobile, breadcrumb + search on desktop */}
        <div className="flex items-center justify-between px-4 pt-[18px] pb-2 lg:h-[72px] lg:shrink-0 lg:border-b lg:border-line lg:px-8 lg:py-0">
          <Link
            href="/"
            aria-label="Zurück"
            className="flex size-11 items-center justify-center rounded-xl bg-surface-2 lg:hidden"
          >
            <BackIcon />
          </Link>
          <div className="flex flex-col items-center gap-0.5 lg:hidden">
            <p className="text-xs font-semibold tracking-[0.08em] text-accent uppercase">Schlüsselpassage 1</p>
            <p className="text-[13px] text-muted">Seite {page}</p>
          </div>
          <p className="hidden gap-2 text-sm text-muted lg:flex">
            <span>Lesen</span>
            <span>/</span>
            <span className="font-semibold text-ink">
              Schlüsselpassage 1 · Seite {page}
            </span>
          </p>
          <button
            type="button"
            aria-label="Im Text suchen"
            className="flex size-11 items-center justify-center rounded-xl bg-surface-2 lg:hidden"
          >
            <SearchIcon />
          </button>
          <label className="hidden h-11 w-[300px] items-center gap-2 rounded-xl border border-line-strong bg-surface px-3.5 text-faint lg:flex">
            <SearchIcon size={18} />
            <span className="sr-only">Im Buch suchen</span>
            <input
              type="text"
              placeholder="Im ganzen Buch suchen …"
              className="flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-faint"
            />
          </label>
        </div>

        <div className="flex flex-1 justify-center overflow-y-auto px-5 pt-3 lg:px-8 lg:pt-10">
          <article className="flex w-full min-w-0 flex-col gap-[18px] lg:w-[640px] lg:gap-7">
            <header className="flex flex-col gap-1 pl-[38px] lg:gap-1.5 lg:pl-[52px]">
              <p className="hidden text-xs font-semibold tracking-[0.08em] text-accent uppercase lg:block">
                Schlüsselpassage 1 · {passageTitle}
              </p>
              <h1 className="font-display text-2xl leading-tight font-bold tracking-tight lg:text-[38px]">
                Mario und der Zauberer
              </h1>
              <p className="text-[13px] text-muted lg:text-[15px]">Ein tragisches Reiseerlebnis</p>
            </header>
            <div className="flex flex-col overflow-x-auto pb-6">
              {lines.map((line) => {
                const term = pronunciations.find((p) => line.text.includes(p.term));
                return (
                  <ReaderLine
                    key={`${line.page}-${line.line}`}
                    line={line}
                    term={term}
                    termOpen={!!term && selected?.term === term.term}
                    onTermClick={toggleTerm}
                  />
                );
              })}
            </div>
          </article>
        </div>

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
              <div className="flex justify-between text-[13px] lg:text-sm">
                <span className="font-semibold">
                  <span className="hidden lg:inline">Hörbuch · </span>
                  {passageTitle}
                </span>
                <span className="text-muted">Hörbuch folgt</span>
              </div>
              <div className="h-1 rounded-full bg-line-strong" />
            </div>
            <button
              type="button"
              className="hidden h-11 rounded-xl border border-line-strong bg-paper px-4 text-sm font-medium lg:block"
            >
              Nächste Passage
            </button>
          </div>
        </div>
      </div>

      {/* Desktop companion panel */}
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
              Tippe einen unterstrichenen Namen im Text an, um die Aussprache zu hören und nachzusprechen.
            </p>
          )}
        </section>

        <section className="flex flex-col gap-3">
          <h2 className={sectionLabel}>Warum ist diese Stelle wichtig?</h2>
          <p className="font-serif text-[15.5px] leading-relaxed">
            Der erste Satz nimmt das Ende vorweg. Der Erzähler weiss schon, wie es ausgeht, und erzählt rückblickend.
            Achte darauf, wie früh Cipolla genannt wird.
          </p>
          <div className="flex flex-wrap gap-2">
            {["Erzählperspektive", "Vorausdeutung"].map((t) => (
              <span
                key={t}
                className="flex h-[30px] items-center rounded-lg bg-accent-soft px-2.5 text-[13px] font-semibold text-accent-soft-ink"
              >
                {t}
              </span>
            ))}
          </div>
        </section>

        <section className="mt-auto flex flex-col gap-2.5">
          <h2 className={sectionLabel}>Frag zu dieser Stelle</h2>
          <Link
            href="/fragen"
            className="min-h-11 rounded-xl border border-line-strong px-3.5 py-2.5 text-sm hover:bg-surface"
          >
            Was meint der Erzähler mit „atmosphärisch unangenehm“?
          </Link>
          <div className="flex gap-2">
            <label className="flex-1">
              <span className="sr-only">Frage zu dieser Stelle</span>
              <input
                type="text"
                placeholder="Eigene Frage …"
                className="h-[46px] w-full rounded-xl border border-line-strong bg-surface px-3.5 text-sm placeholder:text-faint"
              />
            </label>
            <button
              type="button"
              aria-label="Frage sprechen"
              className="flex size-[46px] shrink-0 items-center justify-center rounded-xl bg-accent text-accent-ink"
            >
              <MicIcon size={20} />
            </button>
          </div>
        </section>
      </aside>
    </div>
  );
}
