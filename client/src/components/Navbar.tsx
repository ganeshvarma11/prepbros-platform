import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import {
  ArrowRight,
  BookOpen,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Sun,
  User,
  X,
} from "lucide-react";

import AuthModal from "@/components/AuthModal";
import BrandLogo from "@/components/BrandLogo";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { trackEvent } from "@/lib/analytics";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/practice", label: "Practice" },
  { href: "/explore", label: "Exam tracks" },
  { href: "/resources", label: "Resources" },
];

const MOBILE_SECONDARY_LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/contests", label: "Contests" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/premium", label: "Premium" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [authTab, setAuthTab] = useState<"login" | "signup">("login");
  const [scrolled, setScrolled] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { user, signOut } = useAuth();
  const [location] = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const openLogin = () => {
    trackEvent("auth_login_opened", { source: "navbar" });
    setAuthTab("login");
    setShowAuth(true);
    setIsOpen(false);
  };

  const openSignup = () => {
    trackEvent("auth_signup_opened", { source: "navbar" });
    setAuthTab("signup");
    setShowAuth(true);
    setIsOpen(false);
  };

  const activeRoute = (href: string) =>
    location === href || (href !== "/" && location.startsWith(`${href}/`));

  const displayName =
    user?.user_metadata?.full_name?.split(" ")[0] || user?.email?.split("@")[0] || "Aspirant";

  return (
    <>
      <nav
        className={cn(
          "navbar transition-all duration-200",
          scrolled && "shadow-[0_20px_60px_-36px_rgba(0,0,0,0.82)]",
        )}
      >
        <div className="container-shell flex min-h-[72px] items-center justify-between gap-4 py-3">
          <div className="flex items-center gap-4">
            <BrandLogo compact />
            <div className="hidden items-center gap-1 rounded-[16px] border border-[var(--border)] bg-[linear-gradient(180deg,rgba(255,255,255,0.04)_0%,rgba(255,255,255,0.02)_100%)] p-1 lg:flex">
              {NAV_LINKS.map((item) => (
                <Link key={item.href} href={item.href}>
                  <span
                    className={cn("nav-link cursor-pointer", activeRoute(item.href) && "active")}
                  >
                    {item.label}
                  </span>
                </Link>
              ))}
            </div>
            <div className="hidden xl:flex">
              <span className="rounded-full border border-[var(--border)] bg-[var(--bg-card)]/80 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
                UPSC • SSC • State exams
              </span>
            </div>
          </div>

          <div className="hidden items-center gap-2 md:flex">
            <button
              type="button"
              onClick={toggleTheme}
              className="flex h-10 w-10 items-center justify-center rounded-[12px] border border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-secondary)] transition hover:border-[var(--brand-muted)] hover:text-[var(--text-primary)]"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            {user ? (
              <>
                <Link href="/dashboard">
                  <span className="inline-flex cursor-pointer items-center gap-2 rounded-[12px] border border-[var(--border)] bg-[linear-gradient(180deg,rgba(255,255,255,0.04)_0%,rgba(255,255,255,0.02)_100%)] px-4 py-2 text-sm font-medium text-[var(--text-primary)] transition hover:border-[var(--brand-muted)]">
                    <LayoutDashboard size={14} className="text-[var(--brand)]" />
                    Dashboard
                  </span>
                </Link>
                <Link href="/profile">
                  <span className="inline-flex cursor-pointer items-center gap-3 rounded-[12px] border border-[var(--border)] bg-[var(--bg-card)] px-3 py-2 transition hover:border-[var(--brand-muted)]">
                    <span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[var(--brand-subtle)] text-sm font-semibold text-[var(--brand-light)]">
                      {displayName.charAt(0).toUpperCase()}
                    </span>
                    <span className="max-w-28 truncate text-sm font-medium text-[var(--text-primary)]">
                      {displayName}
                    </span>
                  </span>
                </Link>
                <button
                  type="button"
                  onClick={() => signOut()}
                  className="flex h-10 w-10 items-center justify-center rounded-[12px] border border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-secondary)] transition hover:border-[var(--red)] hover:text-[var(--red)]"
                  aria-label="Sign out"
                >
                  <LogOut size={16} />
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={openLogin}
                  className="btn-secondary rounded-[12px] px-5"
                >
                  Log in
                </button>
                <button
                  type="button"
                  onClick={openSignup}
                  className="btn-primary rounded-[12px] px-5"
                >
                  Start free
                </button>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <button
              type="button"
              onClick={toggleTheme}
              className="flex h-10 w-10 items-center justify-center rounded-[12px] border border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-secondary)]"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <button
              type="button"
              onClick={() => setIsOpen((value) => !value)}
              className="flex h-10 w-10 items-center justify-center rounded-[12px] border border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-primary)]"
              aria-label="Open menu"
            >
              {isOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {isOpen ? (
          <div className="border-t border-[var(--border)] bg-[var(--bg-card)]/95 px-4 pb-5 pt-4 md:hidden">
            <div className="container-shell space-y-4">
              <div className="grid gap-2">
                {NAV_LINKS.map((item) => (
                  <Link key={item.href} href={item.href}>
                    <span
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        "inline-flex cursor-pointer items-center gap-3 rounded-[14px] border px-4 py-3 text-sm font-medium transition",
                        activeRoute(item.href)
                          ? "border-[var(--brand-muted)] bg-[var(--brand-subtle)] text-[var(--brand-light)]"
                          : "border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-primary)]",
                      )}
                    >
                      <BookOpen size={16} className="text-[var(--brand)]" />
                      {item.label}
                    </span>
                  </Link>
                ))}
              </div>

              <div className="grid gap-2">
                {MOBILE_SECONDARY_LINKS.map((item) => (
                  <Link key={item.href} href={item.href}>
                    <span
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        "inline-flex cursor-pointer items-center gap-3 rounded-[14px] border px-4 py-3 text-sm font-medium transition",
                        activeRoute(item.href)
                          ? "border-[var(--brand-muted)] bg-[var(--brand-subtle)] text-[var(--brand-light)]"
                          : "border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-primary)]",
                      )}
                    >
                      <LayoutDashboard size={16} className="text-[var(--brand)]" />
                      {item.label}
                    </span>
                  </Link>
                ))}
              </div>

              <div className="rounded-[18px] border border-[var(--border)] bg-[var(--bg-subtle)] p-4">
                <div className="mb-3">
                  <p className="text-sm font-semibold text-[var(--text-primary)]">
                    {user ? `Welcome back, ${displayName}` : "Practice with momentum"}
                  </p>
                  <p className="mt-1 text-xs text-[var(--text-muted)]">
                    {user
                      ? "Your dashboard, streaks, and review history are ready."
                      : "Sign in to save progress, keep streaks, and unlock smarter review."}
                  </p>
                </div>

                {user ? (
                  <div className="grid gap-2">
                    <Link href="/dashboard">
                      <span
                        onClick={() => setIsOpen(false)}
                        className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-[12px] border border-[var(--border)] bg-[var(--bg-card)] px-4 py-2 text-sm font-medium text-[var(--text-primary)]"
                      >
                        <LayoutDashboard size={14} />
                        Open dashboard
                      </span>
                    </Link>
                    <Link href="/profile">
                      <span
                        onClick={() => setIsOpen(false)}
                        className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-[12px] border border-[var(--border)] bg-[var(--bg-card)] px-4 py-2 text-sm font-medium text-[var(--text-primary)]"
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
                      className="inline-flex items-center justify-center gap-2 rounded-[12px] border border-[var(--red)]/30 bg-[var(--red-bg)] px-4 py-2 text-sm font-medium text-[var(--red)]"
                    >
                      <LogOut size={14} />
                      Sign out
                    </button>
                  </div>
                ) : (
                  <div className="grid gap-2">
                    <button type="button" onClick={openSignup} className="btn-primary rounded-[12px]">
                      <ArrowRight size={14} />
                      Start free
                    </button>
                    <button type="button" onClick={openLogin} className="btn-secondary rounded-[12px]">
                      Log in
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
