import { revalidatePath } from "../lib/request-context.js";
import { z } from "zod";

import { connectToDatabase } from "../lib/db.js";
import {
  Content,
  CharacterProfile,
  MerchandiseItem,
  Event,
  FaqEntry,
  User,
} from "../models/index.js";
import { requireAdmin } from "../lib/dal.js";
import { slugify } from "../lib/utils.js";
import {
  CATEGORY_SLUGS,
  CONTENT_TYPES,
  MERCH_TAGS,
  EVENT_TYPES,
  ROLES,
} from "../lib/constants.js";
import { parseEmbed, supportedProviderList } from "../lib/embeds.js";
import { fieldErrors } from "../lib/validation.js";

/**
 * Admin control panel writes (SRS FR-11).
 *
 * Every export calls `requireAdmin()` first. Server actions are public HTTP
 * endpoints — hiding the admin UI behind a role check in the page would do
 * nothing to stop a crafted POST, so authorisation is enforced here, at the
 * mutation, not in the component that renders the form.
 */

const RESOURCES = {
  content: { model: Content, path: "/admin/content", label: "Piece" },
  character: {
    model: CharacterProfile,
    path: "/admin/characters",
    label: "Character",
  },
  merchandise: { model: MerchandiseItem, path: "/admin/merch", label: "Item" },
  event: { model: Event, path: "/admin/events", label: "Event" },
  faq: { model: FaqEntry, path: "/admin/faq", label: "FAQ entry" },
};

// ── Schemas, one per resource ───────────────────────────────────────────────

const category = z.enum(CATEGORY_SLUGS);

const ContentSchema = z
  .object({
    title: z.string().trim().min(3, "Give it a title.").max(160),
    category,
    type: z.enum(CONTENT_TYPES),
    summary: z.string().trim().max(400).optional(),
    body: z.string().trim().max(40_000).optional(),
    coverImage: z.string().trim().max(600).optional(),
    mediaUrl: z.string().trim().max(600).optional(),
    genre: z.string().trim().max(200).optional(),
    // Admin-controlled media tagging (SRS FR-5).
    mediaTags: z.string().trim().max(200).optional(),
    /**
     * A platform link (v2 Phase 11). Entered as a URL for convenience, but stored
     * as provider + id — administrators get the same parser members do, and the
     * same guarantee that no URL from a form reaches an iframe.
     */
    embedUrl: z.string().trim().max(400).optional(),
    transcript: z.string().trim().max(30_000).optional(),
    /**
     * The article's chronology (SRS FR-7), one milestone per line as
     * `label | title | body`.
     *
     * A repeating structure in a form built entirely from flat text inputs
     * would mean a second editor UI for one field on one resource. A
     * delimited textarea is the same trade the genre and tag fields already
     * make, and it round-trips: what is parsed in is what is printed back
     * into the box on the next edit.
     */
    timeline: z.string().trim().max(8_000).optional(),
    status: z.enum(["draft", "published"]),
  })
  .refine((data) => !data.embedUrl || parseEmbed(data.embedUrl) !== null, {
    // Without this an unrecognised link would store as an empty embed and the
    // piece would publish with no player, giving no hint as to why.
    message: `We can embed ${supportedProviderList()}. That link isn't one of them.`,
    path: ["embedUrl"],
  });

const CharacterSchema = z.object({
  name: z.string().trim().min(2, "Give them a name.").max(120),
  category,
  franchise: z.string().trim().max(120).optional(),
  bio: z.string().trim().max(4000).optional(),
  imageUrl: z.string().trim().max(600).optional(),
  traits: z.string().trim().max(200).optional(),

  // The dossier fields the profile page is built around.
  kanji: z.string().trim().max(60).optional(),
  role: z.string().trim().max(120).optional(),
  grade: z.string().trim().max(80).optional(),
  sealMark: z.string().trim().max(8).optional(),
  accent: z.string().trim().max(40).optional(),
  affiliation: z.string().trim().max(200).optional(),
  status: z.string().trim().max(200).optional(),
  relationships: z.string().trim().max(600).optional(),
  skills: z.string().trim().max(600).optional(),
  troops: z.string().trim().max(200).optional(),
  weapons: z.string().trim().max(400).optional(),
});

