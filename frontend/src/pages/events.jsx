import { Link, useLoaderData } from "react-router";
import "leaflet/dist/leaflet.css";

import { CATEGORIES } from "@/lib/constants";
import { Meta } from "@/components/meta";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { InkStrip, Misreg, RegMark } from "@/components/press";
import { EventExplorer } from "@/components/events/event-explorer";
import { HighlightReel } from "@/components/events/highlight-reel";
import { cn } from "@/lib/utils";

export default function EventsPage() {
  // `highlights` — the upcoming highlights for the reel — is picked in the
  // loader, where reading "today" is not an impure call during render.
  const { activeCategory, events, cities, highlights, clippedIds, signedIn } =
    useLoaderData();

  return (
    <div>
      <Meta
        title="Events & calendar"
        description="Find conventions, meetups, screenings and premieres near you on the map, or browse the calendar by city with links to tickets."
      />
      <header className="border-b border-[var(--rule-strong)]">
        <div className="mx-auto max-w-[88rem] px-5 pb-10 pt-8 sm:px-8">
          <Breadcrumbs trail={[{ label: "Events" }]} />

          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="mark mb-3">Listings · {events.length} scheduled</p>
              <Misreg
                as="h1"
                className="text-[clamp(1.85rem,5.5vw,3.6rem)]"
                ghostInk="var(--ch-tv)"
              >
                Where to go
              </Misreg>
              <p className="mt-5 max-w-xl border-l-2 border-[var(--ch-tv)] pl-5 text-[1.03rem] leading-relaxed text-[var(--ink-soft)]">
                Conventions, meetups, screenings and premieres. Share your
                location to sort by distance, search any city, or browse the
                whole calendar.
              </p>
            </div>
            <RegMark className="hidden text-[var(--ink-faint)] sm:block" />
          </div>

          <div className="mt-8 flex flex-wrap">
            <Chip
              href="/events"
              active={!activeCategory}
              label="All channels"
            />

            {CATEGORIES.map((category) => (
              <Chip
                key={category.slug}
                href={`/events?category=${category.slug}`}
                active={activeCategory === category.slug}
                label={category.name}
                ink={`var(--ch-${category.token})`}
              />
            ))}
          </div>
        </div>
        <InkStrip height={5} />
      </header>

      <HighlightReel events={highlights} />

      <div className="mx-auto max-w-[88rem] px-5 py-10 sm:px-8">
        <EventExplorer
          events={events}
          cities={cities}
          clippedIds={clippedIds}
          signedIn={signedIn}
        />

        <p className="mt-8 border-t border-[var(--rule)] pt-4 font-mono text-[0.62rem] leading-relaxed text-[var(--ink-faint)]">
          Map data and place search © OpenStreetMap contributors. Your location
          is read in the browser to sort this list — it is never sent to our
          servers or stored.
        </p>
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
