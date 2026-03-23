import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
}

export default function SectionHeader({
  eyebrow,
  title,
  description,
  align = "left",
  className,
}: SectionHeaderProps) {
  return (
    <div className={cn(align === "center" && "text-center", className)}>
      {eyebrow ? (
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--brand-light)]">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="text-balance text-3xl font-semibold tracking-[-0.05em] text-[var(--text-primary)] md:text-4xl">
        {title}
      </h2>
      {description ? (
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-[var(--text-secondary)] md:text-base">
          {description}
        </p>
      ) : null}
    </div>
  );
}
