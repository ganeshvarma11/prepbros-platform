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
      <svg
        viewBox="0 0 256 256"
        aria-hidden="true"
        className={cn("h-11 w-11 shrink-0", compact && "h-9 w-9", markClassName)}
      >
        <defs>
          <linearGradient
            id="brand-logo-accent"
            x1="108"
            y1="94"
            x2="174"
            y2="144"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#FFB548" />
            <stop offset="1" stopColor="#FF7A12" />
          </linearGradient>
        </defs>

        <rect width="256" height="256" rx="64" fill="#09090F" />
        <rect x="44" y="36" width="42" height="184" rx="21" fill="#F7F2EE" />
        <path
          d="M78 52C78 40.9543 86.9543 32 98 32H140C183.078 32 218 66.9218 218 110C218 153.078 183.078 188 140 188H106C94.9543 188 86 179.046 86 168C86 156.954 94.9543 148 106 148H138C159.539 148 177 130.539 177 109C177 87.4609 159.539 70 138 70H98C86.9543 70 78 61.0457 78 50V52Z"
          fill="#F7F2EE"
        />
        <path d="M122 85L186 112L122 145V85Z" fill="url(#brand-logo-accent)" />
        <rect x="80" y="88" width="18" height="76" rx="9" fill="#09090F" />
      </svg>

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
