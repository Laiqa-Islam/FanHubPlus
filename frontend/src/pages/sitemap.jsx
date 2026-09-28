import { Link } from "react-router";

import { Meta } from "@/components/meta";
import { CATEGORIES } from "@/lib/constants";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { InkStrip, Misreg, RegMark } from "@/components/press";

/**
 * Visual sitemap (SRS §1.9), linked from the home page.
 *
 * Grouped by who each area is for, because access level is the thing that
 * actually shapes the flow: most of the site is open, a band of it needs an
 * account, and one corner is administrators only.
 */

const PUBLIC_PAGES = [
  { href: "/", label: "Front page", note: "Hero, channel index, latest drops" },
  {
    href: "/explore",
    label: "Explore",
    note: "Search, filter and sort everything",
  },
  {
    href: "/media",
    label: "Multimedia Center",
    note: "Watch, listen, galleries, ratings",
  },
  {
    href: "/characters",
    label: "Characters",
    note: "Profile cards, filter by channel",
  },
  { href: "/events", label: "Events", note: "OpenStreetMap map + calendar" },
  { href: "/merch", label: "Merch", note: "Shop catalogue, grouped by fandom" },
  {
    href: "/cart",
    label: "Cart",
    note: "Persistent bag, quantities and totals",
  },
  {
    href: "/checkout",
    label: "Checkout",
    note: "Delivery and demo payment flow",
  },
  { href: "/upcoming", label: "Upcoming", note: "Release schedule by month" },
  { href: "/feedback", label: "Feedback", note: "Bug, suggestion or query" },
  { href: "/sitemap-page", label: "Sitemap", note: "This page" },
];

const DETAIL_PAGES = [
  {
    href: "/category/anime",
    label: "/category/[slug]",
    note: "One channel, filtered",
  },
  {
    href: "/explore",
    label: "/content/[slug]",
    note: "Article or media, with rating",
  },
  {
    href: "/characters",
    label: "/characters/[slug]",
    note: "One character profile",
  },
  {
    href: "/merch",
    label: "/merch/[slug]",
    note: "Product gallery + add to cart",
  },
];

const AUTH_PAGES = [
  { href: "/register", label: "Register", note: "Create a free account" },
  { href: "/login", label: "Sign in", note: "Session begins" },
  {
    href: "/verify-email",
    label: "Verify email",
    note: "Tokenised link, single use",
  },
  {
    href: "/forgot-password",
    label: "Forgot password",
    note: "Request a reset link",
  },
  {
    href: "/reset-password",
    label: "Reset password",
    note: "Set a new password",
  },
];

const MEMBER_PAGES = [
  {
    href: "/dashboard",
    label: "Dashboard",
    note: "Your channels, saves, activity",
  },
  {
    href: "/bookmarks",
    label: "Saved",
    note: "Saved items with private notes",
  },
  {
    href: "/profile",
    label: "Profile",
    note: "Fandoms, avatar, display preferences",
  },
  {
    href: "/submit",
    label: "Submit content",
    note: "Fan article, pending review",
  },
];

const ADMIN_PAGES = [
  { href: "/admin", label: "Overview", note: "Usage statistics" },
  { href: "/admin/content", label: "Content", note: "Create, edit, delete" },
  {
    href: "/admin/characters",
    label: "Characters",
    note: "Create, edit, delete",
  },
  { href: "/admin/merch", label: "Merch", note: "Create, edit, delete" },
  { href: "/admin/events", label: "Events", note: "Create, edit, delete" },
  { href: "/admin/faq", label: "FAQ", note: "Assistant knowledge base" },
  {
    href: "/admin/submissions",
    label: "Submissions",
    note: "Approve or reject",
  },
  { href: "/admin/feedback", label: "Feedback", note: "Triage reports" },
  { href: "/admin/users", label: "Users", note: "Role management" },
];

