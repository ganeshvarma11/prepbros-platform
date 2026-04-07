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
  Bell,
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
import { useSwipeable } from "@/hooks/useSwipeable";
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
const DESKTOP_BREAKPOINT = 1024;

const NAV_GROUPS: NavGroup[] = [
  {
    label: "Workspace",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/practice", label: "Practice", icon: BookOpen },
      { href: "/updates", label: "Updates", icon: Bell },
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
          "group relative flex cursor-pointer items-center rounded-[14px] border text-[14px] transition-all",
          collapsed ? "justify-center px-0 py-2.5" : "gap-3 px-3.5 py-2.5",
          active
            ? "border-[var(--border)] bg-[var(--surface-elevated)] font-semibold text-[var(--text-1)] shadow-[var(--shadow-sm)]"
            : "border-transparent text-[var(--text-2)] hover:border-[var(--border-soft)] hover:bg-[var(--surface-2)] hover:text-[var(--text-1)]"
        )}
        title={collapsed ? item.label : undefined}
      >
        <span
          className={cn(
            "absolute left-0 top-[8px] bottom-[8px] w-[2px] rounded-full transition",
            active ? "bg-[var(--brand)]" : "bg-transparent"
          )}
        />
        <span className="flex h-4 w-4 shrink-0 items-center justify-center">
          <Icon size={16} className="text-current" />
        </span>
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
    <div className="relative flex h-full min-h-0 flex-col overflow-hidden border-r border-[var(--border-soft)] bg-[var(--sidebar-bg)] px-3 py-4 backdrop-blur-xl">
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
            "mt-4 inline-flex h-10 w-full items-center justify-center rounded-[14px] border border-[var(--border-soft)] bg-[var(--surface-2)] text-[var(--text-2)] transition hover:border-[var(--border)] hover:bg-[var(--surface-1)] hover:text-[var(--text-1)]",
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

        <div className="min-h-0 flex-1 space-y-6 overflow-y-auto py-5 pr-1">
          {NAV_GROUPS.map(group => (
            <div key={group.label}>
              {!collapsed ? (
                <p className="section-label px-3 text-[var(--text-3)]">
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

      <div className="space-y-3 border-t border-[var(--border-soft)] pt-4">
        <NavLink
          item={SUPPORT_ITEM}
          location={location}
          collapsed={collapsed}
          onNavigate={onNavigate}
        />

        <div
          className={cn(
            "flex items-center rounded-[14px] border border-[var(--border-soft)] bg-[var(--surface-1)]",
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
              "flex items-center rounded-[14px] border border-transparent transition hover:border-[var(--border-soft)] hover:bg-[var(--surface-1)]",
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
                  className="inline-flex h-8 w-8 items-center justify-center rounded-[10px] text-[var(--text-3)] transition hover:bg-[var(--surface-3)] hover:text-[var(--text-1)]"
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
  const [isDesktopViewport, setIsDesktopViewport] = useState(false);
  const lastExpandedWidthRef = useRef(SIDEBAR_DEFAULT_WIDTH);
  const resizeAnchorWidthRef = useRef(SIDEBAR_DEFAULT_WIDTH);
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

    const mediaQuery = window.matchMedia(
      `(min-width: ${DESKTOP_BREAKPOINT}px)`
    );
    const updateViewport = () => setIsDesktopViewport(mediaQuery.matches);

    updateViewport();
    mediaQuery.addEventListener("change", updateViewport);

    return () => mediaQuery.removeEventListener("change", updateViewport);
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
    resizeAnchorWidthRef.current = sidebarWidth;
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
  const desktopContentOffset = !isDesktopViewport
    ? 0
    : isResizing
      ? resizeAnchorWidthRef.current - sidebarWidth
      : Math.min(0, SIDEBAR_DEFAULT_WIDTH - sidebarWidth);
  const mobileNavSwipe = useSwipeable({
    axis: "x",
    enabled: mobileOpen,
    mouse: true,
    minDistance: 58,
    resistance: 0.65,
    onSwipeLeft: () => setMobileOpen(false),
  });

  return (
    <div className={cn("min-h-screen bg-[var(--bg)]", shellClassName)}>
      <div className="layout">
        <aside
          className="group relative hidden h-screen shrink-0 self-start lg:sticky lg:top-0 lg:flex"
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
          <header className="sticky top-0 z-30 border-b border-[var(--border-soft)] bg-[var(--navbar-bg)] backdrop-blur-xl lg:hidden">
            <div className="flex items-center justify-between gap-3 px-4 py-3">
              <div className="flex min-w-0 items-center gap-3">
                <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                  <button
                    type="button"
                    onClick={() => setMobileOpen(true)}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-[12px] border border-[var(--border)] bg-[var(--surface-1)] text-[var(--text-1)]"
                    aria-label="Open navigation"
                  >
                    <Menu size={18} />
                  </button>
                  <SheetContent
                    side="left"
                    className="w-[84vw] max-w-[312px] border-r border-[var(--border-1)] bg-[var(--surface-1)] p-3 text-[var(--text-1)]"
                  >
                    <div
                      {...mobileNavSwipe.bind}
                      className="h-full transition-[transform,opacity] duration-200"
                      style={{
                        transform: `translateX(${Math.min(0, mobileNavSwipe.offsetX)}px)`,
                        opacity: mobileNavSwipe.isDragging
                          ? Math.max(
                              0.74,
                              1 - Math.abs(mobileNavSwipe.offsetX) / 220
                            )
                          : 1,
                        touchAction: mobileNavSwipe.touchAction,
                        transition: mobileNavSwipe.isDragging
                          ? "none"
                          : "transform 200ms cubic-bezier(0.4,0,0.2,1), opacity 200ms cubic-bezier(0.4,0,0.2,1)",
                      }}
                    >
                      <SidebarBody
                        location={location}
                        collapsed={false}
                        onNavigate={() => setMobileOpen(false)}
                      />
                    </div>
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
                  <span className="flex cursor-pointer items-center rounded-[14px] border border-[var(--border)] bg-[var(--surface-1)] p-1.5">
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
            <div
              className={cn("page-shell", contentClassName)}
              style={{
                marginLeft: desktopContentOffset
                  ? `${desktopContentOffset}px`
                  : undefined,
              }}
            >
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
