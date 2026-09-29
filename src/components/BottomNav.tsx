"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookIcon, ChatIcon, CheckIcon, HomeIcon } from "./Icons";

export const navItems = [
  { href: "/", label: "Heute", Icon: HomeIcon },
  { href: "/lesen", label: "Lesen", Icon: BookIcon },
  { href: "/fragen", label: "Fragen", Icon: ChatIcon },
  { href: "/ueben", label: "Üben", Icon: CheckIcon },
] as const;

/** Mobile navigation. Hidden from the lg breakpoint, where Sidebar takes over. */
export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Hauptnavigation"
      className="sticky bottom-0 z-10 grid grid-cols-4 border-t border-line bg-paper px-2 pt-1.5 pb-[max(1rem,env(safe-area-inset-bottom))] lg:hidden"
    >
      {navItems.map(({ href, label, Icon }) => {
        const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
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
