import { useRef } from "react";
import { Link } from "react-router";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { useGSAP } from "@gsap/react";

import { SplitHeading } from "@/components/motion/split-heading";
import { Magnetic } from "@/components/motion/magnetic";
import { Sticker } from "@/components/press";

gsap.registerPlugin(ScrollTrigger, DrawSVGPlugin, useGSAP);

/**
 * A breath between the rails.
 *
 * The front page is now a run of dense, image-heavy bands, and reading six of
 * those in a row flattens them — nothing stands out because everything is
 * busy. This is the rest: one statement at headline scale, a lot of air, and
 * a single underline that draws itself as the words land.
 *
 * It is also the one place the page uses SplitText. Word-staggered type is
 * expensive attention; spending it on every heading would make none of them
 * read as special, so the other sections keep the house misregistration
 * treatment and this gets the flourish.
 */
export function PullQuote() {
  const scope = useRef(null);

  useGSAP(
    () => {
      if (document.documentElement.dataset.reducedMotion === "true") return;

      gsap.fromTo(
        ".underline-stroke",
        { drawSVG: "0%" },
        {
          drawSVG: "100%",
          duration: 1,
          ease: "power2.inOut",
          // Behind the words, which start at 88% — the line should arrive
          // under type that is already there, not race it.
          delay: 0.45,
          scrollTrigger: {
            trigger: scope.current,
            start: "top 80%",
            once: true,
          },
        },
      );
    },
    { scope },
  );

  return (
    <section ref={scope} className="relative overflow-hidden">
      <div
        aria-hidden
        className="halftone pointer-events-none absolute inset-0 text-[var(--n2)] opacity-[0.12]"
      />

      <div className="relative mx-auto max-w-4xl px-5 py-24 text-center sm:px-8">
        <Sticker ink="var(--n2)">Why this exists</Sticker>

        <SplitHeading
          as="h2"
          className="mt-7 font-display text-[clamp(1.7rem,5vw,3.4rem)] font-black leading-[1.06]"
        >
          Fandom writing is scattered across a dozen feeds that were never built
          to keep it.
        </SplitHeading>

        <div className="relative mx-auto mt-3 h-4 w-[min(22rem,80%)]">
          <svg
            viewBox="0 0 400 12"
            fill="none"
            className="h-full w-full"
            aria-hidden
            preserveAspectRatio="none"
          >
            <path
              className="underline-stroke"
              d="M2 8C70 3 150 2 220 5c60 2 110 4 178 2"
              stroke="var(--n3)"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>
        </div>

        <p className="mx-auto mt-7 max-w-2xl text-[1.04rem] leading-relaxed text-[var(--ink-soft)]">
          This one keeps it. Every piece is filed under a channel, tagged by
          format, searchable by year and genre, and sits next to the character
          dossiers, the clips and the events it belongs with. Nothing here is a
          link out to somewhere it might have gone.
        </p>

        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <Magnetic>
            <Link
              to="/explore"
              className="inline-flex items-center rounded-full bg-[var(--ink)] px-6 py-3 font-display text-[0.88rem] font-bold text-[var(--void)] transition-[box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:shadow-[0_0_28px_color-mix(in_oklch,var(--ink)_38%,transparent)]"
            >
              Start browsing
            </Link>
          </Magnetic>
          <Magnetic>
            <Link
              to="/characters"
              className="inline-flex items-center rounded-full border border-[var(--edge-strong)] px-6 py-3 font-display text-[0.88rem] font-bold transition-colors duration-200 hover:border-[var(--n2)] hover:text-[var(--n2)]"
            >
              Meet the cast
            </Link>
          </Magnetic>
        </div>
      </div>
    </section>
  );
}
