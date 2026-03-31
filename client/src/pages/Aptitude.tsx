import { useMemo, useState } from "react";
import {
  BarChart2,
  BookOpen,
  Bookmark,
  BookmarkCheck,
  Brain,
  ChevronLeft,
  ChevronRight,
  Clock,
  FileText,
  Flag,
  Globe,
  Loader2,
  Shuffle,
  Zap,
} from "lucide-react";

import AppShell from "@/components/AppShell";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { useQuestionBank } from "@/hooks/useQuestionBank";
import { cn } from "@/lib/utils";
import { type Difficulty, type Question } from "../data/questions";

const APTITUDE_TOPICS = [
  "Quantitative Aptitude",
  "Reasoning",
  "Reading Comprehension",
  "Data Interpretation",
  "English Language",
  "Mental Ability",
] as const;

const TOPIC_META: Record<
  string,
  { icon: typeof Brain; description: string; accent: string }
> = {
  "Quantitative Aptitude": {
    icon: BarChart2,
    description: "Arithmetic, percentages, ratios, time-speed-distance, and number confidence.",
    accent: "text-[var(--blue)]",
  },
  Reasoning: {
    icon: Brain,
    description: "Series, syllogisms, coding-decoding, puzzles, and pattern recognition.",
    accent: "text-[var(--brand)]",
  },
  "Reading Comprehension": {
    icon: BookOpen,
    description: "Passages, inference, tone, summary, and evidence-based reading speed.",
    accent: "text-[var(--green)]",
  },
  "Data Interpretation": {
    icon: BarChart2,
    description: "Tables, charts, graphs, and quick calculation under time pressure.",
    accent: "text-[var(--yellow)]",
  },
  "English Language": {
    icon: Globe,
    description: "Grammar, vocabulary, usage, and exam-style language precision.",
    accent: "text-[var(--red)]",
  },
  "Mental Ability": {
    icon: Zap,
    description: "Calendar, clocks, visual logic, and fast pattern-based recall.",
    accent: "text-[var(--accent)]",
  },
};

const difficultyClasses: Record<Difficulty, string> = {
  Easy: "border-[rgba(86,194,136,0.22)] bg-[rgba(86,194,136,0.12)] text-[var(--green)]",
  Medium:
    "border-[rgba(231,177,90,0.24)] bg-[rgba(231,177,90,0.12)] text-[var(--yellow)]",
  Hard: "border-[rgba(212,106,106,0.22)] bg-[rgba(212,106,106,0.12)] text-[var(--red)]",
};

const examClasses: Record<string, string> = {
  UPSC: "border-[rgba(255,140,50,0.22)] bg-[rgba(255,140,50,0.12)] text-[var(--brand)]",
  SSC: "border-[rgba(110,151,255,0.22)] bg-[rgba(110,151,255,0.12)] text-[var(--blue)]",
  RRB: "border-[rgba(212,106,106,0.22)] bg-[rgba(212,106,106,0.12)] text-[var(--red)]",
  IBPS: "border-[rgba(86,194,136,0.22)] bg-[rgba(86,194,136,0.12)] text-[var(--green)]",
  TSPSC:
    "border-[rgba(110,151,255,0.22)] bg-[rgba(110,151,255,0.12)] text-[var(--accent)]",
  APPSC:
    "border-[rgba(231,177,90,0.22)] bg-[rgba(231,177,90,0.12)] text-[var(--yellow)]",
};

const metaChipClassName =
  "inline-flex items-center rounded-full border px-3 py-1.5 text-[11px] font-medium";

