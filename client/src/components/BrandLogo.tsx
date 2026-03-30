import { Link } from "wouter";

import { cn } from "@/lib/utils";

const BRAND_LOGO_SRC = "/assets/prepbros-logo-final.svg";

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
    <div className={cn("inline-flex items-center", className)}>
      <div
        className={cn(
          "shrink-0 text-[2rem] leading-none",
          compact && "text-[1.75rem]",
          textClassName
        )}
      >
        <img
          src={BRAND_LOGO_SRC}
          alt="PrepBros"
          className={cn("block h-[1em] w-auto max-w-none", markClassName)}
        />
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
