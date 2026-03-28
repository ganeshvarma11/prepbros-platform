import { useEffect, useMemo, useState } from "react";
import {
  Bookmark,
  BookmarkCheck,
  Check,
  ChevronLeft,
  ChevronRight,
  Flag,
  Loader2,
  Search,
  Shuffle,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { useLocation } from "wouter";

import AppShell from "@/components/AppShell";
import { PageEmpty, PracticeTableSkeleton } from "@/components/PageState";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useAuth } from "@/contexts/AuthContext";
import { type Question } from "@/data/questions";
import { useQuestionBank } from "@/hooks/useQuestionBank";
import { trackEvent } from "@/lib/analytics";
import {
  createQuestionIdentityIndex,
  getStoredQuestionId,
  toQuestionId,
  type QuestionId,
} from "@/lib/questionIdentity";
import {
  type AnswerAttempt,
  buildAnswerStatuses,
  getAnswerAttempts,
  getBookmarks,
  saveAnswer,
  toggleBookmark,
} from "@/lib/userProgress";

const EXAMS = ["UPSC", "SSC", "TSPSC", "APPSC", "RRB", "IBPS"];
const DIFFICULTIES = ["Easy", "Medium", "Hard"];
const TYPES = ["PYQ", "Conceptual", "CurrentAffairs", "Mock"];
const PER_PAGE = 15;
const TABLE_COLUMNS = [
  { label: "#", className: "w-[6%]" },
  { label: "Question", className: "w-[39%]" },
  { label: "Exam", className: "w-[11%]" },
  { label: "Topic", className: "w-[18%]" },
  { label: "Difficulty", className: "w-[11%]" },
  { label: "Year", className: "w-[7%]" },
  { label: "Status", className: "w-[8%]" },
];

const panelClassName =
  "rounded-[24px] border border-[rgba(255,255,255,0.07)] bg-[rgba(10,10,12,0.72)]";
const fieldClassName =
  "w-full rounded-[14px] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] px-3.5 py-2.5 text-sm text-[var(--text-primary)] outline-none transition placeholder:text-[var(--text-faint)] focus:border-[rgba(255,255,255,0.18)]";

function getExamPillClass(exam: string) {
  switch (exam) {
    case "UPSC":
      return "border-[rgba(116,135,255,0.24)] bg-[rgba(116,135,255,0.1)] text-[#b9c4ff]";
    case "SSC":
      return "border-[rgba(160,174,192,0.2)] bg-[rgba(160,174,192,0.08)] text-[#d5dbe5]";
    case "TSPSC":
      return "border-[rgba(88,195,255,0.24)] bg-[rgba(88,195,255,0.09)] text-[#8fddff]";
    case "APPSC":
      return "border-[rgba(140,191,117,0.24)] bg-[rgba(140,191,117,0.1)] text-[#b9d8ac]";
    case "RRB":
      return "border-[rgba(199,149,255,0.22)] bg-[rgba(199,149,255,0.09)] text-[#dcc0ff]";
    case "IBPS":
      return "border-[rgba(99,225,194,0.22)] bg-[rgba(99,225,194,0.08)] text-[#9cecd7]";
    default:
      return "border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.04)] text-[var(--text-secondary)]";
  }
}

function getDifficultyPillClass(difficulty: string) {
  switch (difficulty) {
    case "Easy":
      return "border-[rgba(71,194,125,0.2)] bg-[rgba(71,194,125,0.1)] text-[#7fdb9e]";
    case "Medium":
      return "border-[rgba(148,163,184,0.2)] bg-[rgba(148,163,184,0.09)] text-[#d7dee7]";
    case "Hard":
      return "border-[rgba(255,116,116,0.22)] bg-[rgba(255,116,116,0.08)] text-[#ff9a9a]";
    default:
      return "border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.04)] text-[var(--text-secondary)]";
  }
}

function getStatusPill(status?: "correct" | "wrong") {
  if (status === "correct") {
    return {
      label: "Solved",
      className:
        "border-[rgba(71,194,125,0.2)] bg-[rgba(71,194,125,0.1)] text-[#7fdb9e]",
      icon: <Check size={12} />,
    };
  }

  if (status === "wrong") {
    return {
      label: "Retry",
      className:
        "border-[rgba(255,116,116,0.22)] bg-[rgba(255,116,116,0.08)] text-[#ff9a9a]",
      icon: <X size={12} />,
    };
  }

  return {
    label: "New",
    className:
      "border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] text-[var(--text-muted)]",
    icon: null,
  };
}

function formatQuestionForDisplay(question: string) {
  return question
    .replace(/[ \t]+/g, " ")
    .trim()
    .replace(/:\s*(?=1\.\s)/g, ":\n")
    .replace(/\s(?=\d+\.\s)/g, "\n")
    .replace(
      /([.?!])\s+(?=(Which|What|How|Select|Choose|In the context|With reference|Arrange|Match|Identify)\b)/g,
      "$1\n"
    );
}

