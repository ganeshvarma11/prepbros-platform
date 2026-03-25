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
    <footer className="border-t border-[rgba(255,255,255,0.06)] bg-[linear-gradient(180deg,#0c0b13_0%,#09090f_100%)] pb-10 pt-10">
      <div className="container-shell">
        <div className="flex flex-col gap-8 rounded-[28px] border border-[rgba(255,255,255,0.08)] bg-[rgba(17,16,26,0.72)] p-6 shadow-[0_24px_80px_-48px_rgba(0,0,0,0.9)] md:flex-row md:items-center md:justify-between md:p-8">
          <div className="max-w-xl">
            <BrandLogo textClassName="text-[1.55rem]" />
            <p className="mt-4 text-sm leading-7 text-[var(--text-secondary)]">
              Daily question-solving for aspirants who want a calmer, sharper way to practice,
              track progress, and review weak areas.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href="/practice">
              <span className="inline-flex cursor-pointer items-center gap-2 rounded-[14px] bg-[linear-gradient(180deg,#ff9838_0%,#ff7a12_100%)] px-5 py-3 text-sm font-medium text-white shadow-[0_18px_40px_-24px_rgba(255,122,18,0.9)]">
                Start Practicing
                <ArrowRight size={15} />
              </span>
            </Link>
            <a
              href={`mailto:${siteConfig.supportEmail}`}
              className="inline-flex items-center gap-2 rounded-[14px] border border-[rgba(255,255,255,0.08)] bg-[rgba(32,30,45,0.7)] px-5 py-3 text-sm font-medium text-[var(--text-primary)]"
            >
              <Mail size={14} className="text-[var(--brand)]" />
              {siteConfig.supportEmail}
            </a>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-4 border-t border-[rgba(255,255,255,0.06)] pt-6 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-x-6 gap-y-3">
            {FOOTER_LINKS.map((item) => (
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
