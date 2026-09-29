/**
 * The study plan, built from the book's page range, the key passages and the learner's answers
 * from onboarding (days until the exam, whether they have read the book).
 *
 * Reading days walk through the book: key passages are the core, a short quiz checks them, reading
 * the full pages is optional. The last days are review, a mock exam and targeted repetition.
 */

export type PlanTask = { label: string; href: string; minutes?: number; optional?: boolean };

export type PlanDay = {
  day: number;
  title: string;
  kind: "read" | "review" | "exam";
  pages?: { from: number; to: number };
  tasks: PlanTask[];
};

export type PlanLength = 7 | 14 | 21;
export type ReadStatus = "no" | "partly" | "yes";
export type PlanOptions = { days?: PlanLength; read?: ReadStatus };

type PassageRef = { id: number; slug: string; title: string; start: { page: number }; end: { page: number } };

// Roughly 1.5 printed pages per minute for a focused reader.
const minutesFor = (pages: number) => Math.max(3, Math.round(pages * 1.5 + 1));

const OVERVIEW: PlanTask = { label: "Das Buch in 20 Minuten (Schnellüberblick)", href: "/ueberblick", minutes: 20 };

function reviewDays(count: number): Omit<PlanDay, "day">[] {
  const consolidate: Omit<PlanDay, "day"> = {
    title: "Überblick festigen",
    kind: "review",
    tasks: [
      { label: "Schnellüberblick: Figuren und Motive", href: "/ueberblick#figuren", minutes: 15 },
      { label: "Karteikarten", href: "/ueben/karten", minutes: 15 },
    ],
  };
  const interpret: Omit<PlanDay, "day"> = {
    title: "Motive und Deutung",
    kind: "review",
    tasks: [
      { label: "Schnellüberblick: Motive, Erzähler, Kontext", href: "/ueberblick#motive", minutes: 20 },
      { label: "Zitat-Duell", href: "/ueben/zitate", minutes: 10 },
    ],
  };
  const exam: Omit<PlanDay, "day"> = {
    title: "Probeprüfung",
    kind: "exam",
    tasks: [
      { label: "Probeprüfung: 20 Fragen, 25 Minuten", href: "/ueben/pruefung", minutes: 25 },
      { label: "Offene Fragen zum ganzen Buch", href: "/ueben/quiz", minutes: 20, optional: true },
    ],
  };
  const gaps: Omit<PlanDay, "day"> = {
    title: "Lücken schliessen",
    kind: "review",
    tasks: [
      { label: "Falsch beantwortete Fragen wiederholen", href: "/ueben/quiz?nur=fehler", minutes: 15 },
      { label: "Schlüsselpassagen nochmals überfliegen", href: "/lesen", minutes: 20, optional: true },
    ],
  };
  if (count === 2) return [{ ...exam, tasks: [exam.tasks[0], consolidate.tasks[1]] }, gaps];
  if (count === 3) return [consolidate, exam, gaps];
  return [consolidate, interpret, exam, gaps];
}

export function buildPlan(firstPage: number, lastPage: number, passages: PassageRef[], opts: PlanOptions = {}): PlanDay[] {
  const length = opts.days ?? 21;
  const read = opts.read ?? "no";
  const review = length === 7 ? 2 : length === 14 ? 3 : 4;
  const readingDays = length - review;

  const total = lastPage - firstPage + 1;
  const base = Math.floor(total / readingDays);
  const extra = total % readingDays;

  const days: PlanDay[] = [];
  let from = firstPage;
  for (let d = 1; d <= readingDays; d++) {
    const size = base + (d <= extra ? 1 : 0);
    const to = from + size - 1;
    const inRange = passages.filter((p) => p.start.page >= from && p.start.page <= to);
    const passageTasks: PlanTask[] = inRange.map((p) => ({
      label: `${read === "yes" ? "Auffrischen" : "Schlüsselpassage"} ${p.id}: ${p.title}`,
      href: `/lesen/${p.slug}`,
      minutes: minutesFor(p.end.page - p.start.page + 1),
    }));
    const quiz: PlanTask = { label: `Quiz zu S. ${from}–${to}`, href: `/ueben/quiz?von=${from}&bis=${to}`, minutes: 5 };
    const fullRead: PlanTask = { label: `S. ${from}–${to} ganz lesen`, href: `/buch/${from}`, minutes: minutesFor(size) * 2, optional: true };

    // Who has read the book checks first and refreshes after; everyone else reads first.
    const tasks =
      read === "yes" ? [quiz, ...passageTasks] : [...(d === 1 ? [OVERVIEW] : []), ...passageTasks, quiz, fullRead];

    days.push({
      day: d,
      title: d === 1 && read !== "yes" ? "Überblick und Einstieg" : (inRange[0]?.title ?? `Seiten ${from}–${to}`),
      kind: "read",
      pages: { from, to },
      tasks,
    });
    from = to + 1;
  }

  reviewDays(review).forEach((r, i) => days.push({ ...r, day: readingDays + i + 1 }));
  return days;
}

/** Average minutes per day for the required tasks, for the "your plan" summary. */
export function averageMinutes(plan: PlanDay[]): number {
  const sum = plan.reduce((n, d) => n + d.tasks.filter((t) => !t.optional).reduce((m, t) => m + (t.minutes ?? 0), 0), 0);
  return Math.round(sum / plan.length);
}
