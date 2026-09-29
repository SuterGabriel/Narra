import { getPage } from "@/data/book";

/**
 * GET /api/stelle?s=42&z=17-19 -> the cited lines plus a little context, for the source panel.
 * Public-domain text only; cacheable because the book never changes between deploys.
 */
export function GET(req: Request) {
  const url = new URL(req.url);
  const pageNo = Number(url.searchParams.get("s"));
  const m = url.searchParams.get("z")?.match(/^(\d{1,2})(?:-(\d{1,2}))?$/);
  const page = Number.isInteger(pageNo) ? getPage(pageNo) : undefined;
  if (!page || !m) return Response.json({ error: "Stelle nicht gefunden" }, { status: 404 });

  const from = Number(m[1]);
  const to = Number(m[2] ?? m[1]);
  const CONTEXT = 3;
  const lines = page.lines
    .filter((l) => l.line >= from - CONTEXT && l.line <= to + CONTEXT)
    .map((l) => ({ line: l.line, text: l.text, cited: l.line >= from && l.line <= to }));
  if (!lines.some((l) => l.cited)) return Response.json({ error: "Stelle nicht gefunden" }, { status: 404 });

  return Response.json(
    { page: page.page, from, to, lines },
    { headers: { "Cache-Control": "public, max-age=86400, s-maxage=86400" } },
  );
}
