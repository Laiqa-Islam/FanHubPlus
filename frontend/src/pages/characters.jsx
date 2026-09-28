import { Link, useLoaderData } from "react-router";
import { Image } from "@/components/ui/image";

import { CATEGORIES, categoryBySlug } from "@/lib/constants";
import { Meta } from "@/components/meta";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Reveal } from "@/components/motion/reveal";
import { TiltCard } from "@/components/motion/tilt-card";
import { cn } from "@/lib/utils";

export default function CharactersPage() {
  const { activeCategory, activeFranchise, characters, franchises } =
    useLoaderData();

  const total = characters.length;

  return (
    <div className="mx-auto max-w-7xl px-5 py-12">
      <Meta
        title="Character profiles"
        description="Character files across all eight fandom channels, with lit stat meters, filterable by channel and franchise."
      />
      <Breadcrumbs trail={[{ label: "Characters" }]} />

      <header className="mb-9 max-w-2xl">
        <p className="mark mb-3 text-[var(--n2)]">
          Character select · {String(total).padStart(2, "0")} files open
        </p>
        <h1 className="font-display text-[clamp(1.9rem,5vw,3.4rem)] font-black">
          The crew
        </h1>
        <p className="mt-4 text-[1rem] leading-relaxed text-[var(--ink-soft)]">
          Who they are, what they&apos;re for, and why the writing works. Every
          file carries the site&apos;s own read on them — four meters, open to
          argument. Filter by channel or by franchise.
        </p>
      </header>

      {/* Channel filter */}
      <div className="mb-4 flex flex-wrap gap-2">
        <FilterChip
          href="/characters"
          active={!activeCategory}
          label="All channels"
        />

        {CATEGORIES.map((category) => (
          <FilterChip
            key={category.slug}
            href={`/characters?category=${category.slug}`}
            active={activeCategory === category.slug}
            label={category.name}
            ink={`var(--ch-${category.token})`}
          />
        ))}
      </div>

      {/* Franchise filter */}
      {franchises.length > 1 && (
        <div className="mb-10 flex flex-wrap gap-2">
          <FilterChip
            href={
              activeCategory
                ? `/characters?category=${activeCategory}`
                : "/characters"
            }
            active={!activeFranchise}
            label="All franchises"
            small
          />

          {franchises
            .filter(Boolean)
            .sort()
            .map((franchise) => {
              const query = new URLSearchParams();
              if (activeCategory) query.set("category", activeCategory);
              query.set("franchise", franchise);
              return (
                <FilterChip
                  key={franchise}
                  href={`/characters?${query.toString()}`}
                  active={activeFranchise === franchise}
                  label={franchise}
                  small
                />
              );
            })}
        </div>
      )}

      {total === 0 ? (
        <p className="rounded-2xl border border-dashed border-[var(--edge-strong)] px-6 py-16 text-center text-[var(--ink-soft)]">
          No character files match that filter yet.
        </p>
      ) : (
        <Reveal
          stagger={0.04}
          direction="scale"
          className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
        >
          {characters.map((character) => {
            const category = categoryBySlug(character.category);
            const ink =
              character.accent || `var(--ch-${category?.token ?? "anime"})`;
            return (
              <TiltCard
                key={String(character._id)}
                className="reveal"
                intensity={7}
              >
                <Link
                  to={`/characters/${character.slug}`}
                  className="group relative flex h-full flex-col overflow-hidden rounded-[1.25rem] border border-[var(--edge)] bg-[var(--paper-3)]"
                >
                  <div className="relative aspect-[4/5] overflow-hidden bg-[var(--paper-2)]">
                    {character.imageUrl && (
                      <Image
                        src={character.imageUrl}
                        alt=""
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        className="plate object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    )}

                    {/* The channel signal, kept light enough that the face
                       still reads — see components/duotone.tsx for why the
                       old multiply pass could not survive a dark ground. */}
                    <div
                      aria-hidden
                      className="absolute inset-0 mix-blend-soft-light opacity-50"
                      style={{ background: ink }}
                    />

                    <div
                      aria-hidden
                      className="absolute inset-0"
                      style={{
                        background:
                          "linear-gradient(0deg, color-mix(in oklch, var(--void) 94%, transparent), transparent 62%)",
                      }}
                    />

                    {/* The character's own script, set vertically down the
                       left edge — the mockup's signature on this screen. */}
                    {character.kanji && (
                      <span
                        aria-hidden
                        className="absolute left-3 top-3 font-display text-[0.9rem] font-bold tracking-[0.3em]"
                        style={{
                          writingMode: "vertical-rl",
                          color: ink,
                          textShadow: `0 0 14px ${ink}`,
                        }}
                      >
                        {character.kanji}
                      </span>
                    )}

                    <div className="absolute inset-x-0 bottom-0 p-4">
                      <p
                        className="font-mono text-[0.54rem] uppercase tracking-[0.16em]"
                        style={{ color: ink }}
                      >
                        {character.grade ||
                          character.role ||
                          character.franchise}
                      </p>
                      <h2 className="mt-1 font-display text-[1.05rem] font-bold leading-tight">
                        {character.name}
                      </h2>
                      <p className="mt-0.5 font-mono text-[0.56rem] uppercase tracking-[0.12em] text-[var(--ink-faint)]">
                        {character.franchise}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col p-4">
                    <p className="line-clamp-3 text-[0.84rem] leading-relaxed text-[var(--ink-soft)]">
                      {character.bio}
                    </p>
                    <div className="mt-auto flex flex-wrap gap-1.5 pt-4">
                      {(character.traits ?? []).slice(0, 2).map((trait) => (
                        <span
                          key={trait}
                          className="rounded-full border border-[var(--edge)] px-2.5 py-1 font-mono text-[0.56rem] uppercase tracking-[0.1em] text-[var(--ink-faint)]"
                        >
                          {trait}
                        </span>
                      ))}
                    </div>
                  </div>

                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-0 rounded-[1.25rem] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                    style={{
                      border: `1px solid ${ink}`,
                      boxShadow: `0 0 28px color-mix(in oklch, ${ink} 35%, transparent)`,
                    }}
                  />
                </Link>
              </TiltCard>
            );
          })}
        </Reveal>
      )}
    </div>
  );
}

/** A lit pill. Active takes the channel's own signal as a solid fill. */
function FilterChip({ href, active, label, ink = "var(--n1)", small = false }) {
  return (
    <Link
      to={href}
      className={cn(
        "inline-flex items-center gap-2 whitespace-nowrap rounded-full border transition-colors",
        small ? "px-3 py-1 text-[0.74rem]" : "px-3.5 py-1.5 text-[0.8rem]",
        active
          ? "text-[var(--void)]"
          : "border-[var(--edge)] text-[var(--ink-soft)] hover:border-[var(--edge-strong)] hover:text-[var(--ink)]",
      )}
      style={
        active
          ? {
              background: ink,
              borderColor: ink,
              boxShadow: `0 0 18px color-mix(in oklch, ${ink} 50%, transparent)`,
            }
          : undefined
      }
    >
      {!active && ink !== "var(--n1)" && (
        <span
          aria-hidden
          className="h-2 w-2 rounded-full"
          style={{ background: ink, boxShadow: `0 0 8px ${ink}` }}
        />
      )}
      {label}
    </Link>
  );
}
