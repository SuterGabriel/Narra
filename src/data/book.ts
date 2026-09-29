import "server-only";
import type { BookData, BookPage } from "@/lib/citations";
import data from "./book.json";

/**
 * The verified novella text, paginated like the Fischer Taschenbuch edition.
 * Server-only so the whole book never ends up in a client bundle.
 */

export const book = data as BookData & { title: string; subtitle: string; author: string };

export const bookMeta = {
  title: book.title,
  subtitle: book.subtitle,
  author: book.author,
  firstPage: book.pages[0].page,
  lastPage: book.pages[book.pages.length - 1].page,
};

export function getPage(page: number): BookPage | undefined {
  return book.pages.find((p) => p.page === page);
}

/** Pages from start to end (inclusive), trimmed to the given first and last line. */
export function getRange(start: { page: number; line: number }, end: { page: number; line: number }): BookPage[] {
  return book.pages
    .filter((p) => p.page >= start.page && p.page <= end.page)
    .map((p) => ({
      page: p.page,
      lines: p.lines.filter(
        (l) => (p.page !== start.page || l.line >= start.line) && (p.page !== end.page || l.line <= end.line),
      ),
    }));
}
