import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Loader2,
  Mail,
  ShieldCheck,
} from "lucide-react";
import { Link, useLocation } from "wouter";

import BrandLogo from "@/components/BrandLogo";
import { useAuth } from "@/contexts/AuthContext";

const readEmailFromQuery = () => {
  if (typeof window === "undefined") return "";
  return new URLSearchParams(window.location.search).get("email") || "";
};

const detectRecoveryLink = () => {
  if (typeof window === "undefined") return false;

  const hash = window.location.hash.startsWith("#")
    ? window.location.hash.slice(1)
    : window.location.hash;

  const hashParams = new URLSearchParams(hash);
  const searchParams = new URLSearchParams(window.location.search);

  return (
    hashParams.get("type") === "recovery" ||
    searchParams.get("type") === "recovery"
  );
};

export default function ResetPassword() {
  const { session, loading, resetPassword, updatePassword } = useAuth();
  const [, setLocation] = useLocation();
  const recoveryLink = useMemo(() => detectRecoveryLink(), []);

  const [mode, setMode] = useState<"request" | "update">(
    recoveryLink ? "update" : "request"
  );
  const [email, setEmail] = useState(readEmailFromQuery);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [passwordUpdated, setPasswordUpdated] = useState(false);

  useEffect(() => {
    if (loading) return;

    if (session) {
      setMode("update");
      setError("");
      return;
    }

    if (recoveryLink) {
      setMode("request");
      setError(
        "This password-reset link may have expired. Request a fresh email below."
      );
    }
  }, [loading, recoveryLink, session]);

  const handleSendResetEmail = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    setError("");

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setError("Enter the email address linked to your PrepBros account.");
      return;
    }

    setSubmitting(true);
    const { error: authError } = await resetPassword(trimmedEmail);
    setSubmitting(false);

    if (authError) {
      setError(
        authError.message ||
          "We could not send the reset email right now. Please try again in a moment."
      );
      return;
    }

    setEmailSent(true);
  };

  const handleUpdatePassword = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Use at least 6 characters for your new password.");
      return;
    }

    if (password !== confirmPassword) {
      setError("The confirmation password does not match.");
      return;
    }

    setSubmitting(true);
    const { error: authError } = await updatePassword(password);
    setSubmitting(false);

    if (authError) {
      setError(
        authError.message ||
          "We could not update your password. Please request a fresh email."
      );
      return;
    }

    if (typeof window !== "undefined") {
      window.history.replaceState({}, document.title, "/reset-password");
    }

    setPassword("");
    setConfirmPassword("");
    setPasswordUpdated(true);
  };

  return (
    <div className="min-h-screen bg-[var(--page-background)] text-[var(--text-primary)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.78),transparent_32%),radial-gradient(circle_at_82%_10%,rgba(191,219,254,0.24),transparent_24%)] dark:bg-[radial-gradient(circle_at_top_left,rgba(148,163,184,0.14),transparent_32%),radial-gradient(circle_at_82%_10%,rgba(59,130,246,0.14),transparent_24%)]" />

      <main className="relative z-[1] flex min-h-screen items-center px-4 py-20 md:px-6">
        <div className="container-shell grid gap-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(360px,460px)] lg:items-center">
          <section className="space-y-6">
            <BrandLogo textClassName="text-[2rem]" />

            <div className="space-y-4">
              <p className="section-label">Account Recovery</p>
              <h1 className="text-[clamp(2.6rem,5vw,4.5rem)] leading-[0.94] tracking-[-0.07em] text-[var(--text-primary)]">
                Reset access without losing your prep rhythm.
              </h1>
              <p className="max-w-xl text-sm leading-7 text-[var(--text-secondary)] md:text-base">
                Request a reset email, open the secure link, and set a new
                password. Your saved progress, streaks, and review history stay
                right where you left them.
              </p>
            </div>

            <div className="space-y-3">
              {[
                "Reset links bring users back here to choose a new password.",
                "Existing dashboards, bookmarks, and performance history stay intact.",
                "If a link expires, users can request another one immediately.",
              ].map(item => (
                <div
                  key={item}
                  className="flex items-start gap-3 rounded-[22px] border border-[var(--border)] bg-[var(--surface-1)] px-4 py-4 shadow-[var(--shadow-sm)]"
                >
                  <ShieldCheck
                    size={18}
                    className="mt-0.5 shrink-0 text-[var(--brand)]"
                  />
                  <p className="text-sm leading-7 text-[var(--text-secondary)]">
                    {item}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="card overflow-hidden rounded-[28px] p-0">
            <div className="h-1 w-full bg-[linear-gradient(90deg,var(--brand-light)_0%,var(--accent)_100%)]" />

            {passwordUpdated ? (
              <div className="px-6 py-8 text-center md:px-8">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-[rgba(21,128,61,0.16)] bg-[rgba(21,128,61,0.08)] text-[var(--green)]">
                  <CheckCircle2 size={30} />
                </div>
                <h2 className="mt-5 text-[2rem] font-semibold tracking-[-0.04em] text-[var(--text-primary)]">
                  Password updated
                </h2>
                <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">
                  Your password has been changed successfully. You can head
                  straight back into your dashboard now.
                </p>
                <button
                  type="button"
                  onClick={() => setLocation("/dashboard")}
                  className="btn-primary mt-8 w-full justify-center"
                >
                  Go to dashboard
                  <ArrowRight size={16} />
                </button>
              </div>
            ) : mode === "update" ? (
              <form
                onSubmit={handleUpdatePassword}
                className="px-6 py-8 md:px-8"
                noValidate
              >
                <p className="section-label">Choose New Password</p>
                <h2 className="mt-3 text-[2rem] font-semibold tracking-[-0.04em] text-[var(--text-primary)]">
                  Set a fresh password
                </h2>
                <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">
                  Use something memorable and secure so you can get back to
                  solving questions.
                </p>

                <div className="mt-7 space-y-4">
                  <div>
                    <label
                      htmlFor="reset-password"
                      className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]"
                    >
                      New password
                    </label>
                    <input
                      id="reset-password"
                      type="password"
                      autoComplete="new-password"
                      value={password}
                      onChange={event => setPassword(event.target.value)}
                      placeholder="At least 6 characters"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="reset-confirm-password"
                      className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]"
                    >
                      Confirm password
                    </label>
                    <input
                      id="reset-confirm-password"
                      type="password"
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={event => setConfirmPassword(event.target.value)}
                      placeholder="Repeat your password"
                    />
                  </div>
                </div>

                {error ? (
                  <div className="mt-4 rounded-[18px] border border-[rgba(220,38,38,0.16)] bg-[rgba(220,38,38,0.08)] px-4 py-3 text-sm text-[var(--red)]">
                    {error}
                  </div>
                ) : null}

                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary mt-4 w-full justify-center"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Updating password...
                    </>
                  ) : (
                    <>
                      Save new password
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </form>
            ) : (
              <form
                onSubmit={handleSendResetEmail}
                className="px-6 py-8 md:px-8"
                noValidate
              >
                <p className="section-label">Reset Link</p>
                <h2 className="mt-3 text-[2rem] font-semibold tracking-[-0.04em] text-[var(--text-primary)]">
                  Send a password-reset email
                </h2>
                <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">
                  Enter the email address used for PrepBros and we&apos;ll send
                  a secure recovery link.
                </p>

                {emailSent ? (
                  <div className="mt-7 rounded-[18px] border border-[rgba(37,99,235,0.16)] bg-[rgba(37,99,235,0.08)] px-4 py-4">
                    <div className="flex items-start gap-3">
                      <Mail
                        size={18}
                        className="mt-0.5 shrink-0 text-[var(--blue)]"
                      />
                      <p className="text-sm leading-7 text-[var(--text-secondary)]">
                        Check{" "}
                        <span className="font-semibold text-[var(--text-primary)]">
                          {email.trim()}
                        </span>{" "}
                        for your reset link. If it doesn&apos;t arrive soon,
                        check spam or request a fresh email.
                      </p>
                    </div>
                  </div>
                ) : null}

                <div className="mt-7">
                  <label
                    htmlFor="reset-email"
                    className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]"
                  >
                    Email address
                  </label>
                  <input
                    id="reset-email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={event => setEmail(event.target.value)}
                    placeholder="you@example.com"
                  />
                </div>

                {error ? (
                  <div className="mt-4 rounded-[18px] border border-[rgba(220,38,38,0.16)] bg-[rgba(220,38,38,0.08)] px-4 py-3 text-sm text-[var(--red)]">
                    {error}
                  </div>
                ) : null}

                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary mt-4 w-full justify-center"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Sending reset link...
                    </>
                  ) : (
                    <>
                      Email me the reset link
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>

                <p className="mt-5 text-center text-sm text-[var(--text-secondary)]">
                  Remembered it?{" "}
                  <Link href="/">
                    <span className="cursor-pointer font-semibold text-[var(--brand)]">
                      Back to login
                    </span>
                  </Link>
                </p>
              </form>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
