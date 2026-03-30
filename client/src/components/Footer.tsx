import { ArrowRight, Mail } from "lucide-react";
import { Link } from "wouter";

import BrandLogo from "@/components/BrandLogo";
import { siteConfig } from "@/lib/siteConfig";

const FOOTER_LINKS = [
  { label: "Practice", href: "/practice" },
  { label: "Dashboard", href: "/dashboard" },
  { label: "Premium", href: "/premium" },
  { label: "Support", href: "/support" },
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-[var(--border)] bg-[transparent] pb-10 pt-10">
      <div className="container-shell">
        <div className="flex flex-col gap-8 rounded-[28px] border border-[var(--border)] bg-[var(--bg-card)] p-6 shadow-[var(--shadow-md)] backdrop-blur-xl md:flex-row md:items-center md:justify-between md:p-8">
          <div className="max-w-xl">
            <BrandLogo textClassName="text-[1.55rem]" />
            <p className="mt-4 text-sm leading-7 text-[var(--text-secondary)]">
              Daily question-solving for aspirants who want a calmer, sharper
              way to practice, track progress, and review weak areas.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href="/practice">
              <span className="inline-flex cursor-pointer items-center gap-2 rounded-[14px] bg-[linear-gradient(180deg,var(--brand-light)_0%,var(--brand)_100%)] px-5 py-3 text-sm font-medium text-[var(--text-on-brand)] shadow-[var(--shadow-md)]">
                Start Practicing
                <ArrowRight size={15} />
              </span>
            </Link>
            <a
              href={`mailto:${siteConfig.supportEmail}`}
              className="inline-flex items-center gap-2 rounded-[14px] border border-[var(--border)] bg-[var(--surface-1)] px-5 py-3 text-sm font-medium text-[var(--text-primary)]"
            >
              <Mail size={14} className="text-[var(--brand)]" />
              {siteConfig.supportEmail}
            </a>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-4 border-t border-[var(--border)] pt-6 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-x-6 gap-y-3">
            {FOOTER_LINKS.map(item => (
              <Link key={item.href} href={item.href}>
                <span className="cursor-pointer text-sm text-[var(--text-secondary)] transition hover:text-[var(--text-primary)]">
                  {item.label}
                </span>
              </Link>
            ))}
          </div>
          <p className="text-sm text-[var(--text-muted)]">
            © {year} {siteConfig.legalEntity}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
