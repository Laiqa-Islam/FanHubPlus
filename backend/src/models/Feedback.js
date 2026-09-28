import mongoose from "mongoose";

const { Schema, model, models } = mongoose;
import { FEEDBACK_TYPES } from "../lib/constants.js";

/** Categorised feedback form submissions (SRS FR-8). */
const FeedbackSchema = new Schema(
  {
    // Null for visitors submitting without an account.
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    name: { type: String, default: "" },
    email: { type: String, default: "" },
    type: { type: String, enum: FEEDBACK_TYPES, required: true, index: true },
    subject: { type: String, default: "" },
    message: { type: String, required: true, maxlength: 2000 },
    status: {
      type: String,
      enum: ["open", "in-review", "resolved"],
      default: "open",
      index: true,
    },
    adminNote: { type: String, default: "" },
  },
  { timestamps: true },
);

export const Feedback = models.Feedback ?? model("Feedback", FeedbackSchema);
