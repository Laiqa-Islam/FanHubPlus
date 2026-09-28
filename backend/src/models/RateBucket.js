import mongoose from "mongoose";

const { Schema, model, models } = mongoose;

/**
 * One fixed rate-limit window, shared across application instances (v2 Phase 16).
 *
 * The key is the `_id`, which makes every read and write a single indexed
 * upsert and lets MongoDB enforce uniqueness for us.
 *
 * Buckets are disposable: the TTL index deletes them once `resetAt` passes, so
 * the collection stays proportional to *active* limiters rather than growing
 * forever. The application still compares `resetAt` itself, because Mongo's TTL
 * monitor sweeps on its own schedule and an expired document may briefly linger.
 */
const RateBucketSchema = new Schema(
  {
    _id: { type: String, required: true },
    count: { type: Number, required: true, default: 0 },
    resetAt: { type: Date, required: true },
  },
  { versionKey: false, _id: false },
);

RateBucketSchema.index({ resetAt: 1 }, { expireAfterSeconds: 0 });

export const RateBucket =
  models.RateBucket ?? model("RateBucket", RateBucketSchema);
