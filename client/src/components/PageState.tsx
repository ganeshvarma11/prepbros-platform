import type { ReactNode } from "react";
import { AlertCircle, Loader2 } from "lucide-react";
import { Link } from "wouter";

import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function PageLoading({
  label = "Loading…",
  className,
}: {
  label?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex min-h-[min(60vh,520px)] flex-col items-center justify-center gap-4 px-4",
        className,
      )}
      role="status"
      aria-live="polite"
    >
      <div className="inline-flex items-center gap-3 rounded-full border border-[var(--border)] bg-[var(--bg-card)] px-5 py-3 text-sm text-[var(--text-secondary)] shadow-[var(--shadow-sm)]">
        <Loader2
          size={16}
          className="animate-spin text-[var(--brand)] motion-reduce:animate-none"
          aria-hidden
        />
        {label}
      </div>
    </div>
  );
}

export function PracticeTableSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <div className="min-h-[420px] px-5 py-6" aria-hidden>
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full rounded-lg bg-[var(--bg-muted)]" />
        ))}
      </div>
    </div>
  );
}

export function PageSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="w-full max-w-[1040px] space-y-4" aria-hidden>
      <Skeleton className="h-9 w-48 rounded-lg bg-[var(--bg-muted)]" />
      <Skeleton className="h-4 w-full max-w-md rounded-md bg-[var(--bg-muted)]" />
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-2xl bg-[var(--bg-muted)]" />
        ))}
      </div>
      <div className="space-y-2">
        {Array.from({ length: rows }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full rounded-xl bg-[var(--bg-muted)]" />
        ))}
      </div>
    </div>
  );
}

export function PageEmpty({
  title,
  description,
  actionLabel,
  actionHref,
  children,
  className,
}: {
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <Empty
      className={cn(
        "min-h-[min(52vh,440px)] border border-[var(--border)] bg-[var(--bg-card)]/40",
        className,
      )}
    >
      <EmptyHeader>
        <EmptyTitle className="text-[var(--text-primary)]">{title}</EmptyTitle>
        <EmptyDescription className="text-[var(--text-secondary)] [&]:text-[var(--text-secondary)]">
          {description}
        </EmptyDescription>
      </EmptyHeader>
      {actionHref && actionLabel ? (
        <EmptyContent>
          <Link href={actionHref}>
            <span className="btn-primary inline-flex cursor-pointer rounded-full px-5 py-2.5 text-sm">
              {actionLabel}
            </span>
          </Link>
        </EmptyContent>
      ) : null}
      {children}
    </Empty>
  );
}

export function PageError({
  title = "Something went wrong",
  message,
  retryLabel = "Try again",
  onRetry,
  className,
}: {
  title?: string;
  message: string;
  retryLabel?: string;
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex min-h-[min(48vh,400px)] flex-col items-center justify-center gap-4 rounded-[20px] border border-[var(--red)]/25 bg-[var(--red-bg)] px-6 py-10 text-center",
        className,
      )}
      role="alert"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[var(--red)]/30 bg-[var(--bg-card)] text-[var(--red)]">
        <AlertCircle size={22} strokeWidth={2} />
      </div>
      <div>
        <p className="text-base font-semibold text-[var(--text-primary)]">{title}</p>
        <p className="mt-2 max-w-md text-sm text-[var(--text-secondary)]">{message}</p>
      </div>
      {onRetry ? (
        <button type="button" onClick={onRetry} className="btn-secondary rounded-full px-5 py-2 text-sm">
          {retryLabel}
        </button>
      ) : null}
    </div>
  );
}
