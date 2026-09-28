import { Link } from "react-router";
import { Image } from "@/components/ui/image";
import { FileText, Play, Headphones, ImageIcon, Star } from "lucide-react";

import { categoryBySlug } from "@/lib/constants";
import { formatDate, cn } from "@/lib/utils";

const TYPE_ICON = {
  article: FileText,
  video: Play,
  audio: Headphones,
  image: ImageIcon,
};

/**
 * A tile on the board.
 *
 * The art fills the card and the copy sits on top of it, held legible by a
 * gradient that runs from clear at the top to near-opaque at the foot —
 * cheaper than a scrim over the whole image, and it keeps the subject's face
 * visible. The channel's signal shows as a badge and, on hover, as the card's
 * own edge and glow.
 */
export function ContentCard({ item, priority = false, index = 0, className }) {
  const category = categoryBySlug(item.category);
  const Icon = TYPE_ICON[item.type] ?? FileText;
  const ink = `var(--ch-${category?.token ?? "anime"})`;

  return (
    <article className={cn("reveal group", className)}>
      <Link
        to={`/content/${item.slug}`}
        className="relative flex h-full min-h-[19rem] flex-col justify-end overflow-hidden rounded-[1.25rem] border border-[var(--edge)] bg-[var(--paper-2)] transition-[transform,border-color,box-shadow] duration-300 hover:-translate-y-1"
        style={{ ["--glow"]: ink }}
      >
        {item.coverImage && (
          <Image
            src={item.coverImage}
            alt=""
            fill
            priority={priority}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="plate object-cover transition-transform duration-700 group-hover:scale-105"
          />
        )}

        {/* Clear at the top, solid at the foot. */}
        <span
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, transparent 32%, color-mix(in oklch, var(--void) 92%, transparent))",
          }}
        />

        {/* The channel signal, lit, top left. */}
        <span
          className="absolute left-3.5 top-3.5 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[0.58rem] font-medium uppercase tracking-[0.14em] text-[var(--void)]"
          style={{
            background: ink,
            boxShadow: `0 0 14px color-mix(in oklch, ${ink} 45%, transparent)`,
          }}
        >
          <Icon className="h-3 w-3" aria-hidden />
          {item.type}
        </span>

        <span className="absolute right-3.5 top-3.5 rounded-full bg-[color-mix(in_oklch,var(--void)_70%,transparent)] px-2 py-0.5 font-mono text-[0.56rem] tabular-nums text-[var(--ink-soft)] backdrop-blur-sm">
          {String(index + 1).padStart(3, "0")}
        </span>

        <div className="relative z-10 flex flex-col gap-2 p-4">
          <p
            className="font-mono text-[0.56rem] uppercase tracking-[0.16em]"
            style={{ color: ink }}
          >
            {category?.name}
            {item.releaseDate && (
              <span className="text-[var(--ink-faint)]">
                {" "}
                · {formatDate(item.releaseDate)}
              </span>
            )}
          </p>

          <h3 className="font-display text-[1.02rem] font-bold leading-[1.15]">
            {item.title}
          </h3>

          <p className="line-clamp-2 text-[0.86rem] leading-snug text-[var(--ink-soft)]">
            {item.summary}
          </p>

          <div className="mt-1 flex items-center gap-3 font-mono text-[0.58rem] uppercase tracking-[0.12em] text-[var(--ink-faint)]">
            {item.ratingCount > 0 && (
              <span className="inline-flex items-center gap-1 tabular-nums">
                <Star
                  className="h-3 w-3 fill-current"
                  style={{ color: ink }}
                  aria-hidden
                />

                {item.averageRating.toFixed(1)}
              </span>
            )}
            <span className="tabular-nums">
              {item.viewCount.toLocaleString()} reads
            </span>
            {item.genre[0] && (
              <span className="ml-auto truncate">{item.genre[0]}</span>
            )}
          </div>
        </div>

        {/* The hover edge. Kept as its own layer so the colour can come from
             the channel without a second set of Tailwind arbitrary variants. */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[1.25rem] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            border: `1px solid ${ink}`,
            boxShadow: `0 0 28px color-mix(in oklch, ${ink} 35%, transparent)`,
          }}
        />
      </Link>
    </article>
  );
}
