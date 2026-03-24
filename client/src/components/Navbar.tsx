import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import {
  ArrowRight,
  Check,
  LayoutDashboard,
  LogOut,
  Menu,
  Monitor,
  Moon,
  Sun,
  User,
  X,
} from "lucide-react";

import AuthModal from "@/components/AuthModal";
import BrandLogo from "@/components/BrandLogo";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme, type Theme } from "@/contexts/ThemeContext";
import { trackEvent } from "@/lib/analytics";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const DEFAULT_NAV_LINKS = [
  { href: "/practice", label: "Practice" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/#review-system", label: "Review", anchor: true },
  { href: "/support", label: "Support" },
];

const LANDING_NAV_LINKS = [
  { href: "/practice", label: "Practice" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/#review-system", label: "Review", anchor: true },
];

interface NavbarProps {
  variant?: "default" | "landing";
}

export default function Navbar({ variant = "default" }: NavbarProps) {
  const isLanding = variant === "landing";
  const navLinks = isLanding ? LANDING_NAV_LINKS : DEFAULT_NAV_LINKS;

  const [isOpen, setIsOpen] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [authTab, setAuthTab] = useState<"login" | "signup">("login");
  const [scrolled, setScrolled] = useState(false);
  const { user, signOut } = useAuth();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [location] = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const openLogin = () => {
    trackEvent("auth_login_opened", { source: "navbar", variant });
    setAuthTab("login");
    setShowAuth(true);
    setIsOpen(false);
  };

  const openSignup = () => {
    trackEvent("auth_signup_opened", { source: "navbar", variant });
    setAuthTab("signup");
    setShowAuth(true);
    setIsOpen(false);
  };

  const activeRoute = (href: string) =>
    location === href || (href !== "/" && location.startsWith(`${href}/`));

  const displayName =
    user?.user_metadata?.full_name?.split(" ")[0] || user?.email?.split("@")[0] || "Aspirant";

  const themeOptions: Array<{ value: Theme; label: string; icon: typeof Sun }> = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
    { value: "system", label: "System", icon: Monitor },
  ];

  const selectedThemeLabel = themeOptions.find((option) => option.value === theme)?.label || "System";
  const navSurfaceClassName = isLanding
    ? "border border-[var(--border)] bg-[rgba(255,255,255,0.03)] text-[var(--text-primary)]"
    : "border border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text-primary)]";

  return (
    <>
      <nav
        className={cn(
          "navbar transition-all duration-300",
          scrolled && "shadow-[0_24px_70px_-40px_rgba(0,0,0,0.95)]",
        )}
      >
        <div
          className={cn(
            "container-shell flex items-center justify-between gap-4 py-4",
            isLanding ? "min-h-[84px]" : "min-h-[88px]",
          )}
        >
          <BrandLogo compact className="shrink-0" textClassName="text-[1.5rem] md:text-[1.7rem]" />

          <div className="hidden items-center gap-10 lg:flex">
            {navLinks.map((item) =>
              item.anchor ? (
                <a
                  key={item.label}
                  href={item.href}
                  className="text-lg font-medium text-[var(--text-secondary)] transition hover:text-[var(--text-primary)]"
                >
                  {item.label}
                </a>
              ) : (
                <Link key={item.href} href={item.href}>
                  <span
                    className={cn(
                      "cursor-pointer text-lg font-medium text-[var(--text-secondary)] transition hover:text-[var(--text-primary)]",
                      activeRoute(item.href) && "text-[var(--text-primary)]",
                    )}
                  >
                    {item.label}
                  </span>
                </Link>
              ),
            )}
          </div>

          {isLanding ? (
            <div className="hidden items-center gap-3 md:flex">
              {user ? (
                <>
                  <Link href="/profile">
                    <span
                      className={`inline-flex cursor-pointer items-center gap-3 rounded-[16px] px-4 py-3 text-sm font-medium transition hover:border-[var(--border-strong)] ${navSurfaceClassName}`}
                    >
                      <span className="flex h-9 w-9 items-center justify-center rounded-[12px] bg-[rgba(255,255,255,0.05)] text-sm font-semibold text-[var(--text-primary)]">
                        {displayName.charAt(0).toUpperCase()}
                      </span>
                      <span className="max-w-28 truncate">{displayName}</span>
                    </span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => signOut()}
                    className={`inline-flex h-12 w-12 items-center justify-center rounded-[16px] text-[var(--text-secondary)] transition hover:border-[var(--border-strong)] hover:text-[var(--text-primary)] ${navSurfaceClassName}`}
                    aria-label="Sign out"
                  >
                    <LogOut size={18} />
                  </button>
                </>
              ) : (
                <div className="overflow-hidden rounded-[18px] border border-[var(--border)] bg-[rgba(255,255,255,0.03)]">
                  <button
                    type="button"
                    onClick={openLogin}
                    className="px-7 py-3.5 text-lg font-medium text-[var(--text-primary)] transition hover:bg-[rgba(255,255,255,0.03)]"
                  >
                    Login
                  </button>
                  <button
                    type="button"
                    onClick={openSignup}
                    className="border-l border-[var(--border)] bg-[rgba(255,255,255,0.03)] px-7 py-3.5 text-lg font-medium text-[var(--text-primary)] transition hover:bg-[rgba(255,255,255,0.06)]"
                  >
                    Start
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden items-center gap-4 md:flex">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className={`inline-flex h-12 items-center justify-center gap-2 rounded-[14px] px-3.5 text-sm font-medium transition hover:border-[var(--border-strong)] ${navSurfaceClassName}`}
                    aria-label="Theme settings"
                  >
                    {resolvedTheme === "dark" ? <Moon size={16} /> : <Sun size={16} />}
                    <span className="hidden lg:inline">{selectedThemeLabel}</span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-44 rounded-[16px] border-[var(--border)] bg-[var(--bg-card)] p-2 text-[var(--text-primary)] backdrop-blur-xl"
                >
                  <DropdownMenuLabel className="text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">
                    Theme
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-[var(--border)]" />
                  <DropdownMenuRadioGroup value={theme} onValueChange={(value) => setTheme(value as Theme)}>
                    {themeOptions.map((option) => {
                      const Icon = option.icon;
                      return (
                        <DropdownMenuRadioItem
                          key={option.value}
                          value={option.value}
                          className="rounded-[12px] px-3 py-2 text-sm text-[var(--text-primary)]"
                        >
                          <Icon size={15} className="text-[var(--text-muted)]" />
                          {option.label}
                        </DropdownMenuRadioItem>
                      );
                    })}
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>

              {user ? (
                <>
                  <Link href="/profile">
                    <span
                      className={`inline-flex cursor-pointer items-center gap-3 rounded-[14px] px-3 py-2.5 text-sm font-medium transition hover:border-[var(--border-strong)] ${navSurfaceClassName}`}
                    >
                      <span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[var(--bg-muted)] text-sm font-semibold text-[var(--text-primary)]">
                        {displayName.charAt(0).toUpperCase()}
                      </span>
                      <span className="max-w-28 truncate">{displayName}</span>
                    </span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => signOut()}
                    className={`inline-flex h-12 w-12 items-center justify-center rounded-[14px] text-[var(--text-secondary)] transition hover:border-[var(--border-strong)] hover:text-[var(--text-primary)] ${navSurfaceClassName}`}
                    aria-label="Sign out"
                  >
                    <LogOut size={18} />
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={openLogin}
                    className={`inline-flex items-center justify-center rounded-[14px] px-7 py-3 text-lg font-medium transition hover:border-[var(--border-strong)] ${navSurfaceClassName}`}
                  >
                    Login
                  </button>
                  <button
                    type="button"
                    onClick={openSignup}
                    className="inline-flex items-center justify-center rounded-[14px] bg-[linear-gradient(180deg,#ff9838_0%,#ff7a12_100%)] px-8 py-3 text-lg font-medium text-white shadow-[0_18px_40px_-24px_rgba(255,122,18,0.9)] transition hover:brightness-105"
                  >
                    Start Free
                  </button>
                </>
              )}
            </div>
          )}

          <div className="flex items-center gap-2 md:hidden">
            <button
              type="button"
              onClick={() => setIsOpen((value) => !value)}
              className={`flex h-11 w-11 items-center justify-center rounded-[14px] ${navSurfaceClassName}`}
              aria-label="Open menu"
            >
              {isOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {isOpen ? (
          <div className="border-t border-[var(--border)] bg-[var(--bg-base)] px-4 pb-5 pt-4 md:hidden">
            <div className="container-shell space-y-4">
              <div className="grid gap-2">
                {navLinks.map((item) =>
                  item.anchor ? (
                    <a
                      key={item.label}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={`inline-flex items-center gap-3 rounded-[14px] px-4 py-3 text-sm font-medium ${navSurfaceClassName}`}
                    >
                      <LayoutDashboard size={16} className="text-[var(--brand)]" />
                      {item.label}
                    </a>
                  ) : (
                    <Link key={item.href} href={item.href}>
                      <span
                        onClick={() => setIsOpen(false)}
                        className={cn(
                          "inline-flex cursor-pointer items-center gap-3 rounded-[14px] border px-4 py-3 text-sm font-medium transition",
                          activeRoute(item.href)
                            ? "border-[var(--brand-muted)] bg-[var(--brand-subtle)] text-[var(--brand-light)]"
                            : navSurfaceClassName,
                        )}
                      >
                        <LayoutDashboard size={16} className="text-[var(--brand)]" />
                        {item.label}
                      </span>
                    </Link>
                  ),
                )}
              </div>

              <div className={`rounded-[18px] p-4 ${navSurfaceClassName}`}>
                <div className="mb-3">
                  <p className="text-sm font-semibold text-[var(--text-primary)]">
                    {user
                      ? `Welcome back, ${displayName}`
                      : isLanding
                        ? "Practice daily. Track progress. Keep it simple."
                        : "Start your daily practice loop"}
                  </p>
                  <p className="mt-1 text-xs text-[var(--text-muted)]">
                    {user
                      ? "Your dashboard and review flow are ready."
                      : "Sign in to save progress, bookmarks, and your daily momentum."}
                  </p>
                </div>

                {!isLanding ? (
                  <div className="mb-3">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
                      Theme
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {themeOptions.map((option) => {
                        const Icon = option.icon;
                        const selected = theme === option.value;

                        return (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => setTheme(option.value)}
                            className={cn(
                              "inline-flex items-center justify-center gap-1.5 rounded-[12px] border px-3 py-2 text-xs font-medium transition",
                              selected
                                ? "border-[var(--brand-muted)] bg-[var(--brand-subtle)] text-[var(--brand-light)]"
                                : "border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-secondary)]",
                            )}
                          >
                            <Icon size={13} />
                            {option.label}
                            {selected ? <Check size={12} /> : null}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : null}

                {user ? (
                  <div className="grid gap-2">
                    <Link href="/profile">
                      <span
                        onClick={() => setIsOpen(false)}
                        className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-[12px] border border-[var(--border)] bg-[var(--bg-card)] px-4 py-2.5 text-sm font-medium text-[var(--text-primary)]"
                      >
                        <User size={14} />
                        Profile
                      </span>
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        setIsOpen(false);
                        signOut();
                      }}
                      className="inline-flex items-center justify-center gap-2 rounded-[12px] border border-[var(--red)]/30 bg-[var(--red-bg)] px-4 py-2.5 text-sm font-medium text-[var(--red)]"
                    >
                      <LogOut size={14} />
                      Sign out
                    </button>
                  </div>
                ) : (
                  <div className="grid gap-2">
                    <button
                      type="button"
                      onClick={openSignup}
                      className={cn(
                        "inline-flex items-center justify-center gap-2 rounded-[12px] px-4 py-3 text-sm font-medium text-white",
                        isLanding
                          ? "bg-[rgba(255,255,255,0.06)]"
                          : "bg-[linear-gradient(180deg,#ff9838_0%,#ff7a12_100%)]",
                      )}
                    >
                      <ArrowRight size={14} />
                      {isLanding ? "Start" : "Start free"}
                    </button>
                    <button
                      type="button"
                      onClick={openLogin}
                      className="inline-flex items-center justify-center rounded-[12px] border border-[var(--border)] bg-[var(--bg-card)] px-4 py-3 text-sm font-medium text-[var(--text-primary)]"
                    >
                      Login
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </nav>

      <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} defaultTab={authTab} />
    </>
  );
}
