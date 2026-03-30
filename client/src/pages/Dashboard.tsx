import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Flame, Target } from "lucide-react";
import { Link } from "wouter";

import AppShell from "@/components/AppShell";
import OnboardingModal from "@/components/OnboardingModal";
import { PageEmpty, PageSkeleton } from "@/components/PageState";
import { useAuth } from "@/contexts/AuthContext";
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
      <span className="group flex cursor-pointer items-start justify-between gap-4 border-b border-white/8 py-3.5 transition hover:border-white/14 hover:bg-white/[0.02]">
        <div className="min-w-0">
          <p className="text-sm font-medium text-[#f0ede6] transition group-hover:text-white">
            {title}
          </p>
          <p className="mt-1 text-sm leading-6 text-[#9f9a90]">{detail}</p>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          {meta ? (
            <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-[#7f796f]">
              {meta}
            </span>
          ) : null}
          <ArrowRight
            size={14}
            className="text-[#cdbca6] transition group-hover:translate-x-0.5 group-hover:text-white"
          />
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
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [dailyGoalOverride, setDailyGoalOverride] = useState<number | null>(
    null
  );
  const { questions, syncing: questionsSyncing } = useQuestionBank();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      setPageLoading(false);
      return;
    }

    const load = async () => {
      setPageLoading(true);
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

      setPageLoading(false);
    };

    load();
  }, [loading, user]);

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

  if (loading || pageLoading || questionsSyncing) {
    return (
      <AppShell shellClassName="bg-[#050505]">
        <div className="mx-auto w-full max-w-[1120px] py-4">
          <PageSkeleton rows={6} />
        </div>
      </AppShell>
    );
  }

  if (!user) {
    return (
      <AppShell shellClassName="bg-[#050505]">
        <div className="mx-auto w-full max-w-[1120px] py-10">
          <PageEmpty
            title="Sign in to unlock your prep workspace"
            description="Your dashboard ties together practice history, streak, and focus areas once your progress is attached to an account."
            actionLabel="Go back home"
            actionHref="/"
            className="rounded-[24px] border-white/10 bg-[#090807] py-14"
          />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell shellClassName="bg-[#050505]" contentClassName="max-w-none">
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

      <div className="relative">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(164,118,76,0.09),transparent_34%),radial-gradient(circle_at_82%_18%,rgba(120,78,42,0.16),transparent_24%),radial-gradient(circle_at_50%_100%,rgba(255,255,255,0.03),transparent_38%),linear-gradient(180deg,#060505_0%,#090807_46%,#050505_100%)]" />
        <div className="pointer-events-none absolute inset-0 opacity-[0.11] [background-image:linear-gradient(to_right,rgba(255,255,255,0.045)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:150px_150px]" />

        <div className="relative z-10 mx-auto w-full max-w-[1120px] pb-6">
          <section className="border-b border-white/8 pb-8 pt-2">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-[720px]">
                <p className="text-[0.72rem] font-medium uppercase tracking-[0.26em] text-[#8f8174]">
                  Dashboard
                </p>
                <h1
                  className="mt-3 text-[2.9rem] leading-none tracking-[-0.045em] text-[#f0ede6] sm:text-[3.35rem]"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Study with a calmer, clearer rhythm.
                </h1>
                <p className="mt-4 max-w-[58ch] text-[15px] leading-7 text-[#a99888]">
                  {displayName}, you&apos;re preparing for{" "}
                  <span className="text-[#f0ede6]">{targetExam}</span>.{" "}
                  {formatLongDate(new Date())} and you have{" "}
                  <span className="text-[#e8d5a3]">
                    {dailyRemaining > 0
                      ? `${dailyRemaining} question${dailyRemaining === 1 ? "" : "s"} left today`
                      : "today's goal completed"}
                  </span>
                  .
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 lg:justify-end">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm text-[#cdbca6]">
                  <Target size={15} />
                  {todayAttempts} / {dailyGoal} today
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm text-[#cdbca6]">
                  <Flame size={15} />
                  {streak} day{streak === 1 ? "" : "s"} streak
                </span>
                <Link href="/practice">
                  <span className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-[#c9a84c] bg-[#c9a84c] px-5 py-3 text-sm font-medium text-[#0e0e0e] transition hover:bg-[#e8d5a3]">
                    Continue practice
                    <ArrowRight size={15} />
                  </span>
                </Link>
              </div>
            </div>
          </section>

          <section className="grid gap-5 border-b border-white/8 py-7 md:grid-cols-2 xl:grid-cols-4">
            {summaryStats.map((item, index) => (
              <div
                key={item.label}
                className={
                  index > 0 ? "xl:border-l xl:border-white/8 xl:pl-6" : ""
                }
              >
                <p className="text-[0.68rem] font-medium uppercase tracking-[0.22em] text-[#7f796f]">
                  {item.label}
                </p>
                <p
                  className="mt-3 text-[2.6rem] leading-none tracking-[-0.045em] text-[#f0ede6]"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {item.value}
                </p>
                <p className="mt-2 text-sm text-[#9f9a90]">{item.detail}</p>
              </div>
            ))}
          </section>

          <section className="grid gap-10 py-8 xl:grid-cols-[minmax(0,1.25fr)_310px]">
            <div className="space-y-8">
              <div className="grid gap-8 border-b border-white/8 pb-8 lg:grid-cols-[170px_minmax(0,1fr)]">
                <div>
                  <p className="text-[0.68rem] font-medium uppercase tracking-[0.22em] text-[#7f796f]">
                    Coverage
                  </p>
                  <p
                    className="mt-3 text-[4.2rem] leading-none tracking-[-0.05em] text-[#f0ede6]"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {solvedPercent}%
                  </p>
                  <p className="mt-3 text-sm leading-6 text-[#9f9a90]">
                    {formatCount(totalSolved)} solved and{" "}
                    {formatCount(totalUnattempted)} still untouched.
                  </p>
                </div>

                <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_240px]">
                  <div>
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-medium text-[#f0ede6]">
                          Today&apos;s target
                        </p>
                        <p className="mt-1 text-sm text-[#9f9a90]">
                          {dailyRemaining > 0
                            ? "A small finish line keeps the day focused."
                            : "Today is open for revision and retries."}
                        </p>
                      </div>
                      <span className="rounded-full border border-white/10 px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.18em] text-[#cdbca6]">
                        {dailyRemaining > 0
                          ? `${dailyRemaining} left`
                          : "Complete"}
                      </span>
                    </div>

                    <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-[linear-gradient(90deg,#f0ede6_0%,#c9a84c_100%)] transition-all duration-500"
                        style={{
                          width: `${Math.max(
                            dailyProgressPercent,
                            todayAttempts > 0 ? 6 : 0
                          )}%`,
                        }}
                      />
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
                            className="grid gap-3 sm:grid-cols-[68px_minmax(0,1fr)_56px] sm:items-center"
                          >
                            <span className="text-sm text-[#c9c3b7]">
                              {item.difficulty}
                            </span>
                            <div className="h-1.5 overflow-hidden rounded-full bg-white/8">
                              <div
                                className="h-full rounded-full bg-[linear-gradient(90deg,#e8d5a3_0%,#c9a84c_100%)] transition-all duration-500"
                                style={{
                                  width: `${Math.max(
                                    percent,
                                    item.solved > 0 ? 7 : 0
                                  )}%`,
                                }}
                              />
                            </div>
                            <span className="text-right text-sm text-[#8f897f]">
                              {formatCount(item.solved)} /{" "}
                              {formatCount(item.total)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="border-t border-white/8 pt-6 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
                    <p className="text-[0.68rem] font-medium uppercase tracking-[0.22em] text-[#7f796f]">
                      Strongest topic
                    </p>
                    {strongestTopic ? (
                      <>
                        <p className="mt-3 text-xl font-medium tracking-[-0.03em] text-[#f0ede6]">
                          {strongestTopic.topic}
                        </p>
                        <p className="mt-2 text-sm leading-6 text-[#9f9a90]">
                          {strongestTopic.accuracy}% accuracy across{" "}
                          {strongestTopic.total} attempt
                          {strongestTopic.total === 1 ? "" : "s"}.
                        </p>
                      </>
                    ) : (
                      <p className="mt-3 text-sm leading-6 text-[#9f9a90]">
                        Your strongest topic will appear once there is enough
                        answer history.
                      </p>
                    )}

                    <div className="mt-6 border-t border-white/8 pt-5">
                      <p className="text-[0.68rem] font-medium uppercase tracking-[0.22em] text-[#7f796f]">
                        Retry queue
                      </p>
                      <p className="mt-3 text-2xl tracking-[-0.04em] text-[#f0ede6]">
                        {formatCount(totalRetry)}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-[#9f9a90]">
                        Questions worth revisiting before starting fresh sets.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-[0.68rem] font-medium uppercase tracking-[0.22em] text-[#7f796f]">
                      Activity
                    </p>
                    <p className="mt-2 text-lg font-medium tracking-[-0.02em] text-[#f0ede6]">
                      Weekly practice pattern
                    </p>
                  </div>
                  <p className="text-sm text-[#9f9a90]">
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
                        <span className="text-[11px] text-[#7f796f]">
                          {day.count}
                        </span>
                        <div className="relative flex h-[160px] w-full items-end">
                          <div
                            title={`${day.title}: ${day.count} attempt${day.count === 1 ? "" : "s"}`}
                            className="w-full rounded-t-[16px] bg-[linear-gradient(180deg,rgba(232,213,163,0.92)_0%,rgba(201,168,76,0.9)_56%,rgba(121,86,27,0.88)_100%)] transition duration-300 hover:-translate-y-1"
                            style={{
                              height: `${height}%`,
                              opacity: day.count === 0 ? 0.18 : 1,
                            }}
                          />
                        </div>
                        <span className="text-xs text-[#c9c3b7]">
                          {day.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <aside className="space-y-8 xl:border-l xl:border-white/8 xl:pl-8">
              <div>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[0.68rem] font-medium uppercase tracking-[0.22em] text-[#7f796f]">
                      Focus
                    </p>
                    <p className="mt-2 text-lg font-medium tracking-[-0.02em] text-[#f0ede6]">
                      Next best actions
                    </p>
                  </div>
                  <span className="rounded-full border border-white/10 px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.18em] text-[#cdbca6]">
                    Priority
                  </span>
                </div>

                <div className="mt-3">
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
                    <p className="mt-4 text-sm leading-6 text-[#9f9a90]">
                      Your next focus areas will appear after a few more
                      answers.
                    </p>
                  )}
                </div>
              </div>

              <div className="border-t border-white/8 pt-8">
                <p className="text-[0.68rem] font-medium uppercase tracking-[0.22em] text-[#7f796f]">
                  Weak topics
                </p>
                <p className="mt-2 text-lg font-medium tracking-[-0.02em] text-[#f0ede6]">
                  Areas to revisit
                </p>

                <div className="mt-3">
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
                    <p className="mt-4 text-sm leading-6 text-[#9f9a90]">
                      Weak topics will show up once you build more history.
                    </p>
                  )}
                </div>
              </div>

              <div className="border-t border-white/8 pt-8">
                <p className="text-[0.68rem] font-medium uppercase tracking-[0.22em] text-[#7f796f]">
                  Recent
                </p>
                <p className="mt-2 text-lg font-medium tracking-[-0.02em] text-[#f0ede6]">
                  Latest activity
                </p>

                <div className="mt-4 space-y-4">
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
                        <span className="group flex cursor-pointer items-start gap-3 border-b border-white/8 py-3.5 transition hover:border-white/14 hover:bg-white/[0.02]">
                          <span
                            className={`mt-2 h-2 w-2 shrink-0 rounded-full ${
                              session.correct ? "bg-[#4caf7d]" : "bg-[#e05252]"
                            }`}
                          />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-[#f0ede6] transition group-hover:text-white">
                              {session.topic}
                            </p>
                            <p className="mt-1 text-sm text-[#9f9a90]">
                              {session.date}
                            </p>
                          </div>
                          <span
                            className={`rounded-full px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.16em] ${
                              session.correct
                                ? "bg-[#112117] text-[#b6d3bc]"
                                : "bg-[#241613] text-[#efc8bb]"
                            }`}
                          >
                            {session.correct ? "Correct" : "Retry"}
                          </span>
                        </span>
                      </Link>
                    ))
                  ) : (
                    <p className="text-sm leading-6 text-[#9f9a90]">
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
