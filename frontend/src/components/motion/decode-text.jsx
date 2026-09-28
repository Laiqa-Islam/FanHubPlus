import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&*<>/\\";

/**
 * "Tuning in" text effect: characters resolve out of static, left to right.
 * Used sparingly — the hero ident only.
 *
 * Progress is driven by elapsed time against a fixed `duration`, not by a
 * frame counter, so the effect always lands on the real text at a predictable
 * moment regardless of frame rate or a dropped animation frame.
 */
export function DecodeText({
  text,
  className,
  delay = 0,
  duration = 1100,
  as: Tag = "span",
}) {
  // Start on the real text so a no-JS or reduced-motion render is correct.
  const [display, setDisplay] = useState(text);
  const rafRef = useRef(null);

  useEffect(() => {
    const reduced =
      document.documentElement.dataset.reducedMotion === "true" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduced) {
      setDisplay(text);
      return;
    }

    let startedAt = 0;

    const tick = (now) => {
      if (!startedAt) startedAt = now;
      const progress = Math.min(1, (now - startedAt) / duration);
      const revealed = Math.floor(progress * text.length);

      setDisplay(
        text
          .split("")
          .map((char, index) => {
            if (char === " " || index < revealed) return char;
            return GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
          })
          .join(""),
      );

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        // Guarantee the final frame is the real string.
        setDisplay(text);
      }
    };

    const timeoutId = setTimeout(() => {
      rafRef.current = requestAnimationFrame(tick);
    }, delay);

    // Guarantee the headline resolves even if the frame loop is stalled or
    // throttled (backgrounded tab, power saving). Without this, a reader
    // could be left staring at scrambled glyphs indefinitely — setTimeout
    // keeps firing where requestAnimationFrame does not.
    const settleId = setTimeout(
      () => {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        setDisplay(text);
      },
      delay + duration + 400,
    );

    return () => {
      clearTimeout(timeoutId);
      clearTimeout(settleId);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      // If we're torn down mid-scramble (StrictMode remount, navigation),
      // leave the readable text behind rather than frozen static.
      setDisplay(text);
    };
  }, [text, delay, duration]);

  // The real text stays in the accessibility tree; the scrambling glyphs are
  // presentational so screen readers never announce static noise.
  return (
    <Tag className={cn(className)}>
      <span className="sr-only">{text}</span>
      <span aria-hidden>{display}</span>
    </Tag>
  );
}
