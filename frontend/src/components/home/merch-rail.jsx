import { Link } from "react-router";
import { Image } from "@/components/ui/image";
import { ArrowUpRight } from "lucide-react";

import { categoryBySlug } from "@/lib/constants";
import { Reveal } from "@/components/motion/reveal";
import { PressHeading } from "@/components/press";

function price(cents) {
  return `$${(cents / 100).toFixed(2)}`;
}

/**
 * The shop, on a scroll-snapping rail.
 *
 * Ten items in a wrapping grid would be two ragged rows that push the CTA
 * off the bottom of a long page. A rail keeps the section one card tall,
 * scrolls natively on touch, and leaves the horizontal overflow as the only
 * hint that there is more — which is how a shelf works.
 */
export function MerchRail({ items }) {
  if (items.length === 0) return null;

  return (
    <section className="mx-auto max-w-[88rem] px-5 py-16 sm:px-8">
      <PressHeading
        mark="Fan-picked"
        title="In the shop"
        ghostInk="var(--n3)"
        action={
          <Link
            to="/merch"
            className="group inline-flex items-center gap-2 font-mono text-[0.66rem] uppercase tracking-[0.16em] text-[var(--ink-soft)] transition-colors hover:text-[var(--n2)]"
          >
            Everything for sale
            <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        }
      />

      <Reveal
        stagger={0.05}
        className="-mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-4 sm:-mx-8 sm:px-8"
      >
        {items.map((item) => {
          const ink = `var(--ch-${categoryBySlug(item.category)?.token ?? "anime"})`;
          return (
            <Link
              key={item.slug}
              to={`/merch/${item.slug}`}
              className="reveal group w-[15rem] shrink-0 snap-start overflow-hidden rounded-2xl border border-[var(--edge)] bg-[var(--paper-3)] transition-[transform,border-color] duration-300 hover:-translate-y-1 hover:border-[var(--edge-strong)]"
            >
              <div className="relative aspect-square overflow-hidden bg-[var(--paper-2)]">
                {item.imageUrl && (
                  <Image
                    src={item.imageUrl}
                    alt={item.name}
                    fill
                    sizes="240px"
                    className="object-cover transition-transform duration-700 group-hover:scale-[1.07]"
                  />
                )}
                {item.tag && (
                  <span
                    className="absolute left-2.5 top-2.5 rounded-full px-2.5 py-1 font-mono text-[0.52rem] font-bold uppercase tracking-[0.14em] text-[var(--void)]"
                    style={{ background: ink }}
                  >
                    {item.tag}
                  </span>
                )}
              </div>

              <div className="flex items-start justify-between gap-3 p-3.5">
                <h3 className="line-clamp-2 font-display text-[0.86rem] font-bold leading-[1.2]">
                  {item.name}
                </h3>
                <span
                  className="shrink-0 font-mono text-[0.78rem] font-bold tabular-nums"
                  style={{ color: ink }}
                >
                  {price(item.priceCents)}
                </span>
              </div>
            </Link>
          );
        })}
      </Reveal>
    </section>
  );
}
