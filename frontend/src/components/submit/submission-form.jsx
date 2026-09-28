import { useActionState, useEffect, useMemo, useState } from "react";
import { CheckCircle2, Link2, ShieldCheck } from "lucide-react";
import { toast } from "react-toastify";

import { submitFanContent } from "@/actions/submissions";
import { CATEGORIES } from "@/lib/constants";
import {
  FORMAT_SPECS,
  GALLERY_MAX,
  SUBMISSION_FORMATS,
} from "@/lib/media-kinds";
import {
  PROVIDER_SPECS,
  parseEmbed,
  supportedProviderList,
} from "@/lib/embeds";
import { Input, Textarea, Select, Field } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import {
  MediaUploader,
  attachmentManifest,
} from "@/components/submit/media-uploader";
import { cn } from "@/lib/utils";

/**
 * The submission composer (v2 Phase 10).
 *
 * v1 asked for prose and, optionally, one image. This asks what *kind* of thing
 * the member made first, then shows only the fields that format needs — which
 * is both less to fill in and the only way the approval step can know whether
 * it is publishing an article, a photo set, a recording or a link.
 */
export function SubmissionForm() {
  const [state, action, pending] = useActionState(submitFanContent, undefined);
  const [format, setFormat] = useState("article");
  const [attachments, setAttachments] = useState([]);
  const [chars, setChars] = useState(0);
  const [embedUrl, setEmbedUrl] = useState("");

  useEffect(() => {
    if (state?.success && state.message) toast.success(state.message);
    else if (state?.message) toast.error(state.message);
  }, [state]);

  const spec = FORMAT_SPECS[format];

  // Recognising the link as the member types is worth more than validating it
  // after a failed submit — they can see straight away that we know the
  // platform, or that we don't.
  const embed = useMemo(
    () => (embedUrl.trim() ? parseEmbed(embedUrl) : null),
    [embedUrl],
  );

  const uploading = attachments.some((item) => item.status === "uploading");

  function changeFormat(next) {
    setFormat(next);
    // A photo set's images are not a video file. Switching format discards what
    // no longer applies rather than smuggling it into the manifest.
    setAttachments([]);
  }

  if (state?.success) {
    return (
      <div className="flex items-start gap-3 border border-[var(--spot-2)]/35 bg-[var(--spot-2-wash)] p-6">
        <CheckCircle2
          className="mt-0.5 h-5 w-5 shrink-0 text-[var(--spot-2)]"
          aria-hidden
        />

        <div>
          <p className="font-semibold text-[var(--ink)]">Submission received</p>
          <p className="mt-1.5 text-[0.9rem] leading-relaxed text-[var(--ink-soft)]">
            {state.message} You&apos;ll see it on your channel once it&apos;s
            approved.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            Submit another
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-7">
      {/* The manifest of finished uploads. The files themselves went straight to
           Cloudinary; this is the receipt the action verifies. */}
      <input
        type="hidden"
        name="attachments"
        value={JSON.stringify(attachmentManifest(attachments))}
      />

      <input type="hidden" name="format" value={format} />

      {/* ── Format ── */}
      <fieldset className="flex flex-col gap-3">
        <legend className="mb-1 font-mono text-[0.7rem] uppercase tracking-[0.18em] text-[var(--ink-soft)]">
          What are you sending?
        </legend>

        <div className="grid gap-2 sm:grid-cols-2">
          {SUBMISSION_FORMATS.map((candidate) => {
            const option = FORMAT_SPECS[candidate];
            const active = candidate === format;
            return (
              <label
                key={candidate}
                className={cn(
                  "flex cursor-pointer flex-col gap-1 border p-4 transition-all duration-150",
                  active
                    ? "border-[var(--spot)] bg-[var(--paper)] shadow-[0_0_24px_color-mix(in_oklch,var(--n1)_45%,transparent)]"
                    : "border-[var(--rule-strong)] bg-[var(--paper-2)] hover:border-[var(--edge)]",
                )}
              >
                <span className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="formatChoice"
                    value={candidate}
                    checked={active}
                    onChange={() => changeFormat(candidate)}
                    className="h-3.5 w-3.5 accent-[var(--spot)]"
                  />

                  <span className="font-display text-[1rem] font-bold">
                    {option.label}
                  </span>
                </span>
                <span className="pl-[1.35rem] text-[0.82rem] leading-relaxed text-[var(--ink-soft)]">
                  {option.blurb}
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <Input
        label="Title"
        name="title"
        required
        maxLength={120}
        placeholder="What are you writing about?"
        error={state?.errors?.title}
      />

      <Select
        label="Channel"
        name="category"
        required
        error={state?.errors?.category}
      >
        <option value="">Pick a channel…</option>
        {CATEGORIES.map((category) => (
          <option key={category.slug} value={category.slug}>
            {category.name}
          </option>
        ))}
      </Select>

      {/* ── Format-specific media ── */}
      {format === "embed" ? (
        <Field
          label="Link"
          htmlFor="embed-url"
          error={state?.errors?.embedUrl}
          hint={`We can embed ${supportedProviderList()}. Nothing is copied to our servers — the platform keeps hosting it.`}
        >
          <div className="relative">
            <Link2
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--ink-faint)]"
              aria-hidden
            />

            <input
              id="embed-url"
              name="embedUrl"
              value={embedUrl}
              onChange={(event) => setEmbedUrl(event.target.value)}
              maxLength={400}
              placeholder="https://youtube.com/watch?v=…"
              aria-invalid={Boolean(state?.errors?.embedUrl)}
              className="w-full rounded-2xl border border-[var(--edge)] bg-[var(--paper-2)] py-3 pl-10 pr-4 text-[0.95rem] placeholder:text-[var(--ink-faint)] focus:border-[var(--spot)] focus:bg-[var(--paper)] focus:outline-none"
            />
          </div>

          {embedUrl.trim() &&
            (embed ? (
              <p className="flex items-center gap-2 border-l-2 border-[var(--spot-2)] bg-[var(--spot-2-wash)] px-3 py-2 text-[0.82rem]">
                <CheckCircle2
                  className="h-3.5 w-3.5 shrink-0 text-[var(--spot-2)]"
                  aria-hidden
                />
                Recognised as {PROVIDER_SPECS[embed.provider].label}.
              </p>
            ) : (
              <p className="border-l-2 border-[var(--spot)] bg-[var(--spot)]/8 px-3 py-2 text-[0.82rem] text-[var(--ink-soft)]">
                That isn&apos;t a link we can embed. Try a{" "}
                {Object.values(PROVIDER_SPECS)
                  .map((provider) => provider.example)
                  .join(", ")}{" "}
                URL.
              </p>
            ))}
        </Field>
      ) : (
        spec.uploadKind && (
          <MediaUploader
            // Remounting on format change clears state the new format can't use.
            key={format}
            kind={spec.uploadKind}
            multiple={spec.multiple}
            max={spec.multiple ? GALLERY_MAX : 1}
            captions={spec.multiple}
            label={
              format === "article"
                ? "Cover image (optional)"
                : format === "gallery"
                  ? "Your photos"
                  : format === "audio"
                    ? "Audio file"
                    : "Video file"
            }
            hint={
              format === "article"
                ? "Only upload an image you have the right to use."
                : undefined
            }
            error={state?.errors?.attachments}
            onChange={setAttachments}
          />
        )
      )}

      <Textarea
        label={format === "article" ? "Your piece" : "Context"}
        name="body"
        required
        rows={format === "article" ? 14 : 6}
        onChange={(event) => setChars(event.target.value.trim().length)}
        placeholder={
          format === "article"
            ? "Write it as you'd want to read it. Separate paragraphs with a blank line."
            : "What is this, and what should a reader know before they press play?"
        }
        error={state?.errors?.body}
        hint={
          chars < spec.minBody
            ? `${chars} / ${spec.minBody} characters minimum`
            : `${chars} characters — ready to submit`
        }
      />

      {/* Transcripts serve readers who can't use the audio, and they make
           spoken content findable in search, which a media file never is. */}
      {(format === "audio" || format === "video") && (
        <Textarea
          label="Transcript (optional)"
          name="transcript"
          rows={5}
          maxLength={30_000}
          placeholder="Paste or type what's said, so the piece can be read as well as heard."
          hint="Strongly encouraged. It's how anyone who can't play the audio reads your work — and how search finds it."
          error={state?.errors?.transcript}
        />
      )}

      {/* ── Rights declaration ── */}
      {spec.requiresOwnWork && (
        <div
          className={cn(
            "flex items-start gap-3 border p-4",
            state?.errors?.ownWork
              ? "border-[var(--spot)] bg-[var(--spot)]/8"
              : "border-[var(--rule-strong)] bg-[var(--paper-2)]",
          )}
        >
          <ShieldCheck
            className="mt-0.5 h-4 w-4 shrink-0 text-[var(--ink-soft)]"
            aria-hidden
          />

          <div className="flex flex-col gap-1.5">
            <label className="flex items-start gap-2.5 text-[0.88rem] font-medium">
              <input
                type="checkbox"
                name="ownWork"
                className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--spot)]"
              />

              <span>
                I made this myself, and I&apos;m happy for Fan Hub Plus to
                publish it.
              </span>
            </label>
            <p className="pl-[1.6rem] text-[0.8rem] leading-relaxed text-[var(--ink-faint)]">
              Uploads are for your own work — your photos, your recording, your
              edit. To share something a studio or label made, use{" "}
              <strong>Link to a platform</strong> instead, so it stays hosted
              where it&apos;s licensed.
            </p>
            {state?.errors?.ownWork && (
              <p
                role="alert"
                className="pl-[1.6rem] text-[0.82rem] font-medium text-[var(--spot)]"
              >
                {state.errors.ownWork}
              </p>
            )}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between gap-4 border-t border-[var(--rule)] pt-6">
        <p className="text-[0.82rem] leading-relaxed text-[var(--ink-faint)]">
          {uploading
            ? "Waiting for your upload to finish…"
            : "Submissions are reviewed by an administrator before they appear."}
        </p>
        <Button type="submit" size="lg" loading={pending} disabled={uploading}>
          Submit for review
        </Button>
      </div>
    </form>
  );
}
