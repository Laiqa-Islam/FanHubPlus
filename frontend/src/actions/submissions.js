// Client stubs for the backend's `submissions` actions (POST /api/actions/submissions/<name>).
import { callAction } from "@/lib/api";

export const submitFanContent = (...args) => callAction("submissions", "submitFanContent", args);
export const reviewSubmission = (...args) => callAction("submissions", "reviewSubmission", args);
