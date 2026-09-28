// Client stubs for the backend's `feedback` actions (POST /api/actions/feedback/<name>).
import { callAction } from "@/lib/api";

export const submitFeedback = (...args) => callAction("feedback", "submitFeedback", args);
export const updateFeedbackStatus = (...args) => callAction("feedback", "updateFeedbackStatus", args);
