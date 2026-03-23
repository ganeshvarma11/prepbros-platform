import { useEffect, useState } from "react";

import { questions as fallbackQuestions, type Question } from "@/data/questions";
import { fetchQuestions } from "@/lib/questionsDB";

export function useQuestionBank() {
  const [questions, setQuestions] = useState<Question[]>(fallbackQuestions);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    fetchQuestions().then((records) => {
      if (cancelled) return;
      setQuestions(records.length > 0 ? records : fallbackQuestions);
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return { questions, loading };
}
