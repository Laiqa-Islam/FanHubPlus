import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * Counts from zero to `to` when it scrolls into view.
 *
 * The final value is rendered on the server and only overwritten once the
 * tween starts, so the number is correct for a reader with JavaScript off,
 * for a crawler, and for anyone who has asked for reduced motion — none of
 * whom should be shown a zero that never moves.
 */
export function CountUp({ to, duration = 1.6, className, suffix = "" }) {
  const ref = useRef(null);

  useGSAP(
    () => {
      const node = ref.current;
      if (!node) return;
      if (document.documentElement.dataset.reducedMotion === "true") return;

      const counter = { value: 0 };
      const settle = () => {
        node.textContent = `${to}${suffix}`;
      };

      const tween = gsap.to(counter, {
        value: to,
        duration,
        ease: "power2.out",
        // Nothing is written to the DOM until the tween genuinely starts, so
        // a ScrollTrigger that never fires leaves the server-rendered number
        // in place rather than a zero that never moves.
        onUpdate: () => {
          node.textContent = `${Math.round(counter.value)}${suffix}`;
        },
        // Rounding during the tween can land a frame short of the target.
        onComplete: settle,
        scrollTrigger: { trigger: node, start: "top 88%", once: true },
      });

      // These are real figures — someone's saved count, the size of the
      // library — so a stalled tween must not be allowed to leave a *wrong*
      // number on screen. GSAP drives updates from requestAnimationFrame,
      // which a background or non-painting tab can suspend indefinitely,
      // freezing the display mid-count. This runs on a timer instead, so it
      // fires regardless, and snaps to the true value if the count is still
      // unfinished. Matches the failsafe `Reveal` already carries.
      const failsafe = setTimeout(() => {
        if (tween.progress() < 1) settle();
      }, 3000);

      return () => clearTimeout(failsafe);
    },
    { scope: ref, dependencies: [to, duration, suffix] },
  );

  return (
    <span ref={ref} className={cn("tabular-nums", className)}>
      {to}
      {suffix}
    </span>
  );
}
