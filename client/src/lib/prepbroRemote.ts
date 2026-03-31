import type { User } from "@supabase/supabase-js";

import type {
  EditableProfile,
  PracticeSessionRecord,
  PrepPreferences,
} from "@/lib/prepbro";
import { supabase } from "@/lib/supabase";

type PracticeSessionRow = {
  id: string;
  user_id: string;
  exam: string;
  subject: string;
  total_questions: number;
  correct_count: number;
  wrong_count: number;
  skipped_count: number;
  duration_sec: number;
  accuracy: number;
  answers: PracticeSessionRecord["answers"];
  completed_at: string;
};

export async function loadRemotePrepPreferences(user: User) {
  const metadata = user.user_metadata || {};
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, target_exam")
    .eq("id", user.id)
    .maybeSingle();

  const dailyGoal = Number.parseInt(String(metadata.daily_goal || ""), 10);

  const preferencePatch: Partial<PrepPreferences> = {
    exam: profile?.target_exam || metadata.target_exam,
    dailyGoal: [5, 10, 20, 30].includes(dailyGoal)
      ? (dailyGoal as PrepPreferences["dailyGoal"])
      : undefined,
    weakSubjects: Array.isArray(metadata.weak_subjects)
      ? metadata.weak_subjects
      : undefined,
    language:
      metadata.language === "hi" || metadata.language === "en"
        ? metadata.language
        : undefined,
    adaptiveDarkMode:
      typeof metadata.adaptive_dark_mode === "boolean"
        ? metadata.adaptive_dark_mode
        : undefined,
    onboardedAt:
      typeof metadata.onboarding_completed_at === "string"
        ? metadata.onboarding_completed_at
        : undefined,
  };

  return {
    preferences: Object.fromEntries(
      Object.entries(preferencePatch).filter(([, value]) => value !== undefined)
    ) as Partial<PrepPreferences>,
    profile: {
      displayName:
        profile?.full_name || metadata.full_name || user.email?.split("@")[0] || "Rahul",
      exam: (profile?.target_exam ||
        metadata.target_exam ||
        "UPSC CSE") as EditableProfile["exam"],
    },
  };
}

export async function saveRemotePrepPreferences(
  user: User,
  preferences: PrepPreferences
) {
  const metadata = user.user_metadata || {};

  await Promise.all([
    supabase.auth.updateUser({
      data: {
        ...metadata,
        target_exam: preferences.exam,
        daily_goal: preferences.dailyGoal,
        weak_subjects: preferences.weakSubjects,
        language: preferences.language,
        adaptive_dark_mode: preferences.adaptiveDarkMode,
        onboarding_completed_at: preferences.onboardedAt,
      },
    }),
    supabase.from("profiles").update({ target_exam: preferences.exam }).eq("id", user.id),
  ]);
}

export async function saveRemoteProfile(user: User, profile: EditableProfile) {
  const metadata = user.user_metadata || {};

  await Promise.all([
    supabase.auth.updateUser({
      data: {
        ...metadata,
        full_name: profile.displayName,
        target_exam: profile.exam,
      },
    }),
    supabase
      .from("profiles")
      .update({
        full_name: profile.displayName,
        target_exam: profile.exam,
      })
      .eq("id", user.id),
  ]);
}

function mapSessionRow(row: PracticeSessionRow): PracticeSessionRecord {
  return {
    id: row.id,
    exam: row.exam as PracticeSessionRecord["exam"],
    subject: row.subject as PracticeSessionRecord["subject"],
    totalQuestions: row.total_questions,
    correctCount: row.correct_count,
    wrongCount: row.wrong_count,
    skippedCount: row.skipped_count,
    durationSec: row.duration_sec,
    completedAt: row.completed_at,
    accuracy: row.accuracy,
    answers: Array.isArray(row.answers) ? row.answers : [],
  };
}

export async function fetchRemotePracticeSessions(userId: string) {
  const { data, error } = await supabase
    .from("practice_sessions")
    .select(
      "id, user_id, exam, subject, total_questions, correct_count, wrong_count, skipped_count, duration_sec, accuracy, answers, completed_at"
    )
    .eq("user_id", userId)
    .order("completed_at", { ascending: false })
    .limit(100);

  if (error) return [];
  return ((data || []) as PracticeSessionRow[]).map(mapSessionRow);
}

export async function saveRemotePracticeSession(
  user: User,
  session: PracticeSessionRecord
) {
  const leaderboardName =
    user.user_metadata?.full_name || user.email?.split("@")[0] || "Aspirant";

  const { error } = await supabase.from("practice_sessions").upsert({
    id: session.id,
    user_id: user.id,
    exam: session.exam,
    subject: session.subject,
    total_questions: session.totalQuestions,
    correct_count: session.correctCount,
    wrong_count: session.wrongCount,
    skipped_count: session.skippedCount,
    duration_sec: session.durationSec,
    accuracy: session.accuracy,
    answers: session.answers,
    completed_at: session.completedAt,
    leaderboard_name: leaderboardName,
  });

  return !error;
}
