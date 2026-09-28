import { cache } from "./request-context.js";
import { redirect } from "./request-context.js";
import { connectToDatabase } from "./db.js";
import { getSession } from "./session.js";
import { User } from "../models/index.js";

/**
 * Data Access Layer.
 *
 * Every authorisation decision runs through here rather than being sprinkled
 * across pages, so a route can't accidentally skip the check. `cache()` dedupes
 * the work within a single render pass.
 */

/** Returns the session or null. Never redirects — safe for public pages. */
export const verifySession = cache(async () => {
  const session = await getSession();
  if (!session?.userId) return null;
  return session;
});

/**
 * Loads the full user record for the active session.
 * Returns a plain object (not a Mongoose doc) so it can cross to Client
 * Components, and deliberately omits `passwordHash`.
 */
export const getCurrentUser = cache(async () => {
  const session = await verifySession();
  if (!session) return null;

  try {
    await connectToDatabase();
    const user = await User.findById(session.userId).lean();
    if (!user) return null;

    return {
      id: String(user._id),
      name: user.name,
      email: user.email,
      role: user.role,
      avatarUrl: user.avatarUrl ?? "",
      bio: user.bio ?? "",
      favoriteCategories: user.favoriteCategories ?? [],
      preferences: {
        fontScale: user.preferences?.fontScale ?? 100,
        reducedMotion: user.preferences?.reducedMotion ?? false,
      },
      emailVerified: Boolean(user.emailVerifiedAt),
      createdAt: user.createdAt?.toISOString() ?? new Date().toISOString(),
    };
  } catch (error) {
    console.error("[dal] getCurrentUser failed:", error);
    return null;
  }
});

/**
 * Requires any signed-in user; bounces to /login otherwise.
 *
 * The `session=expired` marker matters: a cookie can outlive the user it
 * points at — the record is deleted, or the database is swapped or reseeded
 * underneath it. The signature still verifies, so the optimistic gate in
 * `proxy.ts` sends /login to /dashboard while this sends /dashboard back to
 * /login, and the two bounce forever with no way to reach the form. The
 * marker tells the proxy to stand down and drop the stale cookie.
 */
export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    // Distinguish "no cookie at all" from "cookie pointing at nobody": only
    // the latter can loop, and only it should force the cookie to be cleared.
    const stale = Boolean(await verifySession());
    redirect(stale ? "/login?session=expired" : "/login");
  }
  return user;
}

/** Requires the admin role. Non-admins get the generic 404-style refusal. */
export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "admin") redirect("/dashboard?denied=admin");
  return user;
}
