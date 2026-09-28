import { Meta } from "@/components/meta";
import { CheckoutPageContent } from "@/components/cart/checkout-page-content";

export default function CheckoutPage() {
  return (
    <>
      <Meta
        title="Checkout"
        description="Complete your Fan Hub Plus demo merch order."
      />
      <CheckoutPageContent />
    </>
  );
}
