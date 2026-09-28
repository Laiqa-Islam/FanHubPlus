// Client stubs for the backend's `bookmarks` actions (POST /api/actions/bookmarks/<name>).
import { callAction } from "@/lib/api";

export const toggleBookmark = (...args) => callAction("bookmarks", "toggleBookmark", args);
export const updateBookmarkNote = (...args) => callAction("bookmarks", "updateBookmarkNote", args);
export const getBookmarkedIds = (...args) => callAction("bookmarks", "getBookmarkedIds", args);
export const isBookmarked = (...args) => callAction("bookmarks", "isBookmarked", args);
