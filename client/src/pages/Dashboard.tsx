import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowRight, Flame, Loader2, RotateCw, Target } from "lucide-react";
import { Link } from "wouter";

import AppShell from "@/components/AppShell";
import OnboardingModal from "@/components/OnboardingModal";
import PageHeader from "@/components/PageHeader";
import { PageEmpty, PageSkeleton } from "@/components/PageState";
import SwipeDismissNotice from "@/components/SwipeDismissNotice";
import { useAuth } from "@/contexts/AuthContext";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";
import { useQuestionBank } from "@/hooks/useQuestionBank";
import {
  createQuestionIdentityIndex,
  toQuestionId,
  type QuestionId,
} from "@/lib/questionIdentity";
import {
  buildQuestionProgress,
  countCurrentStreak,
  getAnswerAttempts,
} from "@/lib/userProgress";
import { supabase } from "@/lib/supabase";

type AnswerRow = {
  question_id: QuestionId;
  is_correct: boolean;
  answered_at: string;
};

type ProfileRow = {
  full_name?: string;
  target_exam?: string;
};

type TopicPerformance = {
  topic: string;
  correct: number;
  total: number;
  incorrect: number;
  accuracy: number;
};

const toDateKey = (value: Date | string) =>
  new Date(value).toLocaleDateString("en-CA");

const clampPercent = (value: number) =>
  Math.max(0, Math.min(100, Number.isFinite(value) ? value : 0));

const formatCount = (value: number) =>
  new Intl.NumberFormat("en-IN").format(value);

const formatActivityStamp = (value: string) =>
  new Date(value).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });

const formatLongDate = (value: Date) =>
  new Intl.DateTimeFormat("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(value);

const formatShortDay = (value: Date) =>
  new Intl.DateTimeFormat("en-IN", { weekday: "short" }).format(value);

const buildPracticeHref = ({
  topic,
  exam,
  incorrect,
  questionId,
}: {
  topic?: string;
  exam?: string;
  incorrect?: boolean;
  questionId?: string | number;
}) => {
  const params = new URLSearchParams();
  if (topic) params.set("topic", topic);
  if (exam) params.set("exam", exam);
  if (incorrect) params.set("incorrect", "1");
  if (questionId) params.set("question", String(questionId));
  const query = params.toString();
  return query ? `/practice?${query}` : "/practice";
};

function DashboardListLink({
  href,
  title,
  detail,
  meta,
}: {
  href: string;
  title: string;
  detail: string;
  meta?: string;
}) {
  return (
    <Link href={href}>
      <span className="dashboard-list-link group flex cursor-pointer items-start justify-between gap-4 rounded-[20px] border px-4 py-4 transition">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[var(--text-primary)] transition group-hover:text-[var(--text-primary)]">
            {title}
          </p>
          <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">
            {detail}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          {meta ? (
            <span className="rounded-full border border-[var(--border)] bg-[var(--surface-1)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--text-faint)] shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
              {meta}
            </span>
          ) : null}
          <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface-1)] text-[var(--text-faint)] transition group-hover:translate-x-0.5 group-hover:border-[var(--brand-muted)] group-hover:text-[var(--brand)]">
            <ArrowRight size={14} />
          </span>
        </div>
      </span>
    </Link>
  );
}

