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
  Trophy,
  UserCircle2,
} from "lucide-react";
import { Link, useLocation } from "wouter";

import BrandLogo from "@/components/BrandLogo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

type AppShellProps = {
  children: ReactNode;
  contentClassName?: string;
  shellClassName?: string;
  allowDesktopSidebarToggle?: boolean;
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
          "group flex cursor-pointer items-center gap-3 rounded-[12px] px-3 py-2 text-[13px] font-medium transition",
          active
            ? "bg-[var(--bg-elevated)] text-[var(--text-primary)]"
            : "text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]"
        )}
      >
        <span
          className={cn(
            "h-1.5 w-1.5 rounded-full transition",
            active
              ? "bg-[var(--brand)]"
              : "bg-transparent group-hover:bg-[var(--border-strong)]"
          )}
        />
        <span
          className={cn(
            "flex h-7 w-7 items-center justify-center rounded-[9px] transition",
            active
              ? "bg-[var(--brand-subtle)] text-[var(--brand-light)]"
              : "text-[var(--text-muted)] group-hover:text-[var(--text-primary)]"
          )}
        >
          <Icon size={15} />
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
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "PrepBros User";
  const targetExam = user?.user_metadata?.target_exam || "UPSC CSE 2026";
  const avatarUrl =
    user?.user_metadata?.avatar_url ||
    user?.user_metadata?.picture ||
    user?.user_metadata?.avatar ||
    "";

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-[var(--border)] px-1 pb-4">
        <BrandLogo
          compact
          className="items-center gap-2"
          textClassName="text-[1.4rem]"
        />
        <p className="mt-3 px-2 text-xs leading-5 text-[var(--text-muted)]">
          Daily practice, revision, and progress in one calm workspace.
        </p>
      </div>

      <div className="flex-1 space-y-6 overflow-y-auto py-5 pr-1">
        {NAV_GROUPS.map(group => (
          <div key={group.label}>
            <p className="px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--text-faint)]">
              {group.label}
            </p>
            <div className="mt-2 space-y-1">
              {group.items.map(item => (
                <NavLink
                  key={item.href}
                  item={item}
                  location={location}
                  onNavigate={onNavigate}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-[var(--border)] pt-4">
        <div className="mb-4 flex items-center justify-between px-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--text-faint)]">
            Appearance
          </p>
          <ThemeToggle />
        </div>
        {user ? (
          <div className="space-y-3">
            <Link href="/profile">
              <span
                onClick={onNavigate}
                className="flex cursor-pointer items-center gap-3 rounded-[14px] px-3 py-2.5 transition hover:bg-[var(--bg-elevated)]"
              >
                <Avatar className="h-9 w-9 rounded-[11px] border border-[var(--border)]">
                  <AvatarImage
                    src={avatarUrl}
                    alt={displayName}
                    className="object-cover"
                  />
                  <AvatarFallback className="rounded-[11px] bg-[var(--brand-subtle)] text-[var(--brand)]">
                    {displayName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-[var(--text-primary)]">
                    {displayName}
                  </p>
                  <p className="truncate text-xs text-[var(--text-muted)]">
                    {targetExam}
                  </p>
                </div>
              </span>
            </Link>

            <div className="flex items-center justify-between gap-3 px-3">
              <p className="truncate text-xs text-[var(--text-muted)]">
                {user.email}
              </p>
              <button
                type="button"
                onClick={() => {
                  onNavigate?.();
                  signOut();
                }}
                className="inline-flex h-8 w-8 items-center justify-center rounded-[10px] text-[var(--text-muted)] transition hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]"
                aria-label="Sign out"
              >
                <LogOut size={14} />
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3 px-3">
            <p className="text-sm leading-6 text-[var(--text-secondary)]">
              Sign in to keep your progress, bookmarks, and daily streak synced.
            </p>
            <Link href="/">
              <span
                onClick={onNavigate}
                className="btn-secondary inline-flex cursor-pointer px-4 py-2 text-sm"
              >
                Go to home
              </span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AppShell({
  children,
  contentClassName,
  shellClassName,
  allowDesktopSidebarToggle = false,
}: AppShellProps) {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  useEffect(() => {
    if (!allowDesktopSidebarToggle) return;

    const storedValue =
      typeof window !== "undefined"
        ? window.localStorage.getItem("prepbros-desktop-sidebar-open")
        : null;

    if (storedValue === "0") {
      setDesktopSidebarOpen(false);
    }
  }, [allowDesktopSidebarToggle]);

  useEffect(() => {
    if (!allowDesktopSidebarToggle || typeof window === "undefined") return;
    window.localStorage.setItem(
      "prepbros-desktop-sidebar-open",
      desktopSidebarOpen ? "1" : "0"
    );
  }, [allowDesktopSidebarToggle, desktopSidebarOpen]);

  const currentLabel = useMemo(() => {
    for (const group of NAV_GROUPS) {
      const match = group.items.find(item =>
        isActiveRoute(location, item.href)
      );
      if (match) return match.label;
    }
    return "PrepBros";
  }, [location]);

  const displayName =
    user?.user_metadata?.full_name?.split(" ")[0] ||
    user?.email?.split("@")[0] ||
    "Guest";
  const avatarUrl =
    user?.user_metadata?.avatar_url ||
    user?.user_metadata?.picture ||
    user?.user_metadata?.avatar ||
    "";

  return (
    <div
      className={cn("min-h-screen bg-[var(--page-background)]", shellClassName)}
    >
      <div
        className={cn(
          "lg:grid lg:min-h-screen",
          !allowDesktopSidebarToggle && "lg:grid-cols-[228px_minmax(0,1fr)]"
        )}
        style={
          allowDesktopSidebarToggle
            ? {
                gridTemplateColumns: desktopSidebarOpen
                  ? "228px minmax(0,1fr)"
                  : "0px minmax(0,1fr)",
              }
            : undefined
        }
      >
        <aside
          className={cn(
            "hidden bg-[var(--bg-card)]/90 backdrop-blur-xl lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col lg:overflow-hidden lg:transition-all lg:duration-300",
            allowDesktopSidebarToggle
              ? desktopSidebarOpen
                ? "border-r border-[var(--border)] px-3 py-4 opacity-100"
                : "pointer-events-none border-r-0 px-0 py-4 opacity-0"
              : "border-r border-[var(--border)] px-3 py-4"
          )}
        >
          <SidebarBody location={location} />
        </aside>

        <div className="relative min-w-0">
          {allowDesktopSidebarToggle ? (
            <button
              type="button"
              onClick={() => setDesktopSidebarOpen(current => !current)}
              className={cn(
                "absolute top-6 z-40 hidden h-11 w-11 items-center justify-center rounded-[16px] border border-[var(--border)] bg-[var(--bg-card-strong)] text-[var(--text-primary)] shadow-lg transition hover:border-[var(--border-strong)] hover:bg-[var(--bg-elevated)] lg:inline-flex",
                desktopSidebarOpen ? "-left-5" : "left-3"
              )}
              aria-label={desktopSidebarOpen ? "Hide sidebar" : "Show sidebar"}
            >
              <Menu size={18} />
            </button>
          ) : null}

          <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-[var(--bg-card)]/92 backdrop-blur-xl lg:hidden">
            <div className="flex items-center justify-between gap-3 px-4 py-3">
              <div className="flex min-w-0 items-center gap-3">
                <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                  <button
                    type="button"
                    onClick={() => setMobileOpen(true)}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-[12px] border border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-primary)]"
                    aria-label="Open navigation"
                  >
                    <Menu size={18} />
                  </button>
                  <SheetContent
                    side="left"
                    className="w-[84vw] max-w-[312px] border-r border-[var(--border)] bg-[var(--bg-card-strong)] p-3 text-[var(--text-primary)]"
                  >
                    <SidebarBody
                      location={location}
                      onNavigate={() => setMobileOpen(false)}
                    />
                  </SheetContent>
                </Sheet>

                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--text-faint)]">
                    Workspace
                  </p>
                  <p className="truncate text-sm font-medium text-[var(--text-primary)]">
                    {currentLabel}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <ThemeToggle />
                <Link href={user ? "/profile" : "/"}>
                  <span className="flex cursor-pointer items-center rounded-[12px] border border-[var(--border)] bg-[var(--bg-card)] p-1.5">
                    <Avatar className="h-8 w-8 rounded-[10px]">
                      <AvatarImage
                        src={avatarUrl}
                        alt={displayName}
                        className="object-cover"
                      />
                      <AvatarFallback className="rounded-[10px] bg-[var(--brand-subtle)] text-[var(--brand)]">
                        {displayName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </span>
                </Link>
              </div>
            </div>
          </header>

          <main className="px-4 py-4 md:px-6 md:py-5 lg:px-8 lg:py-7">
            <div
              className={cn("mx-auto w-full max-w-[1280px]", contentClassName)}
            >
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
