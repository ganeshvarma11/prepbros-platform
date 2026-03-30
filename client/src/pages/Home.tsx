import { useState, type CSSProperties, type ReactNode } from "react";
import {
  ArrowRight,
  BookOpen,
  CircleHelp,
  Crown,
  FileText,
  LayoutDashboard,
  Loader2,
  LogOut,
  ShieldCheck,
  Sparkles,
  Trophy,
  type LucideIcon,
} from "lucide-react";
import { Link, useLocation } from "wouter";

import AuthModal from "@/components/AuthModal";
import BrandLogo from "@/components/BrandLogo";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { trackEvent } from "@/lib/analytics";
import { getPolicyUrl, siteConfig } from "@/lib/siteConfig";

const NAV_ITEMS = [
  { label: "Practice", href: "/practice", type: "route" as const },
  { label: "Dashboard", href: "/dashboard", type: "route" as const },
  { label: "Review", href: "#review-system", type: "anchor" as const },
  { label: "Pricing", href: "/premium", type: "route" as const },
];

const HERO_PROOF_POINTS = [
  "Daily MCQs",
  "Weak topic review",
  "Phone OTP login",
];

const PLATFORM_PILLARS = [
  {
    eyebrow: "Practice",
    title: "Quiet question desk",
    description: "Fresh questions, clean filters, fewer distractions.",
    meta: "Daily flow",
  },
  {
    eyebrow: "Review",
    title: "Revision that returns",
    description: "Wrong answers and weak topics stay easy to revisit.",
    meta: "Retry ready",
  },
  {
    eyebrow: "Progress",
    title: "Signals, not noise",
    description: "Accuracy, streak, pace, and coverage in one glance.",
    meta: "Clear progress",
  },
];

const PLATFORM_FLOW = [
  {
    step: "01",
    title: "Solve",
    description: "Start with fresh daily questions.",
  },
  {
    step: "02",
    title: "Review",
    description: "Return to misses before they pile up.",
  },
  {
    step: "03",
    title: "Track",
    description: "Keep rhythm with a calm dashboard.",
  },
];

const PLATFORM_HIGHLIGHTS = [
  "Questions first",
  "Weak-topic review",
  "Progress snapshot",
  "Resources and support",
];

const PRICING_PREVIEW = [
  {
    name: "Free",
    price: "₹0",
    cadence: "",
    badge: "Start here",
    description: "Build consistency.",
    features: ["Practice", "Basic dashboard", "Core resources"],
  },
  {
    name: "Pro Monthly",
    price: "₹199",
    cadence: "/ month",
    badge: "Most flexible",
    description: "More room for active prep.",
    features: ["More access", "Better review signals", "Priority help"],
  },
  {
    name: "Annual",
    price: "₹999",
    cadence: "/ year",
    badge: "Best value",
    description: "Best fit for long cycles.",
    features: ["Everything in Pro", "Lower yearly cost", "Long-run prep"],
  },
];

const ESSENTIAL_LINKS: Array<{
  label: string;
  href: string;
  note: string;
  icon: LucideIcon;
}> = [
  {
    label: "Practice",
    href: "/practice",
    note: "Question desk",
    icon: BookOpen,
  },
  {
    label: "Dashboard",
    href: "/dashboard",
    note: "Progress view",
    icon: LayoutDashboard,
  },
  {
    label: "Resources",
    href: "/resources",
    note: "Study material",
    icon: Sparkles,
  },
  {
    label: "Premium",
    href: "/premium",
    note: "Plans",
    icon: Crown,
  },
  {
    label: "Support",
    href: "/support",
    note: "Help",
    icon: CircleHelp,
  },
  {
    label: "Privacy",
    href: "/privacy",
    note: "Policy",
    icon: ShieldCheck,
  },
  {
    label: "Terms",
    href: "/terms",
    note: "Conditions",
    icon: FileText,
  },
  {
    label: "Status",
    href: "/status",
    note: "Platform health",
    icon: Trophy,
  },
];

function GoogleIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-[18px] w-[18px] shrink-0"
      fill="none"
    >
      <path
        d="M21.805 12.23c0-.79-.07-1.545-.202-2.27H12v4.292h5.487a4.698 4.698 0 0 1-2.036 3.084v2.56h3.298c1.93-1.776 3.056-4.395 3.056-7.666Z"
        fill="#4285F4"
      />
      <path
        d="M12 22c2.756 0 5.067-.914 6.755-2.48l-3.298-2.56c-.914.612-2.082.974-3.457.974-2.65 0-4.894-1.788-5.696-4.193H2.894v2.64A9.998 9.998 0 0 0 12 22Z"
        fill="#34A853"
      />
      <path
        d="M6.304 13.74A5.998 5.998 0 0 1 5.986 12c0-.604.11-1.19.318-1.74V7.62H2.894A9.999 9.999 0 0 0 2 12c0 1.61.386 3.134 1.07 4.38l3.234-2.64Z"
        fill="#FBBC04"
      />
      <path
        d="M12 6.066c1.5 0 2.848.516 3.91 1.53l2.933-2.934C17.06 2.998 14.75 2 12 2A9.998 9.998 0 0 0 2.894 7.62l3.41 2.64C7.106 7.854 9.35 6.066 12 6.066Z"
        fill="#EA4335"
      />
    </svg>
  );
}

interface LandingActionButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "ghost";
  icon?: React.ReactNode;
  disabled?: boolean;
  className?: string;
  type?: "button" | "submit";
}

