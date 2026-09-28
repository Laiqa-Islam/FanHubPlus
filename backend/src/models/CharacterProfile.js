import mongoose from "mongoose";

const { Schema, model, models } = mongoose;
import { CATEGORY_SLUGS } from "../lib/constants.js";

/** Card-based character profiles (SRS FR-6). */
const CharacterProfileSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    category: {
      type: String,
      enum: CATEGORY_SLUGS,
      required: true,
      index: true,
    },

    /** The franchise the character belongs to, e.g. "Jujutsu Kaisen". */
    franchise: { type: String, default: "", index: true },
    bio: { type: String, default: "" },
    imageUrl: { type: String, default: "" },
    imagePublicId: { type: String, default: "" },

    /** Written in the character's own script where the franchise uses one. */
    kanji: { type: String, default: "" },
    /** Their function in the story, e.g. "Sorcerer · Mentor". */
    role: { type: String, default: "" },
    /** What they fight with, literally or otherwise. */
    signature: { type: String, default: "" },

    /**
     * The dossier fields the profile page is built around. The six that follow
     * `grade` are the section index down the right of the page, in this order.
     */
    /** The franchise's own ranking, e.g. "Special Grade", "S-Rank Hunter". */
    grade: { type: String, default: "" },
    /** One or two glyphs for the seal badge beside the grade. */
    sealMark: { type: String, default: "" },
    /**
     * The flood colour for this character's page. Stored per character rather
     * than derived from the channel, because the page is built around one
     * character's own signal — two sorcerers on the same channel should not
     * open in the same colour.
     */
    accent: { type: String, default: "" },

    affiliation: { type: String, default: "" },
    status: { type: String, default: "" },
    relationships: [{ type: String }],
    skills: [{ type: String }],
    /** Who they command or run with — the reference layout's "Troops" row. */
    troops: { type: String, default: "" },
    weapons: [{ type: String }],

    /**
     * The site's own read on a character: four axes on a 0-100 scale, drawn
     * as the lit meters on the profile page. Stored as a fixed-length array
     * rather than named keys so the order matches STAT_KEYS and the profile
     * can render it without a lookup.
     */
    stats: { type: [Number], default: () => [] },

    traits: [{ type: String }],
    debutYear: { type: Number, default: null },
    viewCount: { type: Number, default: 0 },
    popularityScore: { type: Number, default: 0, index: true },
  },
  { timestamps: true },
);

CharacterProfileSchema.index({
  name: "text",
  franchise: "text",
  traits: "text",
});

export const CharacterProfile =
  models.CharacterProfile ?? model("CharacterProfile", CharacterProfileSchema);
