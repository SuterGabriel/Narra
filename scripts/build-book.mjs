// Merges the per-page OCR transcripts in scans/ocr/ into src/data/book.json and checks them.
//
// Usage: node scripts/build-book.mjs
//
// Checks: every PDF page present, printed page numbers continuous, line numbers continuous,
// no empty lines, and plausible line counts. Uncertain spots flagged during transcription
// are listed so they can be verified against the scan.

import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const OCR_DIR = "scans/ocr";
const OUT = "src/data/book.json";
const FIRST_PDF_PAGE = 5;
const LAST_PDF_PAGE = 103;

// The print uses typographic apostrophes (Cipolla’s); transcripts mixed ' and ’.
const normalize = (text) => text.replace(/(\p{L})'(\p{L}|\s|$)/gu, "$1’$2").replace(/\s+/g, " ").trim();

const files = readdirSync(OCR_DIR).filter((f) => /^pdf\d{3}\.json$/.test(f)).sort();
const byPdf = new Map(files.map((f) => [Number(f.slice(3, 6)), JSON.parse(readFileSync(join(OCR_DIR, f), "utf8"))]));

const problems = [];
const uncertain = [];
const pages = [];

for (let pdf = FIRST_PDF_PAGE; pdf <= LAST_PDF_PAGE; pdf++) {
  const entry = byPdf.get(pdf);
  if (!entry) {
    problems.push(`PDF page ${pdf}: missing`);
    continue;
  }
  const expected = pdf + 4;
  if (entry.page !== expected) problems.push(`PDF page ${pdf}: printed page ${entry.page}, expected ${expected}`);

  entry.lines.forEach((l, i) => {
    if (l.line !== i + 1) problems.push(`S. ${entry.page}: line index ${i + 1} numbered ${l.line}`);
    if (!l.text || !l.text.trim()) problems.push(`S. ${entry.page}, Z. ${l.line}: empty text`);
  });

  const isLast = pdf === LAST_PDF_PAGE;
  const isFirst = pdf === FIRST_PDF_PAGE;
  if (!isLast && !isFirst && (entry.lines.length < 20 || entry.lines.length > 26)) {
    problems.push(`S. ${entry.page}: unusual line count ${entry.lines.length}`);
  }

  for (const u of entry.uncertain ?? []) uncertain.push(`S. ${entry.page}, Z. ${u.line}: ${u.note}`);

  pages.push({
    page: entry.page,
    lines: entry.lines.map((l) => ({ line: l.line, text: normalize(l.text), ...(l.para ? { para: true } : {}) })),
  });
}

const lineCount = pages.reduce((n, p) => n + p.lines.length, 0);
const charCount = pages.reduce((n, p) => n + p.lines.reduce((m, l) => m + l.text.length + 1, 0), 0);

const book = {
  title: "Mario und der Zauberer",
  subtitle: "Ein tragisches Reiseerlebnis",
  author: "Thomas Mann",
  edition: "Fischer Taschenbuch; Seiten- und Zeilenzählung nach dieser Ausgabe",
  source: "Novellentext ohne Vor-/Nachwort und Anmerkungen (gemeinfrei seit 2026)",
  pages,
};

writeFileSync(OUT, JSON.stringify(book, null, 1) + "\n");

console.log(`Pages: ${pages.length}  Lines: ${lineCount}  Characters: ${charCount}`);
console.log(`Printed pages: ${pages[0]?.page}–${pages.at(-1)?.page}`);
console.log(`\nProblems (${problems.length}):`);
for (const p of problems) console.log(`  - ${p}`);
console.log(`\nUncertain spots to verify (${uncertain.length}):`);
for (const u of uncertain) console.log(`  - ${u}`);
console.log(`\nWrote ${OUT}`);
process.exitCode = problems.length ? 1 : 0;
