import { Link } from "react-router";
import { Image } from "@/components/ui/image";
import { CATEGORIES } from "@/lib/constants";
import { InkStrip, RegMark } from "@/components/press";

const COLUMNS = [
  {
    heading: "Read",
    links: [
      { href: "/explore", label: "Explore all" },
      { href: "/media", label: "Multimedia" },
      { href: "/characters", label: "Characters" },
      { href: "/events", label: "Events" },
      { href: "/merch", label: "Shop merch" },
    ],
  },
  {
    heading: "Your account",
    links: [
      { href: "/dashboard", label: "Dashboard" },
      { href: "/bookmarks", label: "Bookmarks" },
      { href: "/profile", label: "Profile" },
      { href: "/submit", label: "Submit content" },
    ],
  },
  {
    heading: "The rest",
    links: [
      { href: "/sitemap-page", label: "Sitemap" },
      { href: "/feedback", label: "Send feedback" },
      { href: "/upcoming", label: "Upcoming releases" },
      { href: "/events", label: "Events map" },
    ],
  },
];

/** The foot of the sign: the channel rail, the index, and the imprint. */
export function SiteFooter() {
  return (
    <footer className="relative mt-auto border-t border-[var(--rule)] bg-[var(--paper-2)]">
      {/* The rail sits on the seam, so the eight signals read as the light
           under the footer rather than a band inside it. */}
      <InkStrip height={2} className="absolute inset-x-0 top-0" />

      <div className="mx-auto max-w-[88rem] px-5 py-14 sm:px-8">
        <div className="grid gap-10 md:grid-cols-[1.5fr_repeat(3,1fr)]">
          <div>
            {/* The footer has room for the full lockup, so it gets the
                 supplied artwork rather than the redrawn mark. */}
            <Link to="/" className="inline-block">
              <Image
                src="/brand/fanhub-plus-logo.webp"
                alt="Fan Hub Plus — where fans plug in"
                width={1568}
                height={1020}
                sizes="(max-width: 768px) 70vw, 20rem"
                className="h-auto w-[15rem] max-w-full rounded-xl"
              />
            </Link>
            <p className="mt-4 max-w-xs text-[0.95rem] leading-relaxed text-[var(--ink-soft)]">
              Eight fandoms, eight signals. Anime, gaming, film, television,
              K-Pop, comics, manga and cosplay — one undercity, open all night.
            </p>
            <RegMark className="mt-6 text-[var(--ink-faint)]" />
          </div>

          {COLUMNS.map((column) => (
            <div key={column.heading}>
              <p className="mark mb-4 border-b border-[var(--rule)] pb-2 text-[var(--n2)]">
                {column.heading}
              </p>
              <ul className="flex flex-col">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      to={link.href}
                      className="block border-b border-[var(--rule)] py-2 font-mono text-[0.66rem] uppercase tracking-[0.12em] text-[var(--ink-soft)] transition-colors hover:text-[var(--n1)]"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Channel index */}
        <div className="mt-12 border-t border-[var(--rule)] pt-6">
          <p className="mark mb-4 text-[var(--n2)]">Index of channels</p>
          <div className="grid gap-x-6 sm:grid-cols-2 lg:grid-cols-4">
            {CATEGORIES.map((category, index) => (
              <Link
                key={category.slug}
                to={`/category/${category.slug}`}
                className="group flex items-center gap-3 border-b border-[var(--rule)] py-2 transition-colors hover:border-[var(--rule-strong)]"
              >
                <span className="w-5 font-mono text-[0.62rem] tabular-nums text-[var(--ink-faint)]">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span
                  aria-hidden
                  className="h-2.5 w-2.5 shrink-0 rounded-full transition-transform duration-200 group-hover:scale-125"
                  style={{
                    background: `var(--ch-${category.token})`,
                    boxShadow: `0 0 10px var(--ch-${category.token})`,
                  }}
                />

                <span className="font-display text-[0.92rem] font-medium leading-none transition-transform duration-200 group-hover:translate-x-1">
                  {category.name}
                </span>
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-[var(--rule)] pt-6 font-mono text-[0.64rem] uppercase tracking-[0.14em] text-[var(--ink-faint)] sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} Fan Hub Plus — academic project build
          </p>
          <p>Merch checkout is a demo · no real payments</p>
        </div>
      </div>
    </footer>
  );
}
