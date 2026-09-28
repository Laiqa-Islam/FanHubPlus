import { randomBytes, createHash } from "node:crypto";
import bcrypt from "bcryptjs";
import { headers } from "../lib/request-context.js";
import { redirect } from "../lib/request-context.js";
import { revalidatePath } from "../lib/request-context.js";

import { connectToDatabase } from "../lib/db.js";
import { User, Token, ActivityLog } from "../models/index.js";
import { createSession, deleteSession } from "../lib/session.js";
import { rateLimit, resetLimit } from "../lib/rate-limit.js";
import { sendVerificationEmail, sendPasswordResetEmail } from "../lib/mail.js";
import {
  RegisterSchema,
  LoginSchema,
  ForgotPasswordSchema,
  ResetPasswordSchema,
  fieldErrors,
} from "../lib/validation.js";

const TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

/** Hash a raw token for storage; the raw value only ever lives in the email. */
function hashToken(raw) {
  return createHash("sha256").update(raw).digest("hex");
}

async function issueToken(userId, purpose) {
  const raw = randomBytes(32).toString("hex");
  // Invalidate any outstanding tokens of the same purpose for this user.
  await Token.deleteMany({ userId, purpose });
  await Token.create({
    userId,
    tokenHash: hashToken(raw),
    purpose,
    expiresAt: new Date(Date.now() + TOKEN_TTL_MS),
  });
  return raw;
}

/** Best-effort client IP for rate-limit bucketing. */
async function clientKey(prefix) {
  const headerList = await headers();
  const ip =
    headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headerList.get("x-real-ip") ||
    "local";
  return `${prefix}:${ip}`;
}

// ── Register ────────────────────────────────────────────────────────────────

export async function register(_prev, formData) {
  const parsed = RegisterSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) return { errors: fieldErrors(parsed.error) };

  const limit = await rateLimit(await clientKey("register"), 5, 600);
  if (!limit.ok) {
    return {
      message: `Too many sign-up attempts. Try again in ${limit.retryAfterSeconds}s.`,
    };
  }

  const { name, email, password } = parsed.data;

  try {
    await connectToDatabase();

    if (await User.exists({ email })) {
      return { errors: { email: "That email is already registered." } };
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email, passwordHash, role: "user" });

    // Email delivery must not block account creation — the user can request a
    // fresh link from the verify page if Mailtrap is unreachable.
    try {
      const token = await issueToken(String(user._id), "email-verification");
      await sendVerificationEmail(email, name, token);
    } catch (error) {
      console.error("[auth] verification email failed:", error);
    }

    await ActivityLog.create({
      userId: user._id,
      action: "registered",
      label: "Joined Fan Hub Plus",
    });

    await createSession({
      userId: String(user._id),
      role: "user",
      name: user.name,
      emailVerified: false,
    });
  } catch (error) {
    console.error("[auth] register failed:", error);
    return { message: "We couldn't create your account. Please try again." };
  }

  redirect("/dashboard?welcome=1");
}

// ── Login ───────────────────────────────────────────────────────────────────

export async function login(_prev, formData) {
  const parsed = LoginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { errors: fieldErrors(parsed.error) };

  const { email, password } = parsed.data;
  const key = await clientKey(`login:${email}`);
  const limit = await rateLimit(key, 8, 600);
  if (!limit.ok) {
    return {
      message: `Too many attempts. Try again in ${limit.retryAfterSeconds}s.`,
    };
  }

  const next = String(formData.get("next") || "/dashboard");

  try {
    await connectToDatabase();

    // passwordHash is `select: false`, so ask for it explicitly.
    const user = await User.findOne({ email }).select("+passwordHash");

    // Same message whether the email is unknown or the password is wrong —
    // don't let the form become an account-enumeration oracle.
    const invalid = { errors: { password: "Email or password is incorrect." } };
    if (!user) return invalid;

    const matches = await bcrypt.compare(password, user.passwordHash);
    if (!matches) return invalid;

    await resetLimit(key);

    user.lastLoginAt = new Date();
    await user.save();

    await ActivityLog.create({
      userId: user._id,
      action: "logged-in",
      label: "Signed in",
    });

    await createSession({
      userId: String(user._id),
      role: user.role,
      name: user.name,
      emailVerified: Boolean(user.emailVerifiedAt),
    });
  } catch (error) {
    console.error("[auth] login failed:", error);
    return {
      message: "Something went wrong signing you in. Please try again.",
    };
  }

  // Only allow relative redirects — an attacker-supplied absolute URL here
  // would turn the login form into an open redirect.
  redirect(
    next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard",
  );
}

