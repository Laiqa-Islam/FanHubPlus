import mongoose from "mongoose";

const { Schema, model, models } = mongoose;
import { CATEGORY_SLUGS, ROLES } from "../lib/constants.js";

const UserSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 60 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    // Never selected by default — an accidental `.find()` must not leak hashes.
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ROLES, default: "user", index: true },

    avatarUrl: { type: String, default: "" },
    // Cloudinary public_id, kept so we can destroy the old asset on replace.
    avatarPublicId: { type: String, default: "" },
    bio: { type: String, default: "", maxlength: 280 },

    /** Favourite fandoms — the many-to-many User ↔ Category link (SRS §1.8). */
    favoriteCategories: [{ type: String, enum: CATEGORY_SLUGS }],

    /** Display preferences surfaced in the profile editor.
     *  Neon Oni has a single dark ground, so there is no colour scheme to
     *  store — only the two accessibility controls the theme leaves open. */
    preferences: {
      fontScale: { type: Number, default: 100, min: 90, max: 130 },
      reducedMotion: { type: Boolean, default: false },
    },

    emailVerifiedAt: { type: Date, default: null },
    lastLoginAt: { type: Date, default: null },
  },
  { timestamps: true },
);

export const User = models.User ?? model("User", UserSchema);
