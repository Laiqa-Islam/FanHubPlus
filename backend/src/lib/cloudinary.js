import crypto from "node:crypto";
import { v2 as cloudinary } from "cloudinary";

import { MEDIA_RULES } from "./media-kinds.js";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const ROOT_FOLDER = process.env.CLOUDINARY_FOLDER || "fanhub";

/** Everything we keep about a verified upload. */

/** A member's own upload area. Ownership is a path prefix we can re-derive. */
export function submissionFolder(userId) {
  return `${ROOT_FOLDER}/submissions/u${userId}`;
}

// ── Direct browser uploads ──────────────────────────────────────────────────

/**
 * Credentials for one browser-to-Cloudinary upload (v2 Phase 10).
 *
 * Large media cannot travel through a Server Action: action request bodies are
 * capped at 1MB by default, and raising that would buffer whole videos in the
 * Node process on a limit shared by every other action on the site. So the file
 * goes straight from the browser to Cloudinary, and only the resulting
 * public_id comes back through the form.
 *
 * The signature is what keeps that safe. `public_id` is chosen here — inside the
 * member's own folder, with a random suffix — and signed, so the returned
 * credential can only write to that one path. The client picks nothing.
 */
export function signUpload(userId, kind) {
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!apiKey || !cloudName || !apiSecret) {
    throw new Error("Cloudinary is not configured.");
  }

  const timestamp = Math.round(Date.now() / 1000);
  const publicId = `${submissionFolder(userId)}/${kind}-${crypto.randomUUID()}`;

  // Sign exactly the parameters the browser will send, sorted by key — this is
  // Cloudinary's scheme, and any mismatch surfaces as "Invalid Signature".
  const signature = crypto
    .createHash("sha1")
    .update(`public_id=${publicId}&timestamp=${timestamp}${apiSecret}`)
    .digest("hex");

  return {
    cloudName,
    apiKey,
    timestamp,
    signature,
    publicId,
    // Audio rides Cloudinary's video pipeline, so this is not always `kind`.
    resourceType: MEDIA_RULES[kind].resourceType,
    maxBytes: MEDIA_RULES[kind].maxBytes,
  };
}

/**
 * Confirms an asset the browser claims to have uploaded really exists, belongs
 * to this member, and is within the rules for its kind.
 *
 * This is the trust boundary for direct uploads. The client reports a
 * public_id; everything the application stores about the file — size, format,
 * dimensions, duration, URL — is read back from Cloudinary here, never taken
 * from the client. Without this step a member could name any public_id in the
 * account, or claim a 4GB file was 2MB.
 */
export async function verifyUploadedAsset(publicId, kind, userId) {
  const rule = MEDIA_RULES[kind];
  const expectedPrefix = `${submissionFolder(userId)}/`;

  // Check the path before spending an API call: an id outside the member's own
  // folder is a claim on someone else's file.
  if (!publicId.startsWith(expectedPrefix) || publicId.includes("..")) {
    throw new Error(
      "That upload couldn't be matched to your account. Try attaching it again.",
    );
  }

  let resource;

  try {
    resource = await cloudinary.api.resource(publicId, {
      resource_type: rule.resourceType,
    });
  } catch (error) {
    console.error("[cloudinary] verification lookup failed:", publicId, error);
    throw new Error(
      "We couldn't find that upload. Please attach the file again.",
    );
  }

  if (!resource?.secure_url) {
    throw new Error(
      "We couldn't find that upload. Please attach the file again.",
    );
  }

  const format = (resource.format ?? "").toLowerCase();
  if (!rule.formats.includes(format)) {
    // Delete rather than leave a rejected file sitting in the account.
    await destroyAsset(publicId, kind);
    throw new Error(
      `${format || "That file"} isn't a supported ${rule.label} format.`,
    );
  }

  const bytes = Number(resource.bytes ?? 0);
  if (bytes > rule.maxBytes) {
    await destroyAsset(publicId, kind);
    throw new Error(`That ${rule.label} is larger than the limit.`);
  }

  return {
    url: resource.secure_url,
    publicId: resource.public_id ?? publicId,
    kind,
    bytes,
    format,
    width: Number(resource.width ?? 0),
    height: Number(resource.height ?? 0),
    duration: Number(resource.duration ?? 0),
  };
}

// ── Server-side uploads (avatars, admin tooling) ────────────────────────────

/**
 * Validates and uploads a browser `File` through the server.
 *
 * Retained for avatars, which are small enough to fit a Server Action body.
 * Member media uses the signed direct-upload path above instead.
 *
 * `folder` is appended to the configured root, e.g. "avatars" → "fanhub/avatars".
 * Throws a message safe to show the user.
 */
export async function uploadImage(file, folder) {
  const rule = MEDIA_RULES.image;

  if (!rule.mimes.includes(file.type)) {
    throw new Error("Upload a JPG, PNG, WebP, AVIF or GIF image.");
  }
  if (file.size > rule.maxBytes) {
    throw new Error("Images must be 5 MB or smaller.");
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder: `${ROOT_FOLDER}/${folder}`,
          resource_type: "image",
          // Cap stored dimensions so a 6000px phone photo does not become the
          // source for every avatar request.
          transformation: [{ width: 1600, height: 1600, crop: "limit" }],
        },
        (error, result) => {
          if (error || !result) {
            // Cloudinary's messages are written for developers and include the
            // signing string, which is noise at best and shouldn't be shown to
            // a member. Log the real thing, surface something actionable.
            console.error("[cloudinary] upload failed:", error);

            const raw = error?.message ?? "";
            const isCredentialProblem =
              /invalid signature|api_secret|unknown api_key|api_key/i.test(raw);

            reject(
              new Error(
                isCredentialProblem
                  ? "Image uploads aren't configured correctly on this server. Your text was not submitted — please try again without an image, or contact an administrator."
                  : "That image couldn't be uploaded. Try a different file, or submit without one.",
              ),
            );
            return;
          }
          resolve({ url: result.secure_url, publicId: result.public_id });
        },
      )
      .end(buffer);
  });
}

/**
 * Removes a previously uploaded asset. Never throws — cleanup is best-effort.
 *
 * `kind` matters: Cloudinary keys deletion by resource type, and asking the
 * image API to delete a video reports success while deleting nothing.
 */
export async function destroyAsset(publicId, kind = "image") {
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId, {
      resource_type: MEDIA_RULES[kind].resourceType,
      invalidate: true,
    });
  } catch (error) {
    // An orphaned Cloudinary asset is not worth failing the user's request for.
    console.error("[cloudinary] destroy failed:", publicId, error);
  }
}

/** Back-compat alias for the avatar path, which only ever handles images. */
export const destroyImage = (publicId) => destroyAsset(publicId, "image");

export { cloudinary };
