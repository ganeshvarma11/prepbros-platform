import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = (resolvedTheme ?? "light") === "dark";

  return (
    <button
      type="button"
      className={cn("toggle theme-toggle", className)}
      data-state={mounted && isDark ? "on" : "off"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      aria-pressed={mounted ? isDark : true}
      disabled={!mounted}
      title={
        mounted ? `${isDark ? "Dark" : "Light"} mode` : "Toggle appearance"
      }
    >
      <span className="theme-toggle__icon theme-toggle__icon--sun" aria-hidden="true">
        <Sun size={12} strokeWidth={2} />
      </span>
      <span className="theme-toggle__icon theme-toggle__icon--moon" aria-hidden="true">
        <Moon size={12} strokeWidth={2} />
      </span>
    </button>
  );
}
