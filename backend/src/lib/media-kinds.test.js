import { describe, expect, it } from "vitest";

import {
  FORMAT_SPECS,
  GALLERY_MAX,
  GALLERY_MIN,
  MEDIA_KINDS,
  MEDIA_RULES,
  SUBMISSION_FORMATS,
  acceptAttribute,
  checkFile,
  formatBytes,
  isMediaKind,
  isSubmissionFormat,
} from "./media-kinds.js";

/**
 * These rules are read by both the browser and the server. A drift between the
 * two would mean a member gets to upload something the server then rejects, so
 * the table's internal consistency is worth asserting directly.
 */

describe("media rules", () => {
  it("covers every declared kind", () => {
    for (const kind of MEDIA_KINDS) {
      expect(MEDIA_RULES[kind]).toBeDefined();
      expect(MEDIA_RULES[kind].mimes.length).toBeGreaterThan(0);
      expect(MEDIA_RULES[kind].formats.length).toBeGreaterThan(0);
      expect(MEDIA_RULES[kind].maxBytes).toBeGreaterThan(0);
    }
  });

  it("routes audio through Cloudinary's video pipeline", () => {
    // Cloudinary has no audio resource_type; getting this wrong makes every
    // verification lookup miss.
    expect(MEDIA_RULES.audio.resourceType).toBe("video");
    expect(MEDIA_RULES.video.resourceType).toBe("video");
    expect(MEDIA_RULES.image.resourceType).toBe("image");
  });

  it("allows progressively larger files for heavier media", () => {
    expect(MEDIA_RULES.image.maxBytes).toBeLessThan(MEDIA_RULES.audio.maxBytes);
    expect(MEDIA_RULES.audio.maxBytes).toBeLessThan(MEDIA_RULES.video.maxBytes);
  });

  it("builds an accept attribute from the MIME list", () => {
    expect(acceptAttribute("image")).toContain("image/png");
    expect(acceptAttribute("image")).not.toContain("video/");
    expect(acceptAttribute("video")).toContain("video/mp4");
  });

  it("recognises only real kinds", () => {
    expect(isMediaKind("image")).toBe(true);
    expect(isMediaKind("document")).toBe(false);
    expect(isMediaKind(null)).toBe(false);
    expect(isMediaKind(undefined)).toBe(false);
    expect(isMediaKind(42)).toBe(false);
  });
});

describe("checkFile", () => {
  it("accepts a file inside the rules", () => {
    expect(checkFile({ type: "image/png", size: 1024 }, "image")).toBeNull();
    expect(
      checkFile({ type: "video/mp4", size: 10 * 1024 * 1024 }, "video"),
    ).toBeNull();
  });

  it("rejects the wrong kind of file", () => {
    expect(checkFile({ type: "video/mp4", size: 1024 }, "image")).toMatch(
      /image file/,
    );
    expect(
      checkFile({ type: "application/pdf", size: 1024 }, "image"),
    ).toBeTruthy();
  });

  it("rejects a file over the cap and says how big it was", () => {
    const message = checkFile(
      { type: "image/png", size: 9 * 1024 * 1024 },
      "image",
    );
    expect(message).toContain("5 MB");
    expect(message).toContain("9 MB");
  });

  it("rejects an empty MIME type, which is what a renamed file often reports", () => {
    expect(checkFile({ type: "", size: 1024 }, "image")).toBeTruthy();
  });
});

describe("formatBytes", () => {
  it("prints whole megabyte caps without a decimal", () => {
    expect(formatBytes(5 * 1024 * 1024)).toBe("5 MB");
    expect(formatBytes(60 * 1024 * 1024)).toBe("60 MB");
  });

  it("keeps one decimal for fractional sizes", () => {
    expect(formatBytes(1.5 * 1024 * 1024)).toBe("1.5 MB");
  });

  it("falls back to kilobytes below a megabyte", () => {
    expect(formatBytes(2048)).toBe("2 KB");
    // Never reports "0 KB" for a small but non-empty file.
    expect(formatBytes(10)).toBe("1 KB");
  });
});

describe("submission formats", () => {
  it("has a spec for every format", () => {
    for (const format of SUBMISSION_FORMATS) {
      expect(FORMAT_SPECS[format]).toBeDefined();
      expect(FORMAT_SPECS[format].label).toBeTruthy();
      expect(FORMAT_SPECS[format].blurb).toBeTruthy();
    }
  });

  it("only asks for a rights declaration where a file is hosted by us", () => {
    // An embed leaves the media with the platform that licensed it, so there is
    // nothing for the member to declare.
    expect(FORMAT_SPECS.embed.requiresOwnWork).toBe(false);
    expect(FORMAT_SPECS.embed.uploadKind).toBeNull();

    expect(FORMAT_SPECS.gallery.requiresOwnWork).toBe(true);
    expect(FORMAT_SPECS.audio.requiresOwnWork).toBe(true);
    expect(FORMAT_SPECS.video.requiresOwnWork).toBe(true);
  });

  it("matches each format to the upload kind it accepts", () => {
    expect(FORMAT_SPECS.gallery.uploadKind).toBe("image");
    expect(FORMAT_SPECS.gallery.multiple).toBe(true);
    expect(FORMAT_SPECS.audio.uploadKind).toBe("audio");
    expect(FORMAT_SPECS.audio.multiple).toBe(false);
    expect(FORMAT_SPECS.video.uploadKind).toBe("video");
  });

  it("expects more prose from a written piece than from a caption", () => {
    expect(FORMAT_SPECS.article.minBody).toBeGreaterThan(
      FORMAT_SPECS.video.minBody,
    );
  });

  it("keeps the gallery bounds sane", () => {
    expect(GALLERY_MIN).toBeGreaterThan(1);
    expect(GALLERY_MAX).toBeGreaterThan(GALLERY_MIN);
  });

  it("recognises only real formats", () => {
    expect(isSubmissionFormat("gallery")).toBe(true);
    expect(isSubmissionFormat("podcast")).toBe(false);
    expect(isSubmissionFormat(undefined)).toBe(false);
  });
});
