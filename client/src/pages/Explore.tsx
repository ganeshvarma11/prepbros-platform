import { useMemo } from "react";
import {
  ArrowRight,
  BookOpen,
  ChevronRight,
  Layers3,
  Shuffle,
  Target,
} from "lucide-react";
import { Link } from "wouter";

import AppShell from "@/components/AppShell";
import PageHeader from "@/components/PageHeader";
import { useAuth } from "@/contexts/AuthContext";
import { useQuestionBank } from "@/hooks/useQuestionBank";
import { toQuestionId } from "@/lib/questionIdentity";

const examTracks = [
  {
    label: "UPSC",
    summary: "Civil services, GS, CSAT",
    href: "/practice?exams=UPSC",
  },
  {
    label: "SSC",
    summary: "Quant, reasoning, English",
    href: "/practice?exams=SSC",
  },
  {
    label: "TSPSC",
    summary: "State-focused topics",
    href: "/practice?exams=TSPSC",
  },
  {
    label: "Railway",
    summary: "RRB NTPC and Group D",
    href: "/practice?exams=RRB",
  },
];

const starterPaths = [
  {
    title: "UPSC Prelims Sprint",
    summary: "Polity, economy, PYQs",
    duration: "4 weeks",
    href: "/practice?exams=UPSC",
  },
  {
    title: "SSC Quant and Reasoning Loop",
    summary: "Fast drills with repetition",
    duration: "2 weeks",
    href: "/aptitude",
  },
  {
    title: "TSPSC Core Topics",
    summary: "State GK and current affairs",
    duration: "10 days",
    href: "/practice?exams=TSPSC",
  },
  {
    title: "Railway Basics Run",
    summary: "GA, science, and mocks",
    duration: "12 days",
    href: "/practice?exams=RRB",
  },
];

const sectionClassName = "card p-4 md:p-5";

const listRowClassName =
  "card group flex items-center justify-between gap-4 rounded-[var(--radius-md)] px-4 py-3";

const examLabels: Record<string, string> = {
  RRB: "Railway",
};

