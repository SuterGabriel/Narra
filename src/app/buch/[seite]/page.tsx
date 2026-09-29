import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Reader, type LineRange } from "@/components/Reader";
import { book, bookMeta, getPage } from "@/data/book";
import { pronunciations } from "@/data/content";

export function generateStaticParams() {
  return book.pages.map((p) => ({ seite: String(p.page) }));
}

export async function generateMetadata(props: PageProps<"/buch/[seite]">): Promise<Metadata> {
  const { seite } = await props.params;
  return { title: `Seite ${seite} · Narra` };
}

/** "17" or "17-19" -> highlighted line range on this page. */
function parseLines(z: string | string[] | undefined, page: number): LineRange[] {
  const m = typeof z === "string" ? z.match(/^(\d{1,2})(?:-(\d{1,2}))?$/) : null;
  if (!m) return [];
  const from = Number(m[1]);
  const to = Number(m[2] ?? m[1]);
  return to >= from ? [{ page, from, to }] : [];
}

export default async function BookPageView(props: PageProps<"/buch/[seite]">) {
  const { seite } = await props.params;
  const pageNo = Number(seite);
  const page = getPage(pageNo);
  if (!page) notFound();
  const { z } = await props.searchParams;

  return (
    <Reader
      kicker="Buch"
      title={bookMeta.title}
      subtitle={`${bookMeta.author} · Seite ${pageNo} von ${bookMeta.lastPage}`}
      backHref="/lesen"
      pages={[page]}
      highlight={parseLines(z, pageNo)}
      pronunciations={pronunciations}
      prev={pageNo > bookMeta.firstPage ? { href: `/buch/${pageNo - 1}`, label: `S. ${pageNo - 1}` } : undefined}
      next={pageNo < bookMeta.lastPage ? { href: `/buch/${pageNo + 1}`, label: `S. ${pageNo + 1}` } : undefined}
    />
  );
}
