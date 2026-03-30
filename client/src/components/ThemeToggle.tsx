import { useEffect, useState } from "react";
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
      className={cn("toggle", className)}
      data-state={mounted && isDark ? "on" : "off"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      aria-pressed={mounted ? isDark : true}
      disabled={!mounted}
      title={
        mounted ? `${isDark ? "Dark" : "Light"} mode` : "Toggle appearance"
      }
    />
  );
}
