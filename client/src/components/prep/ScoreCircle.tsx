import { useMemo } from "react";

export function ScoreCircle({
  score,
  total,
}: {
  score: number;
  total: number;
}) {
  const percentage = total ? Math.round((score / total) * 100) : 0;
  const radius = 74;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;
  const stroke =
    percentage >= 70
      ? "var(--color-success)"
      : percentage >= 40
        ? "var(--color-warning)"
        : "var(--color-danger)";

  const scoreLabel = useMemo(() => `${score}`, [score]);

  return (
    <div className="relative mx-auto h-48 w-48">
      <svg viewBox="0 0 180 180" className="h-full w-full">
        <circle
          cx="90"
          cy="90"
          r={radius}
          fill="none"
          stroke="rgba(154,154,175,0.14)"
          strokeWidth="14"
        />
        <circle
          cx="90"
          cy="90"
          r={radius}
          fill="none"
          stroke={stroke}
          strokeLinecap="round"
          strokeWidth="14"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{
            transition: "stroke-dashoffset 800ms ease-out",
            transform: "rotate(-90deg)",
            transformOrigin: "50% 50%",
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="font-[var(--font-display)] text-[48px] font-bold leading-none text-[var(--color-text-primary)]">
          {scoreLabel}
        </span>
        <span className="mt-2 text-[var(--text-sm)] text-[var(--color-text-muted)]">
          / {total}
        </span>
      </div>
    </div>
  );
}
