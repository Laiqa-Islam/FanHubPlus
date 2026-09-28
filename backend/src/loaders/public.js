import { connectToDatabase } from "../lib/db.js";
import { Content, CharacterProfile } from "../models/index.js";
import { categoryBySlug } from "../lib/constants.js";
import { notFound } from "../lib/request-context.js";
import { getHomeExtras } from "../lib/home.js";
import { getCurrentUser } from "../lib/dal.js";
import { isBookmarked } from "../actions/bookmarks.js";
import { getMyRating } from "../actions/ratings.js";
import {
  parseFilters,
  searchContent,
  getFilterFacets,
  getMediaLibrary,
  getContentBySlug,
  getRelatedContent,
  incrementViewCount,
} from "../lib/queries.js";

/** Collapses repeated query keys to their first value. */
function firstValues(searchParams) {
  return Object.fromEntries(
    Object.entries(searchParams).map(([key, value]) => [
      key,
      Array.isArray(value) ? value[0] : value,
    ]),
  );
}

// ── / ──────────────────────────────────────────────────────────────────────

/** Front-page selection: the lead, the contents column, and the clippings. */
async function getFrontPage() {
  const empty = {
    lead: null,
    secondary: [],
    rest: [],
    total: 0,
    headlines: [],
  };

  try {
    await connectToDatabase();
    const docs = await Content.find({ status: "published" })
      .sort({ popularityScore: -1, createdAt: -1 })
      .limit(13)
      .lean();

    const total = await Content.countDocuments({ status: "published" });

    const items = docs.map((doc) => {
      const ratingCount = Number(doc.ratingCount ?? 0);
      const ratingSum = Number(doc.ratingSum ?? 0);
      return {
        id: String(doc._id),
        title: doc.title,
        slug: doc.slug,
        category: doc.category,
        type: doc.type,
        summary: doc.summary ?? "",
        coverImage: doc.coverImage ?? "",
        genre: doc.genre ?? [],
        releaseDate: doc.releaseDate
          ? new Date(doc.releaseDate).toISOString()
          : null,
        popularityScore: Number(doc.popularityScore ?? 0),
        viewCount: Number(doc.viewCount ?? 0),
        averageRating: ratingCount > 0 ? ratingSum / ratingCount : 0,
        ratingCount,
        mediaUrl: doc.mediaUrl ?? "",
        mediaPoster: doc.mediaPoster ?? "",
        mediaCredit: doc.mediaCredit ?? "",
        mediaRuntime: doc.mediaRuntime ?? "",
        mediaTags: doc.mediaTags ?? [],
      };
    });

    return {
      lead: items[0] ?? null,
      secondary: items.slice(1, 6),
      rest: items.slice(6, 14),
      total,
      headlines: items.slice(0, 8).map((item) => item.title),
    };
  } catch (error) {
    console.error("[home] front page unavailable:", error);
    return empty;
  }
}

async function home() {
  // Both halves of the page are independent reads, so they go out together
  // rather than the lower sections waiting on the editorial spread.
  const [front, extras] = await Promise.all([getFrontPage(), getHomeExtras()]);
  return { ...front, extras };
}

// ── /explore ───────────────────────────────────────────────────────────────

async function explore({ searchParams }) {
  const filters = parseFilters(firstValues(searchParams));

  const [{ items, total, pageCount }, facets] = await Promise.all([
    searchContent(filters),
    getFilterFacets(filters.category || undefined),
  ]);

  return { filters, items, total, pageCount, facets };
}

// ── /category/:slug ────────────────────────────────────────────────────────

async function category({ params, searchParams }) {
  const { slug } = params;
  const channel = categoryBySlug(slug);
  if (!channel) notFound();

  const filters = parseFilters({
    ...firstValues(searchParams),
    // The channel is fixed by the route, so it overrides any param.
    category: slug,
  });

  await connectToDatabase();

  const [{ items, total, pageCount }, facets, characters] = await Promise.all([
    searchContent(filters),
    getFilterFacets(slug),
    CharacterProfile.find({ category: channel.slug })
      .select("slug name franchise bio")
      .sort({ popularityScore: -1 })
      .limit(4)
      .lean(),
  ]);

  return {
    filters,
    items,
    total,
    pageCount,
    facets,
    characters: characters.map((c) => ({
      id: String(c._id),
      slug: c.slug,
      name: c.name,
      franchise: c.franchise ?? "",
      bio: c.bio ?? "",
    })),
  };
}

// ── /content/:slug ─────────────────────────────────────────────────────────

async function contentDetail({ params }) {
  const { slug } = params;
  const item = await getContentBySlug(slug);
  if (!item) notFound();

  const [related, user, myRating, clipped] = await Promise.all([
    getRelatedContent(item.category, slug),
    getCurrentUser(),
    getMyRating(item.id),
    isBookmarked("content", item.id),
  ]);

  // Popularity tracking (SRS FR-7, optional). Deliberately not awaited — a
  // counter must never delay or break the page.
  void incrementViewCount(slug);

  return {
    item,
    related,
    myRating,
    clipped,
    signedIn: Boolean(user),
    canRate: Boolean(user?.emailVerified),
  };
}

// ── /media ─────────────────────────────────────────────────────────────────

async function media({ searchParams }) {
  const rawType = firstValues(searchParams).type;
  const activeType = ["video", "audio", "image"].includes(rawType ?? "")
    ? rawType
    : "";

  // Fetched unfiltered, then narrowed here, so the tabs can carry their own
  // counts. A tab that does not say how much is behind it is a guess, and
  // "Listen" hiding five tracks looked identical to it hiding none.
  const all = await getMediaLibrary();
  const items = activeType ? all.filter((item) => item.type === activeType) : all;

  const counts = { "": all.length };
  for (const item of all) counts[item.type] = (counts[item.type] ?? 0) + 1;

  return { activeType, items, counts, totalCount: all.length };
}

// Pages whose content is entirely client-side still go through the loader
// endpoint, so the route gating above them applies.
const staticPage = async () => ({});

export const publicRoutes = [
  ["/", home],
  ["/explore", explore],
  ["/category/:slug", category],
  ["/content/:slug", contentDetail],
  ["/media", media],
  ["/cart", staticPage],
  ["/checkout", staticPage],
];
