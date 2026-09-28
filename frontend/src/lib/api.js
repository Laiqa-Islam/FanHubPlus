import { redirect, data } from "react-router";

/**
 * The frontend's two ways of talking to the Node backend.
 *
 * - `loadPage` backs every route loader: it asks `/api/loader/<path>` for the
 *   data that page renders, and turns the backend's verdict (redirect, 404)
 *   into React Router control flow.
 * - `callAction` invokes one of the backend actions (the former Server
 *   Actions) and, like they did, follows a redirect or refreshes the current
 *   route's data when the action changed something the page shows.
 */

let router = null;

/** Called once from main.jsx so actions can navigate outside components. */
export function registerRouter(instance) {
  router = instance;
}

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

async function readJson(response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

export async function loadPage({ request }, pathname) {
  const url = new URL(request.url);
  const route = pathname ?? url.pathname;
  // Vercel's /api/:path* rewrite does not match a trailing slash after the
  // empty home route. /api/loader is the same Express route and proxies cleanly.
  const target = `${route === "/" ? "" : route}${url.search}`;
  const response = await fetch(`/api/loader${target}`, {
    signal: request.signal,
    credentials: "same-origin",
    headers: { Accept: "application/json" },
  });
  const body = await readJson(response);

  if (body?.redirect) throw redirect(body.redirect);
  if (response.status === 404 || body?.notFound) {
    throw data({ notFound: true }, { status: 404 });
  }
  if (!response.ok || !body) {
    throw new ApiError(body?.error ?? "This page didn't come through.", response.status);
  }
  return body.data ?? {};
}

/** Encodes action arguments, turning FormData into JSON entries + file parts. */
function encodeArgs(args) {
  const body = new FormData();
  let fileIndex = 0;

  const encoded = args.map((arg) => {
    if (!(arg instanceof FormData)) return arg === undefined ? null : arg;
    const entries = [];
    for (const [key, value] of arg.entries()) {
      if (typeof value === "string") {
        entries.push([key, value]);
      } else {
        const field = `file_${fileIndex++}`;
        body.append(field, value, value.name || "blob");
        entries.push([key, { $file: field }]);
      }
    }
    return { $formData: entries };
  });

  body.append("args", JSON.stringify(encoded));
  return body;
}

export async function callAction(module, name, args) {
  const response = await fetch(`/api/actions/${module}/${name}`, {
    method: "POST",
    body: encodeArgs(args),
    credentials: "same-origin",
  });
  const body = await readJson(response);

  if (!response.ok || !body) {
    throw new ApiError(body?.error ?? "The server didn't respond. Try again.", response.status);
  }

  if (body.redirect) {
    if (router) await router.navigate(body.redirect);
    else window.location.assign(body.redirect);
    return undefined;
  }

  // The action changed data the current page renders: re-run its loaders
  // before resolving, so the caller's follow-up (a toast, a reset) lands on
  // the refreshed page.
  if (body.revalidate && router) await router.revalidate();

  return body.result ?? undefined;
}

/** Builds a module of action stubs: `const { login } = actions("auth", [...])`. */
export function defineActions(module, names) {
  return Object.fromEntries(
    names.map((name) => [name, (...args) => callAction(module, name, args)]),
  );
}
