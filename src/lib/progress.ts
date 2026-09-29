"use client";

/**
 * Learning progress in the browser. No accounts: everything lives in localStorage,
 * and every access is guarded because storage can be unavailable (private mode, blocked).
 */

const KEY = {
  start: "narra:plan-start",
  doneDays: "narra:plan-done",
  quizWrong: "narra:quiz-wrong",
  cards: "narra:cards-known",
} as const;

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage unavailable: progress then lasts for this page view only.
  }
}

const todayIso = () => new Date().toISOString().slice(0, 10);

/** Day of the plan (1-21), starting the plan today on first use. */
export function currentPlanDay(): number {
  let start = read<string | null>(KEY.start, null);
  if (!start) {
    start = todayIso();
    write(KEY.start, start);
  }
  const diff = Math.floor((Date.parse(todayIso()) - Date.parse(start)) / 86_400_000);
  return Math.min(21, Math.max(1, diff + 1));
}

export function restartPlan() {
  write(KEY.start, todayIso());
  write(KEY.doneDays, []);
}

export const getDoneDays = () => read<number[]>(KEY.doneDays, []);
export function setDayDone(day: number, done: boolean) {
  const days = new Set(getDoneDays());
  if (done) days.add(day);
  else days.delete(day);
  write(KEY.doneDays, [...days].sort((a, b) => a - b));
}

export const getWrongQuestions = () => read<string[]>(KEY.quizWrong, []);
export function recordAnswer(id: string, correct: boolean) {
  const wrong = new Set(getWrongQuestions());
  if (correct) wrong.delete(id);
  else wrong.add(id);
  write(KEY.quizWrong, [...wrong]);
}

export const getKnownCards = () => read<string[]>(KEY.cards, []);
export function setCardKnown(id: string, known: boolean) {
  const cards = new Set(getKnownCards());
  if (known) cards.add(id);
  else cards.delete(id);
  write(KEY.cards, [...cards]);
}
