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

const trustPoints = [
  "Secure checkout",
  "Taxes shown at payment",
  "Progress stays after upgrading",
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
    <AppShell>
      <div className="container-shell space-y-8 py-4 md:py-8">
        <PageHeader
          eyebrow="Progress"
          title="Premium"
          description="Choose a plan that fits your preparation cycle."
          align="center"
          crumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Premium" },
          ]}
        />

        <section className="card mx-auto grid max-w-6xl gap-6 overflow-hidden p-6 md:p-8 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div>
            <p className="section-label">Why premium</p>
            <h2 className="mt-3 text-[2.2rem] tracking-[-0.06em] text-[var(--text-primary)] md:text-[2.8rem]">
              A calmer upgrade for serious preparation.
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--text-secondary)] md:text-base">
              Premium is for aspirants who want less friction, deeper
              visibility, and more room to stay consistent over long prep
              cycles.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {trustPoints.map(item => (
                <span key={item} className="badge">
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-[24px] border border-[var(--border)] bg-[var(--surface-1)] p-5 shadow-[var(--shadow-sm)]">
            <p className="section-label">Best fit</p>
            <p className="mt-3 text-lg font-semibold tracking-[-0.03em] text-[var(--text-primary)]">
              Pro monthly
            </p>
            <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
              Start light, upgrade fast, and keep your current progress exactly
              where it is.
            </p>
            <button
              type="button"
              onClick={() => handlePlanClick("monthly")}
              className="btn-primary mt-5 w-full"
            >
              Upgrade now
              <ArrowRight size={15} />
            </button>
          </div>
        </section>

        <section className="mx-auto grid max-w-6xl gap-5 lg:grid-cols-3">
          {plans.map(plan => {
            const paidPlanKey =
              plan.planKey === "monthly" || plan.planKey === "annual"
                ? plan.planKey
                : null;

            return (
              <article
                key={plan.name}
                className={`card relative px-7 py-7 ${
                  plan.planKey === "free"
                    ? "border-[var(--border-strong)]"
                    : plan.highlighted
                      ? "border-[var(--brand-muted)] shadow-[var(--shadow-lg)]"
                      : ""
                }`}
              >
                {plan.highlighted ? (
                  <div className="absolute right-6 top-6">
                    <span className="badge-amber">Most Popular</span>
                  </div>
                ) : null}

                <div>
                  <h2 className="text-3xl font-medium tracking-[-0.05em] text-[var(--text-1)]">
                    {plan.name}
                  </h2>

                  <div className="mt-5 flex items-end gap-2">
                    <span className="font-serif text-6xl font-normal tracking-[-0.04em] text-[var(--text-1)]">
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
                        ? "btn-ghost mt-10 w-full cursor-not-allowed"
                        : "btn-primary mt-10 w-full"
                    }
                  >
                    {plan.cta}
                  </button>
                </div>
              </article>
            );
          })}
        </section>

        <section className="mx-auto max-w-4xl">
          <div className="card flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-center text-sm leading-6 text-[var(--text-2)] md:text-base">
            {trustPoints.map((item, index) => (
              <div key={item} className="inline-flex items-center gap-4">
                {index > 0 ? (
                  <span className="hidden text-[var(--text-3)] md:inline">
                    •
                  </span>
                ) : null}
                <span>{item}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-5xl">
          <div className="grid gap-4 md:grid-cols-2">
            {faqs.map(item => (
              <div key={item.question} className="card py-5">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-lg font-medium tracking-[-0.03em] text-[var(--text-1)]">
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
