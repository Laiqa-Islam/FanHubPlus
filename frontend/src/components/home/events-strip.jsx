import { Link } from "react-router";
import { Image } from "@/components/ui/image";
import { MapPin, ArrowUpRight } from "lucide-react";

import { categoryBySlug } from "@/lib/constants";
import { Reveal } from "@/components/motion/reveal";
import { PressHeading } from "@/components/press";

/** Splits a date into the two parts the calendar block prints separately. */
function dateParts(iso) {
  if (!iso) return { day: "--", month: "" };
  const date = new Date(iso);
  return {
    day: String(date.getUTCDate()).padStart(2, "0"),
    month: date
      .toLocaleDateString("en-GB", { month: "short", timeZone: "UTC" })
      .toUpperCase(),
  };
}

/**
 * The next four things happening, soonest first.
 *
 * Dates are formatted in UTC on purpose. These render on the server and
 * hydrate on the client, and a convention that starts at 09:00 local will
 * otherwise print one day on the server and another in a browser a few hours
 * west — which React reports as a hydration mismatch.
 */
export function EventsStrip({ events }) {
  if (events.length === 0) return null;

  return (
    <section className="border-y border-[var(--rule)] bg-[var(--paper-2)]">
      <div className="mx-auto max-w-[88rem] px-5 py-16 sm:px-8">
        <PressHeading
          mark="Diary"
          title="Coming up"
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

        <Reveal
          stagger={0.06}
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          {events.map((event) => {
            const ink = `var(--ch-${categoryBySlug(event.category)?.token ?? "anime"})`;
            const { day, month } = dateParts(event.startsAt);

            return (
              <Link
                key={event.slug}
                to={`/events/${event.slug}`}
                className="reveal group relative flex h-full flex-col overflow-hidden rounded-2xl border border-[var(--edge)] bg-[var(--paper-3)] transition-[transform,border-color] duration-300 hover:-translate-y-1 hover:border-[var(--edge-strong)]"
              >
                <div className="relative aspect-[16/10] overflow-hidden">
                  {event.imageUrl && (
                    <Image
                      src={event.imageUrl}
                      alt=""
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="plate object-cover transition-transform duration-700 group-hover:scale-[1.06]"
                    />
                  )}
                  <span
                    aria-hidden
                    className="absolute inset-0"
                    style={{
                      background:
                        "linear-gradient(to top, var(--paper-3) 6%, transparent 70%)",
                    }}
                  />

                  {/* The torn-off calendar leaf, lit in the channel's hue. */}
                  <span
                    className="absolute left-3 top-3 grid place-items-center rounded-xl px-3 py-2 text-center leading-none"
                    style={{
                      background:
                        "color-mix(in oklch, var(--void) 78%, transparent)",
                      border: `1px solid ${ink}`,
                      boxShadow: `0 0 20px color-mix(in oklch, ${ink} 28%, transparent)`,
                    }}
                  >
                    <span
                      className="font-display text-[1.15rem] font-black tabular-nums"
                      style={{ color: ink }}
                    >
                      {day}
                    </span>
                    <span className="mt-1 font-mono text-[0.5rem] tracking-[0.16em] text-[var(--ink-faint)]">
                      {month}
                    </span>
                  </span>
                </div>

                <div className="flex flex-1 flex-col p-4">
                  <h3 className="font-display text-[0.98rem] font-bold leading-[1.18]">
                    {event.title}
                  </h3>
                  <p className="mt-2 flex items-center gap-1.5 text-[0.78rem] text-[var(--ink-faint)]">
                    <MapPin className="h-3 w-3 shrink-0" aria-hidden />
                    <span className="truncate">
                      {event.city}
                      {event.country ? `, ${event.country}` : ""}
                    </span>
                  </p>
                  {event.type && (
                    <span
                      className="mt-3 self-start rounded-full px-2.5 py-1 font-mono text-[0.5rem] uppercase tracking-[0.16em]"
                      style={{
                        color: ink,
                        background: `color-mix(in oklch, ${ink} 12%, transparent)`,
                      }}
                    >
                      {event.type}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </Reveal>
      </div>
    </section>
  );
}
