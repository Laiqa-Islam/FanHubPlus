import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * A hairline across the very top of the window that fills as the page is
 * read. On a front page this long it is the only cheap way to answer "how
 * much of this is there?" without a scrollbar the theme has already styled
 * down to almost nothing.
 *
 * It runs on `scaleX` from a left origin, so the browser can keep it on the
 * compositor — animating `width` here would lay out the document on every
 * scroll frame.
 */
export function ScrollProgress() {
  const ref = useRef(null);

  useGSAP(() => {
    const node = ref.current;
    if (!node) return;
    if (document.documentElement.dataset.reducedMotion === "true") return;

    gsap.fromTo(
      node,
      { scaleX: 0 },
      {
        scaleX: 1,
        ease: "none",
        scrollTrigger: {
          trigger: document.documentElement,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.2,
        },
      },
    );
  }, []);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-x-0 top-0 z-[90] h-[2px]"
      style={{
        background: "color-mix(in oklch, var(--void) 60%, transparent)",
      }}
    >
      <div
        ref={ref}
        className="h-full w-full origin-left"
        style={{
          transform: "scaleX(0)",
          background:
            "linear-gradient(90deg, var(--n1), var(--n2) 55%, var(--n3))",
          boxShadow: "0 0 12px color-mix(in oklch, var(--n2) 55%, transparent)",
        }}
      />
    </div>
  );
}
