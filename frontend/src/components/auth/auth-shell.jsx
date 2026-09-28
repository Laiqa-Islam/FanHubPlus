import { Link } from "react-router";
import { CATEGORIES } from "@/lib/constants";

/**
 * Two-column frame shared by every auth screen: the form on the left, a
 * broadcast-styled panel on the right that keeps the channel colour key
 * present even while signing in.
 */
export function AuthShell({ title, subtitle, children, footer }) {
  return (
    <div className="mx-auto grid min-h-[calc(100dvh-4rem)] max-w-7xl gap-12 px-5 py-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)] lg:items-center">
      <div className="mx-auto w-full max-w-md">
        <div className="mb-8 flex h-2 w-40 gap-1">
          {CATEGORIES.map((category) => (
            <span
              key={category.slug}
              aria-hidden
              className="block flex-1 rounded-sm"
              style={{ background: `var(--ch-${category.token})` }}
            />
          ))}
        </div>

        <h1 className="font-display text-[clamp(1.9rem,4.5vw,2.6rem)]">
          {title}
        </h1>
        <p className="mt-3 text-[0.96rem] leading-relaxed text-[var(--ink-soft)]">
          {subtitle}
        </p>

        <div className="mt-9">{children}</div>

        {footer && (
          <div className="mt-7 text-[0.88rem] text-[var(--ink-soft)]">
            {footer}
          </div>
        )}
      </div>

      <aside className="relative hidden overflow-hidden rounded-3xl border border-[var(--rule-strong)] bg-[var(--paper)] p-10 lg:block">
        <div
          aria-hidden
          className="signal-glow pointer-events-none absolute -right-24 -top-24 h-80 w-80 blur-[90px]"
          style={{
            background:
              "radial-gradient(50% 50% at 50% 50%, color-mix(in srgb, var(--spot) 55%, transparent), transparent 70%)",
          }}
        />

        <p className="mark">Channel guide</p>
        <p className="mt-5 max-w-sm font-display text-[1.6rem] font-extrabold leading-[1.15]">
          One account, eight fandoms, zero tab sprawl.
        </p>

        <ul className="mt-9 flex flex-col gap-3.5">
          {CATEGORIES.map((category) => (
            <li key={category.slug} className="flex items-center gap-3.5">
              <span
                aria-hidden
                className="h-7 w-1 shrink-0"
                style={{ background: `var(--ch-${category.token})` }}
              />

              <span className="min-w-0">
                <span className="block text-[0.92rem] font-semibold">
                  {category.name}
                </span>
                <span className="block truncate text-[0.78rem] text-[var(--ink-faint)]">
                  {category.tagline}
                </span>
              </span>
            </li>
          ))}
        </ul>

        <p className="mt-10 font-mono text-[0.72rem] leading-relaxed text-[var(--ink-faint)]">
          Prefer to look around first?{" "}
          <Link
            to="/explore"
            className="text-[var(--spot)] underline underline-offset-4"
          >
            Browse as a visitor
          </Link>
        </p>
      </aside>
    </div>
  );
}
