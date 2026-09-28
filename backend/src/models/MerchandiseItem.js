import mongoose from "mongoose";

const { Schema, model, models } = mongoose;
import { CATEGORY_SLUGS, MERCH_TAGS } from "../lib/constants.js";

/** Merchandise catalogue items used by the storefront and cart. */
const MerchandiseItemSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    category: {
      type: String,
      enum: CATEGORY_SLUGS,
      required: true,
      index: true,
    },

    description: { type: String, default: "" },
    priceCents: { type: Number, min: 0, default: 0 },
    imageUrl: { type: String, default: "" },
    imagePublicId: { type: String, default: "" },
    /** Additional gallery shots. */
    gallery: [{ type: String }],

    tag: {
      type: String,
      enum: MERCH_TAGS,
      default: "Collectible",
      index: true,
    },
    /** Drives the "Upcoming releases" listing. */
    isUpcoming: { type: Boolean, default: false, index: true },
    releaseDate: { type: Date, default: null },

    viewCount: { type: Number, default: 0 },
    popularityScore: { type: Number, default: 0, index: true },
  },
  { timestamps: true },
);

MerchandiseItemSchema.index({ name: "text", description: "text" });

export const MerchandiseItem =
  models.MerchandiseItem ?? model("MerchandiseItem", MerchandiseItemSchema);
