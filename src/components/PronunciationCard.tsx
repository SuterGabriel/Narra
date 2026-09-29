import type { Pronunciation } from "@/data/sample";
import { MicIcon, SpeakerIcon } from "./Icons";

type Props = {
  term: Pronunciation;
  /** Compact: inline under a line on mobile. Otherwise: the larger side-panel card. */
  compact?: boolean;
};

export function PronunciationCard({ term, compact = false }: Props) {
  if (compact) {
    return (
      <div className="flex items-center gap-2.5 rounded-xl border border-line-strong bg-surface py-3 pr-3 pl-3.5">
        <div className="flex flex-1 flex-col gap-0.5">
          <div className="text-sm font-semibold">{term.term}</div>
          <div className="text-[13px] text-muted">
            {term.ipa} · {term.language}
          </div>
        </div>
        <button
          type="button"
          aria-label="Aussprache anhören"
          className="flex size-11 items-center justify-center rounded-xl bg-accent text-accent-ink"
        >
          <SpeakerIcon size={20} />
        </button>
        <button
          type="button"
          aria-label="Nachsprechen"
          className="flex size-11 items-center justify-center rounded-xl border border-line-strong bg-paper"
        >
          <MicIcon size={20} />
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3.5 rounded-2xl border border-line-strong bg-surface p-4">
      <div className="flex flex-col gap-1">
        <div className="font-display text-[22px] font-bold">{term.term}</div>
        <div className="text-sm text-muted">
          {term.ipa} · {term.language}
        </div>
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-accent text-sm font-semibold text-accent-ink"
        >
          <SpeakerIcon size={18} />
          Anhören
        </button>
        <button
          type="button"
          className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-line-strong bg-paper text-sm font-semibold"
        >
          <MicIcon size={18} />
          Nachsprechen
        </button>
      </div>
    </div>
  );
}
