import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import {
  citationHref,
  citedLines,
  findCitations,
  formatCitation,
  joinLines,
  searchBook,
  verifyCitation,
} from "../src/lib/citations.ts";

const book = JSON.parse(readFileSync(new URL("../src/data/book.json", import.meta.url), "utf8"));

describe("book text", () => {
  it("covers printed pages 9-107 without gaps", () => {
    const pages = book.pages.map((p) => p.page);
    assert.equal(pages[0], 9);
    assert.equal(pages.at(-1), 107);
    pages.forEach((p, i) => assert.equal(p, 9 + i));
  });

  it("numbers lines 1..n on every page and has no empty lines", () => {
    for (const p of book.pages) {
      p.lines.forEach((l, i) => {
        assert.equal(l.line, i + 1, `S. ${p.page}`);
        assert.ok(l.text.trim().length > 0, `S. ${p.page}, Z. ${l.line}`);
      });
    }
  });
});

describe("joinLines", () => {
  it("rejoins words split by a line-end hyphen", () => {
    assert.equal(joinLines(["Ärger, Gereizt-", "heit, Überspannung"]), "Ärger, Gereiztheit, Überspannung");
  });
  it("keeps the hyphen before a capitalised compound part", () => {
    assert.equal(joinLines(["wechselnden Cinema-", "Vorführungen gedient"]), "wechselnden Cinema- Vorführungen gedient");
  });
});

describe("verifyCitation", () => {
  it("accepts an exact quote spanning a hyphenated line break", () => {
    assert.deepEqual(verifyCitation(book, { page: 9, line: 2, lineEnd: 3, quote: "Gereiztheit, Überspannung" }), { ok: true });
  });
  it("rejects a quote that is not in the cited lines", () => {
    assert.equal(verifyCitation(book, { page: 9, line: 1, quote: "Überreizung" }).ok, false);
  });
  it("rejects a quote that only fits a wider range", () => {
    assert.equal(verifyCitation(book, { page: 9, line: 2, quote: "Gereiztheit" }).ok, false);
  });
  it("rejects references outside the book", () => {
    assert.equal(verifyCitation(book, { page: 200, line: 3 }).ok, false);
    assert.equal(verifyCitation(book, { page: 9, line: 40 }).ok, false);
  });
  it("follows citations across a page break", () => {
    const last = book.pages.find((p) => p.page === 9).lines.length;
    const lines = citedLines(book, { page: 9, line: last, pageEnd: 10, lineEnd: 1 });
    assert.equal(lines.length, 2);
    assert.deepEqual(lines.map((l) => l.page), [9, 10]);
  });
});

describe("formatting and parsing", () => {
  it("formats single lines, ranges and page spans", () => {
    assert.equal(formatCitation({ page: 42, line: 17 }), "S. 42, Z. 17");
    assert.equal(formatCitation({ page: 42, line: 17, lineEnd: 19 }), "S. 42, Z. 17–19");
    assert.equal(formatCitation({ page: 42, line: 25, pageEnd: 43, lineEnd: 2 }), "S. 42, Z. 25 – S. 43, Z. 2");
  });
  it("links into the reader with the range and an anchor", () => {
    assert.equal(citationHref({ page: 42, line: 17, lineEnd: 19 }), "/buch/42?z=17-19#s42z17");
  });
  it("finds citations in running text with en dash or hyphen", () => {
    const found = findCitations("Siehe (S. 42, Z. 17–19) und S. 9, Z. 3-4.").map((f) => f.citation);
    assert.deepEqual(found, [
      { page: 42, line: 17, lineEnd: 19 },
      { page: 9, line: 3, lineEnd: 4 },
    ]);
  });
});

describe("searchBook", () => {
  it("matches across a hyphenated line break", () => {
    const hits = searchBook(book, "gereiztheit");
    assert.deepEqual(hits.map((h) => [h.page, h.line]), [[9, 2]]);
  });
  it("treats ss like ß and ignores accents", () => {
    assert.ok(searchBook(book, "Schluss").some((h) => h.page === 9 && h.line === 4));
    assert.ok(searchBook(book, "Fuggiero").length > 0);
  });
  it("ignores queries shorter than two characters", () => {
    assert.deepEqual(searchBook(book, "a"), []);
  });
});
