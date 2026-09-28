import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Lit buttons: fully rounded, and either a solid neon plate with the glow
 * bleeding out of it or a 1.5px neon outline on nothing at all. Hovering
 * lifts the button a couple of pixels and widens the glow, the way a sign
 * brightens when the current comes up.
 *
 * `--glow` carries the variant's own signal so the shared hover rule does
 * not need to know which colour it is lighting.
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-semibold transition-[transform,box-shadow,background-color,color,border-color] duration-200 disabled:pointer-events-none disabled:opacity-45 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--n2)] hover:-translate-y-[2px] active:translate-y-0",
  {
    variants: {
      variant: {
        // The house signal, solid. Display face, because a primary action is
        // a headline of its own.
        primary:
          "[--glow:var(--n1)] bg-[var(--n1)] font-display text-[var(--void)] shadow-[0_0_24px_color-mix(in_oklch,var(--n1)_55%,transparent)] hover:shadow-[0_0_38px_color-mix(in_oklch,var(--n1)_75%,transparent)]",
        // Cyan outline — the second pass, and the default for anything that
        // sits beside a primary.
        outline:
          "[--glow:var(--n2)] border-[1.5px] border-[var(--n2)] bg-transparent text-[var(--n2)] hover:bg-[color-mix(in_oklch,var(--n2)_14%,transparent)] hover:shadow-[0_0_26px_color-mix(in_oklch,var(--n2)_40%,transparent)]",
        // Acid, for the alert-shaped action: a drop closing, tickets going.
        flag: "[--glow:var(--n3)] bg-[var(--n3)] font-display text-[var(--void)] shadow-[0_0_24px_color-mix(in_oklch,var(--n3)_50%,transparent)] hover:shadow-[0_0_38px_color-mix(in_oklch,var(--n3)_70%,transparent)]",
        // Cyan plate, for the rarer case where two solid actions sit together.
        blue: "[--glow:var(--n2)] bg-[var(--n2)] font-display text-[var(--void)] shadow-[0_0_24px_color-mix(in_oklch,var(--n2)_50%,transparent)] hover:shadow-[0_0_38px_color-mix(in_oklch,var(--n2)_70%,transparent)]",
        // A neutral outline that only lights up on hover.
        ink: "border-[1.5px] border-[var(--edge-strong)] bg-transparent text-[var(--ink)] hover:border-[var(--n1)] hover:text-[var(--n1)]",
        ghost:
          "bg-transparent text-[var(--ink-soft)] hover:translate-y-0 hover:bg-[var(--paper-2)] hover:text-[var(--ink)]",
      },
      size: {
        sm: "h-9 px-4 text-[0.76rem]",
        md: "h-11 px-5 text-[0.84rem]",
        lg: "h-13 px-7 text-[0.92rem]",
        icon: "h-10 w-10 px-0",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export function Button({
  className,
  variant,
  size,
  asChild = false,
  loading = false,
  disabled,
  children,
  ...props
}) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      className={cn(buttonVariants({ variant, size }), className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
          <span>Sending…</span>
        </>
      ) : (
        children
      )}
    </Comp>
  );
}

export { buttonVariants };
