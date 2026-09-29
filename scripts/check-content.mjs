// Verifies every citation in src/data/content/*.json against the book text.
//
// Usage: node scripts/check-content.mjs [--fix]
//
// A citation is any object with numeric `page` and `line`. If it carries a `quote`, the quote must
// occur in the cited lines. With --fix, a quote that only fits when the range is extended by up to
// two lines gets its lineEnd/pageEnd corrected in place; everything else is reported, never guessed.

import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { citedLines, formatCitation, verifyCitation } from "../src/lib/citations.ts";

const fix = process.argv.includes("--fix");
const book = JSON.parse(readFileSync("src/data/book.json", "utf8"));
const DIR = "src/data/content";

/** Position of the line `steps` after (page, line), or null at the end of the book. */
function advance(page, line, steps) {
  let pi = book.pages.findIndex((p) => p.page === page);
  let li = book.pages[pi]?.lines.findIndex((l) => l.line === line);
  if (pi < 0 || li < 0) return null;
  for (let s = 0; s < steps; s++) {
    li++;
    if (li >= book.pages[pi].lines.length) {
      pi++;
      li = 0;
      if (pi >= book.pages.length) return null;
    }
  }
  return { page: book.pages[pi].page, line: book.pages[pi].lines[li].line };
}

function tryExtend(c) {
  const endPage = c.pageEnd ?? c.page;
  const endLine = c.lineEnd ?? c.line;
  for (let steps = 1; steps <= 2; steps++) {
    const to = advance(endPage, endLine, steps);
    if (!to) return null;
    const candidate = { ...c, lineEnd: to.line, ...(to.page !== c.page ? { pageEnd: to.page } : {}) };
    if (to.page === c.page) delete candidate.pageEnd;
    if (verifyCitation(book, candidate).ok) return candidate;
  }
  return null;
}

let total = 0;
let fixed = 0;
const failures = [];

function walk(node, path, file) {
  if (Array.isArray(node)) return node.forEach((v, i) => walk(v, `${path}[${i}]`, file));
  if (!node || typeof node !== "object") return;
  if (typeof node.page === "number" && typeof node.line === "number") {
    total++;
    const res = verifyCitation(book, node);
    if (!res.ok) {
      const ext = node.quote ? tryExtend(node) : null;
      if (ext && fix) {
        fixed++;
        console.log(`fixed   ${file} ${path}: ${formatCitation(node)} -> ${formatCitation(ext)}`);
        delete node.pageEnd;
        Object.assign(node, ext);
      } else {
        failures.push(`${file} ${path}: ${res.reason}${ext ? ` (fixable -> ${formatCitation(ext)})` : ""}`);
      }
    }
  }
  for (const [k, v] of Object.entries(node)) if (typeof v === "object") walk(v, `${path}.${k}`, file);
}

const files = readdirSync(DIR).filter((f) => f.endsWith(".json"));
for (const f of files) {
  const data = JSON.parse(readFileSync(join(DIR, f), "utf8"));
  walk(data, "", f);

  // Key passages: the range itself must exist and be ordered.
  if (f === "passages.json") {
    for (const p of data) {
      const range = { page: p.start.page, line: p.start.line, pageEnd: p.end.page, lineEnd: p.end.line };
      if (!citedLines(book, range)) failures.push(`${f} #${p.id}: invalid range ${formatCitation(range)}`);
    }
  }
  if (fix) writeFileSync(join(DIR, f), JSON.stringify(data, null, 2) + "\n");
}

console.log(`\nChecked ${total} citations in ${files.length} files. Fixed: ${fixed}. Failures: ${failures.length}`);
for (const x of failures) console.log(`  - ${x}`);
process.exitCode = failures.length ? 1 : 0;
