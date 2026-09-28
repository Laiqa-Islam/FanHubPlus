import mongoose from "mongoose";

const { Schema, model, models } = mongoose;

/**
 * A bookmark can point at any showcased item — article, character, video or
 * merch — so the target is stored as a (type, id) pair rather than a single
 * typed foreign key (SRS FR-9).
 */
const BookmarkSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    targetType: {
      type: String,
      enum: ["content", "character", "merchandise", "event"],
      required: true,
    },
    targetId: { type: Schema.Types.ObjectId, required: true },
    note: { type: String, default: "", maxlength: 500 },
  },
  { timestamps: true },
);

// One bookmark per user per item.
BookmarkSchema.index(
  { userId: 1, targetType: 1, targetId: 1 },
  { unique: true },
);

export const Bookmark = models.Bookmark ?? model("Bookmark", BookmarkSchema);
