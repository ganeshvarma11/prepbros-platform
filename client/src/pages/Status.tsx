import { CheckCircle2, Database, Gauge, ShieldCheck } from "lucide-react";

import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import SectionHeader from "@/components/SectionHeader";

export default function Status() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="px-4 py-8 md:py-10">
        <div className="container-shell space-y-6">
          <div className="glass-panel rounded-[32px] px-6 py-8 md:px-8 md:py-10">
            <SectionHeader
              eyebrow="System status"
              title="Transparency helps smaller products feel more trustworthy."
              description="Even a lightweight status page improves credibility because it signals operational seriousness. Later, this can be replaced with a live status service."
            />
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {[
              { icon: CheckCircle2, title: "App availability", body: "Operational", tone: "badge-green" },
              { icon: Database, title: "Supabase connectivity", body: "Operational", tone: "badge-green" },
              { icon: Gauge, title: "Practice flow", body: "Operational", tone: "badge-green" },
              { icon: ShieldCheck, title: "Auth flow", body: "Operational", tone: "badge-green" },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="stat-card rounded-[28px]">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--brand-subtle)] text-[var(--brand)]">
                    <Icon size={18} />
                  </div>
                  <p className="mt-5 text-lg font-semibold text-[var(--text-primary)]">{item.title}</p>
                  <div className={`badge mt-3 ${item.tone}`}>{item.body}</div>
                </div>
              );
            })}
          </div>

          <div className="glass-panel rounded-[32px] p-6 md:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--brand)]">Launch note</p>
            <p className="mt-4 text-sm leading-7 text-[var(--text-secondary)]">
              Right now this is a static status page intended to improve trust before launch. Once
              you have more users, connect it to real uptime checks, Supabase health monitoring, and
              incident communication.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
