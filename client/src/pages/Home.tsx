import { useState } from "react";
import { ArrowRight, Loader2, LogOut } from "lucide-react";
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
    title: "Question solving that stays focused.",
    description:
      "PrepBros keeps daily solving simple with a quiet question desk, clean filters, and less visual clutter while you work.",
  },
  {
    eyebrow: "Review",
    title: "Weak areas surface naturally.",
    description:
      "Incorrect attempts, weak topics, bookmarks, and retry queues stay connected so revision is easier to return to every day.",
  },
  {
    eyebrow: "Progress",
    title: "A dashboard that shows what matters.",
    description:
      "Track solved questions, accuracy, streaks, and daily pace without turning your prep flow into a noisy analytics screen.",
  },
];

const PLATFORM_FLOW = [
  {
    step: "01",
    title: "Start with daily questions",
    description:
      "Open the practice desk, pick up fresh questions, and keep momentum without setup friction.",
  },
  {
    step: "02",
    title: "Review weak topics",
    description:
      "Use retries, solved status, and saved questions to close gaps before they become repeated mistakes.",
  },
  {
    step: "03",
    title: "Return to a steady rhythm",
    description:
      "The dashboard, profile, and premium tools are all shaped to make consistent prep easier, not heavier.",
  },
];

const PLATFORM_HIGHIGHTS = [
  "Question library with exam, topic, year, and review filters",
  "Bookmarks, retry flow, and saved progress across sessions",
  "Dashboard summaries for accuracy, streak, pace, and coverage",
  "Resources, premium plans, support, and account controls in one place",
];

const PRICING_PREVIEW = [
  {
    name: "Free",
    price: "₹0",
    cadence: "",
    badge: "Start here",
    description:
      "Daily practice access, basic progress visibility, and a calm place to build consistency.",
    features: [
      "Question practice access",
      "Basic dashboard progress",
      "Core resources",
    ],
  },
  {
    name: "Pro Monthly",
    price: "₹199",
    cadence: "/ month",
    badge: "Most flexible",
    description:
      "Unlock deeper usage for active prep cycles and keep your study flow moving without limits.",
    features: [
      "Extended question access",
      "Better analytics and review signals",
      "Priority help and planning support",
    ],
  },
  {
    name: "Annual",
    price: "₹999",
    cadence: "/ year",
    badge: "Best value",
    description:
      "Built for long preparation cycles when you want the platform ready for the full run.",
    features: [
      "Everything in Pro",
      "Lower long-cycle cost",
      "Better fit for serious annual prep",
    ],
  },
];

