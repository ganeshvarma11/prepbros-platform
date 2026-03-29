import { useState } from "react";
import { ArrowRight, Loader2, LogOut } from "lucide-react";
import { Link, useLocation } from "wouter";

import AuthModal from "@/components/AuthModal";
import BrandLogo from "@/components/BrandLogo";
import { useAuth } from "@/contexts/AuthContext";
import { trackEvent } from "@/lib/analytics";
import { getPolicyUrl } from "@/lib/siteConfig";

const NAV_ITEMS = [
  { label: "Practice", href: "/practice", type: "route" as const },
  { label: "Dashboard", href: "/dashboard", type: "route" as const },
  { label: "Review", href: "#review-system", type: "anchor" as const },
  { label: "Pricing", href: "/premium", type: "route" as const },
];

const HERO_PROOF_POINTS = ["Daily MCQs", "Weak topic review", "Phone OTP login"];

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
      ? "border-[#f3e8dc] bg-[#f3e8dc] text-[#16120f] hover:bg-white"
      : variant === "ghost"
        ? "border-white/10 bg-transparent text-[#f5efe8] hover:border-white/16 hover:bg-white/[0.04]"
        : "border-white/10 bg-white/[0.03] text-[#f5efe8] hover:border-white/16 hover:bg-white/[0.06]";

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex h-14 w-full items-center justify-center gap-3 rounded-full border px-5 text-[15px] font-medium tracking-[-0.01em] transition duration-200 disabled:cursor-not-allowed disabled:opacity-70 ${variantClasses} ${className}`}
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
      <div className="w-full max-w-[410px] rounded-[30px] border border-white/10 bg-white/[0.03] p-6 shadow-[0_30px_90px_-56px_rgba(0,0,0,0.95)] backdrop-blur-sm sm:p-8">
        <p className="text-[0.72rem] font-medium uppercase tracking-[0.28em] text-[#a99888]">
          Account
        </p>
        <h2 className="mt-4 text-[2rem] font-semibold tracking-[-0.04em] text-[#f7f0e8]">
          Welcome back.
        </h2>
        <p className="mt-3 max-w-sm text-[15px] leading-7 text-[#b7aca2]">
          {displayName}, your dashboard and daily practice flow are ready when you are.
        </p>

        <div className="mt-8 space-y-3">
          <Link href="/dashboard">
            <span className="inline-flex h-14 w-full cursor-pointer items-center justify-center gap-3 rounded-full border border-[#f3e8dc] bg-[#f3e8dc] px-5 text-[15px] font-medium tracking-[-0.01em] text-[#16120f] transition duration-200 hover:bg-white">
              Go to dashboard
              <ArrowRight size={17} />
            </span>
          </Link>

          <LandingActionButton variant="ghost" onClick={onSignOut} icon={<LogOut size={16} />}>
            Sign out
          </LandingActionButton>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[410px] rounded-[30px] border border-white/10 bg-white/[0.03] p-6 shadow-[0_30px_90px_-56px_rgba(0,0,0,0.95)] backdrop-blur-sm sm:p-8">
      <p className="text-[0.72rem] font-medium uppercase tracking-[0.28em] text-[#a99888]">
        PrepBros
      </p>
      <h2 className="mt-4 text-[2.2rem] font-semibold tracking-[-0.05em] text-[#f7f0e8]">
        Join today.
      </h2>
      <p className="mt-3 max-w-sm text-[15px] leading-7 text-[#b7aca2]">
        Keep daily practice in one calm, consistent loop.
      </p>

      <div className="mt-8 space-y-3">
        <LandingActionButton
          onClick={() => {
            void onGoogleAuth();
          }}
          disabled={oauthLoading}
          icon={oauthLoading ? <Loader2 size={16} className="animate-spin" /> : <GoogleIcon />}
        >
          Sign up with Google
        </LandingActionButton>

        <div className="flex items-center gap-4 py-1">
          <div className="h-px flex-1 bg-white/10" />
          <span className="text-xs uppercase tracking-[0.26em] text-[#86796f]">or</span>
          <div className="h-px flex-1 bg-white/10" />
        </div>

        <LandingActionButton variant="primary" onClick={onOpenSignup}>
          Create account
        </LandingActionButton>
      </div>

      <p className="mt-5 text-[12px] leading-6 text-[#8d8178]">
        By signing up, you agree to the{" "}
        <a
          href={getPolicyUrl("/terms")}
          target="_blank"
          rel="noreferrer"
          className="text-[#d9cdc1] transition hover:text-white"
        >
          Terms
        </a>{" "}
        and{" "}
        <a
          href={getPolicyUrl("/privacy")}
          target="_blank"
          rel="noreferrer"
          className="text-[#d9cdc1] transition hover:text-white"
        >
          Privacy Policy
        </a>
        .
      </p>

      <div className="mt-8 border-t border-white/8 pt-6">
        <p className="text-[14px] text-[#a99888]">Already have an account?</p>
        <LandingActionButton className="mt-3" onClick={onOpenLogin}>
          Sign in
        </LandingActionButton>
      </div>

      {panelError ? (
        <p className="mt-5 rounded-[18px] border border-[#6b3028] bg-[#2a1715] px-4 py-3 text-[13px] leading-6 text-[#f0beb5]">
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
    user?.user_metadata?.full_name?.split(" ")[0] || user?.email?.split("@")[0] || "Aspirant";

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
      setPanelError(error.message || "Google sign in is not available right now.");
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
      <div className="relative min-h-screen overflow-hidden bg-[#050505] text-[#f5efe8]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(164,118,76,0.09),transparent_34%),radial-gradient(circle_at_78%_18%,rgba(120,78,42,0.16),transparent_26%),radial-gradient(circle_at_50%_100%,rgba(255,255,255,0.03),transparent_38%),linear-gradient(180deg,#060505_0%,#090807_46%,#050505_100%)]" />
        <div className="pointer-events-none absolute inset-0 opacity-[0.14] [background-image:linear-gradient(to_right,rgba(255,255,255,0.045)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:160px_160px]" />
        <div className="pointer-events-none absolute left-[-12%] top-[14%] h-[320px] w-[320px] rounded-full bg-[#8e653d]/[0.08] blur-[120px]" />
        <div className="pointer-events-none absolute right-[-8%] top-[8%] h-[360px] w-[360px] rounded-full bg-[#765033]/[0.12] blur-[140px]" />

        <div className="relative z-10 mx-auto flex min-h-screen w-[min(1180px,calc(100vw-32px))] flex-col">
          <nav className="flex items-center justify-between gap-4 py-5 sm:py-6 lg:py-7">
            <BrandLogo
              compact
              className="gap-2.5"
              textClassName="text-[1.55rem] font-medium tracking-[-0.055em] text-[#f5efe8] md:text-[1.72rem]"
            />

            <div className="hidden items-center gap-7 lg:flex">
              {NAV_ITEMS.map((item) =>
                item.type === "anchor" ? (
                  <a
                    key={item.label}
                    href={item.href}
                    className="text-[15px] font-medium tracking-[-0.01em] text-[#b5aaa0] transition hover:text-[#f5efe8]"
                  >
                    {item.label}
                  </a>
                ) : (
                  <Link key={item.label} href={item.href}>
                    <span className="cursor-pointer text-[15px] font-medium tracking-[-0.01em] text-[#b5aaa0] transition hover:text-[#f5efe8]">
                      {item.label}
                    </span>
                  </Link>
                ),
              )}
            </div>

            <div className="flex items-center gap-2.5 sm:gap-3">
              {user ? (
                <>
                  <Link href="/dashboard">
                    <span className="inline-flex cursor-pointer items-center justify-center rounded-full border border-white/10 px-4 py-2.5 text-[14px] font-medium tracking-[-0.01em] text-[#f5efe8] transition hover:border-white/16 hover:bg-white/[0.05] sm:px-5">
                      Dashboard
                    </span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      void handleSignOut();
                    }}
                    className="inline-flex items-center justify-center rounded-full border border-white/10 px-4 py-2.5 text-[14px] font-medium tracking-[-0.01em] text-[#b5aaa0] transition hover:border-white/16 hover:text-[#f5efe8] sm:px-5"
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={openLogin}
                    className="inline-flex items-center justify-center rounded-full border border-white/10 px-4 py-2.5 text-[14px] font-medium tracking-[-0.01em] text-[#d5cbc2] transition hover:border-white/16 hover:bg-white/[0.04] hover:text-white sm:px-5"
                  >
                    Log in
                  </button>
                  <button
                    type="button"
                    onClick={handleHeroStart}
                    className="inline-flex items-center justify-center rounded-full border border-[#f3e8dc] bg-[#f3e8dc] px-4 py-2.5 text-[14px] font-medium tracking-[-0.01em] text-[#17130f] transition hover:bg-white sm:px-5"
                  >
                    Start free
                  </button>
                </>
              )}
            </div>
          </nav>

          <section
            id="review-system"
            className="grid flex-1 items-center gap-10 pb-10 pt-8 sm:pb-12 sm:pt-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(390px,430px)] lg:gap-8 lg:pb-14"
          >
            <div className="max-w-[760px] pl-3 sm:pl-5 lg:pl-8 pr-0 lg:pr-2">
              <h1
                className="text-[clamp(5.4rem,13vw,10.4rem)] font-semibold leading-[0.83] tracking-[-0.078em] text-[#f7f0e8] [text-wrap:balance]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                <span className="block">Daily practice</span>
                <span className="block">that keeps prep</span>
                <span className="block">steady and clear.</span>
              </h1>

              <p className="mt-6 max-w-[30rem] text-[18px] leading-8 text-[#b7aca2] sm:text-[19px]">
                Solve daily questions, review weak areas, and stay consistent in a calmer prep
                flow that feels easy to return to.
              </p>

              <div className="mt-9 flex flex-wrap items-center gap-3 pl-1 sm:pl-2">
                <button
                  type="button"
                  onClick={handleHeroStart}
                  className="inline-flex items-center gap-3 rounded-full border border-[#f3e8dc] bg-[#f3e8dc] px-8 py-4 text-[16px] font-medium tracking-[-0.01em] text-[#16120f] shadow-[0_18px_46px_-28px_rgba(243,232,220,0.85)] transition duration-200 hover:translate-y-[-1px] hover:bg-white"
                >
                  Start free
                  <ArrowRight size={18} />
                </button>

                <a
                  href="#join-panel"
                  className="inline-flex items-center gap-3 rounded-full border border-white/10 px-7 py-4 text-[15px] font-medium tracking-[-0.01em] text-[#d5cbc2] transition hover:border-white/16 hover:bg-white/[0.04] hover:text-white"
                >
                  Explore signup
                </a>
              </div>

              <div className="mt-7 flex flex-wrap gap-3 pl-1 sm:pl-2">
                {HERO_PROOF_POINTS.map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-white/8 bg-white/[0.025] px-4 py-2 text-[13px] font-medium tracking-[-0.01em] text-[#c7bbb0]"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div
              id="join-panel"
              className="w-full lg:justify-self-start lg:border-l lg:border-white/[0.08] lg:pl-7"
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

      <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} defaultTab={authTab} />
    </>
  );
}
