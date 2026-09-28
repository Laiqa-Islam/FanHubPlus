import { Link } from "react-router";
import { useState } from "react";
import {
  CheckCircle2,
  CreditCard,
  LockKeyhole,
  PackageCheck,
  Truck,
} from "lucide-react";

import { useCart } from "@/components/providers/cart-provider";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/field";
import { cartSubtotal, formatPrice, shippingForSubtotal } from "@/lib/cart";

export function CheckoutPageContent() {
  const { lines, hydrated, clearCart } = useCart();
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [submitting, setSubmitting] = useState(false);
  const [receipt, setReceipt] = useState(null);
  const subtotal = cartSubtotal(lines);
  const shipping = shippingForSubtotal(subtotal);
  const total = subtotal + shipping;

  function placeOrder(event) {
    event.preventDefault();
    if (lines.length === 0) return;
    setSubmitting(true);
    const id = `FH-${Date.now().toString(36).toUpperCase().slice(-7)}`;
    window.setTimeout(() => {
      setReceipt({ id, total });
      clearCart();
      setSubmitting(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 450);
  }

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-[88rem] px-5 py-20 sm:px-8">
        <p className="mark animate-pulse text-[var(--n2)]">Loading checkout…</p>
      </div>
    );
  }

  if (receipt) {
    return (
      <div className="mx-auto grid min-h-[68vh] max-w-2xl place-items-center px-5 py-16 text-center sm:px-8">
        <div className="w-full rounded-[2rem] border border-[color-mix(in_oklch,var(--n3)_40%,var(--edge))] bg-[var(--paper-3)] p-8 shadow-[0_0_45px_color-mix(in_oklch,var(--n3)_13%,transparent)] sm:p-12">
          <CheckCircle2
            className="mx-auto h-14 w-14 text-[var(--n3)]"
            aria-hidden
          />

          <p className="mark mt-5 text-[var(--n3)]">Demo order confirmed</p>
          <h1 className="mt-3 font-display text-[clamp(2rem,7vw,3.7rem)] font-black leading-[0.95]">
            Drop secured.
          </h1>
          <p className="mx-auto mt-5 max-w-md text-[var(--ink-soft)]">
            Your checkout flow completed successfully. This is a demo, so no
            payment was charged and no shipment will be created.
          </p>
          <dl className="mx-auto mt-7 grid max-w-sm grid-cols-2 gap-3 text-left">
            <div className="rounded-xl bg-[var(--paper-2)] p-4">
              <dt className="mark !text-[0.55rem]">Order</dt>
              <dd className="mt-1 font-mono text-sm">{receipt.id}</dd>
            </div>
            <div className="rounded-xl bg-[var(--paper-2)] p-4">
              <dt className="mark !text-[0.55rem]">Total</dt>
              <dd className="mt-1 font-display font-bold text-[var(--n3)]">
                {formatPrice(receipt.total)}
              </dd>
            </div>
          </dl>
          <Button asChild size="lg" className="mt-8">
            <Link to="/merch">Back to merch</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="mx-auto grid min-h-[62vh] max-w-xl place-items-center px-5 py-16 text-center sm:px-8">
        <div>
          <PackageCheck
            className="mx-auto h-12 w-12 text-[var(--n2)]"
            aria-hidden
          />

          <h1 className="mt-5 font-display text-3xl font-black">
            Nothing to check out yet.
          </h1>
          <p className="mt-4 text-[var(--ink-soft)]">
            Add merch to your cart first, then come back here.
          </p>
          <Button asChild className="mt-6">
            <Link to="/merch">Browse merch</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[88rem] px-5 py-10 sm:px-8 sm:py-14">
      <div className="mb-10 border-b border-[var(--rule-strong)] pb-6">
        <p className="mark mb-3 text-[var(--n3)]">Secure lane · Demo mode</p>
        <h1 className="font-display text-[clamp(2rem,6vw,4rem)] font-black leading-[0.92]">
          Checkout<span className="text-[var(--n1)]">.</span>
        </h1>
      </div>

      <form
        onSubmit={placeOrder}
        className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_23rem] lg:items-start"
      >
        <div className="space-y-6">
          <section className="rounded-[1.5rem] border border-[var(--edge)] bg-[var(--paper-3)] p-5 sm:p-7">
            <div className="mb-6 flex items-center gap-3">
              <Truck className="h-5 w-5 text-[var(--n2)]" aria-hidden />
              <h2 className="font-display text-[1.05rem] font-bold">
                Contact & delivery
              </h2>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <Input
                label="First name"
                name="firstName"
                autoComplete="given-name"
                required
              />

              <Input
                label="Last name"
                name="lastName"
                autoComplete="family-name"
                required
              />

              <Input
                label="Email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="sm:col-span-2"
              />

              <Input
                label="Street address"
                name="address"
                autoComplete="street-address"
                required
                className="sm:col-span-2"
              />

              <Input
                label="City"
                name="city"
                autoComplete="address-level2"
                required
              />

              <Input
                label="State / province"
                name="region"
                autoComplete="address-level1"
                required
              />

              <Input
                label="Postal code"
                name="postalCode"
                autoComplete="postal-code"
                required
              />

              <Select
                label="Country"
                name="country"
                autoComplete="country-name"
                required
                defaultValue="US"
              >
                <option value="US">United States</option>
                <option value="CA">Canada</option>
                <option value="GB">United Kingdom</option>
                <option value="PK">Pakistan</option>
              </Select>
            </div>
          </section>

          <section className="rounded-[1.5rem] border border-[var(--edge)] bg-[var(--paper-3)] p-5 sm:p-7">
            <div className="mb-6 flex items-center gap-3">
              <CreditCard className="h-5 w-5 text-[var(--n1)]" aria-hidden />
              <h2 className="font-display text-[1.05rem] font-bold">
                Payment method
              </h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="flex min-h-14 cursor-pointer items-center gap-3 rounded-xl border border-[var(--edge-strong)] bg-[var(--paper-2)] px-4 py-3 has-[:checked]:border-[var(--n1)] has-[:checked]:shadow-[0_0_18px_color-mix(in_oklch,var(--n1)_18%,transparent)]">
                <input
                  type="radio"
                  name="payment"
                  value="card"
                  checked={paymentMethod === "card"}
                  onChange={() => setPaymentMethod("card")}
                  className="accent-[var(--n1)]"
                />

                <span className="font-mono text-[0.66rem] uppercase tracking-[0.12em]">
                  Demo card
                </span>
              </label>
              <label className="flex min-h-14 cursor-pointer items-center gap-3 rounded-xl border border-[var(--edge-strong)] bg-[var(--paper-2)] px-4 py-3 has-[:checked]:border-[var(--n2)] has-[:checked]:shadow-[0_0_18px_color-mix(in_oklch,var(--n2)_18%,transparent)]">
                <input
                  type="radio"
                  name="payment"
                  value="cod"
                  checked={paymentMethod === "cod"}
                  onChange={() => setPaymentMethod("cod")}
                  className="accent-[var(--n2)]"
                />

                <span className="font-mono text-[0.66rem] uppercase tracking-[0.12em]">
                  Cash on delivery
                </span>
              </label>
            </div>
            {paymentMethod === "card" && (
              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <Input
                  label="Name on card"
                  name="cardName"
                  autoComplete="cc-name"
                  required
                />

                <Input
                  label="Card number"
                  name="cardNumber"
                  inputMode="numeric"
                  autoComplete="cc-number"
                  pattern="[0-9 ]{12,23}"
                  placeholder="4242 4242 4242 4242"
                  required
                />

                <Input
                  label="Expiry"
                  name="expiry"
                  autoComplete="cc-exp"
                  placeholder="MM/YY"
                  pattern="(0[1-9]|1[0-2])/[0-9]{2}"
                  required
                />

                <Input
                  label="Security code"
                  name="cvc"
                  type="password"
                  inputMode="numeric"
                  autoComplete="cc-csc"
                  pattern="[0-9]{3,4}"
                  required
                />
              </div>
            )}
            <p className="mt-5 flex items-start gap-2 text-[0.76rem] leading-relaxed text-[var(--ink-faint)]">
              <LockKeyhole
                className="mt-0.5 h-3.5 w-3.5 shrink-0"
                aria-hidden
              />
              Demo only: payment fields are validated in your browser and
              discarded. No card data is transmitted or stored.
            </p>
          </section>
        </div>

        <aside className="rounded-[1.5rem] border border-[var(--edge)] bg-[var(--paper-3)] p-5 shadow-[var(--lift-md)] lg:sticky lg:top-24">
          <p className="mark text-[var(--n3)]">Your order</p>
          <div className="mt-5 max-h-56 space-y-3 overflow-auto border-b border-[var(--rule)] pb-5">
            {lines.map((line) => (
              <div
                key={line.id}
                className="flex justify-between gap-4 text-[0.8rem]"
              >
                <span className="min-w-0 text-[var(--ink-soft)]">
                  <span className="text-[var(--ink)]">{line.quantity}×</span>{" "}
                  {line.name}
                </span>
                <span className="shrink-0">
                  {formatPrice(line.priceCents * line.quantity)}
                </span>
              </div>
            ))}
          </div>
          <div className="space-y-3 border-b border-[var(--rule)] py-5 text-[0.86rem]">
            <div className="flex justify-between text-[var(--ink-soft)]">
              <span>Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between text-[var(--ink-soft)]">
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
          <Button
            type="submit"
            variant="flag"
            size="lg"
            loading={submitting}
            className="w-full"
          >
            Place demo order
          </Button>
          <Link
            to="/cart"
            className="mt-4 block text-center font-mono text-[0.62rem] uppercase tracking-[0.14em] text-[var(--ink-faint)] transition-colors hover:text-[var(--n2)]"
          >
            ← Back to cart
          </Link>
        </aside>
      </form>
    </div>
  );
}
