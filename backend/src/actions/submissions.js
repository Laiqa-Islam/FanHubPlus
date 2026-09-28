import { revalidatePath } from "../lib/request-context.js";
import { z } from "zod";

import { connectToDatabase } from "../lib/db.js";
import { FanSubmission, Content, ActivityLog } from "../models/index.js";
import { requireUser, requireAdmin } from "../lib/dal.js";
import { rateLimit } from "../lib/rate-limit.js";
import { verifyUploadedAsset, destroyAsset } from "../lib/cloudinary.js";
import { CATEGORY_SLUGS } from "../lib/constants.js";
import {
  FORMAT_SPECS,
  GALLERY_MAX,
  GALLERY_MIN,
  MEDIA_KINDS,
  SUBMISSION_FORMATS,
  isSubmissionFormat,
} from "../lib/media-kinds.js";
import {
  parseEmbed,
  embedKind,
  isEmbedProvider,
  supportedProviderList,
} from "../lib/embeds.js";
import { videoPosterUrl } from "../lib/cloudinary-url.js";
import { toSafeParagraphs, excerpt } from "../lib/sanitize.js";
import { fieldErrors } from "../lib/validation.js";
import { slugify } from "../lib/utils.js";

/**
 * Fan submissions (SRS FR-6), extended in v2 Phase 10 to accept photo sets,
 * audio, video and platform links rather than prose plus one image.
 *
 * Uploads do not pass through this action. The browser sends files straight to
 * Cloudinary using a signed credential from `/api/uploads/sign`, and what
 * arrives here is a list of public_ids. Each one is then verified against
 * Cloudinary — see `verifyUploadedAsset` — because a public_id from a form is a
 * claim, not evidence.
 */

/** What the client reports about each file it uploaded. */
const AttachmentSchema = z.object({
  publicId: z.string().trim().min(1).max(300),
  kind: z.enum(MEDIA_KINDS),
  caption: z.string().trim().max(200).default(""),
});

const BaseSchema = z.object({
  title: z
    .string()
    .trim()
    .min(6, "Give it a title of at least 6 characters.")
    .max(120),
  category: z.enum(CATEGORY_SLUGS, {
    error: "Pick a channel.",
  }),
  format: z.enum(SUBMISSION_FORMATS, {
    error: "Pick a format.",
  }),
  body: z.string().trim().max(20_000),
  transcript: z.string().trim().max(30_000).default(""),
  embedUrl: z.string().trim().max(400).default(""),
  ownWork: z.coerce.boolean().default(false),
  attachments: z.array(AttachmentSchema).max(GALLERY_MAX),
});

