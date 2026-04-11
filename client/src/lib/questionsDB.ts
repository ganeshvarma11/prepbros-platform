import { supabase } from "./supabase";
import type { Question, Exam, Difficulty, QuestionType } from "../data/questions";
import { loadPublicCache } from "./publicCache";

const QUESTIONS_CACHE_KEY = "questions-db:active";
const QUESTIONS_CACHE_TTL_MS = 15 * 60 * 1000;

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
  try {
    return await loadPublicCache({
      key: QUESTIONS_CACHE_KEY,
      ttlMs: QUESTIONS_CACHE_TTL_MS,
      loader: async () => {
        const { data, error } = await supabase
          .from("questions_db")
          .select(
            "id, question, option_a, option_b, option_c, option_d, correct_option, explanation, exam, topic, subtopic, difficulty, type, year, tags, created_at"
          )
          .eq("is_active", true)
          .order("created_at", { ascending: true });

        if (error) {
          throw error;
        }

        return (data || []).map(dbRowToQuestion);
      },
    });
  } catch (error) {
    console.error("Error fetching questions:", error);
    return [];
  }
}
