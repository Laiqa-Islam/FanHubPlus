import { useRef } from "react";
import { cn } from "@/lib/utils";

/**
 * Pointer-tracking 3D tilt with a glare highlight that follows the cursor.
 * Transforms are written straight to the element's style during pointermove —
 * cheaper than a React state round-trip per frame.
 */
export function TiltCard({ children, className, intensity = 9, glare = true }) {
  const ref = useRef(null);
  const glareRef = useRef(null);

  function handleMove(event) {
    const node = ref.current;
    if (!node) return;
    if (document.documentElement.dataset.reducedMotion === "true") return;

    const rect = node.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;

    node.style.transform = `perspective(900px) rotateX(${(0.5 - y) * intensity}deg) rotateY(${
      (x - 0.5) * intensity
    }deg) translateZ(0)`;

    if (glareRef.current) {
      glareRef.current.style.background = `radial-gradient(420px circle at ${x * 100}% ${
        y * 100
      }%, color-mix(in srgb, var(--spot) 22%, transparent), transparent 62%)`;
    }
  }

  function reset() {
    const node = ref.current;
    if (node)
      node.style.transform = "perspective(900px) rotateX(0deg) rotateY(0deg)";
    if (glareRef.current) glareRef.current.style.background = "transparent";
  }

  return (
    <div
      ref={ref}
      onPointerMove={handleMove}
      onPointerLeave={reset}
      className={cn(
        "relative transition-transform duration-300 ease-out [transform-style:preserve-3d]",
        className,
      )}
    >
      {children}
      {glare && (
        <div
          ref={glareRef}
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[inherit] transition-[background] duration-200"
        />
      )}
    </div>
  );
}
