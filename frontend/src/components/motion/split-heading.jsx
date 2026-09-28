import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP);

/**
 * A heading whose words rise into place from behind a mask.
 *
 * SplitText rewrites the heading into per-word spans, which is destructive —
 * so the original markup is restored with `revert()` on cleanup, and the text
 * is rendered normally on the server. A reader who never gets the JavaScript,
 * or who has asked for reduced motion, sees a plain heading rather than an
 * empty box, which is the failure mode this kind of effect usually ships with.
 */
export function SplitHeading({
  children,
  className,
  as: Tag = "h2",
  delay = 0,
}) {
  const ref = useRef(null);

  useGSAP(
    () => {
      const node = ref.current;
      if (!node) return;
      if (document.documentElement.dataset.reducedMotion === "true") return;

      const split = new SplitText(node, {
        type: "words,lines",
        linesClass: "overflow-hidden",
      });

      const tween = gsap.from(split.words, {
        yPercent: 118,
        opacity: 0,
        duration: 0.8,
        delay,
        stagger: 0.035,
        ease: "power3.out",
        scrollTrigger: { trigger: node, start: "top 88%", once: true },
      });

      return () => {
        tween.kill();
        split.revert();
      };
    },
    { scope: ref, dependencies: [children, delay] },
  );

  return (
    <Tag ref={ref} className={cn(className)}>
      {children}
    </Tag>
  );
}
