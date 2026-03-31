import type { HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const prepCardVariants = cva(
  "rounded-[var(--radius-lg)] border border-[var(--color-border)] transition-colors",
  {
    variants: {
      variant: {
        flat: "bg-[var(--color-surface)] shadow-none",
        raised: "bg-[var(--color-surface-raised)] shadow-[var(--shadow-card)]",
        hero: "border-transparent bg-[linear-gradient(135deg,var(--color-primary)_0%,var(--color-primary-light)_100%)] text-white shadow-[var(--shadow-md)]",
      },
      padding: {
        default: "p-4",
        hero: "p-6",
        none: "p-0",
      },
    },
    defaultVariants: {
      variant: "raised",
      padding: "default",
    },
  }
);

type PrepCardProps = HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof prepCardVariants>;

export function PrepCard({
  className,
  variant,
  padding,
  ...props
}: PrepCardProps) {
  return (
    <div className={cn(prepCardVariants({ variant, padding }), className)} {...props} />
  );
}
