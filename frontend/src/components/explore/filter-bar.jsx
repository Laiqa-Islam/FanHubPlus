import { useRouter, usePathname, useSearchParams } from "@/lib/navigation";
import { useEffect, useState, useTransition, useCallback } from "react";
import { useNavigation } from "react-router";
import { Search, X, SlidersHorizontal, Loader2 } from "lucide-react";

import { CATEGORIES, CONTENT_TYPES, SORT_OPTIONS } from "@/lib/constants";
import { cn } from "@/lib/utils";

/**
 * Multi-level filtering + sorting for the Explorer (SRS FR-3).
 *
 * Every control writes to the URL rather than to local state, so a filtered
 * view is shareable and survives refresh and the back button. The server
 * component re-renders from those params.
 */
export function FilterBar({ genres, years, total, lockedCategory }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [transitionPending, startTransition] = useTransition();
  // The transition only covers starting the navigation; the results are
  // still loading until the router settles.
  const navigation = useNavigation();
  const isPending = transitionPending || navigation.state === "loading";
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [term, setTerm] = useState(searchParams.get("q") ?? "");

  const current = useCallback(
    (key) => searchParams.get(key) ?? "",
    [searchParams],
  );

  /** Writes one param and resets paging, since page 3 of a new filter is meaningless. */
  const setParam = useCallback(
    (key, value) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) params.set(key, value);
      else params.delete(key);
      params.delete("page");

      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
      });
    },
    [router, pathname, searchParams],
  );

  // Debounce the search box so typing doesn't fire a request per keystroke.
  useEffect(() => {
    if (term === (searchParams.get("q") ?? "")) return;
    const timeout = setTimeout(() => setParam("q", term), 350);
    return () => clearTimeout(timeout);
  }, [term, searchParams, setParam]);

  const activeCount = ["category", "type", "genre", "year"].filter((key) =>
    Boolean(current(key)),
  ).length;

  function clearAll() {
    setTerm("");
    startTransition(() => router.push(pathname, { scroll: false }));
  }

  return (
    <div className="mb-10">
      {/* Search + sort */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--ink-faint)]"
            aria-hidden
          />

          <input
            type="search"
            value={term}
            onChange={(event) => setTerm(event.target.value)}
            placeholder="Search titles, summaries and tags…"
            aria-label="Search content"
            className="w-full rounded-full border border-[var(--edge)] bg-[var(--paper-3)] py-3 pl-11 pr-11 text-[0.92rem] text-[var(--ink)] placeholder:text-[var(--ink-faint)] transition-[border-color,box-shadow] focus:border-[var(--n2)] focus:shadow-[0_0_18px_color-mix(in_oklch,var(--n2)_25%,transparent)] focus:outline-none"
          />

          {isPending && (
            <Loader2
              className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-[var(--n2)]"
              aria-hidden
            />
          )}
        </div>

        <div className="flex gap-2">
          <label className="sr-only" htmlFor="sort">
            Sort results
          </label>
          <select
            id="sort"
            value={current("sort") || "latest"}
            onChange={(event) => setParam("sort", event.target.value)}
            className="cursor-pointer rounded-full border border-[var(--edge)] bg-[var(--paper-3)] px-4 py-3 text-[0.88rem] text-[var(--ink)] transition-colors focus:border-[var(--n2)] focus:outline-none"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => setShowAdvanced((open) => !open)}
            aria-expanded={showAdvanced}
            className={cn(
              "inline-flex items-center gap-2 rounded-full border px-4 py-3 text-[0.88rem] transition-colors",
              showAdvanced || activeCount > 0
                ? "border-[var(--n1)] text-[var(--n1)]"
                : "border-[var(--edge)] text-[var(--ink-soft)] hover:border-[var(--edge-strong)] hover:text-[var(--ink)]",
            )}
          >
            <SlidersHorizontal className="h-4 w-4" aria-hidden />
            Filters
            {activeCount > 0 && (
              <span className="grid h-5 min-w-5 place-items-center rounded-full bg-[var(--n1)] px-1 font-mono text-[0.62rem] text-[var(--void)]">
                {activeCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Advanced filters */}
      {showAdvanced && (
        <div className="mt-4 grid gap-4 rounded-2xl border border-[var(--edge)] bg-[var(--paper-3)] p-5 sm:grid-cols-2 lg:grid-cols-4">
          {!lockedCategory && (
            <FilterSelect
              label="Channel"
              value={current("category")}
              onChange={(value) => setParam("category", value)}
              options={CATEGORIES.map((c) => ({
                value: c.slug,
                label: c.name,
              }))}
              allLabel="All channels"
            />
          )}

          <FilterSelect
            label="Format"
            value={current("type")}
            onChange={(value) => setParam("type", value)}
            options={CONTENT_TYPES.map((t) => ({ value: t, label: t }))}
            allLabel="All formats"
          />

          <FilterSelect
            label="Genre"
            value={current("genre")}
            onChange={(value) => setParam("genre", value)}
            options={genres.map((g) => ({ value: g, label: g }))}
            allLabel="All genres"
          />

          <FilterSelect
            label="Release year"
            value={current("year")}
            onChange={(value) => setParam("year", value)}
            options={years.map((y) => ({ value: String(y), label: String(y) }))}
            allLabel="Any year"
          />
        </div>
      )}

      {/* Result count + active filter chips */}
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <p className="font-mono text-[0.66rem] uppercase tracking-[0.13em] text-[var(--ink-faint)]">
          {total} {total === 1 ? "result" : "results"}
        </p>

        {["category", "type", "genre", "year"].map((key) => {
          const value = current(key);
          if (!value || (key === "category" && lockedCategory)) return null;
          const label =
            key === "category"
              ? (CATEGORIES.find((c) => c.slug === value)?.name ?? value)
              : value;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setParam(key, "")}
              className="inline-flex items-center gap-1.5 rounded-full border border-[var(--n1)] bg-[var(--spot-wash)] px-3 py-1 text-[0.76rem] text-[var(--spot-deep)] transition-opacity hover:opacity-80"
            >
              {label}
              <X className="h-3 w-3" aria-hidden />
              <span className="sr-only">Remove {key} filter</span>
            </button>
          );
        })}

        {(activeCount > 0 || term) && (
          <button
            type="button"
            onClick={clearAll}
            className="text-[0.76rem] text-[var(--ink-soft)] underline-offset-4 transition-colors hover:text-[var(--n2)] hover:underline"
          >
            Clear all
          </button>
        )}
      </div>
    </div>
  );
}

function FilterSelect({ label, value, onChange, options, allLabel }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-[var(--ink-faint)]">
        {label}
      </label>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="cursor-pointer rounded-xl border border-[var(--edge)] bg-[var(--paper-2)] px-3 py-2.5 text-[0.88rem] capitalize text-[var(--ink)] transition-colors focus:border-[var(--n2)] focus:outline-none"
      >
        <option value="">{allLabel}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
