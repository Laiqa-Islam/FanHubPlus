import { CATEGORIES } from "@/lib/constants";

/**
 * The board: a strip of headlines running across the page on the acid
 * signal, tipped off-square so it reads as something stuck over the layout
 * rather than a row in it.
 *
 * It bleeds past both gutters — the negative margin is what makes the tilt
 * work, since a rotated full-width band would otherwise show its corners.
 * CSS marquee, paused on hover, frozen entirely for reduced-motion readers.
 * The list is doubled so the -50% translate loops seamlessly.
 */
export function Ticker({ items }) {
  const track = [...items, ...items];

  return (
    <div className="my-10 overflow-hidden">
      <div
        className="feed relative -mx-6 overflow-hidden py-3"
        style={{
          background: "var(--n3)",
          transform: "rotate(-1.5deg)",
          boxShadow: "0 0 40px color-mix(in oklch, var(--n3) 40%, transparent)",
        }}
      >
        <div className="feed-track">
          {track.map((item, index) => (
            <span
              key={`${item}-${index}`}
              className="flex shrink-0 items-center gap-3 px-7 font-display text-[0.8rem] font-bold uppercase tracking-[0.04em] text-[var(--void)]"
              aria-hidden={index >= items.length}
            >
              <span
                aria-hidden
                className="h-2 w-2 shrink-0 rounded-full"
                style={{
                  background: "var(--void)",
                  opacity: 0.55,
                  // The bullet borrows the channel's hue only as a ring, so
                  // the band stays a single acid field.
                  boxShadow: `0 0 0 3px color-mix(in oklch, var(--ch-${
                    CATEGORIES[index % CATEGORIES.length].token
                  }) 55%, transparent)`,
                }}
              />

              {item}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
