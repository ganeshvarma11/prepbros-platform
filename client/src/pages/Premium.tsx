import { ArrowRight, Check } from "lucide-react";

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
      <div className="container-shell py-4 md:py-8">
        <div className="mx-auto max-w-6xl rounded-[28px] border border-white/6 bg-[radial-gradient(circle_at_top,rgba(246,140,33,0.08),transparent_22%),linear-gradient(180deg,#121014_0%,#0d0b11_100%)] px-5 py-10 md:px-10 md:py-16">
          <header className="mx-auto max-w-2xl text-center">
            <h1 className="text-4xl font-semibold tracking-[-0.06em] text-[var(--text-primary)] md:text-6xl">
              Premium
            </h1>
            <p className="mt-4 text-base leading-7 text-[var(--text-secondary)] md:text-xl">
              Choose a plan that fits your preparation cycle.
            </p>
          </header>

          <section className="mx-auto mt-12 grid max-w-6xl gap-5 lg:grid-cols-3">
            {plans.map(plan => {
              const paidPlanKey =
                plan.planKey === "monthly" || plan.planKey === "annual"
                  ? plan.planKey
                  : null;

              return (
                <article
                  key={plan.name}
                  className={`relative rounded-[24px] border px-7 py-7 ${
                    plan.highlighted
                      ? "border-[rgba(246,140,33,0.28)] bg-[linear-gradient(180deg,rgba(29,23,24,0.98)_0%,rgba(18,15,19,0.98)_100%)] shadow-[0_18px_40px_-30px_rgba(246,140,33,0.35)]"
                      : "border-white/8 bg-[linear-gradient(180deg,rgba(25,21,28,0.94)_0%,rgba(18,15,21,0.94)_100%)]"
                  }`}
                >
                  {plan.highlighted ? (
                    <div className="absolute inset-x-0 top-0 rounded-t-[24px] border-b border-[rgba(246,140,33,0.16)] bg-[linear-gradient(90deg,rgba(246,140,33,0.18),rgba(246,140,33,0.04))] px-7 py-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--brand-light)]">
                      Most Popular
                    </div>
                  ) : null}

                  <div className={plan.highlighted ? "pt-10" : ""}>
                    <h2 className="text-3xl font-semibold tracking-[-0.05em] text-[var(--text-primary)]">
                      {plan.name}
                    </h2>

                    <div className="mt-5 flex items-end gap-2">
                      <span className="text-6xl font-semibold tracking-[-0.07em] text-[var(--text-primary)]">
                        {plan.price}
                      </span>
                      {plan.period ? (
                        <span className="pb-2 text-base text-[var(--text-muted)]">
                          {plan.period}
                        </span>
                      ) : null}
                    </div>

                    <div className="mt-5 h-px bg-white/8" />

                    <div className="mt-6 space-y-4">
                      {plan.features.map(feature => (
                        <div key={feature} className="flex items-start gap-3">
                          <Check
                            size={18}
                            className={
                              plan.highlighted
                                ? "mt-0.5 text-[var(--brand)]"
                                : "mt-0.5 text-[#7fd36e]"
                            }
                          />
                          <span className="text-sm leading-7 text-[var(--text-secondary)] md:text-[1.02rem]">
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
                        plan.highlighted
                          ? "btn-primary mt-10 w-full py-3.5 text-base"
                          : "btn-secondary mt-10 w-full border-white/8 bg-transparent py-3.5 text-base text-[var(--text-primary)] hover:bg-white/4"
                      }
                    >
                      {plan.cta}
                    </button>
                  </div>
                </article>
              );
            })}
          </section>

          <section className="mx-auto mt-8 max-w-4xl">
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-center text-sm leading-6 text-[var(--text-muted)] md:text-base">
              {trustPoints.map((item, index) => (
                <div key={item} className="inline-flex items-center gap-4">
                  {index > 0 ? (
                    <span className="hidden text-white/20 md:inline">•</span>
                  ) : null}
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="mx-auto mt-10 max-w-5xl border-y border-white/6 px-1 py-7">
            <div className="grid gap-1 md:grid-cols-2 md:gap-x-10">
              {faqs.map((item, index) => (
                <div
                  key={item.question}
                  className={`py-4 ${
                    index < faqs.length - 2
                      ? "border-b border-white/6 md:border-b-0"
                      : ""
                  } ${index % 2 === 0 ? "md:border-r md:border-white/6 md:pr-10" : "md:pl-10"}`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-lg font-medium tracking-[-0.03em] text-[var(--text-primary)]">
                      {item.question}
                    </p>
                    <ArrowRight
                      size={16}
                      className="shrink-0 text-[var(--text-muted)]"
                    />
                  </div>
                  <p className="mt-3 max-w-[34ch] text-sm leading-7 text-[var(--text-secondary)]">
                    {item.answer}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </AppShell>
  );
}
