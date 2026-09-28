/**
 * Seeds Fan Hub Plus with the editorial content library and the three
 * evaluation accounts required by the SRS deliverables.
 *
 *   npm run seed
 *
 * Safe to re-run: every write is an upsert keyed on a natural unique field,
 * and image selection is deterministic, so reseeding never reshuffles the art.
 */

import bcrypt from "bcryptjs";
import mongoose from "mongoose";

// Env comes from `--env-file=.env.local` in the npm script. It has to be
// loaded by the runtime rather than in this file, because ES import hoisting
// would otherwise evaluate lib/db before any in-file dotenv call ran.
import { connectToDatabase } from "../src/lib/db.js";
import {
  User,
  Content,
  CharacterProfile,
  MerchandiseItem,
  Event,
  FaqEntry,
} from "../src/models/index.js";
import { CATEGORIES } from "../src/lib/constants.js";
import { pickStock, stock, EVENT_IMAGES } from "../src/lib/stock-images.js";
import { CONTENT_SEED } from "./data/content.js";
import {
  VIDEO_LIBRARY,
  AUDIO_LIBRARY,
  VIDEO_SOURCES,
  AUDIO_SOURCES,
} from "./data/media.js";
import { CHARACTER_SEED } from "./data/characters.js";
import { MERCH_SEED, EVENT_SEED } from "./data/merch-events.js";

// ── Evaluation accounts (documented in README + project report) ─────────────

const ACCOUNTS = [
  {
    name: "Ava Admin",
    email: "admin@fanhub.plus",
    password: "Admin@12345",
    role: "admin",
    favoriteCategories: ["anime", "gaming"],
    bio: "Keeps the channels running.",
  },
  {
    name: "Rey Fan",
    email: "user@fanhub.plus",
    password: "User@12345",
    role: "user",
    favoriteCategories: ["anime", "k-pop", "cosplay"],
    bio: "Seasonal anime completionist. Cosplay WIP account.",
  },
  {
    name: "Sam Visitor",
    email: "visitor@fanhub.plus",
    password: "Visitor@12345",
    role: "visitor",
    favoriteCategories: [],
    bio: "Just browsing.",
  },
];

const FAQS = [
  [
    "What is Fan Hub Plus?",
    "A single hub for eight fandoms — anime, gaming, movies, TV shows, K-Pop, comics, manga and cosplay — with curated articles, media, character files, merchandise discovery and an events calendar. Eight channels, one undercity, open all night.",
  ],
  [
    "Do I need an account?",
    "No. Visitors can browse everything. An account adds bookmarks with private notes, a personalised dashboard, ratings and fan submissions.",
  ],
  [
    "Can I buy the merchandise?",
    "Yes. Add items from the merch catalogue to your cart and continue through checkout. The current academic build uses a demo checkout, so it never charges a real payment method or creates a shipment.",
  ],
  [
    "How do I find events near me?",
    "Open Events and allow location access to see conventions, meetups and screenings sorted by distance, or filter the calendar by city.",
  ],
  [
    "How do I change the text size?",
    "Use the accessibility menu in the header, which also carries the reduce-motion switch. Signed-in members can save both preferences to their account from Profile so they follow them across devices. There is no light mode: Fan Hub Plus runs on a single dark ground by design.",
  ],
  [
    "Can I submit my own article?",
    "Yes. Signed-in members can submit fan content from the Submit page. It appears on the site once an administrator approves it.",
  ],
  [
    "Where do the images come from?",
    "Photography is licensed stock imagery. We deliberately do not host copyrighted franchise artwork.",
  ],
  [
    "How is popularity calculated?",
    "From a combination of view count and member ratings. You can sort any listing by popularity, recency or alphabetically.",
  ],
];

function slugify(input) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function daysFromNow(days) {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}

/**
 * Doors open at a plausible hour rather than at whatever time the seed
 * happened to run. Without this an event listing reads "03:51 – 03:51",
 * which is both the wrong time of day and a zero-length event.
 */
