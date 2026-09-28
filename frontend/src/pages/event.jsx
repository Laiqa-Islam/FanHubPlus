import { Link, useLoaderData, useParams } from "react-router";
import { Image } from "@/components/ui/image";
import {
  CalendarDays,
  MapPin,
  Clock,
  Building2,
  ArrowUpRight,
  Navigation,
} from "lucide-react";

import { categoryBySlug } from "@/lib/constants";
import { Meta } from "@/components/meta";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { PressHeading } from "@/components/press";
import { Reveal } from "@/components/motion/reveal";
import { Duotone } from "@/components/duotone";
import { BookmarkButton } from "@/components/bookmark-button";
import { TicketPanel } from "@/components/events/ticket-panel";
import { CopyLocation } from "@/components/events/copy-location";

/** Dates are formatted in UTC so the server and the client agree. */
function longDate(value) {
  return new Date(value).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

function time(value) {
  return new Date(value).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  });
}

export default function EventDetailPage() {
  const { slug } = useParams();
  // `hasPassed` and `related` read the clock, so they are settled in the
  // loader rather than during render.
  const {
    event,
    hasPassed,
    clippedIds,
    availability,
    ticket,
    related,
    signedIn,
    emailVerified,
  } = useLoaderData();

  const category = categoryBySlug(String(event.category));
  const ink = `var(--ch-${category?.token ?? "anime"})`;
  const id = String(event._id);
  const start = new Date(event.startsAt);
  const end = event.endsAt ? new Date(event.endsAt) : null;
  const clipped = new Set(clippedIds);

  const coordinates = event.location?.coordinates ?? [0, 0] ?? [0, 0];
  const [lng, lat] = coordinates;
  const address = [event.venue, event.city, event.country]
    .filter(Boolean)
    .join(", ");
  const mapHref =
    lat || lng
      ? `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=15/${lat}/${lng}`
      : `https://www.openstreetmap.org/search?query=${encodeURIComponent(address)}`;

  return (
    <div>
      <Meta
        title={String(event.title)}
        description={String(event.description ?? "").slice(0, 160)}
      />
      {/* The plate: the event's own art, flooded in its channel's signal. */}
      <header className="relative overflow-hidden border-b border-[var(--rule-strong)]">
        <div className="absolute inset-0">
          {event.imageUrl && (
            <Image
              src={String(event.imageUrl)}
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
          )}
          <Duotone ink={ink} strength={0.5} />
          <span
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to top, var(--paper) 6%, color-mix(in oklch, var(--void) 70%, transparent) 60%)",
            }}
          />
        </div>

        <div className="relative mx-auto max-w-[88rem] px-5 pb-12 pt-8 sm:px-8">
          <Breadcrumbs
            trail={[
              { href: "/events", label: "Events" },
              { label: String(event.title) },
            ]}
          />

          <div className="flex flex-wrap items-center gap-2.5">
            <span
              className="rounded-full px-2.5 py-1 font-mono text-[0.56rem] font-bold uppercase tracking-[0.14em] text-[var(--void)]"
              style={{ background: ink }}
            >
              {category?.name}
            </span>
            <span className="rounded-full border border-[var(--edge)] px-2.5 py-1 font-mono text-[0.56rem] uppercase tracking-[0.14em] text-[var(--ink-soft)]">
              {String(event.type)}
            </span>
            {hasPassed && (
              <span className="rounded-full border border-[var(--edge)] px-2.5 py-1 font-mono text-[0.56rem] uppercase tracking-[0.14em] text-[var(--ink-faint)]">
                Past event
              </span>
            )}
          </div>

          <h1 className="mt-5 max-w-3xl font-display text-[clamp(1.9rem,5.5vw,3.5rem)] font-black leading-[0.98]">
            {String(event.title)}
          </h1>

          <div className="mt-6 flex flex-wrap items-center gap-x-7 gap-y-3 text-[0.95rem] text-[var(--ink-soft)]">
            <span className="inline-flex items-center gap-2">
              <CalendarDays
                className="h-4 w-4 shrink-0"
                style={{ color: ink }}
                aria-hidden
              />

              {longDate(start)}
            </span>
            <span className="inline-flex items-center gap-2">
              <Clock
                className="h-4 w-4 shrink-0"
                style={{ color: ink }}
                aria-hidden
              />

              {time(start)}
              {end ? ` – ${time(end)}` : ""}
            </span>
            <span className="inline-flex items-center gap-2">
              <MapPin
                className="h-4 w-4 shrink-0"
                style={{ color: ink }}
                aria-hidden
              />

              {String(event.city)}
              {event.country ? `, ${event.country}` : ""}
            </span>
          </div>

          <div className="mt-7">
            <BookmarkButton
              targetType="event"
              targetId={id}
              initialBookmarked={clipped.has(id)}
              signedIn={signedIn}
            />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[88rem] px-5 py-12 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] lg:items-start">
          <div className="min-w-0">
            <h2 className="font-display text-[1.3rem] font-black leading-none">
              About this one
            </h2>
            <div
              aria-hidden
              className="mt-4 h-px w-full"
              style={{
                background:
                  "linear-gradient(90deg, var(--rule-strong), transparent)",
              }}
            />

            <p className="mt-6 text-[1.02rem] leading-relaxed text-[var(--ink-soft)]">
              {String(event.description) ||
                "Details for this event are still to be announced."}
            </p>

            <h3 className="mt-12 font-display text-[1.15rem] font-black leading-none">
              Getting there
            </h3>
            <div
              aria-hidden
              className="mt-4 h-px w-full"
              style={{
                background:
                  "linear-gradient(90deg, var(--rule-strong), transparent)",
              }}
            />

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <Fact
                icon={Building2}
                label="Venue"
                value={String(event.venue) || "To be confirmed"}
                ink={ink}
              />

              <Fact
                icon={MapPin}
                label="City"
                value={`${event.city}${event.country ? `, ${event.country}` : ""}`}
                ink={ink}
              />
            </div>

            <a
              href={mapHref}
              target="_blank"
              rel="noopener noreferrer"
              className="group mt-4 inline-flex items-center gap-2 font-mono text-[0.62rem] uppercase tracking-[0.14em] text-[var(--n2)] transition-colors hover:text-[var(--n1)]"
            >
              <Navigation className="h-3.5 w-3.5" aria-hidden />
              Open in maps
              <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>

            <CopyLocation address={address} lat={lat} lng={lng} ink={ink} />
          </div>

          <TicketPanel
            slug={slug}
            ink={ink}
            signedIn={signedIn}
            emailVerified={emailVerified}
            hasPassed={hasPassed}
            ticket={ticket}
            availability={availability}
            externalUrl={String(event.ticketUrl ?? "")}
          />
        </div>

        {related.length > 0 && (
          <section className="mt-20">
            <PressHeading
              mark="Also on"
              title="Next in the diary"
              ghostInk="var(--n2)"
              action={
                <Link
                  to="/events"
                  className="group inline-flex items-center gap-2 font-mono text-[0.66rem] uppercase tracking-[0.16em] text-[var(--ink-soft)] transition-colors hover:text-[var(--n2)]"
                >
                  Full calendar
                  <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>
              }
            />

            <Reveal stagger={0.06} className="grid gap-4 sm:grid-cols-3">
              {related.map((other) => {
                const otherInk = `var(--ch-${categoryBySlug(String(other.category))?.token ?? "anime"})`;
                return (
                  <Link
                    key={String(other._id)}
                    to={`/events/${other.slug}`}
                    className="reveal group relative flex flex-col overflow-hidden rounded-2xl border border-[var(--edge)] bg-[var(--paper-3)] transition-[transform,border-color] duration-300 hover:-translate-y-1 hover:border-[var(--edge-strong)]"
                  >
                    <div className="relative aspect-[16/10] overflow-hidden">
                      {other.imageUrl && (
                        <Image
                          src={String(other.imageUrl)}
                          alt=""
                          fill
                          sizes="(max-width: 640px) 100vw, 33vw"
                          className="object-cover transition-transform duration-700 group-hover:scale-[1.06]"
                        />
                      )}
                      <Duotone ink={otherInk} strength={0.35} />
                    </div>
                    <div className="p-4">
                      <p
                        className="font-mono text-[0.56rem] uppercase tracking-[0.14em]"
                        style={{ color: otherInk }}
                      >
                        {longDate(new Date(other.startsAt))}
                      </p>
                      <h3 className="mt-2 font-display text-[0.95rem] font-bold leading-[1.18]">
                        {String(other.title)}
                      </h3>
                      <p className="mt-1.5 text-[0.8rem] text-[var(--ink-faint)]">
                        {String(other.city)}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </Reveal>
          </section>
        )}
      </div>
    </div>
  );
}

function Fact({ icon: Icon, label, value, ink }) {
  return (
    <div className="rounded-2xl border border-[var(--edge)] bg-[var(--paper-3)] p-4">
      <p className="flex items-center gap-2 font-mono text-[0.56rem] uppercase tracking-[0.16em] text-[var(--ink-faint)]">
        <Icon className="h-3.5 w-3.5" style={{ color: ink }} />
        {label}
      </p>
      <p className="mt-2 font-display text-[0.95rem] font-bold leading-snug">
        {value}
      </p>
    </div>
  );
}
