import { describe, expect, it } from "vitest";

import {
  EMBED_FRAME_ORIGINS,
  PROVIDER_SPECS,
  embedHref,
  embedKind,
  embedSrc,
  parseEmbed,
} from "./embeds.js";

/**
 * The embed parser decides what ends up in an `<iframe src>`, which makes it the
 * highest-consequence pure function in the codebase. These tests are written as
 * an adversary: most of them assert that something is *rejected*.
 */

describe("parseEmbed — recognising legitimate links", () => {
  it.each([
    ["https://www.youtube.com/watch?v=dQw4w9WgXcQ", "dQw4w9WgXcQ"],
    ["https://youtu.be/dQw4w9WgXcQ", "dQw4w9WgXcQ"],
    ["https://youtube.com/shorts/dQw4w9WgXcQ", "dQw4w9WgXcQ"],
    ["https://m.youtube.com/watch?v=dQw4w9WgXcQ&t=42s", "dQw4w9WgXcQ"],
    ["https://www.youtube.com/embed/dQw4w9WgXcQ", "dQw4w9WgXcQ"],
    // A bare paste, with no scheme — we add https ourselves.
    ["youtu.be/dQw4w9WgXcQ", "dQw4w9WgXcQ"],
    // Surrounding whitespace from a copy/paste.
    ["  https://youtu.be/dQw4w9WgXcQ  ", "dQw4w9WgXcQ"],
  ])("reads a YouTube id from %s", (input, id) => {
    expect(parseEmbed(input)).toEqual({ provider: "youtube", id });
  });

  it.each([
    ["https://vimeo.com/347119375", "347119375"],
    ["https://player.vimeo.com/video/347119375", "347119375"],
    // Unlisted links carry a private hash we intentionally drop.
    ["https://vimeo.com/347119375/a1b2c3d4e5", "347119375"],
  ])("reads a Vimeo id from %s", (input, id) => {
    expect(parseEmbed(input)).toEqual({ provider: "vimeo", id });
  });

  it("keeps the Spotify resource type alongside the id", () => {
    expect(
      parseEmbed("https://open.spotify.com/track/4uLU6hMCjMI75M1A2tKUQC"),
    ).toEqual({
      provider: "spotify",
      id: "track/4uLU6hMCjMI75M1A2tKUQC",
    });
  });

  it("strips Spotify's locale prefix", () => {
    expect(
      parseEmbed(
        "https://open.spotify.com/intl-de/album/4uLU6hMCjMI75M1A2tKUQC",
      ),
    ).toEqual({
      provider: "spotify",
      id: "album/4uLU6hMCjMI75M1A2tKUQC",
    });
  });

  it("reads a SoundCloud permalink as user/track", () => {
    expect(
      parseEmbed("https://soundcloud.com/artist-name/track-title"),
    ).toEqual({
      provider: "soundcloud",
      id: "artist-name/track-title",
    });
  });

  it("lower-cases SoundCloud permalinks, which are case-insensitive", () => {
    expect(parseEmbed("https://soundcloud.com/Artist/Track")?.id).toBe(
      "artist/track",
    );
  });
});

