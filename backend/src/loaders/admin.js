import { connectToDatabase } from "../lib/db.js";
import {
  Content,
  CharacterProfile,
  MerchandiseItem,
  Event,
  EventTicket,
  FaqEntry,
  Feedback,
  FanSubmission,
  User,
  ActivityLog,
} from "../models/index.js";
import { requireAdmin } from "../lib/dal.js";
import { getAdminStats } from "../lib/admin-stats.js";
import { categoryBySlug } from "../lib/constants.js";
import { embedHref } from "../lib/embeds.js";
import { formatDate, relativeTime } from "../lib/utils.js";

/**
 * Admin control panel loaders. Every one calls `requireAdmin()`, as the
 * original layout and pages did: the prefix gate is optimistic, this is the
 * real check. The rows handed to `ResourceManager` are built here exactly as
 * the original server components built them.
 */

// ── /admin (layout) ──────────────────────────────────────────────────────────

async function adminLayout() {
  const admin = await requireAdmin();
  return { admin: { id: admin.id, name: admin.name } };
}

// ── /admin ───────────────────────────────────────────────────────────────────

async function overview() {
  await requireAdmin();
  const stats = await getAdminStats();
  return { stats };
}

// ── /admin/content ───────────────────────────────────────────────────────────

async function content() {
  await requireAdmin();
  await connectToDatabase();
  const docs = await Content.find().sort({ createdAt: -1 }).limit(200).lean();

  const rows = docs.map((doc) => {
    const category = categoryBySlug(doc.category);
    return {
      id: String(doc._id),
      title: doc.title,
      meta: `${category?.name ?? doc.category} · ${doc.type} · ${doc.status} · ${formatDate(doc.releaseDate)} · ${(doc.viewCount ?? 0).toLocaleString()} views`,
      ink: `var(--ch-${category?.token ?? "anime"})`,
      values: {
        title: doc.title,
        category: doc.category,
        type: doc.type,
        summary: doc.summary ?? "",
        body: doc.body ?? "",
        coverImage: doc.coverImage ?? "",
        mediaUrl: doc.mediaUrl ?? "",
        genre: (doc.genre ?? []).join(", "),
        mediaTags: (doc.mediaTags ?? []).join(", "),
        // Printed back in the same shape the parser reads, so editing
        // an existing chronology is a round trip rather than a retype.
        timeline: (doc.timeline ?? [])
          .map((row) =>
            [row.label, row.title, row.body].filter(Boolean).join(" | "),
          )
          .join("\n"),
        // The form takes a URL; the record stores provider + id, so rebuild the
        // canonical link for editing rather than exposing the internal pair.
        embedUrl: embedHref(doc.embedProvider ?? "", doc.embedId ?? "") ?? "",
        transcript: doc.transcript ?? "",
        status: doc.status ?? "published",
      },
    };
  });

  return { rows };
}

// ── /admin/characters ────────────────────────────────────────────────────────

async function characters() {
  await requireAdmin();
  await connectToDatabase();
  const docs = await CharacterProfile.find()
    .sort({ createdAt: -1 })
    .limit(200)
    .lean();

  const rows = docs.map((doc) => {
    const category = categoryBySlug(doc.category);
    return {
      id: String(doc._id),
      title: doc.name,
      meta: `${category?.name ?? doc.category} · ${doc.franchise || "—"} · ${doc.grade || "no grade"}`,
      // The row is marked in the character's own accent, so the list reads the
      // same way the profile pages do.
      ink: doc.accent || `var(--ch-${category?.token ?? "anime"})`,
      values: {
        name: doc.name,
        category: doc.category,
        franchise: doc.franchise ?? "",
        imageUrl: doc.imageUrl ?? "",
        kanji: doc.kanji ?? "",
        role: doc.role ?? "",
        grade: doc.grade ?? "",
        sealMark: doc.sealMark ?? "",
        accent: doc.accent ?? "",
        affiliation: doc.affiliation ?? "",
        status: doc.status ?? "",
        troops: doc.troops ?? "",
        relationships: (doc.relationships ?? []).join(", "),
        skills: (doc.skills ?? []).join(", "),
        weapons: (doc.weapons ?? []).join(", "),
        traits: (doc.traits ?? []).join(", "),
        bio: doc.bio ?? "",
      },
    };
  });

  return { rows };
}

