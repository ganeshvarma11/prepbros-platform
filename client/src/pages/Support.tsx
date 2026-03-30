import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

import AppShell from "@/components/AppShell";
import PageHeader from "@/components/PageHeader";
import { useAuth } from "@/contexts/AuthContext";
import { trackEvent } from "@/lib/analytics";
import { buildMailtoLink, siteConfig } from "@/lib/siteConfig";
import { supabase } from "@/lib/supabase";

async function saveSupportRequestDirectly(form: {
  email: string;
  issue: string;
  message: string;
}) {
  const { error } = await supabase.from("support_requests").insert({
    email: form.email,
    category: "General support",
    subject: form.issue,
    message: form.message,
    source: "support_page_direct",
  });

  return { error };
}

export default function Support() {
  const { user } = useAuth();
  const supportEmail = siteConfig.supportEmail;
  const [form, setForm] = useState({
    email: "",
    issue: "",
    message: "",
    website: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<null | { ok: boolean; message: string }>(
    null
  );

  useEffect(() => {
    if (!user?.email) return;

    setForm(current =>
      current.email ? current : { ...current, email: user.email || "" }
    );
  }, [user?.email]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const category = params.get("category");
    const subject = params.get("subject");
    const message = params.get("message");

    if (!category && !subject && !message) return;

    setForm(current => ({
      ...current,
      issue: subject || category || current.issue,
      message: message || current.message,
    }));
  }, []);

  const submitRequest = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setResult(null);

    let successMessage =
      "Request submitted. We'll get back to you by email as soon as possible.";

    try {
      const response = await fetch("/api/support", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const payload = (await response.json().catch(() => null)) as {
        ok?: boolean;
        message?: string;
      } | null;

      if (!response.ok || !payload?.ok) {
        if (response.status < 500) {
          setResult({
            ok: false,
            message:
              payload?.message ||
              "We couldn't submit your request. Please check the form and try again.",
          });
          setSubmitting(false);
          return;
        }

        throw new Error(payload?.message || "Support API request failed");
      }

      successMessage = payload.message || successMessage;
    } catch (apiError) {
      const { error } = await saveSupportRequestDirectly(form);

      if (error) {
        setResult({
          ok: false,
          message: `We couldn't deliver your request right now. Please email ${supportEmail} directly and we'll help from there.`,
        });
        setSubmitting(false);
        return;
      }

      console.warn(
        "Support API unavailable, saved request directly instead.",
        apiError
      );
      successMessage = `Request saved successfully. If you need an urgent reply, email ${supportEmail} directly too.`;
    }

    trackEvent("support_request_submitted", { category: "General support" });
    setResult({
      ok: true,
      message: successMessage,
    });
    setForm({
      email: user?.email || "",
      issue: "",
      message: "",
      website: "",
    });

    setSubmitting(false);
  };

  return (
    <AppShell contentClassName="max-w-[960px]">
      <div className="mx-auto flex min-h-[calc(100vh-7rem)] w-full max-w-[860px] flex-col justify-center gap-6">
        <PageHeader
          eyebrow="Support"
          title="How can we help?"
          description="Send us the issue and we'll reply as quickly as we can. Clean, direct support works better than extra clutter."
          align="center"
        />

        <section className="card grid gap-5 p-5 md:grid-cols-[minmax(0,1fr)_280px] md:p-6">
          <div>
            <p className="section-label">Support email</p>
            <div className="mt-4">
              <a
                href={buildMailtoLink(supportEmail)}
                className="inline-block text-[1.65rem] font-medium tracking-[-0.03em] text-[var(--text-1)] transition hover:text-[var(--brand)] sm:text-[1.9rem]"
              >
                {supportEmail}
              </a>
              <p className="mt-2 text-sm leading-6 text-[var(--text-2)]">
                Prefer email? You can always reach us directly there.
              </p>
            </div>
          </div>

          <div className="rounded-[24px] border border-[var(--border)] bg-[var(--surface-1)] p-5 shadow-[var(--shadow-sm)]">
            <p className="section-label">Response style</p>
            <p className="mt-3 text-lg font-semibold tracking-[-0.03em] text-[var(--text-primary)]">
              Clear, direct, and human.
            </p>
            <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
              Send the issue with enough context and we&apos;ll keep the reply
              practical and concise.
            </p>
          </div>
        </section>

        <form onSubmit={submitRequest} className="card space-y-5">
          <input
            type="text"
            name="website"
            value={form.website}
            onChange={event =>
              setForm(current => ({ ...current, website: event.target.value }))
            }
            tabIndex={-1}
            autoComplete="off"
            className="hidden"
            aria-hidden="true"
          />

          <div className="space-y-2">
            <label
              htmlFor="support-email"
              className="text-sm text-[var(--text-2)]"
            >
              Email
            </label>
            <input
              id="support-email"
              type="email"
              required
              value={form.email}
              onChange={event =>
                setForm(current => ({ ...current, email: event.target.value }))
              }
              placeholder="you@example.com"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="support-issue"
              className="text-sm text-[var(--text-2)]"
            >
              Issue
            </label>
            <input
              id="support-issue"
              type="text"
              required
              value={form.issue}
              onChange={event =>
                setForm(current => ({ ...current, issue: event.target.value }))
              }
              placeholder="Login problem, billing question, wrong answer..."
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="support-message"
              className="text-sm text-[var(--text-2)]"
            >
              Message
            </label>
            <textarea
              id="support-message"
              required
              value={form.message}
              onChange={event =>
                setForm(current => ({
                  ...current,
                  message: event.target.value,
                }))
              }
              placeholder="Tell us what happened and what you need help with."
              rows={6}
              className="resize-none"
            />
          </div>

          {result ? (
            <div
              className={`rounded-[18px] border px-4 py-3 text-sm leading-6 ${
                result.ok
                  ? "border-[rgba(21,128,61,0.16)] bg-[rgba(21,128,61,0.08)] text-[var(--green)]"
                  : "border-[rgba(220,38,38,0.16)] bg-[rgba(220,38,38,0.08)] text-[var(--red)]"
              }`}
            >
              {result.message}
            </div>
          ) : null}

          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary inline-flex items-center gap-2 disabled:opacity-70"
            >
              {submitting ? (
                <Loader2 size={16} className="animate-spin" />
              ) : null}
              {submitting ? "Submitting..." : "Submit request"}
            </button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
