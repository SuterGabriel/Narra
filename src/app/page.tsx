import Link from "next/link";
import { ArrowUpRightIcon, BookIcon, ChatIcon, CheckIcon, SearchIcon } from "@/components/Icons";
import { DailyCard } from "@/components/DailyQuiz";
import { TodayPlan } from "@/components/PlanView";
import { ThemeToggle } from "@/components/ThemeToggle";
import { TourButton } from "@/components/Tour";
import { passages, plan } from "@/data/content";

export default function TodayPage() {
  const shortcuts = [
    { href: "/ueberblick", label: "Das Buch in 20 Minuten: Schnellüberblick", Icon: BookIcon },
    { href: "/lesen", label: `${passages.length} Schlüsselpassagen lesen`, Icon: BookIcon },
    { href: "/ueben", label: "Quiz, Karteikarten und Aussprache", Icon: CheckIcon },
    { href: "/fragen", label: "Eine Frage zum Buch stellen", Icon: ChatIcon },
    { href: "/suche", label: "Im ganzen Buch suchen", Icon: SearchIcon },
  ];

  return (
    <div className="flex w-full flex-col gap-6 px-6 pt-8 pb-6 lg:mx-auto lg:max-w-3xl lg:px-10 lg:pt-12">
      <header className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <p className="text-xs font-semibold tracking-[0.08em] text-accent uppercase">Narra</p>
          <h1 className="font-display text-3xl font-bold tracking-tight">Mario und der Zauberer</h1>
          <p className="text-sm text-muted">In drei Wochen auf Prüfungsniveau, jede Aussage mit Seite und Zeile belegt.</p>
          <TourButton className="mt-1 self-start text-sm font-medium text-accent-soft-ink underline-offset-2 hover:underline" />
        </div>
        <div className="lg:hidden">
          <ThemeToggle />
        </div>
      </header>

      <TodayPlan plan={plan} />

      <DailyCard />

      <ul className="flex flex-col gap-2">
        {shortcuts.map(({ href, label, Icon }) => (
          <li key={href}>
            <Link href={href} className="flex min-h-14 items-center gap-3 rounded-xl border border-line px-4 text-[15px] hover:bg-surface">
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
