
import { connectToDatabase } from "./db.js";
import { RateBucket } from "../models/RateBucket.js";

/**
 * Fixed-window rate limiting, held in MongoDB (v2 Phase 16).
 *
 * v1 kept buckets in process memory, which stopped working the moment the app
 * ran as more than one instance: each process enforced its own quota, so N
 * instances meant N times the allowance, and the limiter protecting the login
 * form quietly became decorative. Moving the state into the database the app
 * already depends on fixes that without adding Redis to the deployment.
 *
 * The in-memory map survives as a fallback for when the database is unreachable.
 * Degrading to per-instance limiting is worse than shared limiting, but it is
 * much better than failing open on the brute-force protection.
 */

const globalForLimiter = globalThis;
const buckets = globalForLimiter._rateBuckets ?? new Map();
globalForLimiter._rateBuckets = buckets;

const allowed = { ok: true, retryAfterSeconds: 0 };

/**
 * Counts one hit against `key` and reports whether it may proceed.
 *
 * @param limit  Hits permitted within the window.
 * @param windowSeconds  Window length.
 */
export async function rateLimit(key, limit, windowSeconds) {
  try {
    await connectToDatabase();
    return await countInDatabase(key, limit, windowSeconds);
  } catch (error) {
    console.error("[rate-limit] falling back to in-memory bucket:", error);
    return countInMemory(key, limit, windowSeconds);
  }
}

async function countInDatabase(key, limit, windowSeconds) {
  const now = new Date();

  // Increment only while the current window is still open. Matching on
  // `resetAt` inside the query is what makes this atomic — read-then-write
  // would let concurrent requests both see "under the limit" and both pass.
  const live = await RateBucket.findOneAndUpdate(
    { _id: key, resetAt: { $gt: now } },
    { $inc: { count: 1 } },
    { new: true },
  ).lean();

  if (live) {
    return live.count > limit
      ? {
          ok: false,
          retryAfterSeconds: Math.max(
            1,
            Math.ceil(
              (new Date(live.resetAt).getTime() - now.getTime()) / 1000,
            ),
          ),
        }
      : allowed;
  }

  // No open window: start one. Two requests can race here and both open a
  // window — the loser's count is simply absorbed into the winner's, which
  // costs at most one extra request per window and never blocks a legitimate
  // caller.
  const resetAt = new Date(now.getTime() + windowSeconds * 1000);
  try {
    await RateBucket.updateOne(
      { _id: key },
      { $set: { count: 1, resetAt } },
      { upsert: true },
    );
  } catch (error) {
    // A concurrent upsert won the insert; count against the window it created.
    if (error.code === 11000) {
      await RateBucket.updateOne({ _id: key }, { $inc: { count: 1 } });
    } else {
      throw error;
    }
  }

  return allowed;
}

function countInMemory(key, limit, windowSeconds) {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || now > bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowSeconds * 1000 });
    return allowed;
  }

  bucket.count += 1;
  if (bucket.count > limit) {
    return {
      ok: false,
      retryAfterSeconds: Math.ceil((bucket.resetAt - now) / 1000),
    };
  }
  return allowed;
}

/** Clears a bucket after a successful attempt so honest users aren't punished. */
export async function resetLimit(key) {
  buckets.delete(key);
  try {
    await connectToDatabase();
    await RateBucket.deleteOne({ _id: key });
  } catch (error) {
    console.error("[rate-limit] reset failed:", error);
  }
}

// Opportunistic sweep of the in-memory fallback: drop expired buckets so the
// map can't grow unbounded. The database copy is swept by its TTL index.
if (!globalThis._rateSweep) {
  globalThis._rateSweep = setInterval(() => {
    const now = Date.now();
    for (const [key, bucket] of buckets) {
      if (now > bucket.resetAt) buckets.delete(key);
    }
  }, 60_000).unref?.();
}
