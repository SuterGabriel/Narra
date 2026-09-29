// Placeholder excerpt until the OCR'd book.json exists.
// Page and line numbers here are illustrative, not the Fischer edition's.

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

export const sampleLines: Line[] = [
  { page: 1, line: 1, text: "Die Erinnerung an Torre di Venere ist" },
  { page: 1, line: 2, text: "atmosphärisch unangenehm. Ärger, Ge-" },
  { page: 1, line: 3, text: "reiztheit, Überreizung lagen von Anfang" },
  { page: 1, line: 4, text: "an in der Luft, und zum Schluß kam dann" },
  { page: 1, line: 5, text: "der Chock mit diesem schrecklichen Cipol-" },
  { page: 1, line: 6, text: "la, in dessen Person sich das eigentüm-" },
  { page: 1, line: 7, text: "lich Bösartige der Stimmung auf eine" },
  { page: 1, line: 8, text: "verhängnisvolle Weise zu verkörpern und" },
  { page: 1, line: 9, text: "recht bedrohlich zusammenzudrängen" },
  { page: 1, line: 10, text: "schien." },
];

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
