import { X } from "lucide-react";
import { useState } from "react";

import { useSwipeable } from "@/hooks/useSwipeable";
import { cn } from "@/lib/utils";

type SwipeDismissNoticeProps = {
  title: string;
  description: string;
  className?: string;
  action?: React.ReactNode;
  defaultVisible?: boolean;
};

export default function SwipeDismissNotice({
  title,
  description,
  className,
  action,
  defaultVisible = true,
}: SwipeDismissNoticeProps) {
  const [visible, setVisible] = useState(defaultVisible);
  const { bind, offsetX, isDragging, touchAction } = useSwipeable({
    axis: "x",
    enabled: visible,
    mouse: true,
    minDistance: 70,
    onSwipeLeft: () => setVisible(false),
    onSwipeRight: () => setVisible(false),
  });

  if (!visible) return null;

  return (
    <div
      {...bind}
      className={cn(
        "relative overflow-hidden rounded-[22px] border border-[var(--border)] bg-[var(--surface-1)] px-4 py-4 shadow-[var(--shadow-sm)] transition",
        className
      )}
      style={{
        transform: `translateX(${offsetX}px)`,
        opacity: isDragging ? Math.max(0.5, 1 - Math.abs(offsetX) / 180) : 1,
        transition: isDragging
          ? "none"
          : "transform 220ms cubic-bezier(0.4,0,0.2,1), opacity 220ms cubic-bezier(0.4,0,0.2,1)",
        touchAction,
      }}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.08),transparent_32%)] dark:bg-[radial-gradient(circle_at_top_left,rgba(148,163,184,0.14),transparent_32%)]" />
      <div className="relative z-10 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-faint)]">
            Gesture tip
          </p>
          <p className="mt-2 text-sm font-semibold text-[var(--text-primary)]">
            {title}
          </p>
          <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">
            {description}
          </p>
          {action ? <div className="mt-3" data-no-swipe="true">{action}</div> : null}
        </div>

        <button
          type="button"
          onClick={() => setVisible(false)}
          data-no-swipe="true"
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface-2)] text-[var(--text-secondary)] transition hover:border-[var(--border-strong)] hover:text-[var(--text-primary)]"
          aria-label="Dismiss notice"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
