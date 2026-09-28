import { useState } from "react";
import { Copy, Check, Navigation } from "lucide-react";

/**
 * Copies the exact location of an event.
 *
 * Two separate things get copied because people want two different things:
 * the written address to paste into a message, and the coordinates to paste
 * into a maps app. Pasting "Custard Factory, Birmingham" into a satnav is
 * how you end up at the wrong Custard Factory.
 *
 * `navigator.clipboard` needs a secure context, which localhost counts as —
 * but it can still be refused by permissions policy, so the failure path
 * selects the text instead of silently doing nothing.
 */
export function CopyLocation({ address, lat, lng, ink }) {
  const [copied, setCopied] = useState(null);
  const coords = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  const hasCoords = Boolean(lat || lng);

  async function copy(value, which) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(which);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      window.prompt("Copy this:", value);
    }
  }

  return (
    <div className="mt-4 flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={() => copy(address, "address")}
        className="inline-flex items-center gap-1.5 rounded-full border border-[var(--edge)] px-3 py-1.5 font-mono text-[0.6rem] uppercase tracking-[0.13em] text-[var(--ink-soft)] transition-colors hover:border-[var(--edge-strong)] hover:text-[var(--ink)]"
      >
        {copied === "address" ? (
          <Check className="h-3.5 w-3.5" style={{ color: ink }} aria-hidden />
        ) : (
          <Copy className="h-3.5 w-3.5" aria-hidden />
        )}
        {copied === "address" ? "Address copied" : "Copy address"}
      </button>

      {hasCoords && (
        <>
          <button
            type="button"
            onClick={() => copy(coords, "coords")}
            className="inline-flex items-center gap-1.5 rounded-full border border-[var(--edge)] px-3 py-1.5 font-mono text-[0.6rem] uppercase tracking-[0.13em] text-[var(--ink-soft)] transition-colors hover:border-[var(--edge-strong)] hover:text-[var(--ink)]"
            title={coords}
          >
            {copied === "coords" ? (
              <Check
                className="h-3.5 w-3.5"
                style={{ color: ink }}
                aria-hidden
              />
            ) : (
              <Navigation className="h-3.5 w-3.5" aria-hidden />
            )}
            {copied === "coords" ? "Coordinates copied" : "Copy coordinates"}
          </button>

          <span className="font-mono text-[0.6rem] tabular-nums text-[var(--ink-faint)]">
            {coords}
          </span>
        </>
      )}
    </div>
  );
}