export default function Practice() {
  const [, navigate] = useLocation();
  const { user, loading: authLoading } = useAuth();
  const {
    questions,
    loading: questionsLoading,
    syncing: questionsSyncing,
  } = useQuestionBank();

  const [search, setSearch] = useState("");
  const [selExams, setSelExams] = useState<string[]>([]);
  const [selDiff, setSelDiff] = useState<string>("");
  const [selTypes, setSelTypes] = useState<string[]>([]);
  const [selTopics, setSelTopics] = useState<string[]>([]);
  const [selYears, setSelYears] = useState<number[]>([]);
  const [reviewMode, setReviewMode] = useState<
    "" | "bookmarked" | "solved" | "wrong"
  >("");
  const [sortBy, setSortBy] = useState<"default" | "difficulty" | "year">(
    "default"
  );
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [activeQ, setActiveQ] = useState<Question | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [rawBookmarks, setRawBookmarks] = useState<QuestionId[]>([]);
  const [rawAttempts, setRawAttempts] = useState<AnswerAttempt[]>([]);
  const [answerStart, setAnswerStart] = useState<number>(Date.now());
  const [queryHydrated, setQueryHydrated] = useState(false);
  const [pendingQuestionId, setPendingQuestionId] = useState<string | null>(
    null
  );
  const [progressLoading, setProgressLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const getList = (key: string, fallbackKey?: string) => {
      const raw =
        params.get(key) || (fallbackKey ? params.get(fallbackKey) : "") || "";
      return raw
        .split(",")
        .map(item => item.trim())
        .filter(Boolean);
    };

    setSearch(params.get("search") || "");
    setSelExams(getList("exams", "exam"));
    setSelDiff(params.get("difficulty") || "");
    setSelTypes(getList("types", "type"));
    setSelTopics(getList("topics", "topic"));
    setSelYears(
      getList("years", "year")
        .map(value => Number.parseInt(value, 10))
        .filter(value => Number.isFinite(value))
    );
    setSortBy(
      (params.get("sort") as "default" | "difficulty" | "year") || "default"
    );
    const questionId = params.get("question")?.trim() || "";
    setPendingQuestionId(questionId || null);
    if (params.get("bookmarked") === "1") {
      setReviewMode("bookmarked");
    } else if (params.get("solved") === "1") {
      setReviewMode("solved");
    } else if (params.get("incorrect") === "1") {
      setReviewMode("wrong");
    } else {
      setReviewMode("");
    }
    setQueryHydrated(true);
  }, []);

  useEffect(() => {
    let cancelled = false;

    if (authLoading) {
      return () => {
        cancelled = true;
      };
    }

    if (!user) {
      setRawBookmarks([]);
      setRawAttempts([]);
      setProgressLoading(false);
      return () => {
        cancelled = true;
      };
    }

    const loadProgress = async () => {
      setProgressLoading(true);
      const [bookmarkIds, attempts] = await Promise.all([
        getBookmarks(user.id),
        getAnswerAttempts(user.id),
      ]);

      if (cancelled) return;

      setRawBookmarks(bookmarkIds);
      setRawAttempts(attempts);
      setProgressLoading(false);
    };

    loadProgress();

    return () => {
      cancelled = true;
    };
  }, [authLoading, user]);

  const questionIdentity = useMemo(
    () => createQuestionIdentityIndex(questions),
    [questions]
  );
  const resolveStoredQuestionId = (rawId: QuestionId) =>
    questionIdentity.resolveQuestionId(rawId);
  const progressSyncing =
    Boolean(user) && (questionsSyncing || progressLoading);

  const bookmarks = useMemo(() => {
    const mapped = rawBookmarks
      .map(resolveStoredQuestionId)
      .filter((questionId): questionId is string => Boolean(questionId));

    return Array.from(new Set(mapped));
  }, [rawBookmarks, questionIdentity]);

  const answerStatuses = useMemo(() => {
    const mappedAttempts = rawAttempts
      .map(attempt => {
        const questionId = resolveStoredQuestionId(attempt.question_id);
        if (!questionId) return null;

        return {
          ...attempt,
          question_id: questionId,
        };
      })
      .filter((attempt): attempt is AnswerAttempt => Boolean(attempt));

    return buildAnswerStatuses(mappedAttempts);
  }, [rawAttempts, questionIdentity]);

  const solvedIds = useMemo(
    () =>
      Object.entries(answerStatuses)
        .filter(([, status]) => status === "correct")
        .map(([questionId]) => questionId),
    [answerStatuses]
  );
  const solvedSet = useMemo(() => new Set(solvedIds), [solvedIds]);
  const bookmarkSet = useMemo(() => new Set(bookmarks), [bookmarks]);
  const allTopics = useMemo(
    () => Array.from(new Set(questions.map(question => question.topic))).sort(),
    [questions]
  );
  const allYears = useMemo(
    () =>
      Array.from(
        new Set(
          questions
            .filter(question => question.year)
            .map(question => question.year as number)
        )
      ).sort((a, b) => b - a),
    [questions]
  );

  const filtered = useMemo(() => {
    let current = [...questions];

    if (search) {
      current = current.filter(
        item =>
          item.question.toLowerCase().includes(search.toLowerCase()) ||
          item.topic.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (selExams.length)
      current = current.filter(item => selExams.includes(item.exam));
    if (selDiff) current = current.filter(item => item.difficulty === selDiff);
    if (selTypes.length)
      current = current.filter(item => selTypes.includes(item.type));
    if (selTopics.length)
      current = current.filter(item => selTopics.includes(item.topic));
    if (selYears.length)
      current = current.filter(
        item => item.year !== null && selYears.includes(item.year)
      );
    if (reviewMode === "bookmarked") {
      current = current.filter(item => bookmarkSet.has(toQuestionId(item.id)));
    }
    if (reviewMode === "solved") {
      current = current.filter(item => solvedSet.has(toQuestionId(item.id)));
    }
    if (reviewMode === "wrong") {
      current = current.filter(
        item => answerStatuses[toQuestionId(item.id)] === "wrong"
      );
    }
    if (sortBy === "difficulty") {
      current.sort(
        (a, b) =>
          ["Easy", "Medium", "Hard"].indexOf(a.difficulty) -
          ["Easy", "Medium", "Hard"].indexOf(b.difficulty)
      );
    }
    if (sortBy === "year") {
      current.sort((a, b) => (b.year ?? 0) - (a.year ?? 0));
    }
    return current;
  }, [
    answerStatuses,
    bookmarkSet,
    questions,
    reviewMode,
    search,
    selDiff,
    selExams,
    selTopics,
    selTypes,
    selYears,
    solvedSet,
    sortBy,
  ]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const reviewModeSyncing = progressSyncing && Boolean(reviewMode);
  const activeIdx = activeQ
    ? filtered.findIndex(
        question => toQuestionId(question.id) === toQuestionId(activeQ.id)
      )
    : -1;
  const formattedActiveQuestion = activeQ
    ? formatQuestionForDisplay(activeQ.question)
    : "";
  const filterCount =
    selExams.length +
    (selDiff ? 1 : 0) +
    selTypes.length +
    selTopics.length +
    selYears.length +
    (reviewMode ? 1 : 0) +
    (sortBy !== "default" ? 1 : 0);

  const examCounts = useMemo(
    () =>
      EXAMS.reduce<Record<string, number>>((acc, exam) => {
        acc[exam] = questions.filter(question => question.exam === exam).length;
        return acc;
      }, {}),
    [questions]
  );

  useEffect(() => {
    setPage(current => Math.min(current, totalPages));
  }, [totalPages]);

  useEffect(() => {
    if (!queryHydrated) return;

    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (selExams.length) params.set("exams", selExams.join(","));
    if (selDiff) params.set("difficulty", selDiff);
    if (selTypes.length) params.set("types", selTypes.join(","));
    if (selTopics.length) params.set("topics", selTopics.join(","));
    if (selYears.length) params.set("years", selYears.join(","));
    if (reviewMode === "bookmarked") params.set("bookmarked", "1");
    if (reviewMode === "solved") params.set("solved", "1");
    if (reviewMode === "wrong") params.set("incorrect", "1");
    if (sortBy !== "default") params.set("sort", sortBy);
    if (pendingQuestionId) params.set("question", String(pendingQuestionId));

    const query = params.toString();
    window.history.replaceState(
      {},
      "",
      query ? `/practice?${query}` : "/practice"
    );
  }, [
    pendingQuestionId,
    queryHydrated,
    reviewMode,
    search,
    selDiff,
    selExams,
    selTopics,
    selTypes,
    selYears,
    sortBy,
  ]);

  useEffect(() => {
    if (
      questionsSyncing ||
      questions.length === 0 ||
      pendingQuestionId === null
    )
      return;

    const match = questions.find(
      question => toQuestionId(question.id) === pendingQuestionId
    );
    if (!match) return;

    setActiveQ(match);
    setSelected(null);
    setAnswerStart(Date.now());
    setPendingQuestionId(null);
  }, [pendingQuestionId, questions, questionsSyncing]);

  const toggle = <T,>(arr: T[], setArr: (value: T[]) => void, value: T) => {
    setArr(
      arr.includes(value) ? arr.filter(item => item !== value) : [...arr, value]
    );
  };

  const closeQuestion = () => {
    setActiveQ(null);
    setSelected(null);
  };

  const clearAll = () => {
    setSearch("");
    setSelExams([]);
    setSelDiff("");
    setSelTypes([]);
    setSelTopics([]);
    setSelYears([]);
    setReviewMode("");
    setSortBy("default");
    setPage(1);
  };

  const openRandom = () => {
    const pool = filtered.length > 0 ? filtered : questions;
    const random = pool[Math.floor(Math.random() * pool.length)];
    if (random) {
      setActiveQ(random);
      setSelected(null);
      setAnswerStart(Date.now());
    }
  };

  const openQuestion = (question: Question) => {
    setActiveQ(question);
    setSelected(null);
    setAnswerStart(Date.now());
  };

  const handleAnswer = (index: number) => {
    if (selected !== null || !activeQ) return;
    if (user && questionsSyncing) return;

    const isCorrect = index === activeQ.correct;
    const questionId = getStoredQuestionId(activeQ);

    setSelected(index);
    setRawAttempts(current => [
      {
        question_id: questionId,
        is_correct: isCorrect,
        answered_at: new Date().toISOString(),
      },
      ...current,
    ]);

    trackEvent("practice_answered", {
      exam: activeQ.exam,
      topic: activeQ.topic,
      correct: isCorrect,
    });

    if (user) {
      const timeTaken = Math.round((Date.now() - answerStart) / 1000);
      saveAnswer(user.id, questionId, isCorrect, index, timeTaken);
    }
  };

  const handleBookmark = () => {
    if (!activeQ) return;
    if (user && questionsSyncing) return;

    const questionId = getStoredQuestionId(activeQ);

    if (user) {
      toggleBookmark(user.id, questionId).then(isBookmarked => {
        trackEvent("bookmark_toggled", {
          question_id: activeQ.id,
          bookmarked: isBookmarked,
        });
        setRawBookmarks(current =>
          isBookmarked
            ? Array.from(new Set([...current, questionId]))
            : current.filter(item => item !== questionId)
        );
      });
      return;
    }

    setRawBookmarks(current =>
      current.includes(questionId)
        ? current.filter(item => item !== questionId)
        : [...current, questionId]
    );
  };

  const handleReportQuestion = () => {
    if (!activeQ) return;

    const params = new URLSearchParams({
      category: "Question issue",
      subject: `Practice question report: ${activeQ.topic}`,
      message: `Please review this question.\n\nQuestion ID: ${toQuestionId(activeQ.id)}\nExam: ${activeQ.exam}\nTopic: ${activeQ.topic}\nQuestion: ${activeQ.question}`,
    });

    navigate(`/support?${params.toString()}`);
  };

  const reviewOptions = [
    { value: "", label: "All questions" },
    { value: "bookmarked", label: "Bookmarked" },
    { value: "solved", label: "Solved" },
    { value: "wrong", label: "Incorrect" },
  ] as const;

  const activeFilterPills = [
    ...selExams.map(item => ({ key: `exam-${item}`, label: item })),
    ...(selDiff ? [{ key: `difficulty-${selDiff}`, label: selDiff }] : []),
    ...selTypes.map(item => ({ key: `type-${item}`, label: item })),
    ...selTopics.map(item => ({ key: `topic-${item}`, label: item })),
    ...selYears.map(item => ({ key: `year-${item}`, label: String(item) })),
    ...(reviewMode
      ? [
          {
            key: `review-${reviewMode}`,
            label:
              reviewOptions.find(item => item.value === reviewMode)?.label ||
              reviewMode,
          },
        ]
      : []),
    ...(sortBy !== "default"
      ? [
          {
            key: `sort-${sortBy}`,
            label:
              sortBy === "year" ? "Sorted by year" : "Sorted by difficulty",
          },
        ]
      : []),
  ];

  const questionStateSummary = questionsLoading
    ? "Loading question bank..."
    : reviewModeSyncing
      ? "Syncing your saved progress..."
      : `${filtered.length} questions${!user ? " · sign in to save progress" : ""}`;

  const filterPanel = (
    <div className="flex h-full flex-col bg-[var(--bg-base)] text-[var(--text-primary)]">
      <div className="border-b border-[rgba(255,255,255,0.06)] px-1 pb-5">
        <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-[var(--text-faint)]">
          Filters
        </p>
        <h2 className="mt-2 text-xl font-semibold tracking-[-0.04em] text-[var(--text-primary)]">
          Refine the library
        </h2>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Keep the table clean and pull in only what you want to solve next.
        </p>
        {filterCount > 0 ? (
          <button
            type="button"
            onClick={clearAll}
            className="mt-4 inline-flex h-10 items-center rounded-[12px] border border-[rgba(255,255,255,0.08)] px-4 text-sm font-medium text-[var(--text-primary)] transition hover:border-[rgba(255,255,255,0.14)]"
          >
            Clear all
          </button>
        ) : null}
      </div>

      <div className="space-y-6 overflow-y-auto py-6 pr-1">
        <div>
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-faint)]">
            Sort
          </p>
          <select
            value={sortBy}
            onChange={event => {
              setSortBy(event.target.value as typeof sortBy);
              setPage(1);
            }}
            className={fieldClassName}
          >
            <option value="default">Default order</option>
            <option value="difficulty">Difficulty</option>
            <option value="year">Latest year</option>
          </select>
        </div>

        <div>
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-faint)]">
            Review
          </p>
          <div className="grid grid-cols-2 gap-2">
            {reviewOptions.map(item => (
              <button
                key={item.label}
                type="button"
                onClick={() => {
                  setReviewMode(item.value);
                  setPage(1);
                }}
                className={`rounded-[12px] border px-3 py-2.5 text-left text-sm transition ${
                  reviewMode === item.value
                    ? "border-[rgba(255,255,255,0.18)] bg-[rgba(255,255,255,0.07)] text-[var(--text-primary)]"
                    : "border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-faint)]">
            Exam
          </p>
          <div className="space-y-2">
            {EXAMS.map(exam => (
              <label
                key={exam}
                className="flex cursor-pointer items-center gap-3 rounded-[12px] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.02)] px-3 py-2.5 text-sm text-[var(--text-secondary)] transition hover:border-[rgba(255,255,255,0.1)]"
              >
                <input
                  type="checkbox"
                  checked={selExams.includes(exam)}
                  onChange={() => {
                    toggle(selExams, setSelExams, exam);
                    setPage(1);
                  }}
                  className="h-4 w-4 rounded border-[rgba(255,255,255,0.14)] bg-transparent"
                />
                <span>{exam}</span>
                <span className="ml-auto text-xs text-[var(--text-faint)]">
                  {examCounts[exam] || 0}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-faint)]">
            Difficulty
          </p>
          <div className="flex flex-wrap gap-2">
            {["All", ...DIFFICULTIES].map(difficulty => {
              const value = difficulty === "All" ? "" : difficulty;
              return (
                <button
                  key={difficulty}
                  type="button"
                  onClick={() => {
                    setSelDiff(value);
                    setPage(1);
                  }}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                    selDiff === value
                      ? "border-[rgba(255,255,255,0.18)] bg-[rgba(255,255,255,0.07)] text-[var(--text-primary)]"
                      : "border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] text-[var(--text-secondary)]"
                  }`}
                >
                  {difficulty}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-faint)]">
            Type
          </p>
          <div className="space-y-2">
            {TYPES.map(type => (
              <label
                key={type}
                className="flex cursor-pointer items-center gap-3 rounded-[12px] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.02)] px-3 py-2.5 text-sm text-[var(--text-secondary)] transition hover:border-[rgba(255,255,255,0.1)]"
              >
                <input
                  type="checkbox"
                  checked={selTypes.includes(type)}
                  onChange={() => {
                    toggle(selTypes, setSelTypes, type);
                    setPage(1);
                  }}
                  className="h-4 w-4 rounded border-[rgba(255,255,255,0.14)] bg-transparent"
                />
                <span>{type}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-faint)]">
            Topic
          </p>
          <div className="max-h-56 space-y-2 overflow-y-auto pr-1">
            {allTopics.map(topic => (
              <label
                key={topic}
                className="flex cursor-pointer items-center gap-3 rounded-[12px] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.02)] px-3 py-2.5 text-sm text-[var(--text-secondary)] transition hover:border-[rgba(255,255,255,0.1)]"
              >
                <input
                  type="checkbox"
                  checked={selTopics.includes(topic)}
                  onChange={() => {
                    toggle(selTopics, setSelTopics, topic);
                    setPage(1);
                  }}
                  className="h-4 w-4 rounded border-[rgba(255,255,255,0.14)] bg-transparent"
                />
                <span className="line-clamp-1">{topic}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-faint)]">
            Year
          </p>
          <div className="max-h-40 space-y-2 overflow-y-auto pr-1">
            {allYears.map(year => (
              <label
                key={year}
                className="flex cursor-pointer items-center gap-3 rounded-[12px] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.02)] px-3 py-2.5 text-sm text-[var(--text-secondary)] transition hover:border-[rgba(255,255,255,0.1)]"
              >
                <input
                  type="checkbox"
                  checked={selYears.includes(year)}
                  onChange={() => {
                    toggle(selYears, setSelYears, year);
                    setPage(1);
                  }}
                  className="h-4 w-4 rounded border-[rgba(255,255,255,0.14)] bg-transparent"
                />
                <span>{year}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <AppShell>
      <div className="space-y-6">
        {!activeQ ? (
          <>
            <div className="min-w-0 space-y-5">
              <section className="space-y-4">
                <div className="space-y-2">
                  <p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-[var(--text-faint)]">
                    Practice
                  </p>
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                      <h1 className="text-[2rem] font-semibold tracking-[-0.06em] text-[var(--text-primary)] md:text-[2.35rem]">
                        Question Library
                      </h1>
                      <p className="mt-2 max-w-2xl text-sm text-[var(--text-secondary)]">
                        A fast, distraction-free list built for finding the next
                        question and getting straight to work.
                      </p>
                    </div>
                    <p className="text-sm text-[var(--text-faint)]">
                      {questionStateSummary}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <div className="relative min-w-0 flex-1">
                    <Search
                      size={16}
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-faint)]"
                    />
                    <input
                      value={search}
                      onChange={event => {
                        setSearch(event.target.value);
                        setPage(1);
                      }}
                      placeholder="Search questions"
                      className={`${fieldClassName} h-12 pl-11`}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowFilters(true)}
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-[14px] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] px-4 text-sm font-medium text-[var(--text-primary)] transition hover:border-[rgba(255,255,255,0.14)]"
                  >
                    <SlidersHorizontal size={16} />
                    Filters
                    {filterCount > 0 ? (
                      <span className="rounded-full border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.04)] px-2 py-0.5 text-[11px] text-[var(--text-secondary)]">
                        {filterCount}
                      </span>
                    ) : null}
                  </button>
                </div>
              </section>

              <section className={panelClassName}>
                <div className="flex flex-col gap-4 border-b border-[rgba(255,255,255,0.06)] px-5 py-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-[rgba(255,255,255,0.55)]" />
                    <p className="text-sm text-[var(--text-secondary)]">
                      {questionsLoading
                        ? "Preparing the question table."
                        : reviewModeSyncing
                          ? "Restoring your saved progress."
                          : `Showing ${(page - 1) * PER_PAGE + 1}-${Math.min(page * PER_PAGE, filtered.length)} of ${filtered.length}`}
                    </p>
                  </div>
                  {filterCount > 0 ? (
                    <button
                      type="button"
                      onClick={clearAll}
                      className="inline-flex h-9 items-center rounded-[12px] border border-[rgba(255,255,255,0.08)] px-3 text-sm text-[var(--text-secondary)] transition hover:text-[var(--text-primary)]"
                    >
                      Clear filters
                    </button>
                  ) : null}
                </div>

                {activeFilterPills.length > 0 ? (
                  <div className="flex flex-wrap gap-2 border-b border-[rgba(255,255,255,0.06)] px-5 py-3">
                    {activeFilterPills.map(item => (
                      <span
                        key={item.key}
                        className="rounded-full border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] px-3 py-1 text-[11px] font-medium text-[var(--text-secondary)]"
                      >
                        {item.label}
                      </span>
                    ))}
                  </div>
                ) : null}

                {questionsLoading ? (
                  <PracticeTableSkeleton rows={10} />
                ) : reviewModeSyncing ? (
                  <div className="flex min-h-[420px] items-center justify-center px-6 py-10">
                    <div className="inline-flex items-center gap-3 rounded-full border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] px-5 py-3 text-sm text-[var(--text-secondary)]">
                      <Loader2
                        size={16}
                        className="animate-spin text-[var(--text-muted)]"
                      />
                      Restoring saved progress...
                    </div>
                  </div>
                ) : paginated.length === 0 ? (
                  <div className="min-h-[360px] px-4 py-8">
                    <PageEmpty
                      title="No questions match those filters"
                      description="Clear a few filters to widen the list and get back into solving mode."
                    >
                      <button
                        type="button"
                        onClick={clearAll}
                        className="btn-primary mt-2 px-4 py-2.5 text-sm"
                      >
                        Clear filters
                      </button>
                    </PageEmpty>
                  </div>
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <table className="min-w-[900px] w-full table-fixed border-collapse">
                        <thead>
                          <tr className="border-b border-[rgba(255,255,255,0.06)]">
                            {TABLE_COLUMNS.map(column => (
                              <th
                                key={column.label}
                                className={`px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--text-faint)] ${column.className}`}
                              >
                                {column.label}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {paginated.map((question, index) => {
                            const rowNumber = (page - 1) * PER_PAGE + index + 1;
                            const status =
                              answerStatuses[toQuestionId(question.id)];
                            const statusPill = getStatusPill(status);

                            return (
                              <tr
                                key={question.id}
                                onClick={() => openQuestion(question)}
                                className="cursor-pointer border-b border-[rgba(255,255,255,0.05)] transition hover:bg-[rgba(255,255,255,0.03)]"
                              >
                                <td className="px-5 py-4 align-middle text-sm text-[var(--text-muted)]">
                                  {rowNumber}
                                </td>
                                <td className="px-5 py-4 align-middle">
                                  <p className="line-clamp-2 text-sm font-medium leading-6 text-[var(--text-primary)]">
                                    {question.question}
                                  </p>
                                </td>
                                <td className="px-5 py-4 align-middle">
                                  <span
                                    className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-medium ${getExamPillClass(question.exam)}`}
                                  >
                                    {question.exam}
                                  </span>
                                </td>
                                <td className="px-5 py-4 align-middle text-sm text-[var(--text-secondary)]">
                                  <span className="line-clamp-1 block">
                                    {question.topic}
                                  </span>
                                </td>
                                <td className="px-5 py-4 align-middle">
                                  <span
                                    className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-medium ${getDifficultyPillClass(question.difficulty)}`}
                                  >
                                    {question.difficulty}
                                  </span>
                                </td>
                                <td className="px-5 py-4 align-middle text-sm text-[var(--text-secondary)]">
                                  {question.year ?? "—"}
                                </td>
                                <td className="px-5 py-4 align-middle">
                                  {progressSyncing ? (
                                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] text-[var(--text-muted)]">
                                      <Loader2
                                        size={12}
                                        className="animate-spin"
                                      />
                                    </span>
                                  ) : (
                                    <span
                                      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium ${statusPill.className}`}
                                    >
                                      {statusPill.icon}
                                      {statusPill.label}
                                    </span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {totalPages > 1 ? (
                      <div className="flex flex-col gap-3 px-5 py-4 md:flex-row md:items-center md:justify-between">
                        <p className="text-sm text-[var(--text-secondary)]">
                          {(page - 1) * PER_PAGE + 1}-
                          {Math.min(page * PER_PAGE, filtered.length)} of{" "}
                          {filtered.length}
                        </p>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              setPage(current => Math.max(1, current - 1))
                            }
                            disabled={page === 1}
                            className="inline-flex h-10 w-10 items-center justify-center rounded-[12px] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] text-[var(--text-primary)] transition disabled:opacity-40"
                          >
                            <ChevronLeft size={14} />
                          </button>
                          {Array.from(
                            { length: Math.min(5, totalPages) },
                            (_, index) => {
                              const currentPage =
                                page <= 3 ? index + 1 : page + index - 2;
                              if (currentPage < 1 || currentPage > totalPages)
                                return null;
                              const isActive = currentPage === page;

                              return (
                                <button
                                  key={currentPage}
                                  type="button"
                                  onClick={() => setPage(currentPage)}
                                  className={
                                    isActive
                                      ? "inline-flex h-10 min-w-10 items-center justify-center rounded-[12px] border border-[rgba(255,255,255,0.16)] bg-[rgba(255,255,255,0.08)] px-3 text-sm font-medium text-[var(--text-primary)]"
                                      : "inline-flex h-10 min-w-10 items-center justify-center rounded-[12px] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] px-3 text-sm font-medium text-[var(--text-secondary)] transition hover:text-[var(--text-primary)]"
                                  }
                                >
                                  {currentPage}
                                </button>
                              );
                            }
                          )}
                          <button
                            type="button"
                            onClick={() =>
                              setPage(current =>
                                Math.min(totalPages, current + 1)
                              )
                            }
                            disabled={page === totalPages}
                            className="inline-flex h-10 w-10 items-center justify-center rounded-[12px] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] text-[var(--text-primary)] transition disabled:opacity-40"
                          >
                            <ChevronRight size={14} />
                          </button>
                        </div>
                      </div>
                    ) : null}
                  </>
                )}
              </section>
            </div>

            <Sheet open={showFilters} onOpenChange={setShowFilters}>
              <SheetContent
                side="right"
                className="w-[92vw] max-w-[380px] border-l border-[rgba(255,255,255,0.08)] bg-[var(--bg-base)] p-5 text-[var(--text-primary)]"
              >
                {filterPanel}
              </SheetContent>
            </Sheet>
          </>
        ) : (
          <section className={`${panelClassName} p-5 md:p-6`}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={closeQuestion}
                className="inline-flex h-10 items-center gap-2 rounded-[12px] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] px-4 text-sm font-medium text-[var(--text-primary)] transition hover:border-[rgba(255,255,255,0.14)]"
              >
                <ChevronLeft size={14} />
                Back to library
              </button>

              <div className="flex items-center gap-2">
                <span className="text-xs font-medium uppercase tracking-[0.16em] text-[var(--text-faint)]">
                  {activeIdx + 1} of {filtered.length}
                </span>
                <button
                  type="button"
                  onClick={handleBookmark}
                  disabled={Boolean(user) && questionsSyncing}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-[10px] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] text-[var(--text-primary)]"
                >
                  {Boolean(user) && questionsSyncing ? (
                    <Loader2
                      size={14}
                      className="animate-spin text-[var(--text-muted)]"
                    />
                  ) : bookmarkSet.has(toQuestionId(activeQ.id)) ? (
                    <BookmarkCheck size={14} className="text-[var(--brand)]" />
                  ) : (
                    <Bookmark size={14} />
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleReportQuestion}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-[10px] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] text-[var(--text-primary)]"
                >
                  <Flag size={14} />
                </button>
                <button
                  type="button"
                  onClick={closeQuestion}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-[10px] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] text-[var(--text-primary)]"
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <span
                className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-medium ${getExamPillClass(activeQ.exam)}`}
              >
                {activeQ.exam}
              </span>
              <span
                className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-medium ${getDifficultyPillClass(activeQ.difficulty)}`}
              >
                {activeQ.difficulty}
              </span>
              <span className="inline-flex rounded-full border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] px-2.5 py-1 text-[11px] font-medium text-[var(--text-secondary)]">
                {activeQ.topic}
              </span>
              <span className="inline-flex rounded-full border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] px-2.5 py-1 text-[11px] font-medium text-[var(--text-secondary)]">
                {activeQ.type}
              </span>
              {activeQ.year ? (
                <span className="inline-flex rounded-full border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] px-2.5 py-1 text-[11px] font-medium text-[var(--text-secondary)]">
                  {activeQ.year}
                </span>
              ) : null}
            </div>

            <div className="mt-5 rounded-[24px] border border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.025)] px-5 py-5 md:px-6 md:py-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-faint)]">
                Question
              </p>
              <div className="mt-3 max-w-[52ch] whitespace-pre-line text-[0.98rem] font-medium leading-[1.62] tracking-[-0.012em] text-[var(--text-primary)] md:text-[1.05rem] lg:text-[1.12rem]">
                {formattedActiveQuestion}
              </div>
            </div>

            <div className="mt-6 grid gap-3">
              {activeQ.options.map((option, index) => {
                let optionClass =
                  "option-btn border-[var(--border)] bg-[var(--bg-elevated)]";
                if (selected !== null) {
                  if (index === activeQ.correct)
                    optionClass = "option-btn correct";
                  else if (index === selected) optionClass = "option-btn wrong";
                  else optionClass = "option-btn dimmed";
                }

                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => handleAnswer(index)}
                    disabled={Boolean(user) && questionsSyncing}
                    className={optionClass}
                  >
                    <span className="flex items-start gap-3">
                      <span
                        className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold ${
                          selected !== null && index === activeQ.correct
                            ? "border-[var(--green)] bg-[var(--green)] text-white"
                            : selected !== null && index === selected
                              ? "border-[var(--red)] bg-[var(--red)] text-white"
                              : "border-[var(--border-strong)] text-[var(--text-muted)]"
                        }`}
                      >
                        {["A", "B", "C", "D"][index]}
                      </span>
                      <span className="text-[0.97rem] leading-7 text-[var(--text-primary)] md:text-[1rem]">
                        {option}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>

            {user && questionsSyncing ? (
              <p className="mt-4 text-xs text-[var(--brand)]">
                Syncing the live question bank before answers and bookmarks are
                written to your account.
              </p>
            ) : null}

            {selected !== null ? (
              <div
                className={`mt-6 rounded-[18px] border px-4 py-4 ${
                  selected === activeQ.correct
                    ? "border-[var(--green)]/25 bg-[var(--green-bg)]"
                    : "border-[var(--yellow)]/25 bg-[var(--yellow-bg)]"
                }`}
              >
                <p className="text-sm font-semibold text-[var(--text-primary)]">
                  {selected === activeQ.correct
                    ? "Correct. Keep the rhythm going."
                    : `Not quite. The correct answer is ${activeQ.options[activeQ.correct]}.`}
                </p>
                <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                  {activeQ.explanation}
                </p>
                {!user ? (
                  <p className="mt-3 text-xs text-[var(--brand)]">
                    Sign in to save progress, accuracy, and streaks across
                    sessions.
                  </p>
                ) : questionsSyncing ? (
                  <p className="mt-3 text-xs text-[var(--brand)]">
                    Hold for a moment while PrepBros syncs the live question
                    bank before saving progress.
                  </p>
                ) : null}
              </div>
            ) : null}

            {activeQ.tags.length > 0 ? (
              <div className="mt-5 flex flex-wrap gap-2">
                {activeQ.tags.map(tag => (
                  <span
                    key={tag}
                    className="inline-flex rounded-full border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] px-2.5 py-1 text-[11px] font-medium text-[var(--text-secondary)]"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            ) : null}

            <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border)] pt-5">
              <button
                type="button"
                onClick={() => {
                  if (activeIdx > 0) {
                    setActiveQ(filtered[activeIdx - 1]);
                    setSelected(null);
                    setAnswerStart(Date.now());
                  }
                }}
                disabled={activeIdx === 0}
                className="inline-flex h-10 items-center gap-2 rounded-[12px] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] px-4 text-sm font-medium text-[var(--text-primary)] transition disabled:opacity-40"
              >
                <ChevronLeft size={14} />
                Previous
              </button>
              <button
                type="button"
                onClick={openRandom}
                className="inline-flex h-10 items-center gap-2 rounded-[12px] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] px-4 text-sm font-medium text-[var(--text-primary)] transition hover:border-[rgba(255,255,255,0.14)]"
              >
                <Shuffle size={14} />
                Random
              </button>
              <button
                type="button"
                onClick={() => {
                  if (activeIdx < filtered.length - 1) {
                    setActiveQ(filtered[activeIdx + 1]);
                    setSelected(null);
                    setAnswerStart(Date.now());
                  }
                }}
                disabled={activeIdx === filtered.length - 1}
                className="btn-primary px-4 py-2.5 text-sm disabled:opacity-40"
              >
                Next
                <ChevronRight size={14} />
              </button>
            </div>
          </section>
        )}
      </div>
    </AppShell>
  );
}
