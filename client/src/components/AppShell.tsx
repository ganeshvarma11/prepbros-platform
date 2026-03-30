import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
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

const SIDEBAR_STORAGE_KEY = "sb-width";
const SIDEBAR_DEFAULT_WIDTH = 240;
const SIDEBAR_MIN_WIDTH = 60;
const SIDEBAR_MAX_WIDTH = 320;

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
    ],
  },
  {
    label: "Account",
    items: [{ href: "/profile", label: "Profile", icon: UserCircle2 }],
  },
];

const SUPPORT_ITEM: NavItem = {
  href: "/support",
  label: "Support",
  icon: CircleHelp,
};
const BRAND_ICON_SRC = "/assets/prepbros-favicon.svg";

const isActiveRoute = (location: string, href: string) =>
  location === href || (href !== "/" && location.startsWith(`${href}/`));

const clampSidebarWidth = (value: number) =>
  Math.min(SIDEBAR_MAX_WIDTH, Math.max(SIDEBAR_MIN_WIDTH, Math.round(value)));

const getInitials = (value: string) =>
  value
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase() || "")
    .join("") || "PB";

function NavLink({
  item,
  location,
  collapsed,
  onNavigate,
}: {
  item: NavItem;
  location: string;
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  const Icon = item.icon;
  const active = isActiveRoute(location, item.href);
  return (
    <Link href={item.href}>
      <span
        onClick={onNavigate}
        className={cn(
          "group relative flex cursor-pointer items-center rounded-[18px] border text-[14px] transition-all",
          collapsed ? "justify-center px-0 py-3" : "gap-3 px-4 py-3",
          active
            ? "border-[var(--border-2)] bg-[var(--surface-2)] font-semibold text-[var(--text-1)] shadow-[var(--shadow-sm)]"
            : "border-transparent text-[var(--text-1)] hover:border-[var(--border-1)] hover:bg-[var(--surface-2)] hover:text-[var(--text-1)]"
        )}
        title={collapsed ? item.label : undefined}
      >
        <span
          className={cn(
            "absolute left-[10px] top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full transition",
            active ? "bg-[var(--brand)]" : "bg-transparent"
          )}
        />
        <Icon size={16} className="shrink-0 text-current" />
        {!collapsed ? <span className="truncate">{item.label}</span> : null}
      </span>
    </Link>
  );
}

function SidebarBody({
  location,
  collapsed,
  onToggle,
  onResizeStart,
  isResizing = false,
  onNavigate,
}: {
  location: string;
  collapsed: boolean;
  onToggle?: () => void;
  onResizeStart?: (event: ReactPointerEvent<HTMLButtonElement>) => void;
  isResizing?: boolean;
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
  const initials = getInitials(displayName);

  return (
    <div className="relative flex h-full flex-col border-r border-[var(--border-2)] bg-[linear-gradient(180deg,rgba(250,251,253,0.98)_0%,rgba(243,246,251,0.96)_100%)] px-3 py-4 shadow-[var(--shadow-md)] backdrop-blur-xl dark:border-[var(--border-1)] dark:bg-[color:rgba(2,6,23,0.42)] dark:shadow-none">
      <div className={cn("pb-4", collapsed ? "px-0" : "px-1")}>
        {collapsed ? (
          <Link href="/">
            <span className="flex cursor-pointer justify-center">
              <img
                src={BRAND_ICON_SRC}
                alt="PrepBros"
                className="h-9 w-9 rounded-[12px]"
              />
            </span>
          </Link>
        ) : (
          <BrandLogo
            compact
            className="items-center"
            textClassName="text-[1.4rem]"
          />
        )}
        <button
          type="button"
          onClick={onToggle}
          className={cn(
            "mt-4 inline-flex h-10 w-full items-center justify-center rounded-full border border-transparent bg-[var(--surface-2)] text-[var(--text-2)] shadow-[var(--shadow-sm)] transition hover:bg-[var(--surface-1)] hover:text-[var(--text-1)]",
            collapsed ? "px-0" : "gap-2 px-3"
          )}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          {!collapsed ? (
            <span className="text-[13px] font-medium">Collapse</span>
          ) : null}
        </button>
      </div>

        <div className="flex-1 space-y-6 overflow-y-auto py-5 pr-1">
          {NAV_GROUPS.map(group => (
            <div key={group.label}>
              {!collapsed ? (
                <p className="section-label px-3 text-[var(--text-2)]">
                  {group.label}
                </p>
              ) : null}
            <div className="mt-2 space-y-1">
              {group.items.map(item => (
                <NavLink
                  key={item.href}
                  item={item}
                  location={location}
                  collapsed={collapsed}
                  onNavigate={onNavigate}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-3 border-t border-[var(--border-1)] pt-4">
        <NavLink
          item={SUPPORT_ITEM}
          location={location}
          collapsed={collapsed}
          onNavigate={onNavigate}
        />

        <div
          className={cn(
            "flex items-center rounded-[18px] border border-[var(--border-1)] bg-[var(--surface-1)] shadow-[var(--shadow-sm)]",
            collapsed
              ? "justify-center px-0 py-2.5"
              : "justify-between px-3 py-2.5"
          )}
        >
          {!collapsed ? <p className="section-label">Appearance</p> : null}
          <ThemeToggle />
        </div>

        {user ? (
          <div
            className={cn(
              "flex items-center rounded-[18px] border border-transparent transition hover:border-[var(--border-1)] hover:bg-[var(--surface-1)]",
              collapsed ? "justify-center px-0 py-2.5" : "gap-3 px-3 py-2.5"
            )}
          >
            <Link href="/profile">
              <span
                onClick={onNavigate}
                className={cn(
                  "flex cursor-pointer items-center",
                  collapsed ? "justify-center" : "min-w-0 flex-1 gap-3"
                )}
              >
                <Avatar className="h-8 w-8 rounded-full">
                  <AvatarImage
                    src={avatarUrl}
                    alt={displayName}
                    className="object-cover"
                  />
                  <AvatarFallback className="rounded-full bg-[var(--surface-3)] text-[13px] font-medium text-[var(--brand)]">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                {!collapsed ? (
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-medium text-[var(--text-1)]">
                      {displayName}
                    </p>
                    <p className="truncate text-[11px] text-[var(--text-3)]">
                      {targetExam}
                    </p>
                  </div>
                ) : null}
              </span>
            </Link>
            {!collapsed ? (
              <>
                <button
                  type="button"
                  onClick={() => {
                    onNavigate?.();
                    signOut();
                  }}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)] text-[var(--text-3)] transition hover:bg-[var(--surface-3)] hover:text-[var(--text-1)]"
                  aria-label="Sign out"
                  title="Sign out"
                >
                  <LogOut size={14} />
                </button>
              </>
            ) : null}
          </div>
        ) : (
          <div className={cn("space-y-3", collapsed ? "px-0" : "px-3")}>
            {!collapsed ? (
              <p className="text-sm leading-6 text-[var(--text-2)]">
                Sign in to keep your progress, bookmarks, and daily streak
                synced.
              </p>
            ) : null}
            <Link href="/">
              <span
                onClick={onNavigate}
                className={cn(
                  "btn-ghost inline-flex cursor-pointer",
                  collapsed ? "h-9 w-9 p-0" : "px-4 py-2 text-sm"
                )}
                title="Go to home"
              >
                {collapsed ? <ChevronRight size={14} /> : "Go to home"}
              </span>
            </Link>
          </div>
        )}
      </div>

      {onResizeStart ? (
        <button
          type="button"
          onPointerDown={onResizeStart}
          className="absolute inset-y-0 right-[-7px] hidden w-4 cursor-col-resize lg:block"
          aria-label="Resize sidebar"
          tabIndex={-1}
        >
          <span
            className={cn(
              "absolute inset-y-0 left-1/2 w-[2px] -translate-x-1/2 rounded-full bg-transparent transition",
              isResizing && "bg-[var(--border-2)]",
              "group-hover:bg-[var(--border-2)]"
            )}
          />
        </button>
      ) : null}
    </div>
  );
}

export default function AppShell({
  children,
  contentClassName,
  shellClassName,
  allowDesktopSidebarToggle,
}: AppShellProps) {
  void allowDesktopSidebarToggle;
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(SIDEBAR_DEFAULT_WIDTH);
  const [isResizing, setIsResizing] = useState(false);
  const lastExpandedWidthRef = useRef(SIDEBAR_DEFAULT_WIDTH);
  const { user } = useAuth();

  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const storedValue = window.localStorage.getItem(SIDEBAR_STORAGE_KEY);
    if (!storedValue) return;

    const parsed = Number.parseInt(storedValue, 10);
    if (!Number.isFinite(parsed)) return;

    const nextWidth = clampSidebarWidth(parsed);
    setSidebarWidth(nextWidth);
    if (nextWidth > SIDEBAR_MIN_WIDTH) {
      lastExpandedWidthRef.current = nextWidth;
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(SIDEBAR_STORAGE_KEY, String(sidebarWidth));
    if (sidebarWidth > SIDEBAR_MIN_WIDTH) {
      lastExpandedWidthRef.current = sidebarWidth;
    }
  }, [sidebarWidth]);

  const collapsed = sidebarWidth <= SIDEBAR_MIN_WIDTH;

  const toggleSidebar = () => {
    setSidebarWidth(current =>
      current <= SIDEBAR_MIN_WIDTH
        ? clampSidebarWidth(
            lastExpandedWidthRef.current || SIDEBAR_DEFAULT_WIDTH
          )
        : SIDEBAR_MIN_WIDTH
    );
  };

  const startResize = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (typeof window === "undefined") return;

    event.preventDefault();
    const startX = event.clientX;
    const initialWidth = sidebarWidth;
    setIsResizing(true);
    document.body.style.userSelect = "none";
    document.body.style.cursor = "col-resize";

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const delta = moveEvent.clientX - startX;
      setSidebarWidth(clampSidebarWidth(initialWidth + delta));
    };

    const handlePointerUp = () => {
      setIsResizing(false);
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
  };

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
    <div className={cn("min-h-screen bg-[var(--bg)]", shellClassName)}>
      <div className="layout">
        <aside
          className="group relative hidden shrink-0 lg:flex"
          style={{
            width: `${sidebarWidth}px`,
            transition: isResizing
              ? "none"
              : "width 0.22s cubic-bezier(0.4,0,0.2,1)",
          }}
        >
          <SidebarBody
            location={location}
            collapsed={collapsed}
            onToggle={toggleSidebar}
            onResizeStart={startResize}
            isResizing={isResizing}
          />
        </aside>

        <div className="relative min-w-0 flex-1">
          <header className="sticky top-0 z-30 border-b border-[var(--border-1)] bg-[color:rgba(247,250,252,0.72)] backdrop-blur-xl dark:bg-[color:rgba(8,15,29,0.72)] lg:hidden">
            <div className="flex items-center justify-between gap-3 px-4 py-3">
              <div className="flex min-w-0 items-center gap-3">
                <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                  <button
                    type="button"
                    onClick={() => setMobileOpen(true)}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border-1)] bg-[var(--surface-1)] text-[var(--text-1)] shadow-[var(--shadow-sm)]"
                    aria-label="Open navigation"
                  >
                    <Menu size={18} />
                  </button>
                  <SheetContent
                    side="left"
                    className="w-[84vw] max-w-[312px] border-r border-[var(--border-1)] bg-[var(--surface-1)] p-3 text-[var(--text-1)]"
                  >
                    <SidebarBody
                      location={location}
                      collapsed={false}
                      onNavigate={() => setMobileOpen(false)}
                    />
                  </SheetContent>
                </Sheet>

                <div className="min-w-0">
                  <p className="page-label">Workspace</p>
                  <p className="truncate text-sm font-medium text-[var(--text-1)]">
                    {currentLabel}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <ThemeToggle />
                <Link href={user ? "/profile" : "/"}>
                  <span className="flex cursor-pointer items-center rounded-full border border-[var(--border-1)] bg-[var(--surface-1)] p-1.5 shadow-[var(--shadow-sm)]">
                    <Avatar className="h-8 w-8 rounded-full">
                      <AvatarImage
                        src={avatarUrl}
                        alt={displayName}
                        className="object-cover"
                      />
                      <AvatarFallback className="rounded-full bg-[var(--surface-3)] text-[13px] font-medium text-[var(--brand)]">
                        {getInitials(displayName)}
                      </AvatarFallback>
                    </Avatar>
                  </span>
                </Link>
              </div>
            </div>
          </header>

          <main className="main">
            <div className={cn("page-shell", contentClassName)}>{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
