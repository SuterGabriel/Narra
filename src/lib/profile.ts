"use client";

import type { PlanLength, PlanOptions } from "./plan";

/**
 * The only setting: how long until the exam, chosen on the study plan page.
 * Stored in the browser only, like all progress.
 */
export type Profile = { exam: "1w" | "2w" | "3w" };

const KEY = "narra:profile";

export function getProfile(): Profile | null {
  try {
    const raw = localStorage.getItem(KEY);
    const p = raw ? (JSON.parse(raw) as Partial<Profile>) : null;
    return p && (p.exam === "1w" || p.exam === "2w" || p.exam === "3w") ? { exam: p.exam } : null;
  } catch {
    return null;
  }
}

export function saveProfile(p: Profile) {
  try {
    localStorage.setItem(KEY, JSON.stringify(p));
  } catch {
    // Storage unavailable: the plan works with defaults for this visit.
  }
}

export function planOptions(p: Profile | null): PlanOptions {
  const days: PlanLength = p?.exam === "1w" ? 7 : p?.exam === "2w" ? 14 : 21;
  return { days, read: "no" };
}

// --- Where the reader left off -------------------------------------------------

export type LastRead = { href: string; title: string };
const LAST_KEY = "narra:last-read";

export function getLastRead(): LastRead | null {
  try {
    const raw = localStorage.getItem(LAST_KEY);
    return raw ? (JSON.parse(raw) as LastRead) : null;
  } catch {
    return null;
  }
}

export function setLastRead(v: LastRead) {
  try {
    localStorage.setItem(LAST_KEY, JSON.stringify(v));
  } catch {
    // Storage unavailable: no "continue" link next time.
  }
}
