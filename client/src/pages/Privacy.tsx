import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import SectionHeader from "@/components/SectionHeader";
import { siteConfig } from "@/lib/siteConfig";

const sections = [
  {
    title: "Information we collect",
    body: "PrepBros collects account details you provide, such as your email address, login metadata, target exam, profile settings, and any information you submit through support or onboarding. We also store product activity such as answers, bookmarks, streaks, preferences, and usage events needed to operate the service.",
  },
  {
    title: "How we use your information",
    body: "We use this information to authenticate accounts, save progress, personalize dashboards, improve question quality, respond to support requests, maintain platform security, and understand how users move through the product.",
  },
  {
    title: "Payments and billing data",
    body: "If you purchase a paid plan, checkout is handled by a hosted payment provider. PrepBros does not store full card details. We may receive limited transaction details such as plan, amount, currency, payment status, and provider reference information needed for billing support, fraud prevention, or access verification.",
  },
  {
    title: "Storage, vendors, and infrastructure",
    body: "PrepBros currently uses Supabase for authentication and application data, may use analytics tooling for product measurement, and may use a hosted payment provider for paid checkouts. These providers process data only to the extent needed to run the product, keep it secure, or complete transactions.",
  },
  {
    title: "Your choices and rights",
    body: "You can contact PrepBros to request account deletion, profile correction, billing help, or support access. Where required by applicable law, you may also request a copy of the personal data we reasonably maintain about your account.",
  },
  {
    title: "Retention and security",
    body: "We retain account, billing, and support records for as long as reasonably needed to operate the service, meet legal obligations, resolve disputes, and prevent abuse. We also take reasonable technical and organizational measures to protect data, but no online system can be guaranteed to be perfectly secure.",
  },
];

export default function Privacy() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="px-4 py-8 md:py-10">
        <div className="container-shell space-y-6">
          <div className="glass-panel rounded-[32px] px-6 py-8 md:px-8 md:py-10">
            <SectionHeader
              eyebrow="Privacy policy"
              title="How PrepBros collects, uses, and protects user data."
              description={`Effective ${siteConfig.legalEffectiveDate}. This policy applies to ${siteConfig.siteName}, its website, practice flows, support interactions, and paid checkout surfaces.`}
            />
          </div>

          <div className="glass-panel rounded-[32px] p-6 md:p-8">
            <div className="space-y-5">
              {sections.map((section) => (
                <section key={section.title} className="rounded-[28px] border border-[var(--border)] bg-[var(--bg-card-strong)] p-5">
                  <h2 className="text-xl font-semibold tracking-[-0.04em] text-[var(--text-primary)]">
                    {section.title}
                  </h2>
                  <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">{section.body}</p>
                </section>
              ))}

              <section className="rounded-[28px] border border-[var(--border)] bg-[var(--bg-card-strong)] p-5">
                <h2 className="text-xl font-semibold tracking-[-0.04em] text-[var(--text-primary)]">
                  Contact
                </h2>
                <div className="mt-3 space-y-3 text-sm leading-7 text-[var(--text-secondary)]">
                  <p>
                    If you have privacy, billing, or data requests, contact{" "}
                    <a
                      href={`mailto:${siteConfig.supportEmail}`}
                      className="text-[var(--brand)] transition hover:opacity-80"
                    >
                      {siteConfig.supportEmail}
                    </a>
                    .
                  </p>
                  <p>
                    Business details: {siteConfig.legalEntity}, {siteConfig.companyAddress}.
                  </p>
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
