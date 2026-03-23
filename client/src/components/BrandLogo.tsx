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
          "flex h-11 w-11 items-center justify-center rounded-2xl border border-white/20 bg-[linear-gradient(135deg,#0f172a_0%,#4f46e5_48%,#22c55e_100%)] text-sm font-black tracking-[-0.12em] text-white shadow-[0_18px_40px_-18px_rgba(79,70,229,0.9)]",
          compact && "h-9 w-9 rounded-xl text-xs",
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
        <p className="text-xs text-[var(--text-muted)]">Exam prep, designed to compound</p>
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
