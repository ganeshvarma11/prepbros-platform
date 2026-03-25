import { supabase } from "./supabase";
import { type QuestionId, toQuestionId } from "./questionIdentity";

export type AnswerAttempt = {
  question_id: QuestionId;
  is_correct: boolean;
  answered_at: string | null;
};

export type QuestionProgress = {
  question_id: QuestionId;
  status: "correct" | "wrong";
  answered_at: string | null;
  attempts: number;
  correct_attempts: number;
  wrong_attempts: number;
};

type AnswerAttemptRow = {
  id?: number;
  question_id: number | string;
  is_correct: boolean;
  answered_at?: string | null;
  created_at?: string | null;
};

const normalizeAnswerAttempt = (
  row: AnswerAttemptRow
): AnswerAttempt | null => {
  const questionId = toQuestionId(row.question_id);
  if (!questionId) return null;

  return {
    question_id: questionId,
    is_correct: Boolean(row.is_correct),
    answered_at: row.answered_at ?? row.created_at ?? null,
  };
};

const getAnsweredAtTime = (value: string | null) => {
  if (!value) return 0;

  const time = new Date(value).getTime();
  return Number.isFinite(time) ? time : 0;
};

const toLocalDateKey = (value: Date | string) => {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("en-CA");
};

export function buildQuestionProgress(
  attempts: AnswerAttempt[]
): Record<QuestionId, QuestionProgress> {
  const progress: Record<QuestionId, QuestionProgress> = {};

  for (const answer of [...attempts].sort(
    (a, b) =>
      getAnsweredAtTime(b.answered_at) - getAnsweredAtTime(a.answered_at)
  )) {
    const existing = progress[answer.question_id];

    if (existing) {
      existing.attempts += 1;
      if (answer.is_correct) {
        existing.correct_attempts += 1;
      } else {
        existing.wrong_attempts += 1;
      }
      continue;
    }

    progress[answer.question_id] = {
      question_id: answer.question_id,
      status: answer.is_correct ? "correct" : "wrong",
      answered_at: answer.answered_at,
      attempts: 1,
      correct_attempts: answer.is_correct ? 1 : 0,
      wrong_attempts: answer.is_correct ? 0 : 1,
    };
  }

  return progress;
}

export async function getAnswerAttempts(
  userId: string
): Promise<AnswerAttempt[]> {
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
    () =>
      supabase
        .from("user_answers")
        .select("question_id, is_correct")
        .eq("user_id", userId),
  ];

  let lastError: unknown = null;

  for (const runQuery of queries) {
    const { data, error } = await runQuery();
    if (error) {
      lastError = error;
      continue;
    }

    return (data as AnswerAttemptRow[] | null)
      ?.map(normalizeAnswerAttempt)
      .filter(Boolean) as AnswerAttempt[];
  }

  if (lastError) {
    console.error("Error loading answer attempts:", lastError);
  }

  return [];
}

export function buildAnswerStatuses(
  attempts: AnswerAttempt[]
): Record<QuestionId, "correct" | "wrong"> {
  return Object.values(buildQuestionProgress(attempts)).reduce<
    Record<QuestionId, "correct" | "wrong">
  >((statuses, item) => {
    statuses[item.question_id] = item.status;
    return statuses;
  }, {});
}

export function getSolvedQuestionIdsFromAttempts(
  attempts: AnswerAttempt[]
): QuestionId[] {
  return Object.values(buildQuestionProgress(attempts))
    .filter(item => item.status === "correct")
    .map(item => item.question_id);
}

export function getAttemptedQuestionIdsFromAttempts(
  attempts: AnswerAttempt[]
): QuestionId[] {
  return Object.keys(buildQuestionProgress(attempts));
}

export function countCurrentStreak(
  attempts: AnswerAttempt[],
  now: Date = new Date()
) {
  const activeDays = new Set(
    attempts
      .map(attempt =>
        attempt.answered_at ? toLocalDateKey(attempt.answered_at) : null
      )
      .filter((value): value is string => Boolean(value))
  );

  if (activeDays.size === 0) return 0;

  const todayKey = toLocalDateKey(now);
  if (!todayKey) return 0;

  const cursor = new Date(now);
  if (!activeDays.has(todayKey)) {
    cursor.setDate(cursor.getDate() - 1);
    const yesterdayKey = toLocalDateKey(cursor);
    if (!yesterdayKey || !activeDays.has(yesterdayKey)) {
      return 0;
    }
  }

  let streak = 0;

  while (true) {
    const dateKey = toLocalDateKey(cursor);
    if (!dateKey || !activeDays.has(dateKey)) break;

    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

// Save a question answer to Supabase
export async function saveAnswer(
  userId: string,
  questionId: string | number,
  isCorrect: boolean,
  selectedOption: number,
  timeTaken: number = 0
) {
  const { error } = await supabase.from("user_answers").insert({
    user_id: userId,
    question_id: toQuestionId(questionId),
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
export async function toggleBookmark(
  userId: string,
  questionId: string | number
) {
  const normalizedQuestionId = toQuestionId(questionId);

  // Check if already bookmarked
  const { data } = await supabase
    .from("bookmarks")
    .select("id")
    .eq("user_id", userId)
    .eq("question_id", normalizedQuestionId)
    .single();

  if (data) {
    // Remove bookmark
    await supabase
      .from("bookmarks")
      .delete()
      .eq("user_id", userId)
      .eq("question_id", normalizedQuestionId);
    return false;
  } else {
    // Add bookmark
    await supabase
      .from("bookmarks")
      .insert({ user_id: userId, question_id: normalizedQuestionId });
    return true;
  }
}

// Get user's bookmarked question IDs
export async function getBookmarks(userId: string): Promise<QuestionId[]> {
  const { data, error } = await supabase
    .from("bookmarks")
    .select("question_id")
    .eq("user_id", userId);

  if (error) {
    console.error("Error loading bookmarks:", error);
    return [];
  }

  return (
    data?.map(bookmark => toQuestionId(bookmark.question_id)).filter(Boolean) ??
    []
  );
}

// Get user's solved question IDs
export async function getSolvedQuestions(
  userId: string
): Promise<QuestionId[]> {
  const attempts = await getAnswerAttempts(userId);
  return Array.from(new Set(getSolvedQuestionIdsFromAttempts(attempts)));
}

export async function getAnswerStatuses(
  userId: string
): Promise<Record<QuestionId, "correct" | "wrong">> {
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
  const correct = data.filter(a => a.is_correct).length;
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;

  await supabase
    .from("profiles")
    .update({
      total_solved: total,
      accuracy,
    })
    .eq("id", userId);
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

  await supabase
    .from("profiles")
    .update({
      streak: newStreak,
      max_streak: newMaxStreak,
      last_active: today,
    })
    .eq("id", userId);
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
