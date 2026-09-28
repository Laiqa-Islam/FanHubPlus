import { randomBytes } from "node:crypto";
import { revalidatePath } from "../lib/request-context.js";

import { connectToDatabase } from "../lib/db.js";
import { Event, EventTicket, ActivityLog } from "../models/index.js";
import { getCurrentUser, requireAdmin } from "../lib/dal.js";

/**
 * Crockford-ish base32 over random bytes: no vowels, so the alphabet cannot
 * spell anything, and no 0/O or 1/I, which are the pairs people get wrong
 * reading a code off a printed stub.
 */
const ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";

function group(bytes, length) {
  let out = "";
  for (let i = 0; i < length; i += 1)
    out += ALPHABET[bytes[i] % ALPHABET.length];
  return out;
}

function newCode() {
  const bytes = randomBytes(8);
  return `FH-${group(bytes, 4)}-${group(bytes.subarray(4), 4)}`;
}

/**
 * How many places are spoken for, counting requests awaiting a decision.
 *
 * Pending requests have to hold a place, or the approvals queue can commit
 * an organiser to more people than the room takes.
 */
export async function getTicketAvailability(eventId, capacity) {
  await connectToDatabase();
  const [confirmed, pending] = await Promise.all([
    EventTicket.countDocuments({ eventId, status: "confirmed" }),
    EventTicket.countDocuments({ eventId, status: "pending" }),
  ]);
  const held = confirmed + pending;
  return {
    confirmed,
    pending,
    capacity,
    remaining: capacity > 0 ? Math.max(0, capacity - held) : null,
    soldOut: capacity > 0 && held >= capacity,
  };
}

/** The signed-in member's open request, live pass, or last refusal. */
export async function getMyTicket(eventId) {
  const user = await getCurrentUser();
  if (!user) return null;

  await connectToDatabase();
  const ticket = await EventTicket.findOne({
    userId: user.id,
    eventId,
    status: { $in: ["pending", "confirmed", "rejected"] },
  })
    .sort({ createdAt: -1 })
    .lean();

  if (!ticket) return null;
  return {
    code: String(ticket.code),
    status: ticket.status,
    holderName: String(ticket.holderName ?? ""),
    decisionNote: String(ticket.decisionNote ?? ""),
    claimedAt: ticket.createdAt ? new Date(ticket.createdAt).toISOString() : "",
  };
}

/**
 * Requests a pass. It lands in the approvals queue rather than being issued
 * on the spot.
 *
 * Deliberately idempotent: a second submission returns the existing state
 * rather than erroring, because the realistic way this gets called twice is
 * a double-click or a refreshed form post, and neither should read as a
 * failure to the person doing it.
 */
export async function applyForTicket(_prev, formData) {
  const slug = String(formData.get("slug") ?? "").trim();
  if (!slug) return { ok: false, error: "Missing event." };

  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Sign in to request a pass." };
  if (!user.emailVerified) {
    return {
      ok: false,
      error: "Confirm your email address first — the pass is sent to it.",
    };
  }

  await connectToDatabase();

  const event = await Event.findOne({ slug }).lean();
  if (!event) return { ok: false, error: "That event no longer exists." };

  if (event.startsAt && new Date(event.startsAt).getTime() < Date.now()) {
    return { ok: false, error: "This event has already taken place." };
  }

  const existing = await EventTicket.findOne({
    userId: user.id,
    eventId: event._id,
    status: { $in: ["pending", "confirmed"] },
  }).lean();
  if (existing) return { ok: true, status: existing.status };

  const capacity = Number(event.capacity ?? 0);
  if (capacity > 0) {
    const held = await EventTicket.countDocuments({
      eventId: event._id,
      status: { $in: ["pending", "confirmed"] },
    });
    if (held >= capacity)
      return { ok: false, error: "Every place for this one is spoken for." };
  }

  // A unique index guards the code, so a collision is a retry rather than a
  // corrupted booking. Three attempts is far beyond what 32^8 needs.
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const code = newCode();
    try {
      await EventTicket.create({
        userId: user.id,
        eventId: event._id,
        code,
        holderName: user.name,
        holderEmail: user.email,
        status: "pending",
      });

      await ActivityLog.create({
        userId: user.id,
        action: "claimed-pass",
        label: `Requested a pass for ${event.title}`,
      }).catch(() => {});

      revalidatePath(`/events/${slug}`);
      revalidatePath("/dashboard");
      revalidatePath("/admin/tickets");
      return { ok: true, status: "pending" };
    } catch (error) {
      const duplicate =
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        error.code === 11000;
      if (!duplicate) {
        console.error("[tickets] request failed:", error);
        return { ok: false, error: "Could not send that request. Try again." };
      }
      // A duplicate on (userId, eventId) means a parallel submission already
      // registered one — hand back its state instead of creating a second.
      const raced = await EventTicket.findOne({
        userId: user.id,
        eventId: event._id,
        status: { $in: ["pending", "confirmed"] },
      }).lean();
      if (raced) return { ok: true, status: raced.status };
    }
  }

  return { ok: false, error: "Could not allocate a pass code. Try again." };
}

/** Withdraws a request, or gives a pass back so the place returns to the pool. */
export async function releaseTicket(_prev, formData) {
  const slug = String(formData.get("slug") ?? "").trim();
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Sign in first." };

  await connectToDatabase();
  const event = await Event.findOne({ slug }).lean();
  if (!event) return { ok: false, error: "That event no longer exists." };

  await EventTicket.findOneAndUpdate(
    {
      userId: user.id,
      eventId: event._id,
      status: { $in: ["pending", "confirmed"] },
    },
    { $set: { status: "released" } },
  );

  revalidatePath(`/events/${slug}`);
  revalidatePath("/dashboard");
  revalidatePath("/admin/tickets");
  return { ok: true, status: "released" };
}

/** An editor's decision on a pending request. */
export async function decideTicket(_prev, formData) {
  const admin = await requireAdmin();

  const code = String(formData.get("code") ?? "")
    .trim()
    .toUpperCase();
  const decision = String(formData.get("decision") ?? "");
  const note = String(formData.get("note") ?? "")
    .trim()
    .slice(0, 300);

  if (decision !== "approve" && decision !== "reject") {
    return { ok: false, error: "Unknown decision." };
  }

  await connectToDatabase();
  const ticket = await EventTicket.findOne({ code });
  if (!ticket) return { ok: false, error: "No such request." };
  if (ticket.status !== "pending") {
    return { ok: false, error: "That request has already been decided." };
  }

  // Approving is the step that can overshoot a room, so capacity is checked
  // here and not only when the request was made.
  if (decision === "approve") {
    const event = await Event.findById(ticket.eventId).lean();
    const capacity = Number(event?.capacity ?? 0);
    if (capacity > 0) {
      const confirmed = await EventTicket.countDocuments({
        eventId: ticket.eventId,
        status: "confirmed",
      });
      if (confirmed >= capacity) {
        return { ok: false, error: "That would go over the event's capacity." };
      }
    }
  }

  ticket.status = decision === "approve" ? "confirmed" : "rejected";
  ticket.decidedAt = new Date();
  ticket.decidedBy = admin.id;
  ticket.decisionNote = note;
  await ticket.save();

  const event = await Event.findById(ticket.eventId).select("slug").lean();
  if (event?.slug) revalidatePath(`/events/${event.slug}`);
  revalidatePath("/admin/tickets");
  revalidatePath("/dashboard");

  return { ok: true, status: ticket.status };
}
