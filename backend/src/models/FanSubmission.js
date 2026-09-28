import mongoose from "mongoose";

const { Schema, model, models } = mongoose;
import { CATEGORY_SLUGS } from "../lib/constants.js";
import { SUBMISSION_FORMATS } from "../lib/media-kinds.js";
import { EMBED_PROVIDERS } from "../lib/embeds.js";
import { MediaAssetSchema } from "./media-asset.js";

/** Fan-submitted pieces awaiting admin approval before publication (SRS FR-6). */
const FanSubmissionSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: CATEGORY_SLUGS,
      required: true,
      index: true,
    },
    body: { type: String, required: true },

    /**
     * What kind of piece this is (v2 Phase 10). v1 accepted prose with an
     * optional cover image and nothing else; `format` is what lets a member
     * submit a photo set, a recording or a platform link, and what tells the
     * approval step which `Content.type` to publish it as.
     */
    format: {
      type: String,
      enum: SUBMISSION_FORMATS,
      default: "article",
      required: true,
      index: true,
    },

    /** Uploaded files. A gallery holds several; audio and video hold one. */
    media: { type: [MediaAssetSchema], default: [] },

    /**
     * A third-party embed, stored as provider + id — never as a URL.
     * `lib/embeds.ts` explains why that distinction is the security boundary.
     */
    embedProvider: {
      type: String,
      enum: [...EMBED_PROVIDERS, ""],
      default: "",
    },
    embedId: { type: String, default: "" },

    /**
     * Transcript or caption text for uploaded audio and video (v2 Phase 16).
     * Accessibility first, but it also makes spoken content searchable, which
     * a media file alone never is.
     */
    transcript: { type: String, default: "" },

    /**
     * The member's assertion that they created the attached media themselves.
     *
     * Recorded rather than merely displayed: SRS §1.5 binds the project to
     * licensing and copyright compliance, and for member uploads the only
     * workable basis for that is an explicit declaration an administrator can
     * see at review time. Formats that only link out (`embed`) don't need it —
     * the hosting platform already carries that responsibility.
     */
    ownWorkDeclared: { type: Boolean, default: false },

    /**
     * v1 stored a single cover image in these two fields. Kept so submissions
     * created before Phase 10 still render; new rows use `media` instead.
     */
    mediaUrl: { type: String, default: "" },
    mediaPublicId: { type: String, default: "" },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },
    reviewedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
    reviewedAt: { type: Date, default: null },
    reviewNote: { type: String, default: "" },
    /** Set once approved and mirrored into the Content collection. */
    publishedContentId: {
      type: Schema.Types.ObjectId,
      ref: "Content",
      default: null,
    },
  },
  { timestamps: true },
);

export const FanSubmission =
  models.FanSubmission ?? model("FanSubmission", FanSubmissionSchema);
