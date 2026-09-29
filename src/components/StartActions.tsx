"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getLastRead, type LastRead } from "@/lib/profile";

/** "Weiter, wo du warst": only shown once there is something to continue. */
export function ContinueReading() {
  const [last, setLast] = useState<LastRead | null>(null);
  useEffect(() => {
    // The last reading position lives in localStorage, which only exists after mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLast(getLastRead());
  }, []);
  if (!last) return null;
  return (
    <Link href={last.href} className="anim-in flex items-center gap-2 self-start text-[15px] text-muted hover:text-ink">
      <span>Weiter, wo du warst:</span>
      <span className="font-semibold text-accent-soft-ink underline underline-offset-4">{last.title}</span>
    </Link>
  );
}
