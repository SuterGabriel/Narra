"use client";

import { useEffect, useMemo, useState } from "react";
import type { Flashcard } from "@/data/types";
import { getKnownCards, setCardKnown } from "@/lib/progress";
import { Cite } from "./Cite";

export function CardDeck({ cards }: { cards: Flashcard[] }) {
  const [known, setKnown] = useState<string[]>([]);
  const [onlyOpen, setOnlyOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    // Progress lives in localStorage, which only exists after mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setKnown(getKnownCards());
  }, []);

  const deck = useMemo(() => (onlyOpen ? cards.filter((c) => !known.includes(c.id)) : cards), [cards, known, onlyOpen]);
  const card = deck[Math.min(index, deck.length - 1)];

  function mark(isKnown: boolean) {
    if (!card) return;
    setCardKnown(card.id, isKnown);
    setKnown((k) => (isKnown ? [...new Set([...k, card.id])] : k.filter((id) => id !== card.id)));
    setFlipped(false);
    // When filtering to open cards, a known card drops out of the deck and the next one moves up.
    if (!(onlyOpen && isKnown)) setIndex((i) => (i + 1) % Math.max(1, deck.length));
  }

  const knownCount = cards.filter((c) => known.includes(c.id)).length;

  return (
    <section className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted">
        <span>
          {knownCount} von {cards.length} gewusst
        </span>
        <label className="flex min-h-11 items-center gap-2">
          <input
            type="checkbox"
            checked={onlyOpen}
            onChange={(e) => {
              setOnlyOpen(e.target.checked);
              setIndex(0);
              setFlipped(false);
            }}
            className="size-5 accent-[var(--accent)]"
          />
          Nur noch nicht gewusste
        </label>
      </div>

      {!card ? (
        <p className="rounded-2xl border border-dashed border-line-strong p-5 text-sm text-muted">
          Alle Karten gewusst. Schalte den Filter aus, um alle nochmals zu sehen.
        </p>
      ) : (
        <>
          <button
            type="button"
            onClick={() => setFlipped((f) => !f)}
            aria-label={flipped ? "Vorderseite zeigen" : "Rückseite zeigen"}
            className="flex min-h-64 flex-col justify-between gap-4 rounded-2xl border border-line bg-surface p-6 text-left"
          >
            <span className="text-xs font-semibold tracking-[0.08em] text-accent uppercase">
              {card.topic} · Karte {Math.min(index, deck.length - 1) + 1} von {deck.length}
            </span>
            <span className={`font-serif leading-snug ${flipped ? "text-[17px]" : "text-2xl"}`}>
              {flipped ? card.back : card.front}
            </span>
            <span className="text-xs text-faint">{flipped ? "Antippen für die Frage" : "Antippen für die Antwort"}</span>
          </button>

          {flipped && (
            <div className="flex flex-wrap items-center gap-2">
              <button type="button" onClick={() => mark(true)} className="h-11 rounded-xl bg-accent px-4 text-sm font-semibold text-accent-ink">
                Gewusst
              </button>
              <button type="button" onClick={() => mark(false)} className="h-11 rounded-xl border border-line-strong px-4 text-sm font-medium">
                Nochmal
              </button>
              <span className="ml-auto">
                <Cite c={card.citation} />
              </span>
            </div>
          )}
        </>
      )}
    </section>
  );
}
