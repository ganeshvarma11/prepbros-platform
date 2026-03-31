import { Check, X } from "lucide-react";

import { cn } from "@/lib/utils";

type QuizOptionState =
  | "default"
  | "selected"
  | "correct"
  | "incorrect"
  | "showing-correct";

export function QuizOption({
  label,
  text,
  state = "default",
  onClick,
  disabled,
}: {
  label: string;
  text: string;
  state?: QuizOptionState;
  onClick?: () => void;
  disabled?: boolean;
}) {
  const icon =
    state === "correct" || state === "showing-correct" ? (
      <Check className="h-4 w-4" />
    ) : state === "incorrect" ? (
      <X className="h-4 w-4" />
    ) : null;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex w-full items-center gap-4 rounded-[var(--radius-md)] border px-4 py-4 text-left transition-all duration-200",
        "min-h-14",
        state === "default" &&
          "border-[var(--color-border)] bg-[var(--color-surface-raised)] hover:bg-[var(--color-surface)]",
        state === "selected" &&
          "border-[var(--color-accent)] bg-[#fff3ef] shadow-[var(--shadow-sm)]",
        state === "correct" &&
          "border-[var(--color-success)] bg-[var(--color-success-light)]",
        state === "incorrect" &&
          "animate-[pb-shake_220ms_ease] border-[var(--color-danger)] bg-[var(--color-danger-light)]",
        state === "showing-correct" &&
          "border-[var(--color-success)] bg-[var(--color-success-light)] shadow-[0_0_16px_rgba(46,204,113,0.16)]"
      )}
      aria-pressed={state === "selected"}
    >
      <span
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-[var(--text-sm)] font-bold",
          state === "correct" || state === "showing-correct"
            ? "border-[var(--color-success)] text-[var(--color-success)]"
            : state === "incorrect"
              ? "border-[var(--color-danger)] text-[var(--color-danger)]"
              : state === "selected"
                ? "border-[var(--color-accent)] text-[var(--color-accent)]"
                : "border-[var(--color-primary)] text-[var(--color-primary)]"
        )}
      >
        {label}
      </span>
      <span className="flex-1 text-[var(--text-base)] text-[var(--color-text-primary)]">
        {text}
      </span>
      {icon ? (
        <span className="animate-[pb-check-bounce_240ms_ease] text-current">
          {icon}
        </span>
      ) : null}
    </button>
  );
}
