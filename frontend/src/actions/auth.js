// Client stubs for the backend's `auth` actions (POST /api/actions/auth/<name>).
import { callAction } from "@/lib/api";

export const register = (...args) => callAction("auth", "register", args);
export const login = (...args) => callAction("auth", "login", args);
export const logout = (...args) => callAction("auth", "logout", args);
export const verifyEmail = (...args) => callAction("auth", "verifyEmail", args);
export const resendVerification = (...args) => callAction("auth", "resendVerification", args);
export const requestPasswordReset = (...args) => callAction("auth", "requestPasswordReset", args);
export const resetPassword = (...args) => callAction("auth", "resetPassword", args);
