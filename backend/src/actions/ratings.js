import { revalidatePath } from "../lib/request-context.js";
import { connectToDatabase } from "../lib/db.js";
import { Rating, Content, ActivityLog } from "../models/index.js";
import { getCurrentUser } from "../lib/dal.js";

/**
 * Records a member's 5-star rating on a piece (SRS FR-5).
 *
 * Re-rating updates the existing row rather than adding a second one, so the
 * average always reflects one vote per member. Aggregates are recomputed from
 * the ratings collection rather than incremented, which keeps them correct
 * even when a rating changes.
 */
export async function rateContent(contentId, stars, thumb = null) {
  const user = await getCurrentUser();
  if (!user) {
    return { ok: false, message: "Sign in to rate this." };
  }
  if (!user.emailVerified) {
    return {
      ok: false,
      message: "Confirm your email address to rate content.",
    };
  }
  if (!Number.isInteger(stars) || stars < 1 || stars > 5) {
    return { ok: false, message: "Ratings run from one to five stars." };
  }

  try {
    await connectToDatabase();

    const content =
      await Content.findById(contentId).select("slug ratingCount");
    if (!content) return { ok: false, message: "That item no longer exists." };

    await Rating.findOneAndUpdate(
      { userId: user.id, contentId },
      { $set: { stars, thumb } },
      { upsert: true },
    );

    // Recompute from source so an edited rating cannot drift the average.
    const [summary] = await Rating.aggregate([
      { $match: { contentId: content._id } },
      { $group: { _id: null, sum: { $sum: "$stars" }, count: { $sum: 1 } } },
    ]);

    const sum = summary?.sum ?? stars;
    const count = summary?.count ?? 1;
    const average = sum / count;

    await Content.findByIdAndUpdate(contentId, {
      ratingSum: sum,
      ratingCount: count,
      // Popularity blends audience score with reach, so a 5.0 from two people
      // does not outrank a 4.5 from four hundred.
      popularityScore: Math.round(average * 12 + Math.min(40, count)),
    });

    await ActivityLog.create({
      userId: user.id,
      action: "rated",
      label: `Rated ${stars}★`,
      targetType: "content",
      targetId: content._id,
      href: `/content/${content.slug}`,
    });

    revalidatePath(`/content/${content.slug}`);

    return {
      ok: true,
      message: "Thanks — rating saved.",
      average,
      count,
      mine: stars,
    };
  } catch (error) {
    console.error("[ratings] rateContent failed:", error);
    return { ok: false, message: "We couldn't save that rating. Try again." };
  }
}

/** The signed-in member's existing rating, so the widget opens pre-filled. */
export async function getMyRating(contentId) {
  const user = await getCurrentUser();
  if (!user) return null;

  try {
    await connectToDatabase();
    const rating = await Rating.findOne({ userId: user.id, contentId })
      .select("stars")
      .lean();
    return rating?.stars ?? null;
  } catch {
    return null;
  }
}
