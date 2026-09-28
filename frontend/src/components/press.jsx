import { CATEGORIES } from "@/lib/constants";
import { cn } from "@/lib/utils";

/**
 * The channel key: eight neon signals laid side by side, the way a mixing
 * desk shows every channel lit at once. It runs under the masthead and
 * along the foot of the page as the site's colour legend.
 */
export function InkStrip({ className, height = 3, animated = false }) {
  return (
    <div aria-hidden className={cn("ink-strip", className)} style={{ height }}>
      {CATEGORIES.map((category, index) => (
        <span
          key={category.slug}
          className={cn(
            "block h-full w-full origin-left",
            animated && "animate-[ink-roll_.5s_both]",
          )}
          style={{
            background: `var(--ch-${category.token})`,
            boxShadow: `0 0 12px var(--ch-${category.token})`,
            animationDelay: animated ? `${index * 60}ms` : undefined,
          }}
        />
      ))}
    </div>
  );
}

/**
 * A word split into its colour channels, the way a cheap screen separates
 * them: the word itself, and a cyan ghost a few pixels off behind it.
 *
 * The ghost is generated from `data-ghost` in CSS rather than as a real
 * element, so it never reaches the accessibility tree and the word is
 * announced once.
 */
export function Misreg({ children, ghostInk, className, as: Tag = "span" }) {
  return (
    <Tag
      className={cn("misreg", className)}
      data-ghost={children}
      style={ghostInk ? { ["--ghost-ink"]: ghostInk } : undefined}
    >
      {children}
    </Tag>
  );
}

/** A HUD reticle. Pure ornament, and it knows it. */
export function RegMark({ className }) {
  return <span aria-hidden className={cn("reg-mark", className)} />;
}

/**
 * A lit pill. The one place a neon is a solid fill rather than a line, so
 * it is kept small and the text on it drops to `--void`.
 */
export function Sticker({
  children,
  ink = "var(--n1)",
  outline = false,
  className,
}) {
  return (
    <span
      className={cn("sticker", outline && "sticker-outline", className)}
      style={
        outline
          ? { color: ink }
          : {
              background: ink,
              boxShadow: `0 0 16px color-mix(in oklch, ${ink} 45%, transparent)`,
            }
      }
    >
      {children}
    </span>
  );
}

/** Section heading: a mono code above a lit title, flush left. */
export function PressHeading({ mark, title, ghostInk, action }) {
  return (
    <div className="mb-10">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="mark mb-3 text-[var(--n2)]">{mark}</p>
          <Misreg
            as="h2"
            ghostInk={ghostInk}
            className="text-[clamp(1.6rem,4vw,2.7rem)]"
          >
            {title}
          </Misreg>
        </div>
        {action}
      </div>
      {/* A rule that fades out at both ends rather than stopping cleanly —
           Nocturne's edge treatment, carried into the neon theme. */}
      <div
        aria-hidden
        className="mt-5 h-px w-full"
        style={{
          background:
            "linear-gradient(90deg, transparent, var(--rule-strong) 48px, var(--rule-strong) calc(100% - 48px), transparent)",
        }}
      />
    </div>
  );
}
