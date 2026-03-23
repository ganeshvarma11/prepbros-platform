import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import SectionHeader from "@/components/SectionHeader";

const sections = [
  {
    title: "What we collect",
    body: "PrepBros currently collects basic account information such as email, auth metadata, target exam preferences, and your in-product activity like answers, bookmarks, and streak progress.",
  },
  {
    title: "Why we collect it",
    body: "We use this data to authenticate users, personalize dashboards, save question history, improve product quality, and understand where users drop off or succeed.",
  },
  {
    title: "How it is stored",
    body: "Authentication and user data are handled through Supabase. You should still review row-level security, retention rules, and access policies before public launch.",
  },
  {
    title: "Third-party services",
    body: "When enabled, analytics scripts and infrastructure providers may process limited usage data. If you add analytics, cookies, or marketing tools, this page should be updated with those exact vendors.",
  },
  {
    title: "User rights",
    body: "Users should be able to request account deletion, data correction, and support access through your support channel. Before launch, make sure this process is operational, not just stated here.",
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
              title="A launch-ready privacy page is a trust requirement, not a nice-to-have."
              description="This version is a practical starting point for PrepBros. Before launch, you should review it with legal context specific to your jurisdiction, analytics stack, and email workflows."
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
