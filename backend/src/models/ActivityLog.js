import mongoose from "mongoose";

const { Schema, model, models } = mongoose;

/**
 * Feeds the dashboard's "recent activity" strip and the admin usage statistics
 * panel (SRS FR-2, FR-11).
 */
const ActivityLogSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    action: {
      type: String,
      enum: [
        "registered",
        "logged-in",
        "viewed-content",
        "bookmarked",
        "unbookmarked",
        "rated",
        "submitted-feedback",
        "submitted-content",
        "updated-profile",
        "chatbot-message",
        "claimed-pass",
        "released-pass",
      ],
      required: true,
      index: true,
    },
    /** Human-readable label rendered in the activity feed. */
    label: { type: String, default: "" },
    targetType: { type: String, default: "" },
    targetId: { type: Schema.Types.ObjectId, default: null },
    href: { type: String, default: "" },
  },
  { timestamps: true },
);

ActivityLogSchema.index({ userId: 1, createdAt: -1 });

export const ActivityLog =
  models.ActivityLog ?? model("ActivityLog", ActivityLogSchema);
