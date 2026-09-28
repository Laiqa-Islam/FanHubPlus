import { Link } from "react-router";
import { Image } from "@/components/ui/image";
import { ArrowUpRight, MapPin } from "lucide-react";

import { categoryBySlug } from "@/lib/constants";
import { Reveal } from "@/components/motion/reveal";
import { Duotone } from "@/components/duotone";
import { Parallax } from "@/components/motion/parallax";

/** Day and month, split so the calendar block can print them separately. */
function parts(iso) {
  const date = new Date(iso);
  return {
    day: String(date.getUTCDate()).padStart(2, "0"),
    month: date
      .toLocaleDateString("en-GB", { month: "short", timeZone: "UTC" })
      .toUpperCase(),
    weekday: date.toLocaleDateString("en-GB", {
      weekday: "long",
      timeZone: "UTC",
    }),
  };
}

/**
 * Event highlights, told rather than listed (SRS FR-7).
 *
 * The calendar below this is a tool: a map, a city filter, sixteen rows you
 * scan and move past. That is the right shape for finding something, and the
 * wrong shape for making anyone care about it. The `isHighlight` flag existed
 * on the model and was read straight through to nothing, which is why the
 * section a reader should meet first did not exist.
 *
 * So this is the opposite treatment. Full-bleed art, one at a time,
 * alternating sides so the run has a rhythm; narrative copy from the event's
 * `story` rather than its listing description; and the date given as a
 * weekday, because "Saturday" is how anyone actually decides whether they are
 * going. The chronology is the spine — these are the next few weeks in order,
 * not a ranked list.
 */
export function HighlightReel({ events }) {
  if (events.length === 0) return null;

  return (
    <section className="border-b border-[var(--rule)] bg-[var(--paper-2)]">
      <div className="mx-auto max-w-[88rem] px-5 py-16 sm:px-8">
        <div className="mb-12 max-w-2xl">
          <p className="mark mb-3 text-[var(--n3)]">The next few weeks</p>
          <h2 className="font-display text-[clamp(1.6rem,4vw,2.7rem)] font-black leading-[1.02]">
            What&rsquo;s worth leaving the house for
          </h2>
          <p className="mt-5 text-[1.02rem] leading-relaxed text-[var(--ink-soft)]">
            Six dates, in the order they happen. The full calendar and the map
            are below — this is the part we would actually go to.
          </p>
        </div>

        <Reveal stagger={0.08} className="flex flex-col gap-14">
          {events.map((event, index) => {
            const ink = `var(--ch-${categoryBySlug(event.category)?.token ?? "anime"})`;
            const { day, month, weekday } = parts(event.startsAt);
            // Alternating sides give the run a cadence; on narrow screens
            // everything stacks art-first regardless.
            const flipped = index % 2 === 1;

            return (
              <article
                key={event.id}
                className="reveal grid items-center gap-8 lg:grid-cols-2 lg:gap-12"
              >
                <Link
                  to={`/events/${event.slug}`}
                  className={`group relative block aspect-[16/10] overflow-hidden rounded-[1.5rem] border border-[var(--edge)] ${
                    flipped ? "lg:order-2" : ""
                  }`}
                >
                  <Parallax speed={0.08} className="absolute inset-[-10%]">
                    {event.imageUrl && (
                      <Image
                        src={event.imageUrl}
                        alt=""
                        fill
                        sizes="(max-width: 1024px) 100vw, 50vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                      />
                    )}
                  </Parallax>
                  <Duotone ink={ink} strength={0.42} />

                  {/* The date, torn off and dropped on the art. */}
                  <span
                    className="absolute left-5 top-5 grid place-items-center rounded-2xl px-4 py-3 text-center leading-none"
                    style={{
                      background:
                        "color-mix(in oklch, var(--void) 76%, transparent)",
                      border: `1px solid ${ink}`,
                      boxShadow: `0 0 26px color-mix(in oklch, ${ink} 30%, transparent)`,
                    }}
                  >
                    <span
                      className="font-display text-[1.6rem] font-black tabular-nums"
                      style={{ color: ink }}
                    >
                      {day}
                    </span>
                    <span className="mt-1.5 font-mono text-[0.56rem] tracking-[0.18em] text-[var(--ink-soft)]">
                      {month}
                    </span>
                  </span>
                </Link>

                <div className={`min-w-0 ${flipped ? "lg:order-1" : ""}`}>
                  <p className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[0.6rem] uppercase tracking-[0.16em] text-[var(--ink-faint)]">
                    <span
                      aria-hidden
                      className="grid h-6 w-6 place-items-center rounded-md font-bold tabular-nums text-[var(--void)]"
                      style={{ background: ink }}
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span style={{ color: ink }}>{event.type}</span>
                    <span>{weekday}</span>
                  </p>

                  <h3 className="mt-4 font-display text-[clamp(1.25rem,3vw,1.9rem)] font-black leading-[1.06]">
                    {event.title}
                  </h3>

                  <p className="mt-3 flex items-center gap-1.5 text-[0.88rem] text-[var(--ink-soft)]">
                    <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden />
                    {event.venue}
                    {event.venue && event.city ? ", " : ""}
                    {event.city}
                  </p>

                  <p className="mt-5 max-w-xl text-[1rem] leading-relaxed text-[var(--ink-soft)]">
                    {event.story || event.description}
                  </p>

                  <Link
                    to={`/events/${event.slug}`}
                    className="group mt-6 inline-flex items-center gap-2 font-mono text-[0.64rem] uppercase tracking-[0.16em] transition-colors"
                    style={{ color: ink }}
                  >
                    Details and passes
                    <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </Link>
                </div>
              </article>
            );
          })}
        </Reveal>
      </div>
    </section>
  );
}
