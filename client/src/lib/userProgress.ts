import { supabase } from "./supabase";

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
  const { data } = await supabase
    .from("bookmarks")
    .select("question_id")
    .eq("user_id", userId);
  return data?.map((b) => b.question_id) ?? [];
}

// Get user's solved question IDs
export async function getSolvedQuestions(userId: string): Promise<number[]> {
  const { data } = await supabase
    .from("user_answers")
    .select("question_id")
    .eq("user_id", userId);
  return [...new Set(data?.map((a) => a.question_id) ?? [])];
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