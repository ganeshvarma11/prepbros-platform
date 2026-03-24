import { useEffect, useMemo, useState } from "react";
import { ArrowRight, CheckCircle2, CircleAlert, Loader2 } from "lucide-react";
import { Link } from "wouter";

import AppShell from "@/components/AppShell";
import OnboardingModal from "@/components/OnboardingModal";
import { useAuth } from "@/contexts/AuthContext";
import { useQuestionBank } from "@/hooks/useQuestionBank";
import { createQuestionIdentityIndex, toQuestionId, type QuestionId } from "@/lib/questionIdentity";
import { getAnswerAttempts } from "@/lib/userProgress";
import { supabase } from "@/lib/supabase";

type AnswerRow = {
  question_id: QuestionId;
  is_correct: boolean;
  answered_at: string;
};

type ProfileRow = {
  full_name?: string;
  streak?: number;
  accuracy?: number;
  target_exam?: string;
};

type TopicPerformance = {
  topic: string;
  correct: number;
  total: number;
  incorrect: number;
  accuracy: number;
};

const signInPanelClassName = "rounded-[24px] bg-[rgba(255,255,255,0.03)] p-8 text-center md:p-12";
const heroClassName =
  "rounded-[32px] bg-[linear-gradient(180deg,rgba(255,255,255,0.045)_0%,rgba(255,255,255,0.02)_100%)] px-6 py-7 md:px-8 md:py-8";
const sectionClassName = "rounded-[28px] bg-[rgba(255,255,255,0.02)] px-6 py-6 md:px-7 md:py-7";
const listRowClassName =
  "block rounded-[20px] bg-[rgba(255,255,255,0.03)] px-4 py-4 transition hover:bg-[rgba(255,255,255,0.045)]";

const toDateKey = (value: Date | string) => new Date(value).toLocaleDateString("en-CA");

const clampPercent = (value: number) => Math.max(0, Math.min(100, Number.isFinite(value) ? value : 0));

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

const getGreeting = () => {
  const hour = new Date().getHours();

  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
};

