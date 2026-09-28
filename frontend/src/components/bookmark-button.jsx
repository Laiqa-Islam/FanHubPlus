import { useState, useTransition } from "react";
import { usePathname } from "@/lib/navigation";
import { Bookmark, Check } from "lucide-react";
import { toast } from "react-toastify";

import { toggleBookmark } from "@/actions/bookmarks";
import { cn } from "@/lib/utils";

/**
 * Save / unsave control (SRS FR-9).
 *
 * "Save" rather than "bookmark": the interface is a board of live drops, and
 * you keep something off a board rather than marking your place in it.
 *
 * Optimistic: the state flips immediately and rolls back if the server
 * refuses, so the button never feels laggy.
 */
export function BookmarkButton({
  targetType,
  targetId,
  initialBookmarked,
  signedIn,
  variant = "button",
  className,
}) {
  const [clipped, setClipped] = useState(initialBookmarked);
  const [isPending, startTransition] = useTransition();
  const pathname = usePathname();

  function handle(event) {
    // Cards wrap the button in a link; clipping must not navigate.
    event.preventDefault();
    event.stopPropagation();

    if (!signedIn) {
      toast.info("Sign in to save this for later.");
      return;
    }

    const previous = clipped;
    setClipped(!previous);

    startTransition(async () => {
      const result = await toggleBookmark(targetType, targetId, pathname);
      if (result.ok) {
        setClipped(result.bookmarked);
        toast.success(result.message);
      } else {
        setClipped(previous);
        toast.error(result.message);
      }
    });
  }

  const label = clipped ? "Remove from your saves" : "Save for later";

  if (variant === "icon") {
    return (
      <button
        type="button"
        onClick={handle}
        disabled={isPending}
        aria-pressed={clipped}
        aria-label={label}
        title={label}
        className={cn(
          "grid h-8 w-8 place-items-center rounded-2xl border border-[var(--edge)] transition-colors disabled:opacity-60",
          clipped
            ? "bg-[var(--spot)] text-[var(--void)]"
            : "bg-[var(--paper)] text-[var(--ink)] hover:bg-[var(--paper-2)]",
          className,
        )}
      >
        {clipped ? (
          <Check className="h-4 w-4" aria-hidden />
        ) : (
          <Bookmark className="h-4 w-4" aria-hidden />
        )}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handle}
      disabled={isPending}
      aria-pressed={clipped}
      className={cn(
        "inline-flex items-center gap-2 rounded-2xl border border-[var(--edge)] px-4 py-2 font-mono text-[0.7rem] font-semibold uppercase tracking-[0.14em] transition-[transform,box-shadow,background-color] duration-150 hover:-translate-y-[2px] hover:shadow-[var(--lift-md)] disabled:opacity-60",
        clipped
          ? "bg-[var(--spot)] text-[var(--void)]"
          : "bg-[var(--paper)] text-[var(--ink)]",
        className,
      )}
    >
      {clipped ? (
        <Check className="h-3.5 w-3.5" aria-hidden />
      ) : (
        <Bookmark className="h-3.5 w-3.5" aria-hidden />
      )}
      {clipped ? "Saved" : "Save this"}
    </button>
  );
}
