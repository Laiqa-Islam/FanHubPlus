import { AsyncLocalStorage } from "node:async_hooks";

/**
 * Per-request context.
 *
 * The original Next.js app read cookies and headers through `next/headers`,
 * and signalled navigation with `redirect()` / `notFound()` from anywhere in
 * the call stack. Express has no ambient request, so every API call runs
 * inside an AsyncLocalStorage scope holding `req`/`res`, and these helpers
 * read from it. That keeps the actions, the DAL and the loaders written the
 * same way they were: deep code can still ask "who is signed in?" or bail out
 * with a redirect, without threading `req` through every signature.
 */
const storage = new AsyncLocalStorage();

export function runWithContext(req, res, fn) {
  return storage.run({ req, res, revalidated: false, memo: new Map() }, fn);
}

export function getContext() {
  const ctx = storage.getStore();
  if (!ctx) throw new Error("No request context — call inside runWithContext().");
  return ctx;
}

/** Read-only view of the request headers, shaped like `Headers#get`. */
export async function headers() {
  const { req } = getContext();
  return {
    get: (name) => {
      const value = req.headers[String(name).toLowerCase()];
      return Array.isArray(value) ? value.join(", ") : (value ?? null);
    },
  };
}

/** Cookie store with the same get/set/delete surface `next/headers` offered. */
export async function cookies() {
  const { req, res } = getContext();
  return {
    get: (name) => {
      const value = req.cookies?.[name];
      return value === undefined ? undefined : { name, value };
    },
    set: (name, value, options = {}) => {
      res.cookie(name, value, options);
      // Visible to anything later in the same request.
      if (req.cookies) req.cookies[name] = value;
    },
    delete: (name) => {
      res.clearCookie(name, { path: "/" });
      if (req.cookies) delete req.cookies[name];
    },
  };
}

// ── Control flow ─────────────────────────────────────────────────────────────

export class RedirectSignal extends Error {
  constructor(location) {
    super(`Redirect to ${location}`);
    this.location = location;
  }
}

export class NotFoundSignal extends Error {
  constructor() {
    super("Not found");
  }
}

/** Abandon the current request and send the browser elsewhere. */
export function redirect(location) {
  throw new RedirectSignal(location);
}

/** Abandon the current request with the 404 page. */
export function notFound() {
  throw new NotFoundSignal();
}

/**
 * Marks the response as having changed data the page shows, so the client
 * re-runs its route loaders. (Next revalidated by path; a single-page app only
 * ever shows one route, so a flag is all the precision that is useful.)
 */
export function revalidatePath() {
  const ctx = storage.getStore();
  if (ctx) ctx.revalidated = true;
}

/**
 * Per-request memoisation — the stand-in for React's server `cache()`, which
 * deduped DAL reads within one render pass.
 */
export function cache(fn) {
  const key = Symbol(fn.name || "cached");
  return (...args) => {
    const ctx = storage.getStore();
    if (!ctx) return fn(...args);
    const id = `${String(key.description)}:${JSON.stringify(args)}`;
    if (!ctx.memo.has(key)) ctx.memo.set(key, new Map());
    const bucket = ctx.memo.get(key);
    if (!bucket.has(id)) bucket.set(id, fn(...args));
    return bucket.get(id);
  };
}
