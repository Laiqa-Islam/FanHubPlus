import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * Drifts its child against the scroll.
 *
 * `speed` is the share of the element's own travel to give back: 0.15 moves
 * it a sixth of the way against the page. Keep it small — parallax reads as
 * depth up to a point and as a rendering bug past it.
 *
 * The child should be inset inside an `overflow-hidden` parent (a scaled-up
 * image is the usual case), or the drift will show its edges.
 */
export function Parallax({ children, className, speed = 0.15 }) {
  const ref = useRef(null);

  useGSAP(
    () => {
      const node = ref.current;
      if (!node) return;
      if (document.documentElement.dataset.reducedMotion === "true") return;

      gsap.fromTo(
        node,
        { yPercent: -speed * 100 },
        {
          yPercent: speed * 100,
          ease: "none",
          scrollTrigger: {
            trigger: node,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        },
      );
    },
    { scope: ref, dependencies: [speed] },
  );

  return (
    <div ref={ref} className={cn("h-full w-full", className)}>
      {children}
    </div>
  );
}
