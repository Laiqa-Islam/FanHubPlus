import { useRef } from "react";
import { cn } from "@/lib/utils";

/**
 * Nudges its child toward the cursor while hovered. Applied to the hero's
 * primary calls to action only — used everywhere it would read as noise.
 */
export function Magnetic({ children, className, strength = 0.32, ...rest }) {
  const ref = useRef(null);

  function handleMove(event) {
    const node = ref.current;
    if (!node) return;
    if (document.documentElement.dataset.reducedMotion === "true") return;

    const rect = node.getBoundingClientRect();
    const x = event.clientX - (rect.left + rect.width / 2);
    const y = event.clientY - (rect.top + rect.height / 2);
    node.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
  }

  function reset() {
    if (ref.current) ref.current.style.transform = "translate(0px, 0px)";
  }

  return (
    <div
      ref={ref}
      onPointerMove={handleMove}
      onPointerLeave={reset}
      className={cn(
        "inline-block transition-transform duration-500 ease-out",
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