function LandingActionButton({
  children,
  onClick,
  variant = "secondary",
  icon,
  disabled = false,
  className = "",
  type = "button",
}: LandingActionButtonProps) {
  const variantClasses =
    variant === "primary"
      ? "border-[var(--brand)] bg-[var(--brand)] text-[var(--text-on-brand)] shadow-[var(--shadow-md)] hover:brightness-110"
      : variant === "ghost"
        ? "border-[var(--border)] bg-transparent text-[var(--text-primary)] hover:border-[var(--border-strong)] hover:bg-[var(--surface-1)]"
        : "border-[var(--border)] bg-[var(--surface-1)] text-[var(--text-primary)] shadow-[var(--shadow-sm)] hover:border-[var(--border-strong)] hover:bg-[var(--surface-2)]";

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex h-14 w-full items-center justify-center gap-3 rounded-full border px-5 text-[15px] font-semibold tracking-[-0.01em] transition duration-200 disabled:cursor-not-allowed disabled:opacity-70 ${variantClasses} ${className}`}
    >
      {icon}
      <span>{children}</span>
    </button>
  );
}

interface LandingAuthPanelProps {
  user: ReturnType<typeof useAuth>["user"];
  displayName: string;
  panelError: string;
  oauthLoading: boolean;
  onGoogleAuth: () => Promise<void>;
  onOpenSignup: () => void;
  onOpenLogin: () => void;
  onSignOut: () => Promise<void>;
}

function LandingAuthPanel({
  user,
  displayName,
  panelError,
  oauthLoading,
  onGoogleAuth,
  onOpenSignup,
  onOpenLogin,
  onSignOut,
}: LandingAuthPanelProps) {
  if (user) {
    return (
      <div className="w-full max-w-[430px] rounded-[34px] border border-[var(--border)] bg-[var(--bg-card)] p-6 shadow-[var(--shadow-lg)] backdrop-blur-xl sm:p-8">
        <p className="text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-[var(--text-faint)]">
          Account
        </p>
        <h2 className="mt-4 text-[2.15rem] tracking-[-0.05em] text-[var(--text-primary)]">
          Welcome back.
        </h2>
        <p className="mt-3 max-w-sm text-[15px] leading-7 text-[var(--text-secondary)]">
          {displayName}, your dashboard and daily practice flow are ready when
          you are.
        </p>

        <div className="mt-8 space-y-3">
          <Link href="/dashboard">
            <span className="inline-flex h-14 w-full cursor-pointer items-center justify-center gap-3 rounded-full border border-[var(--brand)] bg-[var(--brand)] px-5 text-[15px] font-semibold tracking-[-0.01em] text-[var(--text-on-brand)] shadow-[var(--shadow-md)] transition duration-200 hover:brightness-110">
              Go to dashboard
              <ArrowRight size={17} />
            </span>
          </Link>

          <LandingActionButton
            variant="ghost"
            onClick={onSignOut}
            icon={<LogOut size={16} />}
          >
            Sign out
          </LandingActionButton>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[430px] rounded-[34px] border border-[var(--border)] bg-[var(--bg-card)] p-6 shadow-[var(--shadow-lg)] backdrop-blur-xl sm:p-8">
      <p className="text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-[var(--text-faint)]">
        PrepBros
      </p>
      <h2 className="mt-4 text-[2.3rem] tracking-[-0.055em] text-[var(--text-primary)]">
        Join today.
      </h2>
      <p className="mt-3 max-w-sm text-[15px] leading-7 text-[var(--text-secondary)]">
        Keep daily practice in one calm, consistent loop.
      </p>

      <div className="mt-8 space-y-3">
        <LandingActionButton
          onClick={() => {
            void onGoogleAuth();
          }}
          disabled={oauthLoading}
          icon={
            oauthLoading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <GoogleIcon />
            )
          }
        >
          Sign up with Google
        </LandingActionButton>

        <div className="flex items-center gap-4 py-1">
          <div className="h-px flex-1 bg-[var(--border)]" />
          <span className="text-xs uppercase tracking-[0.26em] text-[var(--text-faint)]">
            or
          </span>
          <div className="h-px flex-1 bg-[var(--border)]" />
        </div>

        <LandingActionButton variant="primary" onClick={onOpenSignup}>
          Create account
        </LandingActionButton>
      </div>

      <p className="mt-5 text-[12px] leading-6 text-[var(--text-muted)]">
        By signing up, you agree to the{" "}
        <a
          href={getPolicyUrl("/terms")}
          target="_blank"
          rel="noreferrer"
          className="text-[var(--text-primary)] transition hover:text-[var(--brand)]"
        >
          Terms
        </a>{" "}
        and{" "}
        <a
          href={getPolicyUrl("/privacy")}
          target="_blank"
          rel="noreferrer"
          className="text-[var(--text-primary)] transition hover:text-[var(--brand)]"
        >
          Privacy Policy
        </a>
        .
      </p>

      <div className="mt-8 border-t border-[var(--border)] pt-6">
        <p className="text-[14px] text-[var(--text-secondary)]">
          Already have an account?
        </p>
        <LandingActionButton className="mt-3" onClick={onOpenLogin}>
          Sign in
        </LandingActionButton>
      </div>

      {panelError ? (
        <p className="mt-5 rounded-[18px] border border-[rgba(220,38,38,0.18)] bg-[rgba(220,38,38,0.08)] px-4 py-3 text-[13px] leading-6 text-[var(--red)]">
          {panelError}
        </p>
      ) : null}
    </div>
  );
}

type InteractiveSurfaceProps = {
  children: ReactNode;
  className?: string;
};

const interactiveRestStyle = {
  "--mx": "50%",
  "--my": "50%",
  transform: "perspective(1200px) rotateX(0deg) rotateY(0deg)",
} as CSSProperties;

function InteractiveSurface({
  children,
  className = "",
}: InteractiveSurfaceProps) {
  const [style, setStyle] = useState<CSSProperties>(interactiveRestStyle);

  return (
    <div
      className={`group relative overflow-hidden transition duration-300 will-change-transform hover:-translate-y-1 ${className}`}
      style={style}
      onPointerMove={event => {
        const rect = event.currentTarget.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width) * 100;
        const y = ((event.clientY - rect.top) / rect.height) * 100;
        const rotateY = ((x - 50) / 50) * 4;
        const rotateX = ((50 - y) / 50) * 4;

        setStyle({
          "--mx": `${x}%`,
          "--my": `${y}%`,
          transform: `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
        } as CSSProperties);
      }}
      onPointerLeave={() => setStyle(interactiveRestStyle)}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition duration-300 group-hover:opacity-100"
        style={
          {
            background:
              "radial-gradient(circle at var(--mx) var(--my), rgba(255,255,255,0.12), transparent 34%)",
          } as CSSProperties
        }
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

