import { useState, useEffect, useCallback } from "react";
import { Image } from "@/components/ui/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Duotone } from "@/components/duotone";

/**
 * Plate gallery with a lightbox (SRS FR-7).
 *
 * Keyboard-operable: arrows move between plates, Escape closes. Focus is not
 * trapped in a full dialog implementation, so the overlay is marked
 * `aria-modal` and closes on any outside click rather than pretending to be
 * more robust than it is.
 */
export function Gallery({ images, alt, ink }) {
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState(false);

  const step = useCallback(
    (direction) => {
      setActive(
        (current) => (current + direction + images.length) % images.length,
      );
    },
    [images.length],
  );

  useEffect(() => {
    if (!open) return;
    function onKey(event) {
      if (event.key === "Escape") setOpen(false);
      if (event.key === "ArrowRight") step(1);
      if (event.key === "ArrowLeft") step(-1);
    }
    window.addEventListener("keydown", onKey);
    // Stop the page scrolling behind the overlay.
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, step]);

  if (images.length === 0) return null;

  return (
    <>
      <figure>
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label={`Open ${alt} gallery at full size`}
          className="group relative block aspect-[4/3] w-full overflow-hidden rounded-2xl border border-[var(--edge)] bg-[var(--paper-2)]"
        >
          <Image
            src={images[active]}
            alt={alt}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 55vw"
            className="plate object-cover transition-transform duration-500 group-hover:scale-105"
          />

          <Duotone ink={ink} strength={0.62} />
          <span className="absolute bottom-0 right-0 border-l-[1.5px] border-t border-[var(--rule-strong)] bg-[var(--paper)] px-2.5 py-1 font-mono text-[0.6rem] uppercase tracking-[0.14em]">
            Plate {active + 1} / {images.length}
          </span>
        </button>

        {images.length > 1 && (
          <div className="mt-3 flex gap-2">
            {images.map((image, index) => (
              <button
                key={image + index}
                type="button"
                onClick={() => setActive(index)}
                aria-label={`Show plate ${index + 1}`}
                aria-current={index === active}
                className={cn(
                  "relative h-16 w-20 shrink-0 overflow-hidden border transition-colors",
                  index === active
                    ? "border-[var(--spot)]"
                    : "border-[var(--rule-strong)]",
                )}
              >
                <Image
                  src={image}
                  alt=""
                  fill
                  sizes="80px"
                  className="plate object-cover"
                />

                <span
                  aria-hidden
                  className="absolute inset-0 mix-blend-multiply dark:mix-blend-screen"
                  style={{ background: ink, opacity: 0.4 }}
                />
              </button>
            ))}
          </div>
        )}
      </figure>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${alt} gallery`}
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-[90] grid place-items-center bg-[var(--paper-3)]/92 p-5"
        >
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close gallery"
            className="absolute right-5 top-5 grid h-11 w-11 place-items-center rounded-full border border-[var(--edge-strong)] text-[var(--ink)] transition-colors hover:border-[var(--n2)] hover:text-[var(--n2)]"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>

          <div
            className="relative max-h-[82vh] w-full max-w-4xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="relative aspect-[4/3] w-full border border-[var(--edge-strong)]">
              <Image
                src={images[active]}
                alt={`${alt} — plate ${active + 1}`}
                fill
                sizes="90vw"
                className="object-contain"
              />
            </div>

            {images.length > 1 && (
              <div className="mt-4 flex items-center justify-center gap-4">
                <button
                  type="button"
                  onClick={() => step(-1)}
                  aria-label="Previous image"
                  className="grid h-10 w-10 place-items-center rounded-full border border-[var(--edge-strong)] text-[var(--ink)] transition-colors hover:border-[var(--n2)] hover:text-[var(--n2)]"
                >
                  <ChevronLeft className="h-5 w-5" aria-hidden />
                </button>
                <span className="font-mono text-[0.7rem] uppercase tracking-[0.16em] text-[var(--ink)]">
                  {active + 1} / {images.length}
                </span>
                <button
                  type="button"
                  onClick={() => step(1)}
                  aria-label="Next image"
                  className="grid h-10 w-10 place-items-center rounded-full border border-[var(--edge-strong)] text-[var(--ink)] transition-colors hover:border-[var(--n2)] hover:text-[var(--n2)]"
                >
                  <ChevronRight className="h-5 w-5" aria-hidden />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
