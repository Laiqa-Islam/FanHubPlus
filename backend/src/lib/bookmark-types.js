/**
 * Bookmark target kinds.
 *
 * These live outside `app/actions/bookmarks.ts` because a `"use server"`
 * module may only export async functions — exporting a constant from there
 * fails the build.
 */
export const BOOKMARK_TYPES = ["content", "character", "merchandise", "event"];
