import { useEffect, useMemo, useState } from "react";

export function LiveCounter({
  initialValue,
  label,
  className,
}: {
  initialValue: number;
  label: string;
  className?: string;
}) {
  const [count, setCount] = useState(initialValue);
  const [bump, setBump] = useState(false);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setCount(current => current + 1);
      setBump(true);
      window.setTimeout(() => setBump(false), 220);
    }, 30000);

    return () => window.clearInterval(interval);
  }, []);

  const formatted = useMemo(
    () => new Intl.NumberFormat("en-IN").format(count),
    [count]
  );

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-[var(--radius-full)] bg-[var(--color-accent)] px-4 py-2 text-[var(--text-sm)] font-medium text-white",
        className
      )}
    >
      <span className="relative flex h-2.5 w-2.5">
        <span className="absolute inset-0 animate-[pb-dot-pulse_1.2s_ease-in-out_infinite] rounded-full bg-[#9effc4]" />
        <span className="relative h-2.5 w-2.5 rounded-full bg-[#9effc4]" />
      </span>
      <span className={bump ? "scale-105 transition-transform" : "transition-transform"}>
        {formatted} {label}
      </span>
    </div>
  );
}

function cn(...values: Array<string | undefined | false>) {
  return values.filter(Boolean).join(" ");
}
