import { Reader } from "@/components/Reader";
import { keyPassages, pronunciations, sampleLines } from "@/data/sample";

export const metadata = { title: "Lesen · Narra" };

export default function ReadPage() {
  return <Reader passageTitle={keyPassages[0].title} lines={sampleLines} pronunciations={pronunciations} />;
}
