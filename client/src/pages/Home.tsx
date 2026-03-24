import {
  ArrowRight,
  BarChart3,
  BookOpenText,
  Bookmark,
  CheckCircle2,
  Clock3,
  Flame,
  LayoutGrid,
  Target,
} from "lucide-react";
import { Link } from "wouter";

import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/contexts/AuthContext";
import { trackEvent } from "@/lib/analytics";

const focusTracks = ["UPSC", "SSC", "State Exams"];

const heroSignals = [
  "Daily MCQs",
  "PYQs",
  "Progress tracking",
  "Weak-topic review",
];

const workflowCards = [
  {
    icon: BookOpenText,
    title: "Practice Daily MCQs",
    description: "Solve fresh questions every day and build useful momentum instead of random bursts.",
    meta: "Daily practice loop",
  },
  {
    icon: BarChart3,
    title: "Track Your Progress",
    description: "See accuracy, streaks, and solved counts clearly enough to know whether the week is moving well.",
    meta: "Progress visibility",
  },
  {
    icon: Bookmark,
    title: "Review Weak Areas",
    description: "Bookmark important questions, revisit mistakes, and keep weak topics in view before they pile up.",
    meta: "Bookmark-first review",
  },
];

const supportBlocks = [
  {
    title: "Daily goals that stay realistic",
    description:
      "The product keeps the first action obvious: open practice, finish your target, and keep the day moving.",
  },
  {
    title: "Review without losing context",
    description:
      "Bookmarks, weak-topic cues, and recent sessions make it easier to know what deserves another pass.",
  },
  {
    title: "Simple enough to repeat tomorrow",
    description:
      "The interface stays focused so consistency comes from clarity, not pressure or coaching-site noise.",
  },
];

const weakTopics = [
  { topic: "History", solved: "64%", target: "72%", widthA: "43%", widthB: "70%" },
  { topic: "Polity", solved: "58%", target: "69%", widthA: "36%", widthB: "64%" },
];

const recentStats = [
  { label: "Today Stats", value: "88%" },
  { label: "16 mins remaining", value: "Goal Focus" },
];

