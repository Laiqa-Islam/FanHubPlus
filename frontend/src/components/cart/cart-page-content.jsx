import { Image } from "@/components/ui/image";
import { Link } from "react-router";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";

import { useCart } from "@/components/providers/cart-provider";
import { Button } from "@/components/ui/button";
import {
  FREE_SHIPPING_THRESHOLD_CENTS,
  cartSubtotal,
  formatPrice,
  shippingForSubtotal,
} from "@/lib/cart";

export function CartPageContent() {
  const { lines, hydrated, removeItem, setQuantity } = useCart();
  const subtotal = cartSubtotal(lines);
  const shipping = shippingForSubtotal(subtotal);
  const total = subtotal + shipping;
  const amountToFreeShipping = Math.max(
    0,
    FREE_SHIPPING_THRESHOLD_CENTS - subtotal,
  );
  const progress = Math.min(
    100,
    (subtotal / FREE_SHIPPING_THRESHOLD_CENTS) * 100,
  );

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-[88rem] px-5 py-20 sm:px-8">
        <p className="mark animate-pulse text-[var(--n2)]" role="status">
          Loading your cart…
        </p>
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="mx-auto grid min-h-[65vh] max-w-2xl place-items-center px-5 py-16 text-center sm:px-8">
        <div>
          <span className="mx-auto grid h-20 w-20 place-items-center rounded-full border border-[var(--edge-strong)] bg-[var(--paper-3)] text-[var(--n2)] shadow-[0_0_28px_color-mix(in_oklch,var(--n2)_20%,transparent)]">
            <ShoppingBag className="h-8 w-8" aria-hidden />
          </span>
          <p className="mark mt-6 text-[var(--n3)]">Cart empty</p>
          <h1 className="mt-3 font-display text-[clamp(2rem,7vw,4rem)] font-black leading-[0.95]">
            Your next drop
            <br />
            starts here.
          </h1>
          <p className="mx-auto mt-5 max-w-md text-[var(--ink-soft)]">
            Browse the merch collection and add a few favourites before heading
            to checkout.
          </p>
          <Button asChild size="lg" className="mt-7">
            <Link to="/merch">Shop merch</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[88rem] px-5 py-10 sm:px-8 sm:py-14">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-4 border-b border-[var(--rule-strong)] pb-6">
        <div>
          <p className="mark mb-3 text-[var(--n3)]">
            Bag check · {lines.length} lines
          </p>
          <h1 className="font-display text-[clamp(2rem,6vw,4rem)] font-black leading-[0.92]">
            Your cart<span className="text-[var(--n1)]">.</span>
          </h1>
        </div>
        <Link
          to="/merch"
          className="font-mono text-[0.66rem] uppercase tracking-[0.14em] text-[var(--n2)] underline decoration-transparent underline-offset-4 transition-colors hover:decoration-current"
        >
          Keep shopping →
        </Link>
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_23rem] lg:items-start">
        <div className="space-y-4">
          {lines.map((line) => (
            <article
              key={line.id}
              className="grid grid-cols-[5.5rem_minmax(0,1fr)] gap-4 rounded-[1.25rem] border border-[var(--edge)] bg-[var(--paper-3)] p-3 sm:grid-cols-[7rem_minmax(0,1fr)_auto] sm:items-center sm:p-4"
            >
              <Link
                to={`/merch/${line.slug}`}
                className="relative aspect-square overflow-hidden rounded-xl bg-[var(--paper-2)]"
              >
                <Image
                  src={line.imageUrl}
                  alt=""
                  fill
                  sizes="112px"
                  className="object-cover"
                />
              </Link>

              <div className="min-w-0">
                <p className="mark !text-[0.55rem] text-[var(--n2)]">
                  {line.category}
                </p>
                <Link
                  to={`/merch/${line.slug}`}
                  className="mt-1 block font-display text-[0.9rem] font-bold leading-tight transition-colors hover:text-[var(--n2)] sm:text-[1rem]"
                >
                  {line.name}
                </Link>
                <p className="mt-2 font-display text-[0.95rem] font-black text-[var(--n3)]">
                  {formatPrice(line.priceCents)}
                </p>
              </div>

              <div className="col-span-2 flex items-center justify-between gap-4 border-t border-[var(--rule)] pt-3 sm:col-span-1 sm:border-0 sm:pt-0">
                <div className="flex items-center rounded-full border border-[var(--edge-strong)] bg-[var(--paper-2)]">
                  <button
                    type="button"
                    onClick={() => setQuantity(line.id, line.quantity - 1)}
                    disabled={line.quantity <= 1}
                    aria-label={`Decrease ${line.name} quantity`}
                    className="grid h-11 w-11 place-items-center rounded-full text-[var(--ink-soft)] transition-colors hover:text-[var(--n2)] disabled:opacity-35"
                  >
                    <Minus className="h-3.5 w-3.5" aria-hidden />
                  </button>
                  <span
                    className="w-7 text-center font-mono text-[0.72rem] tabular-nums"
                    aria-live="polite"
                  >
                    {line.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity(line.id, line.quantity + 1)}
                    disabled={line.quantity >= 10}
                    aria-label={`Increase ${line.name} quantity`}
                    className="grid h-11 w-11 place-items-center rounded-full text-[var(--ink-soft)] transition-colors hover:text-[var(--n2)] disabled:opacity-35"
                  >
                    <Plus className="h-3.5 w-3.5" aria-hidden />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => removeItem(line.id)}
                  aria-label={`Remove ${line.name} from cart`}
                  className="grid h-11 w-11 place-items-center rounded-full text-[var(--ink-faint)] transition-colors hover:bg-[color-mix(in_oklch,var(--n1)_12%,transparent)] hover:text-[var(--spot-deep)]"
                >
                  <Trash2 className="h-4 w-4" aria-hidden />
                </button>
              </div>
            </article>
          ))}
        </div>

        <aside className="rounded-[1.5rem] border border-[var(--edge)] bg-[var(--paper-3)] p-5 shadow-[var(--lift-md)] lg:sticky lg:top-24">
          <p className="mark text-[var(--n3)]">Order summary</p>
          <div className="mt-5 space-y-3 border-b border-[var(--rule)] pb-5 text-[0.9rem]">
            <div className="flex justify-between gap-4 text-[var(--ink-soft)]">
              <span>Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between gap-4 text-[var(--ink-soft)]">
              <span>Shipping</span>
              <span>{shipping === 0 ? "Free" : formatPrice(shipping)}</span>
            </div>
          </div>
          <div className="flex items-end justify-between gap-4 py-5">
            <span className="font-display text-[0.85rem] font-bold">Total</span>
            <span className="font-display text-[1.45rem] font-black text-[var(--n3)]">
              {formatPrice(total)}
            </span>
          </div>

          <div className="mb-5 rounded-xl bg-[var(--paper-2)] p-3">
            <p className="text-[0.76rem] text-[var(--ink-soft)]">
              {amountToFreeShipping > 0
                ? `${formatPrice(amountToFreeShipping)} away from free shipping.`
                : "Free shipping unlocked."}
            </p>
            <div
              className="mt-2 h-1.5 overflow-hidden rounded-full bg-[var(--edge)]"
              aria-hidden
            >
              <div
                className="h-full rounded-full bg-[var(--n3)] transition-[width] duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <Button asChild variant="flag" size="lg" className="w-full">
            <Link to="/checkout">Go to checkout</Link>
          </Button>
          <p className="mt-3 text-center text-[0.7rem] leading-relaxed text-[var(--ink-faint)]">
            Demo checkout. No real payment will be processed.
          </p>
        </aside>
      </div>
    </div>
  );
}
