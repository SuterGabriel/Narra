import Link from "next/link";
import { Cite } from "@/components/Cite";
import { SpeakerIcon } from "@/components/Icons";
import { pronunciations } from "@/data/content";

export const metadata = { title: "Aussprache · Narra" };

export default function PronunciationPage() {
  const kinds = [...new Set(pronunciations.map((p) => p.kind ?? "Ausdruck"))];

  return (
    <div className="flex w-full flex-col gap-8 px-6 pt-8 pb-10 lg:mx-auto lg:max-w-3xl lg:px-10 lg:pt-12">
      <header className="flex flex-col gap-1">
        <p className="text-xs font-semibold tracking-[0.08em] text-accent uppercase">
          <Link href="/ueben">Üben</Link> · Aussprache
        </p>
        <h1 className="font-display text-3xl font-bold tracking-tight">Aussprache</h1>
        <p className="text-sm text-muted">
          Grossbuchstaben markieren die betonte Silbe. Anhören und Nachsprechen mit Feedback folgen mit ElevenLabs.
        </p>
      </header>

      {kinds.map((kind) => (
        <section key={kind} aria-labelledby={`k-${kind}`} className="flex flex-col gap-3">
          <h2 id={`k-${kind}`} className="text-xs font-semibold tracking-[0.08em] text-muted uppercase">
            {kind === "Person" ? "Personen" : kind === "Ort" ? "Orte" : kind === "Titel" ? "Titel und Anreden" : "Ausdrücke"}
          </h2>
          <ul className="flex flex-col divide-y divide-line rounded-2xl border border-line">
            {pronunciations
              .filter((p) => (p.kind ?? "Ausdruck") === kind)
              .map((p) => (
                <li key={p.term} className="flex flex-wrap items-center gap-x-4 gap-y-2 p-4">
                  <div className="flex min-w-48 flex-1 flex-col gap-0.5">
                    <p className="font-display text-lg font-bold">{p.term}</p>
                    <p className="text-sm text-muted">
                      {p.respelling && <span className="font-semibold text-ink">{p.respelling}</span>}
                      {p.respelling && " · "}
                      {p.ipa} · {p.language}
                    </p>
                    {p.meaning && <p className="text-sm leading-snug">{p.meaning}</p>}
                  </div>
                  {p.first && <Cite c={p.first} />}
                  <button
                    type="button"
                    disabled
                    aria-label={`${p.term} anhören (folgt)`}
                    className="flex size-11 items-center justify-center rounded-xl bg-accent text-accent-ink opacity-50"
                  >
                    <SpeakerIcon size={20} />
                  </button>
                </li>
              ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
