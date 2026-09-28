import { cn } from "@/lib/utils";

/**
 * The house mark — a speech bubble with a plus in it.
 *
 * Redrawn from the supplied logo as inline SVG rather than served as the
 * raster file, for three reasons: it sits at 28–36px in the header where a
 * downscaled glow goes muddy, it has to sit on the page's own ground rather
 * than the dark card the artwork is baked onto, and as SVG it can take the
 * theme's own signals so the mark stays in step if those ever change.
 *
 * The full lockup — mark, wordmark and tagline — is the supplied file, used
 * wherever there is room for it.
 */
export function BrandMark({ className, glow = true }) {
  return (
    <svg
      viewBox="0 0 64 64"
      aria-hidden
      className={cn("shrink-0", className)}
      style={
        glow
          ? {
              filter:
                "drop-shadow(0 0 6px color-mix(in oklch, var(--n2) 55%, transparent))",
            }
          : undefined
      }
    >
      <g fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path
          d="M14 15h36a5 5 0 0 1 5 5v19a5 5 0 0 1-5 5H27l-8 9v-9h-5a5 5 0 0 1-5-5V20a5 5 0 0 1 5-5Z"
          stroke="var(--n2)"
          strokeWidth={3.4}
        />

        <rect
          x="18"
          y="21"
          width="28"
          height="17"
          rx="4"
          stroke="var(--n1)"
          strokeWidth={2.6}
        />
      </g>
      <path
        d="M32 24.5v10.5M26.75 29.75h10.5"
        stroke="var(--ink)"
        strokeWidth={4}
        strokeLinecap="round"
      />
    </svg>
  );
}
