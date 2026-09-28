import { Meta } from "@/components/meta";
import { CartPageContent } from "@/components/cart/cart-page-content";

export default function CartPage() {
  return (
    <>
      <Meta
        title="Your cart"
        description="Review your Fan Hub Plus merch before checkout."
      />
      <CartPageContent />
    </>
  );
}
