import QRCode from "qrcode";

import { connectToDatabase } from "../lib/db.js";
import { CharacterProfile, Event, EventTicket } from "../models/index.js";
import { CATEGORY_SLUGS, MERCH_TAGS } from "../lib/constants.js";
import { notFound, headers } from "../lib/request-context.js";
import { getCurrentUser, requireUser } from "../lib/dal.js";
import { getBookmarkedIds, isBookmarked } from "../actions/bookmarks.js";
import { getMyTicket, getTicketAvailability } from "../actions/tickets.js";
import { getEvents, getEventCities } from "../lib/events-query.js";
import {
  getMerch,
  getMerchBySlug,
  getRelatedMerch,
  incrementMerchViews,
  getUpcoming,
} from "../lib/showcase.js";

/** First value of a possibly-repeated query key. */
function one(searchParams, key) {
  const value = searchParams[key];
  return Array.isArray(value) ? value[0] : value;
}

// ── /characters ────────────────────────────────────────────────────────────

async function characters({ searchParams }) {
  const rawCategory = one(searchParams, "category");
  const activeCategory = CATEGORY_SLUGS.includes(rawCategory)
    ? rawCategory
    : "";

  const rawFranchise = one(searchParams, "franchise");
  const activeFranchise = String(rawFranchise ?? "").slice(0, 60);

  await connectToDatabase();

  const filter = {};
  if (activeCategory) filter.category = activeCategory;
  if (activeFranchise) filter.franchise = activeFranchise;

  const [list, franchises] = await Promise.all([
    CharacterProfile.find(filter).sort({ popularityScore: -1, name: 1 }).lean(),
    CharacterProfile.distinct(
      "franchise",
      activeCategory ? { category: activeCategory } : {},
    ),
  ]);

  return { activeCategory, activeFranchise, characters: list, franchises };
}

// ── /characters/:slug ──────────────────────────────────────────────────────

async function characterDetail({ params }) {
  const { slug } = params;
  await connectToDatabase();
  const character = await CharacterProfile.findOne({ slug }).lean();
  if (!character) notFound();

  const [siblings, user, clipped] = await Promise.all([
    CharacterProfile.find({
      franchise: character.franchise,
      slug: { $ne: slug },
    })
      .limit(4)
      .lean(),
    getCurrentUser(),
    isBookmarked("character", String(character._id)),
  ]);

  return { character, siblings, clipped, signedIn: Boolean(user) };
}

// ── /events ────────────────────────────────────────────────────────────────

/** Midnight today, so an event happening later on is still "ahead". */
function today() {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now;
}

async function events({ searchParams }) {
  const startOfToday = today();
  const raw = one(searchParams, "category");
  const activeCategory = CATEGORY_SLUGS.includes(raw) ? raw : "";

  const [list, cities, user] = await Promise.all([
    getEvents({ category: activeCategory }),
    getEventCities(),
    getCurrentUser(),
  ]);

  const clipped = await getBookmarkedIds(
    "event",
    list.map((event) => event.id),
  );

  // The reel leads the page, so it only carries what is still ahead — a
  // highlight that has already happened is a listing, not a highlight. It
  // follows the channel filter, so narrowing to K-Pop narrows the reel too.
  const highlights = list
    .filter(
      (event) => event.isHighlight && new Date(event.startsAt) >= startOfToday,
    )
    .slice(0, 6);

  return {
    activeCategory,
    events: list,
    cities,
    highlights,
    clippedIds: [...clipped],
    signedIn: Boolean(user),
  };
}

// ── /events/:slug ──────────────────────────────────────────────────────────

/**
 * The next few events other than this one. The `$gte` bound reads the clock,
 * which is why it lives here rather than in the page.
 */
async function loadRelated(slug) {
  return Event.find({ slug: { $ne: slug }, startsAt: { $gte: new Date() } })
    .select("slug title city country startsAt imageUrl category type")
    .sort({ startsAt: 1 })
    .limit(3)
    .lean();
}

async function eventDetail({ params }) {
  const { slug } = params;
  await connectToDatabase();
  const event = await Event.findOne({ slug }).lean();
  if (!event) notFound();

  const id = String(event._id);
  // Reading the clock is impure, so "has it happened" is settled here.
  const hasPassed = new Date(event.startsAt).getTime() < Date.now();

  const [user, clipped, availability, ticket, related] = await Promise.all([
    getCurrentUser(),
    getBookmarkedIds("event", [id]),
    getTicketAvailability(id, Number(event.capacity ?? 0)),
    getMyTicket(id),
    loadRelated(slug),
  ]);

  return {
    event,
    hasPassed,
    clippedIds: [...clipped],
    availability,
    ticket,
    related,
    signedIn: Boolean(user),
    emailVerified: Boolean(user?.emailVerified),
  };
}

