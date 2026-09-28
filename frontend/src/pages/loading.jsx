import { CATEGORIES } from "@/lib/constants";

/**
 * Route loading state, staged as a board warming up: the eight channel
 * signals light one after another (SRS FR-12 — loading indicators on
 * media-heavy pages).
 */
export function Loading() {
  return (
    <div className="grid min-h-[60vh] place-items-center px-5">
      <div className="w-full max-w-sm">
        <p className="mark mb-4 text-[var(--n2)]">Tuning in</p>
        <div className="flex h-10 gap-1.5" role="status" aria-label="Loading">
          {CATEGORIES.map((category, index) => (
            <span
              key={category.slug}
              className="block flex-1 origin-left rounded-full motion-safe:animate-[ink-roll_1.4s_ease-in-out_infinite]"
              style={{
                background: `var(--ch-${category.token})`,
                boxShadow: `0 0 14px var(--ch-${category.token})`,
                animationDelay: `${index * 110}ms`,
              }}
            />
          ))}
        </div>
        <div className="mt-3 border-t border-[var(--rule)] pt-2 font-mono text-[0.6rem] uppercase tracking-[0.2em] text-[var(--ink-faint)]">
          Eight channels
        </div>
      </div>
    </div>
  );
}

/** Shown while the very first page's data loads. */
export function InitialLoading() {
  return (
    <main id="main" className="flex-1">
      <Loading />
    </main>
  );
}
