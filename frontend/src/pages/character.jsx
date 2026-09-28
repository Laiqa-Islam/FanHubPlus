import { Link, useLoaderData } from "react-router";

import { categoryBySlug } from "@/lib/constants";
import { Meta } from "@/components/meta";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { ShareButton } from "@/components/share-button";
import { BookmarkButton } from "@/components/bookmark-button";
import { CharacterDossier } from "@/components/characters/character-dossier";

export default function CharacterDetailPage() {
  const { character, siblings, clipped, signedIn } = useLoaderData();

  const category = categoryBySlug(character.category);
  // The character's own signal leads; the channel's is the fallback, so a
  // record seeded before `accent` existed still opens in a sensible colour.
  const accent = character.accent || `var(--ch-${category?.token ?? "anime"})`;

  return (
    <div className="mx-auto max-w-[80rem] px-5 py-8 sm:px-8">
      <Meta
        title={`${character.name} — ${character.franchise}`}
        description={character.bio?.slice(0, 160)}
      />
      <Breadcrumbs
        trail={[
          { href: "/characters", label: "Characters" },
          {
            href: `/characters?category=${character.category}`,
            label: category?.name ?? "",
          },
          { label: character.name },
        ]}
      />

      <CharacterDossier
        data={{
          name: character.name,
          kanji: character.kanji,
          grade: character.grade,
          sealMark: character.sealMark,
          accent,
          bio: character.bio ?? "",
          imageUrl: character.imageUrl,
          signature: character.signature,
          debutYear: character.debutYear,
          stats: character.stats ?? [],
          // The six rows of the reference layout, in its order.
          rows: [
            {
              id: "affiliation",
              label: "Affiliation",
              value: character.affiliation,
            },
            { id: "status", label: "Status", value: character.status },
            {
              id: "relationships",
              label: "Relationships",
              list: character.relationships,
            },
            { id: "skills", label: "Skills", list: character.skills },
            { id: "troops", label: "Troops", value: character.troops },
            { id: "weapons", label: "Weapons & EQS", list: character.weapons },
          ],
        }}
        actions={
          <>
            <BookmarkButton
              targetType="character"
              targetId={String(character._id)}
              initialBookmarked={clipped}
              signedIn={signedIn}
            />

            <ShareButton title={character.name} />
          </>
        }
      />

      {(character.traits ?? []).length > 0 && (
        <div className="mt-6 flex flex-wrap items-center gap-2">
          {(character.traits ?? []).map((trait) => (
            <span
              key={trait}
              className="rounded-full border border-[var(--edge)] px-3 py-1 font-mono text-[0.6rem] uppercase tracking-[0.11em] text-[var(--ink-soft)]"
            >
              {trait}
            </span>
          ))}
          <Link
            to={`/category/${character.category}`}
            className="ml-auto font-mono text-[0.66rem] uppercase tracking-[0.12em] text-[var(--ink-soft)] transition-colors hover:text-[var(--n2)]"
          >
            Browse {category?.name} →
          </Link>
        </div>
      )}

      <p className="mt-6 max-w-3xl text-[0.76rem] leading-relaxed text-[var(--ink-faint)]">
        Card art comes from the site&apos;s shared fan-art pool. Where a dossier
        does not name its own art, the image is assigned by channel position and
        is representative rather than a portrait of this specific character.
      </p>

      {siblings.length > 0 && (
        <section className="mt-14 border-t border-[var(--rule)] pt-10">
          <h2 className="mb-6 font-display text-[1.25rem] font-bold">
            Also from {character.franchise}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {siblings.map((sibling) => {
              const siblingAccent =
                sibling.accent || `var(--ch-${category?.token ?? "anime"})`;
              return (
                <Link
                  key={String(sibling._id)}
                  to={`/characters/${sibling.slug}`}
                  className="group rounded-2xl border border-[var(--edge)] bg-[var(--paper-3)] p-4 transition-colors hover:border-[var(--n2)]"
                >
                  <p
                    className="font-mono text-[0.54rem] uppercase tracking-[0.14em]"
                    style={{ color: siblingAccent }}
                  >
                    {sibling.grade || sibling.role || "Profile"}
                  </p>
                  <h3 className="mt-1.5 font-display text-[0.95rem] font-bold transition-colors group-hover:text-[var(--n2)]">
                    {sibling.name}
                  </h3>
                  <p className="mt-1.5 line-clamp-2 text-[0.82rem] leading-relaxed text-[var(--ink-soft)]">
                    {sibling.bio}
                  </p>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
