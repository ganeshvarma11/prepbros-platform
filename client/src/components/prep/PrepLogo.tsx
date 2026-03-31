import { Link } from "wouter";

export function PrepLogo({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/">
      <span className="inline-flex cursor-pointer items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-[var(--color-primary)] text-[var(--text-lg)] font-bold text-white shadow-[var(--shadow-sm)]">
          P
        </span>
        {!compact ? (
          <span className="font-[var(--font-display)] text-[var(--text-xl)] font-bold text-[var(--color-text-primary)]">
            PrepBros
          </span>
        ) : null}
      </span>
    </Link>
  );
}
