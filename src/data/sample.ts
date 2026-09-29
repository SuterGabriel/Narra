// Shared types and small hand-maintained data. The book text itself lives in book.json (see book.ts).

export type Line = {
  page: number;
  line: number;
  text: string;
};

export type Pronunciation = {
  term: string;
  ipa: string;
  language: string;
};

export type KeyPassage = {
  id: number;
  title: string;
};

export const pronunciations: Pronunciation[] = [
  { term: "Torre di Venere", ipa: "[ˈtorre di ˈvɛːnere]", language: "italienisch" },
];

// Titles beyond the first are filled in once the key passages are selected from the real text.
export const keyPassages: KeyPassage[] = [
  { id: 1, title: "Ankunft in Torre" },
  { id: 2, title: "Passage 2" },
  { id: 3, title: "Passage 3" },
  { id: 4, title: "Passage 4" },
  { id: 5, title: "Passage 5" },
];
