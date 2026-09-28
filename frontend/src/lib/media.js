/**
 * Resolves a stored media URL to something a player can load.
 *
 * Third-party licensed media is served through `/api/media`, which streams the
 * source same-origin. That keeps playback working where a client cannot reach
 * the upstream host directly, and avoids depending on upstream CORS headers.
 */
export function mediaSrc(url) {
  if (!url) return "";
  // Anything already local (a file in /public) is served as-is.
  if (url.startsWith("/")) return url;

  // Our own Cloudinary assets — member uploads — go direct. Proxying them would
  // mean paying for the same bytes twice and adding a hop to a CDN built for
  // exactly this, and `/api/media` deliberately allow-lists only the external
  // hosts the editorial library draws on, so routing them there would 403.
  if (url.includes("res.cloudinary.com/")) return url;

  return `/api/media?src=${encodeURIComponent(url)}`;
}
