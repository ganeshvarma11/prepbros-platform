import { useEffect, useState } from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const triggerClass =
  "inline-flex h-10 w-10 items-center justify-center rounded-[12px] border border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-primary)] transition hover:border-[var(--border-strong)] hover:bg-[var(--bg-elevated)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--border-focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-base)] disabled:opacity-50";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const resolved = resolvedTheme === "dark" ? "dark" : "light";
  const Icon = resolved === "dark" ? Moon : Sun;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(triggerClass, className)}
          aria-label="Color theme"
          disabled={!mounted}
        >
          {mounted ? <Icon size={17} strokeWidth={2} /> : <Sun size={17} strokeWidth={2} />}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="z-50 min-w-[11rem] border-[var(--border)] bg-[var(--bg-card-strong)] text-[var(--text-primary)]"
      >
        <DropdownMenuRadioGroup
          value={theme ?? "system"}
          onValueChange={(value) => setTheme(value)}
        >
          <DropdownMenuRadioItem
            value="light"
            className="cursor-pointer focus:bg-[var(--bg-muted)]"
          >
            <Sun size={14} className="mr-2 text-[var(--text-muted)]" />
            Light
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem
            value="dark"
            className="cursor-pointer focus:bg-[var(--bg-muted)]"
          >
            <Moon size={14} className="mr-2 text-[var(--text-muted)]" />
            Dark
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem
            value="system"
            className="cursor-pointer focus:bg-[var(--bg-muted)]"
          >
            <Monitor size={14} className="mr-2 text-[var(--text-muted)]" />
            System
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
