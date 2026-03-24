import { useEffect, useMemo, useState, type ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  CircleHelp,
  Compass,
  Crown,
  LayoutDashboard,
  LogOut,
  Menu,
  Sparkles,
  Trophy,
  UserCircle2,
} from "lucide-react";
import { Link, useLocation } from "wouter";

import BrandLogo from "@/components/BrandLogo";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

type AppShellProps = {
  children: ReactNode;
  contentClassName?: string;
};

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

type NavGroup = {
  label: string;
  items: NavItem[];
};

const NAV_GROUPS: NavGroup[] = [
  {
    label: "Workspace",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/practice", label: "Practice", icon: BookOpen },
      { href: "/explore", label: "Explore", icon: Compass },
    ],
  },
  {
    label: "Progress",
    items: [
      { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
      { href: "/resources", label: "Resources", icon: BookOpen },
      { href: "/premium", label: "Premium", icon: Crown },
      { href: "/support", label: "Support", icon: CircleHelp },
    ],
  },
  {
    label: "Account",
    items: [{ href: "/profile", label: "Profile", icon: UserCircle2 }],
  },
];

const isActiveRoute = (location: string, href: string) =>
  location === href || (href !== "/" && location.startsWith(`${href}/`));

function NavLink({
  item,
  location,
  onNavigate,
}: {
  item: NavItem;
  location: string;
  onNavigate?: () => void;
}) {
  const Icon = item.icon;
  const active = isActiveRoute(location, item.href);

  return (
    <Link href={item.href}>
      <span
        onClick={onNavigate}
        className={cn(
          "group flex cursor-pointer items-center gap-3 rounded-[16px] border px-3.5 py-3 text-sm font-medium transition",
          active
            ? "border-[var(--brand-muted)] bg-[var(--brand-subtle)] text-[var(--text-primary)] shadow-[0_18px_40px_-34px_rgba(255,161,22,0.85)]"
            : "border-transparent text-[var(--text-secondary)] hover:border-[var(--border)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]",
        )}
      >
        <span
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-[12px] border transition",
            active
              ? "border-[var(--brand-muted)] bg-[rgba(255,161,22,0.14)] text-[var(--brand-light)]"
              : "border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-muted)] group-hover:text-[var(--brand-light)]",
          )}
        >
          <Icon size={16} />
        </span>
        <span className="truncate">{item.label}</span>
      </span>
    </Link>
  );
}

