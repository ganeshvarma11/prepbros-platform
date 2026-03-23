import { ArrowUpRight, HeartHandshake, Mail, ShieldCheck, Sparkles } from "lucide-react";
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
  Platform: [
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
    icon: ShieldCheck,
    title: "Progress you can trust",
    description: "Secure auth with Supabase and a cleaner practice history across sessions.",
  },
  {
    icon: Sparkles,
    title: "Designed for focus",
    description: "No cluttered coaching-site feel. Clear hierarchy, better pacing, stronger mobile UX.",
  },
  {
    icon: HeartHandshake,
    title: "Built for real aspirants",
    description: "Study workflows that reduce overwhelm and reward consistency, not just speed.",
  },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-[var(--border)] bg-[var(--bg-base)]/90 pb-10 pt-14 backdrop-blur">
      <div className="container-shell space-y-10">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
          <div className="glass-panel rounded-[28px] p-6 md:p-8">
            <BrandLogo />
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

          <div className="glass-panel rounded-[28px] p-6 md:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--brand)]">
              Launch Checklist
            </p>
            <h3 className="mt-3 text-2xl font-semibold tracking-[-0.05em] text-[var(--text-primary)]">
              Make your first impression feel established.
            </h3>
            <p className="mt-3 text-sm text-[var(--text-secondary)]">
              Add your domain, support email, privacy policy, and real social proof before sending
              paid or organic traffic to the homepage.
            </p>
            <a
              href="mailto:hello@prepbros.com"
              className="mt-6 inline-flex items-center gap-2 rounded-full border border-[var(--border-strong)] px-4 py-2 text-sm font-medium text-[var(--text-primary)] transition hover:border-[var(--brand-muted)]"
            >
              <Mail size={14} className="text-[var(--brand)]" />
              hello@prepbros.com
            </a>
          </div>
        </div>

        <div className="grid gap-8 rounded-[28px] border border-[var(--border)] bg-[var(--bg-card)] p-6 md:grid-cols-4 md:p-8">
          {Object.entries(FOOTER_LINKS).map(([group, items]) => (
            <div key={group}>
              <p className="mb-4 text-sm font-semibold text-[var(--text-primary)]">{group}</p>
              <div className="space-y-3">
                {items.map((item) =>
                  item.external ? (
                    <a
                      key={item.label}
                      href={item.href}
                      className="inline-flex items-center gap-2 text-sm text-[var(--text-secondary)] transition hover:text-[var(--text-primary)]"
                    >
                      {item.label}
                      <ArrowUpRight size={13} className="text-[var(--text-faint)]" />
                    </a>
                  ) : (
                    <Link key={item.label} href={item.href}>
                      <span className="block cursor-pointer text-sm text-[var(--text-secondary)] transition hover:text-[var(--text-primary)]">
                        {item.label}
                      </span>
                    </Link>
                  ),
                )}
              </div>
            </div>
          ))}
          <div>
            <p className="mb-4 text-sm font-semibold text-[var(--text-primary)]">Why users stay</p>
            <div className="space-y-3 text-sm text-[var(--text-secondary)]">
              <p>Daily challenge and streak loops encourage consistency.</p>
              <p>Dashboard context turns practice into a visible plan.</p>
              <p>Better copy and structure reduce drop-off for first-time visitors.</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-[var(--border)] pt-6 text-sm text-[var(--text-muted)] md:flex-row md:items-center md:justify-between">
          <p>© {year} PrepBros. Built to help serious aspirants prepare with clarity and confidence.</p>
          <p>Domain, policies, analytics, and support flows should be finalized before launch.</p>
        </div>
      </div>
    </footer>
  );
}
