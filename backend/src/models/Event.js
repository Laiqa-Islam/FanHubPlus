import mongoose from "mongoose";

const { Schema, model, models } = mongoose;
import { CATEGORY_SLUGS, EVENT_TYPES } from "../lib/constants.js";

/**
 * Conventions, meetups and screenings for the location-aware discovery map and
 * the city-filterable calendar (SRS FR-10).
 */
const EventSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    category: {
      type: String,
      enum: CATEGORY_SLUGS,
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: EVENT_TYPES,
      default: "convention",
      index: true,
    },

    description: { type: String, default: "" },

    /**
     * Longer, narrative copy for the highlight reel on the events page
     * (SRS FR-7: event highlights "presented in a storytelling format").
     *
     * Deliberately separate from `description`, which is listing copy — one
     * says what the event is so you can scan past it, the other says what
     * the day is actually like. Only highlighted events carry one.
     */
    story: { type: String, default: "" },
    venue: { type: String, default: "" },
    city: { type: String, required: true, index: true },
    country: { type: String, default: "" },

    /**
     * GeoJSON point — a 2dsphere index lets us answer "conventions near me"
     * with $near once the browser hands us coordinates.
     */
    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], default: [0, 0] }, // [lng, lat]
    },

    startsAt: { type: Date, required: true, index: true },
    endsAt: { type: Date, default: null },
    ticketUrl: { type: String, default: "" },
    /** Passes available through this site. 0 means no limit. */
    capacity: { type: Number, default: 0, min: 0 },
    imageUrl: { type: String, default: "" },
    isHighlight: { type: Boolean, default: false, index: true },
  },
  { timestamps: true },
);

EventSchema.index({ location: "2dsphere" });

export const Event = models.Event ?? model("Event", EventSchema);
