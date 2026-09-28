import { useState, useMemo, useCallback, lazy, Suspense } from "react";
import { Link } from "react-router";
import { Image } from "@/components/ui/image";
import { MapPin, Ticket, Crosshair, Loader2, Search, X } from "lucide-react";
import { toast } from "react-toastify";

import { getCurrentPosition, distanceKm, formatDistance } from "@/lib/geo";
import { formatDate, cn } from "@/lib/utils";
import { BookmarkButton } from "@/components/bookmark-button";

// Leaflet touches `window` on import, so the map is split into its own chunk
// and only loaded once this component mounts in the browser.
const EventMap = lazy(() =>
  import("@/components/events/event-map").then((m) => ({ default: m.EventMap })),
);

function MapLoading() {
  return (
    <div className="grid h-[26rem] w-full place-items-center rounded-2xl border border-[var(--edge)] bg-[var(--paper-2)] lg:h-[34rem]">
      <p className="mark">Loading map…</p>
    </div>
  );
}

export function EventExplorer({ events, cities, clippedIds, signedIn }) {
  const [origin, setOrigin] = useState(null);
  const [originLabel, setOriginLabel] = useState("");
  const [locating, setLocating] = useState(false);
  const [activeSlug, setActiveSlug] = useState(null);
  const [city, setCity] = useState("");

  // Place search (OpenStreetMap Nominatim, via our own route).
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);

  const clipped = useMemo(() => new Set(clippedIds), [clippedIds]);

  /** Filter by city, then sort by distance when we have a position. */
  const visible = useMemo(() => {
    const filtered = city
      ? events.filter((event) => event.city === city)
      : events;

    if (!origin) return filtered;

    return [...filtered]
      .map((event) => ({
        event,
        km: distanceKm(origin, { lat: event.lat, lng: event.lng }),
      }))
      .sort((a, b) => a.km - b.km)
      .map(({ event }) => event);
  }, [events, city, origin]);

  const distances = useMemo(() => {
    if (!origin) return new Map();
    return new Map(
      events.map((event) => [
        event.slug,
        distanceKm(origin, { lat: event.lat, lng: event.lng }),
      ]),
    );
  }, [events, origin]);

  const locate = useCallback(async () => {
    setLocating(true);
    try {
      const position = await getCurrentPosition();
      setOrigin(position);
      setOriginLabel("your location");
      setCity("");
      toast.success("Sorted by distance from you.");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLocating(false);
    }
  }, []);

  const search = useCallback(async () => {
    const term = query.trim();
    if (term.length < 2) return;

    setSearching(true);
    try {
      const response = await fetch(
        `/api/geocode?q=${encodeURIComponent(term)}`,
      );
      const data = await response.json();
      if (data.error) {
        toast.error(data.error);
        return;
      }
      setResults(data.results ?? []);
      if ((data.results ?? []).length === 0)
        toast.info("No places matched that search.");
    } catch {
      toast.error("Place search is unavailable right now.");
    } finally {
      setSearching(false);
    }
  }, [query]);

  function usePlace(place) {
    setOrigin({ lat: place.lat, lng: place.lng });
    setOriginLabel(place.name);
    setResults([]);
    setQuery("");
    setCity("");
    toast.success(`Sorted by distance from ${place.name}.`);
  }

  function clearOrigin() {
    setOrigin(null);
    setOriginLabel("");
  }

  return (
    <div>
      {/* Controls */}
      <div className="mb-6 flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={locate}
            disabled={locating}
            className="inline-flex items-center gap-2 rounded-2xl border border-[var(--edge)] bg-[var(--spot)] px-4 py-2.5 font-mono text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-[var(--void)] transition-[transform,box-shadow] duration-150 hover:-translate-y-[2px] hover:shadow-[var(--lift-md)] disabled:opacity-60"
          >
            {locating ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
            ) : (
              <Crosshair className="h-3.5 w-3.5" aria-hidden />
            )}
            Events near me
          </button>

          {/* Place search */}
          <div className="relative flex min-w-[16rem] flex-1">
            <label className="sr-only" htmlFor="place-search">
              Search for a place
            </label>
            <input
              id="place-search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  search();
                }
              }}
              placeholder="Or search a city…"
              className="w-full rounded-2xl border border-[var(--edge)] bg-[var(--paper)] py-2.5 pl-10 pr-3 font-mono text-[0.72rem] uppercase tracking-[0.1em] text-[var(--ink)] placeholder:text-[var(--ink-faint)] focus:outline-none"
            />

            <Search
              className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--ink-faint)]"
              aria-hidden
            />

            {searching && (
              <Loader2
                className="absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 animate-spin text-[var(--spot)]"
                aria-hidden
              />
            )}

            {results.length > 0 && (
              <ul className="absolute left-0 right-0 top-full z-30 border border-t-0 border-[var(--edge)] bg-[var(--paper)] shadow-[var(--lift-md)]">
                {results.map((place) => (
                  <li key={`${place.lat},${place.lng}`}>
                    <button
                      type="button"
                      onClick={() => usePlace(place)}
                      className="block w-full border-b border-[var(--rule)] px-3 py-2 text-left text-[0.82rem] transition-colors last:border-b-0 hover:bg-[var(--paper-2)]"
                    >
                      <span className="font-semibold">{place.name}</span>
                      <span className="block truncate font-mono text-[0.62rem] text-[var(--ink-faint)]">
                        {place.label}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {origin && (
            <button
              type="button"
              onClick={clearOrigin}
              className="inline-flex items-center gap-1.5 rounded-2xl border border-[var(--edge)] bg-[var(--paper-2)] px-3 py-2 font-mono text-[0.66rem] uppercase tracking-[0.12em]"
            >
              Near {originLabel}
              <X className="h-3 w-3" aria-hidden />
            </button>
          )}
        </div>

        {/* City filter */}
        <div className="flex flex-wrap">
          <CityChip
            label="All cities"
            active={!city}
            onClick={() => setCity("")}
          />

          {cities.map((name) => (
            <CityChip
              key={name}
              label={name}
              active={city === name}
              onClick={() => setCity(city === name ? "" : name)}
            />
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:items-start">
        <Suspense fallback={<MapLoading />}>
          <EventMap
            events={visible}
            origin={origin}
            activeSlug={activeSlug}
            onSelect={setActiveSlug}
          />
        </Suspense>

        {/* Calendar list */}
        <div className="lg:max-h-[34rem] lg:overflow-y-auto">
          <p className="mark mb-3">
            {visible.length} {visible.length === 1 ? "event" : "events"}
            {origin ? " · nearest first" : " · soonest first"}
          </p>

          {visible.length === 0 ? (
            <p className="border border-dashed border-[var(--edge-strong)] px-5 py-12 text-center text-[var(--ink-soft)]">
              Nothing scheduled there yet.
            </p>
          ) : (
            <ul className="border-t border-[var(--rule-strong)]">
              {visible.map((event) => {
                const km = distances.get(event.slug);
                const active = activeSlug === event.slug;
                return (
                  <li key={event.id}>
                    <div
                      className={cn(
                        "flex gap-3 border-b border-[var(--rule)] py-3.5 transition-colors",
                        active && "bg-[var(--paper-2)]",
                      )}
                    >
                      {/* The listing carried no imagery at all, on a site
                         where everything else is picture-led. Clicking the
                         row still drives the map — that is the point of the
                         two-pane layout — so the thumbnail is part of the
                         same control rather than a competing link. */}
                      <button
                        type="button"
                        onClick={() => setActiveSlug(event.slug)}
                        aria-label={`Show ${event.title} on the map`}
                        className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-[var(--edge)] bg-[var(--paper-2)]"
                      >
                        {event.imageUrl && (
                          <Image
                            src={event.imageUrl}
                            alt=""
                            fill
                            sizes="64px"
                            className="object-cover"
                          />
                        )}
                        <span
                          aria-hidden
                          className="absolute inset-0 mix-blend-soft-light"
                          style={{ background: event.ink, opacity: 0.45 }}
                        />
                      </button>

                      <button
                        type="button"
                        onClick={() => setActiveSlug(event.slug)}
                        className="min-w-0 flex-1 text-left"
                      >
                        <span className="flex flex-wrap items-center gap-2 font-mono text-[0.6rem] uppercase tracking-[0.13em] text-[var(--ink-faint)]">
                          <span
                            aria-hidden
                            className="h-2.5 w-2.5 shrink-0"
                            style={{ background: event.ink }}
                          />
                          {event.categoryName} · {event.type}
                          {km !== undefined && (
                            <span className="text-[var(--spot-deep)]">
                              {formatDistance(km)} away
                            </span>
                          )}
                        </span>

                        <span className="mt-1 block font-display text-[0.95rem] leading-[0.95]">
                          {event.title}
                        </span>

                        <span className="mt-1 flex items-center gap-1.5 text-[0.84rem] text-[var(--ink-soft)]">
                          <MapPin
                            className="h-3.5 w-3.5 shrink-0"
                            aria-hidden
                          />
                          {event.venue}, {event.city}
                        </span>

                        <span className="mt-0.5 block font-mono text-[0.64rem] uppercase tracking-[0.1em] text-[var(--ink-faint)]">
                          {formatDate(event.startsAt)}
                        </span>
                      </button>

                      <div className="flex shrink-0 flex-col items-end gap-2">
                        <BookmarkButton
                          targetType="event"
                          targetId={event.id}
                          initialBookmarked={clipped.has(event.id)}
                          signedIn={signedIn}
                          variant="icon"
                        />

                        {/* Was an anchor to whatever sat in `ticketUrl`,
                           which for every seeded event was the same
                           placeholder on example.com. It now opens the
                           event, where a pass can actually be claimed. */}
                        <Link
                          to={`/events/${event.slug}`}
                          aria-label={`Details and passes for ${event.title}`}
                          className="grid h-8 w-8 place-items-center rounded-2xl border border-[var(--edge)] transition-colors hover:border-[var(--n1)] hover:text-[var(--n1)]"
                        >
                          <Ticket className="h-4 w-4" aria-hidden />
                        </Link>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function CityChip({ label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "-ml-[1.5px] rounded-2xl border border-[var(--edge)] px-3 py-1.5 font-mono text-[0.64rem] font-semibold uppercase tracking-[0.12em] transition-colors first:ml-0",
        active
          ? "bg-[var(--n1)] text-[var(--void)]"
          : "bg-[var(--paper)] text-[var(--ink)] hover:bg-[var(--paper-2)]",
      )}
    >
      {label}
    </button>
  );
}
