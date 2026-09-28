import { Readable } from "node:stream";
import { runWithContext } from "./request-context.js";

/**
 * Mounts a Fetch-style handler — `(Request, { params }) => Response` — on
 * Express.
 *
 * The API routes (chat, geocode, media proxy, upload signing, calendar export)
 * were written against the standard Request/Response objects, which Node ships
 * natively. Keeping them in that shape means the streaming media proxy can
 * hand an upstream body straight through, and this adapter is the only code
 * that has to know about Express.
 */
export function webHandler(handler) {
  return (req, res, next) =>
    runWithContext(req, res, async () => {
      try {
        const url = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
        const headers = new Headers();
        for (const [key, value] of Object.entries(req.headers)) {
          if (Array.isArray(value)) value.forEach((v) => headers.append(key, v));
          else if (value !== undefined) headers.set(key, value);
        }

        const hasBody = !["GET", "HEAD"].includes(req.method);
        const request = new Request(url, {
          method: req.method,
          headers,
          body: hasBody ? Readable.toWeb(req) : undefined,
          duplex: hasBody ? "half" : undefined,
        });

        const response = await handler(request, {
          params: Promise.resolve({ ...req.params }),
        });

        res.status(response.status);
        response.headers.forEach((value, key) => {
          // Cookies set via the context shim are already on `res`.
          if (key.toLowerCase() === "set-cookie") res.append(key, value);
          else res.setHeader(key, value);
        });

        if (!response.body || req.method === "HEAD") {
          res.end();
          return;
        }

        const body = Readable.fromWeb(response.body);
        // A viewer scrubbing a video aborts requests constantly; stop reading
        // upstream the moment they go away.
        res.on("close", () => body.destroy());
        body.on("error", () => res.destroy());
        body.pipe(res);
      } catch (error) {
        next(error);
      }
    });
}
