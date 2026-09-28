import { useCallback, useEffect, useRef, useState } from "react";
import { Image } from "@/components/ui/image";
import { X, ChevronLeft, ChevronRight, Expand } from "lucide-react";

import { lqipUrl } from "@/lib/cloudinary-url";
import { cn } from "@/lib/utils";

/**
 * Gallery for a member's photo set (v2 Phase 12).
 *
 * Distinct from the merchandise `Gallery`, which duotones its plates into the
 * page's spot ink. That treatment suits a product shot being reproduced as
 * press artwork; it would wreck a cosplayer's photograph of a build they spent
 * three months on. These stay full colour.
 *
 * The lightbox traps focus properly (v2 Phase 16) — v1's merch overlay
 * deliberately did not, and documented as much. For a dialog reachable from an
 * article body that isn't good enough: a keyboard user who opened it could tab
 * straight out into the page behind and lose track of where they were.
 */
export function PlateGallery({ plates, title }) {
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState(false);

  const dialogRef = useRef(null);
  const restoreFocusTo = useRef(null);

  const step = useCallback(
    (direction) => {
      setActive(
        (current) => (current + direction + plates.length) % plates.length,
      );
    },
    [plates.length],
  );

  useEffect(() => {
    if (!open) return;

    restoreFocusTo.current = document.activeElement;
    const dialog = dialogRef.current;
    dialog?.focus();

    function onKey(event) {
      if (event.key === "Escape") {
        setOpen(false);
        return;
      }
      if (event.key === "ArrowRight") step(1);
      if (event.key === "ArrowLeft") step(-1);

      if (event.key !== "Tab" || !dialog) return;

      // Keep Tab inside the dialog by wrapping at each end.
      const focusable = dialog.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const activeElement = document.activeElement;

      if (
        event.shiftKey &&
        (activeElement === first || activeElement === dialog)
      ) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    window.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
      restoreFocusTo.current?.focus();
    };
  }, [open, step]);

  if (plates.length === 0) return null;

  const current = plates[active];
  // Aspect ratio comes from the stored dimensions, so the space is reserved
  // before the image arrives instead of the page jolting when it does.
  const ratio =
    current.width && current.height
      ? `${current.width} / ${current.height}`
      : "4 / 3";
  const placeholder = lqipUrl(current.url);

  return (
    <>
      <figure className="mb-10">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label={`Open plate ${active + 1} of ${plates.length} at full size`}
          className="group relative block w-full overflow-hidden rounded-2xl border border-[var(--edge)] bg-[var(--paper-2)] shadow-[var(--lift-md)]"
          style={{
            aspectRatio: ratio,
            // A blurred 28px version stands in until the real file decodes.
            backgroundImage: placeholder ? `url(${placeholder})` : undefined,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <Image
            src={current.url}
            alt={current.caption || `${title} — plate ${active + 1}`}
            fill
            priority={active === 0}
            sizes="(max-width: 768px) 100vw, 768px"
            className="object-cover"
          />

          <span className="absolute right-0 top-0 grid h-9 w-9 place-items-center border-b-[1.5px] border-l border-[var(--rule-strong)] bg-[var(--paper)] opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
            <Expand className="h-4 w-4" aria-hidden />
          </span>
          <span className="absolute bottom-0 right-0 border-l-[1.5px] border-t border-[var(--rule-strong)] bg-[var(--paper)] px-2.5 py-1 font-mono text-[0.6rem] uppercase tracking-[0.14em] tabular-nums">
            Plate {active + 1} / {plates.length}
          </span>
        </button>

        {current.caption && (
          <figcaption className="mt-3 border-t border-[var(--rule)] pt-3 text-[0.88rem] leading-relaxed text-[var(--ink-soft)]">
            {current.caption}
          </figcaption>
        )}

        {plates.length > 1 && (
          <div
            className="mt-3 flex gap-2 overflow-x-auto pb-1"
            role="tablist"
            aria-label={`${title} plates`}
          >
            {plates.map((plate, index) => (
              <button
                key={plate.url + index}
                type="button"
                role="tab"
                aria-selected={index === active}
                onClick={() => setActive(index)}
                aria-label={`Show plate ${index + 1}`}
                className={cn(
                  "relative h-16 w-20 shrink-0 overflow-hidden border transition-colors",
                  index === active
                    ? "border-[var(--spot)]"
                    : "border-[var(--rule-strong)] opacity-70 hover:opacity-100",
                )}
              >
                <Image
                  src={plate.url}
                  alt=""
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </figure>

      {open && (
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-label={`${title} — plate ${active + 1} of ${plates.length}`}
          tabIndex={-1}
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-[90] grid place-items-center bg-[var(--paper-3)]/92 p-5 outline-none"
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
            className="relative max-h-[86vh] w-full max-w-5xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div
              className="relative w-full border border-[var(--edge-strong)]"
              style={{ aspectRatio: ratio, maxHeight: "72vh" }}
            >
              <Image
                src={current.url}
                alt={current.caption || `${title} — plate ${active + 1}`}
                fill
                sizes="90vw"
                quality={90}
                className="object-contain"
              />
            </div>

            {current.caption && (
              <p className="mt-3 text-center text-[0.9rem] leading-relaxed text-[var(--ink)]">
                {current.caption}
              </p>
            )}

            {plates.length > 1 && (
              <div className="mt-4 flex items-center justify-center gap-4">
                <button
                  type="button"
                  onClick={() => step(-1)}
                  aria-label="Previous image"
                  className="grid h-10 w-10 place-items-center rounded-full border border-[var(--edge-strong)] text-[var(--ink)] transition-colors hover:border-[var(--n2)] hover:text-[var(--n2)]"
                >
                  <ChevronLeft className="h-5 w-5" aria-hidden />
                </button>
                <span className="font-mono text-[0.7rem] uppercase tracking-[0.16em] tabular-nums text-[var(--ink)]">
                  {active + 1} / {plates.length}
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
