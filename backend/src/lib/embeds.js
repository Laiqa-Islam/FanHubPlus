/**
 * Third-party embeds (v2 Phase 11).
 *
 * The rule this file exists to enforce: **we never store or render a
 * member-supplied URL.** A pasted link is parsed down to a provider key and an
 * id, the id is validated against a strict per-provider charset, and only those
 * two values are persisted. The player URL is rebuilt from the provider table
 * at render time, so the origin, path and protocol of every iframe are decided
 * by this module and never by input.
 *
 * That is what makes an embed safe to put in an `<iframe src>`: there is no
 * string a member can submit that survives as markup, as a `javascript:` URL,
 * or as a different host. It is the same discipline as the allow-list in
 * `app/api/media/route.ts`, applied to frames instead of streams.
 *
 * Pure and dependency-free so it can be unit tested directly — see
 * `lib/embeds.test.ts`.
 */

export const EMBED_PROVIDERS = ["youtube", "vimeo", "spotify", "soundcloud"];

const SPOTIFY_TYPES = ["track", "album", "playlist", "episode", "show"];

export const PROVIDER_SPECS = {
  youtube: {
    label: "YouTube",
    kind: "video",
    example: "youtube.com/watch?v=… or youtu.be/…",
    idPattern: /^[A-Za-z0-9_-]{11}$/,
    frame: { aspect: "16 / 9" },
    // youtube-nocookie defers YouTube's tracking cookies until playback, which
    // is the friendlier default for readers who never press play.
    src: (id) => `https://www.youtube-nocookie.com/embed/${id}?rel=0`,
    href: (id) => `https://www.youtube.com/watch?v=${id}`,
  },
  vimeo: {
    label: "Vimeo",
    kind: "video",
    example: "vimeo.com/123456789",
    idPattern: /^\d{6,12}$/,
    frame: { aspect: "16 / 9" },
    src: (id) => `https://player.vimeo.com/video/${id}?dnt=1`,
    href: (id) => `https://vimeo.com/${id}`,
  },
  spotify: {
    label: "Spotify",
    kind: "audio",
    example: "open.spotify.com/track/…",
    // Stored as "<type>/<base62 id>" — the type decides the embed path, so it
    // has to travel with the id, and both halves are validated here.
    idPattern: new RegExp(`^(?:${SPOTIFY_TYPES.join("|")})/[A-Za-z0-9]{22}$`),
    frame: { height: 232 },
    src: (id) => `https://open.spotify.com/embed/${id}`,
    href: (id) => `https://open.spotify.com/${id}`,
  },
  soundcloud: {
    label: "SoundCloud",
    kind: "audio",
    example: "soundcloud.com/artist/track",
    // SoundCloud's widget takes a permalink rather than a numeric id, so the id
    // is the "<user>/<track>" path. The charset below is what SoundCloud allows
    // in a permalink slug; the host is still supplied by us, not by input.
    idPattern: /^[a-z0-9][a-z0-9_-]{1,60}\/[a-z0-9][a-z0-9_-]{1,80}$/,
    frame: { height: 166 },
    src: (id) =>
      `https://w.soundcloud.com/player/?url=${encodeURIComponent(
        `https://soundcloud.com/${id}`,
      )}&color=%23ff2e88&hide_related=true&show_comments=false&show_teaser=false`,
    href: (id) => `https://soundcloud.com/${id}`,
  },
};

/** Every origin an embed iframe may point at, for the CSP `frame-src`. */
export const EMBED_FRAME_ORIGINS = [
  "https://www.youtube-nocookie.com",
  "https://player.vimeo.com",
  "https://open.spotify.com",
  "https://w.soundcloud.com",
];

export function isEmbedProvider(value) {
  return typeof value === "string" && EMBED_PROVIDERS.includes(value);
}

/** Strips a leading "www." so host matching stays readable. */
function bareHost(hostname) {
  return hostname.replace(/^www\./, "").toLowerCase();
}

/**
 * Turns a pasted link into a provider + id, or null if it isn't a link we can
 * safely embed. Rejecting is always correct here — an unrecognised URL becomes
 * a "we don't support that platform" message, never a passthrough.
 */
