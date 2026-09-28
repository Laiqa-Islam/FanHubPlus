// Client stubs for the backend's `profile` actions (POST /api/actions/profile/<name>).
import { callAction } from "@/lib/api";

export const updateProfile = (...args) => callAction("profile", "updateProfile", args);
