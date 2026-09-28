import { Link } from "react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Server-rendered pagination. Links rather than buttons, so pages are
 * crawlable, shareable and work without JavaScript.
 */
export function Pagination({ page, pageCount, hrefFor }) {
  if (pageCount <= 1) return null;

  // Window of pages around the current one, with the ends always reachable.
  const windowed = new Set([1, pageCount, page, page - 1, page + 1]);
  const pages = [...windowed]
    .filter((p) => p >= 1 && p <= pageCount)
    .sort((a, b) => a - b);

  return (
    <nav
      aria-label="Pagination"
      className="mt-14 flex items-center justify-center gap-2"
    >
      <PageLink
        href={hrefFor(page - 1)}
        disabled={page <= 1}
        label="Previous page"
        icon={<ChevronLeft className="h-4 w-4" aria-hidden />}
      />

      {pages.map((p, index) => (
        <span key={p} className="flex items-center gap-2">
          {index > 0 && pages[index - 1] !== p - 1 && (
            <span className="font-mono text-[0.75rem] text-[var(--ink-faint)]">
              …
            </span>
          )}
          <Link
            to={hrefFor(p)}
            aria-current={p === page ? "page" : undefined}
            className={cn(
              "grid h-10 min-w-10 place-items-center px-3 font-mono text-[0.8rem] tabular-nums transition-colors",
              p === page
                ? "bg-[var(--spot)] text-[var(--void)]"
                : "border border-[var(--rule-strong)] text-[var(--ink-soft)] hover:border-[var(--rule-strong)] hover:text-[var(--ink)]",
            )}
          >
            {p}
          </Link>
        </span>
      ))}

      <PageLink
        href={hrefFor(page + 1)}
        disabled={page >= pageCount}
        label="Next page"
        icon={<ChevronRight className="h-4 w-4" aria-hidden />}
      />
    </nav>
  );
}

function PageLink({ href, disabled, label, icon }) {
  const className =
    "grid h-10 w-10 place-items-center border border-[var(--rule-strong)] transition-colors";

  if (disabled) {
    return (
      <span
        aria-disabled="true"
        className={cn(
          className,
          "cursor-not-allowed text-[var(--ink-faint)] opacity-45",
        )}
      >
        {icon}
        <span className="sr-only">{label}</span>
      </span>
    );
  }

  return (
    <Link
      to={href}
      className={cn(
        className,
        "text-[var(--ink-soft)] hover:border-[var(--rule-strong)] hover:text-[var(--ink)]",
      )}
    >
      {icon}
      <span className="sr-only">{label}</span>
    </Link>
  );
}
