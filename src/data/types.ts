import type { Citation } from "@/lib/citations";

export type { Citation };

export type Line = { page: number; line: number; text: string };

export type Pronunciation = {
  term: string;
  language: string;
  ipa: string;
  kind?: "Person" | "Ort" | "Titel" | "Ausdruck" | string;
  /** German-reader-friendly spelling, stressed syllable in capitals. */
  respelling?: string;
  meaning?: string;
  first?: Citation;
};

export type Passage = {
  id: number;
  slug: string;
  title: string;
  start: { page: number; line: number };
  end: { page: number; line: number };
  summary: string;
  focus: string;
  themes: string[];
  anchor: Citation;
};

export type CitedText = { text: string; citations: Citation[] };

export type Overview = {
  plot: ({ heading: string } & CitedText)[];
  characters: ({ name: string; role: string; description: string; citations: Citation[] })[];
  motifs: ({ name: string; description: string; citations: Citation[] })[];
  perspective: CitedText;
  context: CitedText;
};

export type QuizItem = {
  id: string;
  type: "mc" | "open";
  topic: string;
  difficulty: 1 | 2 | 3;
  question: string;
  options?: string[];
  answerIndex?: number;
  answer: string;
  explanation: string;
  citation: Citation;
};

export type Flashcard = {
  id: string;
  topic: string;
  front: string;
  back: string;
  citation: Citation;
};
