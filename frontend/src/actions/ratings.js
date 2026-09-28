// Client stubs for the backend's `ratings` actions (POST /api/actions/ratings/<name>).
import { callAction } from "@/lib/api";

export const rateContent = (...args) => callAction("ratings", "rateContent", args);
export const getMyRating = (...args) => callAction("ratings", "getMyRating", args);
