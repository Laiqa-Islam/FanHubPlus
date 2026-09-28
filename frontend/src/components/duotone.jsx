import { cn } from "@/lib/utils";

/**
 * The signal wash — the treatment that makes a photograph belong to its
 * channel.
 *
 * This replaced a riso duotone, and the change is worth recording because
 * the failure mode reverses on a dark ground. The print version laid a
 * `multiply` ink over a greyscale plate; on Neon Oni's ground `multiply`
 * simply crushes an already-dark image to black and the subject disappears.
 * What works here is the opposite operator at a much lower strength:
 * `soft-light` tints the midtones toward the signal while leaving the
 * highlights — an anime character's face, the thing you actually want to
 * see — more or less untouched.
 *
 * The bottom-anchored gradient does the real legibility work; the wash is
 * only there to say which channel this is.
 */
export function Duotone({
  ink,
  strength = 0.45,
  /** A vignette from the foot of the frame, for art carrying copy over it. */
  scrim = true,
  className,
}) {
  return (
    <span
      aria-hidden
      className={cn("pointer-events-none absolute inset-0", className)}
    >
      <span
        className="absolute inset-0 mix-blend-soft-light"
        style={{ background: ink, opacity: strength }}
      />

      {/* A second, much lighter screen pass lifts the signal into the
           shadows so the tint survives in the darkest corners of the frame. */}
      <span
        className="absolute inset-0 mix-blend-screen"
        style={{ background: ink, opacity: strength * 0.16 }}
      />

      {scrim && (
        <span
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(0deg, color-mix(in oklch, var(--void) 88%, transparent), transparent 58%)",
          }}
        />
      )}
    </span>
  );
}
