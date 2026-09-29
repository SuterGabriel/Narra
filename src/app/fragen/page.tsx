import { AskChat } from "@/components/AskChat";

export const metadata = {
  title: "Fragen · Narra",
  description: "Fragen zu «Mario und der Zauberer» stellen. Antworten nur aus dem Buch, mit Seite und Zeile belegt.",
};

export default function AskPage() {
  return <AskChat />;
}
