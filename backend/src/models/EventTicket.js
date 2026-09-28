import mongoose from "mongoose";

const { Schema, model, models } = mongoose;

/**
 * A pass claimed by a member for an event.
 *
 * The events section previously ended at a link — every listing pointed at
 * the same placeholder ticket URL, so there was nothing a signed-in member
 * could actually do with an event. A pass is the missing half: it belongs to
 * someone, it can be shown at a door, and it can be given up again.
 *
 * `code` is what gets printed on the pass and what the pass page is addressed
 * by, so it is generated from random bytes rather than derived from the ids —
 * a code you can guess from a URL is a code that lets you read someone else's
 * booking.
 */
const EventTicketSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    eventId: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: true,
      index: true,
    },

    /** Printed on the pass; unique across the collection. */
    code: { type: String, required: true, unique: true, index: true },

    /** Copied at claim time so a later profile rename does not rewrite history. */
    holderName: { type: String, default: "" },
    holderEmail: { type: String, default: "" },

    /**
     * A request, not a booking, until an editor says otherwise. Capacity is
     * finite and a pass carries the holder's name, so the door list is
     * something the organiser approves rather than something anyone can
     * write to directly.
     */
    status: {
      type: String,
      enum: ["pending", "confirmed", "rejected", "released"],
      default: "pending",
      index: true,
    },

    /** Set when an editor approves or rejects; shown back to the member. */
    decidedAt: { type: Date, default: null },
    decidedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
    /** Optional note from the editor, rendered with a rejection. */
    decisionNote: { type: String, default: "" },
  },
  { timestamps: true },
);

/**
 * One open request or live pass per member per event.
 *
 * Rejected and released rows are kept rather than deleted, so a code printed
 * on a stub never silently comes to belong to someone else — which is why
 * the uniqueness is scoped to the two states that are still in play rather
 * than applied to the whole collection.
 */
EventTicketSchema.index(
  { userId: 1, eventId: 1 },
  {
    unique: true,
    partialFilterExpression: { status: { $in: ["pending", "confirmed"] } },
  },
);

export const EventTicket =
  models.EventTicket ?? model("EventTicket", EventTicketSchema);
