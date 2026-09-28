/**
 * Cloudinary delivery URLs (v2 Phase 12).
 *
 * Stored assets keep their plain `secure_url`. Transformations are composed at
 * render time by splicing a parameter segment in after `/upload/`, which keeps
 * one stored value serving every size instead of committing to a derived URL at
 * upload time.
 *
 * Client-safe: no SDK, no credentials, no `server-only`. Anything that isn't a
 * Cloudinary URL (an Unsplash editorial image, a local file) passes through
 * untouched, so call sites don't have to know where an image came from.
 */

const CLOUDINARY_HOST = "res.cloudinary.com";

/** Widths offered to `srcset`, chosen to cover card, column and full-bleed use. */
export const IMAGE_WIDTHS = [320, 480, 768, 1024, 1440, 1920];

function isCloudinary(url) {
  return url.includes(`${CLOUDINARY_HOST}/`) && url.includes("/upload/");
}

/**
 * Inserts a transformation segment into a Cloudinary URL.
 *
 * Splitting on the first `/upload/` is deliberate: a public_id may itself
 * contain the word "upload", and only the delivery-type marker is a valid
 * splice point.
 */
function withTransform(url, transform) {
  if (!isCloudinary(url) || !transform) return url;
  const marker = "/upload/";
  const at = url.indexOf(marker);
  if (at === -1) return url;

  const head = url.slice(0, at + marker.length);
  const tail = url.slice(at + marker.length);
  return `${head}${transform}/${tail}`;
}

/**
 * Delivery URL for an image at a given width.
 *
 * `f_auto` serves AVIF or WebP to browsers that accept them, `q_auto` picks a
 * quality per image rather than per site, and `c_limit` never upscales — a
 * 900px photo asked for at 1440 stays 900 instead of being blown up.
 */
export function imageUrl(url, options = {}) {
  if (!url) return "";
  const { width, quality = "auto" } = options;
  const parts = ["f_auto", `q_${quality}`];
  if (width) parts.push(`w_${width}`, "c_limit");
  return withTransform(url, parts.join(","));
}

/** A `srcset` across `IMAGE_WIDTHS`, for plain `<img>` outside next/image. */
export function imageSrcSet(url, widths = IMAGE_WIDTHS) {
  if (!isCloudinary(url)) return "";
  return widths
    .map((width) => `${imageUrl(url, { width })} ${width}w`)
    .join(", ");
}

/**
 * A tiny, heavily blurred version of an image, cheap enough to sit behind the
 * real one as a placeholder while it loads.
 */
export function lqipUrl(url) {
  if (!isCloudinary(url)) return "";
  return withTransform(url, "f_auto,q_20,w_28,c_limit,e_blur:600");
}

/**
 * Still frame from an uploaded video, for use as a poster.
 *
 * Cloudinary derives this by changing the extension on a video public_id, so
 * the URL's resource type must be `video` — asking the image pipeline for a
 * frame of a video returns nothing.
 */
export function videoPosterUrl(url, options = {}) {
  if (!url || !isCloudinary(url) || !url.includes("/video/upload/")) return "";

  const parts = ["so_0", "f_jpg", "q_auto"];
  if (options.width) parts.push(`w_${options.width}`, "c_limit");

  // Swap the source extension for .jpg; Cloudinary reads that as "give me a
  // frame". A URL with no extension gets one appended.
  const posterUrl = withTransform(url, parts.join(","));
  return posterUrl.replace(/\.[a-z0-9]+$/i, ".jpg");
}

/**
 * Waveform-friendly audio delivery. Cloudinary can transcode on the fly, so an
 * uploaded FLAC or WAV reaches the browser as something it can actually play.
 */
export function audioUrl(url) {
  if (!url || !isCloudinary(url)) return url;
  return withTransform(url, "f_mp3,q_auto").replace(/\.[a-z0-9]+$/i, ".mp3");
}

/** Formats a duration in seconds as m:ss, or h:mm:ss past an hour. */
export function formatDuration(seconds) {
  if (!seconds || !Number.isFinite(seconds) || seconds <= 0) return "";
  const total = Math.round(seconds);
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const secs = total % 60;

  return hours > 0
    ? `${hours}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`
    : `${minutes}:${String(secs).padStart(2, "0")}`;
}
