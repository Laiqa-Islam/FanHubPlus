import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import cookieParser from "cookie-parser";

import { EMBED_FRAME_ORIGINS } from "./lib/embeds.js";
import { runWithContext } from "./lib/request-context.js";
import { getCurrentUser } from "./lib/dal.js";
import { connectToDatabase } from "./lib/db.js";
import { isAssistantEnabled } from "./lib/gemini.js";
import { webHandler } from "./lib/web-handler.js";
import { actionsRouter } from "./routes/actions.js";
import { loaderRouter } from "./loaders/index.js";
import * as chat from "./routes/chat.js";
import * as geocode from "./routes/geocode.js";
import * as media from "./routes/media.js";
import * as uploadSign from "./routes/upload-sign.js";
import * as eventCalendar from "./routes/event-calendar.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Security headers.
 *
 * Deliberately a *partial* CSP. `default-src` and `script-src` are left unset:
 * locking those down properly needs per-request nonces, and a half-done
 * `script-src` ends up so permissive it certifies nothing. Directives with no
 * fallback declared are unrestricted, so what follows restricts exactly what
 * it names. `frame-src` pins embedded players to the origins `lib/embeds.js`
 * can produce, so even a bug that got an arbitrary URL into an iframe `src`
 * would fail to load.
 */
export const CONTENT_SECURITY_POLICY = [
  `frame-src 'self' ${EMBED_FRAME_ORIGINS.join(" ")}`,
  // Media is either proxied through /api/media (same-origin) or served from
  // our own Cloudinary account. blob: covers locally previewed uploads.
  "media-src 'self' blob: https://res.cloudinary.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

export const SECURITY_HEADERS = {
  "Content-Security-Policy": CONTENT_SECURITY_POLICY,
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  // The events explorer asks for geolocation to sort by distance, so that
  // stays available to this origin — but not to embedded players.
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(self)",
};

export function createApp() {
  const app = express();
  app.disable("x-powered-by");
  // Behind a proxy (or the Vite dev server) the client IP arrives in
  // X-Forwarded-For, which the rate limiter buckets on.
  app.set("trust proxy", true);

  app.use((_req, res, next) => {
    for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
      res.setHeader(key, value);
    }
    next();
  });
  app.use(cookieParser());

  const allowedOrigins = new Set([
    "https://fanhub-plus.vercel.app",
    "http://localhost:5210",
    process.env.APP_URL?.replace(/\/$/, ""),
  ].filter(Boolean));
  app.use("/api", (req, res, next) => {
    const origin = req.get("Origin");
    if (origin && allowedOrigins.has(origin)) {
      res.setHeader("Access-Control-Allow-Origin", origin);
      res.setHeader("Access-Control-Allow-Credentials", "true");
      res.setHeader("Vary", "Origin");
      if (req.method === "OPTIONS") {
        res.setHeader("Access-Control-Allow-Methods", "GET, HEAD, POST, OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type");
        res.status(204).end();
        return;
      }
    }
    next();
  });

  app.get("/api/health", async (_req, res) => {
    res.setHeader("Cache-Control", "no-store");
    try {
      if (!process.env.SESSION_SECRET) throw new Error("SESSION_SECRET is missing");
      const connection = await connectToDatabase();
      await connection.connection.db.admin().ping();
      res.json({ status: "ok" });
    } catch (error) {
      console.error("[api] health check failed:", error);
      res.status(503).json({ status: "unavailable" });
    }
  });

  // ── Session (the root layout's data) ─────────────────────────────────────
  app.get("/api/session", (req, res, next) =>
    runWithContext(req, res, async () => {
      try {
        const user = await getCurrentUser();
        res.setHeader("Cache-Control", "no-store");
        res.json({ user, assistantEnabled: isAssistantEnabled() });
      } catch (error) {
        next(error);
      }
    }),
  );

  // ── Page data and actions ────────────────────────────────────────────────
  app.use("/api/loader", loaderRouter);
  app.use("/api/actions", actionsRouter);

  // ── API routes ───────────────────────────────────────────────────────────
  app.post("/api/chat", webHandler(chat.POST));
  app.get("/api/chat", webHandler(chat.GET));
  app.get("/api/geocode", webHandler(geocode.GET));
  app.get("/api/media", webHandler(media.GET));
  app.post("/api/uploads/sign", webHandler(uploadSign.POST));
  app.get("/api/events/:slug/calendar", webHandler(eventCalendar.GET));

  app.use("/api", (_req, res) => res.status(404).json({ error: "Not found." }));

  // ── Built frontend (production) ──────────────────────────────────────────
  // In development Vite serves the app and proxies /api here. After
  // `npm run build` in frontend/, this process serves both.
  const dist = path.resolve(__dirname, "../../frontend/dist");
  if (fs.existsSync(path.join(dist, "index.html"))) {
    app.use(express.static(dist, { index: false, maxAge: "1h" }));
    // Any other GET is a client-side route.
    app.get(/.*/, (_req, res) => res.sendFile(path.join(dist, "index.html")));
  }

  // eslint-disable-next-line no-unused-vars
  app.use((error, _req, res, _next) => {
    if (error?.code === "LIMIT_FILE_SIZE") {
      res.status(413).json({ error: "That file is larger than 6MB." });
      return;
    }
    console.error("[api] unhandled error:", error);
    if (res.headersSent) return;
    res.status(500).json({ error: "Something went wrong. Try again." });
  });

  return app;
}

export default createApp();
