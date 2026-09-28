/**
 * The eight fandom categories from the SRS. Each carries its own accent hue so
 * category pages, cards and filter chips are colour-coded consistently across
 * the app.
 */
export const CATEGORIES = [
  {
    slug: "anime",
    // `token` names the CSS custom property (--ch-<token>) so theme-aware
    // colours survive light/dark; `accent` is the raw dark-mode hex for
    // contexts that can't read CSS vars (canvas, emails, og-images).
    token: "anime",
    name: "Anime",
    tagline: "Seasonal simulcasts, shonen epics, and studio deep dives.",
    accent: "#FF4D6D",
  },
  {
    slug: "gaming",
    token: "gaming",
    name: "Gaming",
    tagline: "Launches, lore, speedruns, and the meta that moves them.",
    accent: "#2BE08F",
  },
  {
    slug: "movies",
    token: "movies",
    name: "Movies",
    tagline: "Blockbusters, indie gems, and everything between the credits.",
    accent: "#FFB020",
  },
  {
    slug: "tv-shows",
    token: "tv",
    name: "TV Shows",
    tagline: "Season arcs, finale theories, and the shows worth the binge.",
    accent: "#4D9FFF",
  },
  {
    slug: "k-pop",
    token: "kpop",
    name: "K-Pop",
    tagline: "Comebacks, choreography, and concept photo drops.",
    accent: "#C56BFF",
  },
  {
    slug: "comics",
    token: "comics",
    name: "Comics",
    tagline: "Runs, crossovers, variant covers, and capes.",
    accent: "#FF7A3D",
  },
  {
    slug: "manga",
    token: "manga",
    name: "Manga",
    tagline: "Weekly chapters, mangaka craft, and panel breakdowns.",
    accent: "#8FA3BF",
  },
  {
    slug: "cosplay",
    token: "cosplay",
    name: "Cosplay",
    tagline: "Builds, wigs, worbla, and convention-floor legends.",
    accent: "#18D8E5",
  },
];

export const CATEGORY_SLUGS = CATEGORIES.map((c) => c.slug);

export function categoryBySlug(slug) {
  return CATEGORIES.find((c) => c.slug === slug);
}

/** Roles, ordered least → most privileged. */
export const ROLES = ["visitor", "user", "admin"];

/** Content types a Content document can take (SRS §1.8 data model). */
export const CONTENT_TYPES = ["article", "video", "audio", "image"];

/** Merchandise discovery tags, backend-driven per the SRS. */
export const MERCH_TAGS = [
  "Limited Edition",
  "Pre-Order",
  "Collectible",
  "Exclusive",
  "Restock",
];

export const FEEDBACK_TYPES = ["bug", "suggestion", "query"];

export const EVENT_TYPES = [
  "convention",
  "meetup",
  "screening",
  "premiere",
  "concert",
];

export const SORT_OPTIONS = [
  { value: "latest", label: "Latest" },
  { value: "popular", label: "Most popular" },
  { value: "alphabetical", label: "A–Z" },
];