const ESSENTIAL_LINKS = [
  { label: "Practice Questions", href: "/practice" },
  { label: "Dashboard", href: "/dashboard" },
  { label: "Resources", href: "/resources" },
  { label: "Premium Plans", href: "/premium" },
  { label: "Support", href: "/support" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms & Conditions", href: "/terms" },
  { label: "System Status", href: "/status" },
];

const PLATFORM_FAQS = [
  {
    question: "Who is PrepBros for?",
    answer:
      "PrepBros is designed for aspirants who want a calmer way to practice daily, review weak areas, and stay consistent across long prep cycles.",
  },
  {
    question: "What do I get with an account?",
    answer:
      "Your account keeps bookmarks, attempts, streaks, dashboard metrics, and profile settings tied together in one workspace.",
  },
  {
    question: "Where can I get help?",
    answer: `You can reach us at ${siteConfig.supportEmail} or open the support page for billing, access, or product questions.`,
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
          <section className="rounded-[32px] border border-[var(--border)] bg-[var(--bg-card)] p-6 shadow-[var(--shadow-lg)] backdrop-blur-xl sm:p-8 lg:p-10">
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(300px,0.95fr)] lg:items-start">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--text-faint)]">
                  Platform overview
                </p>
                <h2
                  className="mt-4 max-w-[12ch] text-[clamp(2.6rem,6vw,4.4rem)] leading-[0.94] tracking-[-0.07em] text-[var(--text-primary)]"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Prep support built for real study days.
                </h2>
                <p className="mt-5 max-w-[42rem] text-[16px] leading-8 text-[var(--text-secondary)]">
                  PrepBros is more than a question page. It gives you one quiet
                  place to practice, review mistakes, understand progress, find
                  resources, and decide when to upgrade without losing the calm
                  feeling of the product.
                </p>
              </div>

              <div className="rounded-[28px] border border-[var(--border)] bg-[var(--surface-1)] p-5 shadow-[var(--shadow-sm)]">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--text-faint)]">
                  What the platform covers
                </p>
                <div className="mt-5 space-y-3">
                  {PLATFORM_HIGHIGHTS.map(item => (
                    <div
                      key={item}
                      className="rounded-[18px] border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3 text-sm leading-6 text-[var(--text-secondary)]"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-8 grid gap-4 lg:grid-cols-3">
              {PLATFORM_PILLARS.map(item => (
                <article
                  key={item.title}
                  className="rounded-[26px] border border-[var(--border)] bg-[var(--surface-1)] p-5 shadow-[var(--shadow-sm)]"
                >
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--text-faint)]">
                    {item.eyebrow}
                  </p>
                  <h3 className="mt-3 text-[1.7rem] tracking-[-0.045em] text-[var(--text-primary)]">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">
                    {item.description}
                  </p>
                </article>
              ))}
            </div>
          </section>

          <section className="grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
            <div className="rounded-[32px] border border-[var(--border)] bg-[var(--bg-card)] p-6 shadow-[var(--shadow-lg)] backdrop-blur-xl sm:p-8">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--text-faint)]">
                How PrepBros works
              </p>
              <div className="mt-6 space-y-4">
                {PLATFORM_FLOW.map(item => (
                  <div
                    key={item.step}
                    className="grid gap-4 rounded-[24px] border border-[var(--border)] bg-[var(--surface-1)] p-5 md:grid-cols-[auto_minmax(0,1fr)]"
                  >
                    <div
                      className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface-2)] text-sm font-semibold text-[var(--text-primary)]"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      {item.step}
                    </div>
                    <div>
                      <h3 className="text-[1.35rem] tracking-[-0.04em] text-[var(--text-primary)]">
                        {item.title}
                      </h3>
                      <p className="mt-2 text-sm leading-7 text-[var(--text-secondary)]">
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[32px] border border-[var(--border)] bg-[var(--bg-card)] p-6 shadow-[var(--shadow-lg)] backdrop-blur-xl sm:p-8">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--text-faint)]">
                Essentials
              </p>
              <h3 className="mt-4 text-[2rem] tracking-[-0.05em] text-[var(--text-primary)]">
                Everything important stays close.
              </h3>
              <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">
                Access the product, account help, legal pages, and platform
                support from one place.
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {ESSENTIAL_LINKS.map(item => (
                  <Link key={item.href} href={item.href}>
                    <span className="flex cursor-pointer items-center justify-between rounded-[18px] border border-[var(--border)] bg-[var(--surface-1)] px-4 py-3 text-sm font-medium text-[var(--text-primary)] transition hover:border-[var(--border-strong)] hover:bg-[var(--surface-2)]">
                      {item.label}
                      <ArrowRight size={15} className="text-[var(--text-faint)]" />
                    </span>
                  </Link>
                ))}
              </div>

              <div className="mt-6 rounded-[24px] border border-[var(--border)] bg-[var(--surface-1)] p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--text-faint)]">
                  Contact
                </p>
                <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">
                  Support: {siteConfig.supportEmail}
                  <br />
                  Billing: {siteConfig.billingEmail}
                  <br />
                  Address: {siteConfig.companyAddress}
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-[32px] border border-[var(--border)] bg-[var(--bg-card)] p-6 shadow-[var(--shadow-lg)] backdrop-blur-xl sm:p-8 lg:p-10">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--text-faint)]">
                  Pricing
                </p>
                <h2
                  className="mt-4 text-[clamp(2.5rem,5vw,4rem)] leading-[0.96] tracking-[-0.07em] text-[var(--text-primary)]"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Pick the prep cycle that fits you.
                </h2>
                <p className="mt-4 max-w-[42rem] text-[16px] leading-8 text-[var(--text-secondary)]">
                  Start free, move to Pro when you need more room, and use the
                  annual plan if you want the platform to stay with you through
                  a longer preparation run.
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
                <article
                  key={plan.name}
                  className="rounded-[28px] border border-[var(--border)] bg-[var(--surface-1)] p-5 shadow-[var(--shadow-sm)]"
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
                  <p className="mt-4 text-sm leading-7 text-[var(--text-secondary)]">
                    {plan.description}
                  </p>
                  <div className="mt-5 space-y-3">
                    {plan.features.map(feature => (
                      <div
                        key={feature}
                        className="rounded-[16px] border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3 text-sm text-[var(--text-secondary)]"
                      >
                        {feature}
                      </div>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="grid gap-4 lg:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)]">
            <div className="rounded-[32px] border border-[var(--border)] bg-[var(--bg-card)] p-6 shadow-[var(--shadow-lg)] backdrop-blur-xl sm:p-8">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--text-faint)]">
                FAQ
              </p>
              <div className="mt-6 space-y-4">
                {PLATFORM_FAQS.map(item => (
                  <article
                    key={item.question}
                    className="rounded-[24px] border border-[var(--border)] bg-[var(--surface-1)] p-5"
                  >
                    <h3 className="text-[1.25rem] tracking-[-0.03em] text-[var(--text-primary)]">
                      {item.question}
                    </h3>
                    <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">
                      {item.answer}
                    </p>
                  </article>
                ))}
              </div>
            </div>

            <div className="rounded-[32px] border border-[var(--border)] bg-[var(--bg-card)] p-6 shadow-[var(--shadow-lg)] backdrop-blur-xl sm:p-8">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--text-faint)]">
                Legal and trust
              </p>
              <h3 className="mt-4 text-[2rem] tracking-[-0.05em] text-[var(--text-primary)]">
                The platform basics are visible and easy to reach.
              </h3>
              <p className="mt-4 text-sm leading-7 text-[var(--text-secondary)]">
                Policies, support, billing help, and platform status should
                never be hidden. PrepBros keeps them available from the landing
                page all the way through the product.
              </p>

              <div className="mt-6 space-y-3">
                <a
                  href={getPolicyUrl("/privacy")}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between rounded-[18px] border border-[var(--border)] bg-[var(--surface-1)] px-4 py-3 text-sm font-medium text-[var(--text-primary)] transition hover:border-[var(--border-strong)] hover:bg-[var(--surface-2)]"
                >
                  Privacy Policy
                  <ArrowRight size={15} className="text-[var(--text-faint)]" />
                </a>
                <a
                  href={getPolicyUrl("/terms")}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between rounded-[18px] border border-[var(--border)] bg-[var(--surface-1)] px-4 py-3 text-sm font-medium text-[var(--text-primary)] transition hover:border-[var(--border-strong)] hover:bg-[var(--surface-2)]"
                >
                  Terms & Conditions
                  <ArrowRight size={15} className="text-[var(--text-faint)]" />
                </a>
                <Link href="/support">
                  <span className="flex cursor-pointer items-center justify-between rounded-[18px] border border-[var(--border)] bg-[var(--surface-1)] px-4 py-3 text-sm font-medium text-[var(--text-primary)] transition hover:border-[var(--border-strong)] hover:bg-[var(--surface-2)]">
                    Support and billing help
                    <ArrowRight size={15} className="text-[var(--text-faint)]" />
                  </span>
                </Link>
                <Link href="/status">
                  <span className="flex cursor-pointer items-center justify-between rounded-[18px] border border-[var(--border)] bg-[var(--surface-1)] px-4 py-3 text-sm font-medium text-[var(--text-primary)] transition hover:border-[var(--border-strong)] hover:bg-[var(--surface-2)]">
                    Platform status
                    <ArrowRight size={15} className="text-[var(--text-faint)]" />
                  </span>
                </Link>
              </div>
            </div>
          </section>
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
