import { supabase } from "./supabase";

export type AnswerAttempt = {
  question_id: number;
  is_correct: boolean;
  answered_at: string | null;
};

type AnswerAttemptRow = {
  id?: number;
  question_id: number | string;
  is_correct: boolean;
  answered_at?: string | null;
  created_at?: string | null;
};

const toQuestionId = (value: number | string) => {
  const normalized = typeof value === "number" ? value : Number.parseInt(value, 10);
  return Number.isFinite(normalized) ? normalized : null;
};

const normalizeAnswerAttempt = (row: AnswerAttemptRow): AnswerAttempt | null => {
  const questionId = toQuestionId(row.question_id);
  if (questionId === null) return null;

  return {
    question_id: questionId,
    is_correct: Boolean(row.is_correct),
    answered_at: row.answered_at ?? row.created_at ?? null,
  };
};

export async function getAnswerAttempts(userId: string): Promise<AnswerAttempt[]> {
  const queries = [
    () =>
      supabase
        .from("user_answers")
        .select("question_id, is_correct, answered_at")
        .eq("user_id", userId)
        .order("answered_at", { ascending: false }),
    () =>
      supabase
        .from("user_answers")
        .select("question_id, is_correct, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false }),
    () =>
      supabase
        .from("user_answers")
        .select("id, question_id, is_correct")
        .eq("user_id", userId)
        .order("id", { ascending: false }),
    () => supabase.from("user_answers").select("question_id, is_correct").eq("user_id", userId),
  ];

  let lastError: unknown = null;

  for (const runQuery of queries) {
    const { data, error } = await runQuery();
    if (error) {
      lastError = error;
      continue;
    }

    return (data as AnswerAttemptRow[] | null)?.map(normalizeAnswerAttempt).filter(Boolean) as AnswerAttempt[];
  }

  if (lastError) {
    console.error("Error loading answer attempts:", lastError);
  }

  return [];
}

export function buildAnswerStatuses(
  attempts: AnswerAttempt[],
): Record<number, "correct" | "wrong"> {
  const statuses: Record<number, "correct" | "wrong"> = {};

  for (const answer of attempts) {
    if (statuses[answer.question_id]) continue;
    statuses[answer.question_id] = answer.is_correct ? "correct" : "wrong";
  }

  return statuses;
}

// Save a question answer to Supabase
export async function saveAnswer(
  userId: string,
  questionId: number,
  isCorrect: boolean,
  selectedOption: number,
  timeTaken: number = 0
) {
  const { error } = await supabase.from("user_answers").insert({
    user_id: userId,
    question_id: questionId,
    is_correct: isCorrect,
    selected_option: selectedOption,
    time_taken: timeTaken,
  });
  if (error) console.error("Error saving answer:", error);

  // Update profile stats
  await updateProfileStats(userId);
  // Update streak
  await updateStreak(userId);
}

// Toggle bookmark
export async function toggleBookmark(userId: string, questionId: number) {
  // Check if already bookmarked
  const { data } = await supabase
    .from("bookmarks")
    .select("id")
    .eq("user_id", userId)
    .eq("question_id", questionId)
    .single();

  if (data) {
    // Remove bookmark
    await supabase.from("bookmarks").delete()
      .eq("user_id", userId).eq("question_id", questionId);
    return false;
  } else {
    // Add bookmark
    await supabase.from("bookmarks").insert({ user_id: userId, question_id: questionId });
    return true;
  }
}

// Get user's bookmarked question IDs
export async function getBookmarks(userId: string): Promise<number[]> {
  const { data, error } = await supabase
    .from("bookmarks")
    .select("question_id")
    .eq("user_id", userId);

  if (error) {
    console.error("Error loading bookmarks:", error);
    return [];
  }

  return (
    data
      ?.map((bookmark) => toQuestionId(bookmark.question_id))
      .filter((questionId): questionId is number => questionId !== null) ?? []
  );
}

// Get user's solved question IDs
export async function getSolvedQuestions(userId: string): Promise<number[]> {
  const attempts = await getAnswerAttempts(userId);
  return Array.from(new Set(attempts.map((attempt) => attempt.question_id)));
}

export async function getAnswerStatuses(
  userId: string,
): Promise<Record<number, "correct" | "wrong">> {
  const attempts = await getAnswerAttempts(userId);
  return buildAnswerStatuses(attempts);
}

// Update profile total_solved and accuracy
async function updateProfileStats(userId: string) {
  const { data } = await supabase
    .from("user_answers")
    .select("is_correct")
    .eq("user_id", userId);

  if (!data) return;

  const total = data.length;
  const correct = data.filter((a) => a.is_correct).length;
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;

  await supabase.from("profiles").update({
    total_solved: total,
    accuracy,
  }).eq("id", userId);
}

// Update streak based on last_active date
async function updateStreak(userId: string) {
  const { data: profile } = await supabase
    .from("profiles")
    .select("streak, max_streak, last_active")
    .eq("id", userId)
    .single();

  if (!profile) return;

  const today = new Date().toISOString().split("T")[0];
  const lastActive = profile.last_active;

  if (lastActive === today) return; // Already active today

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];

  let newStreak = 1;
  if (lastActive === yesterdayStr) {
    // Consecutive day — increment streak
    newStreak = (profile.streak || 0) + 1;
  }

  const newMaxStreak = Math.max(newStreak, profile.max_streak || 0);

  await supabase.from("profiles").update({
    streak: newStreak,
    max_streak: newMaxStreak,
    last_active: today,
  }).eq("id", userId);
}

// Get full user stats
export async function getUserStats(userId: string) {
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();
  return data;
}
