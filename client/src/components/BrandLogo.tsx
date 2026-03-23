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
          "flex h-11 w-11 items-center justify-center rounded-[12px] border border-[rgba(255,161,22,0.28)] bg-[linear-gradient(180deg,#2a2114_0%,#171717_100%)] text-sm font-black tracking-[-0.08em] text-[var(--brand)] shadow-[0_16px_34px_-18px_rgba(0,0,0,0.8)]",
          compact && "h-9 w-9 rounded-[10px] text-xs",
          markClassName,
        )}
      >
        PB
      </div>
      <div className={cn("min-w-0", compact && "hidden sm:block")}>
        <p
          className={cn(
            "text-base font-semibold tracking-[-0.04em] text-[var(--text-primary)]",
            textClassName,
          )}
        >
          PrepBros
        </p>
        <p className="text-xs text-[var(--text-muted)]">Focused exam practice for serious aspirants</p>
      </div>
    </div>
  );
}

export default function BrandLogo({
  href = "/",
  ...props
}: BrandLogoProps) {
  return (
    <Link href={href}>
      <span className="cursor-pointer">
        <BrandLogoInner {...props} />
      </span>
    </Link>
  );
}
