import {
  Check,
  CreditCard,
  ExternalLink,
  Mail,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";

import AppShell from "@/components/AppShell";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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
  priceNote?: string;
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
    priceNote: "Good for getting started",
    description: "Light daily practice with your basic progress tools.",
    cta: "Current free plan",
    planKey: "free",
    highlighted: false,
    features: [
      "10 daily MCQ questions",
      "Bookmarks and streaks",
      "Basic dashboard stats",
      "Resources and contests",
    ],
  },
  {
    name: "Pro",
    price: "₹199",
    period: "per month",
    priceNote: "Flexible monthly access",
    description:
      "For serious aspirants who want more volume, review depth, and support.",
    cta: "Start monthly checkout",
    planKey: "monthly",
    highlighted: true,
    features: [
      "Unlimited question access",
      "Deeper analytics",
      "Priority support",
      "Study planning",
      "Cleaner premium workspace",
    ],
  },
  {
    name: "Annual",
    price: "₹999",
    period: "per year",
    priceNote: "About ₹83 per month effective",
    description:
      "Best value for longer preparation cycles and sustained revision.",
    cta: "Start annual checkout",
    planKey: "annual",
    highlighted: false,
    features: [
      "Everything in Pro",
      "Lower effective monthly cost",
      "Best for 6-12 month prep",
      "Priority feature access later",
    ],
  },
];

const billingNotes = [
  "Paid plans use hosted checkout links with final taxes and pricing shown during payment.",
  "If a checkout link is not configured yet, we send you directly to billing support instead of showing a dead CTA.",
  "Your answers, streaks, bookmarks, and dashboard data stay on the same account after upgrading.",
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
      "Premium should add more volume, richer analytics, planning help, and a stronger serious-aspirant workflow rather than locking the entire product behind a paywall.",
  },
];