export default function Explore() {
  const { user } = useAuth();
  const { questions } = useQuestionBank();

  const randomQuestionHref = useMemo(() => {
    if (questions.length === 0) return "/practice";

    const randomQuestion =
      questions[Math.floor(Math.random() * questions.length)];

    return `/practice?question=${toQuestionId(randomQuestion.id)}`;
  }, [questions]);

  const targetExam = String(
    user?.user_metadata?.target_exam || ""
  ).toUpperCase();
  const preferredExam = examTracks.find(track =>
    targetExam.includes(track.label === "Railway" ? "RRB" : track.label)
  );

  const recommendedQuestion = useMemo(() => {
    if (questions.length === 0) return null;

    const preferredKey =
      preferredExam?.label === "Railway" ? "RRB" : preferredExam?.label;

    return (
      questions.find(
        question => question.exam === preferredKey && question.type === "PYQ"
      ) ||
      questions.find(question => question.exam === preferredKey) ||
      questions.find(question => question.type === "PYQ") ||
      questions[0]
    );
  }, [preferredExam, questions]);

  const quickActions = [
    {
      label: "Continue Practice",
      href: "/practice",
      icon: ArrowRight,
      primary: true,
    },
    {
      label: "Random Question",
      href: randomQuestionHref,
      icon: Shuffle,
      primary: false,
    },
    {
      label: "Review Weak Topics",
      href: user ? "/practice?incorrect=1" : "/practice",
      icon: Target,
      primary: false,
    },
    {
      label: "Browse Resources",
      href: "/resources",
      icon: BookOpen,
      primary: false,
    },
  ];

  return (
    <AppShell contentClassName="max-w-[1040px]">
      <div className="space-y-6 md:space-y-7">
        <PageHeader
          eyebrow="Workspace"
          title="Explore"
          description="Pick a track, open a path, or jump straight into practice."
          crumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Explore" },
          ]}
        />

        <section className="card grid gap-5 overflow-hidden p-5 md:grid-cols-[minmax(0,1fr)_280px] md:p-6">
          <div>
            <p className="section-label">Discovery</p>
            <h2 className="mt-3 text-[2rem] tracking-[-0.05em] text-[var(--text-primary)]">
              Find the next right thing to study.
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--text-secondary)]">
              Explore is your low-friction starting point for exam tracks, short
              paths, and focused entry into practice.
            </p>
          </div>
          <div className="rounded-[24px] border border-[var(--border)] bg-[var(--surface-1)] p-5 shadow-[var(--shadow-sm)]">
            <p className="section-label">Quick start</p>
            <p
              className="mt-3 text-[2.6rem] leading-none tracking-[-0.07em] text-[var(--text-primary)]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {questions.length}
            </p>
            <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
              Questions currently available to explore and practice from.
            </p>
          </div>
        </section>

        <section className={sectionClassName}>
          <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
            {quickActions.map(action => {
              const Icon = action.icon;

              return (
                <Link key={action.label} href={action.href}>
                  <span
                    className={
                      action.primary
                        ? "btn-primary flex cursor-pointer items-center justify-between gap-3"
                        : "btn-ghost flex cursor-pointer items-center justify-between gap-3"
                    }
                  >
                    <span className="flex items-center gap-3">
                      <Icon
                        size={15}
                        className={
                          action.primary
                            ? "text-[var(--text-on-brand)]"
                            : "text-[var(--text-2)]"
                        }
                      />
                      <span>{action.label}</span>
                    </span>
                    <ChevronRight
                      size={15}
                      className={
                        action.primary
                          ? "text-[var(--text-on-brand)]"
                          : "text-[var(--text-3)]"
                      }
                    />
                  </span>
                </Link>
              );
            })}
          </div>
        </section>

        <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          <section className={sectionClassName}>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-[var(--text-primary)]">
                  Exam tracks
                </p>
                <p className="mt-1 text-xs text-[var(--text-muted)]">
                  Choose your lane.
                </p>
              </div>
              <Layers3 size={15} className="text-[var(--text-faint)]" />
            </div>

            <div className="mt-4 space-y-2">
              {examTracks.map(track => (
                <Link key={track.label} href={track.href}>
                  <span className={listRowClassName}>
                    <span className="min-w-0">
                      <span className="block text-sm font-medium text-[var(--text-primary)]">
                        {track.label}
                      </span>
                      <span className="mt-1 block text-xs text-[var(--text-muted)]">
                        {track.summary}
                      </span>
                    </span>
                    <ChevronRight
                      size={15}
                      className="shrink-0 text-[var(--text-faint)] transition group-hover:text-[var(--text-muted)]"
                    />
                  </span>
                </Link>
              ))}
            </div>
          </section>

          <section className={sectionClassName}>
            <div>
              <p className="text-sm font-medium text-[var(--text-primary)]">
                Starter paths
              </p>
              <p className="mt-1 text-xs text-[var(--text-muted)]">
                Short guided routes.
              </p>
            </div>

            <div className="mt-4 space-y-2">
              {starterPaths.map(path => (
                <Link key={path.title} href={path.href}>
                  <span className={listRowClassName}>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-3">
                        <span className="truncate text-sm font-medium text-[var(--text-primary)]">
                          {path.title}
                        </span>
                        <span className="badge">{path.duration}</span>
                      </span>
                      <span className="mt-1 block text-xs text-[var(--text-muted)]">
                        {path.summary}
                      </span>
                    </span>
                    <ChevronRight
                      size={15}
                      className="shrink-0 text-[var(--text-faint)] transition group-hover:text-[var(--text-muted)]"
                    />
                  </span>
                </Link>
              ))}
            </div>
          </section>
        </div>

        {recommendedQuestion ? (
          <section className={sectionClassName}>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-[var(--text-primary)]">
                  Recommended for you
                </p>
                <p className="mt-1 text-xs text-[var(--text-muted)]">
                  One clean place to start.
                </p>
              </div>
            </div>

            <Link
              href={`/practice?question=${toQuestionId(recommendedQuestion.id)}`}
            >
              <span className="card mt-4 flex cursor-pointer items-center justify-between gap-4 rounded-[var(--radius-md)] px-4 py-3">
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium text-[var(--text-primary)]">
                    {recommendedQuestion.topic} warm-up
                  </span>
                  <span className="mt-1 block text-xs text-[var(--text-muted)]">
                    {examLabels[recommendedQuestion.exam] ||
                      recommendedQuestion.exam}
                    {recommendedQuestion.year
                      ? ` • PYQ ${recommendedQuestion.year}`
                      : ` • ${recommendedQuestion.type}`}
                  </span>
                </span>
                <ChevronRight
                  size={15}
                  className="shrink-0 text-[var(--text-faint)]"
                />
              </span>
            </Link>
          </section>
        ) : null}
      </div>
    </AppShell>
  );
}
