import { Link, useLoaderData } from "react-router";
import { Image } from "@/components/ui/image";

import { CATEGORIES, categoryBySlug } from "@/lib/constants";
import { Meta } from "@/components/meta";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Reveal } from "@/components/motion/reveal";
import { InkStrip, Misreg } from "@/components/press";
import { formatDate, cn } from "@/lib/utils";

/** Whole days between now and a release, for the countdown column. */
function daysUntil(iso) {
  if (!iso) return null;
  return Math.ceil((new Date(iso).getTime() - Date.now()) / 86_400_000);
}

/** Groups entries under a month heading, the way a release calendar reads. */
function monthKey(iso) {
  if (!iso) return "Date to be confirmed";
  return new Date(iso).toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  });
}

export default function UpcomingPage() {
  const { activeCategory, entries } = useLoaderData();

  const months = new Map();
  for (const entry of entries) {
    const key = monthKey(entry.releaseDate);
    const bucket = months.get(key) ?? [];
    bucket.push(entry);
    months.set(key, bucket);
  }

  return (
    <div>
      <Meta
        title="Upcoming releases"
        description="Anticipated anime, games, films, shows, comics and merchandise drops across every channel, in date order."
      />
      <header className="border-b border-[var(--rule-strong)]">
        <div className="mx-auto max-w-[88rem] px-5 pb-10 pt-8 sm:px-8">
          <Breadcrumbs
            trail={[{ href: "/merch", label: "Merch" }, { label: "Upcoming" }]}
          />

          <p className="mark mb-3">
            Release schedule · {entries.length} entries
          </p>
          <Misreg
            as="h1"
            className="text-[clamp(1.85rem,5.5vw,3.6rem)]"
            ghostInk="var(--ch-gaming)"
          >
            Coming next
          </Misreg>
          <p className="mt-5 max-w-xl border-l-2 border-[var(--ch-gaming)] pl-5 text-[1.03rem] leading-relaxed text-[var(--ink-soft)]">
            Anticipated releases and merchandise drops across every channel, in
            date order.
          </p>

          <div className="mt-8 flex flex-wrap">
            <Chip
              href="/upcoming"
              active={!activeCategory}
              label="All channels"
            />

            {CATEGORIES.map((category) => (
              <Chip
                key={category.slug}
                href={`/upcoming?category=${category.slug}`}
                active={activeCategory === category.slug}
                label={category.name}
                ink={`var(--ch-${category.token})`}
              />
            ))}
          </div>
        </div>
        <InkStrip height={5} />
      </header>

      <div className="mx-auto max-w-[88rem] px-5 py-12 sm:px-8">
        {entries.length === 0 ? (
          <p className="border border-dashed border-[var(--edge-strong)] px-6 py-16 text-center text-[var(--ink-soft)]">
            Nothing scheduled in that channel yet.
          </p>
        ) : (
          <div className="flex flex-col gap-14">
            {[...months.entries()].map(([month, bucket]) => (
              <section key={month}>
                <div className="mb-5 flex items-baseline gap-4 border-t border-[var(--rule-strong)] pt-3">
                  <h2 className="font-display text-[1.44rem] leading-none">
                    {month}
                  </h2>
                  <span className="mark !text-[0.6rem]">{bucket.length}</span>
                </div>

                <Reveal stagger={0.05} className="flex flex-col">
                  {bucket.map((entry) => {
                    const category = categoryBySlug(entry.category);
                    const ink = `var(--ch-${category?.token ?? "anime"})`;
                    const days = daysUntil(entry.releaseDate);

                    return (
                      <Link
                        key={`${entry.kind}-${entry.id}`}
                        to={entry.href}
                        className="reveal group grid grid-cols-[auto_minmax(0,1fr)] items-center gap-4 border-b border-[var(--rule)] py-4 transition-colors hover:bg-[var(--paper-2)] sm:grid-cols-[92px_84px_minmax(0,1fr)_auto]"
                      >
                        {/* Plate */}
                        <div className="relative hidden h-16 w-[84px] shrink-0 overflow-hidden rounded-2xl border border-[var(--edge)] sm:block sm:order-2">
                          {entry.imageUrl && (
                            <Image
                              src={entry.imageUrl}
                              alt=""
                              fill
                              sizes="84px"
                              className="plate object-cover"
                            />
                          )}
                          <span
                            aria-hidden
                            className="absolute inset-0 mix-blend-multiply dark:mix-blend-screen"
                            style={{ background: ink, opacity: 0.5 }}
                          />
                        </div>

                        {/* Date + countdown */}
                        <div className="font-mono text-[0.68rem] uppercase tracking-[0.1em] sm:order-1">
                          <div className="text-[var(--ink)]">
                            {entry.releaseDate
                              ? formatDate(entry.releaseDate)
                              : "TBC"}
                          </div>
                          {days !== null && days >= 0 && (
                            <div className="mt-0.5 tabular-nums text-[var(--ink-faint)]">
                              in {days}d
                            </div>
                          )}
                        </div>

                        {/* Title */}
                        <div className="min-w-0 sm:order-3">
                          <p className="flex items-center gap-2 font-mono text-[0.6rem] uppercase tracking-[0.14em] text-[var(--ink-faint)]">
                            <span
                              aria-hidden
                              className="h-2.5 w-2.5"
                              style={{ background: ink }}
                            />
                            {category?.name} ·{" "}
                            {entry.kind === "merchandise" ? "Merch" : entry.tag}
                          </p>
                          <h3 className="mt-1 font-display text-[1.01rem] leading-[0.95] transition-transform duration-200 group-hover:translate-x-1">
                            {entry.title}
                          </h3>
                          <p className="mt-1 line-clamp-1 text-[0.88rem] text-[var(--ink-soft)]">
                            {entry.description}
                          </p>
                        </div>

                        <span className="hidden rounded-2xl border border-[var(--edge)] px-2.5 py-1 font-mono text-[0.58rem] uppercase tracking-[0.13em] sm:order-4 sm:block">
                          {entry.tag}
                        </span>
                      </Link>
                    );
                  })}
                </Reveal>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Chip({ href, active, label, ink }) {
  return (
    <Link
      to={href}
      className={cn(
        "-ml-[1.5px] inline-flex items-center gap-2 rounded-2xl border border-[var(--edge)] px-4 py-2 font-mono text-[0.68rem] font-semibold uppercase tracking-[0.14em] transition-colors first:ml-0",
        active
          ? "bg-[var(--n1)] text-[var(--void)]"
          : "bg-[var(--paper)] text-[var(--ink)] hover:bg-[var(--paper-2)]",
      )}
    >
      {ink && (
        <span aria-hidden className="h-2.5 w-2.5" style={{ background: ink }} />
      )}
      {label}
    </Link>
  );
}
