import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BarChart3,
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

const shellClassName =
  "rounded-[26px] border border-[var(--border)] bg-[var(--bg-card)] shadow-[var(--shadow-lg)]";

const insetClassName =
  "rounded-[18px] border border-[var(--border)] bg-[var(--bg-elevated)]";

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
  if (intensity < 0.34) return "rgba(52, 211, 104, 0.32)";
  if (intensity < 0.67) return "rgba(52, 211, 104, 0.6)";
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
  const username = profile?.username || user?.email?.split("@")[0] || "prepbros-user";
  const avatarUrl =
    profile?.avatar_url ||
    user?.user_metadata?.avatar_url ||
    user?.user_metadata?.picture ||
    user?.user_metadata?.avatar ||
    "";
  const questionCount = questions.length;

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

  const solvedRingStyle = useMemo(() => {
    if (questionCount === 0) {
      return {
        background:
          "conic-gradient(rgba(255,255,255,0.14) 0deg 360deg)",
      };
    }

    const easyPct = (difficultyProgress[0].solved / questionCount) * 100;
    const medPct = (difficultyProgress[1].solved / questionCount) * 100;
    const hardPct = (difficultyProgress[2].solved / questionCount) * 100;
    const easyEnd = easyPct;
    const medEnd = easyPct + medPct;
    const hardEnd = easyPct + medPct + hardPct;

    return {
      background: `conic-gradient(
        ${difficultyProgress[0].color} 0% ${easyEnd}%,
        ${difficultyProgress[1].color} ${easyEnd}% ${medEnd}%,
        ${difficultyProgress[2].color} ${medEnd}% ${hardEnd}%,
        rgba(255,255,255,0.08) ${hardEnd}% 100%
      )`,
    };
  }, [difficultyProgress, questionCount]);

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
        accent:
          "border-[rgba(255,161,22,0.16)] bg-[rgba(255,161,22,0.10)] text-[var(--brand-light)]",
      });
    } else {
      actions.push({
        title: "Today's goal is already complete",
        description: "Use the extra time for deliberate revision instead of overextending into noise.",
        href: "/practice",
        cta: "Add a review round",
        icon: CheckCircle2,
        accent: "border-[rgba(45,181,93,0.16)] bg-[rgba(45,181,93,0.10)] text-[var(--accent)]",
      });
    }

    if (improvementTopics[0]) {
      actions.push({
        title: `Revisit ${improvementTopics[0].topic}`,
        description: `${improvementTopics[0].accuracy}% accuracy is the clearest weak-topic signal on the board right now.`,
        href: buildPracticeHref({ topic: improvementTopics[0].topic }),
        cta: "Open question bank",
        icon: TrendingUp,
        accent: "border-[rgba(77,163,255,0.18)] bg-[rgba(77,163,255,0.10)] text-[var(--blue)]",
      });
    }

    if (bookmarkCount > 0) {
      actions.push({
        title: `Review ${bookmarkCount} saved bookmark${bookmarkCount === 1 ? "" : "s"}`,
        description: "Saved questions are the easiest way to convert recognition into retention.",
        href: buildPracticeHref({ bookmarked: true }),
        cta: "Use bookmarks",
        icon: BookMarked,
        accent:
          "border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] text-[var(--text-primary)]",
      });
    } else {
      actions.push({
        title: "Set up your review bank",
        description: "Bookmark useful PYQs and mistakes during practice so revision stays lightweight later.",
        href: "/practice",
        cta: "Start practicing",
        icon: Brain,
        accent:
          "border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] text-[var(--text-primary)]",
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
          <div className="glass-panel rounded-[32px] p-8 text-center md:p-12">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--brand)]">
              Dashboard
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-[-0.06em] text-[var(--text-primary)]">
              Sign in to unlock your prep command center.
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-sm text-[var(--text-secondary)] md:text-base">
              Your dashboard ties together streaks, solved questions, bookmarks, and weak-topic
              revision. It works best once your answers are tied to an account.
            </p>
            <Link href="/">
              <span className="btn-primary mt-8 inline-flex cursor-pointer rounded-full px-6 py-3">
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

      <div className="grid gap-5 lg:grid-cols-[280px_minmax(0,1fr)] xl:grid-cols-[300px_minmax(0,1fr)]">
          <aside className="space-y-6 lg:sticky lg:top-8 lg:self-start">
            <section className={`${shellClassName} p-4 md:p-5`}>
              <div className="flex items-start gap-3.5">
                <Avatar className="h-20 w-20 shrink-0 rounded-[20px] border border-[var(--border)] bg-[linear-gradient(180deg,rgba(255,161,22,0.22)_0%,rgba(77,163,255,0.18)_100%)] shadow-[inset_0_1px_0_var(--border)]">
                  <AvatarImage src={avatarUrl} alt={displayName} className="object-cover" />
                  <AvatarFallback className="rounded-[20px] bg-transparent text-2xl font-semibold text-white">
                    {displayName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="text-[1.8rem] font-semibold tracking-[-0.05em] text-[var(--text-primary)]">
                    {displayName}
                  </p>
                  <p className="mt-1 truncate text-sm text-[var(--text-muted)]">@{username}</p>
                  <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
                    Focused on {targetExam}. Serious prep feels calmer when the next action is
                    visible.
                  </p>
                  <Link href="/profile">
                    <span className="mt-3 inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-[var(--brand-light)]">
                      {avatarUrl ? "Update profile details" : "Add your avatar"}
                      <ArrowRight size={14} />
                    </span>
                  </Link>
                </div>
              </div>

              <div className="mt-5 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                {[
                  { label: "Solved", value: totalSolved, tone: "text-[var(--text-primary)]" },
                  { label: "Accuracy", value: `${accuracy}%`, tone: "text-[var(--blue)]" },
                  { label: "Bookmarks", value: bookmarkCount, tone: "text-[var(--brand-light)]" },
                  { label: "Streak", value: `${streak}d`, tone: "text-[var(--accent)]" },
                ].map((item) => (
                  <div key={item.label} className={`${insetClassName} p-3.5`}>
                    <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">
                      {item.label}
                    </p>
                    <p className={`mt-2.5 text-[2rem] font-semibold tracking-[-0.05em] ${item.tone}`}>
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-5 flex flex-col gap-2.5">
                <Link href="/practice">
                  <span className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-[14px] bg-[linear-gradient(180deg,#ff9838_0%,#ff7a12_100%)] px-4 py-2.5 text-sm font-medium text-white shadow-[0_18px_36px_-28px_rgba(255,122,18,0.95)] transition hover:brightness-105">
                    Continue practice
                    <ArrowRight size={15} />
                  </span>
                </Link>
                <Link href="/profile">
                  <span className="inline-flex w-full cursor-pointer items-center justify-center rounded-[14px] border border-[var(--border)] bg-[var(--bg-elevated)] px-4 py-2.5 text-sm font-medium text-[var(--text-primary)] transition hover:border-[var(--border-strong)]">
                    Open profile
                  </span>
                </Link>
              </div>
            </section>

            <section className={`${shellClassName} p-4 md:p-5`}>
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--brand-light)]">
                Prep snapshot
              </p>
              <div className="mt-4 space-y-3">
                {[
                  { label: "Today", value: `${todayAttempts}/${dailyGoal}`, meta: dailyPercent >= 100 ? "Goal completed" : `${dailyRemaining} left today` },
                  { label: "This week", value: `${weeklyAttempts}`, meta: `${weeklyAccuracy}% weekly accuracy` },
                  { label: "Best streak", value: `${maxStreak}d`, meta: `${heatmap.activeDayCount} active days in ${heatmapRangeLabel}` },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between gap-3 rounded-[16px] border border-[var(--border)] bg-[var(--bg-elevated)] px-3.5 py-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">
                        {item.label}
                      </p>
                      <p className="mt-1 text-sm text-[var(--text-secondary)]">{item.meta}</p>
                    </div>
                    <p className="text-xl font-semibold tracking-[-0.05em] text-[var(--text-primary)]">
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            <section className={`${shellClassName} p-4 md:p-5`}>
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--brand-light)]">
                Review buckets
              </p>
              <div className="mt-4 space-y-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">
                    Weak topics
                  </p>
                  <div className="mt-3 space-y-2.5">
                    {improvementTopics.length > 0 ? (
                      improvementTopics.map((topic) => (
                        <Link key={topic.topic} href={buildPracticeHref({ topic: topic.topic })}>
                          <span className="flex cursor-pointer items-center justify-between gap-3 rounded-[16px] bg-[rgba(255,255,255,0.04)] px-3 py-2.5 transition hover:bg-[rgba(255,255,255,0.07)]">
                            <span className="text-sm font-medium text-[var(--text-primary)]">{topic.topic}</span>
                            <span className="text-sm text-[var(--brand-light)]">{topic.accuracy}%</span>
                          </span>
                        </Link>
                      ))
                    ) : (
                      <p className="text-sm text-[var(--text-secondary)]">
                        Weak-topic signals will show once you have more activity.
                      </p>
                    )}
                  </div>
                </div>

                <div className="border-t border-[var(--border)] pt-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">
                    Bookmark clusters
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {bookmarkTopics.length > 0 ? (
                      bookmarkTopics.map((item) => (
                        <Link key={item.topic} href={buildPracticeHref({ topic: item.topic, bookmarked: true })}>
                          <span className="inline-flex cursor-pointer rounded-full border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-1.5 text-sm text-[var(--text-primary)] transition hover:border-[var(--border-strong)]">
                            {item.topic} - {item.total}
                          </span>
                        </Link>
                      ))
                    ) : (
                      <p className="text-sm text-[var(--text-secondary)]">
                        Save questions during practice to build a cleaner revision stack.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </section>
          </aside>

          <div className="space-y-5">
            <section className="grid gap-5 xl:grid-cols-[1.08fr_0.92fr]">
              <div className={`${shellClassName} p-5 md:p-6`}>
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--brand-light)]">
                      Solved progress
                    </p>
                    <h1 className="mt-2.5 text-[2.1rem] font-semibold tracking-[-0.05em] text-[var(--text-primary)] md:text-[2.35rem]">
                      Your prep command center
                    </h1>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--text-secondary)]">
                      Dense, calm, and useful: real progress, real review signals, and a clearer
                      sense of what to do next.
                    </p>
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(77,163,255,0.16)] bg-[rgba(77,163,255,0.08)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--blue)]">
                    <BarChart3 size={14} />
                    {questionCount > 0 ? `${Math.round((totalSolved / questionCount) * 100)}% coverage` : "0% coverage"}
                  </div>
                </div>

                <div className="mt-5 grid gap-5 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
                  <div className="flex flex-col items-center">
                    <div
                      className="flex h-44 w-44 items-center justify-center rounded-full p-[10px] shadow-[0_0_48px_rgba(255,161,22,0.08)] md:h-48 md:w-48"
                      style={solvedRingStyle}
                    >
                      <div className="flex h-full w-full flex-col items-center justify-center rounded-full border border-[var(--border)] bg-[linear-gradient(180deg,var(--bg-card)_0%,var(--bg-elevated)_100%)] text-center shadow-[inset_0_1px_0_var(--border)]">
                        <p className="text-4xl font-semibold tracking-[-0.07em] text-[var(--text-primary)] md:text-[2.65rem]">
                          {totalSolved}
                        </p>
                        <p className="mt-1 text-sm text-[var(--text-secondary)]">/ {questionCount || 0} solved</p>
                        <p className="mt-2 text-xs font-medium text-[var(--accent)]">{totalAttempts} attempts logged</p>
                      </div>
                    </div>
                    <p className="mt-3 text-xs text-[var(--text-secondary)]">
                      Difficulty mix uses real solved questions from the bank.
                    </p>
                  </div>

                  <div className="space-y-2.5">
                    {difficultyProgress.map((item) => (
                      <div key={item.difficulty} className="rounded-[18px] border border-[var(--border)] bg-[var(--bg-elevated)] p-3.5">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-base font-semibold tracking-[-0.03em] text-[var(--text-primary)]">
                              {item.difficulty}
                            </p>
                            <p className="mt-1 text-sm text-[var(--text-secondary)]">
                              {item.solved}/{item.total} questions solved
                            </p>
                          </div>
                          <p className="text-xl font-semibold tracking-[-0.05em]" style={{ color: item.color }}>
                            {item.total > 0 ? `${Math.round((item.solved / item.total) * 100)}%` : "0%"}
                          </p>
                        </div>
                        <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-[var(--bg-muted)]">
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

                    <div className={`${insetClassName} p-3.5`}>
                      <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">
                        Current read
                      </p>
                      <p className="mt-2.5 text-lg font-semibold tracking-[-0.04em] text-[var(--text-primary)]">
                        {focusCopy.title}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                        {focusCopy.description}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid gap-5">
                <section className={`${shellClassName} p-5 md:p-6`}>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--brand-light)]">
                        Today&apos;s goal
                      </p>
                      <p className="mt-2.5 text-4xl font-semibold tracking-[-0.07em] text-[var(--text-primary)] md:text-[3.1rem]">
                        {todayAttempts}/{dailyGoal}
                      </p>
                      <p className="mt-2 text-sm text-[var(--text-secondary)]">
                        {dailyPercent >= 100
                          ? "Goal completed. Use the extra time for review."
                          : `${dailyRemaining} more to lock in today's target.`}
                      </p>
                    </div>
                    <span
                      className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-semibold uppercase tracking-[0.18em] ${
                        dailyPercent >= 100
                          ? "border-[rgba(45,181,93,0.2)] bg-[rgba(45,181,93,0.12)] text-[var(--accent)]"
                          : "border-[rgba(255,161,22,0.18)] bg-[rgba(255,161,22,0.10)] text-[var(--brand-light)]"
                      }`}
                    >
                      {dailyPercent >= 100 ? <CheckCircle2 size={14} /> : <Target size={14} />}
                      {dailyPercent >= 100 ? "Goal hit" : `${dailyPercent}% done`}
                    </span>
                  </div>

                  <div className="mt-5 h-3 overflow-hidden rounded-full bg-[var(--bg-muted)]">
                    <div
                      className="h-full rounded-full bg-[linear-gradient(90deg,#ff9838_0%,#ffb861_45%,#78d2ff_100%)] shadow-[0_0_24px_rgba(120,210,255,0.28)]"
                      style={{ width: `${dailyPercent}%` }}
                    />
                  </div>

                  <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
                    <div className={`${insetClassName} p-3.5`}>
                      <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">Today accuracy</p>
                      <p className="mt-2.5 text-[2rem] font-semibold tracking-[-0.05em] text-[var(--blue)]">
                        {todayAttempts > 0 ? `${todayAccuracy}%` : "n/a"}
                      </p>
                    </div>
                    <div className={`${insetClassName} p-3.5`}>
                      <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">Target exam</p>
                      <p className="mt-2.5 text-lg font-semibold tracking-[-0.04em] text-[var(--text-primary)]">
                        {targetExam}
                      </p>
                    </div>
                  </div>
                </section>

                <section className={`${shellClassName} p-5 md:p-6`}>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--brand-light)]">
                    Focus queue
                  </p>
                  <div className="mt-4 space-y-2.5">
                    <Link
                      href={
                        improvementTopics[0]
                          ? buildPracticeHref({ topic: improvementTopics[0].topic })
                          : "/practice"
                      }
                    >
                      <span className={`block cursor-pointer ${insetClassName} p-3.5 transition hover:border-[rgba(255,255,255,0.16)]`}>
                        <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">Priority review</p>
                        <p className="mt-2.5 text-lg font-semibold tracking-[-0.04em] text-[var(--text-primary)]">
                          {improvementTopics[0] ? improvementTopics[0].topic : "Build activity first"}
                        </p>
                        <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                          {improvementTopics[0]
                            ? `${improvementTopics[0].incorrect} misses across ${improvementTopics[0].total} recent attempts make this the highest-value topic to revisit.`
                            : "Once you answer more questions, the dashboard will start isolating weak areas here."}
                        </p>
                      </span>
                    </Link>

                    <div className={`${insetClassName} p-3.5`}>
                      <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">Consistency</p>
                      <p className="mt-2.5 text-[2rem] font-semibold tracking-[-0.05em] text-[var(--accent)]">
                        {activeDays}/7
                      </p>
                      <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                        Active days this week with a current streak of {streak} day{streak === 1 ? "" : "s"}.
                      </p>
                    </div>
                  </div>
                </section>
              </div>
            </section>

            <section className={`${shellClassName} p-5 md:p-6`}>
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--brand-light)]">
                    Activity heatmap
                  </p>
                  <h2 className="mt-2.5 text-[1.9rem] font-semibold tracking-[-0.05em] text-[var(--text-primary)]">
                    Attempts over time
                  </h2>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex flex-wrap gap-2">
                    {(["7D", "30D", "26W", "1Y"] as const).map((range) => (
                      <button
                        key={range}
                        type="button"
                        onClick={() => setHeatmapRange(range)}
                        className={`rounded-[10px] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] transition ${
                          heatmapRange === range
                            ? "bg-[rgba(255,161,22,0.14)] text-[var(--brand-light)]"
                            : "border border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                        }`}
                      >
                        {range}
                      </button>
                    ))}
                  </div>
                  {[
                    { label: "Active days", value: heatmap.activeDayCount },
                    { label: "Current streak", value: streak },
                    { label: "Best streak", value: maxStreak },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="rounded-[14px] border border-[var(--border)] bg-[var(--bg-elevated)] px-3.5 py-2.5"
                    >
                      <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">
                        {item.label}
                      </p>
                      <p className="mt-1.5 text-xl font-semibold tracking-[-0.05em] text-[var(--text-primary)]">
                        {item.value}
                      </p>
                    </div>
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

                  <div className="mt-4 flex items-center justify-between gap-4">
                    <p className="text-sm text-[var(--text-secondary)]">
                      Darker cells mean more attempts on that day.
                    </p>
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
                </div>
              </div>
            </section>

            <section className={`${shellClassName} p-5 md:p-6`}>
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--brand-light)]">
                    Workspace
                  </p>
                  <h2 className="mt-2.5 text-[1.9rem] font-semibold tracking-[-0.05em] text-[var(--text-primary)]">
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
                      className={`rounded-[12px] px-3.5 py-2 text-sm font-medium transition ${
                        activePanel === tab.id
                          ? "bg-[rgba(255,161,22,0.14)] text-[var(--brand-light)]"
                          : "border border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-5">
                {activePanel === "activity" ? (
                  <div className="space-y-2.5">
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
                          <span className="flex cursor-pointer flex-col gap-3 rounded-[18px] border border-[var(--border)] bg-[var(--bg-elevated)] px-3.5 py-3.5 transition hover:border-[var(--border-strong)] md:flex-row md:items-center md:justify-between">
                            <span>
                              <span className="flex flex-wrap items-center gap-2">
                                <span className="font-semibold text-[var(--text-primary)]">{session.topic}</span>
                                <span className="rounded-full border border-[var(--border)] bg-[var(--bg-card)] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
                                  {session.type}
                                </span>
                              </span>
                              <span className="mt-1 block text-sm text-[var(--text-secondary)]">
                                {session.exam} - {session.date}
                              </span>
                            </span>

                            <span
                              className={`inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] ${
                                session.correct
                                  ? "border-[rgba(45,181,93,0.2)] bg-[rgba(45,181,93,0.10)] text-[var(--accent)]"
                                  : "border-[rgba(255,184,0,0.2)] bg-[rgba(255,184,0,0.10)] text-[var(--yellow)]"
                              }`}
                            >
                              {session.correct ? <CheckCircle2 size={13} /> : <CircleAlert size={13} />}
                              {session.correct ? "Correct" : "Needs review"}
                            </span>
                          </span>
                        </Link>
                      ))
                    ) : (
                      <div className="rounded-[26px] border border-dashed border-[var(--border-strong)] bg-[var(--bg-elevated)] p-8 text-center">
                        <p className="text-xl font-semibold text-[var(--text-primary)]">
                          No answered questions yet
                        </p>
                        <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-[var(--text-secondary)]">
                          Start with practice so this workspace begins showing useful activity.
                        </p>
                      </div>
                    )}
                  </div>
                ) : null}

                {activePanel === "review" ? (
                  <div className="space-y-2.5">
                    {reviewQueue.length > 0 ? (
                      reviewQueue.map((item) => (
                        <Link
                          key={`${item.kind}-${item.id}`}
                          href={buildPracticeHref({
                            questionId: item.id,
                            topic: item.topic,
                            exam: item.exam,
                            bookmarked: item.kind === "bookmark",
                          })}
                        >
                          <span className="block cursor-pointer rounded-[18px] border border-[var(--border)] bg-[var(--bg-elevated)] p-3.5 transition hover:border-[var(--border-strong)]">
                            <span className="flex items-start justify-between gap-3">
                              <span>
                                <span className="line-clamp-2 text-[15px] font-medium leading-6 text-[var(--text-primary)]">
                                  {item.title}
                                </span>
                                <span className="mt-1 block text-sm text-[var(--text-secondary)]">
                                  {item.exam} - {item.topic}
                                </span>
                              </span>
                              <span
                                className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] ${
                                  item.kind === "mistake"
                                    ? "border-[rgba(255,95,86,0.18)] bg-[rgba(255,95,86,0.10)] text-[var(--red)]"
                                    : "border-[rgba(255,161,22,0.18)] bg-[rgba(255,161,22,0.10)] text-[var(--brand-light)]"
                                }`}
                              >
                                {item.reason}
                              </span>
                            </span>
                          </span>
                        </Link>
                      ))
                    ) : (
                      <div className="rounded-[22px] border border-dashed border-[var(--border-strong)] bg-[var(--bg-elevated)] p-6 text-sm text-[var(--text-secondary)]">
                        Missed questions and bookmarks will collect here as your review queue builds up.
                      </div>
                    )}
                  </div>
                ) : null}

                {activePanel === "actions" ? (
                  <div className="space-y-2.5">
                    {nextActions.map((action) => {
                      const Icon = action.icon;
                      return (
                        <div
                          key={action.title}
                          className="rounded-[18px] border border-[var(--border)] bg-[var(--bg-elevated)] p-3.5"
                        >
                          <div className="flex items-start gap-4">
                            <div className={`rounded-[14px] border p-2.5 ${action.accent}`}>
                              <Icon size={18} />
                            </div>
                            <div className="flex-1">
                              <p className="text-base font-semibold tracking-[-0.03em] text-[var(--text-primary)]">
                                {action.title}
                              </p>
                              <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
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
                  </div>
                ) : null}
              </div>
            </section>
          </div>
      </div>
    </AppShell>
  );
}
