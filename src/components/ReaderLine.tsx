"use client";

import type { Pronunciation } from "@/data/types";
import { PronunciationCard } from "./PronunciationCard";

type Props = {
  page: number;
  line: number;
  text: string;
  highlighted?: boolean;
  /** Terms whose first occurrence on this page is in this line. */
  terms: Pronunciation[];
  openTerm: string | null;
  onTermClick: (term: Pronunciation) => void;
};

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Index of `term` in `text` as a whole word (not inside a longer word), or -1. */
export function termIndex(text: string, term: string): number {
  const m = new RegExp(`(?<!\\p{L})${escape(term)}(?!\\p{L})`, "u").exec(text);
  return m ? m.index : -1;
}

function splitByTerms(text: string, terms: Pronunciation[]) {
  const parts: (string | Pronunciation)[] = [];
  let rest = text;
  while (rest) {
    let best: { idx: number; term: Pronunciation } | null = null;
    for (const t of terms) {
      const idx = termIndex(rest, t.term);
      if (idx >= 0 && (!best || idx < best.idx || (idx === best.idx && t.term.length > best.term.term.length))) {
        best = { idx, term: t };
      }
    }
    if (!best) {
      parts.push(rest);
      break;
    }
    if (best.idx > 0) parts.push(rest.slice(0, best.idx));
    parts.push(best.term);
    rest = rest.slice(best.idx + best.term.term.length);
  }
  return parts;
}

export function ReaderLine({ page, line, text, highlighted = false, terms, openTerm, onTermClick }: Props) {
  const parts = terms.length ? splitByTerms(text, terms) : [text];
  const open = terms.find((t) => t.term === openTerm);

  return (
    <>
      <div
        id={`s${page}z${line}`}
        className={`-mx-2 flex h-[30px] scroll-mt-24 items-baseline gap-3 rounded-md px-2 lg:-mx-3 lg:h-9 lg:gap-5 lg:rounded-lg lg:px-3 ${
          highlighted ? "bg-accent-soft" : ""
        }`}
      >
        <span
          className={`w-[26px] shrink-0 text-right text-[11px] tabular-nums lg:w-8 lg:text-xs ${
            highlighted ? "font-semibold text-accent" : "text-faint"
          }`}
        >
          {line}
        </span>
        {/* Book lines never wrap: citations depend on them. On phones the type scales to fit the widest line. */}
        <span className="font-serif text-[min(15.5px,calc((100vw_-_80px)/24.5))] leading-[30px] whitespace-nowrap lg:text-[19px] lg:leading-9">
          {parts.map((part, i) =>
            typeof part === "string" ? (
              part
            ) : (
              <button
                key={i}
                type="button"
                onClick={() => onTermClick(part)}
                aria-expanded={openTerm === part.term}
                aria-label={`Aussprache: ${part.term}`}
                className={`rounded-sm text-name underline decoration-dotted underline-offset-4 ${
                  openTerm === part.term ? "bg-accent-soft" : ""
                }`}
              >
                {part.term}
              </button>
            ),
          )}
        </span>
      </div>

      {open && (
        // On desktop the card lives in the side panel instead.
        <div className="my-1 ml-[38px] lg:hidden">
          <PronunciationCard term={open} compact />
        </div>
      )}
    </>
  );
}
