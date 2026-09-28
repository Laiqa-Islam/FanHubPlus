import { describe, expect, it } from "vitest";

import { cartSubtotal, normalizeCart, shippingForSubtotal } from "@/lib/cart";

const line = {
  id: "1",
  slug: "test-item",
  name: "Test item",
  category: "anime",
  imageUrl: "/merch/test.jpg",
  priceCents: 2_500,
  quantity: 2,
};

describe("cart totals", () => {
  it("calculates subtotal and free-shipping threshold", () => {
    expect(cartSubtotal([line])).toBe(5_000);
    expect(shippingForSubtotal(5_000)).toBe(695);
    expect(shippingForSubtotal(7_500)).toBe(0);
    expect(shippingForSubtotal(0)).toBe(0);
  });

  it("drops malformed stored lines and clamps quantities", () => {
    expect(normalizeCart([{ ...line, quantity: 99 }, { bad: true }])).toEqual([
      { ...line, quantity: 10 },
    ]);
  });
});
