import { Link } from "react-router";
import { ShoppingBag } from "lucide-react";

import { useCart } from "@/components/providers/cart-provider";

export function CartButton() {
  const { itemCount, hydrated } = useCart();
  const count = hydrated ? itemCount : 0;

  return (
    <Link
      to="/cart"
      aria-label={`Cart with ${count} ${count === 1 ? "item" : "items"}`}
      className="relative grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[var(--edge-strong)] text-[var(--ink-soft)] transition-[border-color,color,box-shadow] duration-200 hover:border-[var(--n3)] hover:text-[var(--n3)] hover:shadow-[0_0_18px_color-mix(in_oklch,var(--n3)_35%,transparent)]"
    >
      <ShoppingBag className="h-4.5 w-4.5" aria-hidden />
      {count > 0 && (
        <span className="absolute -right-1 -top-1 grid min-h-5 min-w-5 place-items-center rounded-full bg-[var(--n3)] px-1 font-mono text-[0.58rem] font-bold leading-none text-[var(--void)]">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}
