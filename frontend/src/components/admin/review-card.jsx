import { useActionState, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Check, X, ChevronDown, ShieldCheck, ShieldAlert } from "lucide-react";

import { reviewSubmission } from "@/actions/submissions";
import { Button } from "@/components/ui/button";
import { EmbedFrame } from "@/components/media/embed-frame";
import { FORMAT_SPECS, isSubmissionFormat } from "@/lib/media-kinds";
import { cn } from "@/lib/utils";

/**
 * One pending submission with approve/reject controls.
 *
 * The body is rendered as HTML, which is safe here because the submit action
 * strips every tag from member input and re-wraps the plain text in <p>
 * elements itself — nothing a member types survives as markup.
 *
 * v2 Phase 10 added media playback to this card. A moderator approving audio or
 * video has to be able to watch and listen to it first; without that, moderation
 * of anything but prose is guesswork, and the rights declaration below is the
 * only thing standing between the site and a copyright complaint.
 */
export function ReviewCard({
  id,
  title,
  category,
  categoryToken,
  authorName,
  authorEmail,
  submittedAt,
  body,
  format,
  media,
  embedProvider,
  embedId,
  transcript,
  ownWorkDeclared,
}) {
  const [state, action, pending] = useActionState(reviewSubmission, undefined);
  const [expanded, setExpanded] = useState(false);
  const [decision, setDecision] = useState("approved");

  useEffect(() => {
    if (state?.success && state.message) toast.success(state.message);
    else if (state?.message) toast.error(state.message);
  }, [state]);

  const spec = isSubmissionFormat(format)
    ? FORMAT_SPECS[format]
    : FORMAT_SPECS.article;
  const images = media.filter((asset) => asset.kind === "image");
  const playable = media.find(
    (asset) => asset.kind === "audio" || asset.kind === "video",
  );

  return (
    <article className="relative overflow-hidden border border-[var(--rule-strong)] bg-[var(--paper)]">
      <span
        aria-hidden
        className="absolute inset-x-0 top-0 h-[3px]"
        style={{ background: `var(--ch-${categoryToken})` }}
      />

      <div className="p-6">
        <p className="font-mono text-[0.66rem] uppercase tracking-[0.14em] text-[var(--ink-faint)]">
          {category} · {spec.label} · {submittedAt}
        </p>
        <h2 className="mt-2 font-display text-[1.25rem] font-bold">{title}</h2>
        <p className="mt-1.5 text-[0.85rem] text-[var(--ink-soft)]">
          {authorName}
          {authorEmail && (
            <span className="text-[var(--ink-faint)]"> · {authorEmail}</span>
          )}
        </p>

        {/* Rights declaration — the first thing a moderator should see on any
             submission that uploaded a file to our account. */}
        {spec.requiresOwnWork && media.length > 0 && (
          <p
            className={cn(
              "mt-4 flex items-start gap-2 border-l-2 px-3 py-2 text-[0.82rem] leading-relaxed",
              ownWorkDeclared
                ? "border-[var(--spot-2)] bg-[var(--spot-2-wash)] text-[var(--ink-soft)]"
                : "border-[var(--spot)] bg-[var(--spot)]/8 text-[var(--ink)]",
            )}
          >
            {ownWorkDeclared ? (
              <ShieldCheck
                className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--spot-2)]"
                aria-hidden
              />
            ) : (
              <ShieldAlert
                className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--spot)]"
                aria-hidden
              />
            )}
            {ownWorkDeclared
              ? "The member declared this is their own work."
              : "No ownership declaration on this upload — check before publishing."}
          </p>
        )}

        {/* ── Media preview ── */}
        {embedProvider && embedId && (
          <div className="mt-4">
            <EmbedFrame provider={embedProvider} id={embedId} title={title} />
          </div>
        )}

        {playable?.kind === "video" && (
          <div className="mt-4 overflow-hidden rounded-xl border border-[var(--edge)] bg-[var(--void)]">
            {/* Native controls: moderation is scrubbing and skipping, not an
               occasion for custom player chrome. */}
            <video
              src={playable.url}
              controls
              preload="metadata"
              className="max-h-72 w-full"
            />
          </div>
        )}

        {playable?.kind === "audio" && (
          <div className="mt-4 border border-[var(--rule-strong)] bg-[var(--paper-2)] p-3">
            <audio
              src={playable.url}
              controls
              preload="metadata"
              className="w-full"
            />
          </div>
        )}

        {images.length > 0 && (
          <div
            className={cn(
              "mt-4 grid gap-2",
              images.length === 1
                ? "grid-cols-1"
                : "grid-cols-2 sm:grid-cols-3",
            )}
          >
            {images.map((asset, index) => (
              <figure
                key={asset.url + index}
                className="overflow-hidden border border-[var(--rule-strong)]"
              >
                {/* Freshly uploaded Cloudinary asset; already sized on upload. */}
                <img
                  src={asset.url}
                  alt=""
                  className={cn(
                    "w-full object-cover",
                    images.length === 1 ? "max-h-64" : "h-28",
                  )}
                />

                {asset.caption && (
                  <figcaption className="border-t border-[var(--rule)] bg-[var(--paper-2)] px-2 py-1.5 text-[0.74rem] leading-snug text-[var(--ink-soft)]">
                    {asset.caption}
                  </figcaption>
                )}
              </figure>
            ))}
          </div>
        )}

        <button
          type="button"
          onClick={() => setExpanded((open) => !open)}
          aria-expanded={expanded}
          className="mt-5 inline-flex items-center gap-1.5 font-mono text-[0.7rem] uppercase tracking-[0.12em] text-[var(--ink-soft)] transition-colors hover:text-[var(--spot)]"
        >
          {expanded ? "Hide" : "Read"} submission
          <ChevronDown
            className={cn(
              "h-3.5 w-3.5 transition-transform",
              expanded && "rotate-180",
            )}
            aria-hidden
          />
        </button>

        {expanded && (
          <div className="mt-5 flex flex-col gap-4">
            <div
              className="prose-fanhub max-h-96 overflow-y-auto border border-[var(--rule-strong)] bg-[var(--paper-2)] p-5 text-[0.95rem]"
              dangerouslySetInnerHTML={{ __html: body }}
            />

            {transcript && (
              <div className="border border-[var(--rule-strong)] bg-[var(--paper-2)] p-5">
                <p className="mb-2 font-mono text-[0.66rem] uppercase tracking-[0.14em] text-[var(--ink-faint)]">
                  Transcript
                </p>
                <p className="max-h-64 overflow-y-auto whitespace-pre-wrap text-[0.88rem] leading-relaxed text-[var(--ink-soft)]">
                  {transcript}
                </p>
              </div>
            )}
          </div>
        )}

        <form
          action={action}
          className="mt-6 flex flex-col gap-3 border-t border-[var(--rule)] pt-5"
        >
          <input type="hidden" name="id" value={id} />
          <input type="hidden" name="decision" value={decision} />

          <label className="sr-only" htmlFor={`note-${id}`}>
            Reviewer note
          </label>
          <input
            id={`note-${id}`}
            name="note"
            maxLength={500}
            placeholder="Optional note for the author…"
            className="w-full rounded-2xl border border-[var(--edge)] bg-[var(--paper-2)] px-4 py-2.5 text-[0.88rem] text-[var(--ink)] placeholder:text-[var(--ink-faint)] focus:border-[var(--spot)] focus:outline-none"
          />

          <div className="flex flex-wrap gap-2">
            <Button
              type="submit"
              size="sm"
              variant="blue"
              loading={pending && decision === "approved"}
              onClick={() => setDecision("approved")}
            >
              <Check className="h-4 w-4" aria-hidden />
              Approve &amp; publish
            </Button>
            <Button
              type="submit"
              size="sm"
              variant="outline"
              loading={pending && decision === "rejected"}
              onClick={() => setDecision("rejected")}
            >
              <X className="h-4 w-4" aria-hidden />
              Reject
            </Button>
          </div>
        </form>
      </div>
    </article>
  );
}
