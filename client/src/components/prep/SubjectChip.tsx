import { cn } from "@/lib/utils";
import type { PrepSubject } from "@/lib/prepbro";

const SUBJECT_STYLES: Record<PrepSubject, string> = {
  Polity: "bg-[rgba(26,46,90,0.12)] text-[var(--color-primary)]",
  History: "bg-[rgba(243,156,18,0.16)] text-[var(--color-warning)]",
  Geography: "bg-[rgba(22,160,133,0.16)] text-[#0f766e]",
  Economy: "bg-[rgba(255,107,53,0.12)] text-[var(--color-accent)]",
  Science: "bg-[rgba(46,204,113,0.14)] text-[var(--color-success)]",
  "Current Affairs": "bg-[rgba(59,130,246,0.12)] text-[#2563eb]",
  Maths: "bg-[rgba(168,85,247,0.14)] text-[#7c3aed]",
  Reasoning: "bg-[rgba(236,72,153,0.14)] text-[#be185d]",
};

export function SubjectChip({
  subject,
  active = false,
  className,
}: {
  subject: PrepSubject;
  active?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-[var(--radius-full)] px-3 py-1.5 text-[var(--text-sm)] font-medium",
        SUBJECT_STYLES[subject],
        active && "ring-2 ring-[var(--color-accent)] ring-offset-2 ring-offset-transparent",
        className
      )}
    >
      {subject}
    </span>
  );
}
