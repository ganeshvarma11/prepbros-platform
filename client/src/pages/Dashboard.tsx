import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BookMarked,
  Brain,
  CheckCircle2,
  CircleAlert,
  Loader2,
  Target,
  TrendingUp,
} from "lucide-react";
import { Link } from "wouter";

import AppShell from "@/components/AppShell";
import OnboardingModal from "@/components/OnboardingModal";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { useQuestionBank } from "@/hooks/useQuestionBank";
import { createQuestionIdentityIndex, toQuestionId, type QuestionId } from "@/lib/questionIdentity";
import { getAnswerAttempts, getBookmarks } from "@/lib/userProgress";
import { supabase } from "@/lib/supabase";

type AnswerRow = {
  question_id: QuestionId;
  is_correct: boolean;
  answered_at: string;
};

type ProfileRow = {
  full_name?: string;
  username?: string;
  streak?: number;
  max_streak?: number;
  accuracy?: number;
  total_solved?: number;
  target_exam?: string;
  avatar_url?: string;
};

type TopicPerformance = {
  topic: string;
  correct: number;
  total: number;
  incorrect: number;
  accuracy: number;
  exams: string[];
  latestAnsweredAt: string | null;
};

type QueueItem = {
  id: QuestionId;
  title: string;
  topic: string;
  exam: string;
  reason: string;
  kind: "mistake" | "bookmark";
};

const panelClassName = "rounded-[20px] border border-[var(--border)] bg-[var(--bg-card)]";
const mutedPanelClassName = "rounded-[16px] border border-[var(--border)] bg-[var(--bg-elevated)]";

const toDateKey = (value: Date | string) => new Date(value).toLocaleDateString("en-CA");

const clampPercent = (value: number) => Math.max(0, Math.min(100, Number.isFinite(value) ? value : 0));

const formatActivityStamp = (value: string) =>
  new Date(value).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });

const getHeatmapColor = (count: number, maxCount: number) => {
  if (!count) return "var(--bg-muted)";
  const intensity = count / maxCount;
  if (intensity < 0.34) return "rgba(52, 211, 104, 0.24)";
  if (intensity < 0.67) return "rgba(52, 211, 104, 0.46)";
  return "#3fe06f";
};

const buildPracticeHref = ({
  topic,
  exam,
  bookmarked,
  incorrect,
  questionId,
}: {
  topic?: string;
  exam?: string;
  bookmarked?: boolean;
  incorrect?: boolean;
  questionId?: string | number;
}) => {
  const params = new URLSearchParams();
  if (topic) params.set("topic", topic);
  if (exam) params.set("exam", exam);
  if (bookmarked) params.set("bookmarked", "1");
  if (incorrect) params.set("incorrect", "1");
  if (questionId) params.set("question", String(questionId));
  const query = params.toString();
  return query ? `/practice?${query}` : "/practice";
};

