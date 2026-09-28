import { requireUser } from "../lib/dal.js";
import { connectToDatabase } from "../lib/db.js";
import { ActivityLog, Content, FanSubmission } from "../models/index.js";
import { getClippings, getClippingCounts } from "../lib/bookmarks-query.js";
import { getMyPasses } from "../lib/home.js";

/** First value of a possibly-repeated query key. */
function first(value) {
  return Array.isArray(value) ? value[0] : value;
}

// ── /dashboard ─────────────────────────────────────────────────────────────

async function dashboard({ searchParams }) {
  const user = await requireUser();

  await connectToDatabase();

  const [activity, clippings, counts, recommended, passes] = await Promise.all([
    ActivityLog.find({ userId: user.id })
      .sort({ createdAt: -1 })
      .limit(8)
      .lean(),
    getClippings(user.id).then((rows) => rows.slice(0, 4)),
    getClippingCounts(user.id),
    // Lead with the member's own channels; fall back to everything.
    Content.find({
      status: "published",
      ...(user.favoriteCategories.length > 0
        ? { category: { $in: user.favoriteCategories } }
        : {}),
    })
      .sort({ popularityScore: -1, createdAt: -1 })
      .limit(6)
      .lean(),
    getMyPasses(user.id),
  ]);

  // The recommendations render through the same `ContentCard` the explorer
  // and the front page use, so a piece looks identical wherever a member
  // meets it. That means mapping the lean documents onto the shape that card
  // expects rather than inventing a second, plainer card for this page.
  const picks = recommended.map((doc) => {
    const ratingCount = Number(doc.ratingCount ?? 0);
    const ratingSum = Number(doc.ratingSum ?? 0);
    return {
      id: String(doc._id),
      title: String(doc.title),
      slug: String(doc.slug),
      category: String(doc.category),
      type: String(doc.type),
      summary: String(doc.summary ?? ""),
      coverImage: String(doc.coverImage ?? ""),
      genre: doc.genre ?? [],
      releaseDate: doc.releaseDate
        ? new Date(doc.releaseDate).toISOString()
        : null,
      popularityScore: Number(doc.popularityScore ?? 0),
      viewCount: Number(doc.viewCount ?? 0),
      averageRating: ratingCount > 0 ? ratingSum / ratingCount : 0,
      ratingCount,
      mediaUrl: String(doc.mediaUrl ?? ""),
      mediaPoster: String(doc.mediaPoster ?? ""),
      mediaCredit: String(doc.mediaCredit ?? ""),
      mediaRuntime: String(doc.mediaRuntime ?? ""),
      mediaTags: doc.mediaTags ?? [],
    };
  });

  return {
    user: {
      name: user.name,
      role: user.role,
      avatarUrl: user.avatarUrl,
      favoriteCategories: user.favoriteCategories,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
    },
    // Only the two query flags the notices read (?denied=admin, ?welcome=1).
    params: {
      denied: first(searchParams.denied) ?? null,
      welcome: first(searchParams.welcome) ?? null,
    },
    activity: activity.map((entry) => ({
      _id: String(entry._id),
      label: entry.label ?? "",
      action: entry.action ?? "",
      createdAt: entry.createdAt,
    })),
    clippings,
    counts,
    picks,
    passes,
  };
}

// ── /bookmarks ─────────────────────────────────────────────────────────────

async function bookmarks({ searchParams }) {
  const user = await requireUser();
  const raw = first(searchParams.type);
  const activeType = ["content", "character", "merchandise", "event"].includes(
    raw ?? "",
  )
    ? raw
    : "";

  const [rows, counts] = await Promise.all([
    getClippings(user.id, activeType),
    getClippingCounts(user.id),
  ]);

  return { activeType, rows, counts };
}

// ── /submit ────────────────────────────────────────────────────────────────

async function submit() {
  const user = await requireUser();

  await connectToDatabase();
  const mine = await FanSubmission.find({ userId: user.id })
    .sort({ createdAt: -1 })
    .limit(10)
    .lean();

  return {
    user: { emailVerified: user.emailVerified },
    mine: mine.map((submission) => ({
      _id: String(submission._id),
      title: submission.title,
      status: submission.status,
      category: submission.category,
      format: submission.format,
      reviewNote: submission.reviewNote ?? "",
      createdAt: submission.createdAt,
    })),
  };
}

// ── /sitemap-page ──────────────────────────────────────────────────────────

/** Static page — nothing to load. */
const sitemap = async () => ({});

export const memberRoutes = [
  ["/dashboard", dashboard],
  ["/bookmarks", bookmarks],
  ["/submit", submit],
  ["/sitemap-page", sitemap],
];
