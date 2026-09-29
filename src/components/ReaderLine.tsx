"use client";

import type { Line, Pronunciation } from "@/data/sample";
import { PronunciationCard } from "./PronunciationCard";

type Props = {
  line: Line;
  active?: boolean;
  term?: Pronunciation;
  termOpen: boolean;
  onTermClick: (term: Pronunciation) => void;
};

export function ReaderLine({ line, active = false, term, termOpen, onTermClick }: Props) {
  let content: React.ReactNode = line.text;
  if (term) {
    const [before, after] = line.text.split(term.term);
    content = (
      <>
        {before}
        <button
          type="button"
          onClick={() => onTermClick(term)}
          aria-expanded={termOpen}
          className={`rounded-sm px-0.5 text-name underline decoration-dotted underline-offset-4 ${
            termOpen ? "bg-accent-soft" : ""
          }`}
        >
          {term.term}
        </button>
        {after}
      </>
    );
  }

  return (
    <>
      <div
        className={`-mx-2 flex h-[30px] items-baseline gap-3 rounded-md px-2 lg:-mx-3 lg:h-9 lg:gap-5 lg:rounded-lg lg:px-3 ${
          active ? "bg-accent-soft" : ""
        }`}
      >
        <span
          className={`w-[26px] shrink-0 text-right text-[11px] tabular-nums lg:w-8 lg:text-xs ${
            active ? "font-semibold text-accent" : "text-faint"
          }`}
        >
          {line.line}
        </span>
        {/* Book lines never wrap: citations depend on them. On phones the type scales to fit the widest line. */}
        <span className="font-serif text-[min(15.5px,calc((100vw_-_80px)/24.5))] leading-[30px] whitespace-nowrap lg:text-[19px] lg:leading-9">
          {content}
        </span>
      </div>

      {term && termOpen && (
        // On desktop the card lives in the side panel instead.
        <div className="my-1 ml-[38px] lg:hidden">
          <PronunciationCard term={term} compact />
        </div>
      )}
    </>
  );
}
