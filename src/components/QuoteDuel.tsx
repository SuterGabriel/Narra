"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { Quote } from "@/data/types";
import { shuffle } from "@/lib/daily";
import { Cite } from "./Cite";

const ROUNDS = 10;
const BEST_KEY = "narra:quote-duel-best";

type Round = { quote: Quote; mode: "speaker" | "scene"; options: string[]; answer: string };

function buildRounds(quotes: Quote[], seed: string): Round[] {
  const scenes = [...new Set(quotes.map((q) => q.scene))];
  return shuffle(quotes, seed)
    .slice(0, ROUNDS)
    .map((q, i) => {
      // Alternate between the two questions; the narrator is an easy "speaker" answer, so ask for the scene there.
      const mode: Round["mode"] = q.speaker === "der Erzähler" || i % 2 === 1 ? "scene" : "speaker";
      if (mode === "speaker") return { quote: q, mode, options: shuffle(q.speakerOptions, `${seed}-${q.id}`), answer: q.speaker };
      const others = shuffle(scenes.filter((s) => s !== q.scene), `${seed}-${q.id}`).slice(0, 3);
      return { quote: q, mode, options: shuffle([q.scene, ...others], `${seed}-${q.id}-o`), answer: q.scene };
    });
}

function readBest(): number {
  try {
    return Number(localStorage.getItem(BEST_KEY) ?? 0);
  } catch {
    return 0;
  }
}

/** Single-player quote duel: ten quotes, "Wer sagt das?" or "Welche Szene?", points for streaks. */
export function QuoteDuel({ quotes }: { quotes: Quote[] }) {
  const [seed, setSeed] = useState<string | null>(null);
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [points, setPoints] = useState(0);
  const [series, setSeries] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [best, setBest] = useState(0);

  useEffect(() => {
    // Random seed and the stored best score only exist in the browser.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSeed(String(Date.now()));
    setBest(readBest());
  }, []);

  const rounds = useMemo(() => (seed ? buildRounds(quotes, seed) : []), [quotes, seed]);
  if (!seed) return null;

  const done = index >= rounds.length;

  if (done) {
    const isBest = points > 0 && points >= best;
    return (
      <section className="flex flex-col gap-5" aria-live="polite">
        <div className="flex flex-col gap-2 rounded-2xl border border-line bg-surface p-5">
          <p className="text-xs font-semibold tracking-[0.08em] text-accent uppercase">Ergebnis</p>
          <p className="font-display text-3xl font-bold">{points} Punkte</p>
          <p className="text-sm text-muted">
            {correct} von {rounds.length} richtig. {isBest ? "Neuer Bestwert!" : `Dein Bestwert: ${best} Punkte.`}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => {
              setSeed(String(Date.now()));
              setIndex(0);
              setPicked(null);
              setPoints(0);
              setSeries(0);
              setCorrect(0);
            }}
            className="h-11 rounded-xl bg-accent px-4 text-sm font-semibold text-accent-ink"
          >
            Nochmal spielen
          </button>
          <Link href="/ueben" className="flex h-11 items-center rounded-xl border border-line-strong px-4 text-sm font-medium">
            Zurück zu Üben
          </Link>
        </div>
        <p className="text-sm text-muted">Die Bestenliste für die Klasse folgt, sobald die Datenbank angeschlossen ist.</p>
      </section>
    );
  }

  const r = rounds[index];

  function choose(option: string) {
    if (picked) return;
    setPicked(option);
    if (option === r.answer) {
      // 10 points, plus 5 for every correct answer in a row before this one.
      setPoints((p) => p + 10 + series * 5);
      setSeries((s) => s + 1);
      setCorrect((c) => c + 1);
    } else {
      setSeries(0);
    }
  }

  function next() {
    const last = index + 1 >= rounds.length;
    if (last) {
      const final = points;
      if (final > best) {
        try {
          localStorage.setItem(BEST_KEY, String(final));
        } catch {
          // Storage unavailable: the best score lasts for this page view only.
        }
      }
    }
    setIndex((i) => i + 1);
    setPicked(null);
  }

  return (
    <section className="flex flex-col gap-5">
      <div className="flex items-center justify-between text-sm text-muted">
        <span>
          Zitat {index + 1} von {rounds.length}
        </span>
        <span>
          {points} Punkte{series > 1 ? ` · Serie ×${series}` : ""}
        </span>
      </div>

      <figure className="flex flex-col gap-4 rounded-2xl border border-line bg-surface p-5">
        <figcaption className="text-xs font-semibold tracking-[0.08em] text-accent uppercase">
          {r.mode === "speaker" ? "Wer sagt das?" : "In welcher Szene steht das?"}
        </figcaption>
        <blockquote className="font-serif text-xl leading-snug">«{r.quote.quote}»</blockquote>
      </figure>

      <div className="flex flex-col gap-2" role="group" aria-label="Antwortmöglichkeiten">
        {r.options.map((opt) => {
          const state = !picked
            ? "border-line-strong bg-paper hover:border-accent"
            : opt === r.answer
              ? "border-accent bg-accent-soft font-semibold"
              : opt === picked
                ? "border-name text-name line-through"
                : "border-line text-muted";
          return (
            <button key={opt} type="button" disabled={!!picked} onClick={() => choose(opt)} className={`min-h-12 rounded-xl border px-4 py-3 text-left text-[15px] ${state}`}>
              {opt}
            </button>
          );
        })}
      </div>

      {picked && (
        <div className="flex flex-col gap-3 rounded-2xl border border-line p-4" aria-live="polite">
          <p className={`text-sm font-semibold ${picked === r.answer ? "text-accent" : "text-name"}`}>
            {picked === r.answer ? "Richtig." : `Nicht ganz. Richtig ist: ${r.answer}.`}
          </p>
          <p className="text-[15px] leading-relaxed text-muted">
            {r.mode === "speaker" ? `Szene: ${r.quote.scene}. ` : `Es spricht: ${r.quote.speaker}. `}
            {r.quote.hint}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <Cite c={r.quote.citation} />
            <button type="button" onClick={next} className="ml-auto h-11 rounded-xl bg-accent px-5 text-sm font-semibold text-accent-ink">
              {index + 1 < rounds.length ? "Nächstes Zitat" : "Ergebnis"}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
