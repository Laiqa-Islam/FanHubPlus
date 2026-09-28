import { useRef, useState } from "react";
import { Link } from "react-router";
import { Image } from "@/components/ui/image";
import { Play, ArrowUpRight } from "lucide-react";

import { categoryBySlug } from "@/lib/constants";
import { mediaSrc } from "@/lib/media";
import { Reveal } from "@/components/motion/reveal";
import { PressHeading } from "@/components/press";

/**
 * A poster that becomes the clip under the cursor.
 *
 * `src` is attached on first hover rather than in the markup: seven videos
 * on the front page is roughly forty megabytes, and `preload="none"` alone
 * would not stop a browser that decides to be helpful. Nothing is fetched
 * until someone shows interest in a specific one.
 *
 * Playback is muted and inline, which is what every browser requires before
 * it will let a video start without a click. Leaving the pointer rewinds to
 * the poster frame so the card is never left mid-shot.
 */
function HoverPreview({ video, className, sizes, priority = false }) {
  const ref = useRef(null);
  const [armed, setArmed] = useState(false);

  function start() {
    if (document.documentElement.dataset.reducedMotion === "true") return;
    setArmed(true);
    const node = ref.current;
    if (!node) return;
    if (!node.src) node.src = mediaSrc(video.mediaUrl);
    void node.play().catch(() => {
      // Autoplay refused (a data-saver profile, or a codec the browser will
      // not decode). The poster underneath is still the right picture.
    });
  }
  function stop() {
    const node = ref.current;
    if (!node) return;
    node.pause();
    node.currentTime = 0;
  }

  return (
    <div
      className={className}
      onPointerEnter={start}
      onPointerLeave={stop}
      onFocus={start}
      onBlur={stop}
    >
      {video.poster && (
        <Image
          src={video.poster}
          alt=""
          fill
          priority={priority}
          sizes={sizes}
          className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
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
 * The media shelf.
 *
 * The Multimedia Center is one of the app's better pages and the front page
 * never mentioned it. Seven clips with their own poster frames is the most
 * concretely *watchable* thing the site has, so it gets a lead slot and a
 * rail rather than a row of equal thumbnails.
 */
export function NowPlaying({ videos }) {
  if (videos.length === 0) return null;

  const [lead, ...rest] = videos;
  const leadInk = `var(--ch-${categoryBySlug(lead.category)?.token ?? "anime"})`;

  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          background:
            "radial-gradient(60% 50% at 20% 0%, var(--n1), transparent 70%), radial-gradient(50% 50% at 90% 100%, var(--n2), transparent 70%)",
        }}
      />

      <div className="relative mx-auto max-w-[88rem] px-5 py-16 sm:px-8">
        <PressHeading
          mark="Now playing"
          title="Press play"
          ghostInk="var(--n3)"
          action={
            <Link
              to="/media"
              className="group inline-flex items-center gap-2 font-mono text-[0.66rem] uppercase tracking-[0.16em] text-[var(--ink-soft)] transition-colors hover:text-[var(--n2)]"
            >
              Multimedia Center
              <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          }
        />

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]">
          <Reveal>
            <article className="reveal">
              <Link
                to={`/content/${lead.slug}`}
                className="group block overflow-hidden rounded-[1.75rem] border border-[var(--edge)] bg-[var(--paper-2)] transition-[border-color,box-shadow] duration-300 hover:border-[var(--edge-strong)]"
              >
                <HoverPreview
                  video={lead}
                  priority
                  sizes="(max-width: 1024px) 100vw, 55vw"
                  className="relative aspect-[16/9] overflow-hidden bg-[var(--void)]"
                />

                <div className="relative -mt-20 flex items-end justify-between gap-4 bg-gradient-to-t from-[var(--paper-2)] via-[var(--paper-2)] to-transparent p-6 pt-24">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2.5">
                      <span
                        className="rounded-full px-2.5 py-1 font-mono text-[0.56rem] font-bold uppercase tracking-[0.14em] text-[var(--void)]"
                        style={{ background: leadInk }}
                      >
                        {lead.tag}
                      </span>
                      <span className="font-mono text-[0.62rem] tabular-nums text-[var(--ink-faint)]">
                        {lead.runtime}
                      </span>
                    </div>
                    <h3 className="mt-3 font-display text-[clamp(1.2rem,2.6vw,1.9rem)] font-black leading-[1.08]">
                      {lead.title}
                    </h3>
                    <p className="mt-2 line-clamp-2 max-w-xl text-[0.92rem] leading-snug text-[var(--ink-soft)]">
                      {lead.summary}
                    </p>
                  </div>

                  <span
                    aria-hidden
                    className="hidden h-14 w-14 shrink-0 place-items-center rounded-full transition-transform duration-300 group-hover:scale-110 sm:grid"
                    style={{
                      background: leadInk,
                      color: "var(--void)",
                      boxShadow: `0 0 32px color-mix(in oklch, ${leadInk} 45%, transparent)`,
                    }}
                  >
                    <Play className="h-5 w-5 translate-x-px fill-current" />
                  </span>
                </div>
              </Link>
            </article>
          </Reveal>

          {/* The rail scrolls on its own below the lead on narrow screens and
               stacks beside it on wide ones, so six clips never push the
               section to twice the height of its own lead. */}
          <Reveal stagger={0.05} className="flex flex-col gap-3">
            {rest.map((video) => {
              const ink = `var(--ch-${categoryBySlug(video.category)?.token ?? "anime"})`;
              return (
                <Link
                  key={video.slug}
                  to={`/content/${video.slug}`}
                  className="reveal group flex items-center gap-4 overflow-hidden rounded-2xl border border-[var(--edge)] bg-[var(--paper-3)] p-2.5 transition-[transform,border-color] duration-300 hover:-translate-y-0.5 hover:border-[var(--edge-strong)]"
                >
                  <HoverPreview
                    video={video}
                    sizes="140px"
                    className="relative aspect-video w-[7.5rem] shrink-0 overflow-hidden rounded-xl bg-[var(--void)]"
                  />

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className="font-mono text-[0.54rem] font-bold uppercase tracking-[0.14em]"
                        style={{ color: ink }}
                      >
                        {video.tag}
                      </span>
                      <span className="font-mono text-[0.56rem] tabular-nums text-[var(--ink-faint)]">
                        {video.runtime}
                      </span>
                    </div>
                    <h4 className="mt-1 line-clamp-2 font-display text-[0.9rem] font-bold leading-[1.2]">
                      {video.title}
                    </h4>
                  </div>
                  <Play
                    className="mr-1 h-4 w-4 shrink-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                    style={{ color: ink }}
                    aria-hidden
                  />
                </Link>
              );
            })}
          </Reveal>
        </div>
      </div>
    </section>
  );
}
