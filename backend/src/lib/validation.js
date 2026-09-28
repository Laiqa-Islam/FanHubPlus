import { z } from "zod";
import { CATEGORY_SLUGS } from "./constants.js";

/** Shared password policy — reused by register and reset so they can't drift. */
const password = z
  .string()
  .min(8, "Use at least 8 characters.")
  .regex(/[a-zA-Z]/, "Include at least one letter.")
  .regex(/[0-9]/, "Include at least one number.");

export const RegisterSchema = z
  .object({
    name: z.string().trim().min(2, "Tell us what to call you.").max(60),
    email: z
      .string()
      .trim()
      .toLowerCase()
      .email("Enter a valid email address."),
    password,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match.",
    path: ["confirmPassword"],
  });

export const LoginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address."),
  password: z.string().min(1, "Enter your password."),
});

export const ForgotPasswordSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address."),
});

export const ResetPasswordSchema = z
  .object({
    token: z.string().min(1, "This reset link is invalid."),
    password,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match.",
    path: ["confirmPassword"],
  });

export const ProfileSchema = z.object({
  name: z.string().trim().min(2, "Tell us what to call you.").max(60),
  bio: z
    .string()
    .trim()
    .max(280, "Keep your bio under 280 characters.")
    .optional(),
  favoriteCategories: z.array(z.enum(CATEGORY_SLUGS)).max(8),
  fontScale: z.coerce.number().min(90).max(130),
  reducedMotion: z.boolean(),
});

/** Flattens a ZodError into the `{ field: message }` shape our forms render. */
export function fieldErrors(error) {
  const out = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
