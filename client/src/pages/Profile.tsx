import { useEffect, useMemo, useState } from "react";
import {
  Award,
  Bookmark,
  Flame,
  Loader2,
  LogOut,
  Target,
  TrendingUp,
  UserCircle2,
} from "lucide-react";
import { Link } from "wouter";

import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import SectionHeader from "@/components/SectionHeader";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { useQuestionBank } from "@/hooks/useQuestionBank";
import { supabase } from "@/lib/supabase";

const EXAM_OPTIONS = [
  "UPSC CSE 2026",
  "UPSC CSE 2027",
  "TSPSC Group 1 2025",
  "TSPSC Group 2 2025",
  "APPSC Group 1 2025",
  "SSC CGL 2025",
  "SSC CHSL 2025",
  "RRB NTPC 2025",
  "IBPS PO 2025",
];

export default function Profile() {
  const { user, signOut } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [answers, setAnswers] = useState<any[]>([]);
  const [bookmarkIds, setBookmarkIds] = useState<number[]>([]);
  const [targetExam, setTargetExam] = useState("UPSC CSE 2026");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [savingAvatar, setSavingAvatar] = useState(false);
  const { questions } = useQuestionBank();

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const load = async () => {
      setLoading(true);
      const [{ data: profileData }, { data: answerData }, { data: bookmarkData }] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).single(),
        supabase
          .from("user_answers")
          .select("question_id, is_correct, answered_at")
          .eq("user_id", user.id)
          .order("answered_at", { ascending: false }),
        supabase.from("bookmarks").select("question_id").eq("user_id", user.id),
      ]);

      setProfile(profileData || null);
      setAnswers(answerData || []);
      setBookmarkIds((bookmarkData || []).map((item: any) => item.question_id));
      setTargetExam(profileData?.target_exam || "UPSC CSE 2026");
      setAvatarUrl(
        profileData?.avatar_url ||
          user.user_metadata?.avatar_url ||
          user.user_metadata?.picture ||
          user.user_metadata?.avatar ||
          "",
      );
      setLoading(false);
    };

    load();
  }, [user]);

  const solvedIds = useMemo(
    () => Array.from(new Set(answers.map((item) => item.question_id))),
    [answers],
  );
  const totalSolved = solvedIds.length;
  const accuracy = answers.length
    ? Math.round((answers.filter((item) => item.is_correct).length / answers.length) * 100)
    : 0;

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
    .sort((a, b) => b.accuracy - a.accuracy);

  const bestTopics = topicPerformance.slice(0, 3);
  const needsWork = topicPerformance.slice(-3).reverse();
  const streak = profile?.streak || 0;
  const maxStreak = profile?.max_streak || 0;
  const displayName =
    profile?.full_name || user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Aspirant";
  const username = profile?.username || user?.email?.split("@")[0] || "prepbros-user";

  const saveTargetExam = async (value: string) => {
    setTargetExam(value);
    if (!user) return;
    await supabase.from("profiles").update({ target_exam: value }).eq("id", user.id);
  };

  const saveAvatar = async () => {
    if (!user) return;
    setSavingAvatar(true);
    const nextAvatarUrl = avatarUrl.trim();
    await supabase.auth.updateUser({
      data: {
        ...(user.user_metadata || {}),
        avatar_url: nextAvatarUrl,
      },
    });
    setProfile((current: any) => ({ ...(current || {}), avatar_url: nextAvatarUrl }));
    setSavingAvatar(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container-shell flex min-h-[60vh] items-center justify-center">
          <div className="inline-flex items-center gap-3 rounded-full border border-[var(--border)] bg-[var(--bg-card)] px-5 py-3 text-sm text-[var(--text-secondary)]">
            <Loader2 size={16} className="animate-spin text-[var(--brand)]" />
            Loading profile...
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
              Profile
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-[-0.06em] text-[var(--text-primary)]">
              Log in to make PrepBros personal.
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-sm text-[var(--text-secondary)] md:text-base">
              Your account area now works as both profile and lightweight settings space, with a
              clearer target exam, performance summary, and retention cues.
            </p>
            <Link href="/">
              <span className="btn-primary mt-8 inline-flex cursor-pointer rounded-full px-6 py-3">
                Back to home
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

      <main className="px-4 py-8 md:py-10">
        <div className="container-shell space-y-6">
          <div className="glass-panel rounded-[32px] p-6 md:p-8">
            <div className="grid gap-8 lg:grid-cols-[0.92fr_1.08fr]">
              <div className="rounded-[28px] border border-[var(--border)] bg-[var(--bg-card-strong)] p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16 rounded-[22px] border border-[var(--border)]">
                      <AvatarImage src={avatarUrl} alt={displayName} className="object-cover" />
                      <AvatarFallback className="rounded-[22px] bg-[var(--brand-subtle)] text-[var(--brand)]">
                        <UserCircle2 size={34} />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-2xl font-semibold tracking-[-0.05em] text-[var(--text-primary)]">
                        {displayName}
                      </p>
                      <p className="text-sm text-[var(--text-muted)]">@{username}</p>
                    </div>
                  </div>
                  <button type="button" onClick={() => signOut()} className="btn-secondary rounded-full px-4">
                    <LogOut size={14} />
                    Sign out
                  </button>
                </div>

                <div className="mt-6 rounded-3xl border border-[var(--border)] bg-[var(--bg-subtle)] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
                    Target exam
                  </p>
                  <select value={targetExam} onChange={(event) => saveTargetExam(event.target.value)} className="mt-3 w-full">
                    {EXAM_OPTIONS.map((exam) => (
                      <option key={exam}>{exam}</option>
                    ))}
                  </select>
                </div>

                <div className="mt-4 rounded-3xl border border-[var(--border)] bg-[var(--bg-subtle)] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
                    Avatar image URL
                  </p>
                  <input
                    value={avatarUrl}
                    onChange={(event) => setAvatarUrl(event.target.value)}
                    placeholder="https://..."
                    className="input mt-3"
                  />
                  <div className="mt-3 flex justify-end">
                    <button type="button" onClick={saveAvatar} disabled={savingAvatar} className="btn-secondary rounded-full px-4">
                      {savingAvatar ? "Saving..." : "Save avatar"}
                    </button>
                  </div>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  {[
                    { label: "Solved", value: totalSolved, icon: Target },
                    { label: "Accuracy", value: `${accuracy}%`, icon: TrendingUp },
                    { label: "Bookmarks", value: bookmarkIds.length, icon: Bookmark },
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <div
                        key={item.label}
                        className="rounded-3xl border border-[var(--border)] bg-[var(--bg-card)] p-4"
                      >
                        <Icon size={16} className="text-[var(--brand)]" />
                        <p className="mt-4 text-2xl font-semibold tracking-[-0.05em] text-[var(--text-primary)]">
                          {item.value}
                        </p>
                        <p className="mt-1 text-sm text-[var(--text-muted)]">{item.label}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <SectionHeader
                  eyebrow="Account and settings"
                  title="Your prep profile, targets, and performance in one place."
                  description="Keep your exam goal current, monitor streaks and bookmarks, and use your results to see where your preparation is strongest."
                />
                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  <div className="rounded-[28px] border border-[var(--border)] bg-[var(--bg-card-strong)] p-5">
                    <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--brand-subtle)] text-[var(--brand)]">
                      <Flame size={18} />
                    </div>
                    <p className="mt-5 text-3xl font-semibold tracking-[-0.05em] text-[var(--text-primary)]">
                      {streak} days
                    </p>
                    <p className="mt-2 text-sm text-[var(--text-secondary)]">
                      Current streak. Best streak so far: {maxStreak} days.
                    </p>
                  </div>

                  <div className="rounded-[28px] border border-[var(--border)] bg-[var(--bg-inverse)] p-5 text-white">
                    <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-white">
                      <Award size={18} />
                    </div>
                    <p className="mt-5 text-2xl font-semibold tracking-[-0.05em] text-white">
                      Progress becomes sticky when it feels visible.
                    </p>
                    <p className="mt-2 text-sm text-white/72">
                      Good prep platforms make effort visible, which is what helps users return consistently.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="glass-panel rounded-[32px] p-6 md:p-8">
              <SectionHeader
                eyebrow="Strong topics"
                title="Areas where you’re already performing well"
                description="Positive reinforcement helps this area feel more motivating than a plain stats dump."
              />
              <div className="mt-6 space-y-3">
                {bestTopics.length > 0 ? (
                  bestTopics.map((topic) => (
                    <div key={topic.topic} className="rounded-3xl border border-[var(--border)] bg-[var(--bg-card-strong)] p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-semibold text-[var(--text-primary)]">{topic.topic}</p>
                          <p className="text-sm text-[var(--text-secondary)]">{topic.total} attempts logged</p>
                        </div>
                        <span className="badge badge-green px-3 py-1">{topic.accuracy}%</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-[28px] border border-dashed border-[var(--border-strong)] bg-[var(--bg-subtle)] p-6 text-sm text-[var(--text-secondary)]">
                    Solve a few questions and this section will start surfacing strong areas.
                  </div>
                )}
              </div>
            </div>

            <div className="glass-panel rounded-[32px] p-6 md:p-8">
              <SectionHeader
                eyebrow="Needs focus"
                title="Topics to revisit next"
                description="Use weaker areas to decide what deserves your next study block."
              />
              <div className="mt-6 space-y-3">
                {needsWork.length > 0 ? (
                  needsWork.map((topic) => (
                    <div key={topic.topic} className="rounded-3xl border border-[var(--border)] bg-[var(--bg-card-strong)] p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-semibold text-[var(--text-primary)]">{topic.topic}</p>
                          <p className="text-sm text-[var(--text-secondary)]">{topic.total} attempts logged</p>
                        </div>
                        <span className="badge badge-yellow px-3 py-1">{topic.accuracy}%</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-[28px] border border-dashed border-[var(--border-strong)] bg-[var(--bg-subtle)] p-6 text-sm text-[var(--text-secondary)]">
                    Answer more questions to reveal meaningful review recommendations.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
