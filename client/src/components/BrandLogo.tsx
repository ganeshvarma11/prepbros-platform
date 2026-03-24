import { Link } from "wouter";

import { cn } from "@/lib/utils";

interface BrandLogoProps {
  href?: string;
  compact?: boolean;
  className?: string;
  markClassName?: string;
  textClassName?: string;
}

function BrandLogoInner({
  compact = false,
  className,
  markClassName,
  textClassName,
}: Omit<BrandLogoProps, "href">) {
  return (
    <div className={cn("inline-flex items-center gap-3", className)}>
      <div
        className={cn(
          "brand-mark relative h-11 w-9",
          compact && "h-9 w-7",
          markClassName,
        )}
        aria-hidden="true"
      >
        <span className="brand-mark-stem" />
        <span className="brand-mark-curve" />
        <span className="brand-mark-accent" />
      </div>

      <div className="min-w-0">
        <p
          className={cn(
            "text-[2rem] font-semibold leading-none tracking-[-0.06em] text-[var(--text-primary)]",
            compact && "text-[1.95rem]",
            textClassName,
          )}
        >
          PrepBros
        </p>
      </div>
    </div>
  );
}

export default function BrandLogo({ href = "/", ...props }: BrandLogoProps) {
  return (
    <Link href={href}>
      <span className="cursor-pointer">
        <BrandLogoInner {...props} />
      </span>
    </Link>
  );
}
