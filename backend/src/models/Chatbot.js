import mongoose from "mongoose";

const { Schema, model, models } = mongoose;

/**
 * Knowledge-base entries the assistant answers from, editable in the admin
 * panel (SRS FR-4 / FR-11). Defined in Phase 0 so the schema deliverable is
 * complete; the assistant itself lands in Phase 9.
 */
const FaqEntrySchema = new Schema(
  {
    question: { type: String, required: true },
    answer: { type: String, required: true },
    tags: [{ type: String }],
    category: { type: String, default: "" },
    isPublished: { type: Boolean, default: true, index: true },
    useCount: { type: Number, default: 0 },
  },
  { timestamps: true },
);

FaqEntrySchema.index({ question: "text", answer: "text", tags: "text" });

export const FaqEntry = models.FaqEntry ?? model("FaqEntry", FaqEntrySchema);

/** One turn of conversation, retained for context continuity. */
const ChatbotQuerySchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    /** Groups turns for anonymous visitors who have no user id. */
    sessionId: { type: String, required: true, index: true },
    message: { type: String, required: true },
    response: { type: String, default: "" },
    matchedFaqId: {
      type: Schema.Types.ObjectId,
      ref: "FaqEntry",
      default: null,
    },
  },
  { timestamps: true },
);

ChatbotQuerySchema.index({ sessionId: 1, createdAt: 1 });

export const ChatbotQuery =
  models.ChatbotQuery ?? model("ChatbotQuery", ChatbotQuerySchema);
