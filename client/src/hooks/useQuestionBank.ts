import { useEffect, useState } from "react";

import { questions as fallbackQuestions, type Question } from "@/data/questions";
import { mergeQuestionBanks } from "@/lib/questionIdentity";
import { fetchQuestions } from "@/lib/questionsDB";

export function useQuestionBank() {
  const [questions, setQuestions] = useState<Question[]>(fallbackQuestions);
  const [loading, setLoading] = useState(fallbackQuestions.length === 0);
  const [syncing, setSyncing] = useState(true);
  const [hasLiveData, setHasLiveData] = useState(false);

  useEffect(() => {
    let cancelled = false;

    setSyncing(true);

    fetchQuestions()
      .then((records) => {
        if (cancelled) return;

        if (records.length > 0) {
          setQuestions(mergeQuestionBanks(records));
          setHasLiveData(true);
        } else {
          setQuestions(fallbackQuestions);
          setHasLiveData(false);
        }
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
        setSyncing(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { questions, loading, syncing, hasLiveData };
}
