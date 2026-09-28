import { Children, useMemo, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * Scroll-triggered reveal. Children marked `.reveal` start hidden in CSS and
 * are animated in when the container enters the viewport, so there is no
 * flash-of-unstyled-motion on load.
 *
 * `stagger` sequences multiple `.reveal` children; `direction` picks the axis.
 *
 * The animation re-runs whenever the set of children changes, which is what
 * makes this safe to wrap around a paginated or filtered list. Without it,
 * a client-side navigation that swaps the contents while keeping this
 * component mounted leaves the new children at the hidden state CSS gives
 * them and never animates them — the grid on Explore came back empty after
 * every page change until the browser was reloaded by hand.
 */
export function Reveal({
  children,
  className,
  stagger = 0.08,
  delay = 0,
  direction = "up",
  once = true,
}) {
  const scope = useRef(null);

  /**
   * A signature of the children's keys.
   *
   * `children` itself is a fresh object on every render, so depending on it
   * directly would restart the animation constantly. The keys change exactly
   * when the list does: React gives unkeyed children stable positional keys,
   * so static content produces a constant signature and a re-rendered list
   * of the same items produces the same one.
   */
  const contentKey = useMemo(
    () =>
      Children.toArray(children)
        .map((child) =>
          typeof child === "object" && child !== null && "key" in child
            ? String(child.key)
            : "",
        )
        .join("|"),
    [children],
  );

  useGSAP(
    () => {
      if (document.documentElement.dataset.reducedMotion === "true") {
        gsap.set(".reveal", {
          opacity: 1,
          y: 0,
          x: 0,
          scale: 1,
          clipPath: "none",
        });
        return;
      }

      // The house reveal is an ink roll: the clipping is wiped onto the page
      // left to right, the way a roller passes over a sheet. Fading upward is
      // the generic choice and it says nothing about the subject.
      const from = {
        opacity: 0,
        clipPath: "inset(0 100% 0 0)",
      };
      if (direction === "up") from.y = 18;
      if (direction === "down") from.y = -18;
      if (direction === "left") from.x = 24;
      if (direction === "right") from.x = -24;
      if (direction === "scale") from.scale = 0.97;

      const targets = gsap.utils.toArray(".reveal");
      if (targets.length === 0) return;

      /**
       * Is this container already where a scroll trigger would have fired?
       *
       * It matters because a scroll trigger only fires on a scroll *event*.
       * On a first load that is fine — the page arrives at the top and the
       * reader scrolls down into things. After a client-side navigation it
       * is not: the new content is swapped in already sitting in view, no
       * scroll happens, and the trigger waits for one that never comes. That
       * is the Explore grid coming back blank after every page change.
       */
      const node = scope.current;
      const rect = node?.getBoundingClientRect();
      const alreadyInView = rect
        ? rect.top < window.innerHeight * 0.85 && rect.bottom > 0
        : false;

      const tween = gsap.fromTo(targets, from, {
        opacity: 1,
        clipPath: "inset(0 0% 0 0)",
        y: 0,
        x: 0,
        scale: 1,
        duration: 0.7,
        delay,
        stagger,
        ease: "power3.out",
        // Already in view: play now. Still below the fold: wait for the
        // scroll, which is the behaviour this component exists for.
        scrollTrigger: alreadyInView
          ? undefined
          : {
              trigger: node,
              start: "top 85%",
              toggleActions: once
                ? "play none none none"
                : "play none none reverse",
            },
      });

      // Failsafe: `.reveal` starts at opacity 0 in CSS, so if the tween never
      // runs — ScrollTrigger mismeasuring, or a stalled/throttled rAF loop —
      // the content would stay invisible for good. If the container is on
      // screen but nothing has finished animating, show it outright.
      //
      // The viewport check matters: below-the-fold sections are *supposed* to
      // sit at progress 0 until scrolled to, and forcing those visible would
      // throw away the scroll reveal entirely.
      const failsafe = setTimeout(() => {
        const node = scope.current;
        if (!node || tween.progress() === 1) return;

        const rect = node.getBoundingClientRect();
        const onScreen = rect.top < window.innerHeight && rect.bottom > 0;
        if (onScreen) {
          gsap.set(targets, {
            opacity: 1,
            y: 0,
            x: 0,
            scale: 1,
            clipPath: "none",
          });
        }
      }, 4000);

      return () => {
        clearTimeout(failsafe);
        // Each run creates its own ScrollTrigger. Killing the old pair keeps
        // them from piling up as a visitor pages through a long list.
        tween.scrollTrigger?.kill();
        tween.kill();
      };
    },
    { scope, dependencies: [direction, stagger, delay, once, contentKey] },
  );

  return (
    <div ref={scope} className={cn(className)}>
      {children}
    </div>
  );
}
