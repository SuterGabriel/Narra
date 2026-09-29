import Link from "next/link";
import { QuizRunner } from "@/components/QuizRunner";
import { quiz } from "@/data/content";

export const metadata = { title: "Quiz · Narra" };

const num = (v: string | string[] | undefined) => (typeof v === "string" && /^\d{1,3}$/.test(v) ? Number(v) : undefined);

export default async function QuizPage(props: PageProps<"/ueben/quiz">) {
  const sp = await props.searchParams;
  const from = num(sp.von);
  const to = num(sp.bis);
  const onlyMistakes = sp.nur === "fehler";

  const items = quiz.filter((q) => (from === undefined || q.citation.page >= from) && (to === undefined || q.citation.page <= to));
  const scope = onlyMistakes ? "Deine Lücken" : from !== undefined && to !== undefined ? `S. ${from}–${to}` : "Ganzes Buch";

  return (
    <div className="flex w-full flex-col gap-6 px-6 pt-8 pb-6 lg:mx-auto lg:max-w-2xl lg:px-10 lg:pt-12">
      <header className="flex flex-col gap-1">
        <p className="text-xs font-semibold tracking-[0.08em] text-accent uppercase">
          <Link href="/ueben">Üben</Link> · {scope}
        </p>
        <h1 className="font-display text-3xl font-bold tracking-tight">Quiz</h1>
      </header>
      {/* key: restart the run when the scope changes */}
      <QuizRunner key={`${from}-${to}-${onlyMistakes}`} items={items} onlyMistakes={onlyMistakes} scopeLabel={scope} />
    </div>
  );
}
