// Shared with the backend query layer (backend/src/lib/queries.js), so the
// explorer's links serialise filters exactly as the server parses them.

/** Serialises filters back into a query string, dropping empties. */
export function buildSearchParams(filters, overrides = {}) {
  const params = new URLSearchParams();
  const merged = { ...filters, ...overrides };

  for (const [key, value] of Object.entries(merged)) {
    if (value === "" || value === undefined || value === null) continue;
    if (key === "page" && Number(value) === 1) continue;
    if (key === "sort" && value === "latest") continue;
    params.set(key, String(value));
  }

  const qs = params.toString();
  return qs ? `?${qs}` : "";
}
