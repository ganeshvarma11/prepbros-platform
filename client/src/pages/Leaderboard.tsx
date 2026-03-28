import { ArrowRight, Trophy } from "lucide-react";
import { Link } from "wouter";

import AppShell from "@/components/AppShell";
import PageHeader from "@/components/PageHeader";

const upcomingFeatures = [
  "Daily rankings",
  "Weekly rankings",
  "State and national ranks",
  "Streak tracking",
];

const previewRanks = [
  { rank: "#1", label: "Coming soon" },
  { rank: "#2", label: "Coming soon" },
  { rank: "#3", label: "Coming soon" },
];

export default function Leaderboard() {
  return (
    <AppShell contentClassName="max-w-[960px]">
      <div className="flex min-h-[calc(100vh-7rem)] flex-col gap-10">
        <PageHeader
          eyebrow="Progress"
          title="Leaderboard"
          description="We are building a simpler, more meaningful way to track progress. For now, the best way to climb is to keep practicing."
          crumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Leaderboard" },
          ]}
        />

        <div className="flex flex-1 flex-col items-center justify-center px-4 py-6 text-center sm:px-6">
          <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--bg-muted)] text-[var(--text-primary)]">
            <Trophy size={18} />
          </div>

          <div className="mt-10 w-full max-w-[640px] border-y border-[var(--border)] py-8">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--text-faint)]">
              Coming soon
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {upcomingFeatures.map((feature) => (
                <div key={feature} className="text-sm text-[var(--text-secondary)] sm:text-base">
                  {feature}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6">
            <Link href="/practice">
              <span className="btn-primary inline-flex cursor-pointer items-center gap-2 rounded-full px-6 py-3 text-sm font-medium sm:text-base">
                Go to Practice
                <ArrowRight size={16} />
              </span>
            </Link>
          </div>

          <div className="mx-auto mt-12 w-full max-w-[320px]">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--text-faint)]">
              Preview
            </p>
            <div className="mt-4 space-y-3">
              {previewRanks.map((item) => (
                <div
                  key={item.rank}
                  className="flex items-center justify-between border-b border-[var(--border)] py-3 text-left"
                >
                  <span className="text-sm font-medium text-[var(--text-primary)]">{item.rank}</span>
                  <span className="text-sm text-[var(--text-muted)]">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