// ── Logout ──────────────────────────────────────────────────────────────────

export async function logout() {
  await deleteSession();
  revalidatePath("/", "layout");
  redirect("/");
}

// ── Email verification ──────────────────────────────────────────────────────

export async function verifyEmail(rawToken) {
  if (!rawToken)
    return { ok: false, message: "This verification link is invalid." };

  try {
    await connectToDatabase();
    const record = await Token.findOne({
      tokenHash: hashToken(rawToken),
      purpose: "email-verification",
      usedAt: null,
    });

    if (!record || record.expiresAt < new Date()) {
      return {
        ok: false,
        message: "This link has expired. Request a new one below.",
      };
    }

    await User.findByIdAndUpdate(record.userId, {
      emailVerifiedAt: new Date(),
    });
    record.usedAt = new Date();
    await record.save();

    return {
      ok: true,
      message: "Email confirmed. Your account is fully unlocked.",
    };
  } catch (error) {
    console.error("[auth] verifyEmail failed:", error);
    return {
      ok: false,
      message: "We couldn't confirm your email. Please try again.",
    };
  }
}

export async function resendVerification(_prev, formData) {
  const email = String(formData.get("email") || "")
    .trim()
    .toLowerCase();
  if (!email) return { errors: { email: "Enter your email address." } };

  const limit = await rateLimit(await clientKey(`resend:${email}`), 3, 900);
  if (!limit.ok) {
    return {
      message: `Please wait ${limit.retryAfterSeconds}s before requesting another link.`,
    };
  }

  try {
    await connectToDatabase();
    const user = await User.findOne({ email });
    if (user && !user.emailVerifiedAt) {
      const token = await issueToken(String(user._id), "email-verification");
      await sendVerificationEmail(user.email, user.name, token);
    }
  } catch (error) {
    console.error("[auth] resendVerification failed:", error);
  }

  // Deliberately uniform response — never reveals whether the address exists.
  return {
    success: true,
    message: "If that address needs confirming, a new link is on its way.",
  };
}

// ── Password reset ──────────────────────────────────────────────────────────

export async function requestPasswordReset(_prev, formData) {
  const parsed = ForgotPasswordSchema.safeParse({
    email: formData.get("email"),
  });
  if (!parsed.success) return { errors: fieldErrors(parsed.error) };

  const { email } = parsed.data;
  const limit = await rateLimit(await clientKey(`forgot:${email}`), 3, 900);
  if (!limit.ok) {
    return {
      message: `Please wait ${limit.retryAfterSeconds}s before trying again.`,
    };
  }

  try {
    await connectToDatabase();
    const user = await User.findOne({ email });
    if (user) {
      const token = await issueToken(String(user._id), "password-reset");
      await sendPasswordResetEmail(user.email, user.name, token);
    }
  } catch (error) {
    console.error("[auth] requestPasswordReset failed:", error);
  }

  return {
    success: true,
    message: "If an account exists for that address, we've sent a reset link.",
  };
}

export async function resetPassword(_prev, formData) {
  const parsed = ResetPasswordSchema.safeParse({
    token: formData.get("token"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) return { errors: fieldErrors(parsed.error) };

  const { token, password } = parsed.data;

  try {
    await connectToDatabase();
    const record = await Token.findOne({
      tokenHash: hashToken(token),
      purpose: "password-reset",
      usedAt: null,
    });

    if (!record || record.expiresAt < new Date()) {
      return { message: "This reset link has expired. Request a new one." };
    }

    const passwordHash = await bcrypt.hash(password, 12);
    await User.findByIdAndUpdate(record.userId, { passwordHash });

    record.usedAt = new Date();
    await record.save();

    // Force a fresh sign-in with the new password.
    await deleteSession();
  } catch (error) {
    console.error("[auth] resetPassword failed:", error);
    return { message: "We couldn't reset your password. Please try again." };
  }

  redirect("/login?reset=1");
}
