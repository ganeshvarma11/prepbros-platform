import { useMemo, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  Compass,
  Flame,
  GraduationCap,
  Layers3,
  Rocket,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";
import { Link } from "wouter";

import AppShell from "@/components/AppShell";
import SectionHeader from "@/components/SectionHeader";
import { useAuth } from "@/contexts/AuthContext";
import { useQuestionBank } from "@/hooks/useQuestionBank";

const examHubs = [
  {
    exam: "UPSC",
    title: "UPSC Civil Services",
    summary: "GS + CSAT practice for serious aspirants who want clean daily momentum.",
    tags: ["GS1", "GS2", "GS3", "GS4", "CSAT"],
  },
  {
    exam: "SSC",
    title: "SSC Growth Track",
    summary: "Quant, reasoning, English, and GK with faster practice-oriented navigation.",
    tags: ["CGL", "CHSL", "Quant", "Reasoning"],
  },
  {
    exam: "TSPSC",
    title: "TSPSC State Focus",
    summary: "Telangana-centric learning paths and subject clusters for state-exam users.",
    tags: ["Group 1", "Group 2", "Telangana GK"],
  },
  {
    exam: "RRB",
    title: "Railway Prep",
    summary: "General awareness and mock-style question sets that feel easier to enter.",
    tags: ["NTPC", "Group D", "General Science"],
  },
];

const paths = [
  {
    title: "UPSC Prelims Sprint",
    duration: "4 weeks",
    level: "Beginner to Advanced",
    description: "A cleaner sequence for users who want structure before they build their own routine.",
    href: "/practice",
  },
  {
    title: "SSC Quant and Reasoning Loop",
    duration: "2 weeks",
    level: "Intermediate",
    description: "A habit-focused route for speed, repetition, and quick feedback cycles.",
    href: "/aptitude",
  },
  {
    title: "TSPSC Core Topics",
    duration: "10 days",
    level: "Beginner",
    description: "A more approachable path for state-exam aspirants who need direction fast.",
    href: "/practice",
  },
];

const productBenefits = [
  {
    icon: Compass,
    title: "Clearer discovery",
    description: "Explore now helps users find where to start instead of overwhelming them with raw categories.",
  },
  {
    icon: Layers3,
    title: "Better information scent",
    description: "Every section now explains why it exists, which improves trust and first-session conversion.",
  },
  {
    icon: Target,
    title: "More intentional paths",
    description: "Curated tracks make the product feel more complete and less like a loose question library.",
  },
];

export default function Explore() {
  const { user } = useAuth();
  const [dailySelected, setDailySelected] = useState<number | null>(null);
  const { questions, loading } = useQuestionBank();

  const dailyQuestion = questions[new Date().getDate() % questions.length];

  const totalPYQ = useMemo(
    () => questions.filter((question) => question.type === "PYQ").length,
    [questions],
  );
  const totalTopics = useMemo(
    () => new Set(questions.map((question) => question.topic)).size,
    [questions],
  );

  return (
    <AppShell>
      <div className="container-shell space-y-6">
          <div className="glass-panel rounded-[32px] px-6 py-8 md:px-8 md:py-10">
            <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
              <div>
                <SectionHeader
                  eyebrow="Explore"
                  title="Discover where to start, what to practice, and what to open next."
                  description="Explore brings together daily challenge, exam hubs, and guided paths so users can enter the product without confusion."
                />
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link href={user ? "/dashboard" : "/practice"}>
                    <span className="btn-primary inline-flex cursor-pointer rounded-[12px] px-6 py-3">
                      {user ? "Continue your prep" : "Start with practice"}
                      <ArrowRight size={16} />
                    </span>
                  </Link>
                  <Link href="/resources">
                    <span className="btn-secondary inline-flex cursor-pointer rounded-[12px] px-6 py-3">
                      Browse resources
                    </span>
                  </Link>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  { label: "Questions live", value: loading ? "..." : questions.length },
                  { label: "PYQs", value: totalPYQ },
                  { label: "Topics", value: totalTopics },
                ].map((item) => (
                  <div key={item.label} className="rounded-[18px] border border-[var(--border)] bg-[var(--bg-card-strong)] p-4">
                    <p className="text-2xl font-semibold tracking-[-0.05em] text-[var(--text-primary)]">
                      {item.value}
                    </p>
                    <p className="mt-1 text-sm text-[var(--text-muted)]">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="glass-panel rounded-[24px] p-6 md:p-8">
              <div className="flex items-center gap-3">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--brand-subtle)] text-[var(--brand)]">
                  <Flame size={18} />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--brand)]">
                    Daily challenge
                  </p>
                  <p className="text-lg font-semibold text-[var(--text-primary)]">
                    A lightweight activation loop for new and returning users
                  </p>
                </div>
              </div>

              <div className="mt-6 rounded-[20px] border border-[var(--border)] bg-[var(--bg-card-strong)] p-5">
                {dailyQuestion ? (
                  <>
                    <div className="flex flex-wrap gap-2">
                      <span className="badge badge-brand">{dailyQuestion.exam}</span>
                      <span className="badge badge-gray">{dailyQuestion.topic}</span>
                      {dailyQuestion.year ? <span className="badge badge-blue">PYQ {dailyQuestion.year}</span> : null}
                    </div>
                    <h2 className="mt-4 text-2xl font-semibold tracking-[-0.05em] text-[var(--text-primary)]">
                      {dailyQuestion.question}
                    </h2>
                    <div className="mt-5 grid gap-3">
                      {dailyQuestion.options.map((option, index) => {
                        const selected = dailySelected === index;
                        const correct = dailySelected !== null && index === dailyQuestion.correct;
                        return (
                          <button
                            key={option}
                            type="button"
                            onClick={() => {
                              if (dailySelected === null) setDailySelected(index);
                            }}
                            className={`option-btn ${
                              dailySelected !== null
                                ? correct
                                  ? "correct"
                                  : selected
                                    ? "wrong"
                                    : "dimmed"
                                : ""
                            }`}
                          >
                            <span className="flex items-start gap-3">
                              <span className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-full border border-[var(--border-strong)] text-xs font-semibold text-[var(--text-muted)]">
                                {["A", "B", "C", "D"][index]}
                              </span>
                              <span className="text-sm leading-7 text-[var(--text-primary)]">{option}</span>
                            </span>
                          </button>
                        );
                      })}
                    </div>
                    {dailySelected !== null ? (
                      <div className="mt-5 rounded-[24px] border border-[var(--brand-muted)] bg-[var(--brand-subtle)] p-4">
                        <p className="text-sm font-semibold text-[var(--text-primary)]">
                          {dailySelected === dailyQuestion.correct
                            ? "Correct. Nice start."
                            : `Correct answer: ${dailyQuestion.options[dailyQuestion.correct]}`}
                        </p>
                        <p className="mt-2 text-sm text-[var(--text-secondary)]">{dailyQuestion.explanation}</p>
                      </div>
                    ) : null}
                  </>
                ) : (
                  <div className="rounded-[24px] border border-dashed border-[var(--border-strong)] bg-[var(--bg-subtle)] p-6 text-sm text-[var(--text-secondary)]">
                    Daily challenge will appear once questions are available.
                  </div>
                )}
              </div>
            </div>

            <div className="grid gap-6">
              <div className="glass-panel rounded-[24px] p-6 md:p-8">
                <SectionHeader
                  eyebrow="Why this page matters"
                  title="Explore should reduce hesitation and increase curiosity."
                  description="It gives new users enough structure to start, while still helping returning users discover more of the platform."
                />
                <div className="mt-6 space-y-3">
                  {productBenefits.map((item) => {
                    const Icon = item.icon;
                    return (
                      <div key={item.title} className="rounded-[18px] border border-[var(--border)] bg-[var(--bg-card-strong)] p-4">
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--bg-subtle)] text-[var(--brand)]">
                            <Icon size={16} />
                          </div>
                          <div>
                            <p className="font-semibold text-[var(--text-primary)]">{item.title}</p>
                            <p className="mt-1 text-sm text-[var(--text-secondary)]">{item.description}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-[24px] border border-[var(--border)] bg-[var(--bg-inverse)] p-6 text-white md:p-8">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-white">
                  <Rocket size={18} />
                </div>
                <p className="mt-5 text-2xl font-semibold tracking-[-0.05em] text-white">
                  This is where curious visitors can turn into active users.
                </p>
                <p className="mt-3 text-sm text-white/72">
                  It gives users multiple entry points into the platform without dropping them into complexity too early.
                </p>
              </div>
            </div>
          </div>

          <div className="glass-panel rounded-[32px] p-6 md:p-8">
            <SectionHeader
              eyebrow="Exam hubs"
              title="Coverage that feels credible at a glance."
              description="Each exam area now reads like a deliberate track, which improves perceived depth even before users click through."
            />
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {examHubs.map((hub) => (
                <Link key={hub.title} href="/practice">
                  <span className="card card-interactive block cursor-pointer rounded-[28px] p-5">
                    <div className="flex items-center justify-between gap-4">
                      <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--brand-subtle)] text-[var(--brand)]">
                        <GraduationCap size={18} />
                      </div>
                      <span className="badge badge-brand">{hub.exam}</span>
                    </div>
                    <p className="mt-5 text-xl font-semibold tracking-[-0.04em] text-[var(--text-primary)]">
                      {hub.title}
                    </p>
                    <p className="mt-2 text-sm leading-7 text-[var(--text-secondary)]">{hub.summary}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {hub.tags.map((tag) => (
                        <span key={tag} className="badge badge-gray">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </span>
                </Link>
              ))}
            </div>
          </div>

          <div className="glass-panel rounded-[32px] p-6 md:p-8">
            <SectionHeader
              eyebrow="Curated paths"
              title="Structure for users who don’t know where to begin."
              description="These path cards make the product feel more complete and more guided, especially for first-session users."
            />
            <div className="mt-6 grid gap-4 lg:grid-cols-3">
              {paths.map((path) => (
                <Link key={path.title} href={path.href}>
                  <span className="card card-interactive block cursor-pointer rounded-[28px] p-5">
                    <div className="flex items-center justify-between gap-3">
                      <span className="badge badge-blue">{path.duration}</span>
                      <TrendingUp size={16} className="text-[var(--brand)]" />
                    </div>
                    <p className="mt-5 text-xl font-semibold tracking-[-0.04em] text-[var(--text-primary)]">
                      {path.title}
                    </p>
                    <p className="mt-2 text-sm text-[var(--text-muted)]">{path.level}</p>
                    <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">{path.description}</p>
                  </span>
                </Link>
              ))}
            </div>
          </div>
      </div>
    </AppShell>
  );
}
