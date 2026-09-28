import { SignJWT, jwtVerify } from "jose";
import { cookies } from "./request-context.js";

const secretKey = process.env.SESSION_SECRET;
if (!secretKey)
  throw new Error("SESSION_SECRET is missing. Add it to backend/.env.");
const encodedKey = new TextEncoder().encode(secretKey);

export const SESSION_COOKIE = "fanhub_session";
const SESSION_DAYS = 7;

export async function encrypt(payload) {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DAYS}d`)
    .sign(encodedKey);
}

export async function decrypt(token) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, encodedKey, {
      algorithms: ["HS256"],
    });
    return payload;
  } catch {
    // Expired, tampered with, or signed by a rotated secret — all mean "no session".
    return null;
  }
}

export async function createSession(payload) {
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  const token = await encrypt(payload);
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true, // not readable from client JS — blunts XSS token theft
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax", // survives top-level navigation, blocks cross-site POSTs
    expires: expiresAt,
    path: "/",
  });
}

export async function getSession() {
  const cookieStore = await cookies();
  return decrypt(cookieStore.get(SESSION_COOKIE)?.value);
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}
