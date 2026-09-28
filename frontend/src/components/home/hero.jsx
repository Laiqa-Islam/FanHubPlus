import { Link } from "react-router";
import { Image } from "@/components/ui/image";
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ArrowRight, Play } from "lucide-react";

import { CATEGORIES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { RegMark } from "@/components/press";
import { stock, HERO_IMAGE } from "@/lib/stock-images";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * The cover.
 *
 * Asymmetric and flush left, with the right half given over to a single lit
 * plate — Nocturne's direction, at page scale. Behind the whole thing sits
 * the site's own name at 15vw in outline only, the way a sign is still
 * legible when the tubes are off.
 *
 * The load sequence is a sign coming up: the watermark strikes first, the
 * headline wipes on line by line, the plate fades up out of the dark, and
 * the stats count in last.
 */
export function Hero({ issueNumber, pieceCount }) {
  const scope = useRef(null);

  useGSAP(
    () => {
      // Reduced-motion readers get the finished layout, not a frozen one:
      // nothing here starts hidden in CSS, so returning early simply leaves
      // every element where it already is.
      if (document.documentElement.dataset.reducedMotion === "true") return;

      const timeline = gsap.timeline({ defaults: { ease: "power4.out" } });

      timeline
        .fromTo(
          "[data-watermark]",
          { opacity: 0 },
          { opacity: 1, duration: 0.8 },
        )
        .fromTo(
          "[data-headline]",
          { clipPath: "inset(0 100% 0 0)" },
          { clipPath: "inset(0 0% 0 0)", duration: 0.85, stagger: 0.12 },
          "-=0.5",
        )
        .fromTo(
          "[data-signal]",
          { opacity: 0, y: 10 },
          { opacity: 1, y: 0, duration: 0.45, stagger: 0.08 },
          "-=0.6",
        )
        .fromTo(
          "[data-strap]",
          { opacity: 0, y: 14 },
          { opacity: 1, y: 0, duration: 0.5 },
          "-=0.35",
        )
        // The plate comes up out of the dark rather than sliding in.
        .fromTo(
          "[data-plate]",
          { opacity: 0, scale: 1.06 },
          { opacity: 1, scale: 1, duration: 0.9 },
          "-=0.7",
        )
        .fromTo(
          "[data-cover-cta]",
          { opacity: 0, y: 12 },
          { opacity: 1, y: 0, duration: 0.45, stagger: 0.08 },
          "-=0.4",
        )
        .fromTo(
          "[data-stat]",
          { opacity: 0, y: 10 },
          { opacity: 1, y: 0, duration: 0.4, stagger: 0.07 },
          "-=0.25",
        )
        .fromTo(
          "[data-toast]",
          { opacity: 0, x: -16 },
          { opacity: 1, x: 0, duration: 0.5 },
          "-=0.2",
        )
        .fromTo(
          "[data-ink-bar]",
          { scaleX: 0, transformOrigin: "left center" },
          { scaleX: 1, duration: 0.4, stagger: 0.04 },
          "-=0.4",
        );

      // The watermark drifts slower than the page — depth without parallax
      // cliché, and it keeps the outline from tracking the headline exactly.
      gsap.to("[data-watermark]", {
        yPercent: 18,
        ease: "none",
        scrollTrigger: {
          trigger: scope.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });

      // Frames can stall (background tab, throttled rAF); timers do not.
      const failsafe = setTimeout(
        () => {
          if (timeline.progress() < 1) timeline.progress(1);
        },
        (timeline.duration() + 1.5) * 1000,
      );
      return () => clearTimeout(failsafe);
    },
    { scope },
  );

  return (
    <section ref={scope} className="relative overflow-hidden">
      {/* The name in outline only, sat behind everything and clipped by the
           section. Never announced — the masthead already says it. */}
      <div
        data-watermark
        aria-hidden
        className="stroke-type pointer-events-none absolute left-0 right-0 top-6 hidden select-none whitespace-nowrap text-center font-display text-[clamp(4.5rem,15vw,15rem)] font-black leading-[0.85] tracking-[-0.04em] sm:block"
      >
        FAN HUB
      </div>

      <div className="relative mx-auto grid max-w-[88rem] gap-12 px-5 pb-16 pt-14 sm:px-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:items-center lg:pt-20">
        {/* ── Left: the headline stack ─────────────────────────────────── */}
        <div className="relative z-10 flex max-w-xl flex-col gap-6">
          <div className="flex flex-wrap gap-2">
            <span
              data-signal
              className="sticker"
              style={{
                background: "var(--n3)",
                boxShadow:
                  "0 0 16px color-mix(in oklch, var(--n3) 45%, transparent)",
              }}
            >
              Eight channels · live now
            </span>
            <span
              data-signal
              className="sticker sticker-outline"
              style={{ color: "var(--n2)" }}
            >
              Issue {issueNumber}
            </span>
          </div>

          <h1 className="font-display text-[clamp(2.1rem,4.6vw,3.9rem)] font-black leading-[0.95] tracking-[-0.03em]">
            <span data-headline className="block">
              Every fandom
            </span>
            <span data-headline className="block">
              burns{" "}
              <span className="flick text-[var(--n1)] [--glow:var(--n1)] glow-text">
                brighter
              </span>
            </span>
            <span data-headline className="block">
              after dark.
            </span>
          </h1>

          <p
            data-strap
            className="max-w-md text-[1.04rem] leading-relaxed text-[var(--ink-soft)]"
          >
            Anime, gaming, film, television, K-Pop, comics, manga and cosplay —
            eight channels, one undercity. Stream the drops, open the character
            files, and save what you love.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <span data-cover-cta>
              <Button asChild size="lg">
                <Link to="/media">
                  <Play className="h-4 w-4 fill-current" aria-hidden />
                  Watch the drop
                </Link>
              </Button>
            </span>
            <span data-cover-cta>
              <Button asChild size="lg" variant="outline">
                <Link to="/characters">
                  Meet the crew
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
              </Button>
            </span>
          </div>

          {/* Three figures, each on its own signal. */}
          <dl className="flex flex-wrap gap-x-10 gap-y-4 pt-2">
            {[
              {
                value: pieceCount.toLocaleString(),
                label: "Pieces live",
                ink: "var(--n3)",
              },
              {
                value: String(CATEGORIES.length),
                label: "Channels",
                ink: "var(--n2)",
              },
              { value: "24/7", label: "Undercity hours", ink: "var(--n1)" },
            ].map((stat) => (
              <div key={stat.label} data-stat>
                <dt className="sr-only">{stat.label}</dt>
                <dd
                  className="font-display text-[1.6rem] font-bold leading-none tabular-nums"
                  style={{ color: stat.ink }}
                >
                  {stat.value}
                </dd>
                <p className="mt-1.5 font-mono text-[0.62rem] uppercase tracking-[0.14em] text-[var(--ink-faint)]">
                  {stat.label}
                </p>
              </div>
            ))}
          </dl>
        </div>

        {/* ── Right: the lit plate ─────────────────────────────────────── */}
        <div className="relative min-h-[22rem] lg:min-h-[32rem]">
          {/* A gradient slab sits behind the plate and off-axis from it, so
               the two rotations read as one object catching two lights. */}
          <div
            aria-hidden
            className="absolute inset-x-6 inset-y-0 rounded-[2.5rem] opacity-80"
            style={{
              background:
                "linear-gradient(160deg, var(--n1), color-mix(in oklch, var(--n2) 70%, var(--n1)))",
              transform: "rotate(3deg)",
            }}
          />

          <div
            data-plate
            className="absolute inset-x-6 inset-y-0 overflow-hidden rounded-[2.5rem] border-2 border-[var(--n2)] shadow-[0_0_50px_color-mix(in_oklch,var(--n2)_45%,transparent)]"
            style={{ transform: "rotate(-2deg)" }}
          >
            <Image
              src={stock(HERO_IMAGE)}
              alt=""
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 45vw"
              className="plate object-cover"
              style={{ objectPosition: "52% 30%" }}
            />

            {/* The plate darkens into the page at its foot so the card below
                 is not sitting on a bright edge. */}
            <div
              aria-hidden
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(0deg, color-mix(in oklch, var(--paper) 85%, transparent), transparent 55%)",
              }}
            />
          </div>

          {/* The live card — proof the place is running right now. */}
          <div
            data-toast
            className="absolute -left-1 bottom-6 z-10 flex items-center gap-3 rounded-2xl border border-[var(--edge-strong)] bg-[var(--paper-3)] px-4 py-3 shadow-[var(--lift-lg)] sm:left-2"
          >
            <span
              aria-hidden
              className="h-2.5 w-2.5 shrink-0 rounded-full bg-[var(--n3)] shadow-[0_0_12px_var(--n3)]"
              style={{ animation: "pulse-glow 2s ease-in-out infinite" }}
            />

            <div>
              <p className="text-[0.85rem] font-semibold leading-none">
                The board is live
              </p>
              <p className="mt-1.5 font-mono text-[0.58rem] uppercase tracking-[0.14em] text-[var(--ink-faint)]">
                {pieceCount.toLocaleString()} pieces · updated daily
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── The channel index ────────────────────────────────────────── */}
      <div className="mx-auto max-w-[88rem] px-5 pb-14 sm:px-8">
        <div className="flex items-baseline gap-4">
          <h2 className="font-display text-[1.4rem] font-bold">
            Pick your channel
          </h2>
          <span className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-[var(--n2)]">
            08 / 08 open
          </span>
        </div>

        <ul className="mt-6 grid gap-x-8 sm:grid-cols-2 lg:grid-cols-4">
          {CATEGORIES.map((category, index) => (
            <li key={category.slug}>
              <Link
                to={`/category/${category.slug}`}
                className="group flex items-center gap-3 border-b border-[var(--rule)] py-3 transition-colors hover:border-[var(--rule-strong)]"
              >
                <span className="w-6 shrink-0 font-mono text-[0.62rem] tabular-nums text-[var(--ink-faint)]">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span
                  data-ink-bar
                  aria-hidden
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{
                    background: `var(--ch-${category.token})`,
                    boxShadow: `0 0 10px var(--ch-${category.token})`,
                  }}
                />

                <span className="font-display text-[1rem] font-medium leading-none transition-transform duration-200 group-hover:translate-x-1">
                  {category.name}
                </span>
                <span className="ml-auto font-mono text-[0.58rem] uppercase tracking-[0.14em] text-[var(--ink-faint)] opacity-0 transition-opacity group-hover:opacity-100">
                  Open →
                </span>
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-6 flex items-center gap-3 font-mono text-[0.58rem] uppercase tracking-[0.16em] text-[var(--ink-faint)]">
          <RegMark />
          <span>Fan Hub Plus · eight channels · one merch drop</span>
        </div>
      </div>
    </section>
  );
}
