import { Link, useLoaderData } from "react-router";

import { CATEGORIES, MERCH_TAGS } from "@/lib/constants";
import { Meta } from "@/components/meta";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Reveal } from "@/components/motion/reveal";
import { InkStrip, RegMark } from "@/components/press";
import { MerchCard } from "@/components/merch/merch-card";
import { cn } from "@/lib/utils";

export default function MerchPage() {
  const {
    activeCategory,
    activeTag,
    upcomingOnly,
    items,
    clippedIds,
    signedIn,
  } = useLoaderData();

  const clipped = new Set(clippedIds);

  // The SRS asks for the showcase grouped by fandom, so with no filter applied
  // the listing is split into per-channel runs.
  const grouped = new Map();
  for (const item of items) {
    const bucket = grouped.get(item.category) ?? [];
    bucket.push(item);
    grouped.set(item.category, bucket);
  }
  const showGrouped = !activeCategory && !activeTag && !upcomingOnly;

  return (
    <div>
      <Meta
        title="Merch shop"
        description="Shop apparel, accessories, figures and collectibles from across the Fan Hub Plus universe."
      />
      <header className="relative border-b border-[var(--rule)]">
        <div className="mx-auto max-w-[88rem] px-5 pb-10 pt-8 sm:px-8">
          <Breadcrumbs trail={[{ label: "Merch" }]} />

          <div
            className="relative overflow-hidden rounded-[1.75rem] border p-8 sm:p-10"
            style={{
              background:
                "linear-gradient(135deg, color-mix(in oklch, var(--n1) 26%, var(--paper-3)), var(--paper-3) 62%)",
              borderColor: "color-mix(in oklch, var(--n1) 45%, transparent)",
            }}
          >
            <div className="flex flex-wrap items-end justify-between gap-6">
              <div>
                <p className="mark mb-3 text-[var(--n3)]">
                  The merch drop · {items.length} items
                </p>
                <h1 className="font-display text-[clamp(1.9rem,5.5vw,3.6rem)] font-black leading-[0.95]">
                  Wear the
                  <br />
                  <span className="text-[var(--n1)] [--glow:var(--n1)] glow-text">
                    glow.
                  </span>
                </h1>
                <p className="mt-5 max-w-md text-[1.02rem] leading-relaxed text-[var(--ink-soft)]">
                  Fan-picked apparel, accessories, figures and collectibles.
                  Build your cart now and take it through checkout.
                </p>
              </div>
              <RegMark className="hidden text-[var(--ink-faint)] sm:block" />
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3">
            <div className="flex flex-wrap gap-2">
              <Chip
                href="/merch"
                active={!activeCategory && !activeTag && !upcomingOnly}
                label="All"
              />

              <Chip
                href="/merch?upcoming=1"
                active={upcomingOnly}
                label="Upcoming"
              />

              {CATEGORIES.map((category) => (
                <Chip
                  key={category.slug}
                  href={`/merch?category=${category.slug}`}
                  active={activeCategory === category.slug}
                  label={category.name}
                  ink={`var(--ch-${category.token})`}
                />
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="mark mr-1 !text-[0.58rem] text-[var(--n2)]">
                Tag
              </span>
              {MERCH_TAGS.map((tag) => (
                <Link
                  key={tag}
                  to={
                    activeTag === tag
                      ? "/merch"
                      : `/merch?tag=${encodeURIComponent(tag)}`
                  }
                  className={cn(
                    "rounded-full border px-3 py-1 font-mono text-[0.58rem] uppercase tracking-[0.13em] transition-colors",
                    activeTag === tag
                      ? "border-[var(--n3)] bg-[var(--n3)] text-[var(--void)] shadow-[0_0_16px_color-mix(in_oklch,var(--n3)_50%,transparent)]"
                      : "border-[var(--edge)] text-[var(--ink-soft)] hover:border-[var(--edge-strong)] hover:text-[var(--ink)]",
                  )}
                >
                  {tag}
                </Link>
              ))}
            </div>
          </div>
        </div>
        <InkStrip height={2} className="absolute inset-x-0 bottom-0" />
      </header>

      <div className="mx-auto max-w-[88rem] px-5 py-12 sm:px-8">
        {items.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-[var(--edge-strong)] px-6 py-16 text-center text-[var(--ink-soft)]">
            Nothing in the showcase matches that filter yet.
          </p>
        ) : showGrouped ? (
          <div className="flex flex-col gap-16">
            {CATEGORIES.filter((category) => grouped.has(category.slug)).map(
              (category) => {
                const bucket = grouped.get(category.slug);
                return (
                  <section key={category.slug}>
                    <div className="mb-6 flex flex-wrap items-end justify-between gap-3 border-t border-[var(--rule)] pt-4">
                      <div className="flex items-center gap-3">
                        <span
                          aria-hidden
                          className="h-3 w-3 rounded-full"
                          style={{
                            background: `var(--ch-${category.token})`,
                            boxShadow: `0 0 12px var(--ch-${category.token})`,
                          }}
                        />

                        <h2 className="font-display text-[1.2rem] font-bold leading-none">
                          {category.name}
                        </h2>
                        <span className="mark !text-[0.58rem]">
                          {bucket.length} items
                        </span>
                      </div>
                      <Link
                        to={`/merch?category=${category.slug}`}
                        className="font-mono text-[0.62rem] uppercase tracking-[0.14em] text-[var(--ink-soft)] transition-colors hover:text-[var(--n2)]"
                      >
                        See all →
                      </Link>
                    </div>

                    <Reveal
                      stagger={0.05}
                      className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
                    >
                      {bucket.slice(0, 4).map((item, index) => (
                        <MerchCard
                          key={item.id}
                          item={item}
                          index={index}
                          bookmarked={clipped.has(item.id)}
                          signedIn={signedIn}
                        />
                      ))}
                    </Reveal>
                  </section>
                );
              },
            )}
          </div>
        ) : (
          <Reveal
            stagger={0.04}
            className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
          >
            {items.map((item, index) => (
              <MerchCard
                key={item.id}
                item={item}
                index={index}
                bookmarked={clipped.has(item.id)}
                signedIn={signedIn}
              />
            ))}
          </Reveal>
        )}

        <div className="mt-16 border-t border-[var(--rule)] pt-6">
          <Link
            to="/upcoming"
            className="group inline-flex items-center gap-3 font-display text-[1.2rem] font-bold leading-none transition-colors hover:text-[var(--n3)]"
          >
            See everything coming next
            <span className="transition-transform duration-200 group-hover:translate-x-2">
              →
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}

function Chip({ href, active, label, ink }) {
  return (
    <Link
      to={href}
      className={cn(
        "inline-flex items-center gap-2 whitespace-nowrap rounded-full border px-3.5 py-1.5 font-mono text-[0.62rem] font-semibold uppercase tracking-[0.13em] transition-colors",
        active
          ? "text-[var(--void)]"
          : "border-[var(--edge)] text-[var(--ink-soft)] hover:border-[var(--edge-strong)] hover:text-[var(--ink)]",
      )}
      style={
        active
          ? {
              background: ink ?? "var(--n1)",
              borderColor: ink ?? "var(--n1)",
              boxShadow: `0 0 18px color-mix(in oklch, ${ink ?? "var(--n1)"} 50%, transparent)`,
            }
          : undefined
      }
    >
      {ink && !active && (
        <span
          aria-hidden
          className="h-2 w-2 rounded-full"
          style={{ background: ink, boxShadow: `0 0 8px ${ink}` }}
        />
      )}
      {label}
    </Link>
  );
}
