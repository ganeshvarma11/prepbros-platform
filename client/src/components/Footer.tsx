import { ArrowRight, Mail, ShieldCheck, Target, TrendingUp } from "lucide-react";
import { Link } from "wouter";

import BrandLogo from "@/components/BrandLogo";

const FOOTER_LINKS: Record<
  string,
  Array<{ label: string; href: string; external?: boolean }>
> = {
  Product: [
    { label: "Practice", href: "/practice" },
    { label: "Dashboard", href: "/dashboard" },
    { label: "Explore", href: "/explore" },
    { label: "Resources", href: "/resources" },
  ],
  Prep: [
    { label: "Contests", href: "/contests" },
    { label: "Leaderboard", href: "/leaderboard" },
    { label: "Profile", href: "/profile" },
    { label: "Premium", href: "/premium" },
  ],
  Trust: [
    { label: "Support", href: "/support" },
    { label: "Privacy", href: "/privacy" },
    { label: "Terms", href: "/terms" },
    { label: "Status", href: "/status" },
  ],
};

const PROMISES = [
  {
    icon: Target,
    title: "Daily targets that feel usable",
    description: "Set a realistic practice goal and keep the next step obvious every time you return.",
  },
  {
    icon: TrendingUp,
    title: "Progress that stays visible",
    description: "Solved counts, streaks, and weak-topic cues make improvement easier to follow.",
  },
  {
    icon: ShieldCheck,
    title: "A calmer prep workflow",
    description: "Focused product screens reduce noise so practice feels serious, clean, and repeatable.",
  },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-[var(--border)] bg-[var(--bg-base)]/90 pb-10 pt-14 backdrop-blur">
      <div className="container-shell space-y-10">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
          <div className="home-section-surface rounded-[28px] p-6 md:p-8">
            <BrandLogo />
            <h3 className="mt-6 text-2xl font-semibold tracking-[-0.05em] text-[var(--text-primary)]">
              A cleaner home for daily exam preparation.
            </h3>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--text-secondary)]">
              PrepBros is designed to help aspirants practice every day, notice what improved, and
              revisit what still needs work without getting buried in clutter.
            </p>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {PROMISES.map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.title}
                    className="rounded-3xl border border-[var(--border)] bg-[var(--bg-card-strong)]/70 p-4"
                  >
                    <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--brand-subtle)] text-[var(--brand)]">
                      <Icon size={18} />
                    </div>
                    <p className="text-sm font-semibold text-[var(--text-primary)]">{item.title}</p>
                    <p className="mt-2 text-sm text-[var(--text-secondary)]">{item.description}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="home-section-surface rounded-[28px] p-6 md:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--brand)]">
              Keep going
            </p>
            <h3 className="mt-3 text-2xl font-semibold tracking-[-0.05em] text-[var(--text-primary)]">
              Start a focused prep routine and keep your progress in one place.
            </h3>
            <p className="mt-3 text-sm text-[var(--text-secondary)]">
              The strongest V1 value is the daily loop itself: practice, progress, review, and
              consistency. Everything below should make that loop easier to access.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/practice">
                <span className="btn-primary inline-flex cursor-pointer rounded-[12px] px-5">
                  Start practicing
                  <ArrowRight size={15} />
                </span>
              </Link>
              <a
                href="mailto:hello@prepbros.com"
                className="inline-flex items-center gap-2 rounded-[12px] border border-[var(--border-strong)] px-4 py-2 text-sm font-medium text-[var(--text-primary)] transition hover:border-[var(--brand-muted)]"
              >
                <Mail size={14} className="text-[var(--brand)]" />
                hello@prepbros.com
              </a>
            </div>
          </div>
        </div>

        <div className="grid gap-8 rounded-[28px] border border-[var(--border)] bg-[var(--bg-card)] p-6 md:grid-cols-4 md:p-8">
          {Object.entries(FOOTER_LINKS).map(([group, items]) => (
            <div key={group}>
              <p className="mb-4 text-sm font-semibold text-[var(--text-primary)]">{group}</p>
              <div className="space-y-3">
                {items.map((item) => (
                  <Link key={item.label} href={item.href}>
                    <span className="block cursor-pointer text-sm text-[var(--text-secondary)] transition hover:text-[var(--text-primary)]">
                      {item.label}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
          <div>
            <p className="mb-4 text-sm font-semibold text-[var(--text-primary)]">What the product helps with</p>
            <div className="space-y-3 text-sm text-[var(--text-secondary)]">
              <p>Daily targets make the first action obvious.</p>
              <p>Progress history turns practice into a visible plan.</p>
              <p>Bookmarks and weak-topic review reduce revision friction.</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-[var(--border)] pt-6 text-sm text-[var(--text-muted)] md:flex-row md:items-center md:justify-between">
          <p>© {year} PrepBros. Built for serious aspirants who want calmer, clearer daily practice.</p>
          <p>UPSC, SSC, and state exam prep with a tighter practice to review loop.</p>
        </div>
      </div>
    </footer>
  );
}