export default function Aptitude() {
  const { questions, loading } = useQuestionBank();
  const [activeTopic, setActiveTopic] = useState<string | null>(null);
  const [activeQuestion, setActiveQuestion] = useState<Question | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [bookmarks, setBookmarks] = useState<Array<Question["id"]>>([]);
  const [solved, setSolved] = useState<Array<Question["id"]>>([]);
  const [difficultyFilter, setDifficultyFilter] = useState<Difficulty | "">("");
  const [examFilter, setExamFilter] = useState("");

  const aptitudeQuestions = useMemo(
    () => questions.filter(question => APTITUDE_TOPICS.includes(question.topic as any)),
    [questions]
  );

  const topicCounts = useMemo(
    () =>
      aptitudeQuestions.reduce<Record<string, number>>((acc, question) => {
        acc[question.topic] = (acc[question.topic] || 0) + 1;
        return acc;
      }, {}),
    [aptitudeQuestions]
  );

  const visibleQuestions = useMemo(() => {
    if (!activeTopic) return [];

    return aptitudeQuestions.filter(question => {
      if (question.topic !== activeTopic) return false;
      if (difficultyFilter && question.difficulty !== difficultyFilter) return false;
      if (examFilter && question.exam !== examFilter) return false;
      return true;
    });
  }, [activeTopic, aptitudeQuestions, difficultyFilter, examFilter]);

  const activeQuestionIndex = activeQuestion
    ? visibleQuestions.findIndex(question => question.id === activeQuestion.id)
    : -1;

  const openQuestion = (question: Question) => {
    setActiveQuestion(question);
    setSelectedOption(null);
    setActiveTopic(question.topic);
  };

  const openRandom = () => {
    const pool = activeTopic ? visibleQuestions : aptitudeQuestions;
    if (pool.length === 0) return;
    const randomQuestion = pool[Math.floor(Math.random() * pool.length)];
    openQuestion(randomQuestion);
  };

  const navigateQuestion = (direction: -1 | 1) => {
    if (!activeQuestion) return;
    const nextIndex = activeQuestionIndex + direction;
    if (nextIndex < 0 || nextIndex >= visibleQuestions.length) return;
    openQuestion(visibleQuestions[nextIndex]);
  };

  const toggleBookmark = () => {
    if (!activeQuestion) return;
    setBookmarks(current =>
      current.includes(activeQuestion.id)
        ? current.filter(id => id !== activeQuestion.id)
        : [...current, activeQuestion.id]
    );
  };

  const submitOption = (optionIndex: number) => {
    if (!activeQuestion || selectedOption !== null) return;
    setSelectedOption(optionIndex);
    if (!solved.includes(activeQuestion.id)) {
      setSolved(current => [...current, activeQuestion.id]);
    }
  };

  return (
    <AppShell contentClassName="max-w-[1180px]">
      <div className="space-y-6">
        <PageHeader
          eyebrow="Workspace"
          title={activeTopic ? activeTopic : "Aptitude"}
          description={
            activeTopic
              ? TOPIC_META[activeTopic]?.description ||
                "Build speed, precision, and confidence through cleaner aptitude practice."
              : "A focused aptitude workspace for quant, reasoning, comprehension, and other speed-sensitive exam sections."
          }
          crumbs={[
            { label: "Dashboard", href: "/dashboard" },
            ...(activeTopic ? [{ label: "Aptitude", href: "/aptitude" }, { label: activeTopic }] : [{ label: "Aptitude" }]),
          ]}
        />

        {!activeTopic ? (
          <>
            <section className="card grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
              <div>
                <p className="section-label">Aptitude practice desk</p>
                <h2 className="mt-3 text-[2rem] font-semibold tracking-[-0.05em] text-[var(--text-primary)]">
                  Skill-building that still feels like the product.
                </h2>
                <p className="mt-3 max-w-[42rem] text-[15px] leading-7 text-[var(--text-secondary)]">
                  Pick a lane, stay with the topic you want, and move question by question without dropping into a separate visual system.
                </p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <Button onClick={openRandom} disabled={loading || aptitudeQuestions.length === 0}>
                    <Shuffle size={15} />
                    Open random question
                  </Button>
                  <Button variant="secondary" onClick={() => setActiveTopic("Quantitative Aptitude")}>
                    Start with quant
                  </Button>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  { label: "Total questions", value: loading ? "..." : aptitudeQuestions.length },
                  { label: "Topics", value: APTITUDE_TOPICS.length },
                  {
                    label: "PYQs included",
                    value: loading
                      ? "..."
                      : aptitudeQuestions.filter(question => question.type === "PYQ").length,
                  },
                  { label: "Exams covered", value: 6 },
                ].map(item => (
                  <div key={item.label} className="rounded-[18px] border border-[var(--border)] bg-[var(--surface-1)] p-4">
                    <p className="section-label">{item.label}</p>
                    <p className="mt-3 text-[2rem] font-semibold tracking-[-0.05em] text-[var(--text-primary)]">
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {APTITUDE_TOPICS.map(topic => {
                const meta = TOPIC_META[topic];
                const Icon = meta.icon;

                return (
                  <button
                    key={topic}
                    type="button"
                    onClick={() => setActiveTopic(topic)}
                    className="card group cursor-pointer text-left transition hover:-translate-y-0.5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span className="inline-flex h-11 w-11 items-center justify-center rounded-[14px] border border-[var(--border)] bg-[var(--surface-2)]">
                        <Icon size={17} className={meta.accent} />
                      </span>
                      <span className="text-xs text-[var(--text-faint)]">
                        {topicCounts[topic] || 0} questions
                      </span>
                    </div>
                    <h3 className="mt-5 text-[1.2rem] font-semibold tracking-[-0.03em] text-[var(--text-primary)]">
                      {topic}
                    </h3>
                    <p className="mt-2 text-sm leading-7 text-[var(--text-secondary)]">
                      {meta.description}
                    </p>
                    <div className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[var(--text-primary)] transition group-hover:text-[var(--brand)]">
                      Open topic
                      <ChevronRight size={15} />
                    </div>
                  </button>
                );
              })}
            </section>
          </>
        ) : activeQuestion ? (
          <section className="card overflow-hidden p-0">
            <div className="border-b border-[var(--border)] px-5 py-4 md:px-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-3">
                  <Button variant="secondary" onClick={() => setActiveQuestion(null)}>
                    <ChevronLeft size={14} />
                    Back to topic
                  </Button>
                  <span className="inline-flex items-center rounded-full border border-[var(--brand-muted)] bg-[var(--brand-subtle)] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--brand)]">
                    {activeQuestionIndex + 1} of {visibleQuestions.length}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={toggleBookmark}>
                    {bookmarks.includes(activeQuestion.id) ? (
                      <BookmarkCheck size={15} className="text-[var(--brand)]" />
                    ) : (
                      <Bookmark size={15} />
                    )}
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Flag size={15} />
                  </Button>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <span className={cn(metaChipClassName, examClasses[activeQuestion.exam] || "border-[var(--border)] bg-[var(--surface-1)] text-[var(--text-secondary)]")}>
                  {activeQuestion.exam}
                </span>
                <span className={cn(metaChipClassName, difficultyClasses[activeQuestion.difficulty])}>
                  {activeQuestion.difficulty}
                </span>
                <span className="inline-flex items-center rounded-full border border-[var(--border)] bg-[var(--surface-1)] px-3 py-1.5 text-[11px] font-medium text-[var(--text-secondary)]">
                  {activeQuestion.subtopic}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full border border-[var(--border)] bg-[var(--surface-1)] px-3 py-1.5 text-[11px] font-medium text-[var(--text-secondary)]">
                  <Clock size={11} />
                  {activeQuestion.year ?? "Conceptual"}
                </span>
              </div>
            </div>

            <div className="px-5 py-5 md:px-6">
              <div className="mx-auto max-w-[920px] space-y-5">
                <div className="rounded-[18px] border border-[var(--border)] bg-[var(--surface-1)] px-5 py-5">
                  <p className="section-label">Question</p>
                  <div className="mt-4 whitespace-pre-line text-[1.08rem] font-semibold leading-[1.65] tracking-[-0.025em] text-[var(--text-primary)] md:text-[1.28rem]">
                    {activeQuestion.question}
                  </div>
                </div>

                <div className="space-y-3">
                  {activeQuestion.options.map((option, index) => {
                    const isSelected = selectedOption === index;
                    const hasSubmitted = selectedOption !== null;
                    const isCorrect = index === activeQuestion.correct;

                    return (
                      <button
                        key={`${option}-${index}`}
                        type="button"
                        onClick={() => submitOption(index)}
                        className={cn(
                          "option-btn group",
                          hasSubmitted && isCorrect && "correct",
                          hasSubmitted && isSelected && !isCorrect && "wrong",
                          hasSubmitted && !isSelected && !isCorrect && !isCorrect && "dimmed",
                          !hasSubmitted && isSelected && "border-[var(--brand)] bg-[var(--brand-subtle)]"
                        )}
                      >
                        <span className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-3">
                          <span
                            className={cn(
                              "flex h-10 w-10 items-center justify-center rounded-full border text-sm font-semibold transition-all",
                              hasSubmitted && isCorrect
                                ? "border-[var(--green)] bg-[var(--green)] text-white"
                                : hasSubmitted && isSelected
                                  ? "border-[var(--red)] bg-[var(--red)] text-white"
                                  : isSelected
                                    ? "border-[var(--brand)] bg-[var(--brand)] text-[var(--text-on-brand)]"
                                    : "border-[var(--border)] bg-[var(--surface-1)] text-[var(--text-muted)]"
                            )}
                          >
                            {["A", "B", "C", "D"][index]}
                          </span>
                          <span className="pt-0.5 text-left text-[1rem] leading-7 text-[var(--text-primary)]">
                            {option}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>

                {selectedOption !== null ? (
                  <div
                    className={cn(
                      "rounded-[18px] border px-5 py-5",
                      selectedOption === activeQuestion.correct
                        ? "border-[rgba(86,194,136,0.24)] bg-[rgba(86,194,136,0.1)]"
                        : "border-[rgba(255,140,50,0.24)] bg-[rgba(255,140,50,0.1)]"
                    )}
                  >
                    <p className="section-label">Explanation</p>
                    <p className="mt-3 text-base font-semibold text-[var(--text-primary)]">
                      {selectedOption === activeQuestion.correct
                        ? "Correct. Keep the pace steady."
                        : `Not quite. The right answer is ${["A", "B", "C", "D"][activeQuestion.correct]}.`}
                    </p>
                    <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">
                      {activeQuestion.explanation}
                    </p>
                  </div>
                ) : (
                  <div className="rounded-[18px] border border-[var(--border)] bg-[var(--surface-1)] px-5 py-4 text-sm text-[var(--text-secondary)]">
                    Pick one option to reveal the explanation and move forward.
                  </div>
                )}

                {activeQuestion.tags.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {activeQuestion.tags.map(tag => (
                      <span
                        key={tag}
                        className="rounded-full border border-[var(--border)] bg-[var(--surface-1)] px-3 py-1.5 text-[11px] text-[var(--text-faint)]"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>

            <div className="border-t border-[var(--border)] px-5 py-5 md:px-6">
              <div className="mx-auto grid max-w-[920px] gap-3 md:grid-cols-3">
                <Button
                  variant="secondary"
                  onClick={() => navigateQuestion(-1)}
                  disabled={activeQuestionIndex <= 0}
                >
                  <ChevronLeft size={14} />
                  Previous
                </Button>
                <Button variant="ghost" onClick={openRandom}>
                  <Shuffle size={14} />
                  Random
                </Button>
                <Button
                  onClick={() => navigateQuestion(1)}
                  disabled={
                    activeQuestionIndex < 0 ||
                    activeQuestionIndex >= visibleQuestions.length - 1
                  }
                >
                  Next
                  <ChevronRight size={14} />
                </Button>
              </div>
            </div>
          </section>
        ) : (
          <>
            <section className="card space-y-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <p className="section-label">Topic filters</p>
                  <h2 className="mt-3 text-[1.8rem] font-semibold tracking-[-0.04em] text-[var(--text-primary)]">
                    {activeTopic}
                  </h2>
                  <p className="mt-2 text-sm leading-7 text-[var(--text-secondary)]">
                    Narrow this topic by difficulty or exam, then open any question without leaving the flow.
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <select
                    value={difficultyFilter}
                    onChange={event => setDifficultyFilter(event.target.value as Difficulty | "")}
                    className="min-w-[170px]"
                  >
                    <option value="">All difficulties</option>
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>

                  <select
                    value={examFilter}
                    onChange={event => setExamFilter(event.target.value)}
                    className="min-w-[150px]"
                  >
                    <option value="">All exams</option>
                    {["UPSC", "SSC", "RRB", "IBPS", "TSPSC", "APPSC"].map(exam => (
                      <option key={exam} value={exam}>
                        {exam}
                      </option>
                    ))}
                  </select>

                  <Button variant="secondary" onClick={openRandom} disabled={visibleQuestions.length === 0}>
                    <Shuffle size={14} />
                    Random
                  </Button>
                </div>
              </div>
            </section>

            <section className="space-y-3">
              {loading ? (
                <div className="card flex min-h-[220px] items-center justify-center gap-3 text-sm text-[var(--text-secondary)]">
                  <Loader2 size={16} className="animate-spin text-[var(--brand)]" />
                  Loading aptitude questions...
                </div>
              ) : visibleQuestions.length === 0 ? (
                <div className="card flex min-h-[220px] flex-col items-center justify-center gap-3 text-center">
                  <FileText size={22} className="text-[var(--text-faint)]" />
                  <div>
                    <p className="text-base font-semibold text-[var(--text-primary)]">
                      No questions match these filters
                    </p>
                    <p className="mt-2 text-sm text-[var(--text-secondary)]">
                      Clear a filter or switch topics to widen the set.
                    </p>
                  </div>
                </div>
              ) : (
                visibleQuestions.map((question, index) => (
                  <button
                    key={question.id}
                    type="button"
                    onClick={() => openQuestion(question)}
                    className="card group w-full cursor-pointer text-left transition hover:-translate-y-0.5"
                  >
                    <div className="flex items-center gap-4">
                      <span className="w-5 shrink-0 text-xs text-[var(--text-faint)]">
                        {index + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-2 text-sm font-medium leading-6 text-[var(--text-primary)]">
                          {question.question}
                        </p>
                      </div>
                      <div className="hidden items-center gap-2 md:flex">
                        <span className={cn(metaChipClassName, examClasses[question.exam] || "border-[var(--border)] bg-[var(--surface-1)] text-[var(--text-secondary)]")}>
                          {question.exam}
                        </span>
                        <span className={cn(metaChipClassName, difficultyClasses[question.difficulty])}>
                          {question.difficulty}
                        </span>
                        {solved.includes(question.id) ? (
                          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[rgba(86,194,136,0.24)] bg-[rgba(86,194,136,0.1)] text-[var(--green)]">
                            <BookmarkCheck size={14} />
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </button>
                ))
              )}
            </section>
          </>
        )}
      </div>
    </AppShell>
  );
}
