import { Flame } from "lucide-react";

import { cn } from "@/lib/utils";

export function StreakBadge({
  streak,
  detailed = false,
  className,
}: {
  streak: number;
  detailed?: boolean;
  className?: string;
}) {
  const milestone = streak >= 100 ? "legend" : streak >= 30 ? "gold" : "base";

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-[var(--radius-full)] px-3 py-2 text-[var(--text-sm)] font-medium",
        milestone === "legend" &&
          "bg-[rgba(42,74,140,0.14)] text-[var(--color-primary-light)]",
        milestone === "gold" &&
          "bg-[rgba(243,156,18,0.14)] text-[var(--color-warning)]",
        milestone === "base" &&
          "bg-[rgba(255,140,0,0.14)] text-[var(--color-streak)]",
        [7, 14, 30, 50, 100].includes(streak) &&
          "animate-[pb-flame-float_1.8s_ease-in-out_infinite]",
        className
      )}
    >
      <Flame className="h-4 w-4" />
      <span>{detailed ? `${streak} day streak` : streak}</span>
    </div>
  );
}
