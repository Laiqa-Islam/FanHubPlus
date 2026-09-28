import { Link } from "react-router";

import { CountUp } from "@/components/motion/count-up";
import { Reveal } from "@/components/motion/reveal";

/**
 * What is actually in here, counted.
 *
 * The numbers are read from the collections rather than typed into the
 * markup, so this band cannot drift away from the library the way a
 * hand-written "500+ articles!" always eventually does. If the seed shrinks,
 * the front page says so.
 */
export function StatsBand({ counts }) {
  const rows = [
    {
      label: "Pieces published",
      value: counts.pieces,
      href: "/explore",
      ink: "var(--n2)",
    },
    {
      label: "Character dossiers",
      value: counts.characters,
      href: "/characters",
      ink: "var(--n1)",
    },
    {
      label: "Items in the shop",
      value: counts.merch,
      href: "/merch",
      ink: "var(--n3)",
    },
    {
      label: "Events listed",
      value: counts.events,
      href: "/events",
      ink: "var(--ch-kpop)",
    },
    { label: "Channels", value: 8, href: "/explore", ink: "var(--ch-gaming)" },
  ];

  return (
    <section className="border-y border-[var(--rule)] bg-[var(--void)]">
      <div className="mx-auto max-w-[88rem] px-5 py-12 sm:px-8">
        <Reveal
          stagger={0.07}
          className="grid grid-cols-2 gap-x-6 gap-y-9 sm:grid-cols-3 lg:grid-cols-5"
        >
          {rows.map((row) => (
            <Link
              key={row.label}
              to={row.href}
              className="reveal group block text-center"
            >
              <span
                className="block font-display text-[clamp(2.1rem,5vw,3.4rem)] font-black leading-none transition-[text-shadow] duration-300"
                style={{
                  color: row.ink,
                  textShadow: `0 0 26px color-mix(in oklch, ${row.ink} 35%, transparent)`,
                }}
              >
                <CountUp to={row.value} />
              </span>
              <span className="mark mt-3 block text-[var(--ink-faint)] transition-colors duration-300 group-hover:text-[var(--ink-soft)]">
                {row.label}
              </span>
              <span
                aria-hidden
                className="mx-auto mt-3 block h-px w-8 origin-center scale-x-0 transition-transform duration-300 group-hover:scale-x-100"
                style={{ background: row.ink }}
              />
            </Link>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
