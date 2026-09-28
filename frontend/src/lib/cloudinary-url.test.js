import { describe, expect, it } from "vitest";

import {
  audioUrl,
  formatDuration,
  imageSrcSet,
  imageUrl,
  lqipUrl,
  videoPosterUrl,
} from "./cloudinary-url";

const IMAGE =
  "https://res.cloudinary.com/demo/image/upload/v1790397001/fanhub/plate.jpg";
const VIDEO =
  "https://res.cloudinary.com/demo/video/upload/v1790397001/fanhub/reel.mp4";
const UNSPLASH = "https://images.unsplash.com/photo-123?w=800";
const LOCAL = "/img/local.png";

describe("imageUrl", () => {
  it("inserts the transformation after the delivery marker", () => {
    expect(imageUrl(IMAGE, { width: 768 })).toBe(
      "https://res.cloudinary.com/demo/image/upload/f_auto,q_auto,w_768,c_limit/v1790397001/fanhub/plate.jpg",
    );
  });

  it("omits the width when none is asked for", () => {
    expect(imageUrl(IMAGE)).toContain("/upload/f_auto,q_auto/v1790397001/");
    expect(imageUrl(IMAGE)).not.toContain("w_");
  });

  it("uses c_limit so a small original is never upscaled", () => {
    expect(imageUrl(IMAGE, { width: 1920 })).toContain("c_limit");
  });

  it("leaves non-Cloudinary URLs completely alone", () => {
    expect(imageUrl(UNSPLASH, { width: 768 })).toBe(UNSPLASH);
    expect(imageUrl(LOCAL, { width: 768 })).toBe(LOCAL);
  });

  it("returns an empty string for empty input", () => {
    expect(imageUrl("")).toBe("");
  });

  /**
   * A public_id may itself contain the word "upload". Splicing on the *first*
   * `/upload/` is what keeps that from corrupting the URL.
   */
  it("splices on the delivery marker, not on a public_id that says 'upload'", () => {
    const tricky =
      "https://res.cloudinary.com/demo/image/upload/v1/fanhub/my-upload/plate.jpg";
    const result = imageUrl(tricky, { width: 480 });

    expect(result).toBe(
      "https://res.cloudinary.com/demo/image/upload/f_auto,q_auto,w_480,c_limit/v1/fanhub/my-upload/plate.jpg",
    );
    expect(result).toContain("/fanhub/my-upload/plate.jpg");
  });
});

describe("imageSrcSet", () => {
  it("offers one candidate per width, each with its descriptor", () => {
    const srcset = imageSrcSet(IMAGE, [320, 768]);
    const candidates = srcset.split(", ");

    expect(candidates).toHaveLength(2);
    expect(candidates[0]).toContain("w_320");
    expect(candidates[0].endsWith(" 320w")).toBe(true);
    expect(candidates[1].endsWith(" 768w")).toBe(true);
  });

  it("returns nothing for a host it cannot transform", () => {
    // An empty srcset is correct here: a wrong one would ask the browser to
    // pick between identical URLs.
    expect(imageSrcSet(UNSPLASH)).toBe("");
  });
});

describe("lqipUrl", () => {
  it("asks for a tiny blurred version", () => {
    const placeholder = lqipUrl(IMAGE);
    expect(placeholder).toContain("w_28");
    expect(placeholder).toContain("e_blur:600");
  });

  it("is empty for images it cannot transform, so no placeholder is drawn", () => {
    expect(lqipUrl(UNSPLASH)).toBe("");
  });
});

describe("videoPosterUrl", () => {
  it("takes the first frame and swaps the extension to jpg", () => {
    const poster = videoPosterUrl(VIDEO);
    expect(poster).toContain("so_0");
    expect(poster.endsWith(".jpg")).toBe(true);
    expect(poster).not.toContain(".mp4");
  });

  it("accepts a width for the poster", () => {
    expect(videoPosterUrl(VIDEO, { width: 1200 })).toContain("w_1200");
  });

  /**
   * Cloudinary derives a frame only from the video pipeline. Asking the image
   * pipeline for one returns nothing, so refusing here is better than emitting
   * a URL that 404s behind a poster attribute.
   */
  it("refuses an image URL", () => {
    expect(videoPosterUrl(IMAGE)).toBe("");
  });

  it("refuses a non-Cloudinary URL", () => {
    expect(videoPosterUrl("https://example.com/reel.mp4")).toBe("");
    expect(videoPosterUrl("")).toBe("");
  });
});

describe("audioUrl", () => {
  it("transcodes to mp3 so any upload is playable", () => {
    const url = audioUrl(
      "https://res.cloudinary.com/demo/video/upload/v1/fanhub/take.flac",
    );
    expect(url).toContain("f_mp3");
    expect(url.endsWith(".mp3")).toBe(true);
  });

  it("passes other hosts through", () => {
    expect(audioUrl(UNSPLASH)).toBe(UNSPLASH);
  });
});

describe("formatDuration", () => {
  it("formats under an hour as m:ss", () => {
    expect(formatDuration(0.4)).toBe("0:00");
    expect(formatDuration(9)).toBe("0:09");
    expect(formatDuration(75)).toBe("1:15");
    expect(formatDuration(600)).toBe("10:00");
  });

  it("adds an hours field past sixty minutes", () => {
    expect(formatDuration(3661)).toBe("1:01:01");
  });

  it("returns nothing for missing or nonsensical values", () => {
    expect(formatDuration(0)).toBe("");
    expect(formatDuration(null)).toBe("");
    expect(formatDuration(undefined)).toBe("");
    expect(formatDuration(-5)).toBe("");
    expect(formatDuration(Number.NaN)).toBe("");
    expect(formatDuration(Number.POSITIVE_INFINITY)).toBe("");
  });
});