const MerchSchema = z.object({
  name: z.string().trim().min(2, "Give it a name.").max(160),
  category,
  description: z.string().trim().max(2000).optional(),
  price: z.coerce.number().min(0, "Price cannot be negative.").max(100_000),
  imageUrl: z.string().trim().max(600).optional(),
  tag: z.enum(MERCH_TAGS),
  isUpcoming: z.coerce.boolean(),
});

const EventSchema = z.object({
  title: z.string().trim().min(3, "Give it a title.").max(160),
  category,
  type: z.enum(EVENT_TYPES),
  description: z.string().trim().max(2000).optional(),
  venue: z.string().trim().max(160).optional(),
  city: z.string().trim().min(2, "Which city?").max(120),
  country: z.string().trim().max(120).optional(),
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
  startsAt: z.string().min(1, "When does it start?"),
  story: z.string().trim().max(2000).optional(),
  ticketUrl: z.string().trim().max(600).optional(),
  capacity: z.coerce.number().int().min(0).max(1_000_000).optional(),
});

const FaqSchema = z.object({
  question: z.string().trim().min(5, "What's the question?").max(300),
  answer: z.string().trim().min(5, "What's the answer?").max(4000),
  tags: z.string().trim().max(200).optional(),
  isPublished: z.coerce.boolean(),
});

/** Splits a comma-separated field into a clean array. */
/**
 * Parses the timeline textarea. Blank lines are skipped, a row with no title
 * is dropped rather than stored half-empty, and the body is optional.
 */
function toTimeline(value) {
  if (!value) return [];
  return value
    .split(/\r?\n/)
    .map((line) => line.split("|").map((part) => part.trim()))
    .filter((parts) => parts.length >= 2 && parts[0] && parts[1])
    .map(([label, title, ...rest]) => ({
      label,
      title,
      body: rest.join(" | ").trim(),
    }));
}