describe("parseEmbed — rejecting everything else", () => {
  it.each([
    ["an empty string", ""],
    ["whitespace", "   "],
    ["a javascript: URL", "javascript:alert(1)"],
    ["a data: URL", "data:text/html,<script>alert(1)</script>"],
    ["a file: URL", "file:///etc/passwd"],
    ["an unsupported host", "https://evil.example.com/watch?v=dQw4w9WgXcQ"],
    [
      "a lookalike suffix host",
      "https://youtube.com.evil.example/watch?v=dQw4w9WgXcQ",
    ],
    ["a lookalike prefix host", "https://notyoutube.com/watch?v=dQw4w9WgXcQ"],
    ["a YouTube URL with no id", "https://www.youtube.com/"],
    ["a YouTube channel page", "https://www.youtube.com/@someone"],
    ["a SoundCloud user page", "https://soundcloud.com/artist-name"],
    ["a SoundCloud set", "https://soundcloud.com/artist-name/sets"],
    ["a Vimeo URL with no numeric id", "https://vimeo.com/channels/staffpicks"],
    [
      "an unknown Spotify type",
      "https://open.spotify.com/artistx/4uLU6hMCjMI75M1A2tKUQC",
    ],
    ["not a URL at all", "just some text"],
  ])("rejects %s", (_label, input) => {
    expect(parseEmbed(input)).toBeNull();
  });

  it("rejects ids that are the wrong length for their provider", () => {
    // YouTube ids are exactly 11 characters.
    expect(parseEmbed("https://youtu.be/tooshort")).toBeNull();
    expect(parseEmbed("https://youtu.be/dQw4w9WgXcQextra")).toBeNull();
  });

  /**
   * Traversal is defused before it can matter, though not always by rejection.
   *
   * The URL parser normalises `/../` away while resolving the path, so
   * "soundcloud.com/../etc/passwd" reaches us as the permalink "etc/passwd" and
   * parses cleanly — it is simply a SoundCloud path with no track behind it.
   * That is harmless, because the origin is ours to supply and the id can never
   * carry a slash beyond its provider's pattern.
   *
   * So the property worth asserting is not "traversal is rejected" but the
   * stronger one: no traversal input can produce a URL off the provider's own
   * origin. Where the leftover also fails the id pattern, it is rejected outright.
   */
  it("cannot be walked off the provider's origin by traversal", () => {
    // Leftover fails YouTube's fixed 11-character pattern, so it is rejected.
    expect(parseEmbed("https://youtu.be/../../secret")).toBeNull();

    for (const hostile of [
      "https://soundcloud.com/../etc/passwd",
      "https://soundcloud.com/artist/../../../../etc/passwd",
      "https://open.spotify.com/../../track/4uLU6hMCjMI75M1A2tKUQC",
    ]) {
      const reference = parseEmbed(hostile);
      if (!reference) continue;

      const src = embedSrc(reference.provider, reference.id);
      expect(src).toBeTruthy();
      expect(
        EMBED_FRAME_ORIGINS.some((origin) => src.startsWith(`${origin}/`)),
      ).toBe(true);
    }
  });

  it("rejects ids carrying characters that have meaning in a URL", () => {
    for (const hostile of [
      'a"onload=x',
      "a'b",
      "a>b",
      "a%2Fb",
      "a\\b",
      "a#b",
    ]) {
      expect(parseEmbed(`https://youtu.be/${hostile}`)).toBeNull();
      expect(parseEmbed(`https://soundcloud.com/user/${hostile}`)).toBeNull();
    }
  });

  it("refuses absurdly long input rather than parsing it", () => {
    expect(parseEmbed(`https://youtu.be/${"a".repeat(5000)}`)).toBeNull();
  });

  it("does not treat a matching query string on a foreign host as a match", () => {
    expect(parseEmbed("https://evil.example.com/?v=dQw4w9WgXcQ")).toBeNull();
  });
});

describe("embedSrc — re-validating stored values", () => {
  it("builds a player URL for a valid reference", () => {
    expect(embedSrc("youtube", "dQw4w9WgXcQ")).toBe(
      "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?rel=0",
    );
  });

  it("refuses an unknown provider", () => {
    expect(embedSrc("evilhost", "dQw4w9WgXcQ")).toBeNull();
    expect(embedSrc("", "")).toBeNull();
  });

  /**
   * The point of this one: even if a bad row reached the database — a bug, a
   * migration, a direct write — rendering it still cannot produce an iframe
   * pointing somewhere we didn't choose.
   */
  it("refuses a stored id that does not match its provider's pattern", () => {
    expect(embedSrc("youtube", "../../../evil")).toBeNull();
    expect(embedSrc("youtube", '"><script>alert(1)</script>')).toBeNull();
    expect(embedSrc("spotify", "track/../../evil")).toBeNull();
    expect(embedSrc("soundcloud", "user/track?x=1")).toBeNull();
  });

  it("only ever produces URLs on the allow-listed frame origins", () => {
    const references = [
      ["youtube", "dQw4w9WgXcQ"],
      ["vimeo", "347119375"],
      ["spotify", "track/4uLU6hMCjMI75M1A2tKUQC"],
      ["soundcloud", "artist/track"],
    ];

    for (const [provider, id] of references) {
      const src = embedSrc(provider, id);
      expect(src).toBeTruthy();
      expect(
        EMBED_FRAME_ORIGINS.some((origin) => src.startsWith(`${origin}/`)),
      ).toBe(true);
    }
  });

  it("keeps every provider's frame origin in the CSP list", () => {
    // A provider added without updating the CSP would be silently unloadable.
    for (const spec of Object.values(PROVIDER_SPECS)) {
      const origin = new URL(spec.src("x")).origin;
      expect(EMBED_FRAME_ORIGINS).toContain(origin);
    }
  });
});

describe("embedHref and embedKind", () => {
  it("links back to the provider's own page", () => {
    expect(embedHref("youtube", "dQw4w9WgXcQ")).toBe(
      "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    );
    expect(embedHref("soundcloud", "artist/track")).toBe(
      "https://soundcloud.com/artist/track",
    );
  });

  it("applies the same validation as embedSrc", () => {
    expect(embedHref("youtube", "not-an-id")).toBeNull();
  });

  it("classifies providers so approval picks the right content type", () => {
    expect(embedKind("youtube")).toBe("video");
    expect(embedKind("vimeo")).toBe("video");
    expect(embedKind("spotify")).toBe("audio");
    expect(embedKind("soundcloud")).toBe("audio");
    expect(embedKind("nonsense")).toBeNull();
  });
});
