import { useMemo } from "react";

export function ProgressRing({
  percentage,
  size = 64,
  strokeWidth = 8,
  label,
}: {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
}) {
  const clamped = Math.max(0, Math.min(100, percentage));
  const radius = useMemo(() => (size - strokeWidth) / 2, [size, strokeWidth]);
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (clamped / 100) * circumference;
  const color =
    clamped >= 70
      ? "var(--color-success)"
      : clamped >= 40
        ? "var(--color-warning)"
        : "var(--color-danger)";

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(154,154,175,0.18)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeLinecap="round"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          style={{
            transition: "stroke-dashoffset 800ms ease-out",
            transform: "rotate(-90deg)",
            transformOrigin: "50% 50%",
          }}
        />
      </svg>
      <div className="absolute text-center">
        <div className="text-[var(--text-md)] font-bold text-[var(--color-text-primary)]">
          {clamped}%
        </div>
        {label ? (
          <div className="text-[var(--text-xs)] text-[var(--color-text-muted)]">
            {label}
          </div>
        ) : null}
      </div>
    </div>
  );
}