const DOORS = {
  convention: { hour: 10, hours: 8 },
  meetup: { hour: 18, hours: 3 },
  screening: { hour: 19, hours: 2 },
  premiere: { hour: 19, hours: 3 },
  concert: { hour: 20, hours: 3 },
};

function scheduleAt(days, type) {
  const { hour, hours } = DOORS[type] ?? DOORS.convention;
  const start = daysFromNow(days);
  start.setUTCHours(hour, 0, 0, 0);
  const end = new Date(start.getTime() + hours * 60 * 60 * 1000);
  return { start, end };
}

/** Wraps the seed paragraphs as the rich-text body the article pages render. */
function toHtml(paragraphs) {
  return paragraphs.map((p) => `<p>${p}</p>`).join("\n");
}

/**
 * Hands out a running position per channel so `pickStock` cycles that
 * channel's whole photo pool before any image repeats.
 */
function makeCounter() {
  const seen = new Map();
  return (category) => {
    const next = seen.get(category) ?? 0;
    seen.set(category, next + 1);
    return next;
  };
}

async function seed() {
  console.log("→ Connecting to MongoDB…");
  await connectToDatabase();
  console.log(`✓ Connected to "${mongoose.connection.name}"`);

  // ── Users ────────────────────────────────────────────────────────────────
  console.log("→ Seeding accounts…");
  for (const account of ACCOUNTS) {
    const passwordHash = await bcrypt.hash(account.password, 12);
    await User.findOneAndUpdate(
      { email: account.email },
      {
        $set: {
          name: account.name,
          passwordHash,
          role: account.role,
          bio: account.bio,
          favoriteCategories: account.favoriteCategories,
          // Pre-verified so evaluators can sign in without the email step.
          emailVerifiedAt: new Date(),
        },
      },
      { upsert: true },
    );
  }
  console.log(`✓ ${ACCOUNTS.length} accounts ready`);

  // ── Content ──────────────────────────────────────────────────────────────
  console.log("→ Seeding editorial content…");
  const contentImageIndex = makeCounter();
  // Video and audio pieces each draw from their own rotation, so the same
  // file is not attached to two consecutive pieces.
  let videoCursor = 0;
  let audioCursor = 0;

  for (const [index, item] of CONTENT_SEED.entries()) {
    const slug = slugify(item.title);

    // Attach real, openly-licensed media to the playable formats.
    let media = {
      mediaUrl: "",
      mediaPoster: "",
      mediaCredit: "",
      mediaRuntime: "",
      mediaTags: [],
    };

    if (item.type === "video") {
      // A piece that names its clip gets that clip. Only an unpinned one
      // falls back to the rotation, which is what used to attach an open
      // movie about a rabbit to an essay on action choreography.
      const source =
        (item.media ? VIDEO_LIBRARY[item.media] : undefined) ??
        VIDEO_SOURCES[videoCursor % VIDEO_SOURCES.length];
      videoCursor += 1;
      media = {
        mediaUrl: source.url,
        mediaPoster: source.poster ?? "",
        mediaCredit: source.credit,
        mediaRuntime: source.runtime,
        mediaTags: [source.tag, "Video"],
      };
    } else if (item.type === "audio") {
      const source =
        (item.media ? AUDIO_LIBRARY[item.media] : undefined) ??
        AUDIO_SOURCES[audioCursor % AUDIO_SOURCES.length];
      audioCursor += 1;
      media = {
        mediaUrl: source.url,
        mediaPoster: "",
        mediaCredit: source.credit,
        mediaRuntime: source.runtime,
        mediaTags: [source.tag, "Audio"],
      };
    } else if (item.type === "image") {
      media = { ...media, mediaTags: ["Gallery"] };
    }

    await Content.findOneAndUpdate(
      { slug },
      {
        $set: {
          title: item.title,
          slug,
          category: item.category,
          type: item.type,
          summary: item.summary,
          body: toHtml(item.paragraphs),
          timeline: item.timeline ?? [],
          // A piece that names its own art gets it, so the picture on the
          // card is the thing the piece is about; the rest cycle the pool.
          coverImage: item.art
            ? stock(item.art)
            : pickStock(item.category, contentImageIndex(item.category)),
          ...media,
          genre: item.genre,
          tags: [...item.genre, item.type],
          // Spread release dates across the year the piece is dated to, so
          // "latest" sorting and the year filter both have real spread.
          releaseDate: new Date(item.year, index % 12, ((index * 7) % 27) + 1),
          popularityScore: item.popularity,
          viewCount: item.popularity * 37 + index * 11,
          // Ratings imply a plausible average between about 3.6 and 4.8.
          ratingCount: 12 + (index % 40),
          ratingSum: Math.round(
            (12 + (index % 40)) * (3.6 + (item.popularity % 12) / 10),
          ),
          isFeatured: item.popularity >= 88,
          status: "published",
        },
      },
      { upsert: true },
    );
  }
  console.log(`✓ ${CONTENT_SEED.length} content items`);

  // ── Characters ───────────────────────────────────────────────────────────
  console.log("→ Seeding character profiles…");
  const characterImageIndex = makeCounter();
  for (const character of CHARACTER_SEED) {
    const slug = slugify(`${character.name}-${character.franchise}`);
    await CharacterProfile.findOneAndUpdate(
      { slug },
      {
        $set: {
          name: character.name,
          slug,
          category: character.category,
          franchise: character.franchise,
          kanji: character.kanji,
          role: character.role,
          signature: character.signature,
          grade: character.grade,
          sealMark: character.sealMark,
          accent: character.accent,
          affiliation: character.affiliation,
          status: character.status,
          relationships: character.relationships,
          skills: character.skills,
          troops: character.troops,
          weapons: character.weapons,
          stats: character.stats,
          bio: character.bio,
          // A character that names its own art gets it; the rest fall back to
          // cycling the channel pool, and the profile page says so.
          imageUrl: character.art
            ? stock(character.art)
            : pickStock(
                character.category,
                characterImageIndex(character.category),
                1,
              ),
          traits: character.traits,
          debutYear: character.debutYear,
          popularityScore: 55 + (slug.length % 45),
          viewCount: 240 + (slug.length % 60) * 13,
        },
      },
      { upsert: true },
    );
  }
  console.log(`✓ ${CHARACTER_SEED.length} character profiles`);

  // ── Merchandise ──────────────────────────────────────────────────────────
  console.log("→ Seeding merchandise showcase…");
  const merchImageIndex = makeCounter();
  for (const [index, item] of MERCH_SEED.entries()) {
    const slug = slugify(item.name);
    const imagePosition = merchImageIndex(item.category);
    await MerchandiseItem.findOneAndUpdate(
      { slug },
      {
        $set: {
          name: item.name,
          slug,
          category: item.category,
          tag: item.tag,
          isUpcoming: item.isUpcoming,
          description: item.description,
          priceCents: item.priceCents ?? 2_499 + (index % 6) * 500,
          imageUrl: item.imageUrl ?? pickStock(item.category, imagePosition, 2),
          gallery: item.gallery ?? [
            pickStock(item.category, imagePosition, 3),
            pickStock(item.category, imagePosition, 4),
          ],
          releaseDate: daysFromNow(item.releaseOffset),
          popularityScore: 45 + ((index * 7) % 50),
          viewCount: 180 + index * 47,
        },
      },
      { upsert: true },
    );
  }
  console.log(`✓ ${MERCH_SEED.length} merchandise items`);

  // ── Events ───────────────────────────────────────────────────────────────
  console.log("→ Seeding events…");
  for (const [index, event] of EVENT_SEED.entries()) {
    const schedule = scheduleAt(event.inDays, event.type);
    const slug = slugify(`${event.title}-${event.city}`);
    await Event.findOneAndUpdate(
      { slug },
      {
        $set: {
          title: event.title,
          slug,
          category: event.category,
          type: event.type,
          city: event.city,
          country: event.country,
          venue: event.venue,
          description: event.description,
          story: event.story ?? "",
          // GeoJSON order is [longitude, latitude].
          location: { type: "Point", coordinates: [event.lng, event.lat] },
          startsAt: schedule.start,
          // A convention runs over several days; everything else ends the
          // same evening it started.
          endsAt:
            event.type === "convention"
              ? new Date(schedule.start.getTime() + 3 * 24 * 60 * 60 * 1000)
              : schedule.end,
          // Left empty on purpose. Every event used to carry the same
          // https://example.com/tickets placeholder, which put a ticket icon
          // on every row that went nowhere real. Passes are claimed on the
          // event's own page now; this field stays for genuine external
          // ticketing an editor may add later.
          ticketUrl: "",
          // A spread of limits so the listing shows the states that exist:
          // unlimited, plenty left, and nearly gone.
          capacity: [0, 120, 40, 250, 0, 60][index % 6],
          imageUrl: stock(EVENT_IMAGES[index % EVENT_IMAGES.length]),
          isHighlight: event.inDays < 45,
        },
      },
      { upsert: true },
    );
  }
  console.log(`✓ ${EVENT_SEED.length} events`);

  // ── Chatbot knowledge base ───────────────────────────────────────────────
  console.log("→ Seeding FAQ knowledge base…");
  for (const [question, answer] of FAQS) {
    await FaqEntry.findOneAndUpdate(
      { question },
      { $set: { question, answer, isPublished: true, tags: ["platform"] } },
      { upsert: true },
    );
  }
  console.log(`✓ ${FAQS.length} FAQ entries`);

  // ── Prune ────────────────────────────────────────────────────────────────
  // Re-seeding should converge on the library rather than accumulate whatever
  // earlier runs happened to create, so anything whose slug is no longer in
  // the library is removed. Member-authored content is exempt: approved fan
  // submissions live in the same collection and must survive a reseed.
  console.log("→ Pruning records no longer in the library…");

  const [contentPruned, charactersPruned, merchPruned, eventsPruned] =
    await Promise.all([
      Content.deleteMany({
        slug: { $nin: CONTENT_SEED.map((item) => slugify(item.title)) },
        authorId: null,
      }),
      CharacterProfile.deleteMany({
        slug: {
          $nin: CHARACTER_SEED.map((c) => slugify(`${c.name}-${c.franchise}`)),
        },
      }),
      MerchandiseItem.deleteMany({
        slug: { $nin: MERCH_SEED.map((item) => slugify(item.name)) },
      }),
      Event.deleteMany({
        slug: {
          $nin: EVENT_SEED.map((event) =>
            slugify(`${event.title}-${event.city}`),
          ),
        },
      }),
    ]);

  const pruned =
    contentPruned.deletedCount +
    charactersPruned.deletedCount +
    merchPruned.deletedCount +
    eventsPruned.deletedCount;
  console.log(`✓ ${pruned} stale records removed`);

  const total =
    CONTENT_SEED.length +
    CHARACTER_SEED.length +
    MERCH_SEED.length +
    EVENT_SEED.length;
  console.log(
    `\n✓ Seed complete — ${total} records across ${CATEGORIES.length} channels.\n`,
  );
  console.log("  Evaluation accounts");
  console.log("  ─────────────────────────────────────────────");
  for (const account of ACCOUNTS) {
    console.log(
      `  ${account.role.padEnd(8)} ${account.email.padEnd(22)} ${account.password}`,
    );
  }
  console.log("");

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((error) => {
  console.error("\n✗ Seed failed:", error);
  process.exit(1);
});