export default function Dashboard() {
  const { user, loading } = useAuth();
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [answers, setAnswers] = useState<AnswerRow[]>([]);
  const [bookmarkIds, setBookmarkIds] = useState<QuestionId[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [dailyGoalOverride, setDailyGoalOverride] = useState<number | null>(null);
  const [activePanel, setActivePanel] = useState<"activity" | "review" | "actions">("activity");
  const [heatmapRange, setHeatmapRange] = useState<"7D" | "30D" | "26W" | "1Y">("26W");
  const { questions, syncing: questionsSyncing } = useQuestionBank();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      setPageLoading(false);
      return;
    }

    const load = async () => {
      setPageLoading(true);
      const [{ data: profileData }, answersData, bookmarkData] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).single(),
        getAnswerAttempts(user.id),
        getBookmarks(user.id),
      ]);

      setProfile(profileData || null);
      setAnswers(
        (answersData || []).map((item) => ({
          ...item,
          answered_at: item.answered_at ?? new Date(0).toISOString(),
        })),
      );
      setBookmarkIds(bookmarkData || []);
      const metadata = user.user_metadata || {};
      if (!metadata.onboarding_completed_at && (profileData?.total_solved ?? 0) === 0 && (answersData?.length ?? 0) === 0) {
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

  const resolvedBookmarkIds = useMemo(
    () =>
      Array.from(
        new Set(
          bookmarkIds
            .map((questionId) => questionIdentity.resolveQuestionId(questionId))
            .filter((questionId): questionId is QuestionId => Boolean(questionId)),
        ),
      ),
    [bookmarkIds, questionIdentity],
  );

  const solvedIds = useMemo(
    () => Array.from(new Set(resolvedAnswers.map((item) => item.question_id))),
    [resolvedAnswers],
  );

  const totalAttempts = resolvedAnswers.length;
  const totalSolved = solvedIds.length;
  const correctAttempts = resolvedAnswers.filter((item) => item.is_correct).length;
  const accuracy =
    totalAttempts > 0
      ? Math.round((correctAttempts / totalAttempts) * 100)
      : profile?.accuracy ?? 0;
  const streak = profile?.streak ?? 0;
  const maxStreak = profile?.max_streak ?? 0;
  const bookmarkCount = resolvedBookmarkIds.length;
  const targetExam = profile?.target_exam || user?.user_metadata?.target_exam || "UPSC CSE 2026";
  const displayName =
    profile?.full_name || user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Aspirant";
  const firstName = displayName.split(" ")[0] || displayName;
  const username = profile?.username || user?.email?.split("@")[0] || "prepbros-user";
  const avatarUrl =
    profile?.avatar_url ||
    user?.user_metadata?.avatar_url ||
    user?.user_metadata?.picture ||
    user?.user_metadata?.avatar ||
    "";
  const questionCount = questions.length;
  const coveragePercent = questionCount > 0 ? Math.round((totalSolved / questionCount) * 100) : 0;

  const dailyGoal =
    dailyGoalOverride ??
    (Number.parseInt(String(user?.user_metadata?.daily_goal || "12"), 10) || 12);
  const todayKey = toDateKey(new Date());
  const todayAnswers = resolvedAnswers.filter((item) => toDateKey(item.answered_at) === todayKey);
  const todayAttempts = todayAnswers.length;
  const todayCorrect = todayAnswers.filter((item) => item.is_correct).length;
  const todayAccuracy = todayAttempts > 0 ? Math.round((todayCorrect / todayAttempts) * 100) : 0;
  const dailyPercent = clampPercent(Math.round((todayAttempts / dailyGoal) * 100));
  const dailyRemaining = Math.max(0, dailyGoal - todayAttempts);

  const weekBuckets = useMemo(() => {
    const weekdayFormatter = new Intl.DateTimeFormat("en-IN", { weekday: "short" });
    const days = Array.from({ length: 7 }, (_, index) => {
      const date = new Date();
      date.setHours(0, 0, 0, 0);
      date.setDate(date.getDate() - (6 - index));
      return {
        dateKey: toDateKey(date),
        label: weekdayFormatter.format(date).slice(0, 3),
        total: 0,
        correct: 0,
      };
    });

    const bucketMap = new Map(days.map((day) => [day.dateKey, day]));

    resolvedAnswers.forEach((answer) => {
      const bucket = bucketMap.get(toDateKey(answer.answered_at));
      if (!bucket) return;
      bucket.total += 1;
      if (answer.is_correct) bucket.correct += 1;
    });

    return days.map((day) => ({
      ...day,
      accuracy: day.total > 0 ? Math.round((day.correct / day.total) * 100) : 0,
    }));
  }, [resolvedAnswers]);

  const weeklyAttempts = weekBuckets.reduce((sum, day) => sum + day.total, 0);
  const weeklyCorrect = weekBuckets.reduce((sum, day) => sum + day.correct, 0);
  const weeklyAccuracy = weeklyAttempts > 0 ? Math.round((weeklyCorrect / weeklyAttempts) * 100) : 0;
  const activeDays = weekBuckets.filter((day) => day.total > 0).length;
  const weekPeak = Math.max(...weekBuckets.map((day) => day.total), 1);

  const topicPerformance = useMemo(() => {
    const grouped = resolvedAnswers.reduce<
      Record<
        string,
        {
          topic: string;
          correct: number;
          total: number;
          incorrect: number;
          exams: Set<string>;
          latestAnsweredAt: string | null;
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
        exams: new Set<string>(),
        latestAnsweredAt: null,
      };

      current.total += 1;
      current.exams.add(question.exam);
      if (item.is_correct) {
        current.correct += 1;
      } else {
        current.incorrect += 1;
      }
      if (
        !current.latestAnsweredAt ||
        new Date(item.answered_at).getTime() > new Date(current.latestAnsweredAt).getTime()
      ) {
        current.latestAnsweredAt = item.answered_at;
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
        exams: Array.from(item.exams),
        latestAnsweredAt: item.latestAnsweredAt,
      }))
      .sort((a, b) => {
        const aHasContext = a.total >= 2 ? 1 : 0;
        const bHasContext = b.total >= 2 ? 1 : 0;
        if (aHasContext !== bHasContext) return bHasContext - aHasContext;
        if (a.accuracy !== b.accuracy) return a.accuracy - b.accuracy;
        return b.total - a.total;
      });
  }, [resolvedAnswers, questionLookup]);

  const improvementTopics: TopicPerformance[] = topicPerformance.slice(0, 3);

  const bookmarkTopics = useMemo(() => {
    const grouped = resolvedBookmarkIds.reduce<Record<string, { topic: string; total: number }>>((acc, questionId) => {
      const question = questionLookup.get(questionId);
      if (!question) return acc;
      const current = acc[question.topic] || { topic: question.topic, total: 0 };
      current.total += 1;
      acc[question.topic] = current;
      return acc;
    }, {});

    return Object.values(grouped)
      .sort((a, b) => b.total - a.total)
      .slice(0, 3);
  }, [resolvedBookmarkIds, questionLookup]);

  const recentSessions = useMemo(
    () =>
      resolvedAnswers.slice(0, 5).map((item) => {
        const question = questionLookup.get(item.question_id);
        return {
          id: item.question_id,
          topic: question?.topic || "Practice session",
          exam: question?.exam || "General",
          type: question?.type || "Question",
          correct: item.is_correct,
          date: formatActivityStamp(item.answered_at),
        };
      }),
    [resolvedAnswers, questionLookup],
  );

  const solvedSet = useMemo(() => new Set(solvedIds), [solvedIds]);

  const difficultyProgress = useMemo(() => {
    const order = ["Easy", "Medium", "Hard"] as const;
    const palette = {
      Easy: "#38d26f",
      Medium: "#ffb64c",
      Hard: "#ff695b",
    };

    return order.map((difficulty) => {
      const pool = questions.filter((question) => question.difficulty === difficulty);
      const solved = pool.filter((question) => solvedSet.has(toQuestionId(question.id))).length;
      return {
        difficulty,
        solved,
        total: pool.length,
        color: palette[difficulty],
      };
    });
  }, [questions, solvedSet]);

  const heatmap = useMemo(() => {
    const rangeDays =
      heatmapRange === "7D" ? 7 : heatmapRange === "30D" ? 35 : heatmapRange === "1Y" ? 364 : 26 * 7;
    const countByDay = resolvedAnswers.reduce<Record<string, number>>((acc, item) => {
      const key = toDateKey(item.answered_at);
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    const monthFormatter = new Intl.DateTimeFormat("en-IN", { month: "short" });
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - (rangeDays - 1));

    const days = Array.from({ length: rangeDays }, (_, index) => {
      const date = new Date(start);
      date.setDate(start.getDate() + index);
      const dateKey = toDateKey(date);
      return {
        dateKey,
        date,
        count: countByDay[dateKey] || 0,
        monthLabel: monthFormatter.format(date),
      };
    });

    const weeks = [];
    let previousMonth = "";

    for (let index = 0; index < days.length; index += 7) {
      const weekDays = days.slice(index, index + 7);
      const firstDay = weekDays[0];
      const monthLabel = firstDay && firstDay.monthLabel !== previousMonth ? firstDay.monthLabel : "";
      if (firstDay) previousMonth = firstDay.monthLabel;
      weeks.push({
        key: firstDay?.dateKey || `week-${index}`,
        monthLabel,
        days: weekDays,
      });
    }

    const maxCount = Math.max(...days.map((day) => day.count), 1);
    const activeDayCount = days.filter((day) => day.count > 0).length;

    return {
      weeks,
      maxCount,
      activeDayCount,
    };
  }, [resolvedAnswers, heatmapRange]);

  const heatmapRangeLabel =
    heatmapRange === "7D" ? "7 days" : heatmapRange === "30D" ? "30 days" : heatmapRange === "1Y" ? "1 year" : "26 weeks";

  const reviewQueue = useMemo(() => {
    const queue: QueueItem[] = [];
    const seen = new Set<QuestionId>();

    for (const answer of resolvedAnswers) {
      if (answer.is_correct || seen.has(answer.question_id)) continue;
      const question = questionLookup.get(answer.question_id);
      if (!question) continue;
      queue.push({
        id: toQuestionId(question.id),
        title: question.question,
        topic: question.topic,
        exam: question.exam,
        reason: "Recent incorrect answer",
        kind: "mistake",
      });
      seen.add(toQuestionId(question.id));
      if (queue.length >= 3) break;
    }

    for (const questionId of resolvedBookmarkIds) {
      if (seen.has(questionId)) continue;
      const question = questionLookup.get(questionId);
      if (!question) continue;
      queue.push({
        id: toQuestionId(question.id),
        title: question.question,
        topic: question.topic,
        exam: question.exam,
        reason: "Bookmarked for revision",
        kind: "bookmark",
      });
      seen.add(questionId);
      if (queue.length >= 5) break;
    }

    return queue;
  }, [questionLookup, resolvedAnswers, resolvedBookmarkIds]);

  const focusCopy = useMemo(() => {
    if (dailyRemaining > 0) {
      return {
        title: `${dailyRemaining} more question${dailyRemaining === 1 ? "" : "s"} to close today cleanly`,
        description:
          todayAttempts > 0
            ? "Finish the daily MCQ target first, then switch into revision while the context is still fresh."
            : "Start with a short focused burst so the rest of the dashboard has something real to react to.",
      };
    }

    if (improvementTopics[0]) {
      return {
        title: `${improvementTopics[0].topic} deserves the next review block`,
        description: `${improvementTopics[0].incorrect} miss${improvementTopics[0].incorrect === 1 ? "" : "es"} across ${improvementTopics[0].total} recent attempt${improvementTopics[0].total === 1 ? "" : "s"} make this the sharpest place to tighten up.`,
      };
    }

    if (bookmarkCount > 0) {
      return {
        title: `You have ${bookmarkCount} saved question${bookmarkCount === 1 ? "" : "s"} ready for revision`,
        description:
          "Use the extra runway after today's goal to turn bookmarks into a light retention pass instead of opening something random.",
      };
    }

    return {
      title: "The loop is simple today: practice, review, return tomorrow",
      description:
        "This dashboard is strongest when it stays calm and directional. One clean session is better than scattered clicking.",
    };
  }, [bookmarkCount, dailyRemaining, improvementTopics, todayAttempts]);

  const nextActions = useMemo(() => {
    const actions = [];

    if (dailyRemaining > 0) {
      actions.push({
        title: `Finish ${dailyRemaining} more for today`,
        description: "Protect the daily habit before you spend energy deciding what else to do.",
        href: "/practice",
        cta: "Continue practice",
        icon: Target,
        accent: "bg-[var(--brand-subtle)] text-[var(--brand-light)]",
      });
    } else {
      actions.push({
        title: "Today's goal is already complete",
        description: "Use the extra time for deliberate revision instead of overextending into noise.",
        href: "/practice",
        cta: "Add a review round",
        icon: CheckCircle2,
        accent: "bg-[var(--accent-subtle)] text-[var(--accent)]",
      });
    }

    if (improvementTopics[0]) {
      actions.push({
        title: `Revisit ${improvementTopics[0].topic}`,
        description: `${improvementTopics[0].accuracy}% accuracy is the clearest weak-topic signal on the board right now.`,
        href: buildPracticeHref({ topic: improvementTopics[0].topic }),
        cta: "Open question bank",
        icon: TrendingUp,
        accent: "bg-[var(--blue-bg)] text-[var(--blue)]",
      });
    }

    if (bookmarkCount > 0) {
      actions.push({
        title: `Review ${bookmarkCount} saved bookmark${bookmarkCount === 1 ? "" : "s"}`,
        description: "Saved questions are the easiest way to convert recognition into retention.",
        href: buildPracticeHref({ bookmarked: true }),
        cta: "Use bookmarks",
        icon: BookMarked,
        accent: "bg-[var(--bg-elevated)] text-[var(--text-primary)]",
      });
    } else {
      actions.push({
        title: "Set up your review bank",
        description: "Bookmark useful PYQs and mistakes during practice so revision stays lightweight later.",
        href: "/practice",
        cta: "Start practicing",
        icon: Brain,
        accent: "bg-[var(--bg-elevated)] text-[var(--text-primary)]",
      });
    }

    return actions.slice(0, 3);
  }, [bookmarkCount, dailyRemaining, improvementTopics]);

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
          <div className={`${panelClassName} p-8 text-center md:p-12`}>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--brand)]">
              Dashboard
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-[-0.06em] text-[var(--text-primary)]">
              Sign in to unlock your prep workspace.
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-sm text-[var(--text-secondary)] md:text-base">
              Your dashboard ties together streaks, solved questions, bookmarks, and review signals once your progress is attached to an account.
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

      <div className="space-y-4">
        <section className={`${panelClassName} px-5 py-5 md:px-6`}>
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-faint)]">
                Dashboard
              </p>
              <div className="mt-3 flex items-start gap-3">
                <Avatar className="mt-0.5 h-11 w-11 rounded-[14px] border border-[var(--border)]">
                  <AvatarImage src={avatarUrl} alt={displayName} className="object-cover" />
                  <AvatarFallback className="rounded-[14px] bg-[var(--brand-subtle)] text-[var(--brand)]">
                    {displayName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <h1 className="text-[1.75rem] font-semibold tracking-[-0.05em] text-[var(--text-primary)] md:text-[2rem]">
                    Welcome back, {firstName}
                  </h1>
                  <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--text-secondary)]">
                    {focusCopy.title}. {focusCopy.description}
                  </p>
                  <p className="mt-2 text-xs uppercase tracking-[0.14em] text-[var(--text-faint)]">
                    @{username} · {targetExam}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link href="/practice">
                <span className="btn-primary cursor-pointer px-4 py-2.5 text-sm">
                  Continue practice
                  <ArrowRight size={15} />
                </span>
              </Link>
              <Link href="/practice?bookmarked=1">
                <span className="btn-secondary cursor-pointer px-4 py-2.5 text-sm">
                  Review bookmarks
                </span>
              </Link>
              <Link href="/profile">
                <span className="btn-secondary cursor-pointer px-4 py-2.5 text-sm">
                  Account settings
                </span>
              </Link>
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {[
              {
                label: "Today",
                value: `${todayAttempts}/${dailyGoal}`,
                meta: dailyPercent >= 100 ? "Goal complete" : `${dailyRemaining} left`,
              },
              {
                label: "Accuracy",
                value: `${accuracy}%`,
                meta: `${correctAttempts} correct across ${totalAttempts} attempts`,
              },
              {
                label: "Solved",
                value: String(totalSolved),
                meta: `${coveragePercent}% of the bank covered`,
              },
              {
                label: "Streak",
                value: `${streak}d`,
                meta: `${bookmarkCount} bookmark${bookmarkCount === 1 ? "" : "s"} saved`,
              },
            ].map((item) => (
              <div key={item.label} className={`${mutedPanelClassName} px-4 py-3.5`}>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--text-faint)]">
                  {item.label}
                </p>
                <p className="mt-2 text-[1.6rem] font-semibold tracking-[-0.05em] text-[var(--text-primary)]">
                  {item.value}
                </p>
                <p className="mt-1 text-sm text-[var(--text-muted)]">{item.meta}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_320px]">
          <div className="space-y-4">
            <section className={`${panelClassName} p-5 md:p-6`}>
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-faint)]">
                    Daily progress
                  </p>
                  <h2 className="mt-2 text-[1.45rem] font-semibold tracking-[-0.05em] text-[var(--text-primary)]">
                    Keep today simple and visible
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                    Small, repeatable sessions work best when the daily target and weekly rhythm stay in view.
                  </p>
                </div>

                <div className={`${mutedPanelClassName} px-4 py-3`}>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--text-faint)]">
                    This week
                  </p>
                  <p className="mt-1 text-2xl font-semibold tracking-[-0.05em] text-[var(--text-primary)]">
                    {weeklyAttempts}
                  </p>
                  <p className="text-sm text-[var(--text-muted)]">{weeklyAccuracy}% weekly accuracy</p>
                </div>
              </div>

              <div className="mt-5 h-2 overflow-hidden rounded-full bg-[var(--bg-muted)]">
                <div
                  className="h-full rounded-full bg-[linear-gradient(90deg,#ff9838_0%,#ffb861_50%,#7bd7ff_100%)]"
                  style={{ width: `${dailyPercent}%` }}
                />
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-3">
                <div className={`${mutedPanelClassName} px-4 py-3`}>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--text-faint)]">
                    Today accuracy
                  </p>
                  <p className="mt-2 text-xl font-semibold tracking-[-0.05em] text-[var(--text-primary)]">
                    {todayAttempts > 0 ? `${todayAccuracy}%` : "No attempts yet"}
                  </p>
                </div>
                <div className={`${mutedPanelClassName} px-4 py-3`}>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--text-faint)]">
                    Active days
                  </p>
                  <p className="mt-2 text-xl font-semibold tracking-[-0.05em] text-[var(--text-primary)]">
                    {activeDays}/7
                  </p>
                </div>
                <div className={`${mutedPanelClassName} px-4 py-3`}>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--text-faint)]">
                    Best streak
                  </p>
                  <p className="mt-2 text-xl font-semibold tracking-[-0.05em] text-[var(--text-primary)]">
                    {maxStreak}d
                  </p>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-7 gap-2">
                {weekBuckets.map((day) => (
                  <div key={day.dateKey} className={`${mutedPanelClassName} px-3 py-3`}>
                    <div className="flex h-16 items-end">
                      <div
                        className="w-full rounded-full bg-[var(--brand)]/80"
                        style={{
                          height: `${Math.max(12, Math.round((day.total / weekPeak) * 100))}%`,
                          opacity: day.total > 0 ? 1 : 0.2,
                        }}
                      />
                    </div>
                    <p className="mt-3 text-xs font-medium text-[var(--text-primary)]">{day.label}</p>
                    <p className="text-xs text-[var(--text-muted)]">{day.total} attempts</p>
                  </div>
                ))}
              </div>
            </section>

            <section className={`${panelClassName} p-5 md:p-6`}>
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-faint)]">
                    Activity heatmap
                  </p>
                  <h2 className="mt-2 text-[1.45rem] font-semibold tracking-[-0.05em] text-[var(--text-primary)]">
                    Attempts over time
                  </h2>
                </div>

                <div className="flex flex-wrap gap-2">
                  {(["7D", "30D", "26W", "1Y"] as const).map((range) => (
                    <button
                      key={range}
                      type="button"
                      onClick={() => setHeatmapRange(range)}
                      className={`rounded-[10px] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] transition ${
                        heatmapRange === range
                          ? "bg-[var(--brand-subtle)] text-[var(--brand-light)]"
                          : "border border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                      }`}
                    >
                      {range}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-5 overflow-x-auto">
                <div className="min-w-[720px]">
                  <div className="mb-3 flex gap-[6px] pl-7">
                    {heatmap.weeks.map((week) => (
                      <div key={`month-${week.key}`} className="w-[12px] text-[10px] text-[var(--text-muted)]">
                        {week.monthLabel}
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-[6px]">
                    <div className="flex w-6 flex-col justify-between py-[1px] text-[10px] text-[var(--text-muted)]">
                      <span>M</span>
                      <span>W</span>
                      <span>F</span>
                    </div>

                    <div className="flex gap-[6px]">
                      {heatmap.weeks.map((week) => (
                        <div key={week.key} className="flex flex-col gap-[6px]">
                          {week.days.map((day) => (
                            <div
                              key={day.dateKey}
                              className="h-[11px] w-[11px] rounded-[3px] border border-[rgba(255,255,255,0.04)]"
                              style={{ backgroundColor: getHeatmapColor(day.count, heatmap.maxCount) }}
                              title={`${day.date.toDateString()}: ${day.count} attempt${day.count === 1 ? "" : "s"}`}
                            />
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex flex-col gap-3 text-sm text-[var(--text-secondary)] sm:flex-row sm:items-center sm:justify-between">
                <p>{heatmap.activeDayCount} active days in the last {heatmapRangeLabel}.</p>
                <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                  <span>Less</span>
                  {[0, 1, 2, 3].map((level) => (
                    <span
                      key={level}
                      className="h-3 w-3 rounded-[3px] border border-[rgba(255,255,255,0.04)]"
                      style={{ backgroundColor: getHeatmapColor(level, 3) }}
                    />
                  ))}
                  <span>More</span>
                </div>
              </div>
            </section>

            <section className={`${panelClassName} p-5 md:p-6`}>
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-faint)]">
                    Workspace
                  </p>
                  <h2 className="mt-2 text-[1.45rem] font-semibold tracking-[-0.05em] text-[var(--text-primary)]">
                    Recent activity, review, and next actions
                  </h2>
                </div>

                <div className="flex flex-wrap gap-2">
                  {[
                    { id: "activity", label: "Recent activity" },
                    { id: "review", label: "Review queue" },
                    { id: "actions", label: "Next actions" },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActivePanel(tab.id as typeof activePanel)}
                      className={`rounded-[10px] px-3 py-2 text-sm font-medium transition ${
                        activePanel === tab.id
                          ? "bg-[var(--brand-subtle)] text-[var(--brand-light)]"
                          : "border border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-5 space-y-2.5">
                {activePanel === "activity" && (
                  <>
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
                          <span className="flex cursor-pointer flex-col gap-3 rounded-[16px] border border-[var(--border)] bg-[var(--bg-elevated)] px-4 py-3 transition hover:border-[var(--border-strong)] md:flex-row md:items-center md:justify-between">
                            <span>
                              <span className="flex flex-wrap items-center gap-2">
                                <span className="font-medium text-[var(--text-primary)]">{session.topic}</span>
                                <span className="rounded-full border border-[var(--border)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
                                  {session.type}
                                </span>
                              </span>
                              <span className="mt-1 block text-sm text-[var(--text-secondary)]">
                                {session.exam} · {session.date}
                              </span>
                            </span>
                            <span
                              className={`inline-flex w-fit items-center gap-2 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${
                                session.correct
                                  ? "bg-[var(--accent-subtle)] text-[var(--accent)]"
                                  : "bg-[var(--yellow-bg)] text-[var(--yellow)]"
                              }`}
                            >
                              {session.correct ? <CheckCircle2 size={13} /> : <CircleAlert size={13} />}
                              {session.correct ? "Correct" : "Needs review"}
                            </span>
                          </span>
                        </Link>
                      ))
                    ) : (
                      <div className={`${mutedPanelClassName} px-4 py-5 text-sm text-[var(--text-secondary)]`}>
                        Start with practice so this workspace begins showing useful activity.
                      </div>
                    )}
                  </>
                )}

                {activePanel === "review" && (
                  <>
                    {reviewQueue.length > 0 ? (
                      reviewQueue.map((item) => (
                        <Link
                          key={`${item.kind}-${item.id}`}
                          href={buildPracticeHref({
                            questionId: item.id,
                            topic: item.topic,
                            exam: item.exam,
                            bookmarked: item.kind === "bookmark",
                            incorrect: item.kind === "mistake",
                          })}
                        >
                          <span className="block cursor-pointer rounded-[16px] border border-[var(--border)] bg-[var(--bg-elevated)] px-4 py-3 transition hover:border-[var(--border-strong)]">
                            <span className="flex items-start justify-between gap-3">
                              <span>
                                <span className="line-clamp-2 text-sm font-medium leading-6 text-[var(--text-primary)]">
                                  {item.title}
                                </span>
                                <span className="mt-1 block text-sm text-[var(--text-secondary)]">
                                  {item.exam} · {item.topic}
                                </span>
                              </span>
                              <span
                                className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] ${
                                  item.kind === "mistake"
                                    ? "bg-[var(--red-bg)] text-[var(--red)]"
                                    : "bg-[var(--brand-subtle)] text-[var(--brand-light)]"
                                }`}
                              >
                                {item.reason}
                              </span>
                            </span>
                          </span>
                        </Link>
                      ))
                    ) : (
                      <div className={`${mutedPanelClassName} px-4 py-5 text-sm text-[var(--text-secondary)]`}>
                        Missed questions and bookmarks will collect here as your review queue builds up.
                      </div>
                    )}
                  </>
                )}

                {activePanel === "actions" && (
                  <>
                    {nextActions.map((action) => {
                      const Icon = action.icon;
                      return (
                        <div
                          key={action.title}
                          className="rounded-[16px] border border-[var(--border)] bg-[var(--bg-elevated)] px-4 py-3"
                        >
                          <div className="flex items-start gap-4">
                            <div className={`rounded-[12px] p-2.5 ${action.accent}`}>
                              <Icon size={17} />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-[var(--text-primary)]">{action.title}</p>
                              <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">
                                {action.description}
                              </p>
                              <Link href={action.href}>
                                <span className="mt-3 inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-[var(--brand-light)]">
                                  {action.cta}
                                  <ArrowRight size={14} />
                                </span>
                              </Link>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </>
                )}
              </div>
            </section>
          </div>

          <aside className="space-y-4 xl:sticky xl:top-7 xl:self-start">
            <section className={`${panelClassName} p-5`}>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-faint)]">
                Snapshot
              </p>
              <div className="mt-4 space-y-2.5">
                {[
                  {
                    label: "Today",
                    value: `${todayAttempts}/${dailyGoal}`,
                    meta: dailyPercent >= 100 ? "Goal completed" : `${dailyRemaining} to go`,
                  },
                  {
                    label: "This week",
                    value: String(weeklyAttempts),
                    meta: `${weeklyAccuracy}% accuracy`,
                  },
                  {
                    label: "Review queue",
                    value: String(reviewQueue.length),
                    meta: `${bookmarkCount} bookmarks saved`,
                  },
                  {
                    label: "Coverage",
                    value: `${coveragePercent}%`,
                    meta: `${totalSolved}/${questionCount || 0} solved`,
                  },
                ].map((item) => (
                  <div key={item.label} className={`${mutedPanelClassName} px-4 py-3`}>
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-medium text-[var(--text-primary)]">{item.label}</p>
                      <p className="text-sm font-semibold text-[var(--text-primary)]">{item.value}</p>
                    </div>
                    <p className="mt-1 text-sm text-[var(--text-muted)]">{item.meta}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className={`${panelClassName} p-5`}>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-faint)]">
                    Coverage
                  </p>
                  <p className="mt-2 text-[1.6rem] font-semibold tracking-[-0.05em] text-[var(--text-primary)]">
                    {coveragePercent}% complete
                  </p>
                </div>
                <span className="rounded-full bg-[var(--brand-subtle)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--brand-light)]">
                  {questionCount} total
                </span>
              </div>

              <div className="mt-4 space-y-3">
                {difficultyProgress.map((item) => (
                  <div key={item.difficulty} className={`${mutedPanelClassName} px-4 py-3`}>
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-medium text-[var(--text-primary)]">{item.difficulty}</p>
                      <p className="text-sm font-semibold" style={{ color: item.color }}>
                        {item.total > 0 ? `${Math.round((item.solved / item.total) * 100)}%` : "0%"}
                      </p>
                    </div>
                    <p className="mt-1 text-sm text-[var(--text-muted)]">
                      {item.solved}/{item.total} solved
                    </p>
                    <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[var(--bg-muted)]">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${item.total > 0 ? Math.round((item.solved / item.total) * 100) : 0}%`,
                          background: item.color,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className={`${mutedPanelClassName} mt-4 px-4 py-3`}>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--text-faint)]">
                  Current read
                </p>
                <p className="mt-2 text-sm font-medium leading-6 text-[var(--text-primary)]">
                  {focusCopy.title}
                </p>
              </div>
            </section>

            <section className={`${panelClassName} p-5`}>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-faint)]">
                Review signals
              </p>

              <div className="mt-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-faint)]">
                  Weak topics
                </p>
                <div className="mt-2 space-y-2">
                  {improvementTopics.length > 0 ? (
                    improvementTopics.map((topic) => (
                      <Link key={topic.topic} href={buildPracticeHref({ topic: topic.topic, incorrect: true })}>
                        <span className="flex cursor-pointer items-center justify-between gap-3 rounded-[14px] border border-[var(--border)] bg-[var(--bg-elevated)] px-3.5 py-3 transition hover:border-[var(--border-strong)]">
                          <span>
                            <span className="block text-sm font-medium text-[var(--text-primary)]">
                              {topic.topic}
                            </span>
                            <span className="block text-xs text-[var(--text-muted)]">
                              {topic.incorrect} miss{topic.incorrect === 1 ? "" : "es"} · {topic.total} attempts
                            </span>
                          </span>
                          <span className="text-sm font-semibold text-[var(--brand-light)]">
                            {topic.accuracy}%
                          </span>
                        </span>
                      </Link>
                    ))
                  ) : (
                    <div className={`${mutedPanelClassName} px-4 py-3 text-sm text-[var(--text-secondary)]`}>
                      Weak-topic signals will appear once you build more answer history.
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-5">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-faint)]">
                  Bookmark clusters
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {bookmarkTopics.length > 0 ? (
                    bookmarkTopics.map((item) => (
                      <Link key={item.topic} href={buildPracticeHref({ topic: item.topic, bookmarked: true })}>
                        <span className="inline-flex cursor-pointer rounded-full border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-1.5 text-sm text-[var(--text-primary)] transition hover:border-[var(--border-strong)]">
                          {item.topic} · {item.total}
                        </span>
                      </Link>
                    ))
                  ) : (
                    <p className="text-sm text-[var(--text-secondary)]">
                      Save useful questions during practice to build a lightweight revision stack.
                    </p>
                  )}
                </div>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </AppShell>
  );
}
