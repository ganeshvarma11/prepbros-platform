import {
  CalendarClock,
  ShieldCheck,
  TimerReset,
  Trophy,
} from "lucide-react";
import { Link } from "wouter";

import AppShell from "@/components/AppShell";
import PageHeader from "@/components/PageHeader";

const launchItems = [
  {
    icon: CalendarClock,
    title: "Real schedules only",
    body: "Contest dates, timing, and topic scope will appear here once the schedule is final.",
  },
  {
    icon: Trophy,
    title: "Actual rankings",
    body: "Leaderboards and result history will show up only after live participation and scoring are ready.",
  },
  {
    icon: ShieldCheck,
    title: "Credible rollout",
    body: "We are holding this feature back until attempts, scoring, and sync are dependable end to end.",
  },
];

export default function Contests() {
  return (
    <AppShell contentClassName="max-w-[1120px]">
      <div className="space-y-6">
        <PageHeader
          eyebrow="Workspace"
          title="Contests"
          description="Contest mode is not live yet. This page will switch to real schedules, attempts, and rankings once the feature is ready."
          crumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Contests" },
          ]}
        />

        <section className="card overflow-hidden p-6 md:p-8">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <p className="section-label">Coming soon</p>
              <h2 className="mt-3 text-[2rem] font-semibold tracking-[-0.05em] text-[var(--text-primary)] md:text-[2.5rem]">
                Contests are being built with real operations, not placeholder data.
              </h2>
              <p className="mt-4 max-w-[42rem] text-[15px] leading-7 text-[var(--text-secondary)]">
                We are still wiring scheduling, attempt windows, scoring, and leaderboard syncing.
                Until that is fully ready, this page will stay intentionally simple instead of showing
                mock contests or fake countdowns.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/practice">
                  <span className="btn-primary inline-flex cursor-pointer items-center justify-center rounded-[14px] px-5 py-3">
                    Continue practice
                  </span>
                </Link>
                <Link href="/updates">
                  <span className="btn-secondary inline-flex cursor-pointer items-center justify-center rounded-[14px] px-5 py-3">
                    Check updates
                  </span>
                </Link>
              </div>
            </div>

            <div className="rounded-[24px] border border-[var(--border)] bg-[var(--surface-1)] p-6 shadow-[var(--shadow-sm)]">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-[16px] bg-[var(--brand-subtle)] text-[var(--brand)]">
                <TimerReset size={18} />
              </div>
              <p className="mt-5 text-xl font-semibold tracking-[-0.04em] text-[var(--text-primary)]">
                What will appear here when contests launch
              </p>
              <ul className="mt-5 space-y-3 text-sm leading-7 text-[var(--text-secondary)]">
                <li className="rounded-[16px] border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3">
                  Upcoming contest dates and duration
                </li>
                <li className="rounded-[16px] border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3">
                  Topic coverage and participation rules
                </li>
                <li className="rounded-[16px] border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3">
                  Final rankings and result history
                </li>
              </ul>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {launchItems.map(item => {
            const Icon = item.icon;

            return (
              <div
                key={item.title}
                className="card rounded-[22px] p-6"
              >
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-[14px] border border-[var(--border)] bg-[var(--surface-2)] text-[var(--brand)]">
                  <Icon size={18} />
                </span>
                <p className="mt-5 text-lg font-semibold tracking-[-0.03em] text-[var(--text-primary)]">
                  {item.title}
                </p>
                <p className="mt-2 text-sm leading-7 text-[var(--text-secondary)]">
                  {item.body}
                </p>
              </div>
            );
          })}
        </section>
      </div>
    </AppShell>
  );
}
