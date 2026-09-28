import { createBrowserRouter } from "react-router";

import { loadPage } from "@/lib/api";
import { RootLayout } from "@/layouts/root-layout";
import { InitialLoading } from "@/pages/loading";
import RouteError from "@/pages/route-error";

/**
 * Every page gets its data from the backend's loader endpoint (see
 * `lib/api.js#loadPage`) and its code as a separate chunk, so a visitor who
 * never opens the admin panel never downloads it. Data and code load in
 * parallel.
 */
const page = (importer) => ({
  loader: (args) => loadPage(args),
  lazy: async () => {
    const module = await importer();
    return { Component: module.default };
  },
});

async function loadSession() {
  try {
    const response = await fetch("/api/session", { credentials: "same-origin" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    // The chrome must still render when the API is down; pages report their
    // own failures through the route error boundary.
    console.error("[session] unavailable:", error);
    return { user: null, assistantEnabled: false };
  }
}

export const router = createBrowserRouter([
  {
    id: "root",
    path: "/",
    loader: loadSession,
    // The header greets the member by name, so the session is re-read after
    // every navigation and action — a sign-in, sign-out or profile edit shows
    // immediately, as the server-rendered layout did.
    shouldRevalidate: () => true,
    Component: RootLayout,
    HydrateFallback: InitialLoading,
    children: [
      {
        errorElement: <RouteError />,
        children: [
          { index: true, ...page(() => import("@/pages/home")) },
          { path: "explore", ...page(() => import("@/pages/explore")) },
          { path: "category/:slug", ...page(() => import("@/pages/category")) },
          { path: "content/:slug", ...page(() => import("@/pages/content")) },
          { path: "media", ...page(() => import("@/pages/media")) },
          { path: "characters", ...page(() => import("@/pages/characters")) },
          { path: "characters/:slug", ...page(() => import("@/pages/character")) },
          { path: "events", ...page(() => import("@/pages/events")) },
          { path: "events/:slug", ...page(() => import("@/pages/event")) },
          { path: "merch", ...page(() => import("@/pages/merch")) },
          { path: "merch/:slug", ...page(() => import("@/pages/merch-item")) },
          { path: "upcoming", ...page(() => import("@/pages/upcoming")) },
          { path: "tickets/:code", ...page(() => import("@/pages/ticket")) },
          { path: "cart", ...page(() => import("@/pages/cart")) },
          { path: "checkout", ...page(() => import("@/pages/checkout")) },
          { path: "dashboard", ...page(() => import("@/pages/dashboard")) },
          { path: "profile", ...page(() => import("@/pages/profile")) },
          { path: "bookmarks", ...page(() => import("@/pages/bookmarks")) },
          { path: "submit", ...page(() => import("@/pages/submit")) },
          { path: "feedback", ...page(() => import("@/pages/feedback")) },
          { path: "sitemap-page", ...page(() => import("@/pages/sitemap")) },
          { path: "login", ...page(() => import("@/pages/login")) },
          { path: "register", ...page(() => import("@/pages/register")) },
          { path: "forgot-password", ...page(() => import("@/pages/forgot-password")) },
          { path: "reset-password", ...page(() => import("@/pages/reset-password")) },
          { path: "verify-email", ...page(() => import("@/pages/verify-email")) },
          {
            path: "admin",
            // The layout asks for its own data (the admin gate + name), not the
            // child page's, so it loads from a path of its own.
            ...page(() => import("@/layouts/admin-layout")),
            loader: (args) => loadPage(args, "/admin/_layout"),
            children: [
              { index: true, ...page(() => import("@/pages/admin/overview")) },
              { path: "content", ...page(() => import("@/pages/admin/content")) },
              { path: "characters", ...page(() => import("@/pages/admin/characters")) },
              { path: "merch", ...page(() => import("@/pages/admin/merch")) },
              { path: "events", ...page(() => import("@/pages/admin/events")) },
              { path: "faq", ...page(() => import("@/pages/admin/faq")) },
              { path: "tickets", ...page(() => import("@/pages/admin/tickets")) },
              { path: "submissions", ...page(() => import("@/pages/admin/submissions")) },
              { path: "feedback", ...page(() => import("@/pages/admin/feedback")) },
              { path: "users", ...page(() => import("@/pages/admin/users")) },
            ],
          },
          { path: "*", lazy: async () => ({ Component: (await import("@/pages/not-found")).default }) },
        ],
      },
    ],
  },
]);
