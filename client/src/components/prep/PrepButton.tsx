import * as React from "react";
import { Loader2 } from "lucide-react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const prepButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-[var(--radius-full)] font-medium transition-all duration-150 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-40",
  {
    variants: {
      variant: {
        primary:
          "bg-[var(--color-accent)] text-white shadow-[var(--shadow-md)] hover:bg-[var(--color-accent-hover)]",
        secondary:
          "bg-[var(--color-primary)] text-white shadow-[var(--shadow-md)] hover:bg-[var(--color-primary-light)]",
        outline:
          "border border-[var(--color-border)] bg-transparent text-[var(--color-text-primary)] hover:bg-[var(--color-surface)]",
        ghost:
          "bg-transparent text-[var(--color-text-secondary)] hover:bg-[var(--color-surface)] hover:text-[var(--color-text-primary)]",
        danger:
          "bg-[var(--color-danger)] text-white shadow-[var(--shadow-md)] hover:brightness-95",
      },
      size: {
        sm: "h-9 px-4 text-[var(--text-sm)]",
        md: "h-11 px-5 text-[var(--text-base)]",
        lg: "h-[52px] px-8 text-[var(--text-md)]",
        xl: "h-[60px] px-10 text-[var(--text-lg)]",
      },
      fullWidth: {
        true: "w-full",
        false: "",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
      fullWidth: false,
    },
  }
);

type PrepButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof prepButtonVariants> & {
    asChild?: boolean;
    loading?: boolean;
  };

export function PrepButton({
  className,
  variant,
  size,
  fullWidth,
  asChild = false,
  loading = false,
  children,
  onPointerDown,
  ...props
}: PrepButtonProps) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      className={cn(
        prepButtonVariants({ variant, size, fullWidth }),
        "active:scale-[0.98] hover:scale-[1.02]",
        className
      )}
      onPointerDown={event => {
        if (typeof navigator !== "undefined" && "vibrate" in navigator) {
          navigator.vibrate?.([10]);
        }
        onPointerDown?.(event);
      }}
      {...props}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
      <span>{children}</span>
    </Comp>
  );
}
