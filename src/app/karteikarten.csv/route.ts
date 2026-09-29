import { flashcards } from "@/data/content";
import { formatCitation } from "@/lib/citations";

// Built once at deploy time; the cards only change with a new deploy.
export const dynamic = "force-static";

/** Tab-separated, which Anki imports without quoting trouble. Header lines tell Anki the format. */
export function GET() {
  const clean = (s: string) => s.replace(/[\t\r\n]+/g, " ").trim();
  const rows = flashcards.map((c) =>
    [clean(c.front), clean(`${c.back} (${formatCitation(c.citation)})`), `mario-zauberer ${clean(c.topic).replace(/\s+/g, "_")}`].join("\t"),
  );
  const body = ["#separator:tab", "#html:false", "#tags column:3", ...rows].join("\n") + "\n";

  return new Response(body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="narra-mario-karteikarten.csv"',
    },
  });
}
