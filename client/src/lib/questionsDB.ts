import { supabase } from "./supabase";
import type { Question, Exam, Difficulty, QuestionType } from "../data/questions";

// Convert DB row to Question format matching existing interface
export function dbRowToQuestion(row: any): Question {
  return {
    id: row.id,
    question: row.question,
    options: [row.option_a, row.option_b, row.option_c, row.option_d],
    correct: row.correct_option,
    explanation: row.explanation,
    exam: row.exam as Exam,
    topic: row.topic,
    subtopic: row.subtopic || "",
    difficulty: row.difficulty as Difficulty,
    type: row.type as QuestionType,
    year: row.year || null,
    tags: row.tags || [],
  };
}

// Fetch all active questions from Supabase
export async function fetchQuestions(): Promise<Question[]> {
  const { data, error } = await supabase
    .from("questions_db")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching questions:", error);
    return [];
  }

  return (data || []).map(dbRowToQuestion);
}