import { BarChart3, BookOpen, Home, User } from "lucide-react";
import { Link, useLocation } from "wouter";

import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/practice", label: "Practice", icon: BookOpen },
  { href: "/progress", label: "Progress", icon: BarChart3 },
  { href: "/profile", label: "Profile", icon: User },
];

export function PrepBottomNav() {
  const [location] = useLocation();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-[120] border-t border-[var(--color-border)] bg-[rgba(255,255,255,0.92)] px-4 pb-[calc(env(safe-area-inset-bottom)+10px)] pt-2 shadow-[0_-8px_24px_rgba(0,0,0,0.08)] backdrop-blur md:hidden dark:bg-[rgba(34,40,64,0.96)]">
      <div className="mx-auto flex max-w-xl items-center justify-between">
        {NAV_ITEMS.map(item => {
          const Icon = item.icon;
          const active = location === item.href;

          return (
            <Link key={item.href} href={item.href}>
              <span
                className={cn(
                  "flex min-w-[64px] cursor-pointer flex-col items-center justify-center gap-1 rounded-[var(--radius-md)] px-3 py-2 text-[var(--text-xs)] font-medium",
                  active
                    ? "text-[var(--color-primary)]"
                    : "text-[var(--color-text-muted)]"
                )}
              >
                <Icon
                  className={cn(
                    "h-5 w-5",
                    active
                      ? "fill-[var(--color-primary)]/10 text-[var(--color-primary)]"
                      : "text-current"
                  )}
                />
                <span>{item.label}</span>
                <span
                  className={cn(
                    "h-1.5 w-1.5 rounded-full bg-[var(--color-accent)] transition-opacity",
                    active ? "opacity-100" : "opacity-0"
                  )}
                />
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
