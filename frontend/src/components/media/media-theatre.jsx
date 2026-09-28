import { useCallback, useMemo, useRef, useState } from "react";
import { Link } from "react-router";
import { Image } from "@/components/ui/image";
import {
  Play,
  Headphones,
  ImageIcon,
  Clock,
  ArrowUpRight,
  ListVideo,
} from "lucide-react";

import { categoryBySlug } from "@/lib/constants";
import { mediaSrc } from "@/lib/media";
import { VideoPlayer } from "@/components/media/video-player";
import { AudioPlayer } from "@/components/media/audio-player";
import { Reveal } from "@/components/motion/reveal";
import { cn } from "@/lib/utils";

const TYPE_ICON = {
  video: Play,
  audio: Headphones,
  image: ImageIcon,
};

function iconFor(type) {
  return TYPE_ICON[type] ?? Play;
}

function inkFor(category) {
  return `var(--ch-${categoryBySlug(category)?.token ?? "anime"})`;
}

/**
 * A poster that plays its own clip under the cursor.
 *
 * `src` is attached on first hover rather than in the markup — nineteen
 * cards on one page is far more video than anyone will watch, and
 * `preload="none"` alone does not stop a browser that decides to be helpful.
 */
function HoverPreview({ item, className }) {
  const ref = useRef(null);
  const [armed, setArmed] = useState(false);
  const poster = item.mediaPoster || item.coverImage;

  const start = useCallback(() => {
    if (item.type !== "video" || !item.mediaUrl) return;
    if (document.documentElement.dataset.reducedMotion === "true") return;
    setArmed(true);
    const node = ref.current;
    if (!node) return;
    if (!node.src) node.src = mediaSrc(item.mediaUrl);
    void node.play().catch(() => {});
  }, [item.type, item.mediaUrl]);

  const stop = useCallback(() => {
    const node = ref.current;
    if (!node) return;
    node.pause();
    node.currentTime = 0;
  }, []);

  // Video posters are frames lifted from the clip, so they are already 16:9
  // and fill the plate exactly. Audio and gallery pieces carry portrait cover
  // art, and cropping a book cover to 16:9 leaves a thin band from its middle
  // — which on dark art read as an empty black rectangle. Those are shown
  // whole, over a blurred, over-scaled copy of themselves that fills the rest
  // of the frame.
  const letterbox = item.type !== "video";

  return (
    <div className={className} onPointerEnter={start} onPointerLeave={stop}>
      {poster && letterbox && (
        <Image
          src={poster}
          alt=""
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          aria-hidden
          className="scale-125 object-cover blur-2xl saturate-150"
        />
      )}
      {poster && (
        <Image
          src={poster}
          alt=""
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className={cn(
            "transition-transform duration-500 group-hover:scale-[1.04]",
            letterbox ? "object-contain" : "object-cover",
          )}
        />
      )}
      {armed && (
        <video
          ref={ref}
          muted
          loop
          playsInline
          preload="none"
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}
    </div>
  );
}

/**
 * The Multimedia Center, as an actual player rather than a catalogue.
 *
 * The page used to be a grid of cards carrying big lit play buttons that
 * navigated to an article instead of playing anything — only the one
 * featured reel at the top could be watched, and the Listen tab offered five
 * tracks that could not be listened to. Every card now loads into the
 * theatre in place, the queue advances by itself when something finishes,
 * and the link out to the written piece is a separate, smaller target.
 */
export function MediaTheatre({ items }) {
  const playable = useMemo(
    () => items.filter((item) => item.mediaUrl || item.type === "image"),
    [items],
  );

  const [currentId, setCurrentId] = useState(
    () => playable.find((item) => item.mediaUrl)?.id ?? playable[0]?.id ?? "",
  );
  // Only true once the viewer has chosen something; the first item should
  // not start playing on its own the moment the page opens.
  const [autoPlay, setAutoPlay] = useState(false);
  const stageRef = useRef(null);

  const index = playable.findIndex((item) => item.id === currentId);
  const current = playable[index] ?? playable[0];

  const select = useCallback((id, { scroll = false } = {}) => {
    setCurrentId(id);
    setAutoPlay(true);
    if (scroll) {
      stageRef.current?.scrollIntoView({
        behavior:
          document.documentElement.dataset.reducedMotion === "true"
            ? "auto"
            : "smooth",
        block: "start",
      });
    }
  }, []);

  // What follows the current item, wrapping so the shelf never dead-ends.
  const queue = useMemo(() => {
    if (playable.length < 2 || index < 0) return [];
    return [...playable.slice(index + 1), ...playable.slice(0, index)];
  }, [playable, index]);

  const advance = useCallback(() => {
    if (queue.length > 0) select(queue[0].id);
  }, [queue, select]);

  if (!current) {
    return (
      <p className="rounded-2xl border border-dashed border-[var(--edge-strong)] px-6 py-16 text-center text-[var(--ink-soft)]">
        Nothing in this format yet.
      </p>
    );
  }

  const ink = inkFor(current.category);
  const category = categoryBySlug(current.category);

  return (
    <>
      <section ref={stageRef} className="mb-16 scroll-mt-24">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.62fr)_minmax(0,1fr)] lg:items-start">
          <div className="min-w-0">
            {/* Keyed by id so switching tracks gives each source a clean
                 player rather than inheriting the last one's progress bar. */}
            {current.type === "video" && current.mediaUrl && (
              <VideoPlayer
                key={current.id}
                src={mediaSrc(current.mediaUrl)}
                poster={current.mediaPoster || current.coverImage}
                title={current.title}
                ink={ink}
                autoPlay={autoPlay}
                onEnded={advance}
              />
            )}

            {current.type === "audio" && current.mediaUrl && (
              <div className="overflow-hidden rounded-[1.5rem] border border-[var(--edge)] bg-[var(--paper-2)]">
                <div className="relative aspect-[16/7] overflow-hidden">
                  {(current.mediaPoster || current.coverImage) && (
                    <>
                      <Image
                        src={current.mediaPoster || current.coverImage}
                        alt=""
                        fill
                        sizes="(max-width: 1024px) 100vw, 60vw"
                        aria-hidden
                        className="scale-125 object-cover blur-2xl saturate-150"
                      />

                      <Image
                        src={current.mediaPoster || current.coverImage}
                        alt=""
                        fill
                        sizes="(max-width: 1024px) 100vw, 60vw"
                        className="object-contain"
                      />
                    </>
                  )}
                  <span
                    aria-hidden
                    className="absolute inset-0"
                    style={{
                      background:
                        "linear-gradient(to top, var(--paper-2) 8%, color-mix(in oklch, var(--void) 45%, transparent) 70%)",
                    }}
                  />

                  <span
                    aria-hidden
                    className="absolute inset-0 opacity-35 mix-blend-soft-light"
                    style={{ background: ink }}
                  />
                </div>
                <div className="p-4">
                  <AudioPlayer
                    key={current.id}
                    src={mediaSrc(current.mediaUrl)}
                    title={current.title}
                    ink={ink}
                    autoPlay={autoPlay}
                    onEnded={advance}
                  />
                </div>
              </div>
            )}

            {current.type === "image" && (
              <div className="relative aspect-video overflow-hidden rounded-[1.5rem] border border-[var(--edge)] bg-[var(--void)]">
                {(current.mediaPoster || current.coverImage) && (
                  <>
                    <Image
                      src={current.mediaPoster || current.coverImage}
                      alt=""
                      fill
                      sizes="(max-width: 1024px) 100vw, 60vw"
                      aria-hidden
                      className="scale-125 object-cover blur-2xl saturate-150"
                    />

                    <Image
                      src={current.mediaPoster || current.coverImage}
                      alt={current.title}
                      fill
                      sizes="(max-width: 1024px) 100vw, 60vw"
                      className="object-contain"
                    />
                  </>
                )}
              </div>
            )}
          </div>

          <div className="min-w-0">
            <p className="mark mb-3 text-[var(--n3)]">
              {current.type === "audio"
                ? "Now playing"
                : current.type === "image"
                  ? "Now showing"
                  : "Now screening"}
            </p>

            <div className="mb-3 flex flex-wrap items-center gap-2.5">
              <span
                className="rounded-full px-2.5 py-1 font-mono text-[0.56rem] font-bold uppercase tracking-[0.14em] text-[var(--void)]"
                style={{ background: ink }}
              >
                {category?.name}
              </span>
              {current.mediaRuntime && (
                <span className="inline-flex items-center gap-1 font-mono text-[0.62rem] tabular-nums text-[var(--ink-faint)]">
                  <Clock className="h-3 w-3" aria-hidden />
                  {current.mediaRuntime}
                </span>
              )}
              {current.ratingCount > 0 && (
                <span className="font-mono text-[0.62rem] text-[var(--ink-faint)]">
                  {current.averageRating.toFixed(1)}★ · {current.ratingCount}{" "}
                  ratings
                </span>
              )}
            </div>

            <h2 className="font-display text-[clamp(1.2rem,2.8vw,1.75rem)] font-bold leading-[1.05]">
              {current.title}
            </h2>
            <p className="mt-4 text-[1rem] leading-relaxed text-[var(--ink-soft)]">
              {current.summary}
            </p>

            {current.mediaTags.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-2">
                {current.mediaTags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-[var(--edge)] px-2.5 py-1 font-mono text-[0.58rem] uppercase tracking-[0.14em] text-[var(--ink-soft)]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {current.mediaCredit && (
              <p className="mt-5 border-t border-[var(--rule)] pt-3 font-mono text-[0.62rem] leading-relaxed text-[var(--ink-faint)]">
                {current.mediaCredit}
              </p>
            )}

            <Link
              to={`/content/${current.slug}`}
              className="group mt-5 inline-flex items-center gap-1.5 font-mono text-[0.64rem] uppercase tracking-[0.16em] text-[var(--n2)] transition-colors hover:text-[var(--n1)]"
            >
              Read the full piece
              <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>

            {queue.length > 0 && (
              <div className="mt-8">
                <p className="mb-3 flex items-center gap-2 font-mono text-[0.58rem] uppercase tracking-[0.18em] text-[var(--ink-faint)]">
                  <ListVideo className="h-3.5 w-3.5" aria-hidden />
                  Up next
                </p>
                <ul className="flex flex-col gap-1.5">
                  {queue.slice(0, 4).map((item) => {
                    const Icon = iconFor(item.type);
                    const itemInk = inkFor(item.category);
                    return (
                      <li key={item.id}>
                        <button
                          type="button"
                          onClick={() => select(item.id)}
                          className="group flex w-full items-center gap-3 rounded-xl border border-transparent p-2 text-left transition-colors hover:border-[var(--edge)] hover:bg-[var(--paper-2)]"
                        >
                          <span
                            className="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-[var(--void)]"
                            style={{ background: itemInk }}
                          >
                            <Icon
                              className="h-3 w-3 fill-current"
                              aria-hidden
                            />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate font-display text-[0.82rem] font-bold leading-none">
                              {item.title}
                            </span>
                          </span>
                          {item.mediaRuntime && (
                            <span className="shrink-0 font-mono text-[0.56rem] tabular-nums text-[var(--ink-faint)]">
                              {item.mediaRuntime}
                            </span>
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>
        </div>
      </section>

      <Reveal
        stagger={0.04}
        className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
      >
        {items.map((item, position) => {
          const Icon = iconFor(item.type);
          const itemInk = inkFor(item.category);
          const itemCategory = categoryBySlug(item.category);
          const isCurrent = item.id === current.id;
          const canPlay = Boolean(item.mediaUrl) || item.type === "image";

          return (
            <article
              key={item.id}
              className={cn(
                "reveal group relative flex flex-col overflow-hidden rounded-[1.25rem] border bg-[var(--paper-3)] transition-[transform,border-color] duration-300 hover:-translate-y-1",
                isCurrent ? "border-transparent" : "border-[var(--edge)]",
              )}
              style={
                isCurrent
                  ? {
                      borderColor: itemInk,
                      boxShadow: `0 0 26px color-mix(in oklch, ${itemInk} 26%, transparent)`,
                    }
                  : undefined
              }
            >
              {/* The whole plate is the play control. It used to be a link to
                   the article, which made a lit play button navigate away
                   from the page instead of playing anything. */}
              <button
                type="button"
                onClick={() => canPlay && select(item.id, { scroll: true })}
                disabled={!canPlay}
                aria-label={`Play ${item.title}`}
                className="relative block aspect-video w-full overflow-hidden bg-[var(--void)] disabled:cursor-default"
              >
                <HoverPreview item={item} className="absolute inset-0" />

                <span
                  aria-hidden
                  className="absolute inset-0 opacity-30 mix-blend-soft-light transition-opacity duration-300 group-hover:opacity-0"
                  style={{ background: itemInk }}
                />

                {canPlay && (
                  <span className="absolute inset-0 grid place-items-center">
                    <span
                      className="grid h-14 w-14 place-items-center rounded-full text-[var(--void)] transition-transform duration-200 group-hover:scale-110"
                      style={{
                        background: itemInk,
                        boxShadow: `0 0 28px color-mix(in oklch, ${itemInk} 60%, transparent)`,
                      }}
                    >
                      <Icon className="h-5 w-5 fill-current" aria-hidden />
                    </span>
                  </span>
                )}

                {item.mediaRuntime && (
                  <span className="absolute bottom-2.5 right-2.5 rounded-full bg-[color-mix(in_oklch,var(--void)_75%,transparent)] px-2 py-0.5 font-mono text-[0.56rem] tabular-nums text-[var(--ink-soft)] backdrop-blur-sm">
                    <Clock className="mr-1 inline h-2.5 w-2.5" aria-hidden />
                    {item.mediaRuntime}
                  </span>
                )}

                <span className="absolute left-2.5 top-2.5 rounded-full bg-[color-mix(in_oklch,var(--void)_75%,transparent)] px-2 py-0.5 font-mono text-[0.56rem] tabular-nums text-[var(--ink-soft)] backdrop-blur-sm">
                  {isCurrent
                    ? "PLAYING"
                    : String(position + 1).padStart(2, "0")}
                </span>
              </button>

              <div className="flex flex-1 flex-col p-4">
                <p
                  className="mark mb-2 !text-[0.58rem]"
                  style={{ color: itemInk }}
                >
                  {itemCategory?.name} · {item.type}
                </p>
                <h3 className="font-display text-[0.95rem] font-bold leading-[1.15]">
                  {item.title}
                </h3>
                <p className="mt-2 line-clamp-2 text-[0.88rem] leading-snug text-[var(--ink-soft)]">
                  {item.summary}
                </p>

                <div className="mt-auto flex items-center justify-between gap-3 pt-3">
                  {item.ratingCount > 0 ? (
                    <span className="font-mono text-[0.62rem] uppercase tracking-[0.12em] text-[var(--ink-faint)]">
                      {item.averageRating.toFixed(1)}★ · {item.ratingCount}
                    </span>
                  ) : (
                    <span />
                  )}
                  {/* Reading the piece is still one click, just no longer the
                       thing a play button does. */}
                  <Link
                    to={`/content/${item.slug}`}
                    className="inline-flex items-center gap-1 font-mono text-[0.58rem] uppercase tracking-[0.14em] text-[var(--ink-faint)] transition-colors hover:text-[var(--n2)]"
                  >
                    Read
                    <ArrowUpRight className="h-3 w-3" aria-hidden />
                  </Link>
                </div>
              </div>
            </article>
          );
        })}
      </Reveal>
    </>
  );
}
