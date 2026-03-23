import { Check, Sparkles, Zap } from "lucide-react";

import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

const plans = [
  {
    name: "Free",
    price: "₹0",
    period: "forever",
    description: "Good for early practice and habit building.",
    cta: "Current free plan",
    highlighted: false,
    features: [
      "10 daily MCQ questions",
      "Bookmarking and streak tracking",
      "Basic dashboard stats",
      "Resources and contest access",
    ],
  },
  {
    name: "Pro",
    price: "₹199",
    period: "per month",
    description: "For serious aspirants who want more volume and richer feedback.",
    cta: "Upgrade to Pro",
    highlighted: true,
    features: [
      "Unlimited question access",
      "Deeper analytics and review loops",
      "Priority support",
      "Personalized study planning",
      "Cleaner premium experience",
    ],
  },
  {
    name: "Annual",
    price: "₹999",
    period: "per year",
    description: "The best-value option for long preparation cycles.",
    cta: "Choose annual",
    highlighted: false,
    features: [
      "Everything in Pro",
      "Lower effective monthly cost",
      "Best for 6-12 month prep cycles",
      "Priority feature access later",
    ],
  },
];

const faqs = [
  {
    question: "Will my existing progress carry over if I upgrade?",
    answer:
      "Yes. Your answers, streaks, dashboard progress, bookmarks, and account data remain tied to your profile.",
  },
  {
    question: "Can I cancel anytime?",
    answer:
      "Yes. The cancellation flow should be explicit once payments are connected. Until then, this page acts as your pricing and packaging layer.",
  },
  {
    question: "Why pay if the core product is already useful?",
    answer:
      "The premium layer should focus on volume, richer analytics, planning, and a stronger serious-aspirant workflow rather than locking the entire product behind a paywall.",
  },
];

export default function Premium() {
  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="px-4 py-8 md:py-10">
        <div className="container-shell space-y-8">
          <section className="rounded-[24px] border border-[var(--border)] bg-[linear-gradient(180deg,#1b1b1b_0%,#151515_100%)] p-6 md:p-10">
            <div className="max-w-4xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-[var(--brand-muted)] bg-[var(--brand-subtle)] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--brand-light)]">
                <Sparkles size={12} />
                PrepBros Pro
              </div>
              <h1 className="mt-5 text-4xl font-semibold tracking-[-0.06em] text-[var(--text-primary)] md:text-6xl">
                Premium tools for longer, more serious preparation.
              </h1>
              <p className="mt-5 max-w-3xl text-base leading-8 text-[var(--text-secondary)]">
                The free layer should be genuinely useful. Pro should feel like the upgrade for
                aspirants who want higher question volume, better feedback loops, and a cleaner,
                more committed prep experience.
              </p>
            </div>
          </section>

          <section className="grid gap-5 lg:grid-cols-3">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-[20px] border p-6 ${
                  plan.highlighted
                    ? "border-[var(--brand-muted)] bg-[linear-gradient(180deg,#2a2114_0%,#191919_100%)] shadow-[0_18px_44px_-28px_rgba(255,161,22,0.35)]"
                    : "border-[var(--border)] bg-[var(--bg-card)]"
                }`}
              >
                {plan.highlighted ? (
                  <div className="inline-flex items-center gap-2 rounded-full border border-[var(--brand-muted)] bg-[var(--brand-subtle)] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--brand-light)]">
                    <Zap size={12} />
                    Most popular
                  </div>
                ) : null}
                <p className="mt-4 text-2xl font-semibold tracking-[-0.04em] text-[var(--text-primary)]">
                  {plan.name}
                </p>
                <p className="mt-2 text-sm text-[var(--text-secondary)]">{plan.description}</p>
                <div className="mt-6 flex items-end gap-2">
                  <span className="text-5xl font-semibold tracking-[-0.06em] text-[var(--text-primary)]">
                    {plan.price}
                  </span>
                  <span className="pb-2 text-sm text-[var(--text-muted)]">{plan.period}</span>
                </div>
                <button className={plan.highlighted ? "btn-primary mt-6 w-full py-3" : "btn-secondary mt-6 w-full py-3"}>
                  {plan.cta}
                </button>

                <div className="mt-6 space-y-3">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-start gap-3">
                      <Check size={16} className="mt-0.5 text-[var(--accent)]" />
                      <span className="text-sm leading-7 text-[var(--text-secondary)]">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </section>

          <section className="rounded-[20px] border border-[var(--border)] bg-[var(--bg-card)] p-6 md:p-8">
            <h2 className="text-2xl font-semibold tracking-[-0.04em] text-[var(--text-primary)]">
              Pricing FAQs
            </h2>
            <div className="mt-6 space-y-4">
              {faqs.map((item) => (
                <div key={item.question} className="rounded-[16px] border border-[var(--border)] bg-[var(--bg-card-strong)] p-5">
                  <p className="text-lg font-semibold text-[var(--text-primary)]">{item.question}</p>
                  <p className="mt-2 text-sm leading-7 text-[var(--text-secondary)]">{item.answer}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
