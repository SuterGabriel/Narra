"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { isNavActive, navItems } from "./BottomNav";
import { ThemeToggle } from "./ThemeToggle";
import { TourButton } from "./Tour";

type PassageNav = { id: number; slug: string; title: string };

/** Desktop navigation. Hidden below the lg breakpoint, where BottomNav takes over. */
export function Sidebar({ passages }: { passages: PassageNav[] }) {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 hidden h-dvh w-[248px] shrink-0 flex-col gap-6 border-r border-line bg-sidebar px-4 pt-7 pb-5 lg:flex">
      <Link href="/" className="flex flex-col gap-0.5 px-2">
        <span className="font-display text-[26px] font-bold tracking-tight">Narra</span>
        <span className="text-[13px] text-muted">Mario und der Zauberer</span>
      </Link>

      <nav aria-label="Hauptnavigation" className="flex flex-col gap-0.5">
        {navItems.map((item) => {
          const { href, label, Icon } = item;
          const active = isNavActive(pathname, item);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              data-tour={`nav-${href.slice(1) || "start"}`}
              className={`flex h-11 items-center gap-3 rounded-[10px] px-3 text-[15px] ${
                active ? "bg-accent-soft font-semibold text-accent-soft-ink" : "font-medium hover:bg-surface-2"
              }`}
            >
              <Icon size={20} />
              {label}
            </Link>
          );
        })}
      </nav>

      {pathname.startsWith("/lesen") ? (
      <div className="flex min-h-0 flex-1 flex-col gap-1">
        <p className="px-3 pb-1.5 text-xs font-semibold tracking-[0.08em] text-muted uppercase">Schlüsselpassagen</p>
        <div className="-mx-1 flex min-h-0 flex-col gap-0.5 overflow-y-auto px-1 [scrollbar-width:thin]">
          {passages.map((p) => {
            const current = pathname === `/lesen/${p.slug}`;
            return (
              <Link
                key={p.id}
                href={`/lesen/${p.slug}`}
                aria-current={current ? "page" : undefined}
                className={`flex min-h-9 shrink-0 items-center gap-2.5 rounded-[10px] px-3 text-sm ${
                  current ? "border border-line-strong bg-paper font-semibold" : "text-muted hover:bg-surface-2"
                }`}
              >
                <span className={`w-5 tabular-nums ${current ? "text-accent" : ""}`}>{p.id}</span>
                <span className="truncate">{p.title}</span>
              </Link>
            );
          })}
        </div>
      </div>
      ) : (
        <div className="flex-1" />
      )}

      <div className="flex items-center justify-between gap-2 px-1">
        <TourButton className="text-sm font-medium text-accent-soft-ink hover:underline" />
        <ThemeToggle />
      </div>
    </aside>
  );
}
