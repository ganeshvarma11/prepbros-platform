import { useEffect, useState } from "react";
import { Loader2, Mail, MessageSquareMore, ShieldCheck } from "lucide-react";

import AppShell from "@/components/AppShell";
import SectionHeader from "@/components/SectionHeader";
import { trackEvent } from "@/lib/analytics";
import { supabase } from "@/lib/supabase";

const faq = [
  {
    title: "How do I report a wrong question or explanation?",
    body: "Add a support workflow before launch that lets users report content issues quickly. Right now, you should route this through your support email and in-product feedback flow.",
  },
  {
    title: "How do I delete my account or data?",
    body: "You should operationalize a simple support process for deletion and privacy requests. If you expect scale, automate this later through account settings.",
  },
  {
    title: "What should users expect from support?",
    body: "For launch, set a clear response expectation such as 24 to 48 hours. Vague support channels reduce trust, especially for users coming from paid marketing.",
  },
];

export default function Support() {
  const [form, setForm] = useState({
    email: "",
    category: "Question issue",
    subject: "",
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
      category: category || current.category,
      subject: subject || current.subject,
      message: message || current.message,
    }));
  }, []);

  const submitRequest = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setResult(null);

    const { error } = await supabase.from("support_requests").insert({
      email: form.email,
      category: form.category,
      subject: form.subject,
      message: form.message,
      source: "support_page",
    });

    if (error) {
      setResult({
        ok: false,
        message:
          "We couldn't save your support request in-app. Please email hello@prepbros.com directly for now.",
      });
    } else {
      trackEvent("support_request_submitted", { category: form.category });
      setResult({ ok: true, message: "Support request submitted. You can expect a reply by email." });
      setForm({ email: "", category: "Question issue", subject: "", message: "" });
    }

    setSubmitting(false);
  };

  return (
    <AppShell>
      <div className="container-shell space-y-6">
          <div className="glass-panel rounded-[32px] px-6 py-8 md:px-8 md:py-10">
            <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
              <div>
                <SectionHeader
                  eyebrow="Support"
                  title="Support needs to feel reachable before you launch."
                  description="A domain and polished UI help, but users trust products more when support and issue resolution feel real and visible."
                />
              </div>
              <div className="rounded-[28px] border border-[var(--border)] bg-[var(--bg-card-strong)] p-6">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--brand-subtle)] text-[var(--brand)]">
                  <Mail size={18} />
                </div>
                <p className="mt-5 text-2xl font-semibold tracking-[-0.05em] text-[var(--text-primary)]">
                  hello@prepbros.com
                </p>
                <p className="mt-2 text-sm text-[var(--text-secondary)]">
                  Replace this with your real monitored inbox before launch if needed.
                </p>
                <a href="mailto:hello@prepbros.com" className="btn-primary mt-5 inline-flex rounded-full px-5 py-3">
                  Email support
                </a>
              </div>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
            <div className="glass-panel rounded-[32px] p-6 md:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--brand)]">Support principles</p>
              <div className="mt-5 space-y-4">
                {[
                  { icon: MessageSquareMore, title: "Fast issue routing", body: "Question quality, login issues, and payment questions should have obvious paths." },
                  { icon: ShieldCheck, title: "Trust and safety", body: "Support is part of trust. It matters even more when you have new users from social campaigns." },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.title} className="rounded-[28px] border border-[var(--border)] bg-[var(--bg-card-strong)] p-5">
                      <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--bg-subtle)] text-[var(--brand)]">
                        <Icon size={18} />
                      </div>
                      <p className="mt-4 text-lg font-semibold text-[var(--text-primary)]">{item.title}</p>
                      <p className="mt-2 text-sm leading-7 text-[var(--text-secondary)]">{item.body}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="glass-panel rounded-[32px] p-6 md:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--brand)]">Contact form</p>
              <form onSubmit={submitRequest} className="mt-5 space-y-4">
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                  placeholder="Your email"
                  className="input"
                />
                <select
                  value={form.category}
                  onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))}
                  className="w-full"
                >
                  {["Question issue", "Account issue", "Billing issue", "Feature request", "General support"].map((option) => (
                    <option key={option}>{option}</option>
                  ))}
                </select>
                <input
                  type="text"
                  required
                  value={form.subject}
                  onChange={(event) => setForm((current) => ({ ...current, subject: event.target.value }))}
                  placeholder="Subject"
                  className="input"
                />
                <textarea
                  required
                  value={form.message}
                  onChange={(event) => setForm((current) => ({ ...current, message: event.target.value }))}
                  placeholder="How can we help?"
                  rows={5}
                  className="input resize-none"
                />
                {result ? (
                  <div className={`rounded-[24px] border px-4 py-3 text-sm ${result.ok ? "border-[var(--green)]/20 bg-[var(--green-bg)] text-[var(--green)]" : "border-[var(--yellow)]/20 bg-[var(--yellow-bg)] text-[var(--yellow)]"}`}>
                    {result.message}
                  </div>
                ) : null}
                <button type="submit" disabled={submitting} className="btn-primary rounded-full px-6 py-3">
                  {submitting ? <Loader2 size={16} className="animate-spin" /> : null}
                  {submitting ? "Submitting..." : "Submit request"}
                </button>
              </form>
              <div className="mt-6 space-y-4">
                {faq.map((item) => (
                  <div key={item.title} className="rounded-[28px] border border-[var(--border)] bg-[var(--bg-card-strong)] p-5">
                    <p className="text-lg font-semibold text-[var(--text-primary)]">{item.title}</p>
                    <p className="mt-2 text-sm leading-7 text-[var(--text-secondary)]">{item.body}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
      </div>
    </AppShell>
  );
}
