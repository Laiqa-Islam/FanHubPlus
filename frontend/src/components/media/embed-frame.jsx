import { ExternalLink } from "lucide-react";

import {
  PROVIDER_SPECS,
  embedHref,
  embedSrc,
  isEmbedProvider,
} from "@/lib/embeds";

/**
 * Renders a third-party player (v2 Phase 11).
 *
 * The `src` is built by `lib/embeds.ts` from a stored provider + id, never from
 * a URL a member supplied, and this component refuses to render at all if that
 * rebuild fails. So there is no path by which input reaches the `src` attribute.
 *
 * The frame is then sandboxed to the narrowest set of permissions its player
 * actually needs. `allow-same-origin` refers to the *provider's* origin, not
 * ours — it lets YouTube's player talk to YouTube, and grants nothing here.
 */
export function EmbedFrame({ provider, id, title, ink = "var(--spot)" }) {
  const src = embedSrc(provider, id);
  const href = embedHref(provider, id);

  // A row that fails revalidation is a bug or a tampered record. Either way the
  // correct response is to render nothing rather than guess at a repair.
  if (!src || !href || !isEmbedProvider(provider)) return null;

  const spec = PROVIDER_SPECS[provider];
  const fixedHeight = "height" in spec.frame ? spec.frame.height : null;

  return (
    <figure className="rounded-2xl border border-[var(--edge)] bg-[var(--paper-2)] shadow-[var(--lift-md)]">
      <div
        className="relative w-full overflow-hidden rounded-2xl bg-[var(--void)]"
        style={
          fixedHeight
            ? { height: `${fixedHeight}px` }
            : { aspectRatio: spec.frame.aspect }
        }
      >
        <iframe
          src={src}
          title={`${title} — ${spec.label}`}
          loading="lazy"
          // Only what a player needs: no forms, no downloads, no top-level
          // navigation away from the page the reader is on.
          sandbox="allow-scripts allow-same-origin allow-presentation allow-popups allow-popups-to-escape-sandbox"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
          className="absolute inset-0 h-full w-full border-0"
        />
      </div>

      <figcaption className="flex flex-wrap items-center gap-x-3 gap-y-1.5 border-t border-[var(--rule-strong)] bg-[var(--paper)] px-3 py-2">
        <span
          className="border border-[var(--edge)] px-2 py-0.5 font-mono text-[0.58rem] uppercase tracking-[0.14em]"
          style={{ background: ink, color: "var(--void)" }}
        >
          {spec.label}
        </span>
        <span className="font-mono text-[0.62rem] uppercase tracking-[0.12em] text-[var(--ink-faint)]">
          Hosted by {spec.label}
        </span>
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto inline-flex items-center gap-1.5 font-mono text-[0.62rem] uppercase tracking-[0.12em] text-[var(--ink-soft)] transition-colors hover:text-[var(--spot)]"
        >
          Open on {spec.label}
          <ExternalLink className="h-3 w-3" aria-hidden />
        </a>
      </figcaption>
    </figure>
  );
}
