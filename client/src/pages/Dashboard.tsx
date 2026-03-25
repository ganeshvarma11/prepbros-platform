import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import { Link } from "wouter";

import AppShell from "@/components/AppShell";
import OnboardingModal from "@/components/OnboardingModal";
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

const signInPanelClassName =
  "rounded-[24px] bg-[rgba(255,255,255,0.03)] p-8 text-center md:p-12";

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
  const ringRadius = 62;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringOffset =
    ringCircumference - (ringCircumference * solvedPercent) / 100;

  const recentSessions = useMemo(
    () =>
      sortedAnswers.slice(0, 2).map(item => {
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

  const subtitle =
    dailyRemaining > 0
      ? `${targetExam} / ${dailyRemaining} question${dailyRemaining === 1 ? "" : "s"} left today`
      : `${targetExam} / Daily goal complete`;

  if (loading || pageLoading || questionsSyncing) {
    return (
      <AppShell>
        <div className="container-shell flex min-h-[60vh] items-center justify-center">
          <div className="inline-flex items-center gap-3 rounded-full border border-[var(--border)] bg-[var(--bg-card)] px-5 py-3 text-sm text-[var(--text-secondary)]">
            <Loader2 size={16} className="animate-spin text-[var(--brand)]" />
            Loading your dashboard...
          </div>
        </div>
      </AppShell>
    );
  }

  if (!user) {
    return (
      <AppShell>
        <div className="container-shell py-14">
          <div className={signInPanelClassName}>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--brand)]">
              Dashboard
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-[-0.06em] text-[var(--text-primary)]">
              Sign in to unlock your prep workspace.
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-sm text-[var(--text-secondary)] md:text-base">
              Your dashboard ties together practice history, streak, and focus
              areas once your progress is attached to an account.
            </p>
            <Link href="/">
              <span className="btn-primary mt-8 inline-flex cursor-pointer px-6 py-3">
                Go back home
                <ArrowRight size={16} />
              </span>
            </Link>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
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

      <div className="mx-auto w-full max-w-[1040px] space-y-9 md:space-y-11">
        <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--text-faint)]">
              Workspace
            </p>
            <h1 className="text-[2rem] font-semibold tracking-[-0.07em] text-[var(--text-primary)] md:text-[2.4rem]">
              Dashboard
            </h1>
            <p className="max-w-2xl text-sm text-[var(--text-muted)] md:text-[0.95rem]">
              {subtitle}
            </p>
          </div>

          <Link href="/practice">
            <span className="btn-primary inline-flex cursor-pointer self-start rounded-[14px] px-5 py-3 text-sm">
              Continue Practice
              <ArrowRight size={16} />
            </span>
          </Link>
        </section>

        <section className="grid gap-5 border-y border-white/6 py-5 md:grid-cols-3 md:gap-8">
          {[
            {
              label: "Total Solved",
              value: formatCount(totalSolved),
              meta:
                totalAttempts > 0
                  ? `${accuracy}% accuracy across ${formatCount(totalAttempts)} attempted`
                  : "Solved count will appear after your first attempt",
            },
            {
              label: "Total Attempted",
              value: formatCount(totalAttempts),
              meta:
                totalAttempts > 0
                  ? `${formatCount(totalRetry)} question${totalRetry === 1 ? "" : "s"} in retry`
                  : "Attempted questions will show here",
            },
            {
              label: "Total Unattempted",
              value: formatCount(totalUnattempted),
              meta: `${formatCount(questions.length)} questions in your current bank`,
            },
          ].map(item => (
            <div key={item.label}>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--text-faint)]">
                {item.label}
              </p>
              <p className="mt-2 text-[1.45rem] font-semibold tracking-[-0.06em] text-[var(--text-primary)] md:text-[1.65rem]">
                {item.value}
              </p>
              <p className="mt-1.5 text-xs text-[var(--text-muted)]">
                {item.meta}
              </p>
            </div>
          ))}
        </section>

        <section className="grid gap-10 border-b border-white/6 pb-10 lg:grid-cols-[minmax(280px,340px)_minmax(0,1fr)] lg:items-start">
          <div className="space-y-6">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--text-faint)]">
                Solved Progress
              </p>
              <p className="mt-2 max-w-[28ch] text-sm text-[var(--text-muted)]">
                Total solved coverage across your question bank.
              </p>
            </div>

            <div className="flex items-center gap-5">
              <div className="relative flex h-[176px] w-[176px] shrink-0 items-center justify-center">
                <div className="absolute h-24 w-24 rounded-full bg-[rgba(255,161,22,0.08)] blur-2xl" />
                <svg viewBox="0 0 180 180" className="h-full w-full -rotate-90">
                  <circle
                    cx="90"
                    cy="90"
                    r={ringRadius}
                    fill="none"
                    stroke="rgba(255,255,255,0.08)"
                    strokeWidth="10"
                  />
                  <circle
                    cx="90"
                    cy="90"
                    r={ringRadius}
                    fill="none"
                    stroke="var(--brand)"
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={ringCircumference}
                    strokeDashoffset={ringOffset}
                  />
                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <p className="text-[2.5rem] font-semibold tracking-[-0.08em] text-[var(--text-primary)]">
                    {formatCount(solvedCoverage.totalSolved)}
                  </p>
                  <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-faint)]">
                    solved
                  </p>
                </div>
              </div>

              <div className="min-w-0 space-y-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-faint)]">
                  Coverage
                </p>
                <p className="text-2xl font-semibold tracking-[-0.06em] text-[var(--text-primary)]">
                  {solvedPercent}%
                </p>
                <p className="text-sm text-[var(--text-muted)]">
                  {formatCount(totalAttempts)} attempted ·{" "}
                  {formatCount(totalUnattempted)} unattempted
                </p>
              </div>
            </div>

            <div className="space-y-3 border-t border-white/6 pt-5">
              {solvedCoverage.byDifficulty.map(item => (
                <div
                  key={item.difficulty}
                  className="flex items-center justify-between gap-4"
                >
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-faint)]">
                    {item.difficulty}
                  </p>
                  <p className="text-sm font-medium text-[var(--text-primary)]">
                    {formatCount(item.solved)} / {formatCount(item.total)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-8 md:grid-cols-2 md:gap-x-10 md:gap-y-9">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--text-faint)]">
                Weak Topics
              </p>
              <div className="mt-4 space-y-4">
                {weakTopics.length > 0 ? (
                  weakTopics.map(topic => (
                    <Link
                      key={topic.topic}
                      href={buildPracticeHref({
                        topic: topic.topic,
                        incorrect: true,
                      })}
                    >
                      <span className="group block cursor-pointer">
                        <span className="block text-sm font-medium text-[var(--text-primary)] transition group-hover:text-[var(--brand)]">
                          {topic.topic}
                        </span>
                        <span className="mt-1 block text-xs text-[var(--text-muted)]">
                          {topic.accuracy}% accuracy across {topic.total}{" "}
                          attempt{topic.total === 1 ? "" : "s"}
                        </span>
                      </span>
                    </Link>
                  ))
                ) : (
                  <p className="text-sm text-[var(--text-muted)]">
                    Weak topics will show up once you build more history.
                  </p>
                )}
              </div>
            </div>

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--text-faint)]">
                Focus Areas
              </p>
              <div className="mt-4 space-y-4">
                {focusAreas.length > 0 ? (
                  focusAreas.map(item => (
                    <Link key={item.title} href={item.href}>
                      <span className="group block cursor-pointer">
                        <span className="block text-sm font-medium text-[var(--text-primary)] transition group-hover:text-[var(--brand)]">
                          {item.title}
                        </span>
                        <span className="mt-1 block text-xs text-[var(--text-muted)]">
                          {item.detail}
                        </span>
                      </span>
                    </Link>
                  ))
                ) : (
                  <p className="text-sm text-[var(--text-muted)]">
                    Your next focus areas will appear after a few more answers.
                  </p>
                )}
              </div>
            </div>

            <div className="md:col-span-2">
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--text-faint)]">
                Recent Activity
              </p>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                {recentSessions.length > 0 ? (
                  recentSessions.map(session => (
                    <Link
                      key={`${session.id}-${session.date}`}
                      href={buildPracticeHref({
                        questionId: session.id,
                        topic: session.topic,
                        exam:
                          session.exam !== "General" ? session.exam : undefined,
                      })}
                    >
                      <span className="group block cursor-pointer border-b border-white/6 pb-4">
                        <span className="block text-sm font-medium text-[var(--text-primary)] transition group-hover:text-[var(--brand)]">
                          {session.topic}
                        </span>
                        <span className="mt-1 block text-xs text-[var(--text-muted)]">
                          {session.correct ? "Correct" : "Retry"} /{" "}
                          {session.date}
                        </span>
                      </span>
                    </Link>
                  ))
                ) : (
                  <p className="text-sm text-[var(--text-muted)]">
                    Recent activity will appear after your next practice
                    session.
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-8 md:grid-cols-3 md:gap-10">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--text-faint)]">
              Daily Progress
            </p>
            <div className="mt-4 space-y-4">
              <p className="text-[1.8rem] font-semibold tracking-[-0.06em] text-[var(--text-primary)]">
                {todayAttempts} / {dailyGoal}
              </p>
              <p className="text-sm text-[var(--text-muted)]">
                {dailyRemaining > 0
                  ? `${dailyRemaining} question${dailyRemaining === 1 ? "" : "s"} left to finish today`
                  : "Today's target is complete"}
              </p>
            </div>
          </div>

          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--text-faint)]">
              Accuracy
            </p>
            <div className="mt-4 space-y-4">
              <p className="text-[1.8rem] font-semibold tracking-[-0.06em] text-[var(--text-primary)]">
                {accuracy}%
              </p>
              <p className="text-sm text-[var(--text-muted)]">
                {totalAttempts > 0
                  ? `${formatCount(totalSolved)} solved out of ${formatCount(totalAttempts)} attempted`
                  : "Accuracy will start updating after your first attempt"}
              </p>
            </div>
          </div>

          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--text-faint)]">
              Current Streak
            </p>
            <div className="mt-4 space-y-4">
              <p className="text-[1.8rem] font-semibold tracking-[-0.06em] text-[var(--text-primary)]">
                {streak} day{streak === 1 ? "" : "s"}
              </p>
              <p className="text-sm text-[var(--text-muted)]">
                {dailyRemaining > 0
                  ? `${dailyRemaining} question${dailyRemaining === 1 ? "" : "s"} left today to stay on pace`
                  : "Daily goal complete for today"}
              </p>
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
