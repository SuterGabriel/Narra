import { redirect } from "next/navigation";
import { bookMeta } from "@/data/book";

export default function BookIndex() {
  redirect(`/buch/${bookMeta.firstPage}`);
}
