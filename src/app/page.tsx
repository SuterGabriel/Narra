import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ArrowUpRightIcon, BookIcon, ChatIcon, CheckIcon } from "@/components/Icons";

const shortcuts = [
  { href: "/lesen", label: "Schlüsselpassagen lesen und hören", Icon: BookIcon },
  { href: "/fragen", label: "Eine Frage zum Buch stellen", Icon: ChatIcon },
  { href: "/ueben", label: "Quiz und Karteikarten", Icon: CheckIcon },
];

export default function TodayPage() {
  return (
    <div className="flex w-full flex-col gap-6 px-6 pt-8 pb-6 lg:mx-auto lg:max-w-3xl lg:px-10 lg:pt-12">
      <header className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <p className="text-xs font-semibold tracking-[0.08em] text-accent uppercase">Narra</p>
          <h1 className="font-display text-3xl font-bold tracking-tight">Mario und der Zauberer</h1>
          <p className="text-sm text-muted">In drei Wochen auf Prüfungsniveau.</p>
        </div>
        <div className="lg:hidden">
          <ThemeToggle />
        </div>
      </header>

      <section aria-labelledby="today" className="flex flex-col gap-3 rounded-2xl border border-line bg-surface p-5">
        <p id="today" className="text-xs font-semibold tracking-[0.08em] text-accent uppercase">
          Heute · Tag 1 von 21
        </p>
        <p className="font-serif text-lg leading-snug">
          Lies die erste Schlüsselpassage: die Ankunft in Torre di Venere.
        </p>
        <div className="h-1 rounded-full bg-line-strong">
          <div className="h-1 w-[5%] rounded-full bg-accent" />
        </div>
        <Link
          href="/lesen"
          className="mt-1 flex h-11 items-center justify-center rounded-xl bg-accent px-4 text-sm font-semibold text-accent-ink"
        >
          Weiterlesen
        </Link>
      </section>

      <ul className="flex flex-col gap-2">
        {shortcuts.map(({ href, label, Icon }) => (
          <li key={href}>
            <Link
              href={href}
              className="flex min-h-14 items-center gap-3 rounded-xl border border-line px-4 text-[15px]"
            >
              <Icon className="text-accent" />
              <span className="flex-1">{label}</span>
              <ArrowUpRightIcon size={16} className="text-faint" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
