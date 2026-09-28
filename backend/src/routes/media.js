
import { MEDIA_SOURCE_HOSTS } from "../lib/media-hosts.js";

/**
 * Streams the licensed media library through the application.
 *
 * Why proxy rather than pointing <video> straight at the origin:
 *  · Same-origin playback keeps working where a client blocks third-party
 *    media hosts (corporate networks, privacy extensions, strict profiles).
 *  · No dependence on the upstream sending permissive CORS headers.
 *  · Range requests are forwarded, so seeking works.
 *
 * The allowlist is the important part. Forwarding an arbitrary caller-supplied
 * URL would turn this route into an open proxy and an SSRF vector — anything
 * not on this list is refused.
 */

const ALLOWED_HOSTS = new Set(MEDIA_SOURCE_HOSTS);

/** Only media types — never let this route relay HTML or scripts. */
const ALLOWED_PREFIXES = ["video/", "audio/", "image/"];

export async function GET(request) {
  const src = new URL(request.url).searchParams.get("src");
  if (!src) {
    return Response.json({ error: "Missing src" }, { status: 400 });
  }

  let target;
  try {
    target = new URL(src);
  } catch {
    return Response.json({ error: "Invalid src" }, { status: 400 });
  }

  if (target.protocol !== "https:" || !ALLOWED_HOSTS.has(target.hostname)) {
    return Response.json({ error: "Host not allowed" }, { status: 403 });
  }

  // Forward the range header so the player can seek without pulling the
  // whole file, and so large files start playing immediately.
  const range = request.headers.get("range");

  try {
    const upstream = await fetch(target, {
      headers: range ? { Range: range } : undefined,
      // Archive.org and friends redirect to a storage node.
      redirect: "follow",
      signal: AbortSignal.timeout(20_000),
    });

    if (!upstream.ok && upstream.status !== 206) {
      return Response.json(
        { error: `Upstream responded ${upstream.status}` },
        { status: 502 },
      );
    }

    const contentType =
      upstream.headers.get("content-type") ?? "application/octet-stream";
    if (!ALLOWED_PREFIXES.some((prefix) => contentType.startsWith(prefix))) {
      return Response.json(
        { error: "Unsupported media type" },
        { status: 415 },
      );
    }

    const headers = new Headers({
      "Content-Type": contentType,
      "Accept-Ranges": "bytes",
      // These files are immutable, so let the browser and any CDN keep them.
      "Cache-Control": "public, max-age=86400, immutable",
    });

    for (const header of [
      "content-length",
      "content-range",
      "last-modified",
      "etag",
    ]) {
      const value = upstream.headers.get(header);
      if (value) headers.set(header, value);
    }

    return new Response(upstream.body, {
      status: upstream.status,
      headers,
    });
  } catch (error) {
    console.error("[api/media] proxy failed:", target.href, error);
    return Response.json(
      { error: "Upstream unreachable" },
      { status: 504 },
    );
  }
}