export function parseEmbed(input) {
  const raw = (input ?? "").trim();
  if (!raw || raw.length > 400) return null;

  let url;
  try {
    // Accept a bare "youtu.be/x" paste, but only by adding https ourselves —
    // never by trusting a scheme the member typed.
    url = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
  } catch {
    return null;
  }

  if (url.protocol !== "https:" && url.protocol !== "http:") return null;

  const host = bareHost(url.hostname);
  // Collapse the path into clean segments so "/a//b/" and "/a/b" parse alike.
  const segments = url.pathname.split("/").filter(Boolean);

  const candidate = matchHost(host, segments, url);
  if (!candidate) return null;

  // The single gate every parse funnels through: an id that fails its
  // provider's pattern is discarded, not sanitised and not passed on.
  return PROVIDER_SPECS[candidate.provider].idPattern.test(candidate.id)
    ? candidate
    : null;
}

function matchHost(host, segments, url) {
  // ── YouTube ──
  if (host === "youtu.be") {
    return segments[0] ? { provider: "youtube", id: segments[0] } : null;
  }
  if (
    host === "youtube.com" ||
    host === "m.youtube.com" ||
    host === "youtube-nocookie.com"
  ) {
    const v = url.searchParams.get("v");
    if (v) return { provider: "youtube", id: v };
    // /embed/<id>, /shorts/<id>, /live/<id> all carry the id in slot two.
    if (
      ["embed", "shorts", "live", "v"].includes(segments[0] ?? "") &&
      segments[1]
    ) {
      return { provider: "youtube", id: segments[1] };
    }
    return null;
  }

  // ── Vimeo ──
  if (host === "vimeo.com") {
    // Unlisted links look like /123456789/abcdef0123 — the first segment is
    // still the id, and the private hash is intentionally dropped.
    const id = segments.find((segment) => /^\d+$/.test(segment));
    return id ? { provider: "vimeo", id } : null;
  }
  if (host === "player.vimeo.com" && segments[0] === "video" && segments[1]) {
    return { provider: "vimeo", id: segments[1] };
  }

  // ── Spotify ──
  if (host === "open.spotify.com") {
    // Localised links carry an /intl-de/ prefix ahead of the type.
    const parts = segments[0]?.startsWith("intl-")
      ? segments.slice(1)
      : segments;
    const [type, id] = parts[0] === "embed" ? parts.slice(1) : parts;
    if (!type || !id) return null;
    return { provider: "spotify", id: `${type.toLowerCase()}/${id}` };
  }

  // ── SoundCloud ──
  if (host === "soundcloud.com" || host === "m.soundcloud.com") {
    // A user page alone isn't playable, and /sets/ (playlists) needs the
    // widget's playlist mode, which this build doesn't offer.
    if (segments.length !== 2 || segments[1] === "sets") return null;
    return {
      provider: "soundcloud",
      id: `${segments[0]}/${segments[1]}`.toLowerCase(),
    };
  }

  return null;
}

/**
 * Player URL for a stored reference. Re-validates rather than trusting the
 * database, so a row written by an older or buggier code path still cannot
 * put an arbitrary string into an iframe `src`.
 */
export function embedSrc(provider, id) {
  if (!isEmbedProvider(provider)) return null;
  const spec = PROVIDER_SPECS[provider];
  if (!spec.idPattern.test(id)) return null;
  return spec.src(id);
}

/** Canonical link to the piece on the provider's own site. */
export function embedHref(provider, id) {
  if (!isEmbedProvider(provider)) return null;
  const spec = PROVIDER_SPECS[provider];
  if (!spec.idPattern.test(id)) return null;
  return spec.href(id);
}

/** Whether an embed publishes as a video or an audio piece. */
export function embedKind(provider) {
  return isEmbedProvider(provider) ? PROVIDER_SPECS[provider].kind : null;
}

/**
 * A still for an embedded piece, so its card isn't a blank rectangle.
 *
 * Only YouTube publishes thumbnails at a URL derivable from the id alone. The
 * others need an oEmbed round trip, which is not worth a network call on every
 * card render — those fall back to the card's own treatment.
 */
export function embedThumbnail(provider, id) {
  if (provider !== "youtube" || !PROVIDER_SPECS.youtube.idPattern.test(id))
    return "";
  // hqdefault exists for every video; maxresdefault 404s on older uploads.
  return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
}

/** Human list of what we accept, for form hints and error messages. */
export function supportedProviderList() {
  const labels = EMBED_PROVIDERS.map(
    (provider) => PROVIDER_SPECS[provider].label,
  );
  return `${labels.slice(0, -1).join(", ")} and ${labels.at(-1)}`;
}
