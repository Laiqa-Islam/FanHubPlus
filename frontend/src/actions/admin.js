// Client stubs for the backend's `admin` actions (POST /api/actions/admin/<name>).
import { callAction } from "@/lib/api";

export const saveResource = (...args) => callAction("admin", "saveResource", args);
export const deleteResource = (...args) => callAction("admin", "deleteResource", args);
export const setUserRole = (...args) => callAction("admin", "setUserRole", args);
