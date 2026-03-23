import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BookMarked,
  Brain,
  Flame,
  Loader2,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";
import { Link } from "wouter";

import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import OnboardingModal from "@/components/OnboardingModal";
import SectionHeader from "@/components/SectionHeader";
import { useAuth } from "@/contexts/AuthContext";
import { useQuestionBank } from "@/hooks/useQuestionBank";
import { supabase } from "@/lib/supabase";

type AnswerRow = {
  question_id: number;
  is_correct: boolean;
  answered_at: string;
};

type ProfileRow = {
  full_name?: string;
  streak?: number;
  max_streak?: number;
  accuracy?: number;
  total_solved?: number;
  target_exam?: string;
};

export default function Dashboard() {
  const { user, loading } = useAuth();
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [answers, setAnswers] = useState<AnswerRow[]>([]);
  const [bookmarkCount, setBookmarkCount] = useState(0);
  const [pageLoading, setPageLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const { questions } = useQuestionBank();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      setPageLoading(false);
      return;
    }

    const load = async () => {
      setPageLoading(true);
      const [{ data: profileData }, { data: answersData }, { count }] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).single(),
        supabase
          .from("user_answers")
          .select("question_id, is_correct, answered_at")
          .eq("user_id", user.id)
          .order("answered_at", { ascending: false })
          .limit(50),
        supabase
          .from("bookmarks")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id),
      ]);

      setProfile(profileData || null);
      setAnswers(answersData || []);
      setBookmarkCount(count || 0);
      const metadata = user.user_metadata || {};
      if (!metadata.onboarding_completed_at && (profileData?.total_solved ?? 0) === 0 && (answersData?.length ?? 0) === 0) {
        setShowOnboarding(true);
      }
      setPageLoading(false);
    };

    load();
  }, [loading, user]);

  const solvedIds = useMemo(
    () => Array.from(new Set(answers.map((item) => item.question_id))),
    [answers],
  );

  const totalSolved = profile?.total_solved ?? solvedIds.length;
  const accuracy =
    profile?.accuracy ??
    (answers.length ? Math.round((answers.filter((item) => item.is_correct).length / answers.length) * 100) : 0);
  const streak = profile?.streak ?? 0;
  const maxStreak = profile?.max_streak ?? 0;
  const displayName =
    profile?.full_name || user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Aspirant";

  const today = new Date().toISOString().split("T")[0];
  const todaySolved = answers.filter((item) => item.answered_at?.startsWith(today)).length;
  const dailyGoal = Number.parseInt(String(user?.user_metadata?.daily_goal || "12"), 10) || 12;
  const dailyPercent = Math.min(100, Math.round((todaySolved / dailyGoal) * 100));

  const topicPerformance = Object.values(
    answers.reduce<Record<string, { topic: string; correct: number; total: number }>>((acc, item) => {
      const match = questions.find((question) => question.id === item.question_id);
      if (!match) return acc;
      const current = acc[match.topic] || { topic: match.topic, correct: 0, total: 0 };
      current.total += 1;
      if (item.is_correct) current.correct += 1;
      acc[match.topic] = current;
      return acc;
    }, {}),
  )
    .map((item) => ({
      ...item,
      accuracy: Math.round((item.correct / item.total) * 100),
    }))
    .sort((a, b) => a.accuracy - b.accuracy);

  const improvementTopics = topicPerformance.slice(0, 3);
  const recentSessions = answers.slice(0, 5).map((item) => {
    const match = questions.find((question) => question.id === item.question_id);
    return {
      id: item.question_id,
      topic: match?.topic || "Practice session",
      exam: match?.exam || "General",
      correct: item.is_correct,
      date: new Date(item.answered_at).toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        hour: "numeric",
        minute: "2-digit",
      }),
    };
  });

  if (loading || pageLoading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container-shell flex min-h-[60vh] items-center justify-center">
          <div className="inline-flex items-center gap-3 rounded-full border border-[var(--border)] bg-[var(--bg-card)] px-5 py-3 text-sm text-[var(--text-secondary)]">
            <Loader2 size={16} className="animate-spin text-[var(--brand)]" />
            Loading your dashboard...
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen">
        <Navbar />
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
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      {user ? (
        <OnboardingModal
          isOpen={showOnboarding}
          userId={user.id}
          defaultExam={profile?.target_exam || "UPSC CSE 2026"}
          onClose={() => setShowOnboarding(false)}
          onComplete={({ targetExam, dailyGoal }) => {
            setProfile((current: ProfileRow | null) => ({ ...(current || {}), target_exam: targetExam }));
          }}
        />
      ) : null}

      <main className="px-4 py-8 md:py-10">
        <div className="container-shell space-y-8">
          <div className="glass-panel rounded-[32px] px-6 py-8 md:px-8 md:py-10">
            <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--brand)]">
                  Dashboard
                </p>
                <h1 className="mt-4 text-4xl font-semibold tracking-[-0.06em] text-[var(--text-primary)] md:text-5xl">
                  Welcome back, {displayName}.
                </h1>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--text-secondary)] md:text-base">
                  Your current prep loop is clear: maintain momentum, close weak-topic gaps, and
                  stay consistent enough to make the platform part of your daily routine.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Link href="/practice">
                    <span className="btn-primary inline-flex cursor-pointer rounded-full px-6 py-3">
                      Continue practice
                      <ArrowRight size={16} />
                    </span>
                  </Link>
                  <Link href="/profile">
                    <span className="btn-secondary inline-flex cursor-pointer rounded-full px-6 py-3">
                      Open profile
                    </span>
                  </Link>
                </div>
              </div>

              <div className="rounded-[28px] border border-[var(--border)] bg-[var(--bg-card-strong)] p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
                      Today’s goal
                    </p>
                    <p className="mt-2 text-3xl font-semibold tracking-[-0.05em] text-[var(--text-primary)]">
                      {todaySolved}/{dailyGoal}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-[var(--brand-subtle)] p-3 text-[var(--brand)]">
                    <Target size={20} />
                  </div>
                </div>
                <div className="mt-5 progress-track">
                  <div className="progress-fill" style={{ width: `${dailyPercent}%` }} />
                </div>
                <p className="mt-3 text-sm text-[var(--text-secondary)]">
                  {dailyPercent >= 100
                    ? "You’ve hit today’s goal. Keep going to build tomorrow’s confidence."
                    : `${dailyGoal - todaySolved} more questions to hit today’s target.`}
                </p>
                <div className="mt-6 rounded-3xl border border-[var(--border)] bg-[var(--bg-subtle)] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
                    Target exam
                  </p>
                    <p className="mt-2 text-lg font-semibold text-[var(--text-primary)]">
                      {profile?.target_exam || "UPSC CSE 2026"}
                    </p>
                    <p className="mt-1 text-sm text-[var(--text-secondary)]">
                    Keep the product personalized so the dashboard feels relevant from day one.
                    </p>
                  </div>
                </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[
              { label: "Solved questions", value: totalSolved, icon: Brain },
              { label: "Accuracy", value: `${accuracy}%`, icon: TrendingUp },
              { label: "Current streak", value: `${streak}d`, icon: Flame },
              { label: "Bookmarks", value: bookmarkCount, icon: BookMarked },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <div key={item.label} className="stat-card rounded-[28px]">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--brand-subtle)] text-[var(--brand)]">
                    <Icon size={18} />
                  </div>
                  <p className="mt-5 text-3xl font-semibold tracking-[-0.05em] text-[var(--text-primary)]">
                    {item.value}
                  </p>
                  <p className="mt-2 text-sm text-[var(--text-muted)]">{item.label}</p>
                </div>
              );
            })}
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="glass-panel rounded-[32px] p-6 md:p-8">
              <SectionHeader
                eyebrow="Recent momentum"
                title="What you touched most recently"
                description="The dashboard now surfaces recent practice in a simpler, more useful way."
              />
              <div className="mt-6 space-y-3">
                {recentSessions.length > 0 ? (
                  recentSessions.map((session) => (
                    <div
                      key={`${session.id}-${session.date}`}
                      className="flex items-center justify-between gap-4 rounded-3xl border border-[var(--border)] bg-[var(--bg-card-strong)] px-4 py-4"
                    >
                      <div>
                        <p className="font-semibold text-[var(--text-primary)]">{session.topic}</p>
                        <p className="text-sm text-[var(--text-secondary)]">
                          {session.exam} · {session.date}
                        </p>
                      </div>
                      <span
                        className={`badge ${session.correct ? "badge-green" : "badge-yellow"} px-3 py-1 text-xs`}
                      >
                        {session.correct ? "Correct" : "Needs review"}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="rounded-[28px] border border-dashed border-[var(--border-strong)] bg-[var(--bg-subtle)] p-6 text-center">
                    <p className="text-lg font-semibold text-[var(--text-primary)]">
                      No answered questions yet
                    </p>
                    <p className="mt-2 text-sm text-[var(--text-secondary)]">
                      Start with practice so your dashboard can begin showing momentum and review
                      cues.
                    </p>
                    <Link href="/practice">
                      <span className="btn-primary mt-5 inline-flex cursor-pointer rounded-full px-5 py-2.5">
                        Start now
                      </span>
                    </Link>
                  </div>
                )}
              </div>
            </div>

            <div className="grid gap-6">
              <div className="glass-panel rounded-[32px] p-6 md:p-8">
                <SectionHeader
                  eyebrow="Improve next"
                  title="Topics that need another pass"
                  description="Weak-topic nudges help turn the dashboard into a study guide, not just a scoreboard."
                />
                <div className="mt-6 space-y-3">
                  {improvementTopics.length > 0 ? (
                    improvementTopics.map((topic) => (
                      <div
                        key={topic.topic}
                        className="rounded-3xl border border-[var(--border)] bg-[var(--bg-card-strong)] p-4"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="font-semibold text-[var(--text-primary)]">{topic.topic}</p>
                            <p className="text-sm text-[var(--text-secondary)]">
                              {topic.total} attempts logged
                            </p>
                          </div>
                          <p className="text-xl font-semibold tracking-[-0.04em] text-[var(--red)]">
                            {topic.accuracy}%
                          </p>
                        </div>
                        <div className="mt-4 progress-track">
                          <div className="progress-fill" style={{ width: `${topic.accuracy}%` }} />
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-[28px] border border-dashed border-[var(--border-strong)] bg-[var(--bg-subtle)] p-6 text-sm text-[var(--text-secondary)]">
                      Answer a few more questions and your weak-topic suggestions will show up here.
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-[32px] border border-[var(--border)] bg-[var(--bg-inverse)] p-6 text-white md:p-8">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-white">
                  <Sparkles size={18} />
                </div>
                <p className="mt-5 text-2xl font-semibold tracking-[-0.05em] text-white">
                  Best streak: {maxStreak} days
                </p>
                <p className="mt-3 text-sm text-white/72">
                  Streaks only matter when the surrounding product reinforces the habit. The new
                  layout makes that loop more visible across the platform.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
