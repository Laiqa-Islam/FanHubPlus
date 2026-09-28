import { Link } from "react-router";
import { Image } from "@/components/ui/image";
import { ArrowUpRight } from "lucide-react";

import { CATEGORIES } from "@/lib/constants";
import { STOCK, stock } from "@/lib/stock-images";
import { Reveal } from "@/components/motion/reveal";
import { PressHeading } from "@/components/press";
import { Parallax } from "@/components/motion/parallax";
import { TiltCard } from "@/components/motion/tilt-card";

/**
 * All eight channels on one wall.
 *
 * The header dropdown already lists them, but a dropdown is something you
 * have to know to open. A visitor landing cold should be able to see the
 * whole shape of the site without clicking anything, and the channel is the
 * unit the entire app is organised around.
 *
 * Each tile leads with the first image in that channel's pool, so the wall
 * doubles as the colour key: the art says what the channel contains and the
 * accent says which one it is.
 */
export function ChannelWall() {
  return (
    <section className="border-y border-[var(--rule)] bg-[var(--paper-2)]">
      <div className="mx-auto max-w-[88rem] px-5 py-16 sm:px-8">
        <PressHeading
          mark="Eight channels"
          title="Pick a lane"
          ghostInk="var(--n1)"
          action={
            <Link
              to="/explore"
              className="group inline-flex items-center gap-2 font-mono text-[0.66rem] uppercase tracking-[0.16em] text-[var(--ink-soft)] transition-colors hover:text-[var(--n2)]"
            >
              Browse everything
              <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          }
        />

        <Reveal
          stagger={0.05}
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          {CATEGORIES.map((category, index) => {
            const ink = `var(--ch-${category.token})`;
            const pool = STOCK[category.slug] ?? STOCK.anime;

            return (
              <TiltCard key={category.slug} className="reveal" intensity={7}>
                <Link
                  to={`/category/${category.slug}`}
                  className="group relative flex h-full flex-col overflow-hidden rounded-[1.4rem] border border-[var(--edge)] bg-[var(--paper-3)]"
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    {/* The image is oversized so the parallax drift never
                         exposes an edge as the tile crosses the viewport. */}
                    <Parallax speed={0.12} className="absolute inset-[-12%]">
                      <Image
                        src={stock(pool[0])}
                        alt=""
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        className="plate object-cover transition-transform duration-700 group-hover:scale-[1.06]"
                      />
                    </Parallax>

                    {/* Two washes: one to seat the art in the page's ground,
                         one in the channel's own hue so the tile is tinted
                         before you read a word of it. */}
                    <span
                      aria-hidden
                      className="absolute inset-0"
                      style={{
                        background:
                          "linear-gradient(to top, var(--paper-3) 4%, transparent 62%)",
                      }}
                    />

                    <span
                      aria-hidden
                      className="absolute inset-0 opacity-45 mix-blend-overlay transition-opacity duration-500 group-hover:opacity-70"
                      style={{ background: ink }}
                    />

                    <span
                      className="absolute left-3 top-3 grid h-7 w-7 place-items-center rounded-lg font-mono text-[0.6rem] font-bold tabular-nums text-[var(--void)]"
                      style={{
                        background: ink,
                        boxShadow: `0 0 16px color-mix(in oklch, ${ink} 55%, transparent)`,
                      }}
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </div>

                  <div className="flex flex-1 flex-col p-4">
                    <h3
                      className="font-display text-[1.05rem] font-black leading-none transition-colors duration-300"
                      style={{ color: "var(--ink)" }}
                    >
                      {category.name}
                    </h3>
                    <p className="mt-2 line-clamp-2 text-[0.82rem] leading-snug text-[var(--ink-faint)]">
                      {category.tagline}
                    </p>
                    <span
                      className="mt-3 inline-flex items-center gap-1 font-mono text-[0.58rem] uppercase tracking-[0.16em] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                      style={{ color: ink }}
                    >
                      Open channel
                      <ArrowUpRight className="h-3 w-3" aria-hidden />
                    </span>
                  </div>

                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-0 rounded-[1.4rem] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                    style={{
                      border: `1px solid ${ink}`,
                      boxShadow: `0 0 30px color-mix(in oklch, ${ink} 30%, transparent)`,
                    }}
                  />
                </Link>
              </TiltCard>
            );
          })}
        </Reveal>
      </div>
    </section>
  );
}
