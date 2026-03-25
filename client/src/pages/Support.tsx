import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

import AppShell from "@/components/AppShell";
import { trackEvent } from "@/lib/analytics";
import { supabase } from "@/lib/supabase";

const fieldClassName =
  "w-full rounded-2xl border border-white/10 bg-white/4 px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-white/18 focus:bg-white/6";

export default function Support() {
  const [form, setForm] = useState({
    email: "",
    issue: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<null | { ok: boolean; message: string }>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const category = params.get("category");
    const subject = params.get("subject");
    const message = params.get("message");

    if (!category && !subject && !message) return;

    setForm((current) => ({
      ...current,
      issue: subject || category || current.issue,
      message: message || current.message,
    }));
  }, []);

  const submitRequest = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setResult(null);

    const { error } = await supabase.from("support_requests").insert({
      email: form.email,
      category: "General support",
      subject: form.issue,
      message: form.message,
      source: "support_page",
    });

    if (error) {
      setResult({
        ok: false,
        message:
          "We couldn't save your request here. Please email hello@prepbros.com directly and we'll help from there.",
      });
    } else {
      trackEvent("support_request_submitted", { category: "General support" });
      setResult({
        ok: true,
        message: "Request submitted. We'll get back to you by email as soon as possible.",
      });
      setForm({ email: "", issue: "", message: "" });
    }

    setSubmitting(false);
  };

  return (
    <AppShell contentClassName="max-w-[960px]">
      <div className="flex min-h-[calc(100vh-7rem)] items-center justify-center">
        <section className="w-full max-w-[620px] px-4 py-10 sm:px-6">
          <div className="text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/38">
              Support
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-[-0.06em] text-white sm:text-5xl">
              How can we help?
            </h1>
            <p className="mx-auto mt-4 max-w-[540px] text-base leading-7 text-white/58 sm:text-lg">
              Send us the issue and we&apos;ll reply as quickly as we can. Clean, direct support
              works better than extra clutter.
            </p>
          </div>

          <div className="mt-10 border-t border-white/10 pt-8">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/35">
              Support email
            </p>
            <a
              href="mailto:hello@prepbros.com"
              className="mt-3 inline-block text-xl font-medium tracking-[-0.03em] text-white transition hover:text-white/80 sm:text-2xl"
            >
              hello@prepbros.com
            </a>
            <p className="mt-2 text-sm leading-6 text-white/46">
              Prefer email? You can always reach us directly there.
            </p>
          </div>

          <form onSubmit={submitRequest} className="mt-10 space-y-5">
            <div className="space-y-2">
              <label htmlFor="support-email" className="text-sm text-white/60">
                Email
              </label>
              <input
                id="support-email"
                type="email"
                required
                value={form.email}
                onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                placeholder="you@example.com"
                className={fieldClassName}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="support-issue" className="text-sm text-white/60">
                Issue
              </label>
              <input
                id="support-issue"
                type="text"
                required
                value={form.issue}
                onChange={(event) => setForm((current) => ({ ...current, issue: event.target.value }))}
                placeholder="Login problem, billing question, wrong answer..."
                className={fieldClassName}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="support-message" className="text-sm text-white/60">
                Message
              </label>
              <textarea
                id="support-message"
                required
                value={form.message}
                onChange={(event) => setForm((current) => ({ ...current, message: event.target.value }))}
                placeholder="Tell us what happened and what you need help with."
                rows={6}
                className={`${fieldClassName} resize-none`}
              />
            </div>

            {result ? (
              <div
                className={`text-sm leading-6 ${
                  result.ok ? "text-[#91d6a3]" : "text-[#f0b36c]"
                }`}
              >
                {result.message}
              </div>
            ) : null}

            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium disabled:opacity-70"
              >
                {submitting ? <Loader2 size={16} className="animate-spin" /> : null}
                {submitting ? "Submitting..." : "Submit request"}
              </button>
            </div>
          </form>
        </section>
      </div>
    </AppShell>
  );
}
