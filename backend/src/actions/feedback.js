import { revalidatePath } from "../lib/request-context.js";
import { headers } from "../lib/request-context.js";
import { z } from "zod";

import { connectToDatabase } from "../lib/db.js";
import { Feedback, ActivityLog } from "../models/index.js";
import { getCurrentUser, requireAdmin } from "../lib/dal.js";
import { rateLimit } from "../lib/rate-limit.js";
import { FEEDBACK_TYPES } from "../lib/constants.js";
import { fieldErrors } from "../lib/validation.js";

const FeedbackSchema = z.object({
  type: z.enum(FEEDBACK_TYPES, {
    error: "Choose what kind of message this is.",
  }),
  subject: z.string().trim().min(3, "Give it a short subject.").max(120),
  message: z
    .string()
    .trim()
    .min(20, "Tell us a little more — at least 20 characters.")
    .max(2000),
  name: z.string().trim().max(60).optional(),
  email: z.string().trim().max(160).optional(),
});

/** Categorised feedback form (SRS FR-8). Open to visitors as well as members. */
export async function submitFeedback(_prev, formData) {
  const parsed = FeedbackSchema.safeParse({
    type: formData.get("type"),
    subject: formData.get("subject"),
    message: formData.get("message"),
    name: formData.get("name") ?? "",
    email: formData.get("email") ?? "",
  });

  if (!parsed.success) return { errors: fieldErrors(parsed.error) };

  // Visitors can submit, so the limit is keyed on IP rather than account.
  const headerList = await headers();
  const ip =
    headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headerList.get("x-real-ip") ||
    "local";
  const limit = await rateLimit(`feedback:${ip}`, 5, 900);
  if (!limit.ok) {
    return {
      message: `That's a lot of feedback. Try again in ${limit.retryAfterSeconds}s.`,
    };
  }

  try {
    const user = await getCurrentUser();
    await connectToDatabase();

    await Feedback.create({
      userId: user?.id ?? null,
      // Signed-in details win over anything typed into the form.
      name: user?.name ?? parsed.data.name ?? "",
      email: user?.email ?? parsed.data.email ?? "",
      type: parsed.data.type,
      subject: parsed.data.subject,
      message: parsed.data.message,
      status: "open",
    });

    if (user) {
      await ActivityLog.create({
        userId: user.id,
        action: "submitted-feedback",
        label: `Sent feedback (${parsed.data.type})`,
        href: "/feedback",
      });
    }
  } catch (error) {
    console.error("[feedback] submit failed:", error);
    return { message: "We couldn't send that. Please try again." };
  }

  return { success: true, message: "Thanks — that's with the team." };
}

/** Admin triage: move a report through open → in-review → resolved. */
export async function updateFeedbackStatus(id, status, adminNote = "") {
  await requireAdmin();

  if (!["open", "in-review", "resolved"].includes(status)) {
    return { ok: false, message: "That status isn't recognised." };
  }

  try {
    await connectToDatabase();
    const result = await Feedback.updateOne(
      { _id: id },
      { $set: { status, adminNote: adminNote.slice(0, 500) } },
    );
    if (result.matchedCount === 0) {
      return { ok: false, message: "That report no longer exists." };
    }
    revalidatePath("/admin/feedback");
    return { ok: true, message: `Marked ${status}.` };
  } catch (error) {
    console.error("[feedback] status update failed:", error);
    return { ok: false, message: "We couldn't update that report." };
  }
}
