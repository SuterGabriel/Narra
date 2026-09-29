"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { keyPassages } from "@/data/sample";
import { navItems } from "./BottomNav";
import { ThemeToggle } from "./ThemeToggle";

/** Desktop navigation. Hidden below the lg breakpoint, where BottomNav takes over. */
export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 hidden h-dvh w-[248px] shrink-0 flex-col gap-7 border-r border-line bg-surface px-4 pt-7 pb-5 lg:flex">
      <Link href="/" className="flex flex-col gap-0.5 px-2">
        <span className="font-display text-[26px] font-bold tracking-tight">Narra</span>
        <span className="text-[13px] text-muted">Mario und der Zauberer</span>
      </Link>

      <nav aria-label="Hauptnavigation" className="flex flex-col gap-0.5">
        {navItems.map(({ href, label, Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
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

      <div className="flex flex-col gap-1">
        <p className="px-3 pb-1.5 text-xs font-semibold tracking-[0.08em] text-muted uppercase">Schlüsselpassagen</p>
        {keyPassages.map((p) => {
          const current = p.id === 1 && pathname.startsWith("/lesen");
          return (
            <Link
              key={p.id}
              href="/lesen"
              className={`flex min-h-10 items-center gap-2.5 rounded-[10px] px-3 text-sm ${
                current ? "border border-line-strong bg-paper font-semibold" : "text-muted hover:bg-surface-2"
              }`}
            >
              <span className={`w-5 ${current ? "text-accent" : ""}`}>{p.id}</span>
              {p.title}
            </Link>
          );
        })}
      </div>

      <div className="mt-auto flex items-end gap-2">
        <div className="flex flex-1 flex-col gap-2.5 rounded-2xl border border-line bg-paper p-4">
          <p className="text-xs font-semibold tracking-[0.08em] text-accent uppercase">Lernplan</p>
          <p className="text-sm font-semibold">Tag 1 von 21</p>
          <div className="h-1 rounded-full bg-line-strong">
            <div className="h-1 w-[5%] rounded-full bg-accent" />
          </div>
        </div>
        <ThemeToggle />
      </div>
    </aside>
  );
}