const compactStats = [
  {
    label: "Checkout",
    value: "Hosted links",
    detail: "Clean path when billing is ready.",
  },
  {
    label: "Fallback",
    value: "Direct support",
    detail: "No fake buttons or broken flows.",
  },
  {
    label: "Best value",
    value: "Annual plan",
    detail: "Lower effective monthly cost.",
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
      <div className="container-shell space-y-6">
        <section className="rounded-[22px] border border-[var(--border)] bg-[linear-gradient(180deg,#181818_0%,#121212_100%)] p-5 md:p-7">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-[var(--brand-muted)] bg-[var(--brand-subtle)] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--brand-light)]">
                <Sparkles size={12} />
                PrepBros Pro
              </div>
              <h1 className="mt-4 max-w-2xl text-3xl font-semibold tracking-[-0.06em] text-[var(--text-primary)] md:text-5xl">
                Cleaner pricing for focused prep.
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--text-secondary)] md:text-base">
                Compare plans quickly, choose your upgrade, and move straight
                into checkout or support without turning the screen into a wall
                of heavy cards.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 xl:w-[420px]">
              {compactStats.map(item => (
                <div
                  key={item.label}
                  className="rounded-[16px] border border-[var(--border)] bg-[rgba(255,255,255,0.02)] px-4 py-3"
                >
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
                    {item.label}
                  </p>
                  <p className="mt-2 text-sm font-semibold text-[var(--text-primary)]">
                    {item.value}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-[var(--text-muted)]">
                    {item.detail}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.9fr)]">
          <div className="rounded-[20px] border border-[var(--border)] bg-[var(--bg-card)] p-4 md:p-5">
            <div className="flex flex-col gap-2 border-b border-[var(--border)] pb-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
                  Plans
                </p>
                <h2 className="mt-1 text-2xl font-semibold tracking-[-0.04em] text-[var(--text-primary)]">
                  Small, clear comparison
                </h2>
              </div>
              <p className="max-w-md text-sm leading-6 text-[var(--text-secondary)]">
                Pick the access level that matches your prep cycle. Paid plans
                keep the same account and move you straight into checkout or
                support.
              </p>
            </div>

            <div className="mt-4 space-y-3">
              {plans.map(plan => {
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
                    className={`rounded-[18px] border px-4 py-4 ${
                      plan.highlighted
                        ? "border-[var(--brand-muted)] bg-[linear-gradient(180deg,rgba(246,140,33,0.08)_0%,rgba(255,255,255,0.02)_100%)]"
                        : "border-[var(--border)] bg-[rgba(255,255,255,0.02)]"
                    }`}
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          {plan.highlighted ? (
                            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--brand-muted)] bg-[var(--brand-subtle)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--brand-light)]">
                              <Zap size={11} />
                              Most popular
                            </div>
                          ) : null}

                          {plan.planKey === "annual" ? (
                            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[rgba(255,255,255,0.03)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]">
                              <ShieldCheck size={11} />
                              Best value
                            </div>
                          ) : null}

                          {paidPlanKey !== null ? (
                            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[rgba(255,255,255,0.03)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]">
                              <CreditCard size={11} />
                              {checkoutReady
                                ? "Checkout ready"
                                : "Support fallback"}
                            </div>
                          ) : null}
                        </div>

                        <div className="mt-3">
                          <div className="flex flex-wrap items-end gap-x-3 gap-y-1">
                            <p className="text-xl font-semibold tracking-[-0.04em] text-[var(--text-primary)]">
                              {plan.name}
                            </p>
                            {plan.priceNote ? (
                              <p className="text-xs font-medium uppercase tracking-[0.16em] text-[var(--text-muted)]">
                                {plan.priceNote}
                              </p>
                            ) : null}
                          </div>
                          <p className="mt-1 max-w-2xl text-sm leading-6 text-[var(--text-secondary)]">
                            {plan.description}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col gap-3 lg:min-w-[250px] lg:items-end">
                        <div className="flex items-end gap-2 lg:justify-end">
                          <span className="text-4xl font-semibold tracking-[-0.06em] text-[var(--text-primary)]">
                            {plan.price}
                          </span>
                          <span className="pb-1 text-sm text-[var(--text-muted)]">
                            {plan.period}
                          </span>
                        </div>

                        {plan.planKey === "free" ? (
                          <button
                            className="btn-secondary w-full py-2.5 sm:w-auto sm:px-5"
                            disabled
                          >
                            {plan.cta}
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              if (paidPlanKey) handlePlanClick(paidPlanKey);
                            }}
                            className={
                              plan.highlighted
                                ? "btn-primary w-full py-2.5 sm:w-auto sm:px-5"
                                : "btn-secondary w-full py-2.5 sm:w-auto sm:px-5"
                            }
                          >
                            <span className="inline-flex items-center gap-2">
                              {checkoutReady
                                ? plan.cta
                                : "Contact billing support"}
                              <ExternalLink size={15} />
                            </span>
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {plan.features.map(feature => (
                        <div
                          key={feature}
                          className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[rgba(255,255,255,0.02)] px-3 py-1.5 text-xs text-[var(--text-secondary)]"
                        >
                          <Check size={12} className="text-[var(--accent)]" />
                          {feature}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid content-start gap-4">
            <section className="rounded-[20px] border border-[var(--border)] bg-[var(--bg-card)] p-5">
              <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
                <ShieldCheck size={13} />
                Billing notes
              </div>
              <div className="mt-4 space-y-3">
                {billingNotes.map(item => (
                  <div
                    key={item}
                    className="rounded-[14px] border border-[var(--border)] bg-[rgba(255,255,255,0.02)] px-4 py-3"
                  >
                    <p className="text-sm leading-6 text-[var(--text-secondary)]">
                      {item}
                    </p>
                  </div>
                ))}
              </div>

              <a
                href={`mailto:${siteConfig.billingEmail}`}
                className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-[var(--brand)] transition hover:opacity-80"
              >
                <Mail size={14} />
                {siteConfig.billingEmail}
              </a>
            </section>
          </div>
        </section>

        <section className="rounded-[20px] border border-[var(--border)] bg-[var(--bg-card)] p-4 md:p-5">
          <div className="flex flex-col gap-2 border-b border-[var(--border)] pb-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
                FAQs
              </p>
              <h2 className="mt-1 text-2xl font-semibold tracking-[-0.04em] text-[var(--text-primary)]">
                Common pricing questions
              </h2>
            </div>
            <p className="max-w-md text-sm leading-6 text-[var(--text-secondary)]">
              Everything important is here, without turning the lower half of
              the page into another stack of large cards.
            </p>
          </div>

          <Accordion type="single" collapsible className="mt-2">
            {faqs.map((item, index) => (
              <AccordionItem
                key={item.question}
                value={`faq-${index}`}
                className="border-[var(--border)]"
              >
                <AccordionTrigger className="py-4 text-base font-semibold text-[var(--text-primary)] hover:no-underline">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="pb-4 text-sm leading-7 text-[var(--text-secondary)]">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>
      </div>
    </AppShell>
  );
}