export default function Dashboard() {
  const { user, loading } = useAuth();
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [answers, setAnswers] = useState<AnswerRow[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [dailyGoalOverride, setDailyGoalOverride] = useState<number | null>(
    null
  );
  const { questions, syncing: questionsSyncing } = useQuestionBank();
  const loadDashboardData = useCallback(
    async (mode: "initial" | "refresh" = "initial") => {
      if (!user) {
        setPageLoading(false);
        setRefreshing(false);
        return;
      }

      if (mode === "initial") {
        setPageLoading(true);
      } else {
        setRefreshing(true);
      }

      try {
        const [{ data: profileData }, answersData] = await Promise.all([
          supabase.from("profiles").select("*").eq("id", user.id).single(),
          getAnswerAttempts(user.id),
        ]);

        setProfile(profileData || null);
        setAnswers(
          (answersData || []).map(item => ({
            ...item,
            answered_at: item.answered_at ?? new Date(0).toISOString(),
          }))
        );

        const metadata = user.user_metadata || {};
        if (
          !metadata.onboarding_completed_at &&
          (answersData?.length ?? 0) === 0
        ) {
          setShowOnboarding(true);
        }
      } finally {
        if (mode === "initial") {
          setPageLoading(false);
        } else {
          setRefreshing(false);
        }
      }
    },
    [user]
  );

  useEffect(() => {
    if (loading) return;
    if (!user) {
      setPageLoading(false);
      return;
    }

    void loadDashboardData("initial");
  }, [loadDashboardData, loading, user]);

  const questionIdentity = useMemo(
    () => createQuestionIdentityIndex(questions),
    [questions]
  );
  const questionLookup = questionIdentity.questionLookup;

  const resolvedAnswers = useMemo(
    () =>
      answers
        .map(item => {
          const questionId = questionIdentity.resolveQuestionId(
            item.question_id
          );
          if (!questionId) return null;
          return { ...item, question_id: questionId };
        })
        .filter((item): item is AnswerRow => Boolean(item)),
    [answers, questionIdentity]
  );

  const questionProgress = useMemo(
    () => Object.values(buildQuestionProgress(resolvedAnswers)),
    [resolvedAnswers]
  );

  const solvedIds = useMemo(
    () =>
      new Set(
        questionProgress
          .filter(item => item.status === "correct")
          .map(item => item.question_id)
      ),
    [questionProgress]
  );

  const attemptedIds = useMemo(
    () => new Set(questionProgress.map(item => item.question_id)),
    [questionProgress]
  );

  const sortedAnswers = useMemo(
    () =>
      [...resolvedAnswers].sort(
        (a, b) =>
          new Date(b.answered_at).getTime() - new Date(a.answered_at).getTime()
      ),
    [resolvedAnswers]
  );

  const totalAttempts = attemptedIds.size;
  const totalSolved = solvedIds.size;
  const totalRetry = Math.max(0, totalAttempts - totalSolved);
  const totalUnattempted = Math.max(0, questions.length - totalAttempts);
  const accuracy =
    totalAttempts > 0 ? Math.round((totalSolved / totalAttempts) * 100) : 0;
  const streak = countCurrentStreak(sortedAnswers);
  const targetExam =
    profile?.target_exam || user?.user_metadata?.target_exam || "UPSC CSE 2026";
  const displayName =
    user?.user_metadata?.full_name?.split(" ")[0] ||
    profile?.full_name?.split(" ")[0] ||
    user?.email?.split("@")[0] ||
    "Aspirant";
  const refreshDashboard = useCallback(async () => {
    if (loading || !user) return;
    await loadDashboardData("refresh");
  }, [loadDashboardData, loading, user]);

  const dailyGoal =
    dailyGoalOverride ??
    (Number.parseInt(String(user?.user_metadata?.daily_goal || "12"), 10) ||
      12);
  const todayKey = toDateKey(new Date());
  const todayAnswers = sortedAnswers.filter(
    item => toDateKey(item.answered_at) === todayKey
  );
  const todayAttempts = todayAnswers.length;
  const dailyRemaining = Math.max(0, dailyGoal - todayAttempts);
  const dailyProgressPercent =
    dailyGoal > 0
      ? clampPercent(Math.round((todayAttempts / dailyGoal) * 100))
      : 0;

  const topicPerformance = useMemo(() => {
    const grouped = questionProgress.reduce<
      Record<
        string,
        {
          topic: string;
          correct: number;
          total: number;
          incorrect: number;
        }
      >
    >((acc, item) => {
      const question = questionLookup.get(item.question_id);
      if (!question) return acc;

      const current = acc[question.topic] || {
        topic: question.topic,
        correct: 0,
        total: 0,
        incorrect: 0,
      };

      current.total += 1;
      if (item.status === "correct") {
        current.correct += 1;
      } else {
        current.incorrect += 1;
      }

      acc[question.topic] = current;
      return acc;
    }, {});

    return Object.values(grouped)
      .map(item => ({
        topic: item.topic,
        correct: item.correct,
        total: item.total,
        incorrect: item.incorrect,
        accuracy: clampPercent(Math.round((item.correct / item.total) * 100)),
      }))
      .sort((a, b) => {
        const aHasContext = a.total >= 2 ? 1 : 0;
        const bHasContext = b.total >= 2 ? 1 : 0;
        if (aHasContext !== bHasContext) return bHasContext - aHasContext;
        if (a.accuracy !== b.accuracy) return a.accuracy - b.accuracy;
        return b.total - a.total;
      });
  }, [questionLookup, questionProgress]);

  const weakTopics: TopicPerformance[] = topicPerformance
    .filter(topic => topic.incorrect > 0)
    .slice(0, 3);

  const focusAreas = useMemo(() => {
    const reviewTopics = topicPerformance
      .filter(topic => topic.incorrect > 0)
      .sort((a, b) => {
        if (a.incorrect !== b.incorrect) return b.incorrect - a.incorrect;
        if (a.accuracy !== b.accuracy) return a.accuracy - b.accuracy;
        return b.total - a.total;
      })
      .slice(0, 2)
      .map(topic => ({
        title: `Practice ${topic.topic}`,
        detail: `${topic.incorrect} missed question${topic.incorrect === 1 ? "" : "s"} ready to revisit`,
        href: buildPracticeHref({ topic: topic.topic, incorrect: true }),
      }));

    if (dailyRemaining > 0) {
      return [
        {
          title: "Finish today's set",
          detail: `${dailyRemaining} question${dailyRemaining === 1 ? "" : "s"} left to reach ${dailyGoal}`,
          href: "/practice",
        },
        ...reviewTopics,
      ].slice(0, 3);
    }

    return reviewTopics;
  }, [dailyGoal, dailyRemaining, topicPerformance]);

  const solvedCoverage = useMemo(() => {
    const order = ["Easy", "Medium", "Hard"] as const;

    return {
      totalSolved,
      totalQuestions: questions.length,
      byDifficulty: order.map(difficulty => {
        const pool = questions.filter(
          question => question.difficulty === difficulty
        );
        const solved = pool.filter(question =>
          solvedIds.has(toQuestionId(question.id))
        ).length;

        return {
          difficulty,
          solved,
          total: pool.length,
        };
      }),
    };
  }, [questions, solvedIds, totalSolved]);

  const solvedPercent =
    solvedCoverage.totalQuestions > 0
      ? clampPercent(
          Math.round(
            (solvedCoverage.totalSolved / solvedCoverage.totalQuestions) * 100
          )
        )
      : 0;

  const recentSessions = useMemo(
    () =>
      sortedAnswers.slice(0, 4).map(item => {
        const question = questionLookup.get(item.question_id);
        return {
          id: item.question_id,
          topic: question?.topic || "Practice session",
          exam: question?.exam || "General",
          correct: item.is_correct,
          date: formatActivityStamp(item.answered_at),
        };
      }),
    [questionLookup, sortedAnswers]
  );

  const weeklyActivity = useMemo(() => {
    const counts = resolvedAnswers.reduce<Record<string, number>>(
      (acc, item) => {
        const key = toDateKey(item.answered_at);
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      },
      {}
    );

    const days = Array.from({ length: 7 }, (_, index) => {
      const date = new Date();
      date.setHours(0, 0, 0, 0);
      date.setDate(date.getDate() - (6 - index));
      const key = toDateKey(date);

      return {
        key,
        label: formatShortDay(date),
        title: formatLongDate(date),
        count: counts[key] || 0,
      };
    });

    return {
      days,
      total: days.reduce((sum, day) => sum + day.count, 0),
      maxCount: Math.max(1, ...days.map(day => day.count)),
    };
  }, [resolvedAnswers]);

  const strongestTopic = useMemo(() => {
    const ranked = topicPerformance
      .filter(topic => topic.total >= 2)
      .sort((a, b) => {
        if (a.accuracy !== b.accuracy) return b.accuracy - a.accuracy;
        return b.total - a.total;
      });

    return ranked[0] || null;
  }, [topicPerformance]);

  const summaryStats = [
    {
      label: "Solved",
      value: formatCount(totalSolved),
      detail: `${formatCount(questions.length)} in current bank`,
    },
    {
      label: "Accuracy",
      value: `${accuracy}%`,
      detail:
        totalAttempts > 0
          ? `${formatCount(totalRetry)} still worth revisiting`
          : "Starts after your first attempt",
    },
    {
      label: "Daily pace",
      value: `${todayAttempts}/${dailyGoal}`,
      detail:
        dailyRemaining > 0
          ? `${dailyRemaining} left today`
          : "Target completed",
    },
    {
      label: "Streak",
      value: `${streak}d`,
      detail:
        streak > 0 ? "Consistency is building" : "Start a new streak today",
    },
  ];
  const dashboardRefresh = usePullToRefresh({
    enabled: Boolean(user) && !loading && !pageLoading && !questionsSyncing,
    onRefresh: refreshDashboard,
  });

  if (loading || pageLoading || questionsSyncing) {
    return (
      <AppShell>
        <div className="mx-auto w-full max-w-[1120px] py-4">
          <PageSkeleton rows={6} />
        </div>
      </AppShell>
    );
  }

  if (!user) {
    return (
      <AppShell>
        <div className="mx-auto w-full max-w-[1120px] py-10">
          <PageEmpty
            title="Sign in to unlock your prep workspace"
            description="Your dashboard ties together practice history, streak, and focus areas once your progress is attached to an account."
            actionLabel="Go back home"
            actionHref="/"
            className="rounded-[24px] border-[var(--border)] bg-[var(--bg-card)] py-14"
          />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell contentClassName="max-w-none">
      <OnboardingModal
        isOpen={showOnboarding}
        userId={user.id}
        defaultExam={targetExam}
        onClose={() => setShowOnboarding(false)}
        onComplete={({
          targetExam: nextTargetExam,
          dailyGoal: nextDailyGoal,
        }) => {
          setProfile((current: ProfileRow | null) => ({
            ...(current || {}),
            target_exam: nextTargetExam,
          }));
          setDailyGoalOverride(Number.parseInt(nextDailyGoal, 10) || 12);
        }}
      />

      <div className="dashboard-shell relative">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(87,123,235,0.14),transparent_30%),radial-gradient(circle_at_82%_12%,rgba(255,140,50,0.14),transparent_22%),radial-gradient(circle_at_50%_100%,rgba(97,185,149,0.08),transparent_30%)]" />
        <div
          {...dashboardRefresh.bind}
          className="relative z-10 mx-auto w-full max-w-[1120px] space-y-6 pb-6 transition-transform duration-200"
          style={{
            transform: `translateY(${dashboardRefresh.pullDistance}px)`,
            transition: dashboardRefresh.pullDistance > 0 ? "none" : undefined,
          }}
        >
          <div
            className="pointer-events-none flex justify-center overflow-hidden transition-[max-height,opacity] duration-200"
            style={{
              maxHeight:
                dashboardRefresh.pullDistance > 0 || refreshing ? "72px" : "0px",
              opacity:
                dashboardRefresh.pullDistance > 0 || refreshing ? 1 : 0,
            }}
          >
            <div className="mb-1 inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface-1)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)] shadow-[var(--shadow-sm)]">
              {dashboardRefresh.isRefreshing || refreshing ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Refreshing
                </>
              ) : dashboardRefresh.readyToRefresh ? (
                "Release to refresh"
              ) : (
                "Pull to refresh"
              )}
            </div>
          </div>

          <section className="card dashboard-hero overflow-hidden p-6 md:p-8">
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_260px] lg:items-end">
              <PageHeader
                eyebrow="Dashboard"
                title="Your practice command center."
                description={`${displayName}, you’re working toward ${targetExam}. ${formatLongDate(new Date())}. ${dailyRemaining > 0 ? `${dailyRemaining} question${dailyRemaining === 1 ? "" : "s"} still close today’s target.` : "Today’s target is complete, so this is a good moment for review."}`}
                className="mb-0 flex-1"
                actions={
                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        void refreshDashboard();
                      }}
                      className="badge cursor-pointer transition hover:border-[var(--border-strong)] hover:bg-[var(--surface-1)]"
                    >
                      {refreshing ? (
                        <Loader2 size={13} className="animate-spin" />
                      ) : (
                        <RotateCw size={13} />
                      )}
                      Refresh
                    </button>
                    <span className="badge">
                      <Target size={13} />
                      {todayAttempts} / {dailyGoal} today
                    </span>
                    <span className="badge">
                      <Flame size={13} />
                      {streak} day{streak === 1 ? "" : "s"} streak
                    </span>
                    <Link href="/practice">
                      <span className="btn-primary cursor-pointer px-5">
                        Continue practice
                        <ArrowRight size={15} />
                      </span>
                    </Link>
                  </div>
                }
              />

              <div className="dashboard-hero-panel rounded-[24px] p-5">
                <p className="section-label">Momentum</p>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="dashboard-glass-tile rounded-[18px] p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-faint)]">
                      Accuracy
                    </p>
                    <p className="mt-2 text-[1.9rem] font-semibold tracking-[-0.06em] text-[var(--text-primary)]">
                      {accuracy}%
                    </p>
                    <p className="mt-1 text-xs text-[var(--text-secondary)]">
                      Across {formatCount(totalAttempts)} attempts
                    </p>
                  </div>
                  <div className="dashboard-glass-tile rounded-[18px] p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-faint)]">
                      Review
                    </p>
                    <p className="mt-2 text-[1.9rem] font-semibold tracking-[-0.06em] text-[var(--text-primary)]">
                      {formatCount(totalRetry)}
                    </p>
                    <p className="mt-1 text-xs text-[var(--text-secondary)]">
                      Ready for another pass
                    </p>
                  </div>
                </div>
                <div className="dashboard-glass-tile mt-4 rounded-[18px] px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-faint)]">
                    Today&apos;s pulse
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                    {todayAttempts > 0
                      ? `${todayAttempts} question${todayAttempts === 1 ? "" : "s"} completed so far. Stay with the same rhythm and you will close strong.`
                      : "Start with one short set. Momentum usually appears after the first 10 minutes."}
                  </p>
                </div>
              </div>
            </div>
          </section>

          <SwipeDismissNotice
            title="Refresh with a pull"
            description="On mobile, pull down from the top to reload your dashboard. On desktop, use the refresh chip."
            className="bg-[var(--bg-card)]"
          />

          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {summaryStats.map(item => (
              <div key={item.label} className="stat-card dashboard-stat-card">
                <p className="stat-card-label">{item.label}</p>
                <p className="stat-card-value">{item.value}</p>
                <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
                  {item.detail}
                </p>
              </div>
            ))}
          </section>

          <section className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_340px]">
            <div className="space-y-6">
              <div className="card dashboard-panel grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
                <div>
                  <p className="section-label">Coverage</p>
                  <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <p className="text-[3.7rem] leading-none tracking-[-0.07em] text-[var(--text-primary)]">
                        {solvedPercent}%
                      </p>
                      <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
                        {formatCount(totalSolved)} solved and{" "}
                        {formatCount(totalUnattempted)} still untouched.
                      </p>
                    </div>
                    <div className="dashboard-mini-panel rounded-[20px] px-4 py-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-faint)]">
                        Today&apos;s target
                      </p>
                      <p className="mt-2 text-sm text-[var(--text-secondary)]">
                        {dailyRemaining > 0
                          ? "A small finish line keeps the day focused."
                          : "Today is open for revision and retries."}
                      </p>
                      <div className="dashboard-progress-track mt-4 h-2.5 overflow-hidden rounded-full">
                        <div
                          className="h-full rounded-full bg-[linear-gradient(90deg,var(--brand-light)_0%,var(--brand)_55%,#ffb15f_100%)] shadow-[0_10px_20px_-12px_var(--brand-glow)] transition-all duration-500"
                          style={{
                            width: `${Math.max(
                              dailyProgressPercent,
                              todayAttempts > 0 ? 6 : 0
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 space-y-4">
                    {solvedCoverage.byDifficulty.map(item => {
                      const percent =
                        item.total > 0
                          ? clampPercent(
                              Math.round((item.solved / item.total) * 100)
                            )
                          : 0;

                      return (
                        <div
                          key={item.difficulty}
                          className="grid gap-3 sm:grid-cols-[84px_minmax(0,1fr)_76px] sm:items-center"
                        >
                          <span className="dashboard-chip inline-flex w-fit rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text-secondary)]">
                            {item.difficulty}
                          </span>
                          <div className="dashboard-progress-track h-2.5 overflow-hidden rounded-full">
                            <div
                              className="h-full rounded-full bg-[linear-gradient(90deg,var(--accent)_0%,var(--brand)_100%)] shadow-[0_10px_20px_-12px_rgba(87,123,235,0.32)] transition-all duration-500"
                              style={{
                                width: `${Math.max(percent, item.solved > 0 ? 7 : 0)}%`,
                              }}
                            />
                          </div>
                          <span className="text-right text-sm text-[var(--text-faint)]">
                            {formatCount(item.solved)} /{" "}
                            {formatCount(item.total)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="dashboard-mini-panel rounded-[22px] p-5">
                  <p className="section-label">Signals</p>
                  <div className="mt-4 space-y-5">
                    <div>
                      <p className="text-sm font-semibold text-[var(--text-primary)]">
                        Strongest topic
                      </p>
                      <p className="mt-2 text-lg font-semibold tracking-[-0.03em] text-[var(--text-primary)]">
                        {strongestTopic?.topic || "Still emerging"}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                        {strongestTopic
                          ? `${strongestTopic.accuracy}% accuracy across ${strongestTopic.total} attempt${strongestTopic.total === 1 ? "" : "s"}.`
                          : "Your strongest topic will appear once there is enough answer history."}
                      </p>
                    </div>

                    <div className="border-t border-[var(--border)] pt-5">
                      <p className="text-sm font-semibold text-[var(--text-primary)]">
                        Retry queue
                      </p>
                      <p className="mt-2 text-[2.1rem] tracking-[-0.05em] text-[var(--text-primary)]">
                        {formatCount(totalRetry)}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                        Questions worth revisiting before starting fresh sets.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card dashboard-panel">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="section-label">Activity</p>
                    <p className="mt-2 text-lg font-semibold tracking-[-0.02em] text-[var(--text-primary)]">
                      Weekly practice pattern
                    </p>
                  </div>
                  <p className="text-sm text-[var(--text-secondary)]">
                    {weeklyActivity.total > 0
                      ? `${weeklyActivity.total} attempts in the last 7 days`
                      : "Your weekly rhythm will appear after your next session"}
                  </p>
                </div>

                <div className="mt-6 flex h-[210px] items-end gap-4">
                  {weeklyActivity.days.map(day => {
                    const height =
                      day.count === 0
                        ? 12
                        : Math.max(
                            20,
                            Math.round(
                              (day.count / weeklyActivity.maxCount) * 100
                            )
                          );

                    return (
                      <div
                        key={day.key}
                        className="flex flex-1 flex-col items-center gap-3"
                      >
                        <span className="text-[11px] font-medium text-[var(--text-faint)]">
                          {day.count}
                        </span>
                        <div
                          className={`dashboard-day-tile relative flex h-[160px] w-full items-end rounded-[16px] border px-2 pb-2 ${
                            day.key === todayKey
                              ? "is-active border-[var(--brand-muted)]"
                              : "border-[var(--border-soft)]"
                          }`}
                        >
                          <div
                            title={`${day.title}: ${day.count} attempt${day.count === 1 ? "" : "s"}`}
                            className="w-full rounded-[10px] bg-[linear-gradient(180deg,var(--accent)_0%,var(--brand)_100%)] shadow-[0_16px_26px_-18px_rgba(87,123,235,0.42)] transition duration-300 hover:-translate-y-0.5"
                            style={{
                              height: `${height}%`,
                              opacity: day.count === 0 ? 0.18 : 0.94,
                            }}
                          />
                        </div>
                        <span
                          className={`text-xs ${
                            day.key === todayKey
                              ? "font-semibold text-[var(--text-primary)]"
                              : "text-[var(--text-secondary)]"
                          }`}
                        >
                          {day.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <aside className="space-y-6">
              <div className="card dashboard-sidecard">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="section-label">Focus</p>
                    <p className="mt-2 text-lg font-semibold tracking-[-0.02em] text-[var(--text-primary)]">
                      Next best actions
                    </p>
                  </div>
                  <span className="badge-amber">Priority</span>
                </div>

                <div className="mt-3 space-y-2">
                  {focusAreas.length > 0 ? (
                    focusAreas.map((item, index) => (
                      <DashboardListLink
                        key={item.title}
                        href={item.href}
                        title={item.title}
                        detail={item.detail}
                        meta={index === 0 ? "Now" : undefined}
                      />
                    ))
                  ) : (
                    <p className="mt-4 text-sm leading-6 text-[var(--text-secondary)]">
                      Your next focus areas will appear after a few more
                      answers.
                    </p>
                  )}
                </div>
              </div>

              <div className="card dashboard-sidecard">
                <p className="section-label">Weak topics</p>
                <p className="mt-2 text-lg font-semibold tracking-[-0.02em] text-[var(--text-primary)]">
                  Areas to revisit
                </p>

                <div className="mt-3 space-y-2">
                  {weakTopics.length > 0 ? (
                    weakTopics.map(topic => (
                      <DashboardListLink
                        key={topic.topic}
                        href={buildPracticeHref({
                          topic: topic.topic,
                          incorrect: true,
                        })}
                        title={topic.topic}
                        detail={`${topic.accuracy}% accuracy across ${topic.total} attempt${topic.total === 1 ? "" : "s"}`}
                        meta={`${topic.incorrect} miss${topic.incorrect === 1 ? "" : "es"}`}
                      />
                    ))
                  ) : (
                    <p className="mt-4 text-sm leading-6 text-[var(--text-secondary)]">
                      Weak topics will show up once you build more history.
                    </p>
                  )}
                </div>
              </div>

              <div className="card dashboard-sidecard">
                <p className="section-label">Recent</p>
                <p className="mt-2 text-lg font-semibold tracking-[-0.02em] text-[var(--text-primary)]">
                  Latest activity
                </p>

                <div className="mt-4 space-y-3">
                  {recentSessions.length > 0 ? (
                    recentSessions.map(session => (
                      <Link
                        key={`${session.id}-${session.date}`}
                        href={buildPracticeHref({
                          questionId: session.id,
                          topic: session.topic,
                          exam:
                            session.exam !== "General"
                              ? session.exam
                              : undefined,
                        })}
                      >
                        <span className="group flex cursor-pointer items-start gap-3 rounded-[18px] border border-transparent px-3 py-3 transition hover:border-[var(--border)] hover:bg-[var(--surface-1)]">
                          <span
                            className={`mt-2 h-2.5 w-2.5 shrink-0 rounded-full ${
                              session.correct
                                ? "bg-[var(--green)]"
                                : "bg-[var(--red)]"
                            }`}
                          />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-[var(--text-primary)]">
                              {session.topic}
                            </p>
                            <p className="mt-1 text-sm text-[var(--text-secondary)]">
                              {session.date}
                            </p>
                          </div>
                          <span
                            className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] ${
                              session.correct
                                ? "bg-[var(--green-bg)] text-[var(--green)]"
                                : "bg-[var(--red-bg)] text-[var(--red)]"
                            }`}
                          >
                            {session.correct ? "Correct" : "Retry"}
                          </span>
                        </span>
                      </Link>
                    ))
                  ) : (
                    <p className="text-sm leading-6 text-[var(--text-secondary)]">
                      Recent activity will appear after your next practice
                      session.
                    </p>
                  )}
                </div>
              </div>
            </aside>
          </section>
        </div>
      </div>
    </AppShell>
  );
}
