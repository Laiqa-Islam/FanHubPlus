import { Link } from "react-router";
import { Image } from "@/components/ui/image";
import { ArrowUpRight } from "lucide-react";

import { Reveal } from "@/components/motion/reveal";
import { PressHeading } from "@/components/press";

/** One portrait in the rail. */
function Portrait({ character }) {
  const ink = character.accent || `var(--ch-${character.category})`;

  return (
    <Link
      to={`/characters/${character.slug}`}
      className="group relative block w-[13rem] shrink-0 px-2 sm:w-[15rem]"
    >
      <div className="relative aspect-[3/4] overflow-hidden rounded-[1.1rem] border border-[var(--edge)] bg-[var(--paper-3)]">
        {character.imageUrl && (
          <Image
            src={character.imageUrl}
            alt={character.name}
            fill
            sizes="240px"
            className="object-cover transition-[transform,filter] duration-700 group-hover:scale-105"
          />
        )}

        {/* The portrait sits under a flood of its own accent and clears to
             full colour on hover — the same move the dossier page makes, so a
             character reads the same way wherever you meet one. */}
        <span
          aria-hidden
          className="absolute inset-0 opacity-55 mix-blend-color transition-opacity duration-500 group-hover:opacity-0"
          style={{ background: ink }}
        />

        <span
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, var(--void) 2%, transparent 55%)",
          }}
        />

        {character.kanji && (
          <span
            className="absolute right-2.5 top-2.5 font-display text-[0.7rem] leading-none opacity-70"
            style={{ color: ink, writingMode: "vertical-rl" }}
            aria-hidden
          >
            {character.kanji}
          </span>
        )}

        <div className="absolute inset-x-0 bottom-0 p-3">
          <p className="font-display text-[0.95rem] font-black leading-none">
            {character.name}
          </p>
          <p className="mt-1.5 truncate font-mono text-[0.56rem] uppercase tracking-[0.14em] text-[var(--ink-faint)]">
            {character.franchise}
          </p>
        </div>

        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[1.1rem] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            border: `1px solid ${ink}`,
            boxShadow: `0 0 28px color-mix(in oklch, ${ink} 32%, transparent)`,
          }}
        />
      </div>
    </Link>
  );
}

/**
 * Two rows of dossiers passing in opposite directions.
 *
 * A marquee rather than a grid because thirty-six characters will not fit in
 * a grid without either paginating them or shrinking them to thumbnails, and
 * both options lose the portraits — which are the reason anyone clicks
 * through. Motion also does the job of saying "there are more of these than
 * you can see", which a truncated grid has to spell out in a link.
 *
 * Hovering anywhere on a row pauses it, so nothing you reach for runs away.
 */
export function CharacterRail({ characters }) {
  if (characters.length < 4) return null;

  const half = Math.ceil(characters.length / 2);
  const rows = [
    {
      items: characters.slice(0, half),
      direction: "left",
      duration: "64s",
    },
    {
      items: characters.slice(half),
      direction: "right",
      duration: "78s",
    },
  ];

  return (
    <section className="overflow-hidden border-y border-[var(--rule)] py-16">
      <div className="mx-auto mb-10 max-w-[88rem] px-5 sm:px-8">
        <PressHeading
          mark="Who's who"
          title="The dossiers"
          ghostInk="var(--n1)"
          action={
            <Link
              to="/characters"
              className="group inline-flex items-center gap-2 font-mono text-[0.66rem] uppercase tracking-[0.16em] text-[var(--ink-soft)] transition-colors hover:text-[var(--n2)]"
            >
              All characters
              <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          }
        />
      </div>

      <Reveal className="space-y-4">
        {rows.map((row) => (
          <div
            key={row.direction}
            className="rail reveal relative overflow-hidden"
            // Fade both ends into the page instead of cutting the portraits
            // off against a hard edge.
            style={{
              maskImage:
                "linear-gradient(90deg, transparent, #000 6%, #000 94%, transparent)",
              WebkitMaskImage:
                "linear-gradient(90deg, transparent, #000 6%, #000 94%, transparent)",
            }}
          >
            <div
              className="rail-track"
              data-direction={row.direction}
              style={{ ["--rail-duration"]: row.duration }}
            >
              {/* Doubled so the -50% loop lands on an identical frame. The
                 copy is hidden from assistive tech to avoid reading every
                 character's name twice. */}
              {[...row.items, ...row.items].map((character, index) => (
                <div
                  key={`${character.slug}-${index}`}
                  aria-hidden={index >= row.items.length}
                >
                  <Portrait character={character} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </Reveal>
    </section>
  );
}
