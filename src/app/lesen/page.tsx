import { Reader } from "@/components/Reader";
import { getLines } from "@/data/book";
import { keyPassages, pronunciations } from "@/data/sample";

export const metadata = { title: "Lesen · Narra" };

export default function ReadPage() {
  // First key passage: the opening page. Passage ranges come with the key-passage selection.
  return <Reader passageTitle={keyPassages[0].title} lines={getLines(9)} pronunciations={pronunciations} />;
}
