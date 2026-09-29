"use client";

import type { PlanLength, PlanOptions, ReadStatus } from "./plan";

/** Answers from onboarding. Stored in the browser only, like all progress. */
export type Profile = {
  exam: "1w" | "2w" | "3w" | "unknown";
  minutes: 10 | 20 | 30;
  read: ReadStatus;
  createdAt: string;
};

const KEY = "narra:profile";

export function getProfile(): Profile | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Profile) : null;
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
  return { days, read: p?.read ?? "no" };
}

/** Opens onboarding again from anywhere (e.g. "Plan anpassen"). */
export const ONBOARDING_EVENT = "narra:onboarding";
