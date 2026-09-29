import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Reader } from "@/components/Reader";
import { getRange } from "@/data/book";
import { getPassage, passages, pronunciations } from "@/data/content";

export function generateStaticParams() {
  return passages.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata(props: PageProps<"/lesen/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const p = getPassage(slug);
  return { title: p ? `${p.title} · Narra` : "Narra", description: p?.summary };
}

const sectionLabel = "text-xs font-semibold tracking-[0.08em] text-muted uppercase";

export default async function PassagePage(props: PageProps<"/lesen/[slug]">) {
  const { slug } = await props.params;
  const passage = getPassage(slug);
  if (!passage) notFound();

  const idx = passages.indexOf(passage);
  const prev = passages[idx - 1];
  const next = passages[idx + 1];

  return (
    <Reader
      kicker={`Schlüsselpassage ${passage.id}`}
      title={passage.title}
      subtitle={passage.focus}
      backHref="/lesen"
      pages={getRange(passage.start, passage.end)}
      pronunciations={pronunciations}
      audioTitle={passage.title}
      prev={prev ? { href: `/lesen/${prev.slug}`, label: prev.title } : undefined}
      next={next ? { href: `/lesen/${next.slug}`, label: "Nächste Passage" } : undefined}
      aside={
        <section className="flex flex-col gap-3">
          <h2 className={sectionLabel}>Warum ist diese Stelle wichtig?</h2>
          <p className="font-serif text-[15.5px] leading-relaxed">{passage.summary}</p>
          <div className="flex flex-wrap gap-2">
            {passage.themes.map((t) => (
              <span
                key={t}
                className="flex h-[30px] items-center rounded-lg bg-accent-soft px-2.5 text-[13px] font-semibold text-accent-soft-ink"
              >
                {t}
              </span>
            ))}
          </div>
        </section>
      }
    />
  );
}
