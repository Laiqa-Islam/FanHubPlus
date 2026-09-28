import { Link } from "react-router";
import { Image } from "@/components/ui/image";

import { categoryBySlug } from "@/lib/constants";
import { formatDate, cn } from "@/lib/utils";
import { BookmarkButton } from "@/components/bookmark-button";
import { Duotone } from "@/components/duotone";
import { AddToCartButton } from "@/components/cart/add-to-cart-button";
import { formatPrice } from "@/lib/cart";

/** A showcase entry: art-led, lit in its channel's signal on hover. */
export function MerchCard({
  item,
  bookmarked,
  signedIn,
  index = 0,
  className,
}) {
  const category = categoryBySlug(item.category);
  const ink = `var(--ch-${category?.token ?? "anime"})`;

  return (
    <article
      className={cn(
        "reveal group relative flex h-full flex-col overflow-hidden rounded-[1.25rem] border border-[var(--edge)] bg-[var(--paper-3)] transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-[0_0_26px_color-mix(in_oklch,var(--n2)_16%,transparent)]",
        className,
      )}
    >
      <Link
        to={`/merch/${item.slug}`}
        className="relative flex flex-1 flex-col"
      >
        <div className="relative aspect-[4/3] overflow-hidden bg-[var(--paper-2)]">
          {item.imageUrl && (
            <Image
              src={item.imageUrl}
              alt=""
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="plate object-cover transition-transform duration-500 group-hover:scale-105"
            />
          )}
          <Duotone ink={ink} strength={0.38} />

          <span
            className="absolute left-3 top-3 rounded-full px-2.5 py-1 font-mono text-[0.56rem] font-medium uppercase tracking-[0.14em] text-[var(--void)]"
            style={{
              background: ink,
              boxShadow: `0 0 14px color-mix(in oklch, ${ink} 45%, transparent)`,
            }}
          >
            {item.tag}
          </span>

          {item.isUpcoming && (
            <span className="absolute bottom-3 left-3 rounded-full bg-[var(--n3)] px-2.5 py-1 font-mono text-[0.56rem] font-medium uppercase tracking-[0.14em] text-[var(--void)] shadow-[0_0_14px_color-mix(in_oklch,var(--n3)_45%,transparent)]">
              Upcoming
            </span>
          )}

          <span className="absolute bottom-3 right-3 rounded-full bg-[color-mix(in_oklch,var(--void)_72%,transparent)] px-2 py-0.5 font-mono text-[0.54rem] tabular-nums text-[var(--ink-soft)] backdrop-blur-sm">
            {String(index + 1).padStart(3, "0")}
          </span>
        </div>

        <div className="flex flex-1 flex-col p-4">
          <p className="mark mb-2 !text-[0.58rem]">
            <span style={{ color: ink }}>{category?.name}</span>
            {item.releaseDate && (
              <>
                {" "}
                · {item.isUpcoming ? "expected" : "out"}{" "}
                {formatDate(item.releaseDate)}
              </>
            )}
          </p>
          <h3 className="font-display text-[0.95rem] font-bold leading-[1.15] transition-colors group-hover:text-[var(--n2)]">
            {item.name}
          </h3>
          <p className="mt-2 line-clamp-3 text-[0.88rem] leading-snug text-[var(--ink-soft)]">
            {item.description}
          </p>
          <div className="mt-auto flex items-end justify-between gap-3 pt-4">
            <p className="font-display text-[1.05rem] font-black leading-none text-[var(--n3)]">
              {formatPrice(item.priceCents)}
            </p>
            <p className="font-mono text-[0.55rem] uppercase tracking-[0.12em] text-[var(--ink-faint)]">
              {item.viewCount.toLocaleString()} views
            </p>
          </div>
        </div>

        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[1.25rem] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            border: `1px solid ${ink}`,
            boxShadow: `0 0 26px color-mix(in oklch, ${ink} 32%, transparent)`,
          }}
        />
      </Link>

      <div className="border-t border-[var(--rule)] p-3">
        <AddToCartButton
          product={{
            id: item.id,
            slug: item.slug,
            name: item.name,
            category: item.category,
            imageUrl: item.imageUrl,
            priceCents: item.priceCents,
          }}
          label={item.isUpcoming ? "Pre-order" : "Add to cart"}
          className="w-full"
        />
      </div>

      {/* Sits above the link so clipping never navigates. */}
      <BookmarkButton
        targetType="merchandise"
        targetId={item.id}
        initialBookmarked={bookmarked}
        signedIn={signedIn}
        variant="icon"
        className="absolute right-2 top-2 z-10"
      />
    </article>
  );
}
