import "server-only";
import book from "./book.json";
import type { Line } from "./sample";

/**
 * The verified novella text, paginated like the Fischer Taschenbuch edition.
 * Server-only so the whole book never ends up in a client bundle.
 */

export type BookPage = { page: number; lines: { line: number; text: string; para?: boolean }[] };

export const bookMeta = {
  title: book.title,
  subtitle: book.subtitle,
  author: book.author,
  firstPage: book.pages[0].page,
  lastPage: book.pages[book.pages.length - 1].page,
};

export function getPage(page: number): BookPage | undefined {
  return (book.pages as BookPage[]).find((p) => p.page === page);
}

export function getLines(page: number): Line[] {
  const p = getPage(page);
  return p ? p.lines.map((l) => ({ page: p.page, line: l.line, text: l.text })) : [];
}
