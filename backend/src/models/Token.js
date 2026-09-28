import mongoose from "mongoose";

const { Schema, model, models } = mongoose;

/**
 * Single-use tokens for email verification and password reset.
 *
 * Only the SHA-256 hash of the token is stored: a leaked database dump cannot
 * be replayed to take over an account. The raw token lives only in the emailed
 * link. Mongo's TTL monitor removes rows once `expiresAt` passes.
 */
const TokenSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    tokenHash: { type: String, required: true, index: true },
    purpose: {
      type: String,
      enum: ["email-verification", "password-reset"],
      required: true,
    },
    expiresAt: { type: Date, required: true },
    usedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

TokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const Token = models.Token ?? model("Token", TokenSchema);
