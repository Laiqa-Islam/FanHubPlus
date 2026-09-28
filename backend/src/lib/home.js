/**
 * Front-page data beyond the editorial spread.
 *
 * The home page used to show one thing — the content library — while the seed
 * carries characters, merchandise, events and a playable media shelf that a
 * visitor could only find by guessing at the nav. These queries feed the
 * sections that fix that.
 *
 * Every one is projected down to the fields the cards actually render. The
 * home page is the most-hit route in the app and these run on each request
 * (it is `force-dynamic`), so pulling whole documents back to read four keys
 * off them would be the wrong trade.
 *
 * Failures degrade rather than throw: a section with no rows returns an empty
 * array and the component renders nothing. A dead events collection should
 * cost the visitor the events strip, not the entire front page.
 */
import { connectToDatabase } from "./db.js";
import {
  Content,
  CharacterProfile,
  MerchandiseItem,
  Event,
  EventTicket,
} from "../models/index.js";

const EMPTY = {
  videos: [],
  characters: [],
  merch: [],
  events: [],
  counts: { pieces: 0, characters: 0, merch: 0, events: 0 },
};

async function getVideos() {
  const docs = await Content.find({ status: "published", type: "video" })
    .select(
      "slug title category summary mediaPoster coverImage mediaUrl mediaRuntime mediaTags",
    )
    .sort({ popularityScore: -1 })
    .limit(7)
    .lean();

  return docs.map((doc) => ({
    slug: String(doc.slug),
    title: String(doc.title),
    category: String(doc.category),
    summary: String(doc.summary ?? ""),
    // The poster is a frame from the clip itself; the cover is the fallback
    // for anything seeded before that was true.
    poster: String(doc.mediaPoster || doc.coverImage || ""),
    mediaUrl: String(doc.mediaUrl ?? ""),
    runtime: String(doc.mediaRuntime ?? ""),
    tag: String(doc.mediaTags?.[0] ?? "Video"),
  }));
}

async function getCharacters() {
  const docs = await CharacterProfile.find({})
    .select("slug name kanji franchise category role accent imageUrl")
    .sort({ popularityScore: -1 })
    .limit(24)
    .lean();

  return docs.map((doc) => ({
    slug: String(doc.slug),
    name: String(doc.name),
    kanji: String(doc.kanji ?? ""),
    franchise: String(doc.franchise ?? ""),
    category: String(doc.category ?? "anime"),
    role: String(doc.role ?? ""),
    accent: String(doc.accent ?? ""),
    imageUrl: String(doc.imageUrl ?? ""),
  }));
}

async function getMerch() {
  const docs = await MerchandiseItem.find({ isUpcoming: { $ne: true } })
    .select("slug name category priceCents tag imageUrl")
    .sort({ popularityScore: -1 })
    .limit(10)
    .lean();

  return docs.map((doc) => ({
    slug: String(doc.slug),
    name: String(doc.name),
    category: String(doc.category ?? ""),
    priceCents: Number(doc.priceCents ?? 0),
    tag: String(doc.tag ?? ""),
    imageUrl: String(doc.imageUrl ?? ""),
  }));
}

async function getEvents() {
  // Soonest first, and only what has not already happened — an "upcoming"
  // strip listing last year's convention is worse than no strip.
  const docs = await Event.find({ startsAt: { $gte: new Date() } })
    .select("slug title city country type category startsAt imageUrl")
    .sort({ startsAt: 1 })
    .limit(4)
    .lean();

  return docs.map((doc) => ({
    slug: String(doc.slug),
    title: String(doc.title),
    city: String(doc.city ?? ""),
    country: String(doc.country ?? ""),
    type: String(doc.type ?? ""),
    category: String(doc.category ?? ""),
    startsAt: doc.startsAt ? new Date(doc.startsAt).toISOString() : null,
    imageUrl: String(doc.imageUrl ?? ""),
  }));
}

/** Everything the lower half of the front page needs, in one round of queries. */
export async function getHomeExtras() {
  try {
    await connectToDatabase();

    const [
      videos,
      characters,
      merch,
      events,
      pieces,
      charCount,
      merchCount,
      eventCount,
    ] = await Promise.all([
      getVideos(),
      getCharacters(),
      getMerch(),
      getEvents(),
      Content.countDocuments({ status: "published" }),
      CharacterProfile.countDocuments({}),
      MerchandiseItem.countDocuments({}),
      Event.countDocuments({}),
    ]);

    return {
      videos,
      characters,
      merch,
      events,
      counts: {
        pieces,
        characters: charCount,
        merch: merchCount,
        events: eventCount,
      },
    };
  } catch (error) {
    console.error("[home] extras unavailable:", error);
    return EMPTY;
  }
}

/**
 * Passes the member is holding for events still to come.
 *
 * Lives here rather than in the tickets action file because it is read-only
 * page data, and because the dashboard is where a claimed pass has to show
 * up — a booking you can only find by navigating back to the event you
 * booked it from is a booking people lose.
 */
export async function getMyPasses(userId) {
  try {
    await connectToDatabase();

    // Requests awaiting a decision belong here too: "did that go through?"
    // is exactly the question this list should answer.
    const tickets = await EventTicket.find({
      userId,
      status: { $in: ["pending", "confirmed"] },
    })
      .select("code eventId status")
      .lean();
    if (tickets.length === 0) return [];

    const events = await Event.find({
      _id: { $in: tickets.map((t) => t.eventId) },
      startsAt: { $gte: new Date() },
    })
      .select("slug title city category startsAt")
      .sort({ startsAt: 1 })
      .lean();

    const byId = new Map(
      tickets.map((t) => [
        String(t.eventId),
        { code: String(t.code), status: t.status },
      ]),
    );

    return events.map((event) => ({
      code: byId.get(String(event._id))?.code ?? "",
      status: byId.get(String(event._id))?.status ?? "pending",
      eventSlug: String(event.slug),
      eventTitle: String(event.title),
      city: String(event.city ?? ""),
      category: String(event.category ?? "anime"),
      startsAt: event.startsAt ? new Date(event.startsAt).toISOString() : null,
    }));
  } catch (error) {
    console.error("[home] passes unavailable:", error);
    return [];
  }
}
