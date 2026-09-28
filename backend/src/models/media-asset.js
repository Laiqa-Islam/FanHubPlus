import mongoose from "mongoose";

const { Schema } = mongoose;
import { MEDIA_KINDS } from "../lib/media-kinds.js";

/**
 * One uploaded file, embedded wherever media hangs off a record (v2 Phase 10).
 *
 * A subdocument schema rather than its own collection: an asset has no life
 * independent of the submission or content piece that owns it, and embedding
 * means a gallery loads in the same read as the article around it.
 *
 * Dimensions and duration are stored because they come back free from
 * Cloudinary's verification lookup, and having them lets the page reserve the
 * right space before an image or video arrives — which is the difference
 * between a layout that settles and one that jumps.
 */
export const MediaAssetSchema = new Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String, default: "" },
    kind: { type: String, enum: MEDIA_KINDS, required: true },
    /** Shown beneath the asset in a gallery. Plain text. */
    caption: { type: String, default: "" },
    width: { type: Number, default: 0 },
    height: { type: Number, default: 0 },
    /** Seconds. Zero for stills. */
    duration: { type: Number, default: 0 },
    bytes: { type: Number, default: 0 },
    format: { type: String, default: "" },
  },
  { _id: false },
);
