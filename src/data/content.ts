import "server-only";
import { bookMeta } from "./book";
import flashcardsData from "./content/flashcards.json";
import overviewData from "./content/overview.json";
import passagesData from "./content/passages.json";
import pronunciationsData from "./content/pronunciations.json";
import quizData from "./content/quiz.json";
import quotesData from "./content/quotes.json";
import type { Flashcard, Overview, Passage, Pronunciation, QuizItem, Quote } from "./types";

/**
 * Study content generated once from the verified text. Every citation in these files is checked
 * against the book by scripts/check-content.mjs.
 */

export const passages = passagesData as Passage[];
export const overview = overviewData as Overview;
export const quiz = quizData as QuizItem[];
export const flashcards = flashcardsData as Flashcard[];
export const pronunciations = pronunciationsData as Pronunciation[];
export const quotes = quotesData as Quote[];

export const getPassage = (slug: string) => passages.find((p) => p.slug === slug);

/** Minimal passage info for navigation (safe to hand to client components). */
export const passageNav = passages.map((p) => ({ id: p.id, slug: p.slug, title: p.title }));

/** Everything the client needs to build the personal study plan (see lib/plan.ts). */
export const planInput = {
  firstPage: bookMeta.firstPage,
  lastPage: bookMeta.lastPage,
  passages: passages.map((p) => ({ id: p.id, slug: p.slug, title: p.title, start: { page: p.start.page }, end: { page: p.end.page } })),
};
export type PlanInput = typeof planInput;
