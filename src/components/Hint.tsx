"use client";

import { useEffect, useState, type ReactNode } from "react";

/**
 * A one-time tip shown where a feature is first met (instead of a tour up front).
 * Dismissed tips are remembered in the browser.
 */

const KEY = "narra:hints-seen";

function seen(): string[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function Hint({ id, children, className = "" }: { id: string; children: ReactNode; className?: string }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Whether a tip was dismissed lives in localStorage, which only exists after mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setShow(!seen().includes(id));
  }, [id]);

  if (!show) return null;

  function dismiss() {
    setShow(false);
    try {
      localStorage.setItem(KEY, JSON.stringify([...new Set([...seen(), id])]));
    } catch {
      // Storage unavailable: the tip may appear again next time.
    }
  }

  return (
    <div role="note" className={`anim-in flex items-start gap-3 rounded-2xl border border-accent/40 bg-accent-soft p-4 ${className}`}>
      <span aria-hidden="true" className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-bold text-accent-ink">
        i
      </span>
      <p className="flex-1 text-sm leading-relaxed">{children}</p>
      <button type="button" onClick={dismiss} className="-my-2 -mr-2 h-11 shrink-0 rounded-xl px-3 text-sm font-semibold text-accent-soft-ink hover:bg-paper/40">
        Verstanden
      </button>
    </div>
  );
}
