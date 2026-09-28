import { getCurrentUser, requireUser } from "../lib/dal.js";
import { verifyEmail } from "../actions/auth.js";

const staticPage = async () => ({});

/**
 * /verify-email — with a token, spends it (the emailed link lands here);
 * without one, the page offers a fresh link instead.
 */
async function verifyEmailPage({ searchParams }) {
  const token = typeof searchParams.token === "string" ? searchParams.token : "";
  const user = await getCurrentUser();
  const viewer = user
    ? { email: user.email, emailVerified: user.emailVerified }
    : null;

  // No token means the user landed here from the header prompt rather than
  // from the emailed link.
  if (!token) return { user: viewer, result: null };

  const result = await verifyEmail(token);
  return { user: viewer, result };
}

async function profile() {
  const user = await requireUser();
  return { user };
}

async function feedback() {
  const user = await getCurrentUser();
  return { signedIn: Boolean(user) };
}

export const authRoutes = [
  ["/login", staticPage],
  ["/register", staticPage],
  ["/forgot-password", staticPage],
  ["/reset-password", staticPage],
  ["/verify-email", verifyEmailPage],
  ["/profile", profile],
  ["/feedback", feedback],
];