export default function Home() {
  const { user, signInWithGoogle, signOut } = useAuth();
  const [, setLocation] = useLocation();
  const [showAuth, setShowAuth] = useState(false);
  const [authTab, setAuthTab] = useState<"login" | "signup">("signup");
  const [oauthLoading, setOauthLoading] = useState(false);
  const [panelError, setPanelError] = useState("");

  const displayName =
    user?.user_metadata?.full_name?.split(" ")[0] ||
    user?.email?.split("@")[0] ||
    "Aspirant";

  const openSignup = () => {
    setPanelError("");
    setAuthTab("signup");
    setShowAuth(true);
    trackEvent("landing_signup_opened", { source: "hero" });
  };

  const openLogin = () => {
    setPanelError("");
    setAuthTab("login");
    setShowAuth(true);
    trackEvent("landing_login_opened", { source: "hero" });
  };

  const handleHeroStart = () => {
    if (user) {
      setLocation("/dashboard");
      return;
    }

    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      document.getElementById("join-panel")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
      return;
    }

    openSignup();
  };

  const handleGoogleAuth = async () => {
    setPanelError("");
    setOauthLoading(true);
    trackEvent("landing_google_auth_started");

    const { error } = await signInWithGoogle();

    if (error) {
      setPanelError(
        error.message || "Google sign in is not available right now."
      );
      setOauthLoading(false);
      return;
    }
  };

  const handleSignOut = async () => {
    await signOut();
    trackEvent("landing_sign_out");
  };

  return (
    <>
      <div className="relative min-h-screen overflow-hidden bg-[var(--page-background)] text-[var(--text-primary)]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.72),transparent_32%),radial-gradient(circle_at_78%_12%,rgba(148,163,184,0.16),transparent_26%),radial-gradient(circle_at_50%_100%,rgba(255,255,255,0.22),transparent_38%)] dark:bg-[radial-gradient(circle_at_top_left,rgba(148,163,184,0.14),transparent_32%),radial-gradient(circle_at_78%_12%,rgba(59,130,246,0.16),transparent_26%),radial-gradient(circle_at_50%_100%,rgba(255,255,255,0.03),transparent_38%)]" />
        <div className="pointer-events-none absolute inset-0 opacity-[0.24] [background-image:linear-gradient(to_right,rgba(148,163,184,0.11)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.09)_1px,transparent_1px)] [background-size:160px_160px] dark:opacity-[0.12]" />
        <div className="pointer-events-none absolute left-[-12%] top-[14%] h-[320px] w-[320px] rounded-full bg-[#dbeafe]/60 blur-[120px] dark:bg-[#1d4ed8]/20" />
        <div className="pointer-events-none absolute right-[-8%] top-[8%] h-[360px] w-[360px] rounded-full bg-[#e2e8f0]/70 blur-[140px] dark:bg-[#475569]/22" />

        <div className="relative z-10 mx-auto flex min-h-screen w-[min(1180px,calc(100vw-32px))] flex-col">
          <nav className="flex items-center justify-between gap-4 py-5 sm:py-6 lg:py-7">
            <BrandLogo
              compact
              className="gap-2.5"
              textClassName="text-[1.55rem] font-semibold tracking-[-0.055em] text-[var(--text-primary)] md:text-[1.72rem]"
            />

            <div className="hidden items-center gap-7 lg:flex">
              {NAV_ITEMS.map(item =>
                item.type === "anchor" ? (
                  <a
                    key={item.label}
                    href={item.href}
                    className="text-[15px] font-medium tracking-[-0.01em] text-[var(--text-secondary)] transition hover:text-[var(--text-primary)]"
                  >
                    {item.label}
                  </a>
                ) : (
                  <Link key={item.label} href={item.href}>
                    <span className="cursor-pointer text-[15px] font-medium tracking-[-0.01em] text-[var(--text-secondary)] transition hover:text-[var(--text-primary)]">
                      {item.label}
                    </span>
                  </Link>
                )
              )}
            </div>

            <div className="flex items-center gap-2.5 sm:gap-3">
              {user ? (
                <>
                  <Link href="/dashboard">
                    <span className="inline-flex cursor-pointer items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface-1)] px-4 py-2.5 text-[14px] font-semibold tracking-[-0.01em] text-[var(--text-primary)] shadow-[var(--shadow-sm)] transition hover:border-[var(--border-strong)] hover:bg-[var(--surface-2)] sm:px-5">
                      Dashboard
                    </span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      void handleSignOut();
                    }}
                    className="inline-flex items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface-1)] px-4 py-2.5 text-[14px] font-semibold tracking-[-0.01em] text-[var(--text-secondary)] shadow-[var(--shadow-sm)] transition hover:border-[var(--border-strong)] hover:text-[var(--text-primary)] sm:px-5"
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={openLogin}
                    className="inline-flex items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface-1)] px-4 py-2.5 text-[14px] font-semibold tracking-[-0.01em] text-[var(--text-secondary)] shadow-[var(--shadow-sm)] transition hover:border-[var(--border-strong)] hover:bg-[var(--surface-2)] hover:text-[var(--text-primary)] sm:px-5"
                  >
                    Log in
                  </button>
                  <button
                    type="button"
                    onClick={handleHeroStart}
                    className="inline-flex items-center justify-center rounded-full border border-[var(--brand)] bg-[var(--brand)] px-4 py-2.5 text-[14px] font-semibold tracking-[-0.01em] text-[var(--text-on-brand)] shadow-[var(--shadow-md)] transition hover:brightness-110 sm:px-5"
                  >
                    Start free
                  </button>
                </>
              )}
            </div>
          </nav>

          <section
            id="review-system"
            className="grid flex-1 items-center gap-10 pb-10 pt-8 sm:pb-12 sm:pt-12 lg:grid-cols-[minmax(0,1.06fr)_minmax(390px,430px)] lg:gap-10 lg:pb-14"
          >
            <div className="max-w-[760px] pl-3 sm:pl-5 lg:pl-8 pr-0 lg:pr-2">
              <p className="mb-5 inline-flex rounded-full border border-[var(--border)] bg-[var(--surface-1)] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--text-secondary)] shadow-[var(--shadow-sm)]">
                Calm prep workspace
              </p>
              <h1
                className="text-[clamp(4.2rem,11vw,8.8rem)] leading-[0.86] tracking-[-0.085em] text-[var(--text-primary)] [text-wrap:balance]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                <span className="block">Daily practice</span>
                <span className="block">that keeps prep</span>
                <span className="block">steady and clear.</span>
              </h1>

              <p className="mt-6 max-w-[34rem] text-[18px] leading-8 text-[var(--text-secondary)] sm:text-[19px]">
                Solve daily questions, review weak areas, and stay consistent in
                a calmer prep flow that feels easy to return to.
              </p>

              <div className="mt-9 flex flex-wrap items-center gap-3 pl-1 sm:pl-2">
                <button
                  type="button"
                  onClick={handleHeroStart}
                  className="inline-flex items-center gap-3 rounded-full border border-[var(--brand)] bg-[var(--brand)] px-8 py-4 text-[16px] font-semibold tracking-[-0.01em] text-[var(--text-on-brand)] shadow-[var(--shadow-lg)] transition duration-200 hover:translate-y-[-1px] hover:brightness-110"
                >
                  Start free
                  <ArrowRight size={18} />
                </button>

                <a
                  href="#join-panel"
                  className="inline-flex items-center gap-3 rounded-full border border-[var(--border)] bg-[var(--surface-1)] px-7 py-4 text-[15px] font-semibold tracking-[-0.01em] text-[var(--text-secondary)] shadow-[var(--shadow-sm)] transition hover:border-[var(--border-strong)] hover:bg-[var(--surface-2)] hover:text-[var(--text-primary)]"
                >
                  Explore signup
                </a>
              </div>

              <div className="mt-7 flex flex-wrap gap-3 pl-1 sm:pl-2">
                {HERO_PROOF_POINTS.map(item => (
                  <span
                    key={item}
                    className="rounded-full border border-[var(--border)] bg-[var(--surface-1)] px-4 py-2 text-[13px] font-semibold tracking-[-0.01em] text-[var(--text-secondary)] shadow-[var(--shadow-sm)]"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div
              id="join-panel"
              className="w-full lg:justify-self-start lg:border-l lg:border-[var(--border)] lg:pl-8"
            >
              <LandingAuthPanel
                user={user}
                displayName={displayName}
                panelError={panelError}
                oauthLoading={oauthLoading}
                onGoogleAuth={handleGoogleAuth}
                onOpenSignup={openSignup}
                onOpenLogin={openLogin}
                onSignOut={handleSignOut}
              />
            </div>
          </section>
        </div>
      </div>

      <div className="relative bg-[var(--page-background)] pb-4">
        <div className="mx-auto w-[min(1180px,calc(100vw-32px))] space-y-6 pb-8 pt-4 sm:space-y-7 sm:pb-10">
          <InteractiveSurface className="rounded-[32px] border border-[var(--border)] bg-[var(--bg-card)] p-6 shadow-[var(--shadow-lg)] backdrop-blur-xl sm:p-8 lg:p-10">
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(300px,0.95fr)] lg:items-start">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--text-faint)]">
                  Platform overview
                </p>
                <h2
                  className="mt-4 max-w-[11ch] text-[clamp(2.6rem,6vw,4.2rem)] leading-[0.94] tracking-[-0.07em] text-[var(--text-primary)]"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  PrepBros keeps the whole loop calm.
                </h2>
                <p className="mt-5 max-w-[34rem] text-[16px] leading-8 text-[var(--text-secondary)]">
                  Practice, review, track progress, and upgrade only when you
                  need more room.
                </p>

                <div className="mt-6 flex flex-wrap gap-3">
                  {PLATFORM_HIGHLIGHTS.map(item => (
                    <span
                      key={item}
                      className="rounded-full border border-[var(--border)] bg-[var(--surface-1)] px-4 py-2 text-[13px] font-semibold tracking-[-0.01em] text-[var(--text-secondary)] shadow-[var(--shadow-sm)] transition group-hover:border-[var(--border-strong)] group-hover:bg-[var(--surface-2)]"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  { value: "Daily", label: "Practice flow" },
                  { value: "Retry", label: "Weak-topic review" },
                  { value: "Clear", label: "Dashboard signals" },
                  { value: "Ready", label: "Support and plans" },
                ].map(item => (
                  <div
                    key={item.label}
                    className="rounded-[24px] border border-[var(--border)] bg-[var(--surface-1)] p-5 shadow-[var(--shadow-sm)] transition group-hover:border-[var(--border-strong)] group-hover:bg-[var(--surface-2)]"
                  >
                    <p
                      className="text-[2.4rem] leading-none tracking-[-0.06em] text-[var(--text-primary)]"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      {item.value}
                    </p>
                    <p className="mt-2 text-sm text-[var(--text-secondary)]">
                      {item.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 grid gap-4 lg:grid-cols-3">
              {PLATFORM_PILLARS.map(item => (
                <div
                  key={item.title}
                  className="rounded-[26px] border border-[var(--border)] bg-[var(--surface-1)] p-5 shadow-[var(--shadow-sm)] transition group-hover:border-[var(--border-strong)] group-hover:bg-[var(--surface-2)]"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--text-faint)]">
                      {item.eyebrow}
                    </p>
                    <span className="rounded-full border border-[var(--border)] bg-[var(--surface-2)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--text-secondary)]">
                      {item.meta}
                    </span>
                  </div>
                  <h3 className="mt-4 text-[1.6rem] tracking-[-0.045em] text-[var(--text-primary)]">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-7 text-[var(--text-secondary)]">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </InteractiveSurface>

          <section className="grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
            <InteractiveSurface className="rounded-[32px] border border-[var(--border)] bg-[var(--bg-card)] p-6 shadow-[var(--shadow-lg)] backdrop-blur-xl sm:p-8">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--text-faint)]">
                Flow
              </p>
              <div className="mt-6 space-y-4">
                {PLATFORM_FLOW.map(item => (
                  <div
                    key={item.step}
                    className="grid gap-4 rounded-[24px] border border-[var(--border)] bg-[var(--surface-1)] p-5 transition group-hover:border-[var(--border-strong)] group-hover:bg-[var(--surface-2)] md:grid-cols-[auto_minmax(0,1fr)]"
                  >
                    <div
                      className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface-2)] text-sm font-semibold text-[var(--text-primary)]"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      {item.step}
                    </div>
                    <div>
                      <h3 className="text-[1.3rem] tracking-[-0.04em] text-[var(--text-primary)]">
                        {item.title}
                      </h3>
                      <p className="mt-1 text-sm leading-7 text-[var(--text-secondary)]">
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </InteractiveSurface>

            <InteractiveSurface className="rounded-[32px] border border-[var(--border)] bg-[var(--bg-card)] p-6 shadow-[var(--shadow-lg)] backdrop-blur-xl sm:p-8">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--text-faint)]">
                Essentials
              </p>
              <h3 className="mt-4 text-[2rem] tracking-[-0.05em] text-[var(--text-primary)]">
                Quick access, not clutter.
              </h3>
              <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">
                Product, support, pricing, and legal pages all stay one tap
                away.
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {ESSENTIAL_LINKS.map(item => (
                  <Link key={item.href} href={item.href}>
                    <span className="flex cursor-pointer items-center justify-between rounded-[20px] border border-[var(--border)] bg-[var(--surface-1)] px-4 py-3 transition hover:border-[var(--border-strong)] hover:bg-[var(--surface-2)]">
                      <span className="flex items-center gap-3">
                        <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface-2)] text-[var(--text-primary)]">
                          <item.icon size={16} />
                        </span>
                        <span>
                          <span className="block text-sm font-medium text-[var(--text-primary)]">
                            {item.label}
                          </span>
                          <span className="block text-xs text-[var(--text-faint)]">
                            {item.note}
                          </span>
                        </span>
                      </span>
                      <ArrowRight size={15} className="text-[var(--text-faint)]" />
                    </span>
                  </Link>
                ))}
              </div>

              <div className="mt-6 rounded-[24px] border border-[var(--border)] bg-[var(--surface-1)] p-5 transition group-hover:border-[var(--border-strong)] group-hover:bg-[var(--surface-2)]">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--text-faint)]">
                  Contact
                </p>
                <div className="mt-3 space-y-1 text-sm leading-7 text-[var(--text-secondary)]">
                  <p>{siteConfig.supportEmail}</p>
                  <p>{siteConfig.billingEmail}</p>
                  <p>{siteConfig.companyAddress}</p>
                </div>
              </div>
            </InteractiveSurface>
          </section>

          <InteractiveSurface className="rounded-[32px] border border-[var(--border)] bg-[var(--bg-card)] p-6 shadow-[var(--shadow-lg)] backdrop-blur-xl sm:p-8 lg:p-10">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--text-faint)]">
                  Pricing
                </p>
                <h2
                  className="mt-4 text-[clamp(2.4rem,5vw,3.8rem)] leading-[0.96] tracking-[-0.07em] text-[var(--text-primary)]"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Start free. Upgrade when it helps.
                </h2>
                <p className="mt-4 max-w-[34rem] text-[16px] leading-8 text-[var(--text-secondary)]">
                  Simple plans for short bursts or long prep cycles.
                </p>
              </div>

              <Link href="/premium">
                <span className="inline-flex cursor-pointer items-center gap-3 rounded-full border border-[var(--brand)] bg-[var(--brand)] px-6 py-3 text-sm font-semibold text-[var(--text-on-brand)] shadow-[var(--shadow-md)] transition hover:brightness-110">
                  View full pricing
                  <ArrowRight size={16} />
                </span>
              </Link>
            </div>

            <div className="mt-8 grid gap-4 lg:grid-cols-3">
              {PRICING_PREVIEW.map(plan => (
                <div
                  key={plan.name}
                  className="rounded-[28px] border border-[var(--border)] bg-[var(--surface-1)] p-5 shadow-[var(--shadow-sm)] transition group-hover:border-[var(--border-strong)] group-hover:bg-[var(--surface-2)]"
                >
                  <span className="inline-flex rounded-full border border-[var(--border)] bg-[var(--surface-2)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]">
                    {plan.badge}
                  </span>
                  <h3 className="mt-5 text-[2rem] tracking-[-0.04em] text-[var(--text-primary)]">
                    {plan.name}
                  </h3>
                  <div className="mt-4 flex items-end gap-2">
                    <span
                      className="text-[3.6rem] leading-none tracking-[-0.07em] text-[var(--text-primary)]"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      {plan.price}
                    </span>
                    {plan.cadence ? (
                      <span className="pb-2 text-sm text-[var(--text-secondary)]">
                        {plan.cadence}
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">
                    {plan.description}
                  </p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {plan.features.map(feature => (
                      <span
                        key={feature}
                        className="rounded-full border border-[var(--border)] bg-[var(--surface-2)] px-3 py-1.5 text-[12px] font-medium text-[var(--text-secondary)]"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </InteractiveSurface>

          <InteractiveSurface className="rounded-[32px] border border-[var(--border)] bg-[var(--bg-card)] p-6 shadow-[var(--shadow-lg)] backdrop-blur-xl sm:p-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--text-faint)]">
                  Trust and legal
                </p>
                <h3 className="mt-3 text-[2rem] tracking-[-0.05em] text-[var(--text-primary)]">
                  Policies stay visible.
                </h3>
              </div>
              <p className="max-w-[28rem] text-sm leading-7 text-[var(--text-secondary)]">
                Privacy, terms, support, and platform status stay easy to find
                across the product.
              </p>
            </div>

            <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {[
                { label: "Privacy Policy", href: "/privacy" },
                { label: "Terms & Conditions", href: "/terms" },
                { label: "Support and Billing", href: "/support" },
                { label: "Platform Status", href: "/status" },
              ].map(item => (
                <Link key={item.href} href={item.href}>
                  <span className="flex cursor-pointer items-center justify-between rounded-[20px] border border-[var(--border)] bg-[var(--surface-1)] px-4 py-4 text-sm font-medium text-[var(--text-primary)] transition hover:border-[var(--border-strong)] hover:bg-[var(--surface-2)]">
                    {item.label}
                    <ArrowRight size={15} className="text-[var(--text-faint)]" />
                  </span>
                </Link>
              ))}
            </div>
          </InteractiveSurface>
        </div>

        <Footer />
      </div>

      <AuthModal
        isOpen={showAuth}
        onClose={() => setShowAuth(false)}
        defaultTab={authTab}
      />
    </>
  );
}