/** Reads the attachment manifest the client posts as JSON. */
function parseAttachments(raw) {
  if (typeof raw !== "string" || !raw.trim()) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Format-specific rules, applied after the shared shape validates.
 *
 * Kept separate from the Zod schema because each rule needs to name the field
 * it belongs to, and a single flat schema would either accept a photo set with
 * no photos or demand a video file from a written piece.
 */
function checkFormat(format, data) {
  const spec = FORMAT_SPECS[format];
  const errors = {};

  if (data.body.length < spec.minBody) {
    errors.body =
      format === "article"
        ? `Written pieces need at least ${spec.minBody} characters — tell us something substantial.`
        : `Add at least ${spec.minBody} characters of context so readers know what they're looking at.`;
  }

  const attachments = data.attachments;

  if (format === "gallery") {
    if (attachments.length < GALLERY_MIN) {
      errors.attachments = `A photo set needs at least ${GALLERY_MIN} images.`;
    } else if (attachments.some((item) => item.kind !== "image")) {
      errors.attachments = "A photo set takes images only.";
    }
  }

  if (format === "audio" || format === "video") {
    const file = attachments[0];
    if (!file) {
      errors.attachments = `Attach ${format === "audio" ? "an audio" : "a video"} file.`;
    } else if (file.kind !== format) {
      errors.attachments = `That file isn't ${format === "audio" ? "audio" : "video"}.`;
    }
  }

  if (
    format === "article" &&
    attachments.some((item) => item.kind !== "image")
  ) {
    errors.attachments = "A written piece takes a single cover image.";
  }

  if (format === "embed") {
    if (!data.embedUrl) {
      errors.embedUrl = "Paste a link to the video or track.";
    } else if (!parseEmbed(data.embedUrl)) {
      errors.embedUrl = `We can embed ${supportedProviderList()}. That link isn't one of them.`;
    }
  }

  // The declaration only means something where the member is handing us a file
  // to host. An embed leaves the media — and its licensing — where it already
  // sits, which is exactly why it's the safer route for anything they didn't make.
  if (spec.requiresOwnWork && attachments.length > 0 && !data.ownWork) {
    errors.ownWork = "Confirm this is your own work before submitting it.";
  }

  return Object.keys(errors).length > 0 ? errors : null;
}

/** Members submit fan content; it stays invisible until an admin approves it. */
export async function submitFanContent(_prev, formData) {
  const user = await requireUser();

  if (!user.emailVerified) {
    return { message: "Confirm your email address before submitting content." };
  }

  const limit = await rateLimit(`submission:${user.id}`, 5, 3600);
  if (!limit.ok) {
    return {
      message: `You've submitted a few already. Try again in ${limit.retryAfterSeconds}s.`,
    };
  }

  const parsed = BaseSchema.safeParse({
    title: formData.get("title"),
    category: formData.get("category"),
    format: formData.get("format"),
    body: formData.get("body") ?? "",
    transcript: formData.get("transcript") ?? "",
    embedUrl: formData.get("embedUrl") ?? "",
    ownWork: formData.get("ownWork") === "on",
    attachments: parseAttachments(formData.get("attachments")),
  });
  if (!parsed.success) return { errors: fieldErrors(parsed.error) };

  const data = parsed.data;
  const format = data.format;

  const formatErrors = checkFormat(format, data);
  if (formatErrors) return { errors: formatErrors };

  // Only the attachments this format actually uses, so a member who switches
  // format mid-compose doesn't silently carry the previous file along.
  const wanted =
    format === "gallery" ? data.attachments : data.attachments.slice(0, 1);
  const attachments = FORMAT_SPECS[format].uploadKind ? wanted : [];

  // Verified assets are tracked so they can be cleaned up if anything below
  // fails — an abandoned upload should not linger in the media library.
  const verified = [];

  try {
    for (const attachment of attachments) {
      const asset = await verifyUploadedAsset(
        attachment.publicId,
        attachment.kind,
        user.id,
      );
      verified.push(asset);
    }
  } catch (error) {
    await discard(verified);
    return { errors: { attachments: error.message } };
  }

  const embed = format === "embed" ? parseEmbed(data.embedUrl) : null;

  try {
    await connectToDatabase();

    await FanSubmission.create({
      userId: user.id,
      title: data.title,
      // Zod widens its enum output to string; the value is already one of
      // CATEGORY_SLUGS, so narrow it back for Mongoose's typed create.
      category: data.category,
      format,
      body: toSafeParagraphs(data.body),
      media: verified.map((asset, index) => ({
        url: asset.url,
        publicId: asset.publicId,
        kind: asset.kind,
        caption: attachments[index]?.caption ?? "",
        width: asset.width,
        height: asset.height,
        duration: asset.duration,
        bytes: asset.bytes,
        format: asset.format,
      })),
      embedProvider: embed?.provider ?? "",
      embedId: embed?.id ?? "",
      // Stored as plain text and rendered as text, so it never needs escaping.
      transcript:
        format === "audio" || format === "video" ? data.transcript : "",
      ownWorkDeclared:
        FORMAT_SPECS[format].requiresOwnWork && verified.length > 0
          ? data.ownWork
          : false,
    });

    await ActivityLog.create({
      userId: user.id,
      action: "submitted-content",
      label: `Submitted “${data.title}”`,
      href: "/submit",
    });
  } catch (error) {
    console.error("[submissions] create failed:", error);
    await discard(verified);
    return { message: "We couldn't save your submission. Please try again." };
  }

  revalidatePath("/submit");
  return {
    success: true,
    message: "Submitted. An administrator will review it shortly.",
  };
}

/** Best-effort removal of assets belonging to a submission that never saved. */
async function discard(assets) {
  await Promise.all(
    assets.map((asset) => destroyAsset(asset.publicId, asset.kind)),
  );
}

function publishableFields(submission) {
  const format = isSubmissionFormat(submission.format)
    ? submission.format
    : "article";
  const media = (submission.media ?? []).map((asset) => ({
    url: String(asset.url ?? ""),
    publicId: String(asset.publicId ?? ""),
    kind: asset.kind ?? "image",
    caption: String(asset.caption ?? ""),
    width: Number(asset.width ?? 0),
    height: Number(asset.height ?? 0),
    duration: Number(asset.duration ?? 0),
    bytes: Number(asset.bytes ?? 0),
    format: String(asset.format ?? ""),
  }));
  const first = media[0];

  // Pre-Phase-10 rows kept their cover image in `mediaUrl`.
  const legacyCover = submission.mediaUrl ?? "";

  switch (format) {
    case "gallery":
      return {
        type: "image",
        coverImage: String(first?.url ?? legacyCover),
        gallery: media,
        mediaUrl: "",
        mediaPoster: "",
        embedProvider: "",
        embedId: "",
        transcript: "",
      };

    case "audio":
      return {
        type: "audio",
        coverImage: "",
        gallery: [],
        mediaUrl: String(first?.url ?? ""),
        mediaPoster: "",
        embedProvider: "",
        embedId: "",
        transcript: submission.transcript ?? "",
      };

    case "video": {
      const url = String(first?.url ?? "");
      return {
        type: "video",
        coverImage: videoPosterUrl(url, { width: 1200 }),
        gallery: [],
        mediaUrl: url,
        // Cloudinary derives a still from the video itself, so a member never
        // has to supply a poster frame.
        mediaPoster: videoPosterUrl(url),
        embedProvider: "",
        embedId: "",
        transcript: submission.transcript ?? "",
      };
    }

    case "embed": {
      // Narrow rather than trust: a stored value that isn't a known provider
      // publishes as an empty embed, which `EmbedFrame` then declines to render.
      const provider = isEmbedProvider(submission.embedProvider)
        ? submission.embedProvider
        : "";
      return {
        type: embedKind(provider) ?? "video",
        coverImage: "",
        gallery: [],
        mediaUrl: "",
        mediaPoster: "",
        embedProvider: provider,
        embedId: submission.embedId ?? "",
        transcript: "",
      };
    }

    default:
      return {
        type: "article",
        coverImage: String(first?.url ?? legacyCover),
        gallery: [],
        mediaUrl: "",
        mediaPoster: "",
        embedProvider: "",
        embedId: "",
        transcript: "",
      };
  }
}

/**
 * Approving publishes a copy into the Content collection, which is what the
 * Explorer reads. Rejecting leaves a note and publishes nothing.
 */
export async function reviewSubmission(_prev, formData) {
  const admin = await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const decision = String(formData.get("decision") ?? "");
  const note = String(formData.get("note") ?? "").slice(0, 500);

  if (!id || !["approved", "rejected"].includes(decision)) {
    return { message: "That review action wasn't recognised." };
  }

  try {
    await connectToDatabase();
    const submission = await FanSubmission.findById(id);
    if (!submission) return { message: "That submission no longer exists." };
    if (submission.status !== "pending") {
      return { message: "That submission has already been reviewed." };
    }

    if (decision === "approved") {
      // Keep slugs unique — two members can easily submit the same title.
      const base = slugify(submission.title);
      let slug = base;
      let suffix = 2;
      while (await Content.exists({ slug })) {
        slug = `${base}-${suffix}`;
        suffix += 1;
      }

      const fields = publishableFields(submission.toObject());

      const published = await Content.create({
        title: submission.title,
        slug,
        category: submission.category,
        summary: excerpt(submission.body),
        body: submission.body,
        genre: ["Fan submission"],
        tags: ["Fan submission", submission.category],
        releaseDate: new Date(),
        status: "published",
        authorId: submission.userId,
        ...fields,
      });

      submission.publishedContentId = published._id;
    }

    submission.status = decision;
    submission.reviewedBy = admin.id;
    submission.reviewedAt = new Date();
    submission.reviewNote = note;
    await submission.save();
  } catch (error) {
    console.error("[submissions] review failed:", error);
    return { message: "We couldn't record that decision. Please try again." };
  }

  revalidatePath("/admin/submissions");
  revalidatePath("/explore");
  revalidatePath("/media");
  return { success: true, message: `Submission ${decision}.` };
}
