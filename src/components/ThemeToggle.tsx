"use client";

import { useEffect, useState } from "react";
import { MoonIcon, SunIcon } from "./Icons";

type Theme = "light" | "dark";

function currentTheme(): Theme {
  const set = document.documentElement.dataset.theme;
  if (set === "light" || set === "dark") return set;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    // Reading the DOM is only possible after mount; the button renders neutral until then.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTheme(currentTheme());
  }, []);

  function toggle() {
    const next: Theme = currentTheme() === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem("narra-theme", next);
    } catch {
      // Storage can be unavailable (private mode); the choice then lasts for this page view.
    }
    setTheme(next);
  }

  const label = theme === "dark" ? "Hellen Modus aktivieren" : "Dunklen Modus aktivieren";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      className="flex size-11 items-center justify-center rounded-xl bg-surface-2 text-ink"
    >
      {theme === "dark" ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}
