import { Router } from "express";

import {
  runWithContext,
  RedirectSignal,
  NotFoundSignal,
} from "../lib/request-context.js";
import { decrypt, SESSION_COOKIE } from "../lib/session.js";
import { publicRoutes } from "./public.js";
import { authRoutes } from "./auth.js";
import { showcaseRoutes } from "./showcase.js";
import { memberRoutes } from "./member.js";
import { adminRoutes } from "./admin.js";

/**
 * Page loaders.
 *
 * In the Next.js app each page was an async Server Component that queried the
 * database before rendering. Here the query half lives on the server and the
 * render half in the React app: the frontend's route loader requests
 * `GET /api/loader/<page path>?<query>`, and the matching loader below returns
 * the page's data as JSON.
 *
 * A loader receives `{ params, searchParams }` shaped as the page props were
 * (repeated query keys arrive as arrays), and may call `redirect()` or
 * `notFound()` — including from inside `requireUser()` / `requireAdmin()`.
 * The envelope back to the browser is `{ data }`, `{ redirect }` or a 404.
 */

const ROUTES = [
  ...publicRoutes,
  ...authRoutes,
  ...showcaseRoutes,
  ...memberRoutes,
  ...adminRoutes,
].map(([pattern, loader]) => ({ pattern, loader, test: compile(pattern) }));

function compile(pattern) {
  const keys = [];
  const source = pattern
    .split("/")
    .map((segment) => {
      if (segment.startsWith(":")) {
        keys.push(segment.slice(1));
        return "([^/]+)";
      }
      return segment.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    })
    .join("/");
  const regex = new RegExp(`^${source}/?$`);
  return (path) => {
    const match = regex.exec(path);
    if (!match) return null;
    return Object.fromEntries(
      keys.map((key, i) => [key, decodeURIComponent(match[i + 1])]),
    );
  };
}

function toSearchParams(query) {
  const out = {};
  for (const [key, value] of Object.entries(query)) out[key] = value;
  return out;
}

// ── Route gating (formerly proxy.ts) ────────────────────────────────────────
// Optimistic only: it reads the signed cookie and redirects with no database
// call. Real authorisation lives in the DAL, next to the data.

const PROTECTED_PREFIXES = ["/dashboard", "/profile", "/bookmarks", "/submit", "/admin"];
const AUTH_PAGES = ["/login", "/register", "/forgot-password", "/reset-password"];

async function gate(req, res, pathname, search) {
  const session = await decrypt(req.cookies?.[SESSION_COOKIE]);
  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
  const isAuthPage = AUTH_PAGES.includes(pathname);

  // Unauthenticated user reaching for a gated page → login, remembering where
  // they were headed so we can return them after sign-in.
  if (isProtected && !session) {
    return `/login?${new URLSearchParams({ next: pathname })}`;
  }

  // Admin area is admin-only.
  if (pathname.startsWith("/admin") && session?.role !== "admin") {
    return "/dashboard?denied=admin";
  }

  // A session whose user no longer exists verifies here but fails in the DAL,
  // which would bounce /login → /dashboard → /login forever. The DAL flags
  // that case; clear the dead cookie and let the login page render.
  if (isAuthPage && search.get("session") === "expired") {
    res.clearCookie(SESSION_COOKIE, { path: "/" });
    if (req.cookies) delete req.cookies[SESSION_COOKIE];
    return null;
  }

  // Already signed in? The login/register pages have nothing to offer.
  if (isAuthPage && session) return "/dashboard";

  return null;
}

function replacer(_key, value) {
  if (value instanceof Set) return [...value];
  if (value instanceof Map) return Object.fromEntries(value);
  return value;
}

export const loaderRouter = Router();

loaderRouter.get(/.*/, (req, res, next) =>
  runWithContext(req, res, async () => {
    const pathname = req.path.replace(/\/+$/, "") || "/";
    const search = new URLSearchParams(req.originalUrl.split("?")[1] ?? "");
    res.setHeader("Cache-Control", "no-store");

    try {
      const bounce = await gate(req, res, pathname, search);
      if (bounce) {
        res.json({ redirect: bounce });
        return;
      }

      for (const route of ROUTES) {
        const params = route.test(pathname);
        if (!params) continue;
        const data = await route.loader({
          params,
          searchParams: toSearchParams(req.query),
          req,
        });
        res.type("application/json").send(JSON.stringify({ data: data ?? {} }, replacer));
        return;
      }

      res.status(404).json({ notFound: true });
    } catch (error) {
      if (error instanceof RedirectSignal) {
        res.json({ redirect: error.location });
        return;
      }
      if (error instanceof NotFoundSignal) {
        res.status(404).json({ notFound: true });
        return;
      }
      next(error);
    }
  }),
);
