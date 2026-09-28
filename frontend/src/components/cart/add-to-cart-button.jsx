import { ShoppingBag } from "lucide-react";
import { toast } from "react-toastify";

import { useCart } from "@/components/providers/cart-provider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function AddToCartButton({ product, label = "Add to cart", className }) {
  const { addItem } = useCart();

  return (
    <Button
      type="button"
      className={cn("min-h-11", className)}
      onClick={() => {
        addItem(product);
        toast.success(`${product.name} added to cart.`);
      }}
    >
      <ShoppingBag className="h-4 w-4" aria-hidden />
      {label}
    </Button>
  );
}
