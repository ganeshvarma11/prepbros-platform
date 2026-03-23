import { useEffect, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";

import BrandLogo from "@/components/BrandLogo";
import { useAuth } from "@/contexts/AuthContext";
import { trackEvent } from "@/lib/analytics";
import { cn } from "@/lib/utils";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: "login" | "signup";
}

const EXAM_OPTIONS = [
  "UPSC CSE 2026",
  "UPSC CSE 2027",
  "TSPSC Group 1 2025",
  "TSPSC Group 2 2025",
  "APPSC Group 1 2025",
  "SSC CGL 2025",
  "SSC CHSL 2025",
  "RRB NTPC 2025",
  "IBPS PO 2025",
];

export default function AuthModal({
  isOpen,
  onClose,
  defaultTab = "login",
}: AuthModalProps) {
  const { signIn, signUp } = useAuth();
  const [tab, setTab] = useState<"login" | "signup">(defaultTab);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [signupForm, setSignupForm] = useState({
    fullName: "",
    email: "",
    password: "",
    targetExam: "UPSC CSE 2026",
  });

  useEffect(() => {
    if (!isOpen) return;
    setTab(defaultTab);
    setError("");
    setShowPassword(false);
    setLoading(false);
    setSuccess(false);
  }, [defaultTab, isOpen]);

  if (!isOpen) return null;

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    const { error: authError } = await signIn(loginForm.email, loginForm.password);
    setLoading(false);

    if (authError) {
      setError(authError.message || "Invalid email or password");
      return;
    }

    trackEvent("auth_login_success");
    onClose();
  };

  const handleSignup = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    if (signupForm.password.length < 6) {
      setError("Use at least 6 characters for your password.");
      setLoading(false);
      return;
    }

    const { error: authError } = await signUp(
      signupForm.email,
      signupForm.password,
      signupForm.fullName,
      signupForm.targetExam,
    );
    setLoading(false);

    if (authError) {
      setError(authError.message || "Something went wrong while creating your account.");
      return;
    }

    trackEvent("auth_signup_success", { target_exam: signupForm.targetExam });
    setSuccess(true);
  };

  const fieldClasses =
    "w-full rounded-2xl border border-[var(--border)] bg-[var(--bg-subtle)] px-4 py-3 text-sm text-[var(--text-primary)] outline-none transition placeholder:text-[var(--text-faint)] focus:border-[var(--brand)] focus:bg-[var(--bg-card-strong)] focus:ring-4 focus:ring-[color:var(--brand-glow)]";

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-slate-950/55 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close authentication modal"
      />

      <div className="relative max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-[32px] border border-white/10 bg-[var(--bg-card-strong)] shadow-[0_40px_120px_-32px_rgba(15,23,42,0.55)]">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-secondary)] transition hover:text-[var(--text-primary)]"
        >
          <X size={16} />
        </button>

        <div className="grid md:grid-cols-[1.05fr_0.95fr]">
          <div className="relative overflow-hidden bg-[linear-gradient(160deg,#0f172a_0%,#1d4ed8_42%,#16a34a_120%)] px-6 py-8 text-white md:px-8 md:py-10">
            <div className="absolute inset-0 hero-grid opacity-20" />
            <div className="relative">
              <BrandLogo
                textClassName="text-white"
                markClassName="border-white/20"
                className="[&_p:last-child]:text-white/70"
              />

              <div className="mt-10 space-y-4">
                <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-white/80">
                  <Sparkles size={14} />
                  Built for serious aspirants
                </p>
                <h2 className="max-w-md text-4xl font-semibold tracking-[-0.06em] text-white">
                  Turn daily practice into visible progress.
                </h2>
                <p className="max-w-md text-sm text-white/78 md:text-base">
                  Save answers, keep your streak alive, revisit weak areas, and make PrepBros
                  feel like your actual prep companion.
                </p>
              </div>

              <div className="mt-10 grid gap-4">
                {[
                  "Track solved questions, accuracy, and daily goals in one place.",
                  "Practice with cleaner focus on mobile and desktop.",
                  "Build trust with a consistent profile, dashboard, and revision rhythm.",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-start gap-3 rounded-3xl border border-white/12 bg-white/8 p-4 backdrop-blur"
                  >
                    <ShieldCheck size={18} className="mt-0.5 text-emerald-300" />
                    <p className="text-sm text-white/82">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="max-h-[90vh] overflow-y-auto px-6 py-8 md:px-8 md:py-10">
            {success ? (
              <div className="flex min-h-full flex-col justify-center text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[var(--green-bg)] text-[var(--green)]">
                  <CheckCircle2 size={30} />
                </div>
                <h3 className="mt-5 text-2xl font-semibold tracking-[-0.04em] text-[var(--text-primary)]">
                  Check your inbox
                </h3>
                <p className="mt-3 text-sm text-[var(--text-secondary)]">
                  We sent a confirmation link to{" "}
                  <span className="font-semibold text-[var(--text-primary)]">{signupForm.email}</span>.
                  Open it to activate your account and start syncing your progress.
                </p>
                <button
                  type="button"
                  onClick={onClose}
                  className="btn-primary mx-auto mt-8 rounded-full px-6"
                >
                  Continue
                </button>
              </div>
            ) : (
              <>
                <div className="mb-8">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--brand)]">
                    {tab === "login" ? "Welcome back" : "Create your space"}
                  </p>
                  <h3 className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-[var(--text-primary)]">
                    {tab === "login"
                      ? "Log in to continue your preparation."
                      : "Create your account and make practice stick."}
                  </h3>
                  <p className="mt-3 text-sm text-[var(--text-secondary)]">
                    {tab === "login"
                      ? "Your dashboard, progress history, and saved question flow are ready."
                      : "Start with a free account so your streaks, bookmarks, and progress stay with you."}
                  </p>
                </div>

                <div className="mb-6 inline-flex rounded-full border border-[var(--border)] bg-[var(--bg-subtle)] p-1">
                  {(["login", "signup"] as const).map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => {
                        setTab(item);
                        setError("");
                        trackEvent(item === "login" ? "auth_tab_login_opened" : "auth_tab_signup_opened");
                      }}
                      className={cn(
                        "rounded-full px-4 py-2 text-sm font-medium capitalize transition",
                        tab === item
                          ? "bg-[var(--bg-card-strong)] text-[var(--text-primary)] shadow-sm"
                          : "text-[var(--text-muted)] hover:text-[var(--text-primary)]",
                      )}
                    >
                      {item === "login" ? "Log in" : "Sign up"}
                    </button>
                  ))}
                </div>

                {tab === "login" ? (
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                      <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
                        Email
                      </label>
                      <input
                        type="email"
                        required
                        value={loginForm.email}
                        onChange={(event) =>
                          setLoginForm((current) => ({ ...current, email: event.target.value }))
                        }
                        placeholder="you@example.com"
                        className={fieldClasses}
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
                        Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          required
                          value={loginForm.password}
                          onChange={(event) =>
                            setLoginForm((current) => ({ ...current, password: event.target.value }))
                          }
                          placeholder="Enter your password"
                          className={cn(fieldClasses, "pr-11")}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((current) => !current)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] transition hover:text-[var(--text-primary)]"
                        >
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    {error ? (
                      <div className="rounded-2xl border border-[var(--red)]/20 bg-[var(--red-bg)] px-4 py-3 text-sm text-[var(--red)]">
                        {error}
                      </div>
                    ) : null}

                    <button
                      type="submit"
                      disabled={loading}
                      className="btn-primary flex w-full rounded-full py-3"
                    >
                      {loading ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          Logging you in...
                        </>
                      ) : (
                        <>
                          Continue to dashboard
                          <ArrowRight size={16} />
                        </>
                      )}
                    </button>

                    <p className="text-center text-sm text-[var(--text-muted)]">
                      New here?{" "}
                      <button
                        type="button"
                        onClick={() => setTab("signup")}
                        className="font-semibold text-[var(--brand)]"
                      >
                        Create your free account
                      </button>
                    </p>
                  </form>
                ) : (
                  <form onSubmit={handleSignup} className="space-y-4">
                    <div>
                      <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
                        Full name
                      </label>
                      <input
                        type="text"
                        required
                        value={signupForm.fullName}
                        onChange={(event) =>
                          setSignupForm((current) => ({ ...current, fullName: event.target.value }))
                        }
                        placeholder="Rakesh Meesa"
                        className={fieldClasses}
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
                        Email
                      </label>
                      <input
                        type="email"
                        required
                        value={signupForm.email}
                        onChange={(event) =>
                          setSignupForm((current) => ({ ...current, email: event.target.value }))
                        }
                        placeholder="you@example.com"
                        className={fieldClasses}
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
                        Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          required
                          value={signupForm.password}
                          onChange={(event) =>
                            setSignupForm((current) => ({ ...current, password: event.target.value }))
                          }
                          placeholder="At least 6 characters"
                          className={cn(fieldClasses, "pr-11")}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((current) => !current)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] transition hover:text-[var(--text-primary)]"
                        >
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
                        Target exam
                      </label>
                      <select
                        value={signupForm.targetExam}
                        onChange={(event) =>
                          setSignupForm((current) => ({
                            ...current,
                            targetExam: event.target.value,
                          }))
                        }
                        className={cn(fieldClasses, "appearance-none")}
                      >
                        {EXAM_OPTIONS.map((exam) => (
                          <option key={exam}>{exam}</option>
                        ))}
                      </select>
                    </div>

                    {error ? (
                      <div className="rounded-2xl border border-[var(--red)]/20 bg-[var(--red-bg)] px-4 py-3 text-sm text-[var(--red)]">
                        {error}
                      </div>
                    ) : null}

                    <button
                      type="submit"
                      disabled={loading}
                      className="btn-primary flex w-full rounded-full py-3"
                    >
                      {loading ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          Creating your account...
                        </>
                      ) : (
                        <>
                          Create free account
                          <ArrowRight size={16} />
                        </>
                      )}
                    </button>

                    <p className="text-center text-sm text-[var(--text-muted)]">
                      Already have an account?{" "}
                      <button
                        type="button"
                        onClick={() => setTab("login")}
                        className="font-semibold text-[var(--brand)]"
                      >
                        Log in
                      </button>
                    </p>

                    <p className="text-center text-xs text-[var(--text-faint)]">
                      By continuing, you agree to PrepBros' Terms and consent to receive account
                      emails.
                    </p>
                  </form>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
