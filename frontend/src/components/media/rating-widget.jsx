import { useState, useTransition } from "react";
import { Star, ThumbsUp, ThumbsDown } from "lucide-react";
import { toast } from "react-toastify";

import { rateContent } from "@/actions/ratings";
import { cn } from "@/lib/utils";

/**
 * Five-star rating with an optional thumb (SRS FR-5).
 *
 * Optimistic: the stars fill the moment they are clicked and roll back if the
 * server rejects the vote, so the control never feels laggy on a slow link.
 */
export function RatingWidget({
  contentId,
  initialAverage,
  initialCount,
  initialMine,
  canRate,
  ink = "var(--spot)",
}) {
  const [average, setAverage] = useState(initialAverage);
  const [count, setCount] = useState(initialCount);
  const [mine, setMine] = useState(initialMine);
  const [hover, setHover] = useState(null);
  const [thumb, setThumb] = useState(null);
  const [isPending, startTransition] = useTransition();

  function submit(stars, nextThumb = thumb) {
    if (!canRate) {
      toast.info("Sign in and confirm your email to rate this.");
      return;
    }

    const previous = { average, count, mine, thumb };
    // Optimistic update.
    setMine(stars);
    setThumb(nextThumb);

    startTransition(async () => {
      const result = await rateContent(contentId, stars, nextThumb);
      if (result.ok) {
        setAverage(result.average ?? average);
        setCount(result.count ?? count);
        toast.success(result.message);
      } else {
        setAverage(previous.average);
        setCount(previous.count);
        setMine(previous.mine);
        setThumb(previous.thumb);
        toast.error(result.message);
      }
    });
  }

  const shown = hover ?? mine ?? 0;

  return (
    <div className="rounded-2xl border border-[var(--edge)] bg-[var(--paper)] p-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="mark mb-2">Rate this</p>
          <div
            className="flex items-center gap-1"
            onMouseLeave={() => setHover(null)}
            role="radiogroup"
            aria-label="Star rating"
          >
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                role="radio"
                aria-checked={mine === star}
                aria-label={`${star} star${star > 1 ? "s" : ""}`}
                disabled={isPending}
                onMouseEnter={() => setHover(star)}
                onFocus={() => setHover(star)}
                onBlur={() => setHover(null)}
                onClick={() => submit(star)}
                className="p-0.5 transition-transform duration-150 hover:scale-125 disabled:opacity-60"
              >
                <Star
                  className={cn(
                    "h-7 w-7 transition-colors",
                    star <= shown && "fill-current",
                  )}
                  style={{ color: star <= shown ? ink : "var(--rule-strong)" }}
                  aria-hidden
                />
              </button>
            ))}
          </div>
        </div>

        <div className="text-right">
          <p className="font-display text-[2.4rem] leading-none tabular-nums">
            {average > 0 ? average.toFixed(1) : "—"}
          </p>
          <p className="mark !text-[0.6rem]">
            {count} {count === 1 ? "rating" : "ratings"}
          </p>
        </div>
      </div>

      {/* Thumbs are a secondary signal and only apply once a star is given. */}
      <div className="mt-4 flex items-center gap-2 border-t border-[var(--rule)] pt-4">
        <span className="mark !text-[0.6rem] mr-1">Worth it?</span>
        {["up", "down"].map((value) => {
          const Icon = value === "up" ? ThumbsUp : ThumbsDown;
          return (
            <button
              key={value}
              type="button"
              aria-pressed={thumb === value}
              aria-label={value === "up" ? "Thumbs up" : "Thumbs down"}
              disabled={isPending}
              onClick={() => submit(mine ?? (value === "up" ? 4 : 2), value)}
              className={cn(
                "grid h-9 w-9 place-items-center rounded-2xl border border-[var(--edge)] transition-colors",
                thumb === value
                  ? "text-[var(--void)]"
                  : "hover:bg-[var(--paper-2)]",
              )}
              style={thumb === value ? { background: ink } : undefined}
            >
              <Icon className="h-4 w-4" aria-hidden />
            </button>
          );
        })}

        {mine !== null && (
          <span className="ml-auto font-mono text-[0.64rem] uppercase tracking-[0.14em] text-[var(--ink-faint)]">
            You gave {mine}★
          </span>
        )}
      </div>

      {!canRate && (
        <p className="mt-3 text-[0.82rem] text-[var(--ink-faint)]">
          Sign in with a confirmed email address to rate.
        </p>
      )}
    </div>
  );
}