function SidebarBody({
  location,
  onNavigate,
}: {
  location: string;
  onNavigate?: () => void;
}) {
  const { user, signOut } = useAuth();

  const displayName =
    user?.user_metadata?.full_name || user?.email?.split("@")[0] || "PrepBros User";
  const targetExam = user?.user_metadata?.target_exam || "UPSC CSE 2026";
  const avatarUrl =
    user?.user_metadata?.avatar_url ||
    user?.user_metadata?.picture ||
    user?.user_metadata?.avatar ||
    "";

  return (
    <div className="flex h-full flex-col">
      <div className="rounded-[24px] border border-[var(--border)] bg-[var(--bg-card)] p-4 shadow-[var(--shadow-md)]">
        <BrandLogo compact className="items-center" textClassName="text-[1.7rem]" />
        <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
          Navigate the prep workspace, move faster between progress views, and keep account tools close.
        </p>
      </div>

      <div className="mt-6 flex-1 space-y-5 overflow-y-auto pr-1">
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            <p className="px-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--text-muted)]">
              {group.label}
            </p>
            <div className="mt-3 space-y-2">
              {group.items.map((item) => (
                <NavLink key={item.href} item={item} location={location} onNavigate={onNavigate} />
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-[24px] border border-[var(--border)] bg-[linear-gradient(180deg,var(--bg-card)_0%,var(--bg-elevated)_100%)] p-4 shadow-[var(--shadow-md)]">
        {user ? (
          <>
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12 rounded-[16px] border border-[var(--border)]">
                <AvatarImage src={avatarUrl} alt={displayName} className="object-cover" />
                <AvatarFallback className="rounded-[16px] bg-[var(--brand-subtle)] text-[var(--brand)]">
                  {displayName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-[var(--text-primary)]">{displayName}</p>
                <p className="truncate text-xs text-[var(--text-muted)]">{user.email}</p>
              </div>
            </div>

            <div className="mt-4 rounded-[16px] border border-[var(--border)] bg-[var(--bg-elevated)] px-3.5 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--text-muted)]">
                Current focus
              </p>
              <p className="mt-2 text-sm font-medium text-[var(--text-primary)]">{targetExam}</p>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <Link href="/profile">
                <span
                  onClick={onNavigate}
                  className="inline-flex cursor-pointer items-center justify-center rounded-[14px] border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2.5 text-sm font-medium text-[var(--text-primary)] transition hover:border-[var(--border-strong)]"
                >
                  Open profile
                </span>
              </Link>
              <button
                type="button"
                onClick={() => {
                  onNavigate?.();
                  signOut();
                }}
                className="inline-flex items-center justify-center gap-2 rounded-[14px] border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2.5 text-sm font-medium text-[var(--text-primary)] transition hover:border-[var(--border-strong)]"
              >
                <LogOut size={14} />
                Logout
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-[14px] bg-[var(--brand-subtle)] text-[var(--brand)]">
              <Sparkles size={18} />
            </div>
            <p className="mt-4 text-base font-semibold text-[var(--text-primary)]">
              Sign in to sync your progress
            </p>
            <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
              Bookmarks, streaks, and your dashboard become much more useful once they are attached to your account.
            </p>
            <Link href="/">
              <span
                onClick={onNavigate}
                className="btn-primary mt-4 inline-flex cursor-pointer rounded-[14px] px-4 py-2.5 text-sm"
              >
                Go to home
              </span>
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

export default function AppShell({ children, contentClassName }: AppShellProps) {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  const currentLabel = useMemo(() => {
    for (const group of NAV_GROUPS) {
      const match = group.items.find((item) => isActiveRoute(location, item.href));
      if (match) return match.label;
    }
    return "PrepBros";
  }, [location]);

  const displayName =
    user?.user_metadata?.full_name?.split(" ")[0] || user?.email?.split("@")[0] || "Guest";
  const avatarUrl =
    user?.user_metadata?.avatar_url ||
    user?.user_metadata?.picture ||
    user?.user_metadata?.avatar ||
    "";

  return (
    <div className="min-h-screen bg-[var(--page-background)]">
      <div className="lg:grid lg:min-h-screen lg:grid-cols-[292px_minmax(0,1fr)]">
        <aside className="hidden border-r border-[var(--border)] bg-[var(--bg-card)] px-4 py-5 backdrop-blur-2xl lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col">
          <SidebarBody location={location} />
        </aside>

        <div className="min-w-0">
          <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-[var(--bg-card)] backdrop-blur-2xl lg:hidden">
            <div className="flex items-center justify-between gap-3 px-4 py-3">
              <div className="flex min-w-0 items-center gap-3">
                <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                  <button
                    type="button"
                    onClick={() => setMobileOpen(true)}
                    className="inline-flex h-11 w-11 items-center justify-center rounded-[14px] border border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-primary)]"
                    aria-label="Open navigation"
                  >
                    <Menu size={18} />
                  </button>
                  <SheetContent
                    side="left"
                    className="w-[88vw] max-w-[360px] border-r border-[var(--border)] bg-[var(--bg-base)] p-4 text-[var(--text-primary)]"
                  >
                    <SidebarBody location={location} onNavigate={() => setMobileOpen(false)} />
                  </SheetContent>
                </Sheet>

                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--text-muted)]">
                    Workspace
                  </p>
                  <p className="truncate text-sm font-semibold text-[var(--text-primary)]">
                    {currentLabel}
                  </p>
                </div>
              </div>

              <Link href={user ? "/profile" : "/"}>
                <span className="flex cursor-pointer items-center gap-2 rounded-[14px] border border-[var(--border)] bg-[var(--bg-card)] px-2.5 py-2">
                  <Avatar className="h-8 w-8 rounded-[10px] border border-[var(--border)]">
                    <AvatarImage src={avatarUrl} alt={displayName} className="object-cover" />
                    <AvatarFallback className="rounded-[10px] bg-[var(--brand-subtle)] text-[var(--brand)]">
                      {displayName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </span>
              </Link>
            </div>
          </header>

          <main className="px-4 py-5 md:px-6 md:py-6 lg:px-8 lg:py-8">
            <div className={cn("mx-auto w-full max-w-[1380px]", contentClassName)}>{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
