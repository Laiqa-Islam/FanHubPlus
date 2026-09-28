# Fan Hub Plus — React + Node edition

A Fandom Universe portal covering eight communities — Anime, Gaming, Movies, TV Shows, K-Pop,
Comics, Manga and Cosplay.

This is a port of the Next.js 16 app in `D:\Techwiz-7\laiqa-project` to a classic two-tier stack.
Every page, component, style, animation and feature carries over; only the plumbing between
the browser and the database changed.

| | Before (Next.js) | Now |
| --- | --- | --- |
| UI | React Server + Client Components | **React 19 + Vite 7 + React Router 7** (`frontend/`) |
| Styling | Tailwind CSS 4 | Tailwind CSS 4 — same `index.css`, same classes |
| Server | Server Components, Server Actions, Route Handlers, `proxy.ts` | **Node.js + Express 5** (`backend/`) |
| Data | MongoDB via Mongoose | unchanged — same models, same database |
| Language | TypeScript | JavaScript (ES modules) |

---

## Installation

**Requirements:** Node.js 20.9+ and a MongoDB connection string.

```bash
npm run install:all
```

Configure the backend (it already has a working `.env` copied from the original project):

```bash
cp backend/.env.example backend/.env
```

| Variable | Purpose |
| --- | --- |
| `MONGODB_URI` | MongoDB connection string |
| `SESSION_SECRET` | Key used to sign session JWTs (`openssl rand -base64 32`) |
| `CLOUDINARY_*` | Media uploads — avatars and member submissions |
| `MAILTRAP_*`, `MAIL_FROM` | SMTP sandbox for verification and password-reset email |
| `APP_URL` | Frontend base URL used in emailed links (default `http://localhost:5210`) |
| `GEMINI_API_KEY`, `GEMINI_MODEL` | Optional AI assistant; the widget is hidden without a key |
| `PORT` | API port (default `5050`) |

Seed the database with demo content and the evaluation accounts (safe to re-run):

```bash
npm run seed
```

