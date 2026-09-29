import Link from "next/link";
import { citationHref, formatCitation, type Citation } from "@/lib/citations";
import { ArrowUpRightIcon } from "./Icons";

type Props = {
  c: Citation;
  /** "chip": tappable pill (44px). "inline": compact link inside running text. */
  variant?: "chip" | "inline";
};

/** A citation like "S. 42, Z. 17–19" that opens the book at that line. */
export function Cite({ c, variant = "chip" }: Props) {
  const label = formatCitation(c);
  const title = c.quote ? `„${c.quote}“` : undefined;

  if (variant === "inline") {
    return (
      <Link href={citationHref(c)} title={title} className="font-semibold whitespace-nowrap text-accent-soft-ink underline-offset-2 hover:underline">
        {label}
      </Link>
    );
  }

  return (
    <Link
      href={citationHref(c)}
      title={title}
      className="inline-flex h-11 items-center gap-1.5 rounded-xl bg-accent-soft px-3.5 text-[13px] font-semibold whitespace-nowrap text-accent-soft-ink"
    >
      {label}
      <ArrowUpRightIcon size={14} />
    </Link>
  );
}
