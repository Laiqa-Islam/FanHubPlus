import { Link, useLoaderData } from "react-router";
import { Calendar, Eye } from "lucide-react";

import { categoryBySlug } from "@/lib/constants";
import { Meta } from "@/components/meta";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Gallery } from "@/components/merch/gallery";
import { MerchCard } from "@/components/merch/merch-card";
import { BookmarkButton } from "@/components/bookmark-button";
import { ShareButton } from "@/components/share-button";
import { Reveal } from "@/components/motion/reveal";
import { Sticker } from "@/components/press";
import { AddToCartButton } from "@/components/cart/add-to-cart-button";
import { formatPrice } from "@/lib/cart";
import { formatDate } from "@/lib/utils";

export default function MerchDetailPage() {
  // The view counter is bumped by the loader (SRS FR-7, optional), never on
  // the render path.
  const { item, related, clipped, relatedClippedIds, signedIn } =
    useLoaderData();

  const category = categoryBySlug(item.category);
  const ink = `var(--ch-${category?.token ?? "anime"})`;

  const relatedClipped = new Set(relatedClippedIds);

  // The main plate first, then any additional gallery shots.
  const plates = [item.imageUrl, ...item.gallery].filter(Boolean);

  return (
    <div className="mx-auto max-w-[88rem] px-5 py-10 sm:px-8">
      <Meta
        title={item.name}
        description={item.description.slice(0, 160)}
        image={item.imageUrl || undefined}
      />
      <Breadcrumbs
        trail={[
          { href: "/merch", label: "Merch" },
          {
            href: `/merch?category=${item.category}`,
            label: category?.name ?? item.category,
          },
          { label: item.name },
        ]}
      />

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:items-start">
        <Gallery images={plates} alt={item.name} ink={ink} />

        <div className="border-t border-[var(--rule-strong)] pt-5">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <Sticker ink={ink}>{item.tag}</Sticker>
            {item.isUpcoming && <Sticker ink="var(--ink)">Upcoming</Sticker>}
          </div>

          <p className="mark mb-3">
            <span style={{ color: ink }}>{category?.name}</span> · Catalogue
            plate
          </p>

          <h1 className="font-display text-[clamp(1.44rem,3.90vw,2.45rem)] leading-[0.92]">
            {item.name}
          </h1>

          <p className="mt-5 text-[1.05rem] leading-relaxed text-[var(--ink-soft)]">
            {item.description}
          </p>

          <div className="mt-7 rounded-[1.25rem] border border-[color-mix(in_oklch,var(--n3)_35%,var(--edge))] bg-[var(--paper-3)] p-5 shadow-[0_0_28px_color-mix(in_oklch,var(--n3)_10%,transparent)]">
            <div className="mb-4 flex items-end justify-between gap-4">
              <div>
                <p className="mark !text-[0.58rem]">Price</p>
                <p className="mt-1 font-display text-[1.65rem] font-black leading-none text-[var(--n3)]">
                  {formatPrice(item.priceCents)}
                </p>
              </div>
              <p className="max-w-40 text-right text-[0.76rem] leading-snug text-[var(--ink-faint)]">
                Shipping calculated in your cart.
              </p>
            </div>
            <AddToCartButton
              product={{
                id: item.id,
                slug: item.slug,
                name: item.name,
                category: item.category,
                imageUrl: item.imageUrl,
                priceCents: item.priceCents,
              }}
              label={item.isUpcoming ? "Pre-order now" : "Add to cart"}
              className="w-full"
            />
          </div>

          <dl className="mt-7 grid grid-cols-2 gap-2.5">
            <div className="rounded-2xl border border-[var(--edge)] bg-[var(--paper-3)] p-4">
              <dt className="mark !text-[0.58rem]">
                {item.isUpcoming ? "Expected" : "Released"}
              </dt>
              <dd className="mt-1.5 flex items-center gap-2 font-display text-[0.95rem] leading-none">
                <Calendar
                  className="h-4 w-4 text-[var(--ink-faint)]"
                  aria-hidden
                />

                {item.releaseDate ? formatDate(item.releaseDate) : "TBC"}
              </dd>
            </div>
            <div className="rounded-2xl border border-[var(--edge)] bg-[var(--paper-3)] p-4">
              <dt className="mark !text-[0.58rem]">Views</dt>
              <dd className="mt-1.5 flex items-center gap-2 font-display text-[0.95rem] leading-none tabular-nums">
                <Eye className="h-4 w-4 text-[var(--ink-faint)]" aria-hidden />
                {item.viewCount.toLocaleString()}
              </dd>
            </div>
          </dl>

          <div className="mt-7 flex flex-wrap items-center gap-4">
            <BookmarkButton
              targetType="merchandise"
              targetId={item.id}
              initialBookmarked={clipped}
              signedIn={signedIn}
            />

            <ShareButton title={item.name} />
          </div>

          <Link
            to={`/category/${item.category}`}
            className="mt-7 inline-block font-mono text-[0.68rem] uppercase tracking-[0.16em] text-[var(--spot-deep)] underline underline-offset-4"
          >
            More from {category?.name} →
          </Link>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-20 border-t border-[var(--rule-strong)] pt-6">
          <h2 className="mb-6 font-display text-[1.37rem] leading-none">
            Also in {category?.name}
          </h2>
          <Reveal
            stagger={0.05}
            className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
          >
            {related.map((entry, index) => (
              <MerchCard
                key={entry.id}
                item={entry}
                index={index}
                bookmarked={relatedClipped.has(entry.id)}
                signedIn={signedIn}
              />
            ))}
          </Reveal>
        </section>
      )}
    </div>
  );
}
