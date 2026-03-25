import { ArrowRight, Trophy } from "lucide-react";
import { Link } from "wouter";

import AppShell from "@/components/AppShell";

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
      <div className="flex min-h-[calc(100vh-7rem)] items-center justify-center">
        <section className="w-full max-w-[640px] px-4 py-10 text-center sm:px-6">
          <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/80">
            <Trophy size={18} />
          </div>

          <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.28em] text-white/40">
            Leaderboard
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-[-0.06em] text-white sm:text-5xl">
            Leaderboard
          </h1>
          <p className="mx-auto mt-4 max-w-[540px] text-base leading-7 text-white/60 sm:text-lg">
            We&apos;re building a simpler, more meaningful way to track progress. For now, the best
            way to climb is to keep practicing.
          </p>

          <div className="mt-10 border-y border-white/10 py-8">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/40">
              Coming soon
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {upcomingFeatures.map((feature) => (
                <div
                  key={feature}
                  className="text-sm text-white/72 sm:text-base"
                >
                  {feature}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-10">
            <Link href="/practice">
              <span className="btn-primary inline-flex cursor-pointer items-center gap-2 rounded-full px-6 py-3 text-sm font-medium sm:text-base">
                Go to Practice
                <ArrowRight size={16} />
              </span>
            </Link>
          </div>

          <div className="mx-auto mt-12 max-w-[320px]">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/32">
              Preview
            </p>
            <div className="mt-4 space-y-3">
              {previewRanks.map((item) => (
                <div
                  key={item.rank}
                  className="flex items-center justify-between border-b border-white/8 py-3 text-left"
                >
                  <span className="text-sm font-medium text-white/82">{item.rank}</span>
                  <span className="text-sm text-white/42">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