// ── /admin/merch ─────────────────────────────────────────────────────────────

async function merch() {
  await requireAdmin();
  await connectToDatabase();
  const docs = await MerchandiseItem.find()
    .sort({ createdAt: -1 })
    .limit(200)
    .lean();

  const rows = docs.map((doc) => {
    const category = categoryBySlug(doc.category);
    return {
      id: String(doc._id),
      title: doc.name,
      meta: `${category?.name ?? doc.category} · $${((doc.priceCents ?? 0) / 100).toFixed(2)} · ${doc.tag} · ${doc.isUpcoming ? "upcoming" : "released"} ${formatDate(doc.releaseDate)} · ${(doc.viewCount ?? 0).toLocaleString()} views`,
      ink: `var(--ch-${category?.token ?? "anime"})`,
      values: {
        name: doc.name,
        category: doc.category,
        tag: doc.tag ?? "Collectible",
        price: ((doc.priceCents ?? 0) / 100).toFixed(2),
        imageUrl: doc.imageUrl ?? "",
        description: doc.description ?? "",
        isUpcoming: Boolean(doc.isUpcoming),
      },
    };
  });

  return { rows };
}

// ── /admin/events ────────────────────────────────────────────────────────────

/** `datetime-local` needs `YYYY-MM-DDTHH:mm`, not an ISO string with a zone. */
function toLocalInput(date) {
  if (!date) return "";
  const d = new Date(date);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

async function events() {
  await requireAdmin();
  await connectToDatabase();
  const docs = await Event.find().sort({ startsAt: 1 }).limit(200).lean();

  const rows = docs.map((doc) => {
    const category = categoryBySlug(doc.category);
    const coordinates = doc.location?.coordinates ?? [0, 0];
    return {
      id: String(doc._id),
      title: doc.title,
      meta: `${category?.name ?? doc.category} · ${doc.type} · ${doc.city} · ${formatDate(doc.startsAt)}`,
      ink: `var(--ch-${category?.token ?? "anime"})`,
      values: {
        title: doc.title,
        category: doc.category,
        type: doc.type,
        venue: doc.venue ?? "",
        city: doc.city,
        country: doc.country ?? "",
        startsAt: toLocalInput(doc.startsAt),
        // Stored as GeoJSON [lng, lat]; the form asks for them separately.
        lat: String(coordinates[1] ?? 0),
        lng: String(coordinates[0] ?? 0),
        story: doc.story ?? "",
        ticketUrl: doc.ticketUrl ?? "",
        // The resource editor renders every field as a text input, so the
        // values it is handed are strings.
        capacity: String(doc.capacity ?? 0),
        description: doc.description ?? "",
      },
    };
  });

  return { rows };
}

// ── /admin/faq ───────────────────────────────────────────────────────────────

async function faq() {
  await requireAdmin();
  await connectToDatabase();
  const docs = await FaqEntry.find().sort({ createdAt: -1 }).limit(200).lean();

  const rows = docs.map((doc) => ({
    id: String(doc._id),
    title: doc.question,
    meta: `${doc.isPublished ? "published" : "hidden"} · used ${doc.useCount ?? 0}× · ${(doc.tags ?? []).join(", ") || "untagged"}`,
    values: {
      question: doc.question,
      answer: doc.answer,
      tags: (doc.tags ?? []).join(", "),
      isPublished: Boolean(doc.isPublished),
    },
  }));

  return { rows };
}

// ── /admin/tickets ───────────────────────────────────────────────────────────

async function tickets() {
  await requireAdmin();
  await connectToDatabase();

  // Pending first — this page exists to clear a queue, so anything already
  // decided is history and belongs underneath.
  const docs = await EventTicket.aggregate([
    {
      $addFields: {
        rank: { $cond: [{ $eq: ["$status", "pending"] }, 0, 1] },
      },
    },
    { $sort: { rank: 1, createdAt: -1 } },
    { $limit: 80 },
  ]);

  const eventIds = [...new Set(docs.map((d) => String(d.eventId)))];
  const userIds = [...new Set(docs.map((d) => String(d.userId)))];

  const [events, users] = await Promise.all([
    Event.find({ _id: { $in: eventIds } })
      .select("slug title city country startsAt category capacity")
      .lean(),
    User.find({ _id: { $in: userIds } })
      .select("name email")
      .lean(),
  ]);

  // The page rebuilds the id → record lookups from these lists.
  return { docs, events, users };
}

// ── /admin/submissions ───────────────────────────────────────────────────────

async function submissions() {
  await requireAdmin();
  await connectToDatabase();

  // Registering the User model before populate() runs is why models/index.js
  // exists as a barrel.
  void User;

  const pending = await FanSubmission.find({ status: "pending" })
    .sort({ createdAt: 1 })
    .populate("userId", "name email")
    .lean();

  const recent = await FanSubmission.find({ status: { $ne: "pending" } })
    .sort({ reviewedAt: -1 })
    .limit(8)
    .lean();

  return { pending, recent };
}

// ── /admin/feedback ──────────────────────────────────────────────────────────

async function feedback() {
  await requireAdmin();
  await connectToDatabase();

  // Open reports first, then newest — triage order, not chronological.
  const docs = await Feedback.aggregate([
    {
      $addFields: {
        rank: {
          $switch: {
            branches: [
              { case: { $eq: ["$status", "open"] }, then: 0 },
              { case: { $eq: ["$status", "in-review"] }, then: 1 },
            ],
            default: 2,
          },
        },
      },
    },
    { $sort: { rank: 1, createdAt: -1 } },
    { $limit: 200 },
  ]);

  const items = docs.map((doc) => ({
    id: String(doc._id),
    type: doc.type,
    subject: doc.subject || "(no subject)",
    message: doc.message,
    name: doc.name ?? "",
    email: doc.email ?? "",
    status: doc.status ?? "open",
    adminNote: doc.adminNote ?? "",
    at: relativeTime(doc.createdAt),
  }));

  return { items };
}

// ── /admin/users ─────────────────────────────────────────────────────────────

async function users() {
  const admin = await requireAdmin();
  await connectToDatabase();

  const docs = await User.find().sort({ createdAt: -1 }).limit(200).lean();

  // One aggregate for everyone's last activity, rather than a query per row.
  const lastSeen = await ActivityLog.aggregate([
    { $sort: { createdAt: -1 } },
    { $group: { _id: "$userId", at: { $first: "$createdAt" } } },
  ]);
  const seenMap = new Map(lastSeen.map((row) => [String(row._id), row.at]));

  const list = docs.map((doc) => {
    const seen = seenMap.get(String(doc._id));
    return {
      id: String(doc._id),
      name: doc.name,
      email: doc.email,
      role: doc.role ?? "user",
      avatarUrl: doc.avatarUrl ?? "",
      verified: Boolean(doc.emailVerifiedAt),
      joined: formatDate(doc.createdAt),
      lastSeen: seen ? relativeTime(seen) : "never",
      channels: (doc.favoriteCategories ?? []).length,
      isSelf: String(doc._id) === admin.id,
    };
  });

  return { users: list };
}

export const adminRoutes = [
  ["/admin/_layout", adminLayout],
  ["/admin", overview],
  ["/admin/content", content],
  ["/admin/characters", characters],
  ["/admin/merch", merch],
  ["/admin/events", events],
  ["/admin/faq", faq],
  ["/admin/tickets", tickets],
  ["/admin/submissions", submissions],
  ["/admin/feedback", feedback],
  ["/admin/users", users],
];
