export const CART_STORAGE_KEY = "fanhub-plus-cart-v1";
export const MAX_CART_QUANTITY = 10;
export const FREE_SHIPPING_THRESHOLD_CENTS = 7_500;
export const STANDARD_SHIPPING_CENTS = 695;

export function formatPrice(cents) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

export function cartSubtotal(lines) {
  return lines.reduce(
    (total, line) => total + line.priceCents * line.quantity,
    0,
  );
}

export function shippingForSubtotal(subtotalCents) {
  if (subtotalCents <= 0 || subtotalCents >= FREE_SHIPPING_THRESHOLD_CENTS)
    return 0;
  return STANDARD_SHIPPING_CENTS;
}

export function normalizeCart(value) {
  if (!Array.isArray(value)) return [];

  return value.flatMap((candidate) => {
    if (!candidate || typeof candidate !== "object") return [];
    const line = candidate;
    if (
      typeof line.id !== "string" ||
      typeof line.slug !== "string" ||
      typeof line.name !== "string" ||
      typeof line.category !== "string" ||
      typeof line.imageUrl !== "string" ||
      !Number.isInteger(line.priceCents) ||
      Number(line.priceCents) < 0 ||
      !Number.isInteger(line.quantity)
    ) {
      return [];
    }

    return [
      {
        id: line.id,
        slug: line.slug,
        name: line.name,
        category: line.category,
        imageUrl: line.imageUrl,
        priceCents: Number(line.priceCents),
        quantity: Math.min(
          MAX_CART_QUANTITY,
          Math.max(1, Number(line.quantity)),
        ),
      },
    ];
  });
}
