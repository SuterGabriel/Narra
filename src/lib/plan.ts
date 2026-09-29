/**
 * The 21-day study plan, derived from the book's page range and the key passages.
 * Days 1-17 walk through the book (key passages required, full pages optional),
 * days 18-21 are review, a mock exam and targeted repetition.
 */

export type PlanTask = { label: string; href: string; minutes?: number; optional?: boolean };

export type PlanDay = {
  day: number;
  title: string;
  kind: "read" | "review" | "exam";
  pages?: { from: number; to: number };
  tasks: PlanTask[];
};

type PassageRef = { id: number; slug: string; title: string; start: { page: number }; end: { page: number } };

const READING_DAYS = 17;
// Roughly 1.5 printed pages per minute for a focused reader.
const minutesFor = (pages: number) => Math.max(3, Math.round(pages * 1.5 + 1));

export function buildPlan(firstPage: number, lastPage: number, passages: PassageRef[]): PlanDay[] {
  const total = lastPage - firstPage + 1;
  const base = Math.floor(total / READING_DAYS);
  const extra = total % READING_DAYS;

  const days: PlanDay[] = [];
  let from = firstPage;
  for (let d = 1; d <= READING_DAYS; d++) {
    const size = base + (d <= extra ? 1 : 0);
    const to = from + size - 1;
    const inRange = passages.filter((p) => p.start.page >= from && p.start.page <= to);
    const tasks: PlanTask[] = [
      ...inRange.map((p) => ({
        label: `Schlüsselpassage ${p.id}: ${p.title}`,
        href: `/lesen/${p.slug}`,
        minutes: minutesFor(p.end.page - p.start.page + 1),
      })),
      { label: `Quiz zu S. ${from}–${to}`, href: `/ueben/quiz?von=${from}&bis=${to}`, minutes: 5 },
      { label: `S. ${from}–${to} ganz lesen`, href: `/buch/${from}`, minutes: minutesFor(size) * 2, optional: true },
    ];
    days.push({
      day: d,
      title: inRange[0]?.title ?? `Seiten ${from}–${to}`,
      kind: "read",
      pages: { from, to },
      tasks,
    });
    from = to + 1;
  }

  days.push(
    {
      day: 18,
      title: "Überblick festigen",
      kind: "review",
      tasks: [
        { label: "Schnellüberblick: Handlung und Figuren", href: "/ueberblick", minutes: 20 },
        { label: "Karteikarten: Figuren", href: "/ueben/karten?thema=Figuren", minutes: 10 },
      ],
    },
    {
      day: 19,
      title: "Motive und Deutung",
      kind: "review",
      tasks: [
        { label: "Schnellüberblick: Motive, Erzähler, Kontext", href: "/ueberblick#motive", minutes: 20 },
        { label: "Alle Karteikarten", href: "/ueben/karten", minutes: 15 },
      ],
    },
    {
      day: 20,
      title: "Probeprüfung",
      kind: "exam",
      tasks: [
        { label: "Probeprüfung: 20 Fragen, 25 Minuten", href: "/ueben/pruefung", minutes: 25 },
        { label: "Offene Fragen zum ganzen Buch", href: "/ueben/quiz", minutes: 20, optional: true },
      ],
    },
    {
      day: 21,
      title: "Lücken schliessen",
      kind: "review",
      tasks: [
        { label: "Falsch beantwortete Fragen wiederholen", href: "/ueben/quiz?nur=fehler", minutes: 15 },
        { label: "Schlüsselpassagen nochmals überfliegen", href: "/lesen", minutes: 20 },
      ],
    },
  );
  return days;
}
