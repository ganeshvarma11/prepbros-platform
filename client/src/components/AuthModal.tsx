import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { useForm } from "react-hook-form";
import { z } from "zod";

import BrandLogo from "@/components/BrandLogo";
import { useAuth } from "@/contexts/AuthContext";
import { trackEvent } from "@/lib/analytics";
import { getPolicyUrl } from "@/lib/siteConfig";
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

const loginSchema = z.object({
  email: z.email({ message: "Enter a valid email address." }),
  password: z.string().min(1, "Password is required."),
});

const signupSchema = z.object({
  fullName: z.string().min(2, "Enter your full name (at least 2 characters)."),
  email: z.email({ message: "Enter a valid email address." }),
  password: z.string().min(6, "Use at least 6 characters for your password."),
  targetExam: z.string().min(1, "Choose a target exam."),
});

type LoginValues = z.infer<typeof loginSchema>;
type SignupValues = z.infer<typeof signupSchema>;

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
  const [submitError, setSubmitError] = useState("");
  const [confirmedEmail, setConfirmedEmail] = useState("");

  const loginForm = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const signupForm = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      targetExam: "UPSC CSE 2026",
    },
  });

  useEffect(() => {
    if (!isOpen) return;
    setTab(defaultTab);
    setSubmitError("");
    setShowPassword(false);
    setLoading(false);
    setSuccess(false);
    loginForm.reset({ email: "", password: "" });
    signupForm.reset({
      fullName: "",
      email: "",
      password: "",
      targetExam: "UPSC CSE 2026",
    });
  }, [defaultTab, isOpen, loginForm.reset, signupForm.reset]);

  if (!isOpen) return null;

  const fieldClasses =
    "w-full rounded-[14px] border border-[var(--border)] bg-[var(--bg-subtle)] px-3.5 py-2.5 text-sm text-[var(--text-primary)] outline-none transition placeholder:text-[var(--text-faint)] focus:border-[var(--brand)] focus:bg-[var(--bg-card-strong)] focus:ring-4 focus:ring-[color:var(--brand-glow)] md:px-4 md:py-3";

  const fieldError = (message?: string) =>
    message ? (
      <p className="mt-1.5 text-xs font-medium text-[var(--red)]" role="alert">
        {message}
      </p>
    ) : null;

  const handleLogin = loginForm.handleSubmit(async (data) => {
    setLoading(true);
    setSubmitError("");
    const { error: authError } = await signIn(data.email, data.password);
    setLoading(false);

    if (authError) {
      setSubmitError(
        authError.message ||
          "We could not sign you in. Check your email and password, then try again.",
      );
      return;
    }

    trackEvent("auth_login_success");
    onClose();
  });

  const handleSignup = signupForm.handleSubmit(async (data) => {
    setLoading(true);
    setSubmitError("");

    const { error: authError } = await signUp(
      data.email,
      data.password,
      data.fullName,
      data.targetExam,
    );
    setLoading(false);

    if (authError) {
      setSubmitError(
        authError.message ||
          "We could not create your account. Try again in a moment or use a different email.",
      );
      return;
    }

    setConfirmedEmail(data.email);
    trackEvent("auth_signup_success", { target_exam: data.targetExam });
    setSuccess(true);
  });

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 md:p-4">
      <button
        type="button"
        className="absolute inset-0 bg-slate-950/55 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close authentication modal"
      />

      <div className="relative max-h-[92svh] w-full max-w-4xl overflow-hidden rounded-[22px] border border-[var(--border)] bg-[var(--bg-card-strong)] shadow-[0_40px_120px_-32px_rgba(0,0,0,0.82)] md:max-h-[90vh] md:rounded-[24px]">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-[12px] border border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-secondary)] transition hover:text-[var(--text-primary)] md:right-4 md:top-4 md:h-10 md:w-10"
        >
          <X size={16} />
        </button>

        <div className="grid md:grid-cols-[1.05fr_0.95fr]">
          <div
            className="relative hidden overflow-hidden border-r border-[var(--border)] bg-[linear-gradient(180deg,#181818_0%,#111111_100%)] px-6 py-8 text-white md:block md:px-8 md:py-10"
          >
            <div className="absolute inset-0 hero-grid opacity-10" />
            <div className="absolute -right-16 top-16 h-40 w-40 rounded-full bg-[var(--brand-glow)] blur-3xl" />
            <div className="relative">
              <BrandLogo
                textClassName="text-white"
                markClassName="border-[rgba(255,161,22,0.28)]"
                className="[&_p:last-child]:text-white/70"
              />

              <div className="mt-10 space-y-4">
                <p className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--brand-subtle)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--brand-light)]">
                  <Sparkles size={14} />
                  Built for serious aspirants
                </p>
                <h2 className="max-w-md text-4xl font-semibold tracking-[-0.06em] text-white">
                  Practice with the kind of interface users actually trust.
                </h2>
                <p className="max-w-md text-sm text-white/78 md:text-base">
                  Your account keeps solved questions, streaks, bookmarks, and weak-topic review
                  in one place so progress feels tangible after every session.
                </p>
              </div>

              <div className="mt-10 grid gap-4">
                {[
                  "Follow one clean loop: solve, review, and improve.",
                  "Return to a dashboard that shows momentum instead of noise.",
                  "Keep the same account, streak, and prep context across sessions.",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-start gap-3 rounded-[16px] border border-[var(--border)] bg-[var(--bg-elevated)] p-4"
                  >
                    <ShieldCheck size={18} className="mt-0.5 text-[var(--brand)]" />
                    <p className="text-sm text-white/82">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="max-h-[92svh] overflow-y-auto bg-[var(--bg-card-strong)] px-5 py-6 md:max-h-[90vh] md:px-8 md:py-10">
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
                  <span className="font-semibold text-[var(--text-primary)]">{confirmedEmail}</span>.
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
                <div className="mb-4 md:hidden">
                  <BrandLogo
                    textClassName="text-[var(--text-primary)]"
                    markClassName="border-[rgba(255,161,22,0.28)]"
                  />
                </div>

                <div className="mb-6 md:mb-8">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--brand)]">
                    {tab === "login" ? "Welcome back" : "Create your space"}
                  </p>
                  <h3 className="mt-2 text-[1.9rem] font-semibold tracking-[-0.05em] text-[var(--text-primary)] md:mt-3 md:text-3xl">
                    {tab === "login"
                      ? "Log in to continue your preparation."
                      : "Create your account and make practice stick."}
                  </h3>
                  <p className="mt-2 text-sm text-[var(--text-secondary)] md:mt-3">
                    {tab === "login"
                      ? "Your dashboard, progress history, and saved question flow are ready."
                      : "Start with a free account so your streaks, bookmarks, and progress stay with you."}
                  </p>
                </div>

                <div className="mb-5 grid w-full grid-cols-2 rounded-[14px] border border-[var(--border)] bg-[var(--bg-subtle)] p-1 md:mb-6 md:inline-flex md:w-auto">
                  {(["login", "signup"] as const).map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => {
                        setTab(item);
                        setSubmitError("");
                        trackEvent(item === "login" ? "auth_tab_login_opened" : "auth_tab_signup_opened");
                      }}
                      className={cn(
                        "rounded-[10px] px-4 py-2 text-sm font-medium capitalize transition",
                        tab === item
                          ? "bg-[var(--bg-card)] text-[var(--text-primary)] shadow-sm"
                          : "text-[var(--text-muted)] hover:text-[var(--text-primary)]",
                      )}
                    >
                      {item === "login" ? "Log in" : "Sign up"}
                    </button>
                  ))}
                </div>

                {tab === "login" ? (
                  <form onSubmit={handleLogin} className="space-y-3.5 md:space-y-4" noValidate>
                    <div>
                      <label
                        htmlFor="auth-login-email"
                        className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]"
                      >
                        Email
                      </label>
                      <input
                        id="auth-login-email"
                        type="email"
                        autoComplete="email"
                        {...loginForm.register("email")}
                        placeholder="you@example.com"
                        className={cn(
                          fieldClasses,
                          loginForm.formState.errors.email && "border-[var(--red)]/40",
                        )}
                        aria-invalid={Boolean(loginForm.formState.errors.email)}
                      />
                      {fieldError(loginForm.formState.errors.email?.message)}
                    </div>
                    <div>
                      <label
                        htmlFor="auth-login-password"
                        className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]"
                      >
                        Password
                      </label>
                      <div className="relative">
                        <input
                          id="auth-login-password"
                          type={showPassword ? "text" : "password"}
                          autoComplete="current-password"
                          {...loginForm.register("password")}
                          placeholder="Enter your password"
                          className={cn(
                            fieldClasses,
                            "pr-11",
                            loginForm.formState.errors.password && "border-[var(--red)]/40",
                          )}
                          aria-invalid={Boolean(loginForm.formState.errors.password)}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((current) => !current)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] transition hover:text-[var(--text-primary)]"
                        >
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                      {fieldError(loginForm.formState.errors.password?.message)}
                    </div>

                    {submitError ? (
                      <div className="rounded-[14px] border border-[var(--red)]/20 bg-[var(--red-bg)] px-4 py-3 text-sm text-[var(--red)]">
                        {submitError}
                      </div>
                    ) : null}

                    <button
                      type="submit"
                      disabled={loading}
                      className="btn-primary flex w-full rounded-[12px] py-2.5 md:py-3"
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
                  <form onSubmit={handleSignup} className="space-y-3.5 md:space-y-4" noValidate>
                    <div>
                      <label
                        htmlFor="auth-signup-name"
                        className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]"
                      >
                        Full name
                      </label>
                      <input
                        id="auth-signup-name"
                        type="text"
                        autoComplete="name"
                        {...signupForm.register("fullName")}
                        placeholder="Priya Sharma"
                        className={cn(
                          fieldClasses,
                          signupForm.formState.errors.fullName && "border-[var(--red)]/40",
                        )}
                        aria-invalid={Boolean(signupForm.formState.errors.fullName)}
                      />
                      {fieldError(signupForm.formState.errors.fullName?.message)}
                    </div>
                    <div>
                      <label
                        htmlFor="auth-signup-email"
                        className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]"
                      >
                        Email
                      </label>
                      <input
                        id="auth-signup-email"
                        type="email"
                        autoComplete="email"
                        {...signupForm.register("email")}
                        placeholder="you@example.com"
                        className={cn(
                          fieldClasses,
                          signupForm.formState.errors.email && "border-[var(--red)]/40",
                        )}
                        aria-invalid={Boolean(signupForm.formState.errors.email)}
                      />
                      {fieldError(signupForm.formState.errors.email?.message)}
                    </div>
                    <div>
                      <label
                        htmlFor="auth-signup-password"
                        className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]"
                      >
                        Password
                      </label>
                      <div className="relative">
                        <input
                          id="auth-signup-password"
                          type={showPassword ? "text" : "password"}
                          autoComplete="new-password"
                          {...signupForm.register("password")}
                          placeholder="At least 6 characters"
                          className={cn(
                            fieldClasses,
                            "pr-11",
                            signupForm.formState.errors.password && "border-[var(--red)]/40",
                          )}
                          aria-invalid={Boolean(signupForm.formState.errors.password)}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((current) => !current)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] transition hover:text-[var(--text-primary)]"
                        >
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                      {fieldError(signupForm.formState.errors.password?.message)}
                    </div>
                    <div>
                      <label
                        htmlFor="auth-signup-exam"
                        className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]"
                      >
                        Target exam
                      </label>
                      <select
                        id="auth-signup-exam"
                        {...signupForm.register("targetExam")}
                        className={cn(
                          fieldClasses,
                          "appearance-none",
                          signupForm.formState.errors.targetExam && "border-[var(--red)]/40",
                        )}
                        aria-invalid={Boolean(signupForm.formState.errors.targetExam)}
                      >
                        {EXAM_OPTIONS.map((exam) => (
                          <option key={exam}>{exam}</option>
                        ))}
                      </select>
                      {fieldError(signupForm.formState.errors.targetExam?.message)}
                    </div>

                    {submitError ? (
                      <div className="rounded-[14px] border border-[var(--red)]/20 bg-[var(--red-bg)] px-4 py-3 text-sm text-[var(--red)]">
                        {submitError}
                      </div>
                    ) : null}

                    <button
                      type="submit"
                      disabled={loading}
                      className="btn-primary flex w-full rounded-[12px] py-2.5 md:py-3"
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
                      By continuing, you agree to PrepBros&apos;{" "}
                      <a
                        href={getPolicyUrl("/terms")}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[var(--brand)] transition hover:opacity-80"
                      >
                        Terms
                      </a>{" "}
                      and{" "}
                      <a
                        href={getPolicyUrl("/privacy")}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[var(--brand)] transition hover:opacity-80"
                      >
                        Privacy Policy
                      </a>
                      , and consent to receive account emails.
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
