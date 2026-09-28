import { Link, useLoaderData } from "react-router";
import { Image } from "@/components/ui/image";
import { Star, Eye, Calendar } from "lucide-react";

import { categoryBySlug } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import { Meta } from "@/components/meta";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { ContentCard } from "@/components/content-card";
import { Reveal } from "@/components/motion/reveal";
import { ShareButton } from "@/components/share-button";
import { VideoPlayer } from "@/components/media/video-player";
import { AudioPlayer } from "@/components/media/audio-player";
import { EmbedFrame } from "@/components/media/embed-frame";
import { PlateGallery } from "@/components/media/plate-gallery";
import { ArticleTimeline } from "@/components/content/article-timeline";
import { RatingWidget } from "@/components/media/rating-widget";
import { mediaSrc } from "@/lib/media";
import { BookmarkButton } from "@/components/bookmark-button";

export default function ContentDetailPage() {
  const { item, related, myRating, clipped, signedIn, canRate } =
    useLoaderData();

  const category = categoryBySlug(item.category);
  const ink = `var(--ch-${category?.token ?? "anime"})`;

  return (
    <article>
      <Meta
        title={item.title}
        description={item.summary}
        image={item.coverImage || undefined}
      />
      {/* Hero */}
      <header className="relative border-b border-[var(--rule)]">
        <div className="relative aspect-[21/9] w-full overflow-hidden bg-[var(--paper-2)] sm:aspect-[21/8]">
          {item.coverImage && (
            <Image
              src={item.coverImage}
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
          )}
          {/* The title overlaps the bottom of this image, so the photo has to
               fade into the page background for the heading to stay readable.
               Explicit stops keep the fade confined to the lower third —
               Tailwind's default three-stop gradient washed out the whole
               photograph in light mode, where the ground is near-white. */}
          <div
            aria-hidden
            className="absolute inset-0 bg-[linear-gradient(to_top,var(--paper)_0%,var(--paper)_16%,transparent_58%)]"
          />

          <span
            aria-hidden
            className="absolute inset-x-0 top-0 h-1"
            style={{ background: `var(--ch-${category?.token ?? "anime"})` }}
          />
        </div>

        <div className="mx-auto -mt-28 max-w-3xl px-5 pb-12 sm:-mt-36">
          <div className="relative">
            <Breadcrumbs
              trail={[
                { href: "/explore", label: "Explore" },
                {
                  href: `/category/${item.category}`,
                  label: category?.name ?? item.category,
                },
                { label: item.title },
              ]}
            />

            <p className="mark mb-4">
              <span
                style={{ color: `var(--ch-${category?.token ?? "anime"})` }}
              >
                {category?.name}
              </span>{" "}
              · {item.type}
            </p>

            <h1 className="font-display text-[clamp(1.7rem,4.4vw,2.6rem)]">
              {item.title}
            </h1>

            <p className="mt-5 text-[1.08rem] leading-relaxed text-[var(--ink-soft)]">
              {item.summary}
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-5 font-mono text-[0.74rem] text-[var(--ink-faint)]">
              {item.releaseDate && (
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" aria-hidden />
                  {formatDate(item.releaseDate)}
                </span>
              )}
              <span className="inline-flex items-center gap-1.5 tabular-nums">
                <Eye className="h-3.5 w-3.5" aria-hidden />
                {item.viewCount.toLocaleString()} views
              </span>
              {item.ratingCount > 0 && (
                <span className="inline-flex items-center gap-1.5 tabular-nums">
                  <Star
                    className="h-3.5 w-3.5 fill-[var(--flag)] text-[var(--flag)]"
                    aria-hidden
                  />
                  {item.averageRating.toFixed(1)} · {item.ratingCount} ratings
                </span>
              )}
              <span className="ml-auto flex items-center gap-4">
                <BookmarkButton
                  targetType="content"
                  targetId={item.id}
                  initialBookmarked={clipped}
                  signedIn={signedIn}
                />

                <ShareButton title={item.title} />
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Body */}
      <div className="mx-auto max-w-3xl px-5 py-14">
        {/* Multimedia Center player (SRS FR-5) */}

        {/* An embed takes precedence over a file: a piece submitted as a
             platform link has no media of ours to play. */}
        {item.embedProvider && item.embedId ? (
          <div className="mb-10">
            <EmbedFrame
              provider={item.embedProvider}
              id={item.embedId}
              title={item.title}
              ink={ink}
            />
          </div>
        ) : (
          <>
            {item.type === "video" && item.mediaUrl && (
              <figure className="mb-10">
                <VideoPlayer
                  src={mediaSrc(item.mediaUrl)}
                  poster={item.mediaPoster || item.coverImage}
                  title={item.title}
                  ink={ink}
                />

                <MediaCaption credit={item.mediaCredit} tags={item.mediaTags} />
              </figure>
            )}

            {item.type === "audio" && item.mediaUrl && (
              <figure className="mb-10">
                <AudioPlayer
                  src={mediaSrc(item.mediaUrl)}
                  title={item.title}
                  ink={ink}
                />

                <MediaCaption credit={item.mediaCredit} tags={item.mediaTags} />
              </figure>
            )}

            {/* Photo set (v2 Phase 12) */}
            {item.gallery.length > 0 && (
              <PlateGallery plates={item.gallery} title={item.title} />
            )}
          </>
        )}

        <div
          className="prose-fanhub"
          // Body HTML is authored by administrators through the seed or the
          // admin panel, never by unauthenticated users. Fan submissions are
          // sanitised and reviewed before they can reach this field.
          dangerouslySetInnerHTML={{ __html: item.body }}
        />

        {/* The chronology, after the argument and before the apparatus: it
             is part of the piece, not an appendix to it. */}
        <ArticleTimeline entries={item.timeline} ink={ink} />

        {/* Transcript (v2 Phase 16). Collapsed so it doesn't dominate the page,
             but present in the DOM so it is searchable and readable without
             playing anything. Rendered as text — React escapes it, so unlike the
             body above this needs no sanitising pass. */}
        {item.transcript && (
          <details className="mt-10 border border-[var(--rule-strong)] bg-[var(--paper-2)]">
            <summary className="cursor-pointer px-5 py-3.5 font-mono text-[0.7rem] uppercase tracking-[0.16em] text-[var(--ink-soft)] transition-colors hover:text-[var(--spot)]">
              Read the transcript
            </summary>
            <div className="max-h-[32rem] overflow-y-auto border-t border-[var(--rule)] px-5 py-4">
              <p className="whitespace-pre-wrap text-[0.94rem] leading-relaxed text-[var(--ink-soft)]">
                {item.transcript}
              </p>
            </div>
          </details>
        )}

        {/* Audience feedback on media (SRS FR-5) */}
        {item.type !== "article" && (
          <div className="mt-12">
            <RatingWidget
              contentId={item.id}
              initialAverage={item.averageRating}
              initialCount={item.ratingCount}
              initialMine={myRating}
              canRate={canRate}
              ink={ink}
            />
          </div>
        )}

        {item.genre.length > 0 && (
          <div className="mt-12 flex flex-wrap items-center gap-2 border-t border-[var(--rule)] pt-8">
            <span className="mark mr-1">Genres</span>
            {item.genre.map((genre) => (
              <Link
                key={genre}
                to={`/explore?genre=${encodeURIComponent(genre)}`}
                className="border border-[var(--rule-strong)] px-3 py-1.5 text-[0.8rem] text-[var(--ink-soft)] transition-colors hover:border-[var(--spot)] hover:text-[var(--spot)]"
              >
                {genre}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Related */}
      {related.length > 0 && (
        <section className="border-t border-[var(--rule)] bg-[var(--paper)]">
          <div className="mx-auto max-w-7xl px-5 py-16">
            <h2 className="mb-8 font-display text-[1.5rem]">
              More from {category?.name}
            </h2>
            <Reveal
              stagger={0.05}
              className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
            >
              {related.map((relatedItem) => (
                <ContentCard key={relatedItem.id} item={relatedItem} />
              ))}
            </Reveal>
          </div>
        </section>
      )}
    </article>
  );
}

/** Licence line and admin-applied tags shown beneath a player. */
function MediaCaption({ credit, tags }) {
  if (!credit && tags.length === 0) return null;

  return (
    <figcaption className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-[var(--rule)] pt-3">
      {tags.map((tag) => (
        <span
          key={tag}
          className="border border-[var(--edge)] px-2 py-0.5 font-mono text-[0.58rem] uppercase tracking-[0.14em]"
        >
          {tag}
        </span>
      ))}
      {credit && (
        <span className="ml-auto font-mono text-[0.6rem] text-[var(--ink-faint)]">
          {credit}
        </span>
      )}
    </figcaption>
  );
}
