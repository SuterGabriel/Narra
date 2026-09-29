"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookIcon, ChatIcon, CheckIcon, HomeIcon } from "./Icons";

/** The five places of the app. `also` lists routes that belong to the same section. */
export const navItems = [
  { href: "/", label: "Start", Icon: HomeIcon, also: [] },
  { href: "/lesen", label: "Lesen", Icon: BookIcon, also: ["/ueberblick", "/buch", "/suche"] },
  { href: "/ueben", label: "Üben", Icon: CheckIcon, also: ["/lernplan"] },
  { href: "/fragen", label: "Fragen", Icon: ChatIcon, also: [] },
] as const;

export function isNavActive(pathname: string, item: (typeof navItems)[number]) {
  const matches = (base: string) => (base === "/" ? pathname === "/" : pathname === base || pathname.startsWith(`${base}/`));
  return matches(item.href) || item.also.some(matches);
}

/** Mobile navigation. Hidden from the lg breakpoint, where Sidebar takes over. */
export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Hauptnavigation"
      className="sticky bottom-0 z-10 grid grid-cols-4 border-t border-line bg-paper px-2 pt-1.5 pb-[max(1rem,env(safe-area-inset-bottom))] lg:hidden"
    >
      {navItems.map((item) => {
        const { href, label, Icon } = item;
        const active = isNavActive(pathname, item);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            data-tour={`nav-${href.slice(1) || "start"}`}
            className={`flex flex-col items-center gap-1 py-2 text-[11px] ${
              active ? "font-semibold text-accent" : "font-medium text-muted"
            }`}
          >
            <Icon />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
