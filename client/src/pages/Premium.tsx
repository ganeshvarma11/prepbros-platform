import { ArrowRight, Check } from "lucide-react";

import AppShell from "@/components/AppShell";
import PageHeader from "@/components/PageHeader";
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
  period?: string;
  cta: string;
  planKey: PremiumPlanKey;
  highlighted: boolean;
  features: string[];
};

const plans: Plan[] = [
  {
    name: "Free",
    price: "₹0",
    cta: "Current plan",
    planKey: "free",
    highlighted: false,
    features: ["Daily practice access", "Limited analytics", "Basic resources"],
  },
  {
    name: "Pro",
    price: "₹199",
    period: "/ month",
    cta: "Upgrade Now",
    planKey: "monthly",
    highlighted: true,
    features: [
      "Unlimited question access",
      "Better analytics",
      "Priority support",
      "Study planning",
    ],
  },
  {
    name: "Annual",
    price: "₹999",
    period: "/ year",
    cta: "Upgrade Now",
    planKey: "annual",
    highlighted: false,
    features: [
      "Everything in Pro",
      "Lower effective cost",
      "Best for long-term prep",
    ],
  },
];

const faqs = [
  {
    question: "Can I cancel anytime?",
    answer:
      "Billing terms, renewals, and refund handling are shown during checkout and in the Terms page.",
  },
  {
    question: "Will my progress stay?",
    answer:
      "Yes. Answers, streaks, bookmarks, and dashboard progress remain tied to your account.",
  },
  {
    question: "How does billing work?",
    answer: `Paid plans use ${siteConfig.paymentProviderLabel}. Final pricing is shown during checkout.`,
  },
  {
    question: "Need billing help?",
    answer: `Email ${siteConfig.billingEmail} and we will help with access or payment questions.`,
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
    <AppShell contentClassName="max-w-[1120px]">
      <div className="space-y-8 py-4 md:py-8">
        <PageHeader
          eyebrow="Premium"
          title="Premium"
          description="Clear plans for learners who want more review depth, more access, and a steadier long-term prep setup."
          crumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Premium" },
          ]}
        />

        <section className="grid gap-4 lg:grid-cols-3">
          {plans.map(plan => {
            const paidPlanKey =
              plan.planKey === "monthly" || plan.planKey === "annual"
                ? plan.planKey
                : null;

            return (
              <article
                key={plan.name}
                className={`card relative flex h-full px-6 py-6 ${
                  plan.planKey === "free"
                    ? "border-[var(--border-strong)]"
                    : plan.highlighted
                      ? "border-[var(--brand-muted)] bg-[var(--surface-elevated)] shadow-[var(--shadow-lg)]"
                      : ""
                }`}
              >
                {plan.highlighted ? (
                  <div className="absolute right-6 top-6">
                    <span className="badge-amber">Most Popular</span>
                  </div>
                ) : null}

                <div className="flex h-full flex-col">
                  <h2 className="text-[2rem] font-semibold tracking-[-0.05em] text-[var(--text-1)]">
                    {plan.name}
                  </h2>

                  <div className="mt-5 flex items-end gap-2">
                    <span className="text-6xl font-semibold tracking-[-0.06em] text-[var(--text-1)]">
                      {plan.price}
                    </span>
                    {plan.period ? (
                      <span className="pb-2 text-base text-[var(--text-2)]">
                        {plan.period}
                      </span>
                    ) : null}
                  </div>

                  <div className="mt-5 h-px bg-[var(--border-1)]" />

                  <div className="mt-6 space-y-4">
                    {plan.features.map(feature => (
                      <div key={feature} className="flex items-start gap-3">
                        <Check
                          size={18}
                          className="mt-0.5 text-[var(--brand)]"
                        />
                        <span className="text-sm leading-7 text-[var(--text-2)] md:text-[1.02rem]">
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    disabled={plan.planKey === "free"}
                    onClick={() => {
                      if (paidPlanKey) handlePlanClick(paidPlanKey);
                    }}
                    className={
                      plan.planKey === "free"
                        ? "btn-ghost mt-auto w-full cursor-not-allowed"
                        : "btn-primary mt-auto w-full"
                    }
                  >
                    {plan.cta}
                  </button>
                </div>
              </article>
            );
          })}
        </section>

        <section>
          <div className="grid gap-4 md:grid-cols-2">
            {faqs.map(item => (
              <div key={item.question} className="card py-5">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-lg font-semibold tracking-[-0.03em] text-[var(--text-1)]">
                    {item.question}
                  </p>
                  <ArrowRight
                    size={16}
                    className="shrink-0 text-[var(--text-3)]"
                  />
                </div>
                <p className="mt-3 max-w-[34ch] text-sm leading-7 text-[var(--text-2)]">
                  {item.answer}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