function toList(value) {
  return (value ?? "")
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

/** Maps validated form data onto the document shape for each resource. */
function buildDocument(kind, data) {
  switch (kind) {
    case "content": {
      const d = data;
      const embed = d.embedUrl ? parseEmbed(d.embedUrl) : null;
      return {
        embedProvider: embed?.provider ?? "",
        embedId: embed?.id ?? "",
        transcript: d.transcript ?? "",
        title: d.title,
        slug: slugify(d.title),
        category: d.category,
        type: d.type,
        summary: d.summary ?? "",
        // Plain paragraphs typed by an admin are wrapped, but HTML they paste
        // is preserved — this field is only ever editable by administrators.
        body: d.body?.includes("<")
          ? d.body
          : `<p>${(d.body ?? "").replace(/\n{2,}/g, "</p><p>")}</p>`,
        coverImage: d.coverImage ?? "",
        mediaUrl: d.mediaUrl ?? "",
        genre: toList(d.genre),
        tags: toList(d.genre),
        mediaTags: toList(d.mediaTags),
        timeline: toTimeline(d.timeline),
        status: d.status,
      };
    }
    case "character": {
      const d = data;
      return {
        name: d.name,
        slug: slugify(`${d.name}-${d.franchise ?? ""}`),
        category: d.category,
        franchise: d.franchise ?? "",
        bio: d.bio ?? "",
        imageUrl: d.imageUrl ?? "",
        traits: toList(d.traits),
        kanji: d.kanji ?? "",
        role: d.role ?? "",
        grade: d.grade ?? "",
        sealMark: d.sealMark ?? "",
        accent: d.accent ?? "",
        affiliation: d.affiliation ?? "",
        status: d.status ?? "",
        relationships: toList(d.relationships),
        skills: toList(d.skills),
        troops: d.troops ?? "",
        weapons: toList(d.weapons),
      };
    }
    case "merchandise": {
      const d = data;
      return {
        name: d.name,
        slug: slugify(d.name),
        category: d.category,
        description: d.description ?? "",
        priceCents: Math.round(d.price * 100),
        imageUrl: d.imageUrl ?? "",
        tag: d.tag,
        isUpcoming: d.isUpcoming,
      };
    }
    case "event": {
      const d = data;
      return {
        title: d.title,
        slug: slugify(`${d.title}-${d.city}`),
        category: d.category,
        type: d.type,
        description: d.description ?? "",
        venue: d.venue ?? "",
        city: d.city,
        country: d.country ?? "",
        // GeoJSON stores [longitude, latitude] — the reverse of how the form
        // asks for it, and an easy thing to get backwards.
        location: { type: "Point", coordinates: [d.lng, d.lat] },
        startsAt: new Date(d.startsAt),
        story: d.story ?? "",
        ticketUrl: d.ticketUrl ?? "",
        capacity: d.capacity ?? 0,
      };
    }
    case "faq": {
      const d = data;
      return {
        question: d.question,
        answer: d.answer,
        tags: toList(d.tags),
        isPublished: d.isPublished,
      };
    }
  }
}

function parse(kind, formData) {
  const raw = Object.fromEntries(formData.entries());
  // Unchecked boxes are simply absent from FormData.
  const withBooleans = {
    ...raw,
    isUpcoming: formData.get("isUpcoming") === "on",
    isPublished: formData.get("isPublished") === "on",
  };

  switch (kind) {
    case "content":
      return ContentSchema.safeParse(withBooleans);
    case "character":
      return CharacterSchema.safeParse(withBooleans);
    case "merchandise":
      return MerchSchema.safeParse(withBooleans);
    case "event":
      return EventSchema.safeParse(withBooleans);
    case "faq":
      return FaqSchema.safeParse(withBooleans);
  }
}

/** Creates or updates a record. An `id` field in the form means update. */
export async function saveResource(kind, _prev, formData) {
  await requireAdmin();

  const resource = RESOURCES[kind];
  if (!resource) return { message: "Unknown resource." };

  const parsed = parse(kind, formData);
  if (!parsed.success) return { errors: fieldErrors(parsed.error) };

  const id = String(formData.get("id") ?? "").trim();
  const document = buildDocument(kind, parsed.data);

  try {
    await connectToDatabase();
    const model = resource.model;

    if (id) await model.findByIdAndUpdate(id, document);
    else await model.create(document);
  } catch (error) {
    if (error.code === 11000) {
      return {
        message:
          "Something with that title already exists — try a different one.",
      };
    }
    console.error(`[admin] save ${kind} failed:`, error);
    return { message: "We couldn't save that. Please try again." };
  }

  revalidatePath(resource.path);
  revalidatePath("/admin");
  return { success: true, message: `${resource.label} saved.` };
}

/** Permanently removes a record. */
export async function deleteResource(kind, id) {
  await requireAdmin();

  const resource = RESOURCES[kind];
  if (!resource) return { ok: false, message: "Unknown resource." };

  try {
    await connectToDatabase();
    const model = resource.model;
    await model.findByIdAndDelete(id);
  } catch (error) {
    console.error(`[admin] delete ${kind} failed:`, error);
    return { ok: false, message: "We couldn't delete that." };
  }

  revalidatePath(resource.path);
  revalidatePath("/admin");
  return { ok: true, message: `${resource.label} deleted.` };
}

/** Changes a member's role (SRS FR-11: user management). */
export async function setUserRole(userId, role) {
  const admin = await requireAdmin();

  if (!ROLES.includes(role)) {
    return { ok: false, message: "That role isn't recognised." };
  }
  // Without this an administrator can lock themselves — and potentially
  // everyone — out of the control panel in one click.
  if (userId === admin.id) {
    return { ok: false, message: "You can't change your own role." };
  }

  try {
    await connectToDatabase();
    await User.findByIdAndUpdate(userId, { role });
  } catch (error) {
    console.error("[admin] role change failed:", error);
    return { ok: false, message: "We couldn't change that role." };
  }

  revalidatePath("/admin/users");
  return { ok: true, message: `Role set to ${role}.` };
}
