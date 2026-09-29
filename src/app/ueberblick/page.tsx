import { Cite } from "@/components/Cite";
import { Hint } from "@/components/Hint";
import { overview } from "@/data/content";
import type { Citation } from "@/data/types";

export const metadata = {
  title: "Schnellüberblick · Narra",
  description: "Handlung, Figuren, Motive, Erzähler und Kontext von «Mario und der Zauberer», jede Aussage mit Beleg.",
};

function Cites({ list }: { list: Citation[] }) {
  if (!list.length) return null;
  return (
    <div className="flex flex-wrap gap-2 pt-1">
      {list.map((c, i) => (
        <Cite key={i} c={c} />
      ))}
    </div>
  );
}

const h2 = "font-display text-2xl font-bold tracking-tight scroll-mt-6";
const card = "flex flex-col gap-2 rounded-2xl border border-line bg-surface p-5";

export default function OverviewPage() {
  return (
    <div className="flex w-full flex-col gap-10 px-6 pt-8 pb-10 lg:mx-auto lg:max-w-3xl lg:px-10 lg:pt-12">
      <header className="flex flex-col gap-2">
        <h1 className="font-display text-3xl font-bold tracking-tight">Schnellüberblick</h1>
        <p className="text-sm text-muted">Das Buch in 20 Minuten. Jeder Beleg öffnet die Originalstelle.</p>
        <Hint id="overview-cites" className="mt-2">
          Die Kästchen mit «S. … Z. …» sind Belege. Tipp darauf, und die Stelle öffnet sich im Buch, markiert.
        </Hint>
        <nav aria-label="Abschnitte" className="flex flex-wrap gap-2 pt-2">
          {[
            ["#handlung", "Handlung"],
            ["#figuren", "Figuren"],
            ["#motive", "Motive"],
            ["#erzaehler", "Erzähler"],
            ["#kontext", "Kontext"],
          ].map(([href, label]) => (
            <a key={href} href={href} className="flex h-11 items-center rounded-xl border border-line-strong px-3.5 text-sm">
              {label}
            </a>
          ))}
        </nav>
      </header>

      <section aria-labelledby="handlung" className="flex flex-col gap-4">
        <h2 id="handlung" className={h2}>Handlung</h2>
        <ol className="flex flex-col gap-3">
          {overview.plot.map((s, i) => (
            <li key={i} className={card}>
              <h3 className="font-display text-lg font-bold">
                <span className="mr-2 text-accent tabular-nums">{i + 1}</span>
                {s.heading}
              </h3>
              <p className="font-serif text-[15.5px] leading-relaxed">{s.text}</p>
              <Cites list={s.citations} />
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="figuren" className="flex flex-col gap-4">
        <h2 id="figuren" className={h2}>Figuren</h2>
        <ul className="grid gap-3 md:grid-cols-2">
          {overview.characters.map((c) => (
            <li key={c.name} className={card}>
              <h3 className="font-display text-lg font-bold">{c.name}</h3>
              <p className="text-sm font-semibold text-accent-soft-ink">{c.role}</p>
              <p className="font-serif text-[15px] leading-relaxed">{c.description}</p>
              <Cites list={c.citations} />
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="motive" className="flex flex-col gap-4">
        <h2 id="motive" className={h2}>Motive und Themen</h2>
        <ul className="flex flex-col gap-3">
          {overview.motifs.map((m) => (
            <li key={m.name} className={card}>
              <h3 className="font-display text-lg font-bold">{m.name}</h3>
              <p className="font-serif text-[15.5px] leading-relaxed">{m.description}</p>
              <Cites list={m.citations} />
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="erzaehler" className="flex flex-col gap-4">
        <h2 id="erzaehler" className={h2}>Erzähler und Perspektive</h2>
        <div className={card}>
          <p className="font-serif text-[15.5px] leading-relaxed">{overview.perspective.text}</p>
          <Cites list={overview.perspective.citations} />
        </div>
      </section>

      <section aria-labelledby="kontext" className="flex flex-col gap-4">
        <h2 id="kontext" className={h2}>Historischer Kontext</h2>
        <div className={card}>
          <p className="font-serif text-[15.5px] leading-relaxed">{overview.context.text}</p>
          <Cites list={overview.context.citations} />
        </div>
      </section>
    </div>
  );
}
