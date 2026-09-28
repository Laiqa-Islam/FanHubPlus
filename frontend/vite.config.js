import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

import { EMBED_FRAME_ORIGINS } from "./src/lib/embeds.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const API_URL = process.env.API_URL || "http://localhost:5050";

// Mirrors the backend's security headers so development behaves like the
// built app the backend serves. Keep in sync with backend/src/app.js.
const securityHeaders = {
  "Content-Security-Policy": [
    `frame-src 'self' ${EMBED_FRAME_ORIGINS.join(" ")}`,
    "media-src 'self' blob: https://res.cloudinary.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].join("; "),
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(self)",
};

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { "@": path.resolve(__dirname, "src") },
  },
  server: {
    port: 5210,
    strictPort: true,
    headers: securityHeaders,
    // Same origin in development: the session cookie and every /api call
    // flow through Vite to the Express backend.
    proxy: {
      "/api": { target: API_URL, changeOrigin: false, xfwd: true },
    },
  },
  preview: {
    port: 5210,
    headers: securityHeaders,
    proxy: {
      "/api": { target: API_URL, changeOrigin: false, xfwd: true },
    },
  },
  test: {
    environment: "node",
  },
});
