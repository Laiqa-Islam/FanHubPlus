import { Reveal } from "@/components/motion/reveal";

/**
 * The chronology behind an article (SRS FR-7).
 *
 * A feature about a franchise usually has a spine of dates — the run that
 * started it, the adaptation, the year the formula changed — and prose is a
 * bad shape for that. Buried in paragraphs the reader has to hold the order
 * in their head; laid out on a thread they can see it.
 *
 * Built as a semantic ordered list rather than a stack of divs, because that
 * is what it is: the sequence carries meaning, and a screen reader should
 * announce it as "1 of 6" rather than as six unrelated headings. The thread
 * and the markers are decorative and hidden from the accessibility tree.
 */
export function ArticleTimeline({ entries, ink }) {
  if (entries.length === 0) return null;

  return (
    <section className="mt-14">
      <div className="mb-8">
        <p className="mark mb-3" style={{ color: ink }}>
          How it got here
        </p>
        <h2 className="font-display text-[clamp(1.3rem,3vw,1.9rem)] font-black leading-none">
          The timeline
        </h2>
        <div
          aria-hidden
          className="mt-5 h-px w-full"
          style={{
            background:
              "linear-gradient(90deg, var(--rule-strong), transparent)",
          }}
        />
      </div>

      <Reveal stagger={0.08}>
        {/* The thread lives outside the list: an `ol` may only contain `li`,
             and a stray decorative span in there is invalid markup that some
             screen readers announce as an empty item. */}
        <div className="relative">
          <span
            aria-hidden
            className="absolute bottom-3 left-[5px] top-3 w-px sm:left-[7px]"
            style={{
              background: `linear-gradient(to bottom, transparent, ${ink} 12%, ${ink} 88%, transparent)`,
              opacity: 0.55,
            }}
          />

          <ol className="flex flex-col gap-8 pl-8 sm:pl-10">
            {entries.map((entry, index) => (
              <li key={`${entry.label}-${index}`} className="reveal relative">
                <span
                  aria-hidden
                  className="absolute -left-8 top-[0.35rem] grid h-[11px] w-[11px] place-items-center rounded-full sm:-left-10"
                  style={{
                    background: ink,
                    boxShadow: `0 0 12px color-mix(in oklch, ${ink} 60%, transparent)`,
                  }}
                />

                <p
                  className="font-mono text-[0.62rem] uppercase tracking-[0.18em]"
                  style={{ color: ink }}
                >
                  {entry.label}
                </p>
                <h3 className="mt-2 font-display text-[1.02rem] font-bold leading-[1.2]">
                  {entry.title}
                </h3>
                {entry.body && (
                  <p className="mt-2 text-[0.94rem] leading-relaxed text-[var(--ink-soft)]">
                    {entry.body}
                  </p>
                )}
              </li>
            ))}
          </ol>
        </div>
      </Reveal>
    </section>
  );
}
