import { useState, useTransition } from "react";
import { Link } from "react-router";
import { Image } from "@/components/ui/image";
import { Pencil, Check, X, Bookmark } from "lucide-react";
import { toast } from "react-toastify";

import { updateBookmarkNote, toggleBookmark } from "@/actions/bookmarks";
import { categoryBySlug } from "@/lib/constants";
import { relativeTime, cn } from "@/lib/utils";

const MAX_NOTE = 500;

/**
 * One saved clipping, with its private note (SRS FR-9).
 *
 * The note editor is inline rather than a modal — a note is a small thing and
 * a dialog would be heavier than the task deserves.
 */
export function ClippingRow({ row }) {
  const category = categoryBySlug(row.category);
  const ink = `var(--ch-${category?.token ?? "anime"})`;

  const [note, setNote] = useState(row.note);
  const [draft, setDraft] = useState(row.note);
  const [editing, setEditing] = useState(false);
  const [removed, setRemoved] = useState(false);
  const [isPending, startTransition] = useTransition();

  function save() {
    startTransition(async () => {
      const result = await updateBookmarkNote(row.bookmarkId, draft);
      if (result.ok) {
        setNote(draft.trim());
        setEditing(false);
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    });
  }

  function remove() {
    setRemoved(true);
    startTransition(async () => {
      const result = await toggleBookmark(
        row.targetType,
        row.targetId,
        "/bookmarks",
      );
      if (result.ok) toast.success(result.message);
      else {
        setRemoved(false);
        toast.error(result.message);
      }
    });
  }

  // Keep the row in place while the revalidation lands, but show it as gone.
  if (removed) {
    return (
      <li className="border-b border-[var(--rule)] py-4 opacity-40">
        <p className="font-mono text-[0.68rem] uppercase tracking-[0.14em] text-[var(--ink-faint)]">
          Removed — {row.title}
        </p>
      </li>
    );
  }

  return (
    <li className="border-b border-[var(--rule)] py-4">
      <div className="flex gap-4">
        <Link
          to={row.href}
          className="relative hidden h-20 w-24 shrink-0 overflow-hidden rounded-2xl border border-[var(--edge)] sm:block"
        >
          {row.imageUrl && (
            <Image
              src={row.imageUrl}
              alt=""
              fill
              sizes="96px"
              className="plate object-cover"
            />
          )}
          <span
            aria-hidden
            className="absolute inset-0 mix-blend-multiply dark:mix-blend-screen"
            style={{ background: ink, opacity: 0.5 }}
          />
        </Link>

        <div className="min-w-0 flex-1">
          <p className="flex flex-wrap items-center gap-2 font-mono text-[0.6rem] uppercase tracking-[0.14em] text-[var(--ink-faint)]">
            <span
              aria-hidden
              className="h-2.5 w-2.5"
              style={{ background: ink }}
            />

            {category?.name}
            <span className="border border-[var(--rule-strong)] px-1.5 py-0.5">
              {row.kindLabel}
            </span>
            <span>clipped {relativeTime(row.savedAt)}</span>
          </p>

          <Link to={row.href} className="group mt-1 block">
            <h3 className="font-display text-[1.04rem] leading-[0.95] transition-colors group-hover:text-[var(--spot-deep)]">
              {row.title}
            </h3>
          </Link>

          <p className="mt-1.5 line-clamp-2 text-[0.88rem] leading-snug text-[var(--ink-soft)]">
            {row.summary}
          </p>

          {/* Note */}
          {editing ? (
            <div className="mt-3">
              <label className="sr-only" htmlFor={`note-${row.bookmarkId}`}>
                Your note
              </label>
              <textarea
                id={`note-${row.bookmarkId}`}
                value={draft}
                maxLength={MAX_NOTE}
                onChange={(event) => setDraft(event.target.value)}
                rows={3}
                placeholder="Why did you keep this?"
                className="w-full rounded-2xl border border-[var(--edge)] bg-[var(--paper-2)] p-3 text-[0.9rem] text-[var(--ink)] placeholder:text-[var(--ink-faint)] focus:outline-none"
              />

              <div className="mt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={save}
                  disabled={isPending}
                  className="inline-flex items-center gap-1.5 rounded-2xl border border-[var(--edge)] bg-[var(--spot)] px-3 py-1.5 font-mono text-[0.64rem] uppercase tracking-[0.13em] text-[var(--void)] disabled:opacity-60"
                >
                  <Check className="h-3.5 w-3.5" aria-hidden />
                  Save note
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDraft(note);
                    setEditing(false);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-2xl border border-[var(--edge)] px-3 py-1.5 font-mono text-[0.64rem] uppercase tracking-[0.13em]"
                >
                  <X className="h-3.5 w-3.5" aria-hidden />
                  Cancel
                </button>
                <span className="ml-auto font-mono text-[0.62rem] tabular-nums text-[var(--ink-faint)]">
                  {draft.length}/{MAX_NOTE}
                </span>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setEditing(true)}
              className={cn(
                "mt-3 flex w-full items-start gap-2 border-l-4 py-1 pl-3 text-left transition-colors",
                note
                  ? "border-[var(--spot)] text-[var(--ink)]"
                  : "border-[var(--rule-strong)] text-[var(--ink-faint)] hover:text-[var(--ink-soft)]",
              )}
            >
              <Pencil className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
              <span className="text-[0.9rem] italic leading-snug">
                {note || "Add a private note…"}
              </span>
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={remove}
          disabled={isPending}
          aria-label={`Remove ${row.title} from clippings`}
          title="Remove save"
          className="grid h-9 w-9 shrink-0 self-start place-items-center rounded-2xl border border-[var(--edge)] transition-colors hover:bg-[var(--spot)] hover:text-[var(--void)] disabled:opacity-60"
        >
          <Bookmark className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </li>
  );
}
