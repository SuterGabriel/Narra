import Link from "next/link";
import { ChevronIcon, SendIcon } from "@/components/Icons";
import { ContinueReading } from "@/components/StartActions";
import { ThemeToggle } from "@/components/ThemeToggle";
import { passages } from "@/data/content";

/**
 * Start page, deliberately simple: one sentence, three steps in a recommended order, and a question
 * box. Everything else (study plan, daily quiz, games) lives under Üben.
 */
export default function StartPage() {
  const steps = [
    { href: "/ueberblick", kicker: "1 · Verstehen", title: "Das Buch in 20 Minuten" },
    { href: "/lesen", kicker: "2 · Lesen", title: `Die ${passages.length} wichtigen Stellen` },
    { href: "/ueben", kicker: "3 · Üben", title: "Teste dein Wissen" },
  ];

  return (
    <div className="flex w-full flex-1 flex-col gap-8 px-6 pt-10 pb-8 lg:mx-auto lg:max-w-[680px] lg:justify-center lg:px-10 lg:py-12">
      <header className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-3">
          <h1 className="font-display text-[32px] leading-[1.08] tracking-tight lg:text-[56px]">Mario und der Zauberer</h1>
          <p className="text-base leading-relaxed text-muted lg:text-[19px]">
            Alles, was du für die Prüfung brauchst. Jede Aussage mit Seite und Zeile aus dem Buch.
          </p>
        </div>
        <div className="lg:hidden">
          <ThemeToggle />
        </div>
      </header>

      <div className="flex flex-col gap-3">
        <ContinueReading />
        <nav aria-label="Womit willst du anfangen?" className="grid gap-2.5 lg:grid-cols-3 lg:gap-3.5">
          {steps.map((s, i) => (
            <Link
              key={s.href}
              href={s.href}
              className={`flex min-h-[76px] items-center gap-3.5 rounded-[18px] px-4 py-3.5 lg:min-h-[150px] lg:flex-col lg:items-start lg:justify-between lg:rounded-[20px] lg:p-5 ${
                i === 0 ? "bg-accent text-accent-ink" : "border border-line bg-surface hover:border-accent"
              }`}
            >
              <span className="flex flex-1 flex-col gap-0.5 lg:flex-none lg:gap-7">
                <span className={`text-xs font-semibold tracking-[0.08em] uppercase ${i === 0 ? "opacity-85" : "text-accent"}`}>{s.kicker}</span>
                <span className="font-display text-xl leading-tight lg:text-[25px]">{s.title}</span>
              </span>
              <ChevronIcon size={20} className={`lg:hidden ${i === 0 ? "" : "text-faint"}`} />
            </Link>
          ))}
        </nav>
      </div>

      <form action="/fragen" className="flex flex-col gap-2">
        <label htmlFor="start-ask" className="text-sm font-semibold lg:text-[15px]">
          Oder frag direkt
        </label>
        <div className="flex gap-2 lg:gap-2.5">
          <input
            id="start-ask"
            name="q"
            type="text"
            required
            minLength={3}
            maxLength={500}
            placeholder="Warum lässt sich Mario hypnotisieren?"
            className="h-[50px] min-w-0 flex-1 rounded-[14px] border border-line-strong bg-paper px-3.5 text-[15px] placeholder:text-faint lg:h-14 lg:rounded-2xl lg:bg-surface-2 lg:px-[18px] lg:text-base"
          />
          <button
            type="submit"
            aria-label="Frage senden"
            className="flex size-[50px] shrink-0 items-center justify-center rounded-[14px] bg-ink text-paper lg:size-14 lg:rounded-2xl"
          >
            <SendIcon size={20} />
          </button>
        </div>
      </form>
    </div>
  );
}
