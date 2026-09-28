import { Link } from "react-router";
import { ChevronRight } from "lucide-react";

/** Navigation clarity across categories (SRS FR-12). */
export function Breadcrumbs({ trail }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-8">
      <ol className="flex flex-wrap items-center gap-1.5 font-mono text-[0.7rem] uppercase tracking-[0.12em] text-[var(--ink-faint)]">
        <li>
          <Link to="/" className="transition-colors hover:text-[var(--spot)]">
            Home
          </Link>
        </li>
        {trail.map((crumb, index) => (
          <li
            key={`${crumb.label}-${index}`}
            className="flex items-center gap-1.5"
          >
            <ChevronRight className="h-3 w-3 shrink-0" aria-hidden />
            {crumb.href ? (
              <Link
                to={crumb.href}
                className="transition-colors hover:text-[var(--spot)]"
              >
                {crumb.label}
              </Link>
            ) : (
              <span className="text-[var(--ink)]" aria-current="page">
                {crumb.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
