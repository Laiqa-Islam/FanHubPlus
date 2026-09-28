import { Link } from "react-router";
import {
  Search,
  Bookmark,
  MapPin,
  PlayCircle,
  Sparkles,
  ShieldCheck,
} from "lucide-react";

import { Reveal } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import { PressHeading, Misreg, Sticker } from "@/components/press";

const CAPABILITIES = [
  {
    icon: Search,
    title: "Search that narrows",
    ink: "var(--n2)",
    body: "Channel, genre, release year and format at once, then sorted by newest, most read, or A–Z.",
    href: "/explore",
  },
  {
    icon: PlayCircle,
    title: "Everything plays here",
    ink: "var(--n1)",
    body: "Trailers, breakdowns, timelapses, podcasts and soundtracks stream in place. Rate what you watch.",
    href: "/media",
  },
  {
    icon: Bookmark,
    title: "Save and annotate",
    ink: "var(--n3)",
    body: "Save any piece, character, reel or item, attach a private note, and find it again from your desk.",
    href: "/bookmarks",
  },
  {
    icon: MapPin,
    title: "Conventions near you",
    ink: "var(--ch-kpop)",
    body: "Meetups, screenings and cons on a map, or the calendar filtered by city with links to tickets.",
    href: "/events",
  },
  {
    icon: Sparkles,
    title: "Your own edition",
    ink: "var(--n2)",
    body: "Pick your channels once. The dashboard leads with them, next to everything you've saved.",
    href: "/dashboard",
  },
  {
    icon: ShieldCheck,
    title: "Cart to checkout",
    ink: "var(--ch-cosplay)",
    body: "Add fan-picked merch to a persistent cart, adjust quantities and complete the demo checkout flow.",
    href: "/merch",
  },
];

export function FeatureSections() {
  return (
    <>
      <section className="border-y border-[var(--rule)] bg-[var(--paper-2)]">
        <div className="mx-auto max-w-[88rem] px-5 py-16 sm:px-8">
          <PressHeading
            mark="What's in it"
            title="How it works"
            ghostInk="var(--n3)"
          />

          {/* Six panels, each lit by a different channel on hover, so the
               row reads as the colour key repeated rather than one accent. */}
          <Reveal
            stagger={0.06}
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            {CAPABILITIES.map((capability, index) => (
              <Link
                key={capability.title}
                to={capability.href}
                className="reveal group relative flex flex-col overflow-hidden rounded-2xl border border-[var(--edge)] bg-[var(--paper-3)] p-6 transition-[transform,border-color] duration-300 hover:-translate-y-1"
              >
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  style={{
                    border: `1px solid ${capability.ink}`,
                    boxShadow: `0 0 26px color-mix(in oklch, ${capability.ink} 28%, transparent)`,
                  }}
                />

                <div className="flex items-center gap-3">
                  <span className="font-mono text-[0.6rem] tabular-nums text-[var(--ink-faint)]">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span
                    className="grid h-8 w-8 place-items-center rounded-full transition-transform duration-300 group-hover:scale-110"
                    style={{
                      background: `color-mix(in oklch, ${capability.ink} 16%, transparent)`,
                      color: capability.ink,
                    }}
                  >
                    <capability.icon className="h-4 w-4" aria-hidden />
                  </span>
                </div>
                <h3 className="mt-4 font-display text-[1.02rem] font-bold leading-[1.15]">
                  {capability.title}
                </h3>
                <p className="mt-2.5 text-[0.9rem] leading-snug text-[var(--ink-soft)]">
                  {capability.body}
                </p>
              </Link>
            ))}
          </Reveal>
        </div>
      </section>

      {/* The close */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="halftone pointer-events-none absolute inset-0 text-[var(--n1)] opacity-[0.16]"
        />

        <div className="relative mx-auto max-w-[88rem] px-5 py-20 text-center sm:px-8">
          <Sticker ink="var(--n3)">No subscription · no paywall</Sticker>
          <Misreg
            as="h2"
            ghostInk="var(--n2)"
            className="mt-6 text-[clamp(1.9rem,6.5vw,4.6rem)] font-black"
          >
            Plug in
          </Misreg>
          <p className="mx-auto mt-6 max-w-lg text-[1.06rem] leading-relaxed text-[var(--ink-soft)]">
            Make an account to save pieces, rate what you watch, follow your
            channels, and get a front page that opens on the things you actually
            care about. It costs nothing.
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg">
              <Link to="/register">Create an account</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/explore">Look around first</Link>
            </Button>
          </div>

          {/* SRS §1.9 asks for the sitemap to be reachable from the home page. */}
          <Link
            to="/sitemap-page"
            className="mt-8 inline-block font-mono text-[0.64rem] uppercase tracking-[0.16em] text-[var(--ink-soft)] underline underline-offset-4 transition-colors hover:text-[var(--n2)]"
          >
            See the full sitemap →
          </Link>
        </div>
      </section>
    </>
  );
}
