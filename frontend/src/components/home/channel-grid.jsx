import { Link } from "react-router";
import { Image } from "@/components/ui/image";
import { ArrowUpRight } from "lucide-react";

import { categoryBySlug } from "@/lib/constants";
import { Reveal } from "@/components/motion/reveal";
import { PressHeading } from "@/components/press";
import { ContentCard } from "@/components/content-card";
import { Duotone } from "@/components/duotone";
import { formatDate } from "@/lib/utils";

/**
 * Latest drops: one lead set large against its own art, the rest as a list
 * and then a row of tiles.
 *
 * A uniform grid of equal cards gives every piece the same weight and reads
 * as a template. Ranking the contents is what makes it a board rather than a
 * feed — the lead gets the plate, everything else is sized accordingly.
 */
export function FeatureSpread({ lead, secondary, rest }) {
  if (!lead) return null;

  const leadCategory = categoryBySlug(lead.category);
  const leadInk = `var(--ch-${leadCategory?.token ?? "anime"})`;

  return (
    <section className="mx-auto max-w-[88rem] px-5 py-16 sm:px-8">
      <PressHeading
        mark="Updated daily"
        title="Latest drops"
        ghostInk="var(--n2)"
        action={
          <Link
            to="/explore"
            className="group inline-flex items-center gap-2 font-mono text-[0.66rem] uppercase tracking-[0.16em] text-[var(--ink-soft)] transition-colors hover:text-[var(--n2)]"
          >
            All channels
            <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        }
      />

      <div className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-8 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
        {/* Lead. It needs its own Reveal scope: `.reveal` starts hidden in
             CSS, so an element carrying that class outside a Reveal container
             has nothing to animate it in and stays invisible for good. */}
        <Reveal className="group min-w-0">
          <article className="reveal">
            <Link to={`/content/${lead.slug}`} className="block">
              <div
                className="relative aspect-[16/9] overflow-hidden rounded-[1.75rem] border border-[var(--edge)] bg-[var(--paper-2)] transition-[border-color,box-shadow] duration-300"
                style={{ ["--glow"]: leadInk }}
              >
                {lead.coverImage && (
                  <Image
                    src={lead.coverImage}
                    alt=""
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 60vw"
                    className="plate object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                )}
                <Duotone ink={leadInk} strength={0.42} />

                <span
                  className="absolute left-4 top-4 rounded-full px-3 py-1 font-mono text-[0.58rem] font-medium uppercase tracking-[0.16em] text-[var(--void)]"
                  style={{
                    background: leadInk,
                    boxShadow: `0 0 16px color-mix(in oklch, ${leadInk} 45%, transparent)`,
                  }}
                >
                  Lead · {leadCategory?.name}
                </span>

                {/* The copy sits on the plate, the way the mockup's hero
                     tiles carry their titles. */}
                <div className="absolute inset-x-5 bottom-5">
                  <h3 className="font-display text-[clamp(1.25rem,3vw,2rem)] font-bold leading-[1.1]">
                    {lead.title}
                  </h3>
                  <p className="mt-2 max-w-xl line-clamp-2 text-[0.95rem] leading-snug text-[var(--ink-soft)]">
                    {lead.summary}
                  </p>
                </div>

                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 rounded-[1.75rem] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  style={{
                    border: `1px solid ${leadInk}`,
                    boxShadow: `0 0 34px color-mix(in oklch, ${leadInk} 32%, transparent)`,
                  }}
                />
              </div>

              <p className="mt-4 font-mono text-[0.6rem] uppercase tracking-[0.16em] text-[var(--ink-faint)]">
                {formatDate(lead.releaseDate)} ·{" "}
                {lead.viewCount.toLocaleString()} reads
                {lead.ratingCount > 0 && ` · ${lead.averageRating.toFixed(1)}★`}
              </p>
            </Link>
          </article>
        </Reveal>

        {/* Up next — a queue, not more cards */}
        <div className="min-w-0">
          <p className="mark mb-4 text-[var(--n2)]">Up next</p>
          <Reveal stagger={0.06} className="flex flex-col gap-2">
            {secondary.map((item, index) => {
              const category = categoryBySlug(item.category);
              const ink = `var(--ch-${category?.token ?? "anime"})`;
              return (
                <Link
                  key={item.id}
                  to={`/content/${item.slug}`}
                  className="reveal group flex items-center gap-3 rounded-2xl border border-[var(--edge)] bg-[var(--paper-3)] p-2.5 transition-colors hover:border-[var(--n2)]"
                >
                  {/* A thumbnail rather than a bullet: the queue in the
                       mockup is legible at a glance because it shows art. */}
                  <span className="relative aspect-[16/10] w-24 shrink-0 overflow-hidden rounded-xl bg-[var(--paper-2)]">
                    {item.coverImage && (
                      <Image
                        src={item.coverImage}
                        alt=""
                        fill
                        sizes="96px"
                        className="plate object-cover"
                      />
                    )}
                  </span>
                  <span className="min-w-0">
                    <span
                      className="block font-mono text-[0.54rem] uppercase tracking-[0.14em]"
                      style={{ color: ink }}
                    >
                      {category?.name} · {item.type}
                    </span>
                    <span className="mt-1 block truncate text-[0.88rem] font-semibold leading-snug">
                      {item.title}
                    </span>
                  </span>
                  <span className="ml-auto pr-1 font-mono text-[0.56rem] tabular-nums text-[var(--ink-faint)]">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </Link>
              );
            })}
          </Reveal>
        </div>
      </div>

      {/* The board */}
      {rest.length > 0 && (
        <Reveal
          stagger={0.05}
          className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
        >
          {rest.map((item, index) => (
            <ContentCard key={item.id} item={item} index={index} />
          ))}
        </Reveal>
      )}
    </section>
  );
}