export default function SitemapPage() {
  return (
    <div>
      <Meta
        title="Sitemap"
        description="Every page in Fan Hub Plus and how they connect — the full flow of the application."
      />
      <header className="border-b border-[var(--rule-strong)]">
        <div className="mx-auto max-w-[88rem] px-5 pb-10 pt-8 sm:px-8">
          <Breadcrumbs trail={[{ label: "Sitemap" }]} />
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="mark mb-3">Application flow</p>
              <Misreg
                as="h1"
                className="text-[clamp(1.85rem,5.5vw,3.6rem)]"
                ghostInk="var(--ch-manga)"
              >
                Sitemap
              </Misreg>
              <p className="mt-5 max-w-xl border-l-2 border-[var(--ch-manga)] pl-5 text-[1.03rem] leading-relaxed text-[var(--ink-soft)]">
                Every page in Fan Hub Plus, grouped by who can reach it. Access
                level is what shapes the flow: most of the site is open to
                anyone, a band of it needs a free account, and one corner is
                administrators only.
              </p>
            </div>
            <RegMark className="hidden text-[var(--ink-faint)] sm:block" />
          </div>
        </div>
        <InkStrip height={5} />
      </header>

      <div className="mx-auto max-w-[88rem] px-5 py-12 sm:px-8">
        {/* Access tiers, as a flow */}
        <div className="mb-12 grid gap-2.5 sm:grid-cols-3">
          {[
            {
              tier: "Visitor",
              body: "Browse and read everything. No account needed.",
            },
            {
              tier: "Member",
              body: "Adds saves, notes, ratings and submissions.",
            },
            {
              tier: "Administrator",
              body: "Adds the control panel and moderation.",
            },
          ].map((step, index) => (
            <div
              key={step.tier}
              className="rounded-2xl border border-[var(--edge)] bg-[var(--paper-3)] p-5"
            >
              <p className="font-mono text-[0.62rem] tabular-nums text-[var(--ink-faint)]">
                {String(index + 1).padStart(2, "0")}
              </p>
              <p className="mt-2 font-display text-[1.15rem] leading-none">
                {step.tier}
              </p>
              <p className="mt-2 text-[0.88rem] leading-snug text-[var(--ink-soft)]">
                {step.body}
              </p>
            </div>
          ))}
        </div>

        <div className="grid gap-12 lg:grid-cols-2">
          <Section
            title="Open to everyone"
            ink="var(--ch-gaming)"
            nodes={PUBLIC_PAGES}
          />

          <Section
            title="Detail pages"
            ink="var(--ch-movies)"
            nodes={DETAIL_PAGES}
          />

          <Section
            title="Getting an account"
            ink="var(--ch-tv)"
            nodes={AUTH_PAGES}
          />

          <Section
            title="Members only"
            ink="var(--ch-anime)"
            nodes={MEMBER_PAGES}
          />

          <Section
            title="Administrators only"
            ink="var(--ch-comics)"
            nodes={ADMIN_PAGES}
            className="lg:col-span-2"
          />
        </div>

        {/* Channels */}
        <section className="mt-14 border-t border-[var(--rule-strong)] pt-5">
          <h2 className="mb-5 font-display text-[1.37rem] leading-none">
            The eight channels
          </h2>
          <div className="grid gap-x-6 sm:grid-cols-2 lg:grid-cols-4">
            {CATEGORIES.map((category, index) => (
              <Link
                key={category.slug}
                to={`/category/${category.slug}`}
                className="group flex items-center gap-3 border-b border-[var(--rule)] py-2.5 transition-colors hover:bg-[var(--paper-2)]"
              >
                <span className="w-5 font-mono text-[0.62rem] tabular-nums text-[var(--ink-faint)]">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span
                  aria-hidden
                  className="h-3.5 w-3.5 shrink-0 transition-transform duration-200 group-hover:scale-125 rounded-full"
                  style={{
                    background: `var(--ch-${category.token})`,
                    boxShadow: `0 0 9px var(--ch-${category.token})`,
                  }}
                />

                <span className="font-display text-[0.95rem] leading-none">
                  {category.name}
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* API surface, for the report */}
        <section className="mt-14 border-t border-[var(--rule-strong)] pt-5">
          <h2 className="mb-5 font-display text-[1.37rem] leading-none">
            Server endpoints
          </h2>
          <ul className="grid gap-x-8 sm:grid-cols-2">
            {[
              ["/api/chat", "Assistant: grounded answers + stored history"],
              ["/api/media", "Streams licensed media, host-allowlisted"],
              ["/api/geocode", "City search via OpenStreetMap Nominatim"],
              ["proxy.ts", "Route gating (Next 16's middleware)"],
            ].map(([path, note]) => (
              <li
                key={path}
                className="flex flex-wrap items-baseline gap-x-3 border-b border-[var(--rule)] py-2"
              >
                <span className="font-mono text-[0.78rem] text-[var(--spot-deep)]">
                  {path}
                </span>
                <span className="text-[0.86rem] text-[var(--ink-soft)]">
                  {note}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

function Section({ title, ink, nodes, className }) {
  return (
    <section className={className}>
      <div className="mb-4 flex items-center gap-3 border-t border-[var(--rule-strong)] pt-3">
        <span aria-hidden className="h-5 w-5" style={{ background: ink }} />
        <h2 className="font-display text-[1.22rem] leading-none">{title}</h2>
        <span className="mark !text-[0.58rem]">{nodes.length}</span>
      </div>
      <ul className="flex flex-col">
        {nodes.map((node) => (
          <li key={`${title}-${node.label}`}>
            <Link
              to={node.href}
              className="group flex flex-wrap items-baseline gap-x-3 border-b border-[var(--rule)] py-2.5 transition-colors hover:bg-[var(--paper-2)]"
            >
              <span className="font-display text-[0.95rem] leading-none transition-transform duration-200 group-hover:translate-x-1">
                {node.label}
              </span>
              <span className="font-mono text-[0.6rem] uppercase tracking-[0.1em] text-[var(--ink-faint)]">
                {node.note}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