// ── /merch ─────────────────────────────────────────────────────────────────

async function merch({ searchParams }) {
  const rawCategory = one(searchParams, "category");
  const activeCategory = CATEGORY_SLUGS.includes(rawCategory)
    ? rawCategory
    : "";
  const rawTag = one(searchParams, "tag");
  const activeTag = MERCH_TAGS.includes(rawTag ?? "") ? rawTag : "";
  const upcomingOnly = one(searchParams, "upcoming") === "1";

  const [items, user] = await Promise.all([
    getMerch({ category: activeCategory, tag: activeTag, upcomingOnly }),
    getCurrentUser(),
  ]);

  const clipped = await getBookmarkedIds(
    "merchandise",
    items.map((item) => item.id),
  );

  return {
    activeCategory,
    activeTag,
    upcomingOnly,
    items,
    clippedIds: [...clipped],
    signedIn: Boolean(user),
  };
}

// ── /merch/:slug ───────────────────────────────────────────────────────────

async function merchDetail({ params }) {
  const { slug } = params;
  const item = await getMerchBySlug(slug);
  if (!item) notFound();

  const [related, user, clipped] = await Promise.all([
    getRelatedMerch(item.category, slug),
    getCurrentUser(),
    isBookmarked("merchandise", item.id),
  ]);

  const relatedClipped = await getBookmarkedIds(
    "merchandise",
    related.map((entry) => entry.id),
  );

  // Popularity tracking (SRS FR-7, optional). Never awaited on the render path.
  void incrementMerchViews(slug);

  return {
    item,
    related,
    clipped,
    relatedClippedIds: [...relatedClipped],
    signedIn: Boolean(user),
  };
}

// ── /upcoming ──────────────────────────────────────────────────────────────

async function upcoming({ searchParams }) {
  const raw = one(searchParams, "category");
  const activeCategory = CATEGORY_SLUGS.includes(raw) ? raw : "";

  const entries = await getUpcoming(activeCategory || undefined);
  return { activeCategory, entries };
}

// ── /tickets/:code ─────────────────────────────────────────────────────────

async function ticketPass({ params }) {
  const { code } = params;

  // A pass is somebody's booking, so it is addressed by a random code *and*
  // checked against the session — the code alone must not be enough.
  const user = await requireUser();

  await connectToDatabase();
  const ticket = await EventTicket.findOne({
    code: String(code).toUpperCase(),
  }).lean();
  if (!ticket || String(ticket.userId) !== user.id) notFound();

  const event = await Event.findById(ticket.eventId).lean();
  if (!event) notFound();

  const shapedEvent = {
    title: String(event.title),
    slug: String(event.slug),
    category: String(event.category),
    startsAt: new Date(event.startsAt).toISOString(),
    venue: event.venue ?? "",
    city: event.city ?? "",
  };
  const shapedTicket = {
    code: String(ticket.code),
    status: ticket.status,
    holderName: ticket.holderName ?? "",
    decisionNote: ticket.decisionNote ?? "",
  };

  // A request that has not been approved is not a pass — no QR is made.
  if (ticket.status !== "confirmed") {
    return {
      event: shapedEvent,
      ticket: shapedTicket,
      userName: user.name,
      qr: null,
    };
  }

  // The QR encodes this page's own absolute URL, so scanning it at a door
  // opens the booking for whoever is checking — which is the only claim a QR
  // on a ticket should make. SVG so it stays sharp when the stub is printed.
  const host = (await headers()).get("host") ?? "localhost:3000";
  const protocol = host.startsWith("localhost") ? "http" : "https";
  const passUrl = `${protocol}://${host}/tickets/${ticket.code}`;
  const qr = await QRCode.toString(passUrl, {
    type: "svg",
    margin: 0,
    errorCorrectionLevel: "M",
  });

  return { event: shapedEvent, ticket: shapedTicket, userName: user.name, qr };
}

export const showcaseRoutes = [
  ["/characters", characters],
  ["/characters/:slug", characterDetail],
  ["/events", events],
  ["/events/:slug", eventDetail],
  ["/merch", merch],
  ["/merch/:slug", merchDetail],
  ["/upcoming", upcoming],
  ["/tickets/:code", ticketPass],
];
