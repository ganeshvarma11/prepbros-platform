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
          <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full border border-[var(--border-1)] bg-[var(--surface-1)] text-[var(--amber)]">
            <Trophy size={18} />
          </div>

          <div className="mt-10 w-full max-w-[640px]">
            <p className="section-label mb-4">
              Coming soon
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {upcomingFeatures.map((feature) => (
                <div
                  key={feature}
                  className="card py-4 text-sm text-[var(--text-3)] sm:text-base"
                >
                  {feature}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6">
            <Link href="/practice">
              <span className="btn-primary inline-flex cursor-pointer items-center gap-2">
                Go to Practice
                <ArrowRight size={16} />
              </span>
            </Link>
          </div>

          <div className="mx-auto mt-12 w-full max-w-[320px]">
            <p className="section-label">
              Preview
            </p>
            <div className="mt-4 space-y-3">
              {previewRanks.map((item) => (
                <div
                  key={item.rank}
                  className="card flex items-center justify-between py-4 text-left"
                >
                  <span className="text-sm font-medium text-[var(--text-1)]">{item.rank}</span>
                  <span className="text-sm text-[var(--text-3)]">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
