/**
 * Citations: "S. 42, Z. 17–19" in the Fischer edition.
 *
 * Pure functions with no imports so they run in Next.js (server and client) and in Node scripts.
 * Book lines keep their printed line-end hyphenation; for matching quotes and searching,
 * lines are joined and split words are rejoined ("Gereizt-" + "heit" -> "Gereiztheit").
 */

export type Citation = {
  page: number;
  line: number;
  /** Last cited line, on `pageEnd` if given, else on `page`. */
  lineEnd?: number;
  pageEnd?: number;
  quote?: string;
};

export type BookLine = { line: number; text: string; para?: boolean };
export type BookPage = { page: number; lines: BookLine[] };
export type BookData = { pages: BookPage[] };

export type LocatedLine = { page: number; line: number; text: string };

/** Lines covered by a citation, in order, or null if the reference does not exist. */
export function citedLines(book: BookData, c: Citation): LocatedLine[] | null {
  const startIdx = book.pages.findIndex((p) => p.page === c.page);
  if (startIdx < 0) return null;
  const endPage = c.pageEnd ?? c.page;
  const endLine = c.lineEnd ?? c.line;
  if (endPage < c.page || (endPage === c.page && endLine < c.line)) return null;

  const out: LocatedLine[] = [];
  for (let i = startIdx; i < book.pages.length; i++) {
    const p = book.pages[i];
    if (p.page > endPage) break;
    for (const l of p.lines) {
      if (p.page === c.page && l.line < c.line) continue;
      if (p.page === endPage && l.line > endLine) break;
      out.push({ page: p.page, line: l.line, text: l.text });
    }
  }
  const first = out[0];
  const last = out[out.length - 1];
  if (!first || first.page !== c.page || first.line !== c.line) return null;
  if (last.page !== endPage || last.line !== endLine) return null;
  return out;
}

/** Joins printed lines into running text, rejoining words split by a line-end hyphen. */
export function joinLines(texts: string[]): string {
  let out = "";
  for (let i = 0; i < texts.length; i++) {
    const t = texts[i];
    const next = texts[i + 1];
    if (next !== undefined && /\p{L}-$/u.test(t) && /^\p{Ll}/u.test(next)) out += t.slice(0, -1);
    else out += next === undefined ? t : t + " ";
  }
  return out;
}

/** Normalization for comparing quotes: whitespace, apostrophes and ellipses. Case and spelling stay. */
export function normalizeForMatch(s: string): string {
  return s
    .normalize("NFC")
    .replace(/[’‘`´]/g, "'")
    .replace(/…/g, "...")
    .replace(/\s+/g, " ")
    .trim();
}

export type VerifyResult = { ok: true } | { ok: false; reason: string };

export function verifyCitation(book: BookData, c: Citation): VerifyResult {
  const lines = citedLines(book, c);
  if (!lines) return { ok: false, reason: `Stelle existiert nicht: ${formatCitation(c)}` };
  if (!c.quote) return { ok: true };
  const hay = normalizeForMatch(joinLines(lines.map((l) => l.text)));
  const needle = normalizeForMatch(c.quote);
  if (hay.includes(needle)) return { ok: true };
  // Tolerate a quote that keeps the printed hyphen of a compound split across lines.
  const hayKeepHyphen = normalizeForMatch(lines.map((l) => l.text).join(" "));
  if (hayKeepHyphen.includes(needle)) return { ok: true };
  return { ok: false, reason: `Zitat nicht gefunden in ${formatCitation(c)}: „${c.quote}“` };
}

export function formatCitation(c: Citation): string {
  const end = c.lineEnd ?? c.line;
  if (c.pageEnd && c.pageEnd !== c.page) return `S. ${c.page}, Z. ${c.line} – S. ${c.pageEnd}, Z. ${end}`;
  return end !== c.line ? `S. ${c.page}, Z. ${c.line}–${end}` : `S. ${c.page}, Z. ${c.line}`;
}

/** Link into the book reader with the cited lines highlighted and scrolled into view. */
export function citationHref(c: Citation): string {
  const end = c.pageEnd && c.pageEnd !== c.page ? undefined : c.lineEnd;
  const range = end && end !== c.line ? `${c.line}-${end}` : `${c.line}`;
  return `/buch/${c.page}?z=${range}#s${c.page}z${c.line}`;
}

/**
 * Finds citations written in running text, e.g. "(S. 42, Z. 17–19)" or "S. 9, Z. 3".
 * Returns them with their position so a UI can turn them into links.
 */
export function findCitations(text: string): { index: number; length: number; citation: Citation }[] {
  const re = /S\.\s?(\d{1,3}),\s?Z\.\s?(\d{1,2})(?:\s?[–-]\s?(\d{1,2}))?/g;
  const out: { index: number; length: number; citation: Citation }[] = [];
  for (const m of text.matchAll(re)) {
    const citation: Citation = { page: Number(m[1]), line: Number(m[2]) };
    if (m[3]) citation.lineEnd = Number(m[3]);
    out.push({ index: m.index ?? 0, length: m[0].length, citation });
  }
  return out;
}

export type SearchHit = { page: number; line: number; text: string };

function searchKey(s: string): string {
  return s
    .normalize("NFC")
    .replace(/[’‘`´]/g, "'")
    .replace(/…/g, "...")
    .toLowerCase()
    .replace(/ß/g, "ss")
    .normalize("NFD")
    .replace(/[̀-̂̄-̇̉-ͯ]/g, "") // drop accents but keep umlaut dots (U+0308)
    .normalize("NFC");
}

/** Full-text search over the book. Matches across line breaks and line-end hyphenation. */
export function searchBook(book: BookData, query: string, limit = 100): SearchHit[] {
  const q = searchKey(query.replace(/\s+/g, " ").trim());
  if (q.length < 2) return [];
  const hits: SearchHit[] = [];
  for (const p of book.pages) {
    // Running text of the page in search coordinates, with the start offset of each line.
    const starts: number[] = [];
    let text = "";
    p.lines.forEach((l, i) => {
      const next = p.lines[i + 1]?.text;
      const dehyphen = next !== undefined && /\p{L}-$/u.test(l.text) && /^\p{Ll}/u.test(next);
      starts.push(text.length);
      text += searchKey(dehyphen ? l.text.slice(0, -1) : next === undefined ? l.text : l.text + " ");
    });
    const seen = new Set<number>();
    for (let idx = text.indexOf(q); idx >= 0; idx = text.indexOf(q, idx + q.length)) {
      let li = 0;
      while (li + 1 < starts.length && starts[li + 1] <= idx) li++;
      const l = p.lines[li];
      if (seen.has(l.line)) continue;
      seen.add(l.line);
      hits.push({ page: p.page, line: l.line, text: l.text });
      if (hits.length >= limit) return hits;
    }
  }
  return hits;
}