export default function Dashboard() {
  const { user, loading } = useAuth();
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [answers, setAnswers] = useState<AnswerRow[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [dailyGoalOverride, setDailyGoalOverride] = useState<number | null>(null);
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
        (answersData || []).map((item) => ({
          ...item,
          answered_at: item.answered_at ?? new Date(0).toISOString(),
        })),
      );

      const metadata = user.user_metadata || {};
      if (!metadata.onboarding_completed_at && (answersData?.length ?? 0) === 0) {
        setShowOnboarding(true);
      }

      setPageLoading(false);
    };

    load();
  }, [loading, user]);

  const questionIdentity = useMemo(() => createQuestionIdentityIndex(questions), [questions]);
  const questionLookup = questionIdentity.questionLookup;

  const resolvedAnswers = useMemo(
    () =>
      answers
        .map((item) => {
          const questionId = questionIdentity.resolveQuestionId(item.question_id);
          if (!questionId) return null;
          return { ...item, question_id: questionId };
        })
        .filter((item): item is AnswerRow => Boolean(item)),
    [answers, questionIdentity],
  );

  const sortedAnswers = useMemo(
    () =>
      [...resolvedAnswers].sort(
        (a, b) => new Date(b.answered_at).getTime() - new Date(a.answered_at).getTime(),
      ),
    [resolvedAnswers],
  );

  const totalAttempts = resolvedAnswers.length;
  const correctAttempts = resolvedAnswers.filter((item) => item.is_correct).length;
  const accuracy =
    totalAttempts > 0
      ? Math.round((correctAttempts / totalAttempts) * 100)
      : profile?.accuracy ?? 0;

  const streak = profile?.streak ?? 0;
  const targetExam = profile?.target_exam || user?.user_metadata?.target_exam || "UPSC CSE 2026";
  const displayName =
    profile?.full_name || user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Aspirant";
  const firstName = displayName.split(" ")[0] || displayName;
  const greeting = getGreeting();

  const dailyGoal =
    dailyGoalOverride ??
    (Number.parseInt(String(user?.user_metadata?.daily_goal || "12"), 10) || 12);
  const todayKey = toDateKey(new Date());
  const todayAnswers = sortedAnswers.filter((item) => toDateKey(item.answered_at) === todayKey);
  const todayAttempts = todayAnswers.length;
  const todayCorrect = todayAnswers.filter((item) => item.is_correct).length;
  const todayAccuracy = todayAttempts > 0 ? Math.round((todayCorrect / todayAttempts) * 100) : 0;
  const dailyPercent = clampPercent(Math.round((todayAttempts / dailyGoal) * 100));
  const dailyRemaining = Math.max(0, dailyGoal - todayAttempts);

  const topicPerformance = useMemo(() => {
    const grouped = resolvedAnswers.reduce<
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
      if (item.is_correct) {
        current.correct += 1;
      } else {
        current.incorrect += 1;
      }

      acc[question.topic] = current;
      return acc;
    }, {});

    return Object.values(grouped)
      .map((item) => ({
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
  }, [resolvedAnswers, questionLookup]);

  const focusAreas: TopicPerformance[] = topicPerformance.slice(0, 4);

  const recentSessions = useMemo(
    () =>
      sortedAnswers.slice(0, 5).map((item) => {
        const question = questionLookup.get(item.question_id);
        return {
          id: item.question_id,
          topic: question?.topic || "Practice session",
          exam: question?.exam || "General",
          correct: item.is_correct,
          date: formatActivityStamp(item.answered_at),
        };
      }),
    [questionLookup, sortedAnswers],
  );

  const progressCopy =
    dailyRemaining > 0
      ? `${dailyRemaining} question${dailyRemaining === 1 ? "" : "s"} left today.`
      : "Daily target complete for today.";

  const nextStepCopy =
    dailyRemaining > 0
      ? "The clearest next step is to continue your practice set."
      : "You can stop here or use a few extra minutes to review weak topics.";

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
              Your dashboard ties together practice history, streak, and focus areas once your progress is attached to an account.
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
        onComplete={({ targetExam: nextTargetExam, dailyGoal: nextDailyGoal }) => {
          setProfile((current: ProfileRow | null) => ({
            ...(current || {}),
            target_exam: nextTargetExam,
          }));
          setDailyGoalOverride(Number.parseInt(nextDailyGoal, 10) || 12);
        }}
      />

      <div className="space-y-5">
        <section className={heroClassName}>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--text-faint)]">
                {targetExam}
              </p>
              <h1 className="mt-4 text-4xl font-semibold tracking-[-0.08em] text-[var(--text-primary)] md:text-[3.5rem] md:leading-[0.96]">
                {greeting}, {firstName}
              </h1>
              <p className="mt-4 text-xl text-[var(--text-secondary)] md:text-2xl">
                {progressCopy}
              </p>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--text-muted)] md:text-base">
                {nextStepCopy}
              </p>
            </div>

            <Link href="/practice">
              <span className="btn-primary inline-flex cursor-pointer self-start rounded-[18px] px-6 py-3.5 text-base md:px-7 md:text-lg">
                Continue Practice
                <ArrowRight size={18} />
              </span>
            </Link>
          </div>
        </section>

        <section className={sectionClassName}>
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--text-faint)]">
                Today Progress
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.05em] text-[var(--text-primary)] md:text-[2rem]">
                Keep today visible and simple
              </h2>
            </div>

            <p className="text-sm text-[var(--text-muted)]">
              {todayAttempts} of {dailyGoal} questions done
            </p>
          </div>

          <div className="mt-6">
            <div className="flex items-center justify-between gap-4 text-sm text-[var(--text-secondary)]">
              <span>{dailyPercent}% complete</span>
              <span>{dailyRemaining} left</span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-[rgba(255,255,255,0.08)]">
              <div
                className="h-full rounded-full bg-[rgba(255,255,255,0.88)] transition-[width]"
                style={{ width: `${dailyPercent}%` }}
              />
            </div>
          </div>

          <div className="mt-8 grid gap-6 border-t border-white/6 pt-6 md:grid-cols-3">
            {[
              {
                label: "Progress",
                value: `${todayAttempts}/${dailyGoal}`,
                meta: dailyRemaining > 0 ? `${dailyRemaining} more to finish` : "Goal complete",
              },
              {
                label: "Accuracy",
                value: todayAttempts > 0 ? `${todayAccuracy}%` : `${accuracy}%`,
                meta: todayAttempts > 0 ? "From today's attempts" : "Overall accuracy",
              },
              {
                label: "Streak",
                value: `${streak} day${streak === 1 ? "" : "s"}`,
                meta: "Consistency is compounding",
              },
            ].map((item) => (
              <div key={item.label}>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-faint)]">
                  {item.label}
                </p>
                <p className="mt-3 text-[2rem] font-semibold tracking-[-0.06em] text-[var(--text-primary)]">
                  {item.value}
                </p>
                <p className="mt-2 text-sm text-[var(--text-muted)]">{item.meta}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
          <section className={sectionClassName}>
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--text-faint)]">
                  Recent Activity
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-[-0.05em] text-[var(--text-primary)]">
                  What you touched most recently
                </h2>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {recentSessions.length > 0 ? (
                recentSessions.map((session) => (
                  <Link
                    key={`${session.id}-${session.date}`}
                    href={buildPracticeHref({
                      questionId: session.id,
                      topic: session.topic,
                      exam: session.exam !== "General" ? session.exam : undefined,
                    })}
                  >
                    <span className={listRowClassName}>
                      <span className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <span className="min-w-0">
                          <span className="block truncate text-base font-medium text-[var(--text-primary)]">
                            {session.topic}
                          </span>
                          <span className="mt-1 block text-sm text-[var(--text-muted)]">
                            {session.exam} · {session.date}
                          </span>
                        </span>

                        <span
                          className={`inline-flex w-fit items-center gap-2 rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.14em] ${
                            session.correct
                              ? "bg-[rgba(76,214,114,0.12)] text-[#72e08c]"
                              : "bg-[rgba(255,107,107,0.12)] text-[#ff8e8e]"
                          }`}
                        >
                          {session.correct ? <CheckCircle2 size={13} /> : <CircleAlert size={13} />}
                          {session.correct ? "Correct" : "Needs review"}
                        </span>
                      </span>
                    </span>
                  </Link>
                ))
              ) : (
                <p className="text-sm leading-7 text-[var(--text-secondary)]">
                  Start one practice session and your recent activity will appear here.
                </p>
              )}
            </div>
          </section>

          <section className={sectionClassName}>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--text-faint)]">
                Focus Areas
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.05em] text-[var(--text-primary)]">
                Weak topics worth reviewing next
              </h2>
            </div>

            <div className="mt-6 space-y-3">
              {focusAreas.length > 0 ? (
                focusAreas.map((topic) => (
                  <Link key={topic.topic} href={buildPracticeHref({ topic: topic.topic, incorrect: true })}>
                    <span className={listRowClassName}>
                      <span className="flex items-start justify-between gap-4">
                        <span className="min-w-0 flex-1">
                          <span className="block text-base font-medium text-[var(--text-primary)]">
                            {topic.topic}
                          </span>
                          <span className="mt-1 block text-sm text-[var(--text-muted)]">
                            {topic.incorrect} miss{topic.incorrect === 1 ? "" : "es"} across {topic.total} attempt
                            {topic.total === 1 ? "" : "s"}
                          </span>
                          <span className="mt-4 block h-1.5 overflow-hidden rounded-full bg-[rgba(255,255,255,0.08)]">
                            <span
                              className="block h-full rounded-full bg-[rgba(255,255,255,0.82)]"
                              style={{ width: `${Math.max(8, topic.accuracy)}%` }}
                            />
                          </span>
                        </span>

                        <span className="text-right">
                          <span className="block text-sm font-semibold text-[var(--text-primary)]">
                            {topic.accuracy}%
                          </span>
                          <span className="mt-1 block text-xs uppercase tracking-[0.14em] text-[var(--text-faint)]">
                            accuracy
                          </span>
                        </span>
                      </span>
                    </span>
                  </Link>
                ))
              ) : (
                <p className="text-sm leading-7 text-[var(--text-secondary)]">
                  Focus areas will appear once you build a little more answer history.
                </p>
              )}
            </div>
          </section>
        </div>
      </div>
    </AppShell>
  );
}
