import { Router } from "express";
import multer from "multer";

import {
  runWithContext,
  getContext,
  RedirectSignal,
  NotFoundSignal,
} from "../lib/request-context.js";
import * as admin from "../actions/admin.js";
import * as auth from "../actions/auth.js";
import * as bookmarks from "../actions/bookmarks.js";
import * as feedback from "../actions/feedback.js";
import * as profile from "../actions/profile.js";
import * as ratings from "../actions/ratings.js";
import * as submissions from "../actions/submissions.js";
import * as tickets from "../actions/tickets.js";

/**
 * Remote procedure calls for the former Next.js Server Actions.
 *
 * Every exported function in `src/actions/*` is callable as
 * `POST /api/actions/<module>/<name>`. That is exactly the exposure Server
 * Actions had — each one was already a public HTTP endpoint — which is why
 * every action still authorises itself (requireUser / requireAdmin) as its
 * first statement rather than trusting the page that rendered the form.
 *
 * The body is multipart: `args` holds the JSON argument list, and any
 * FormData argument travels as `formdata:<i>` (its text entries, in order)
 * plus one file part per upload, so an action receives a real FormData with
 * real File objects — the same shape the browser form produced.
 */

const MODULES = {
  admin,
  auth,
  bookmarks,
  feedback,
  profile,
  ratings,
  submissions,
  tickets,
};

// Avatars are the only files that come through here (member media goes
// browser-direct to Cloudinary); 6MB matches the old Server Action body cap.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 6 * 1024 * 1024, files: 10 },
});

function reviveArgs(req) {
  const args = JSON.parse(req.body?.args ?? "[]");
  const files = new Map((req.files ?? []).map((file) => [file.fieldname, file]));

  return args.map((arg) => {
    if (!arg || typeof arg !== "object" || !("$formData" in arg)) return arg;
    const formData = new FormData();
    for (const [key, value] of arg.$formData) {
      if (value && typeof value === "object" && "$file" in value) {
        const file = files.get(value.$file);
        formData.append(
          key,
          file
            ? new File([file.buffer], file.originalname, { type: file.mimetype })
            : new File([], "", { type: "application/octet-stream" }),
        );
      } else {
        formData.append(key, String(value));
      }
    }
    return formData;
  });
}

/** Sets become arrays; everything else serialises as JSON normally would. */
function replacer(_key, value) {
  if (value instanceof Set) return [...value];
  if (value instanceof Map) return Object.fromEntries(value);
  return value;
}

export const actionsRouter = Router();

actionsRouter.post("/:module/:name", upload.any(), (req, res, next) =>
  runWithContext(req, res, async () => {
    const mod = MODULES[req.params.module];
    const fn = mod && Object.hasOwn(mod, req.params.name) ? mod[req.params.name] : null;
    if (typeof fn !== "function") {
      res.status(404).json({ error: "Unknown action." });
      return;
    }

    let args;
    try {
      args = reviveArgs(req);
    } catch {
      res.status(400).json({ error: "Malformed action payload." });
      return;
    }

    try {
      const result = await fn(...args);
      const body = JSON.stringify(
        { result: result ?? null, revalidate: getContext().revalidated },
        replacer,
      );
      res.type("application/json").send(body);
    } catch (error) {
      if (error instanceof RedirectSignal) {
        res.json({ redirect: error.location, revalidate: true });
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
