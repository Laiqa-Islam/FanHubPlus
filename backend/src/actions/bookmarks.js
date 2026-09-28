import { revalidatePath } from "../lib/request-context.js";
import { z } from "zod";

import { connectToDatabase } from "../lib/db.js";
import { Bookmark, ActivityLog } from "../models/index.js";
import { getCurrentUser } from "../lib/dal.js";
import { BOOKMARK_TYPES } from "../lib/bookmark-types.js";

/**
 * Bookmarking, notes and the saved list (SRS FR-9).
 *
 * A bookmark can point at any showcased item, so the target is a
 * (type, id) pair rather than a typed foreign key. A unique compound index on
 * (userId, targetType, targetId) is what actually guarantees one bookmark per
 * user per item — the toggle below reads before it writes, and without that
 * index two rapid clicks could still race into duplicates.
 */

const ToggleSchema = z.object({
  targetType: z.enum(BOOKMARK_TYPES),
  targetId: z
    .string()
    .regex(/^[a-f\d]{24}$/i, "That item reference isn't valid."),
});

/** Adds or removes a bookmark, returning the resulting state. */
export async function toggleBookmark(targetType, targetId, path) {
  const user = await getCurrentUser();
  if (!user) {
    return { ok: false, bookmarked: false, message: "Sign in to save this." };
  }

  const parsed = ToggleSchema.safeParse({ targetType, targetId });
  if (!parsed.success) {
    return {
      ok: false,
      bookmarked: false,
      message: "We couldn't save that item.",
    };
  }

  try {
    await connectToDatabase();

    const existing = await Bookmark.findOne({
      userId: user.id,
      targetType: parsed.data.targetType,
      targetId: parsed.data.targetId,
    });

    if (existing) {
      await existing.deleteOne();
      await ActivityLog.create({
        userId: user.id,
        action: "unbookmarked",
        label: "Removed a save",
        targetType: parsed.data.targetType,
        targetId: parsed.data.targetId,
      });
      if (path) revalidatePath(path);
      revalidatePath("/bookmarks");
      return {
        ok: true,
        bookmarked: false,
        message: "Removed from your saves.",
      };
    }

    await Bookmark.create({
      userId: user.id,
      targetType: parsed.data.targetType,
      targetId: parsed.data.targetId,
    });

    await ActivityLog.create({
      userId: user.id,
      action: "bookmarked",
      label: "Saved an item",
      targetType: parsed.data.targetType,
      targetId: parsed.data.targetId,
      href: path ?? "",
    });

    if (path) revalidatePath(path);
    revalidatePath("/bookmarks");
    return { ok: true, bookmarked: true, message: "Saved." };
  } catch (error) {
    // A duplicate-key error means the unique index caught a double click —
    // the bookmark exists, which is the state the user wanted anyway.
    if (error.code === 11000) {
      return { ok: true, bookmarked: true, message: "Saved." };
    }
    console.error("[bookmarks] toggle failed:", error);
    return {
      ok: false,
      bookmarked: false,
      message: "We couldn't save that. Try again.",
    };
  }
}

const NoteSchema = z.object({
  bookmarkId: z.string().regex(/^[a-f\d]{24}$/i),
  note: z.string().trim().max(500, "Notes are limited to 500 characters."),
});

/** Saves the private note attached to a clipping. */
export async function updateBookmarkNote(bookmarkId, note) {
  const user = await getCurrentUser();
  if (!user) return { ok: false, message: "Sign in to edit notes." };

  const parsed = NoteSchema.safeParse({ bookmarkId, note });
  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "That note isn't valid.",
    };
  }

  try {
    await connectToDatabase();
    // Scoping the update by userId is what stops one member editing another's
    // note by guessing an id.
    const result = await Bookmark.updateOne(
      { _id: parsed.data.bookmarkId, userId: user.id },
      { $set: { note: parsed.data.note } },
    );

    if (result.matchedCount === 0) {
      return { ok: false, message: "That item is no longer in your list." };
    }

    revalidatePath("/bookmarks");
    return { ok: true, message: "Note saved." };
  } catch (error) {
    console.error("[bookmarks] note update failed:", error);
    return { ok: false, message: "We couldn't save that note." };
  }
}

/**
 * Which of the given items the current member has already clipped.
 * One query for a whole listing, rather than one per card.
 */
export async function getBookmarkedIds(targetType, ids) {
  const user = await getCurrentUser();
  if (!user || ids.length === 0) return new Set();

  try {
    await connectToDatabase();
    const rows = await Bookmark.find({
      userId: user.id,
      targetType,
      targetId: { $in: ids },
    })
      .select("targetId")
      .lean();
    return new Set(rows.map((row) => String(row.targetId)));
  } catch {
    return new Set();
  }
}

/** Whether one specific item is clipped by the current member. */
export async function isBookmarked(targetType, targetId) {
  const user = await getCurrentUser();
  if (!user) return false;

  try {
    await connectToDatabase();
    return Boolean(
      await Bookmark.exists({ userId: user.id, targetType, targetId }),
    );
  } catch {
    return false;
  }
}
