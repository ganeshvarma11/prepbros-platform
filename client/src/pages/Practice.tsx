import { useEffect, useMemo, useState } from "react";
import {
  Bookmark,
  BookmarkCheck,
  Check,
  ChevronLeft,
  ChevronRight,
  Circle,
  Filter,
  Flag,
  Loader2,
  Search,
  Shuffle,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { Link, useLocation } from "wouter";

import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { useAuth } from "@/contexts/AuthContext";
import { type Question } from "@/data/questions";
import { useQuestionBank } from "@/hooks/useQuestionBank";
import { trackEvent } from "@/lib/analytics";
import { createQuestionIdentityIndex, toQuestionId, type QuestionId } from "@/lib/questionIdentity";
import {
  type AnswerAttempt,
  buildAnswerStatuses,
  getAnswerAttempts,
  getBookmarks,
  saveAnswer,
  toggleBookmark,
} from "@/lib/userProgress";

const EXAM_COLORS: Record<string, string> = {
  UPSC: "exam-upsc",
  SSC: "exam-ssc",
  TSPSC: "exam-tspsc",
  APPSC: "exam-appsc",
  RRB: "exam-rrb",
  IBPS: "exam-ibps",
};

const DIFF_COLORS: Record<string, string> = {
  Easy: "diff-easy",
  Medium: "diff-medium",
  Hard: "diff-hard",
};

const EXAMS = ["UPSC", "SSC", "TSPSC", "APPSC", "RRB", "IBPS"];
const DIFFICULTIES = ["Easy", "Medium", "Hard"];
const TYPES = ["PYQ", "Conceptual", "CurrentAffairs", "Mock"];
const PER_PAGE = 15;
const TABLE_COLUMNS = [
  { label: "#", className: "w-[7%]" },
  { label: "Question", className: "w-[38%]" },
  { label: "Exam", className: "w-[11%]" },
  { label: "Topic", className: "w-[18%]" },
  { label: "Difficulty", className: "w-[12%]" },
  { label: "Year", className: "w-[7%]" },
  { label: "Solved", className: "w-[7%]" },
];

const shellClassName =
  "rounded-[28px] border border-[var(--border)] bg-[var(--bg-card)] shadow-[var(--shadow-lg)]";

const softSurfaceClassName =
  "border border-[var(--border)] bg-[var(--bg-elevated)]";

export default function Practice() {
  const [, navigate] = useLocation();
  const { user, loading: authLoading } = useAuth();
  const { questions, loading: questionsLoading, syncing: questionsSyncing } = useQuestionBank();

  const [search, setSearch] = useState("");
  const [selExams, setSelExams] = useState<string[]>([]);
  const [selDiff, setSelDiff] = useState<string>("");
  const [selTypes, setSelTypes] = useState<string[]>([]);
  const [selTopics, setSelTopics] = useState<string[]>([]);
  const [selYears, setSelYears] = useState<number[]>([]);
  const [reviewMode, setReviewMode] = useState<"" | "bookmarked" | "solved" | "wrong">("");
  const [sortBy, setSortBy] = useState<"default" | "difficulty" | "year">("default");
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [activeQ, setActiveQ] = useState<Question | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [rawBookmarks, setRawBookmarks] = useState<QuestionId[]>([]);
  const [rawAttempts, setRawAttempts] = useState<AnswerAttempt[]>([]);
  const [answerStart, setAnswerStart] = useState<number>(Date.now());
  const [queryHydrated, setQueryHydrated] = useState(false);
  const [pendingQuestionId, setPendingQuestionId] = useState<string | null>(null);
  const [progressLoading, setProgressLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const getList = (key: string, fallbackKey?: string) => {
      const raw = params.get(key) || (fallbackKey ? params.get(fallbackKey) : "") || "";
      return raw
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    };

    setSearch(params.get("search") || "");
    setSelExams(getList("exams", "exam"));
    setSelDiff(params.get("difficulty") || "");
    setSelTypes(getList("types", "type"));
    setSelTopics(getList("topics", "topic"));
    setSelYears(
      getList("years", "year")
        .map((value) => Number.parseInt(value, 10))
        .filter((value) => Number.isFinite(value)),
    );
    setSortBy((params.get("sort") as "default" | "difficulty" | "year") || "default");
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

    if (authLoading) return () => {
      cancelled = true;
    };

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

  const questionIdentity = useMemo(() => createQuestionIdentityIndex(questions), [questions]);
  const resolveStoredQuestionId = (rawId: QuestionId) => questionIdentity.resolveQuestionId(rawId);
  const progressSyncing = Boolean(user) && (questionsSyncing || progressLoading);
  const bookmarks = useMemo(() => {
    const mapped = rawBookmarks
      .map(resolveStoredQuestionId)
      .filter((questionId): questionId is string => Boolean(questionId));

    return Array.from(new Set(mapped));
  }, [rawBookmarks, questionIdentity]);
  const answerStatuses = useMemo(() => {
    const mappedAttempts = rawAttempts
      .map((attempt) => {
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
    () => Object.keys(answerStatuses),
    [answerStatuses],
  );
  const solvedSet = useMemo(() => new Set(solvedIds), [solvedIds]);
  const bookmarkSet = useMemo(() => new Set(bookmarks), [bookmarks]);
  const allTopics = useMemo(
    () => Array.from(new Set(questions.map((question) => question.topic))).sort(),
    [questions],
  );
  const allYears = useMemo(
    () =>
      Array.from(
        new Set(questions.filter((question) => question.year).map((question) => question.year as number)),
      ).sort((a, b) => b - a),
    [questions],
  );

  const filtered = useMemo(() => {
    let current = [...questions];

    if (search) {
      current = current.filter(
        (item) =>
          item.question.toLowerCase().includes(search.toLowerCase()) ||
          item.topic.toLowerCase().includes(search.toLowerCase()),
      );
    }
    if (selExams.length) current = current.filter((item) => selExams.includes(item.exam));
    if (selDiff) current = current.filter((item) => item.difficulty === selDiff);
    if (selTypes.length) current = current.filter((item) => selTypes.includes(item.type));
    if (selTopics.length) current = current.filter((item) => selTopics.includes(item.topic));
    if (selYears.length) current = current.filter((item) => item.year !== null && selYears.includes(item.year));
    if (reviewMode === "bookmarked") {
      current = current.filter((item) => bookmarkSet.has(toQuestionId(item.id)));
    }
    if (reviewMode === "solved") {
      current = current.filter((item) => solvedSet.has(toQuestionId(item.id)));
    }
    if (reviewMode === "wrong") {
      current = current.filter((item) => answerStatuses[toQuestionId(item.id)] === "wrong");
    }
    if (sortBy === "difficulty") {
      current.sort(
        (a, b) =>
          ["Easy", "Medium", "Hard"].indexOf(a.difficulty) -
          ["Easy", "Medium", "Hard"].indexOf(b.difficulty),
      );
    }
    if (sortBy === "year") {
      current.sort((a, b) => (b.year ?? 0) - (a.year ?? 0));
    }
    return current;
  }, [questions, search, selExams, selDiff, selTypes, selTopics, selYears, reviewMode, sortBy, bookmarkSet, solvedSet, answerStatuses]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const reviewModeSyncing = progressSyncing && Boolean(reviewMode);
  const activeIdx = activeQ
    ? filtered.findIndex((question) => toQuestionId(question.id) === toQuestionId(activeQ.id))
    : -1;
  const filterCount =
    selExams.length + (selDiff ? 1 : 0) + selTypes.length + selTopics.length + selYears.length + (reviewMode ? 1 : 0);
  const examCounts = useMemo(
    () =>
      EXAMS.reduce<Record<string, number>>((acc, exam) => {
        acc[exam] = questions.filter((question) => question.exam === exam).length;
        return acc;
      }, {}),
    [questions],
  );

  useEffect(() => {
    setPage((current) => Math.min(current, totalPages));
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
    window.history.replaceState({}, "", query ? `/practice?${query}` : "/practice");
  }, [pendingQuestionId, queryHydrated, reviewMode, search, selDiff, selExams, selTopics, selTypes, selYears, sortBy]);

  useEffect(() => {
    if (questionsSyncing || questions.length === 0 || pendingQuestionId === null) return;

    const match = questions.find((question) => toQuestionId(question.id) === pendingQuestionId);
    if (!match) return;

    setActiveQ(match);
    setSelected(null);
    setAnswerStart(Date.now());
    setPendingQuestionId(null);
  }, [pendingQuestionId, questions, questionsSyncing]);

  const toggle = <T,>(arr: T[], setArr: (value: T[]) => void, value: T) => {
    setArr(arr.includes(value) ? arr.filter((item) => item !== value) : [...arr, value]);
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
    const questionId = resolveStoredQuestionId(toQuestionId(activeQ.id)) ?? toQuestionId(activeQ.id);
    setSelected(index);
    setRawAttempts((current) => [
      {
        question_id: questionId,
        is_correct: isCorrect,
        answered_at: new Date().toISOString(),
      },
      ...current.filter((attempt) => attempt.question_id !== questionId),
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
    const questionId = resolveStoredQuestionId(toQuestionId(activeQ.id)) ?? toQuestionId(activeQ.id);
    if (user) {
      toggleBookmark(user.id, questionId).then((isBookmarked) => {
        trackEvent("bookmark_toggled", { question_id: activeQ.id, bookmarked: isBookmarked });
        setRawBookmarks((current) =>
          isBookmarked ? Array.from(new Set([...current, questionId])) : current.filter((item) => item !== questionId),
        );
      });
      return;
    }

    setRawBookmarks((current) =>
      current.includes(questionId)
        ? current.filter((item) => item !== questionId)
        : [...current, questionId],
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

  const filterPanel = (
    <div className={`${shellClassName} rounded-[26px] p-5 md:p-6`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-2 text-base font-semibold text-[var(--text-primary)]">
            <Filter size={16} className="text-[var(--brand)]" />
            Filters
          </div>
        </div>
        {filterCount > 0 ? (
          <button
            type="button"
            onClick={clearAll}
            className="rounded-full border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-1.5 text-xs font-medium text-[var(--brand-light)] transition hover:border-[var(--brand-muted)]"
          >
            Clear all
          </button>
        ) : null}
      </div>

      <div className="relative mt-5">
        <Search
          size={15}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-faint)]"
        />
        <input
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
          placeholder="Search question or topic"
          className="input rounded-[16px] border-[var(--border)] bg-[var(--bg-elevated)] pl-10"
        />
      </div>

      <div className="mt-6 space-y-6">
        <div>
          <p className="filter-section-title">Review</p>
          <div className="space-y-2">
            {[
              { value: "", label: "All questions" },
              { value: "bookmarked", label: "Bookmarked only" },
              { value: "solved", label: "Solved only" },
              { value: "wrong", label: "Incorrect only" },
            ].map((item) => (
              <label
                key={item.label}
                className="flex cursor-pointer items-center gap-3 rounded-[14px] px-2 py-2 transition hover:bg-[rgba(255,255,255,0.03)]"
              >
                <input
                  type="radio"
                  name="review-mode"
                  checked={reviewMode === item.value}
                  onChange={() => {
                    setReviewMode(item.value as typeof reviewMode);
                    setPage(1);
                  }}
                />
                <span className="text-sm text-[var(--text-secondary)]">{item.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <p className="filter-section-title">Exam</p>
          <div className="space-y-2">
            {EXAMS.map((exam) => (
              <label
                key={exam}
                className="flex cursor-pointer items-center gap-3 rounded-[14px] px-2 py-2 transition hover:bg-[rgba(255,255,255,0.03)]"
              >
                <input
                  type="checkbox"
                  checked={selExams.includes(exam)}
                  onChange={() => {
                    toggle(selExams, setSelExams, exam);
                    setPage(1);
                  }}
                />
                <span className="text-sm text-[var(--text-secondary)]">{exam}</span>
                <span className={`badge ml-auto ${EXAM_COLORS[exam]}`}>{examCounts[exam] || 0}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <p className="filter-section-title">Difficulty</p>
          <div className="space-y-2">
            {["", ...DIFFICULTIES].map((difficulty) => (
              <label
                key={difficulty || "all"}
                className="flex cursor-pointer items-center gap-3 rounded-[14px] px-2 py-2 transition hover:bg-[rgba(255,255,255,0.03)]"
              >
                <input
                  type="radio"
                  name="difficulty"
                  checked={selDiff === difficulty}
                  onChange={() => {
                    setSelDiff(difficulty);
                    setPage(1);
                  }}
                />
                <span className="text-sm text-[var(--text-secondary)]">
                  {difficulty || "All"}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <p className="filter-section-title">Type</p>
          <div className="space-y-2">
            {TYPES.map((type) => (
              <label
                key={type}
                className="flex cursor-pointer items-center gap-3 rounded-[14px] px-2 py-2 transition hover:bg-[rgba(255,255,255,0.03)]"
              >
                <input
                  type="checkbox"
                  checked={selTypes.includes(type)}
                  onChange={() => {
                    toggle(selTypes, setSelTypes, type);
                    setPage(1);
                  }}
                />
                <span className="text-sm text-[var(--text-secondary)]">{type}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <p className="filter-section-title">Topic</p>
          <div className="max-h-48 space-y-2 overflow-y-auto pr-1">
            {allTopics.map((topic) => (
              <label
                key={topic}
                className="flex cursor-pointer items-center gap-3 rounded-[14px] px-2 py-2 transition hover:bg-[rgba(255,255,255,0.03)]"
              >
                <input
                  type="checkbox"
                  checked={selTopics.includes(topic)}
                  onChange={() => {
                    toggle(selTopics, setSelTopics, topic);
                    setPage(1);
                  }}
                />
                <span className="text-sm text-[var(--text-secondary)]">{topic}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <p className="filter-section-title">Year</p>
          <div className="max-h-40 space-y-2 overflow-y-auto pr-1">
            {allYears.map((year) => (
              <label
                key={year}
                className="flex cursor-pointer items-center gap-3 rounded-[14px] px-2 py-2 transition hover:bg-[rgba(255,255,255,0.03)]"
              >
                <input
                  type="checkbox"
                  checked={selYears.includes(year)}
                  onChange={() => {
                    toggle(selYears, setSelYears, year);
                    setPage(1);
                  }}
                />
                <span className="text-sm text-[var(--text-secondary)]">{year}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen home-reference-page">
      <Navbar />

      <main className="px-4 py-8 md:py-10">
        <div className="container-shell space-y-6">
          <div className={`${shellClassName} overflow-hidden rounded-[32px] px-6 py-8 md:px-8 md:py-10`}>
            <div className="grid gap-8 xl:grid-cols-[1.05fr_0.95fr]">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--brand-light)]">
                  Practice engine
                </p>
                <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-[-0.06em] text-[var(--text-primary)] md:text-5xl">
                  A cleaner question bank built for daily exam practice.
                </h1>
                <p className="mt-4 max-w-2xl text-base leading-8 text-[var(--text-secondary)]">
                  Filter faster, scan questions in one structured table, and open any question
                  without losing context. The list view is built to feel calm, dense, and usable.
                </p>
                <div className="mt-7 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={openRandom}
                    className="inline-flex items-center gap-2 rounded-[14px] bg-[linear-gradient(180deg,#ff9838_0%,#ff7a12_100%)] px-5 py-3 text-sm font-medium text-white shadow-[0_20px_40px_-28px_rgba(255,122,18,0.9)]"
                  >
                    <Shuffle size={15} />
                    Random question
                  </button>
                  <Link href="/dashboard">
                    <span className={`inline-flex cursor-pointer items-center rounded-[14px] px-5 py-3 text-sm font-medium text-[var(--text-primary)] transition hover:border-[var(--border-strong)] ${softSurfaceClassName}`}>
                      View dashboard
                    </span>
                  </Link>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  { label: "Questions available", value: filtered.length, mode: "" as const },
                  { label: "Bookmarked", value: bookmarks.length, mode: "bookmarked" as const },
                  { label: "Solved", value: solvedIds.length, mode: "solved" as const },
                ].map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => {
                      setReviewMode(item.mode);
                      setPage(1);
                    }}
                    className={`rounded-[22px] border p-5 text-left transition ${
                      reviewMode === item.mode
                        ? "border-[var(--brand-muted)] bg-[rgba(255,161,22,0.08)] shadow-[0_18px_40px_-30px_rgba(255,161,22,0.9)]"
                        : "border-[var(--border)] bg-[var(--bg-elevated)] hover:border-[var(--border-strong)]"
                    }`}
                    aria-pressed={reviewMode === item.mode}
                  >
                    <p className="text-3xl font-semibold tracking-[-0.05em] text-[var(--text-primary)]">
                      {user && item.mode && progressSyncing ? "..." : item.value}
                    </p>
                    <p className="mt-2 text-sm text-[var(--text-secondary)]">{item.label}</p>
                    {user && item.mode && progressSyncing ? (
                      <p className="mt-3 text-xs text-[var(--text-muted)]">Loading saved progress...</p>
                    ) : (
                      <p className="mt-3 text-xs text-[var(--brand-light)]">
                        {item.mode ? "Click to filter this list" : "Click to reset review filters"}
                      </p>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {!activeQ ? (
            <>
              <div className="lg:hidden">
                <button
                  type="button"
                  onClick={() => setShowFilters((current) => !current)}
                  className={`inline-flex items-center gap-2 rounded-[14px] px-4 py-3 text-sm font-medium text-[var(--text-primary)] ${softSurfaceClassName}`}
                >
                  <SlidersHorizontal size={15} />
                  Filters
                  {filterCount > 0 ? (
                    <span className="rounded-full bg-[var(--brand)] px-2 py-0.5 text-xs text-white">
                      {filterCount}
                    </span>
                  ) : null}
                </button>
              </div>

              {showFilters ? <div className="lg:hidden">{filterPanel}</div> : null}

              <div className="hidden lg:block">
                <ResizablePanelGroup direction="horizontal" className="h-auto min-h-[760px]">
                  <ResizablePanel defaultSize={25} minSize={18} maxSize={36}>
                    <div className="sticky top-[104px] pr-3">{filterPanel}</div>
                  </ResizablePanel>

                  <ResizableHandle
                    withHandle
                    className="mx-1 w-4 bg-transparent after:hidden [&>div]:h-14 [&>div]:w-6 [&>div]:rounded-full [&>div]:border-[rgba(255,255,255,0.08)] [&>div]:bg-[rgba(25,24,36,0.88)] [&>div_svg]:text-[var(--text-muted)]"
                  />

                  <ResizablePanel defaultSize={75} minSize={50}>
                    <div className="space-y-4 pl-3">
                      <div className={`${shellClassName} rounded-[26px] p-5 md:p-6`}>
                        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
                          <div>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--brand-light)]">
                              Practice questions
                            </p>
                            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-[var(--text-primary)]">
                              Question library
                            </h2>
                            <p className="mt-2 text-sm text-[var(--text-secondary)]">
                              {questionsLoading
                                ? "Loading question bank..."
                                : reviewModeSyncing
                                  ? "Syncing your saved progress..."
                                : `Showing ${filtered.length} question${filtered.length === 1 ? "" : "s"}${!user ? " · sign in to save progress" : ""}`}
                            </p>
                          </div>

                          <div className="flex items-center gap-3">
                            <p className="hidden text-xs uppercase tracking-[0.18em] text-[var(--text-muted)] xl:block">
                              Resize filters
                            </p>
                            <select
                              value={sortBy}
                              onChange={(event) => {
                                setSortBy(event.target.value as typeof sortBy);
                                setPage(1);
                              }}
                              className="rounded-[14px] border border-[var(--border)] bg-[var(--bg-elevated)] px-4 py-3 text-sm"
                            >
                              <option value="default">Default order</option>
                              <option value="difficulty">Sort by difficulty</option>
                              <option value="year">Sort by year</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      {questionsLoading ? (
                        <div className={`${shellClassName} flex min-h-[520px] items-center justify-center rounded-[26px] p-6`}>
                          <div className="inline-flex items-center gap-3 rounded-full border border-[var(--border)] bg-[var(--bg-elevated)] px-5 py-3 text-sm text-[var(--text-secondary)]">
                            <Loader2 size={16} className="animate-spin text-[var(--brand)]" />
                            Loading questions...
                          </div>
                        </div>
                      ) : reviewModeSyncing ? (
                        <div className={`${shellClassName} flex min-h-[520px] items-center justify-center rounded-[26px] p-6`}>
                          <div className="inline-flex items-center gap-3 rounded-full border border-[var(--border)] bg-[var(--bg-elevated)] px-5 py-3 text-sm text-[var(--text-secondary)]">
                            <Loader2 size={16} className="animate-spin text-[var(--brand)]" />
                            Restoring saved progress...
                          </div>
                        </div>
                      ) : paginated.length === 0 ? (
                        <div className={`${shellClassName} rounded-[26px] p-10 text-center`}>
                          <p className="text-xl font-semibold text-[var(--text-primary)]">
                            No questions match those filters.
                          </p>
                          <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-[var(--text-secondary)]">
                            Clear a few filters to widen the pool and keep the question library useful.
                          </p>
                          <button
                            type="button"
                            onClick={clearAll}
                            className="mt-6 inline-flex items-center rounded-[14px] bg-[linear-gradient(180deg,#ff9838_0%,#ff7a12_100%)] px-5 py-3 text-sm font-medium text-white"
                          >
                            Clear filters
                          </button>
                        </div>
                      ) : (
                        <div className={`${shellClassName} overflow-hidden rounded-[26px]`}>
                            <table className="w-full table-fixed border-collapse">
                              <thead className="bg-[var(--bg-elevated)]">
                                <tr className="border-b border-[var(--border)]">
                                  {TABLE_COLUMNS.map((column) => (
                                      <th
                                        key={column.label}
                                        className={`px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)] ${column.className}`}
                                      >
                                        {column.label}
                                      </th>
                                    ))}
                                </tr>
                              </thead>
                              <tbody>
                                {paginated.map((question, index) => {
                                  const rowNumber = (page - 1) * PER_PAGE + index + 1;
                                  const status = answerStatuses[toQuestionId(question.id)];

                                  return (
                                    <tr
                                      key={question.id}
                                      onClick={() => openQuestion(question)}
                                      className="cursor-pointer border-b border-[var(--border)] transition hover:bg-[var(--brand-subtle)]"
                                    >
                                      <td className="px-4 py-3.5 align-middle">
                                        <span className="inline-flex h-8 min-w-8 items-center justify-center rounded-[10px] bg-[var(--bg-elevated)] px-2 text-sm font-semibold text-[var(--text-muted)]">
                                          {rowNumber}
                                        </span>
                                      </td>
                                      <td className="px-4 py-3.5 align-middle">
                                        <div className="pr-2">
                                          <p className="line-clamp-1 text-[15px] font-medium leading-6 text-[var(--text-primary)]">
                                            {question.question}
                                          </p>
                                        </div>
                                      </td>
                                      <td className="px-4 py-3.5 align-middle">
                                        <span className={`badge whitespace-nowrap px-3 py-1 text-xs ${EXAM_COLORS[question.exam]}`}>
                                          {question.exam}
                                        </span>
                                      </td>
                                      <td className="px-4 py-3.5 align-middle text-sm leading-6 text-[var(--text-secondary)]">
                                        <span className="line-clamp-1 block">{question.topic}</span>
                                      </td>
                                      <td className="px-4 py-3.5 align-middle">
                                        <span className={`badge whitespace-nowrap px-3 py-1 text-xs ${DIFF_COLORS[question.difficulty]}`}>
                                          {question.difficulty}
                                        </span>
                                      </td>
                                      <td className="px-4 py-3.5 align-middle text-sm text-[var(--text-secondary)]">
                                        {question.year ?? "—"}
                                      </td>
                                      <td className="px-4 py-3.5 align-middle">
                                        {progressSyncing ? (
                                          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text-muted)]">
                                            <Loader2 size={13} className="animate-spin" />
                                          </span>
                                        ) : status === "correct" ? (
                                          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[var(--accent-muted)] bg-[var(--accent-subtle)] text-[var(--accent)]">
                                            <Check size={15} />
                                          </span>
                                        ) : status === "wrong" ? (
                                          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[var(--red)]/30 bg-[var(--red-bg)] text-[var(--red)]">
                                            <X size={15} />
                                          </span>
                                        ) : (
                                          <span className="text-base text-[var(--text-muted)]">-</span>
                                        )}
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>

                          {totalPages > 1 ? (
                            <div className="flex flex-col gap-3 border-t border-[var(--border)] px-5 py-4 md:flex-row md:items-center md:justify-between">
                              <p className="text-sm text-[var(--text-secondary)]">
                                {(page - 1) * PER_PAGE + 1}-
                                {Math.min(page * PER_PAGE, filtered.length)} of {filtered.length}
                              </p>
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                                  disabled={page === 1}
                                  className="inline-flex h-11 w-11 items-center justify-center rounded-[12px] border border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text-primary)] disabled:opacity-40"
                                >
                                  <ChevronLeft size={14} />
                                </button>
                                {Array.from({ length: Math.min(5, totalPages) }, (_, index) => {
                                  const currentPage = page <= 3 ? index + 1 : page + index - 2;
                                  if (currentPage < 1 || currentPage > totalPages) return null;
                                  const isActive = currentPage === page;

                                  return (
                                    <button
                                      key={currentPage}
                                      type="button"
                                      onClick={() => setPage(currentPage)}
                                      className={
                                        isActive
                                          ? "inline-flex h-11 min-w-11 items-center justify-center rounded-[12px] bg-[linear-gradient(180deg,#ff9838_0%,#ff7a12_100%)] px-4 text-sm font-medium text-white"
                                          : "inline-flex h-11 min-w-11 items-center justify-center rounded-[12px] border border-[var(--border)] bg-[var(--bg-elevated)] px-4 text-sm font-medium text-[var(--text-primary)]"
                                      }
                                    >
                                      {currentPage}
                                    </button>
                                  );
                                })}
                                <button
                                  type="button"
                                  onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                                  disabled={page === totalPages}
                                  className="inline-flex h-11 w-11 items-center justify-center rounded-[12px] border border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text-primary)] disabled:opacity-40"
                                >
                                  <ChevronRight size={14} />
                                </button>
                              </div>
                            </div>
                          ) : null}
                        </div>
                      )}
                    </div>
                  </ResizablePanel>
                </ResizablePanelGroup>
              </div>

              <div className="space-y-4 lg:hidden">
                <div className={`${shellClassName} rounded-[26px] p-5`}>
                  <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--brand-light)]">
                        Practice questions
                      </p>
                      <h2 className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-[var(--text-primary)]">
                        Question library
                      </h2>
                      <p className="mt-2 text-sm text-[var(--text-secondary)]">
                        {questionsLoading
                          ? "Loading question bank..."
                          : reviewModeSyncing
                            ? "Syncing your saved progress..."
                          : `Showing ${filtered.length} question${filtered.length === 1 ? "" : "s"}${!user ? " · sign in to save progress" : ""}`}
                      </p>
                    </div>
                    <select
                      value={sortBy}
                      onChange={(event) => {
                        setSortBy(event.target.value as typeof sortBy);
                        setPage(1);
                      }}
                      className="rounded-[14px] border border-[rgba(255,255,255,0.08)] bg-[rgba(11,11,18,0.88)] px-4 py-3 text-sm"
                    >
                      <option value="default">Default order</option>
                      <option value="difficulty">Sort by difficulty</option>
                      <option value="year">Sort by year</option>
                    </select>
                  </div>
                </div>

                {questionsLoading ? (
                  <div className={`${shellClassName} flex min-h-[380px] items-center justify-center rounded-[26px] p-6`}>
                    <div className="inline-flex items-center gap-3 rounded-full border border-[rgba(255,255,255,0.08)] bg-[rgba(17,17,27,0.82)] px-5 py-3 text-sm text-[var(--text-secondary)]">
                      <Loader2 size={16} className="animate-spin text-[var(--brand)]" />
                      Loading questions...
                    </div>
                  </div>
                ) : reviewModeSyncing ? (
                  <div className={`${shellClassName} flex min-h-[380px] items-center justify-center rounded-[26px] p-6`}>
                    <div className="inline-flex items-center gap-3 rounded-full border border-[rgba(255,255,255,0.08)] bg-[rgba(17,17,27,0.82)] px-5 py-3 text-sm text-[var(--text-secondary)]">
                      <Loader2 size={16} className="animate-spin text-[var(--brand)]" />
                      Restoring saved progress...
                    </div>
                  </div>
                ) : paginated.length === 0 ? (
                  <div className={`${shellClassName} rounded-[26px] p-8 text-center`}>
                    <p className="text-lg font-semibold text-[var(--text-primary)]">
                      No questions match those filters.
                    </p>
                    <button
                      type="button"
                      onClick={clearAll}
                      className="mt-5 inline-flex items-center rounded-[14px] bg-[linear-gradient(180deg,#ff9838_0%,#ff7a12_100%)] px-5 py-3 text-sm font-medium text-white"
                    >
                      Clear filters
                    </button>
                  </div>
                ) : (
                  <div className={`${shellClassName} overflow-hidden rounded-[26px]`}>
                    <div className="overflow-x-auto">
                      <table className="min-w-[980px] w-full border-collapse">
                        <thead className="bg-[rgba(255,255,255,0.03)]">
                          <tr className="border-b border-[rgba(255,255,255,0.08)]">
                            {["#", "Question", "Exam", "Topic", "Difficulty", "Year", "Solved"].map(
                              (label) => (
                                <th
                                  key={label}
                                  className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]"
                                >
                                  {label}
                                </th>
                              ),
                            )}
                          </tr>
                        </thead>
                        <tbody>
                          {paginated.map((question, index) => {
                            const rowNumber = (page - 1) * PER_PAGE + index + 1;
                            const status = answerStatuses[toQuestionId(question.id)];

                            return (
                              <tr
                                key={question.id}
                                onClick={() => openQuestion(question)}
                                className="cursor-pointer border-b border-[rgba(255,255,255,0.06)] transition hover:bg-[rgba(255,161,22,0.04)]"
                              >
                                <td className="px-5 py-5 align-top text-sm font-semibold text-[var(--text-muted)]">
                                  {rowNumber}
                                </td>
                                <td className="px-5 py-4 align-middle text-sm leading-7 text-[var(--text-primary)]">
                                  <span className="line-clamp-1 block">
                                    {question.question}
                                  </span>
                                </td>
                                <td className="px-5 py-4 align-middle">
                                  <span className={`badge ${EXAM_COLORS[question.exam]}`}>{question.exam}</span>
                                </td>
                                <td className="px-5 py-4 align-middle text-sm text-[var(--text-secondary)]">
                                  {question.topic}
                                </td>
                                <td className="px-5 py-4 align-middle">
                                  <span className={`badge ${DIFF_COLORS[question.difficulty]}`}>
                                    {question.difficulty}
                                  </span>
                                </td>
                                <td className="px-5 py-4 align-middle text-sm text-[var(--text-secondary)]">
                                  {question.year ?? "—"}
                                </td>
                                <td className="px-5 py-4 align-middle text-sm text-[var(--text-secondary)]">
                                  {progressSyncing ? (
                                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] text-[var(--text-muted)]">
                                      <Loader2 size={13} className="animate-spin" />
                                    </span>
                                  ) : status === "correct" ? (
                                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[var(--accent-muted)] bg-[var(--accent-subtle)] text-[var(--accent)]">
                                      <Check size={14} />
                                    </span>
                                  ) : status === "wrong" ? (
                                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[var(--red)]/30 bg-[var(--red-bg)] text-[var(--red)]">
                                      <X size={14} />
                                    </span>
                                  ) : (
                                    "-"
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {totalPages > 1 ? (
                      <div className="flex flex-col gap-3 border-t border-[rgba(255,255,255,0.08)] px-5 py-4 md:flex-row md:items-center md:justify-between">
                        <p className="text-sm text-[var(--text-secondary)]">
                          {(page - 1) * PER_PAGE + 1}-
                          {Math.min(page * PER_PAGE, filtered.length)} of {filtered.length}
                        </p>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setPage((current) => Math.max(1, current - 1))}
                            disabled={page === 1}
                            className="inline-flex h-11 w-11 items-center justify-center rounded-[12px] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] text-[var(--text-primary)] disabled:opacity-40"
                          >
                            <ChevronLeft size={14} />
                          </button>
                          {Array.from({ length: Math.min(5, totalPages) }, (_, index) => {
                            const currentPage = page <= 3 ? index + 1 : page + index - 2;
                            if (currentPage < 1 || currentPage > totalPages) return null;
                            const isActive = currentPage === page;

                            return (
                              <button
                                key={currentPage}
                                type="button"
                                onClick={() => setPage(currentPage)}
                                className={
                                  isActive
                                    ? "inline-flex h-11 min-w-11 items-center justify-center rounded-[12px] bg-[linear-gradient(180deg,#ff9838_0%,#ff7a12_100%)] px-4 text-sm font-medium text-white"
                                    : "inline-flex h-11 min-w-11 items-center justify-center rounded-[12px] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] px-4 text-sm font-medium text-[var(--text-primary)]"
                                }
                              >
                                {currentPage}
                              </button>
                            );
                          })}
                          <button
                            type="button"
                            onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                            disabled={page === totalPages}
                            className="inline-flex h-11 w-11 items-center justify-center rounded-[12px] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] text-[var(--text-primary)] disabled:opacity-40"
                          >
                            <ChevronRight size={14} />
                          </button>
                        </div>
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className={`${shellClassName} rounded-[28px] p-5 md:p-6`}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setActiveQ(null);
                    setSelected(null);
                  }}
                  className="inline-flex items-center gap-2 rounded-[12px] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] px-4 py-2.5 text-sm font-medium text-[var(--text-primary)]"
                >
                  <ChevronLeft size={14} />
                  Back to questions
                </button>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--text-muted)]">
                    {activeIdx + 1} of {filtered.length}
                  </span>
                  <button
                    type="button"
                    onClick={handleBookmark}
                    disabled={Boolean(user) && questionsSyncing}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-[12px] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] text-[var(--text-primary)]"
                  >
                    {Boolean(user) && questionsSyncing ? (
                      <Loader2 size={14} className="animate-spin text-[var(--text-muted)]" />
                    ) : bookmarkSet.has(toQuestionId(activeQ.id)) ? (
                      <BookmarkCheck size={14} className="text-[var(--brand)]" />
                    ) : (
                      <Bookmark size={14} />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleReportQuestion}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-[12px] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] text-[var(--text-primary)]"
                  >
                    <Flag size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveQ(null);
                      setSelected(null);
                    }}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-[12px] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] text-[var(--text-primary)]"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                <span className={`badge ${EXAM_COLORS[activeQ.exam]}`}>{activeQ.exam}</span>
                <span className={`badge ${DIFF_COLORS[activeQ.difficulty]}`}>{activeQ.difficulty}</span>
                <span className="badge badge-gray">{activeQ.topic}</span>
                <span className="badge badge-blue">{activeQ.type}</span>
                {activeQ.year ? <span className="badge badge-gray">{activeQ.year}</span> : null}
              </div>

              <h2 className="mt-5 text-2xl font-semibold tracking-[-0.05em] text-[var(--text-primary)]">
                {activeQ.question}
              </h2>

              <div className="mt-6 grid gap-3">
                {activeQ.options.map((option, index) => {
                  let optionClass =
                    "option-btn border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)]";
                  if (selected !== null) {
                    if (index === activeQ.correct) optionClass = "option-btn correct";
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
                        <span className="text-sm leading-7 text-[var(--text-primary)]">{option}</span>
                      </span>
                    </button>
                  );
                })}
              </div>

              {user && questionsSyncing ? (
                <p className="mt-4 text-xs text-[var(--brand)]">
                  Syncing the live question bank before answers and bookmarks are written to your account.
                </p>
              ) : null}

              {selected !== null ? (
                <div
                  className={`mt-6 rounded-[24px] border p-5 ${
                    selected === activeQ.correct
                      ? "border-[var(--green)]/25 bg-[var(--green-bg)]"
                      : "border-[var(--yellow)]/25 bg-[var(--yellow-bg)]"
                  }`}
                >
                  <p className="text-sm font-semibold text-[var(--text-primary)]">
                    {selected === activeQ.correct
                      ? "Correct. Keep the streak going."
                      : `Not quite. The correct answer is ${activeQ.options[activeQ.correct]}.`}
                  </p>
                  <p className="mt-2 text-sm text-[var(--text-secondary)]">{activeQ.explanation}</p>
                  {!user ? (
                    <p className="mt-3 text-xs text-[var(--brand)]">
                      Sign in to save progress, accuracy, and streaks across sessions.
                    </p>
                  ) : questionsSyncing ? (
                    <p className="mt-3 text-xs text-[var(--brand)]">
                      Hold for a moment while PrepBros syncs the live question bank before saving progress.
                    </p>
                  ) : null}
                </div>
              ) : null}

              {activeQ.tags.length > 0 ? (
                <div className="mt-6 flex flex-wrap gap-2">
                  {activeQ.tags.map((tag) => (
                    <span key={tag} className="badge badge-gray">
                      #{tag}
                    </span>
                  ))}
                </div>
              ) : null}

              <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-[rgba(255,255,255,0.08)] pt-5">
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
                  className="inline-flex items-center gap-2 rounded-[14px] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] px-5 py-3 text-sm font-medium text-[var(--text-primary)] disabled:opacity-40"
                >
                  <ChevronLeft size={14} />
                  Previous
                </button>
                <button
                  type="button"
                  onClick={openRandom}
                  className="inline-flex items-center gap-2 rounded-[14px] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] px-5 py-3 text-sm font-medium text-[var(--text-primary)]"
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
                  className="inline-flex items-center gap-2 rounded-[14px] bg-[linear-gradient(180deg,#ff9838_0%,#ff7a12_100%)] px-5 py-3 text-sm font-medium text-white disabled:opacity-40"
                >
                  Next
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
