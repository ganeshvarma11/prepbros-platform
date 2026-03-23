import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import SectionHeader from "@/components/SectionHeader";

const sections = [
  {
    title: "Use of the platform",
    body: "PrepBros is intended for exam preparation, self-study, and practice. Users should not misuse the platform, attempt unauthorized access, or interfere with service availability.",
  },
  {
    title: "Accounts and access",
    body: "Users are responsible for account security and the activity that happens under their login. You may suspend or remove abusive, fraudulent, or harmful accounts.",
  },
  {
    title: "Content and accuracy",
    body: "Although PrepBros aims for high-quality educational content, users should not treat every explanation, resource, or ranking signal as an official or legally binding source.",
  },
  {
    title: "Premium and payments",
    body: "If you later introduce paid plans, refunds, billing terms, and renewal rules must be explicitly added here. Do not market paid offerings without updating this section first.",
  },
  {
    title: "Limitation of liability",
    body: "PrepBros is provided on an as-available basis. Before launch, this section should be reviewed properly if you expect scale, revenue, or reliance on the product for paid users.",
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
              title="You need real operating terms before you market publicly."
              description="This gives you a clear product-facing structure. Before launch, replace or refine anything that needs legal review based on your actual plans for payments, content, and support."
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
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
