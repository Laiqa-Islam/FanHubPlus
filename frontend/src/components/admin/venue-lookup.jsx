import { useRef, useState } from "react";
import { Search, Loader2, MapPin, Check } from "lucide-react";

/**
 * Finds a venue and fills the event form's location fields from it.
 *
 * Creating an event previously meant typing latitude and longitude by hand,
 * which is both unreasonable and the easiest thing in the form to get
 * silently wrong — a transposed pair puts a Birmingham meetup in the Indian
 * Ocean, and nothing downstream would complain.
 *
 * The fields are written by name through the enclosing form rather than
 * lifted into React state, because the form around this is uncontrolled and
 * shared by every admin resource. Native `input` setters are used so React
 * notices the change on inputs it is tracking.
 */
export function VenueLookup() {
  const rootRef = useRef(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [filled, setFilled] = useState("");

  async function search() {
    const term = query.trim();
    if (term.length < 3) {
      setError("Type at least three characters.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const response = await fetch(
        `/api/geocode?mode=venue&q=${encodeURIComponent(term)}`,
      );
      const data = await response.json();
      if (data.error) setError(data.error);
      setResults(data.results ?? []);
      if ((data.results ?? []).length === 0 && !data.error) {
        setError("Nothing found for that. Try adding the city.");
      }
    } catch {
      setError("Place search is unavailable right now.");
    } finally {
      setBusy(false);
    }
  }

  function setField(name, value) {
    const form = rootRef.current?.closest("form");
    const field = form?.elements.namedItem(name);
    if (!(field instanceof HTMLInputElement)) return;

    const setter = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      "value",
    )?.set;
    setter?.call(field, value);
    field.dispatchEvent(new Event("input", { bubbles: true }));
  }

  function apply(place) {
    setField("lat", place.lat.toFixed(6));
    setField("lng", place.lng.toFixed(6));
    if (place.city) setField("city", place.city);
    if (place.country) setField("country", place.country);
    setField("venue", place.name);

    setFilled(place.label);
    setResults([]);
  }

  return (
    <div
      ref={rootRef}
      className="sm:col-span-2 rounded-2xl border border-[var(--edge)] bg-[var(--paper-2)] p-4"
    >
      <p className="mark !text-[0.56rem] text-[var(--n2)]">Find the venue</p>
      <p className="mt-2 text-[0.82rem] leading-snug text-[var(--ink-soft)]">
        Search OpenStreetMap and the venue, city, country and coordinates below
        are filled in for you. You can still edit any of them afterwards.
      </p>

      <div className="mt-3 flex flex-wrap gap-2">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              // The lookup sits inside the resource form, so Enter here would
              // otherwise submit the whole event.
              event.preventDefault();
              void search();
            }
          }}
          placeholder="e.g. Custard Factory Birmingham"
          className="min-w-0 flex-1 rounded-xl border border-[var(--edge)] bg-[var(--paper)] px-3 py-2 text-[0.85rem] placeholder:text-[var(--ink-faint)] focus:border-[var(--n2)] focus:outline-none"
        />

        <button
          type="button"
          onClick={() => void search()}
          disabled={busy}
          className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--edge)] px-3 py-2 font-mono text-[0.62rem] uppercase tracking-[0.12em] text-[var(--ink-soft)] transition-colors hover:border-[var(--n2)] hover:text-[var(--n2)] disabled:opacity-50"
        >
          {busy ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
          ) : (
            <Search className="h-3.5 w-3.5" aria-hidden />
          )}
          Search
        </button>
      </div>

      {error && (
        <p className="mt-2.5 text-[0.8rem] text-[var(--n1)]">{error}</p>
      )}

      {filled && (
        <p className="mt-2.5 flex items-start gap-2 text-[0.8rem] text-[var(--ink-soft)]">
          <Check
            className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--n2)]"
            aria-hidden
          />
          Filled from {filled}
        </p>
      )}

      {results.length > 0 && (
        <ul className="mt-3 flex flex-col gap-1.5">
          {results.map((place) => (
            <li key={`${place.lat},${place.lng},${place.label}`}>
              <button
                type="button"
                onClick={() => apply(place)}
                className="flex w-full items-start gap-2.5 rounded-xl border border-transparent p-2 text-left transition-colors hover:border-[var(--edge)] hover:bg-[var(--paper-3)]"
              >
                <MapPin
                  className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--n2)]"
                  aria-hidden
                />

                <span className="min-w-0">
                  <span className="block text-[0.84rem] font-semibold leading-tight">
                    {place.name}
                  </span>
                  <span className="mt-0.5 block text-[0.75rem] leading-snug text-[var(--ink-faint)]">
                    {place.label}
                  </span>
                  <span className="mt-0.5 block font-mono text-[0.6rem] tabular-nums text-[var(--ink-faint)]">
                    {place.lat.toFixed(5)}, {place.lng.toFixed(5)}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
