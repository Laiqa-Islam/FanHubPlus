import { revalidatePath } from "../lib/request-context.js";
import { connectToDatabase } from "../lib/db.js";
import { User, ActivityLog } from "../models/index.js";
import { requireUser } from "../lib/dal.js";
import { createSession } from "../lib/session.js";
import { uploadImage, destroyImage } from "../lib/cloudinary.js";
import { ProfileSchema, fieldErrors } from "../lib/validation.js";

/**
 * Updates the signed-in user's profile: display name, bio, favourite fandoms,
 * display preferences, and optionally a new avatar (SRS FR-1).
 */
export async function updateProfile(_prev, formData) {
  const current = await requireUser();

  const parsed = ProfileSchema.safeParse({
    name: formData.get("name"),
    bio: formData.get("bio") ?? "",
    favoriteCategories: formData.getAll("favoriteCategories").map(String),
    fontScale: formData.get("fontScale") ?? 100,
    reducedMotion: formData.get("reducedMotion") === "on",
  });

  if (!parsed.success) return { errors: fieldErrors(parsed.error) };

  const { name, bio, favoriteCategories, fontScale, reducedMotion } =
    parsed.data;

  try {
    await connectToDatabase();

    const update = {
      name,
      bio: bio ?? "",
      favoriteCategories,
      preferences: { fontScale, reducedMotion },
    };

    // Avatar is optional — an empty file input yields a 0-byte File.
    const avatar = formData.get("avatar");
    if (avatar instanceof File && avatar.size > 0) {
      try {
        const uploaded = await uploadImage(avatar, "avatars");
        update.avatarUrl = uploaded.url;
        update.avatarPublicId = uploaded.publicId;

        // Replace, don't accumulate: drop the previous asset.
        const existing = await User.findById(current.id).select(
          "avatarPublicId",
        );
        if (existing?.avatarPublicId)
          await destroyImage(existing.avatarPublicId);
      } catch (error) {
        return { errors: { avatar: error.message } };
      }
    }

    // `returnDocument: "after"` gives us the updated doc; the older `new: true`
    // spelling is deprecated in Mongoose 9.
    const user = await User.findByIdAndUpdate(current.id, update, {
      returnDocument: "after",
    });
    if (!user) return { message: "We couldn't find your account." };

    // The display name is denormalised into the session cookie, so re-issue it.
    await createSession({
      userId: String(user._id),
      role: user.role,
      name: user.name,
      emailVerified: Boolean(user.emailVerifiedAt),
    });

    await ActivityLog.create({
      userId: user._id,
      action: "updated-profile",
      label: "Updated profile",
      href: "/profile",
    });
  } catch (error) {
    console.error("[profile] update failed:", error);
    return { message: "Something went wrong saving your profile." };
  }

  revalidatePath("/profile");
  revalidatePath("/dashboard");
  return { success: true, message: "Profile saved." };
}
