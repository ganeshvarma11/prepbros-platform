import { Check, ExternalLink, ShieldCheck, Sparkles, Zap } from "lucide-react";

import AppShell from "@/components/AppShell";
import { trackEvent } from "@/lib/analytics";
import {
  getPremiumCheckoutUrl,
  getPremiumSupportUrl,
  siteConfig,
} from "@/lib/siteConfig";

type PremiumPlanKey = "free" | "monthly" | "annual";

type Plan = {
  name: string;
  price: string;
  period: string;
  description: string;
  cta: string;
  planKey: PremiumPlanKey;
  highlighted: boolean;
  features: string[];
};

const plans: Plan[] = [
  {
    name: "Free",
    price: "₹0",
    period: "forever",
    description: "Good for early practice and habit building.",
    cta: "Current free plan",
    planKey: "free",
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
    cta: "Start monthly checkout",
    planKey: "monthly",
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
    cta: "Start annual checkout",
    planKey: "annual",
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
      "Billing terms, renewal behavior, and refund handling are described in the Terms page. If you need help with a payment or access issue, billing support is available by email.",
  },
  {
    question: "Why pay if the core product is already useful?",
    answer:
      "The premium layer should focus on volume, richer analytics, planning, and a stronger serious-aspirant workflow rather than locking the entire product behind a paywall.",
  },
];

export default function Premium() {
  const handlePlanClick = (plan: "monthly" | "annual") => {
    const checkoutUrl = getPremiumCheckoutUrl(plan);

    if (checkoutUrl) {
      trackEvent("premium_checkout_started", {
        plan,
        provider: siteConfig.paymentProviderLabel,
      });
      window.location.assign(checkoutUrl);
      return;
    }

    trackEvent("premium_checkout_fallback_opened", { plan });
    window.location.assign(getPremiumSupportUrl(plan));
  };

  return (
    <AppShell>
      <div className="container-shell space-y-8">
        <section className="rounded-[24px] border border-[var(--border)] bg-[linear-gradient(180deg,#1b1b1b_0%,#151515_100%)] p-6 md:p-10">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--brand-muted)] bg-[var(--brand-subtle)] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--brand-light)]">
              <Sparkles size={12} />
              PrepBros Pro
            </div>
            <h1 className="mt-5 text-4xl font-semibold tracking-[-0.06em] text-[var(--text-primary)] md:text-6xl">
              Simple plans and a clean checkout path for serious prep.
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-8 text-[var(--text-secondary)]">
              Paid checkout on PrepBros uses hosted payment links. If a checkout link has not been
              configured for a plan yet, we send the user straight to billing support instead of
              showing a dead button.
            </p>
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-3">
          {plans.map((plan) => {
            const paidPlanKey =
              plan.planKey === "monthly" || plan.planKey === "annual"
                ? plan.planKey
                : null;
            const checkoutReady =
              paidPlanKey !== null
                ? Boolean(getPremiumCheckoutUrl(paidPlanKey))
                : false;

            return (
              <div
                key={plan.name}
                className={`rounded-[20px] border p-6 ${
                  plan.highlighted
                    ? "border-[var(--brand-muted)] bg-[linear-gradient(180deg,#2a2114_0%,#191919_100%)] shadow-[0_18px_44px_-28px_rgba(255,161,22,0.35)]"
                    : "border-[var(--border)] bg-[var(--bg-card)]"
                }`}
              >
                <div className="flex flex-wrap items-center gap-2">
                  {plan.highlighted ? (
                    <div className="inline-flex items-center gap-2 rounded-full border border-[var(--brand-muted)] bg-[var(--brand-subtle)] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--brand-light)]">
                      <Zap size={12} />
                      Most popular
                    </div>
                  ) : null}

                  {paidPlanKey !== null ? (
                    <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--bg-card-strong)] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]">
                      <ShieldCheck size={12} />
                      {checkoutReady ? "Checkout ready" : "Support fallback"}
                    </div>
                  ) : null}
                </div>

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

                {plan.planKey === "free" ? (
                  <button className="btn-secondary mt-6 w-full py-3" disabled>
                    {plan.cta}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      if (paidPlanKey) handlePlanClick(paidPlanKey);
                    }}
                    className={plan.highlighted ? "btn-primary mt-6 w-full py-3" : "btn-secondary mt-6 w-full py-3"}
                  >
                    <span className="inline-flex items-center gap-2">
                      {checkoutReady ? plan.cta : "Contact billing support"}
                      <ExternalLink size={15} />
                    </span>
                  </button>
                )}

                <div className="mt-6 space-y-3">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-start gap-3">
                      <Check size={16} className="mt-0.5 text-[var(--accent)]" />
                      <span className="text-sm leading-7 text-[var(--text-secondary)]">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </section>

        <section className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
          <div className="rounded-[20px] border border-[var(--border)] bg-[var(--bg-card)] p-6 md:p-8">
            <h2 className="text-2xl font-semibold tracking-[-0.04em] text-[var(--text-primary)]">
              Billing and checkout
            </h2>
            <div className="mt-6 space-y-4 text-sm leading-7 text-[var(--text-secondary)]">
              <p>
                Paid plans use {siteConfig.paymentProviderLabel}. Taxes, final pricing, renewal
                details, and payment confirmation are shown during checkout.
              </p>
              <p>
                If checkout is not configured for a plan yet, PrepBros routes the user to billing
                support instead of pretending billing is live.
              </p>
              <p>
                Billing help:{" "}
                <a
                  href={`mailto:${siteConfig.billingEmail}`}
                  className="text-[var(--brand)] transition hover:opacity-80"
                >
                  {siteConfig.billingEmail}
                </a>
              </p>
            </div>
          </div>

          <div className="rounded-[20px] border border-[var(--border)] bg-[var(--bg-card)] p-6 md:p-8">
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
          </div>
        </section>
      </div>
    </AppShell>
  );
}