Start both servers (API on <http://localhost:5050>, app on <http://localhost:5210>):

```bash
npm run dev
```

Or run them separately with `npm run dev:api` and `npm run dev:web`.

**Production:** build the frontend, then the backend serves it together with the API from one
port (any non-`/api` GET falls back to `index.html` for client-side routing):

```bash
npm run build && npm start
```

---

## User credentials

Created by `npm run seed`, pre-verified.

| Role | Email | Password |
| --- | --- | --- |
| Administrator | `admin@fanhub.plus` | `Admin@12345` |
| Registered user | `user@fanhub.plus` | `User@12345` |
| Visitor | `visitor@fanhub.plus` | `Visitor@12345` |

---

## Scripts

| Where | Command | What it does |
| --- | --- | --- |
| root | `npm run dev` | API + web app together |
| root | `npm run build` / `npm start` | Build the frontend / serve everything from the API |
| root | `npm test` | Both unit-test suites |
| backend | `npm run dev` | API with `node --watch` |
| backend | `npm run seed` | Demo content + evaluation accounts |
| backend | `npm run seed:merch` | Merchandise only |
| backend | `npm run schema` | Export the schema to `backend/docs/` |
| backend | `npm run fetch-art` | Fetch the channel art library into `frontend/public/content/` |
| frontend | `npm run dev` / `build` / `preview` | Vite |

---

## Project layout

```
backend/
  src/
    server.js            Entry point
    app.js               Express app: security headers, routes, static frontend in production
    loaders/             Page data — one loader per page (was the async Server Components)
      index.js           Route table + the auth gate that proxy.ts used to be
      public.js auth.js showcase.js member.js admin.js
    actions/             Mutations (was app/actions — Server Actions), called over RPC
    routes/
      actions.js         POST /api/actions/:module/:name
      chat.js geocode.js media.js upload-sign.js event-calendar.js   (was app/api/*)
    lib/                 dal, session, db, queries, mail, cloudinary, gemini, rate-limit, …
      request-context.js AsyncLocalStorage: cookies(), headers(), redirect(), notFound()
      web-handler.js     Mounts Fetch-style (Request → Response) handlers on Express
    models/              Mongoose schemas (unchanged)
  scripts/               seed, seed-merch, export-schema, fetch-art, data/
frontend/
  index.html             Fonts + the pre-paint theme script
  vite.config.js         @ alias, /api proxy, dev security headers
  src/
    main.jsx router.jsx  Entry + route table
    layouts/             Root layout (header, footer, toasts, assistant) and the admin layout
    pages/               One file per route
    components/          Every component from the Next app, unchanged in look and behaviour
    actions/             Client stubs with the same names as the backend actions
    lib/                 api.js (loaders + RPC), navigation.js, and the client-safe libs
  public/                Brand, content art, merch photos, media clips
```

---

## How the port works

**Pages.** Each Next.js page was an async Server Component that queried MongoDB and then
rendered. That split cleanly in two: the query half is a backend *loader*
(`backend/src/loaders/*`), the render half is a React page (`frontend/src/pages/*`) with the
original JSX. React Router's route loader calls `GET /api/loader/<path>?<query>`, and the page
reads the result with `useLoaderData()`. A loader can still call `requireUser()`,
`requireAdmin()`, `redirect()` and `notFound()`; the envelope it sends back becomes a React
Router redirect or the Channel 404 page. Data and the page's code chunk load in parallel, and
while a different page loads the channel-rail loading state shows, as `loading.tsx` did.

**Actions.** The Server Actions kept their code and their names. `POST
/api/actions/<module>/<name>` runs one; the frontend's stubs in `src/actions/` have the same
signatures, so forms still use `useActionState(login, undefined)` and `<form action={…}>`.
FormData (including avatar files) travels as multipart and arrives as a real `FormData` with real
`File` objects. An action's `redirect()` navigates the app; `revalidatePath()` re-runs the
current page's loaders before the call resolves, so the UI refreshes as it did. Each action is
exactly as public as a Server Action was, which is why every one still authorises itself first.

**Request context.** `cookies()`, `headers()`, `redirect()` and React's `cache()` came from
Next. `lib/request-context.js` provides the same functions over an `AsyncLocalStorage` scope
around each request, so the DAL, session and action code read the same as before.

**Route gating.** `proxy.ts`'s optimistic cookie check now runs in the loader endpoint before
any page loader: protected pages bounce to `/login?next=…`, `/admin` is admin-only, signed-in
visitors skip the login/register pages, and `?session=expired` clears a dead cookie.

**API routes.** The route handlers were written against the standard `Request`/`Response`,
which Node has natively, so they are mounted almost unchanged through `lib/web-handler.js`
— the media proxy still streams upstream bodies and forwards Range requests.

**Metadata.** `export const metadata` became `<Meta title="…" description="…" />`, which sets
the document title (`"… · Fan Hub Plus"`), description and Open Graph tags.

**Images.** `next/image` became `components/ui/image.jsx`, a plain `<img>` that understands
`fill`, `priority` and `sizes`. Files are served as they are, without Next's resizing.

**Security headers.** The partial CSP from `next.config.ts` (frame-src pinned to the embed
origins, media-src, object-src, base-uri, form-action, frame-ancestors), `nosniff`, the referrer
policy and the permissions policy are sent by Express, and by Vite in development.

**Sessions.** A signed HS256 JWT in an `httpOnly`, `sameSite=lax` cookie (`secure` in
production). In development Vite proxies `/api` to Express, so the app and API share an origin
and the cookie needs no CORS.

---

## Carried over unchanged

Everything the original README describes still applies — the Neon Oni design language, the
light/dark/system theme and accessibility controls, GSAP motion with its failsafes and
reduced-motion handling, the Multimedia Center and its allowlisted streaming proxy, bookmarking
with private notes, location-aware events on OpenStreetMap with browser-side distances, event
passes and QR tickets, the demo cart and checkout, fan submissions with admin review, the admin
control panel, the categorised feedback form, and the grounded Gemini assistant with its FAQ
fallback. See the original project's README for the design and implementation notes behind them.

> **Content licensing.** As in the original build, `frontend/public/content/` and
> `frontend/public/media/` host franchise fan art and video. If this project goes anywhere
> beyond coursework, those are the first things to clear.

## Tests

```bash
npm test
```

The original Vitest suites moved with the code they test: `embeds`, `media-kinds` and
`sanitize` in the backend; `cart` and `cloudinary-url` in the frontend.
