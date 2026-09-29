import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { pickDaily, previousDate, shuffle, zurichDate } from "../src/lib/daily.ts";
import { buildPlan } from "../src/lib/plan.ts";

const passages = JSON.parse(readFileSync(new URL("../src/data/content/passages.json", import.meta.url), "utf8"));

describe("daily quiz", () => {
  const pool = Array.from({ length: 45 }, (_, i) => `q${i}`);

  it("picks the same five questions for everyone on a date", () => {
    assert.deepEqual(pickDaily(pool, "2026-10-01"), pickDaily(pool, "2026-10-01"));
    assert.equal(new Set(pickDaily(pool, "2026-10-01")).size, 5);
  });
  it("picks a different set the next day", () => {
    assert.notDeepEqual(pickDaily(pool, "2026-10-01"), pickDaily(pool, "2026-10-02"));
  });
  it("shuffles without losing or duplicating items", () => {
    assert.deepEqual([...shuffle(pool, "x")].sort(), [...pool].sort());
  });
  it("computes the previous day across month and year boundaries", () => {
    assert.equal(previousDate("2026-10-01"), "2026-09-30");
    assert.equal(previousDate("2027-01-01"), "2026-12-31");
  });
  it("uses Swiss time for the date", () => {
    // 23:30 UTC on 30 Sep is already 1 Oct in Zurich (UTC+2 in summer time).
    assert.equal(zurichDate(new Date("2026-09-30T23:30:00Z")), "2026-10-01");
  });
});

describe("study plan", () => {
  const plan = buildPlan(9, 107, passages);

  it("has 21 days", () => {
    assert.equal(plan.length, 21);
    plan.forEach((d, i) => assert.equal(d.day, i + 1));
  });
  it("reading days cover every page exactly once", () => {
    const reading = plan.filter((d) => d.kind === "read");
    assert.equal(reading[0].pages.from, 9);
    assert.equal(reading.at(-1).pages.to, 107);
    for (let i = 1; i < reading.length; i++) assert.equal(reading[i].pages.from, reading[i - 1].pages.to + 1);
  });
  it("assigns every key passage to exactly one day", () => {
    const hrefs = plan.flatMap((d) => d.tasks.map((t) => t.href)).filter((h) => h.startsWith("/lesen/"));
    assert.deepEqual([...hrefs].sort(), passages.map((p) => `/lesen/${p.slug}`).sort());
  });
});
