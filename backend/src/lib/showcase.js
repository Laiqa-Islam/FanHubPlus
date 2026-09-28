import { connectToDatabase } from "./db.js";
import { MerchandiseItem, Content } from "../models/index.js";

/** Merchandise storefront and upcoming releases (SRS FR-7). */

const asMerchFilter = (f) => f;

function toMerchItem(doc) {
  return {
    id: String(doc._id),
    name: String(doc.name ?? ""),
    slug: String(doc.slug ?? ""),
    category: String(doc.category ?? ""),
    description: String(doc.description ?? ""),
    priceCents: Number(doc.priceCents ?? 0),
    imageUrl: String(doc.imageUrl ?? ""),
    gallery: doc.gallery ?? [],
    tag: String(doc.tag ?? ""),
    isUpcoming: Boolean(doc.isUpcoming),
    releaseDate: doc.releaseDate
      ? new Date(doc.releaseDate).toISOString()
      : null,
    viewCount: Number(doc.viewCount ?? 0),
    popularityScore: Number(doc.popularityScore ?? 0),
  };
}

export async function getMerch(options) {
  await connectToDatabase();
  const filter = {};
  if (options.category) filter.category = options.category;
  if (options.tag) filter.tag = options.tag;
  if (options.upcomingOnly) filter.isUpcoming = true;

  const docs = await MerchandiseItem.find(asMerchFilter(filter))
    .sort({ isUpcoming: -1, releaseDate: -1 })
    .lean();

  return docs.map((doc) => toMerchItem(doc));
}

/** Groups the showcase by fandom, which is how the SRS asks for it. */
export async function getMerchByCategory(category) {
  const items = await getMerch({ category });
  const grouped = new Map();
  for (const item of items) {
    const bucket = grouped.get(item.category) ?? [];
    bucket.push(item);
    grouped.set(item.category, bucket);
  }
  return grouped;
}

export async function getMerchBySlug(slug) {
  await connectToDatabase();
  const doc = await MerchandiseItem.findOne({ slug }).lean();
  return doc ? toMerchItem(doc) : null;
}

export async function getRelatedMerch(category, excludeSlug, limit = 4) {
  await connectToDatabase();
  const docs = await MerchandiseItem.find(
    asMerchFilter({ category, slug: { $ne: excludeSlug } }),
  )
    .sort({ popularityScore: -1 })
    .limit(limit)
    .lean();
  return docs.map((doc) => toMerchItem(doc));
}

/** Popularity tracking (SRS FR-7, optional). Best-effort, never blocking. */
export async function incrementMerchViews(slug) {
  try {
    await connectToDatabase();
    await MerchandiseItem.updateOne({ slug }, { $inc: { viewCount: 1 } });
  } catch (error) {
    console.error("[showcase] merch view increment failed:", error);
  }
}

/**
 * The upcoming-releases feed: anticipated merch drops alongside content dated
 * in the future, merged into one chronological run.
 */
export async function getUpcoming(category) {
  await connectToDatabase();
  const now = new Date();

  const merchFilter = { isUpcoming: true };
  const contentFilter = {
    status: "published",
    releaseDate: { $gt: now },
  };
  if (category) {
    merchFilter.category = category;
    contentFilter.category = category;
  }

  const [merch, content] = await Promise.all([
    MerchandiseItem.find(asMerchFilter(merchFilter))
      .sort({ releaseDate: 1 })
      .lean(),
    Content.find(contentFilter).sort({ releaseDate: 1 }).limit(12).lean(),
  ]);

  const entries = [
    ...merch.map((item) => ({
      id: String(item._id),
      kind: "merchandise",
      title: item.name,
      href: `/merch/${item.slug}`,
      category: item.category,
      description: item.description ?? "",
      imageUrl: item.imageUrl ?? "",
      tag: item.tag ?? "",
      releaseDate: item.releaseDate
        ? new Date(item.releaseDate).toISOString()
        : null,
    })),
    ...content.map((item) => ({
      id: String(item._id),
      kind: "content",
      title: item.title,
      href: `/content/${item.slug}`,
      category: item.category,
      description: item.summary ?? "",
      imageUrl: item.coverImage ?? "",
      tag: item.type ?? "",
      releaseDate: item.releaseDate
        ? new Date(item.releaseDate).toISOString()
        : null,
    })),
  ];

  // Undated entries sort last rather than jumping to the front.
  return entries.sort((a, b) => {
    if (!a.releaseDate) return 1;
    if (!b.releaseDate) return -1;
    return a.releaseDate.localeCompare(b.releaseDate);
  });
}
