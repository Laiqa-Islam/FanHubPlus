import mongoose from "mongoose";

const { Schema, model, models } = mongoose;

/** User feedback on media — 5-star plus a thumbs signal (SRS FR-5). */
const RatingSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    contentId: {
      type: Schema.Types.ObjectId,
      ref: "Content",
      required: true,
      index: true,
    },
    stars: { type: Number, min: 1, max: 5, required: true },
    thumb: { type: String, enum: ["up", "down", null], default: null },
  },
  { timestamps: true },
);

// A user rates a given item once; re-rating updates the existing row.
RatingSchema.index({ userId: 1, contentId: 1 }, { unique: true });

export const Rating = models.Rating ?? model("Rating", RatingSchema);