export default function Home() {
  const { user } = useAuth();
  const primaryHref = user ? "/dashboard" : "/practice";
  const primaryLabel = user ? "Open Dashboard" : "Start Practicing Free";

  return (
    <div className="page-container home-reference-page">
      <Navbar />

      <main className="px-4 pb-14 pt-3 md:pb-18 md:pt-4">
        <div className="container-shell">
          <section className="home-reference-hero relative overflow-hidden rounded-[36px] px-6 pb-10 pt-7 md:px-10 md:pb-12 md:pt-8 lg:px-12 lg:pb-14 lg:pt-9">
            <div className="home-reference-glow home-reference-glow-left" />
            <div className="home-reference-glow home-reference-glow-right" />
            <div className="home-reference-noise" />

            <div className="relative grid gap-8 lg:grid-cols-[0.98fr_0.9fr] lg:items-start lg:gap-8">
              <div className="max-w-2xl lg:pt-2">
                <p className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--bg-elevated)] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--brand-light)]">
                  <CheckCircle2 size={13} />
                  Daily question-solving for serious aspirants
                </p>

                <h1 className="mt-5 max-w-[11ch] text-balance text-5xl font-semibold leading-[1.03] tracking-[-0.07em] text-[var(--text-primary)] md:text-6xl lg:text-[4.1rem]">
                  Daily exam practice
                  <br />
                  that actually helps
                  <br />
                  <span className="text-[var(--brand-light)]">you improve.</span>
                </h1>

                <p className="mt-5 max-w-[34rem] text-lg leading-8 text-[var(--text-secondary)]">
                  PrepBros is a focused exam preparation platform for aspirants who want one clear
                  loop: practice every day, track progress, review weak topics, and stay consistent.
                </p>

                <div className="mt-5 flex flex-wrap gap-2.5">
                  {heroSignals.map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-[var(--border)] bg-[var(--bg-elevated)] px-3.5 py-1.5 text-sm font-medium text-[var(--text-primary)]"
                    >
                      {item}
                    </span>
                  ))}
                </div>

                <div className="mt-8 flex flex-wrap gap-3">
                  <Link href={primaryHref}>
                    <span
                      onClick={() =>
                        trackEvent("home_primary_cta_clicked", {
                          destination: user ? "dashboard" : "practice",
                        })
                      }
                      className="inline-flex cursor-pointer items-center gap-2 rounded-[14px] bg-[linear-gradient(180deg,#ff9838_0%,#ff7a12_100%)] px-6 py-3.5 text-lg font-medium text-white shadow-[0_22px_45px_-28px_rgba(255,122,18,0.95)] transition hover:brightness-105"
                    >
                      {primaryLabel}
                      <ArrowRight size={17} />
                    </span>
                  </Link>

                  <Link href="/resources">
                    <span
                      onClick={() =>
                        trackEvent("home_secondary_cta_clicked", { destination: "resources" })
                      }
                      className="inline-flex cursor-pointer items-center rounded-[14px] border border-[var(--border)] bg-[var(--bg-card)] px-6 py-3.5 text-lg font-medium text-[var(--text-primary)] transition hover:border-[var(--border-strong)]"
                    >
                      Explore Resources
                    </span>
                  </Link>
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  {focusTracks.map((item) => (
                    <span
                      key={item}
                      className="rounded-[12px] border border-[var(--border)] bg-[var(--bg-card)] px-5 py-2.5 text-lg font-medium text-[var(--text-primary)]"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              <div className="relative lg:pt-1">
                <div className="home-app-board mx-auto w-full max-w-[640px] rounded-[28px] p-3 md:p-4">
                  <div className="rounded-[22px] border border-[var(--border)] bg-[var(--bg-card)] p-4 shadow-[var(--shadow-md)]">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <h2 className="text-[1.85rem] font-semibold tracking-[-0.05em] text-[var(--text-primary)]">
                          Daily Goal
                        </h2>
                      </div>
                      <div className="flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-1.5 text-sm text-[var(--text-primary)]">
                        <Flame size={14} className="text-[var(--brand)]" />
                        16 min remaining
                      </div>
                    </div>

                    <div className="mt-4 h-3 overflow-hidden rounded-full bg-[var(--bg-muted)]">
                      <div className="h-full w-[72%] rounded-full bg-[linear-gradient(90deg,#78d2ff_0%,#93e7ff_100%)] shadow-[0_0_20px_rgba(120,210,255,0.35)]" />
                    </div>

                    <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_0.88fr]">
                      <div className="space-y-3">
                        <div className="grid gap-3 sm:grid-cols-2">
                          {recentStats.map((item) => (
                            <div
                              key={item.label}
                              className="rounded-[18px] border border-[var(--border)] bg-[var(--bg-elevated)] p-3.5"
                            >
                              <p className="text-sm text-[var(--text-secondary)]">{item.label}</p>
                              <p className="mt-2 text-[1.75rem] font-semibold tracking-[-0.05em] text-[var(--text-primary)]">
                                {item.value}
                              </p>
                            </div>
                          ))}
                        </div>

                        <div className="rounded-[20px] border border-[var(--border)] bg-[var(--bg-elevated)] p-4">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-[var(--text-secondary)]">Today</p>
                            <Clock3 size={16} className="text-[var(--blue)]" />
                          </div>
                          <div className="mt-3 flex items-end justify-between gap-4">
                            <div>
                              <p className="text-[2.8rem] font-semibold tracking-[-0.05em] text-[var(--text-primary)]">
                                88%
                              </p>
                              <p className="mt-1 text-sm text-[var(--text-secondary)]">
                                Accuracy across today&apos;s attempts
                              </p>
                            </div>
                            <div className="flex h-16 items-end gap-1.5">
                              {[20, 24, 26, 28, 34, 31, 36, 40].map((height, index) => (
                                <span
                                  key={height + index}
                                  className="w-2 rounded-full bg-[linear-gradient(180deg,#5ca9ff_0%,rgba(92,169,255,0.18)_100%)]"
                                  style={{ height: `${height}px` }}
                                />
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="grid gap-3 md:grid-cols-[1.15fr_0.85fr]">
                          <div className="rounded-[20px] border border-[var(--border)] bg-[var(--bg-elevated)] p-4">
                            <div className="flex items-center justify-between">
                              <h3 className="text-xl font-semibold tracking-[-0.04em] text-[var(--text-primary)]">
                                Weak Topics
                              </h3>
                              <Target size={16} className="text-[var(--brand)]" />
                            </div>
                            <div className="mt-4 space-y-4">
                              {weakTopics.map((item) => (
                                <div key={item.topic}>
                                  <div className="flex items-center justify-between text-sm">
                                    <span className="text-[var(--text-primary)]">{item.topic}</span>
                                    <div className="flex items-center gap-5">
                                      <span className="text-[var(--text-secondary)]">{item.solved}</span>
                                      <span className="text-[#9ae6b4]">{item.target}</span>
                                    </div>
                                  </div>
                                  <div className="mt-2 flex gap-2">
                                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-[var(--bg-muted)]">
                                      <div
                                        className="h-full rounded-full bg-[linear-gradient(90deg,#8ad6b3_0%,#b2efc9_100%)]"
                                        style={{ width: item.widthA }}
                                      />
                                    </div>
                                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-[var(--bg-muted)]">
                                      <div
                                        className="h-full rounded-full bg-[linear-gradient(90deg,#c3a96b_0%,#f1dc96_100%)]"
                                        style={{ width: item.widthB }}
                                      />
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="rounded-[20px] border border-[var(--border)] bg-[var(--bg-elevated)] p-4">
                            <p className="text-sm font-medium text-[var(--text-secondary)]">Bookmarks</p>
                            <p className="mt-3 text-[2.8rem] font-semibold tracking-[-0.05em] text-[var(--text-primary)]">
                              24
                            </p>
                            <p className="mt-1 text-sm text-[var(--text-secondary)]">
                              Saved for quick revision
                            </p>
                            <div className="mt-5 space-y-2.5">
                              {["Polity PYQs", "Economy mistakes", "History revision"].map((item) => (
                                <div
                                  key={item}
                                  className="rounded-[14px] border border-[var(--border)] bg-[var(--bg-card)] px-3 py-2.5 text-sm text-[var(--text-primary)]"
                                >
                                  {item}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="relative flex items-center justify-center lg:justify-end">
                        <div className="home-question-rail hidden xl:block" />
                        <div className="home-question-card relative z-10 w-full max-w-[290px] rounded-[20px] border border-[rgba(255,255,255,0.16)] bg-[linear-gradient(180deg,#f8f1e9_0%,#f3eee6_100%)] p-3.5 text-[#201913] shadow-[0_28px_60px_-28px_rgba(0,0,0,0.95)]">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-[#5b4b3f]">Answer Questions</p>
                            <LayoutGrid size={16} className="text-[#8f8076]" />
                          </div>
                          <div className="mt-4 rounded-[16px] border border-[rgba(34,25,19,0.08)] bg-white/45 p-4">
                            <p className="text-[15px] leading-7 text-[#2b2118]">
                              Who founded the Indian National Congress in 1885?
                            </p>
                          </div>
                          <div className="mt-4 space-y-2.5">
                            {[
                              "A. Mahatma Gandhi",
                              "B. Bal Gangadhar Tilak",
                              "C. Allan Octavian Hume",
                              "D. Jawaharlal Nehru",
                            ].map((option, index) => (
                              <div
                                key={option}
                                className={`rounded-[14px] border px-4 py-3 text-base ${
                                  index === 2
                                    ? "border-[#25524b] bg-[#2e5750] text-white"
                                    : "border-[rgba(34,25,19,0.1)] bg-white/60 text-[#2c2117]"
                                }`}
                              >
                                {option}
                              </div>
                            ))}
                          </div>
                          <button
                            type="button"
                            className="mt-4 w-full rounded-[14px] bg-[linear-gradient(180deg,#3d67ea_0%,#274ecb_100%)] px-4 py-3 text-lg font-medium text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]"
                          >
                            Submit
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div id="review-system" className="relative mt-20 md:mt-24">
              <div className="mx-auto max-w-3xl text-center">
                <h2 className="text-4xl font-semibold tracking-[-0.06em] text-[var(--text-primary)] md:text-5xl">
                  How PrepBros Works
                </h2>
                <p className="mt-4 text-lg leading-8 text-[var(--text-secondary)]">
                  Simple habit-building steps that help you practice, review, and improve without
                  getting pulled into noise.
                </p>
              </div>

              <div className="mt-10 grid gap-5 lg:grid-cols-3">
                {workflowCards.map((item) => {
                  const Icon = item.icon;

                  return (
                    <div
                      key={item.title}
                      className="home-workflow-card rounded-[24px] p-6 md:p-7"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-[18px] border border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--brand)]">
                          <Icon size={24} />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-3xl font-semibold tracking-[-0.05em] text-[var(--text-primary)]">
                            {item.title}
                          </h3>
                          <p className="mt-3 text-base leading-8 text-[var(--text-secondary)]">
                            {item.description}
                          </p>
                        </div>
                      </div>
                      <div className="mt-6 border-t border-[var(--border)] pt-4 text-sm font-medium text-[var(--brand-light)]">
                        {item.meta}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          <section className="mt-8 grid gap-5 lg:grid-cols-3">
            {supportBlocks.map((item) => (
              <div
                key={item.title}
                className="rounded-[24px] border border-[var(--border)] bg-[var(--bg-card)] p-6 shadow-[var(--shadow-md)]"
              >
                <h3 className="text-2xl font-semibold tracking-[-0.04em] text-[var(--text-primary)]">
                  {item.title}
                </h3>
                <p className="mt-3 text-base leading-8 text-[var(--text-secondary)]">
                  {item.description}
                </p>
              </div>
            ))}
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
