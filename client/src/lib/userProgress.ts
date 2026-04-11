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

type ProfileStatsSnapshot = {
  totalAnswers: number;
  correctAnswers: number;
  streak: number;
  maxStreak: number;
  lastActive: string | null;
};

type ProfileStatsRow = {
  streak?: number | null;
  max_streak?: number | null;
  last_active?: string | null;
};

const profileStatsCache = new Map<string, ProfileStatsSnapshot>();
const profileStatsLoads = new Map<string, Promise<ProfileStatsSnapshot | null>>();
const saveAnswerQueues = new Map<string, Promise<void>>();

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

export function buildNextProfileStats(
  current: ProfileStatsSnapshot,
  {
    incrementCounts = true,
    isCorrect,
    answeredAt,
  }: {
    incrementCounts?: boolean;
    isCorrect: boolean;
    answeredAt: string;
  }
): ProfileStatsSnapshot {
  const answerDay = toLocalDateKey(answeredAt);
  const lastActive = current.lastActive;
  let nextStreak = current.streak;
  let nextMaxStreak = current.maxStreak;

  if (answerDay && lastActive !== answerDay) {
    const previousDay = new Date(`${answerDay}T00:00:00`);
    previousDay.setDate(previousDay.getDate() - 1);
    const yesterdayKey = toLocalDateKey(previousDay);

    nextStreak = lastActive === yesterdayKey ? current.streak + 1 : 1;
    nextMaxStreak = Math.max(nextStreak, current.maxStreak);
  }

  return {
    totalAnswers: current.totalAnswers + (incrementCounts ? 1 : 0),
    correctAnswers: current.correctAnswers + (incrementCounts && isCorrect ? 1 : 0),
    streak: nextStreak,
    maxStreak: nextMaxStreak,
    lastActive: answerDay ?? lastActive,
  };
}

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
  const normalizedQuestionId = toQuestionId(questionId);
  const answeredAt = new Date().toISOString();
  const hadCachedStats = profileStatsCache.has(userId);

  const { error } = await supabase.from("user_answers").insert({
    user_id: userId,
    question_id: normalizedQuestionId,
    is_correct: isCorrect,
    selected_option: selectedOption,
    time_taken: timeTaken,
    answered_at: answeredAt,
  });
  if (error) {
    console.error("Error saving answer:", error);
    return;
  }

  const existingQueue = saveAnswerQueues.get(userId) || Promise.resolve();
  const nextQueue = existingQueue
    .catch(() => {
      // Keep the queue alive after background failures.
    })
    .then(async () => {
      await updateProfileStatsAfterAnswer(userId, {
        countsAlreadyIncludeAnswer: !hadCachedStats,
        isCorrect,
        answeredAt,
      });
    });

  saveAnswerQueues.set(userId, nextQueue);

  try {
    await nextQueue;
  } finally {
    if (saveAnswerQueues.get(userId) === nextQueue) {
      saveAnswerQueues.delete(userId);
    }
  }
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

async function loadProfileStatsSnapshot(
  userId: string
): Promise<ProfileStatsSnapshot | null> {
  const cached = profileStatsCache.get(userId);
  if (cached) {
    return cached;
  }

  const inflight = profileStatsLoads.get(userId);
  if (inflight) {
    return inflight;
  }

  const request = Promise.all([
    supabase
      .from("user_answers")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId),
    supabase
      .from("user_answers")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("is_correct", true),
    supabase
      .from("profiles")
      .select("streak, max_streak, last_active")
      .eq("id", userId)
      .maybeSingle(),
  ])
    .then(([totalAnswersResult, correctAnswersResult, profileResult]) => {
      if (totalAnswersResult.error) {
        console.error("Error loading answer count:", totalAnswersResult.error);
        return null;
      }

      if (correctAnswersResult.error) {
        console.error(
          "Error loading correct answer count:",
          correctAnswersResult.error
        );
        return null;
      }

      if (profileResult.error) {
        console.error("Error loading profile stats:", profileResult.error);
        return null;
      }

      const profile = profileResult.data as ProfileStatsRow | null;
      const snapshot: ProfileStatsSnapshot = {
        totalAnswers: totalAnswersResult.count || 0,
        correctAnswers: correctAnswersResult.count || 0,
        streak: profile?.streak || 0,
        maxStreak: profile?.max_streak || 0,
        lastActive: profile?.last_active || null,
      };

      profileStatsCache.set(userId, snapshot);
      return snapshot;
    })
    .finally(() => {
      profileStatsLoads.delete(userId);
    });

  profileStatsLoads.set(userId, request);
  return request;
}

async function updateProfileStatsAfterAnswer(
  userId: string,
  {
    countsAlreadyIncludeAnswer,
    isCorrect,
    answeredAt,
  }: {
    countsAlreadyIncludeAnswer: boolean;
    isCorrect: boolean;
    answeredAt: string;
  }
) {
  const currentStats = await loadProfileStatsSnapshot(userId);
  if (!currentStats) return;

  const nextStats = buildNextProfileStats(currentStats, {
    incrementCounts: !countsAlreadyIncludeAnswer,
    isCorrect,
    answeredAt,
  });
  const accuracy =
    nextStats.totalAnswers > 0
      ? Math.round((nextStats.correctAnswers / nextStats.totalAnswers) * 100)
      : 0;

  const { error } = await supabase
    .from("profiles")
    .update({
      total_solved: nextStats.totalAnswers,
      accuracy,
      streak: nextStats.streak,
      max_streak: nextStats.maxStreak,
      last_active: nextStats.lastActive,
    })
    .eq("id", userId);

  if (error) {
    console.error("Error updating profile stats:", error);
    profileStatsCache.delete(userId);
    return;
  }

  profileStatsCache.set(userId, nextStats);
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
