import { useEffect, useMemo, useState } from "react";
import {
  Bookmark,
  BookmarkCheck,
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
import { Link } from "wouter";

import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import SectionHeader from "@/components/SectionHeader";
import { useAuth } from "@/contexts/AuthContext";
import { type Question } from "@/data/questions";
import { trackEvent } from "@/lib/analytics";
import { fetchQuestions } from "@/lib/questionsDB";
import {
  getBookmarks,
  getSolvedQuestions,
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

export default function Practice() {
  const { user } = useAuth();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [allTopics, setAllTopics] = useState<string[]>([]);
  const [allYears, setAllYears] = useState<number[]>([]);
  const [questionsLoading, setQuestionsLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [selExams, setSelExams] = useState<string[]>([]);
  const [selDiff, setSelDiff] = useState<string>("");
  const [selTypes, setSelTypes] = useState<string[]>([]);
  const [selTopics, setSelTopics] = useState<string[]>([]);
  const [selYears, setSelYears] = useState<number[]>([]);
  const [sortBy, setSortBy] = useState<"default" | "difficulty" | "year">("default");
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [activeQ, setActiveQ] = useState<Question | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [bookmarks, setBookmarks] = useState<number[]>([]);
  const [solved, setSolved] = useState<number[]>([]);
  const [answerStart, setAnswerStart] = useState<number>(Date.now());

  useEffect(() => {
    fetchQuestions().then((records) => {
      setQuestions(records);
      setAllTopics(Array.from(new Set(records.map((question) => question.topic))));
      setAllYears(
        Array.from(
          new Set(records.filter((question) => question.year).map((question) => question.year as number)),
        ).sort(
          (a, b) => b - a,
        ),
      );
      setQuestionsLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!user) {
      setBookmarks([]);
      setSolved([]);
      return;
    }

    getBookmarks(user.id).then(setBookmarks);
    getSolvedQuestions(user.id).then(setSolved);
  }, [user]);

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
  }, [questions, search, selExams, selDiff, selTypes, selTopics, selYears, sortBy]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const activeIdx = activeQ ? filtered.findIndex((question) => question.id === activeQ.id) : -1;
  const filterCount =
    selExams.length + (selDiff ? 1 : 0) + selTypes.length + selTopics.length + selYears.length;

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
    setSelected(index);
    if (!solved.includes(activeQ.id)) setSolved((current) => [...current, activeQ.id]);
    trackEvent("practice_answered", {
      exam: activeQ.exam,
      topic: activeQ.topic,
      correct: index === activeQ.correct,
    });
    if (user) {
      const timeTaken = Math.round((Date.now() - answerStart) / 1000);
      saveAnswer(user.id, activeQ.id, index === activeQ.correct, index, timeTaken);
    }
  };

  const handleBookmark = () => {
    if (!activeQ) return;
    if (user) {
      toggleBookmark(user.id, activeQ.id).then((isBookmarked) => {
        trackEvent("bookmark_toggled", { question_id: activeQ.id, bookmarked: isBookmarked });
        setBookmarks((current) =>
          isBookmarked ? [...current, activeQ.id] : current.filter((item) => item !== activeQ.id),
        );
      });
      return;
    }

    setBookmarks((current) =>
      current.includes(activeQ.id)
        ? current.filter((item) => item !== activeQ.id)
        : [...current, activeQ.id],
    );
  };

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="px-4 py-8 md:py-10">
        <div className="container-shell space-y-6">
          <div className="glass-panel rounded-[24px] px-6 py-8 md:px-8 md:py-10">
            <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
              <div>
                <SectionHeader
                  eyebrow="Practice engine"
                  title="A denser, cleaner question bank built for daily use."
                  description="Filter fast, open a question without losing context, and keep the core loop focused on solving instead of navigating."
                />
                <div className="mt-6 flex flex-wrap gap-3">
                  <button type="button" onClick={openRandom} className="btn-primary rounded-[12px] px-5">
                    <Shuffle size={15} />
                    Random question
                  </button>
                  <Link href="/dashboard">
                    <span className="btn-secondary inline-flex cursor-pointer rounded-[12px] px-5">
                      View dashboard
                    </span>
                  </Link>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  { label: "Questions available", value: questionsLoading ? "..." : filtered.length },
                  { label: "Bookmarked", value: bookmarks.length },
                  { label: "Solved", value: solved.length },
                ].map((item) => (
                  <div key={item.label} className="rounded-[18px] border border-[var(--border)] bg-[var(--bg-card-strong)] p-4">
                    <p className="text-2xl font-semibold tracking-[-0.05em] text-[var(--text-primary)]">
                      {item.value}
                    </p>
                    <p className="mt-1 text-sm text-[var(--text-muted)]">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
            <aside className={`${showFilters ? "block" : "hidden"} lg:block`}>
              <div className="glass-panel sticky top-[92px] rounded-[20px] p-5">
                <div className="mb-4 flex items-center justify-between">
                  <div className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--text-primary)]">
                    <Filter size={15} className="text-[var(--brand)]" />
                    Filters
                  </div>
                  {filterCount > 0 ? (
                    <button
                      type="button"
                      onClick={clearAll}
                      className="text-xs font-medium text-[var(--brand)]"
                    >
                      Clear all
                    </button>
                  ) : null}
                </div>

                <div className="relative mb-5">
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
                    className="input pl-10"
                  />
                </div>

                <div className="space-y-5">
                  <div>
                    <p className="filter-section-title">Exam</p>
                    <div className="space-y-2">
                      {EXAMS.map((exam) => (
                        <label key={exam} className="flex cursor-pointer items-center gap-3 rounded-2xl px-2 py-1.5 hover:bg-[var(--bg-subtle)]">
                          <input
                            type="checkbox"
                            checked={selExams.includes(exam)}
                            onChange={() => {
                              toggle(selExams, setSelExams, exam);
                              setPage(1);
                            }}
                          />
                          <span className="text-sm text-[var(--text-secondary)]">{exam}</span>
                          <span className={`badge ml-auto ${EXAM_COLORS[exam]}`}>{questions.filter((question) => question.exam === exam).length}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="filter-section-title">Difficulty</p>
                    <div className="space-y-2">
                      {["", ...DIFFICULTIES].map((difficulty) => (
                        <label key={difficulty || "all"} className="flex cursor-pointer items-center gap-3 rounded-2xl px-2 py-1.5 hover:bg-[var(--bg-subtle)]">
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
                        <label key={type} className="flex cursor-pointer items-center gap-3 rounded-2xl px-2 py-1.5 hover:bg-[var(--bg-subtle)]">
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
                    <div className="max-h-48 space-y-2 overflow-y-auto pr-2">
                      {allTopics.map((topic) => (
                        <label key={topic} className="flex cursor-pointer items-center gap-3 rounded-2xl px-2 py-1.5 hover:bg-[var(--bg-subtle)]">
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
                    <div className="max-h-40 space-y-2 overflow-y-auto pr-2">
                      {allYears.map((year) => (
                        <label key={year} className="flex cursor-pointer items-center gap-3 rounded-2xl px-2 py-1.5 hover:bg-[var(--bg-subtle)]">
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
            </aside>

            <section className="space-y-4">
              <div className="glass-panel flex flex-col gap-4 rounded-[20px] p-5 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm font-semibold text-[var(--text-primary)]">Practice library</p>
                  <p className="text-sm text-[var(--text-secondary)]">
                    {questionsLoading
                      ? "Loading question bank..."
                      : `Showing ${filtered.length} question${filtered.length === 1 ? "" : "s"}${!user ? " · sign in to save progress" : ""}`}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <select value={sortBy} onChange={(event) => setSortBy(event.target.value as typeof sortBy)}>
                    <option value="default">Default order</option>
                    <option value="difficulty">Difficulty</option>
                    <option value="year">Newest year</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => setShowFilters((current) => !current)}
                    className="btn-secondary rounded-[12px] px-4 lg:hidden"
                  >
                    <SlidersHorizontal size={14} />
                    Filters
                    {filterCount > 0 ? (
                      <span className="rounded-full bg-[var(--brand)] px-2 py-0.5 text-xs text-white">
                        {filterCount}
                      </span>
                    ) : null}
                  </button>
                </div>
              </div>

              {questionsLoading ? (
                <div className="glass-panel flex min-h-[420px] items-center justify-center rounded-[20px] p-6">
                  <div className="inline-flex items-center gap-3 rounded-full border border-[var(--border)] bg-[var(--bg-card-strong)] px-5 py-3 text-sm text-[var(--text-secondary)]">
                    <Loader2 size={16} className="animate-spin text-[var(--brand)]" />
                    Loading questions...
                  </div>
                </div>
              ) : !activeQ ? (
                <div className="glass-panel overflow-hidden rounded-[20px]">
                  {paginated.length === 0 ? (
                    <div className="p-10 text-center">
                      <p className="text-lg font-semibold text-[var(--text-primary)]">
                        No questions match those filters.
                      </p>
                      <p className="mt-2 text-sm text-[var(--text-secondary)]">
                        Clear a few filters to widen the pool and keep users from hitting dead
                        ends too quickly.
                      </p>
                      <button type="button" onClick={clearAll} className="btn-primary mt-5 rounded-[12px] px-5">
                        Clear filters
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="divide-y divide-[var(--border)]">
                        {paginated.map((question, index) => (
                          <button
                            key={question.id}
                            type="button"
                            onClick={() => openQuestion(question)}
                            className="table-row w-full px-5 py-4 text-left"
                          >
                            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-3">
                                  <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-[8px] bg-[var(--bg-subtle)] px-2 text-xs font-semibold text-[var(--text-muted)]">
                                    {(page - 1) * PER_PAGE + index + 1}
                                  </span>
                                  <p className="text-base font-medium leading-7 text-[var(--text-primary)]">
                                    {question.question.length > 140
                                      ? `${question.question.slice(0, 140)}...`
                                      : question.question}
                                  </p>
                                </div>

                                <div className="mt-3 flex flex-wrap items-center gap-2">
                                  <span className={`badge ${EXAM_COLORS[question.exam]}`}>{question.exam}</span>
                                  <span className="badge badge-gray">{question.topic}</span>
                                  <span className={`badge ${DIFF_COLORS[question.difficulty]}`}>{question.difficulty}</span>
                                  {question.year ? (
                                    <span className="badge badge-gray">PYQ {question.year}</span>
                                  ) : null}
                                  <span className="badge badge-blue">{question.type}</span>
                                </div>
                              </div>

                              <div className="flex items-center gap-3 md:ml-6 md:pt-1">
                                <span
                                  className={`inline-flex items-center gap-2 rounded-[10px] border px-3 py-2 text-xs font-medium ${
                                    solved.includes(question.id)
                                      ? "border-[var(--accent-muted)] bg-[var(--accent-subtle)] text-[var(--accent)]"
                                      : "border-[var(--border)] bg-[var(--bg-subtle)] text-[var(--text-muted)]"
                                  }`}
                                >
                                  {solved.includes(question.id) ? (
                                    <BookmarkCheck size={14} />
                                  ) : (
                                    <Circle size={14} />
                                  )}
                                  {solved.includes(question.id) ? "Solved" : "Unsolved"}
                                </span>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>

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
                              className="btn-secondary rounded-[12px] px-3 disabled:opacity-40"
                            >
                              <ChevronLeft size={14} />
                            </button>
                            {Array.from({ length: Math.min(5, totalPages) }, (_, index) => {
                              const currentPage = page <= 3 ? index + 1 : page + index - 2;
                              if (currentPage < 1 || currentPage > totalPages) return null;
                              return (
                                <button
                                  key={currentPage}
                                  type="button"
                                  onClick={() => setPage(currentPage)}
                                  className={
                                    currentPage === page
                                      ? "btn-primary rounded-[12px] px-4 py-2"
                                      : "btn-secondary rounded-[12px] px-4 py-2"
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
                              className="btn-secondary rounded-[12px] px-3 disabled:opacity-40"
                            >
                              <ChevronRight size={14} />
                            </button>
                          </div>
                        </div>
                      ) : null}
                    </>
                  )}
                </div>
              ) : (
                <div className="glass-panel rounded-[20px] p-5 md:p-6">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveQ(null);
                        setSelected(null);
                      }}
                      className="btn-secondary rounded-[12px] px-4"
                    >
                      <ChevronLeft size={14} />
                      Back to list
                    </button>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--text-muted)]">
                        {activeIdx + 1} of {filtered.length}
                      </span>
                      <button type="button" onClick={handleBookmark} className="btn-secondary rounded-[12px] px-3">
                        {bookmarks.includes(activeQ.id) ? (
                          <BookmarkCheck size={14} className="text-[var(--brand)]" />
                        ) : (
                          <Bookmark size={14} />
                        )}
                      </button>
                      <button type="button" className="btn-secondary rounded-[12px] px-3">
                        <Flag size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveQ(null);
                          setSelected(null);
                        }}
                        className="btn-secondary rounded-[12px] px-3"
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
                      let optionClass = "option-btn";
                      if (selected !== null) {
                        if (index === activeQ.correct) optionClass = "option-btn correct";
                        else if (index === selected) optionClass = "option-btn wrong";
                        else optionClass = "option-btn dimmed";
                      }

                      return (
                        <button key={option} type="button" onClick={() => handleAnswer(index)} className={optionClass}>
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

                  {selected !== null ? (
                    <div
                      className={`mt-6 rounded-[28px] border p-5 ${
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
                      className="btn-secondary rounded-full px-5 disabled:opacity-40"
                    >
                      <ChevronLeft size={14} />
                      Previous
                    </button>
                    <button type="button" onClick={openRandom} className="btn-secondary rounded-full px-5">
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
                      className="btn-primary rounded-full px-5 disabled:opacity-40"
                    >
                      Next
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              )}
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
