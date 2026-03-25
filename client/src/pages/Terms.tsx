import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import SectionHeader from "@/components/SectionHeader";
import { siteConfig } from "@/lib/siteConfig";

const sections = [
  {
    title: "Use of the platform",
    body: "PrepBros is provided for exam preparation, self-study, and educational practice. You agree not to misuse the service, bypass access controls, scrape protected content, interfere with platform availability, or use the service for unlawful activity.",
  },
  {
    title: "Accounts and access",
    body: "You are responsible for keeping your login credentials secure and for activity that happens under your account. PrepBros may suspend, restrict, or remove accounts involved in abuse, fraud, payment disputes, platform attacks, or harmful conduct.",
  },
  {
    title: "Content and accuracy",
    body: "PrepBros aims to provide high-quality educational content, but explanations, rankings, recommendations, and resources are provided for study support only. They are not official exam authority statements, legal advice, or guarantees of success.",
  },
  {
    title: "Premium and payments",
    body: "Paid plans, if offered, are billed through hosted checkout links or another approved checkout flow. Plan pricing, taxes, billing intervals, renewal behavior, and any applicable checkout terms are shown at checkout. Access to paid features may be limited, paused, or revoked for failed payments, abuse, fraud review, or chargebacks.",
  },
  {
    title: "Cancellations, refunds, and billing support",
    body: "If a paid plan renews automatically, you are responsible for cancelling before the next billing cycle if you do not want to continue. Except where required by law, fees already paid are generally non-refundable once a billing period begins, though PrepBros may review clear duplicate charges, accidental purchases, or billing errors in good faith. Billing help is available at the support email listed below.",
  },
  {
    title: "Intellectual property and copyright",
    body: "The PrepBros name, branding, UI, question formatting, explanations, analytics presentation, and original educational materials are owned by PrepBros or its licensors and are protected by copyright and other applicable laws. You may not copy, resell, republish, or systematically extract protected content without written permission. If you believe material on the platform infringes your rights, contact support with the relevant details.",
  },
  {
    title: "Limitation of liability",
    body: "PrepBros is provided on an as-available and as-is basis. To the maximum extent permitted by applicable law, PrepBros is not liable for indirect, incidental, special, consequential, or punitive damages, or for loss of data, revenue, or study outcomes arising from your use of the service.",
  },
];

export default function Terms() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="px-4 py-8 md:py-10">
        <div className="container-shell space-y-6">
          <div className="glass-panel rounded-[32px] px-6 py-8 md:px-8 md:py-10">
            <SectionHeader
              eyebrow="Terms of service"
              title="The rules, rights, and billing terms that apply to using PrepBros."
              description={`Effective ${siteConfig.legalEffectiveDate}. These terms govern access to ${siteConfig.siteName}, including free and paid product surfaces.`}
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
                  Governing law and contact
                </h2>
                <div className="mt-3 space-y-3 text-sm leading-7 text-[var(--text-secondary)]">
                  <p>
                    These terms are governed by the laws of {siteConfig.governingLaw}, unless
                    applicable law requires otherwise.
                  </p>
                  <p>
                    For support, billing, copyright, or legal notices, contact{" "}
                    <a
                      href={`mailto:${siteConfig.supportEmail}`}
                      className="text-[var(--brand)] transition hover:opacity-80"
                    >
                      {siteConfig.supportEmail}
                    </a>
                    .
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
