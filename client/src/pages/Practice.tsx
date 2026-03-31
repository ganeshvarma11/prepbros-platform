import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Minus,
  Plus,
  Share2,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation } from "wouter";

import { PrepBottomNav } from "@/components/prep/PrepBottomNav";
import { PrepButton } from "@/components/prep/PrepButton";
import { PrepCard } from "@/components/prep/PrepCard";
import { PrepLogo } from "@/components/prep/PrepLogo";
import { QuizOption } from "@/components/prep/QuizOption";
import { ScoreCircle } from "@/components/prep/ScoreCircle";
import { SubjectChip } from "@/components/prep/SubjectChip";
import { usePrepPreferences } from "@/contexts/PrepPreferencesContext";
import { useAuth } from "@/contexts/AuthContext";
import { useQuestionBank } from "@/hooks/useQuestionBank";
import { useSwipeable } from "@/hooks/useSwipeable";
import {
  appendStoredSession,
  createSessionId,
  formatDuration,
  getDailyAccuracySeries,
  getDailySubject,
  getDisplayName,
  getQuestionSubject,
  getStoredSessions,
  selectQuizQuestions,
  type DifficultyMode,
  type PracticeSessionRecord,
} from "@/lib/prepbro";
import { saveAnswer } from "@/lib/userProgress";

type QuizStage = "setup" | "quiz" | "results";

type AnswerState = {
  selectedIndex: number;
  isCorrect: boolean;
  answeredAtMs: number;
};

const OPTION_LABELS = ["A", "B", "C", "D"] as const;
const QUESTION_COUNT_OPTIONS = [5, 10, 20, 30] as const;

function formatSeconds(value: number) {
  const minutes = Math.floor(value / 60)
    .toString()
    .padStart(2, "0");
  const seconds = Math.floor(value % 60)
    .toString()
    .padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function getSteppedQuestionCount(
  current: (typeof QUESTION_COUNT_OPTIONS)[number],
  direction: "down" | "up"
) {
  const currentIndex = QUESTION_COUNT_OPTIONS.indexOf(current);
  const nextIndex =
    direction === "down"
      ? Math.max(0, currentIndex - 1)
      : Math.min(QUESTION_COUNT_OPTIONS.length - 1, currentIndex + 1);
  return QUESTION_COUNT_OPTIONS[nextIndex];
}

function Sparkline({ values }: { values: number[] }) {
  const points = values.map((value, index) => {
    const x = (index / Math.max(values.length - 1, 1)) * 180;
    const y = 48 - value * 0.48;
    return `${x},${y}`;
  });

  return (
    <svg viewBox="0 0 180 48" className="h-12 w-full">
      <polyline
        fill="none"
        stroke="var(--color-primary)"
        strokeWidth="3"
        points={points.join(" ")}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

async function shareScoreCard({
  name,
  subject,
  score,
  total,
}: {
  name: string;
  subject: string;
  score: number;
  total: number;
}) {
  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = 1080;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const gradient = ctx.createLinearGradient(0, 0, 1080, 1080);
  gradient.addColorStop(0, "#1A2E5A");
  gradient.addColorStop(1, "#2A4A8C");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 1080, 1080);

  ctx.fillStyle = "#FF6B35";
  ctx.beginPath();
  ctx.roundRect(90, 90, 900, 170, 60);
  ctx.fill();

  ctx.fillStyle = "#ffffff";
  ctx.font = "700 88px Sora";
  ctx.fillText("PrepBros", 140, 190);

  ctx.font = "500 48px DM Sans";
  ctx.fillStyle = "rgba(255,255,255,0.82)";
  ctx.fillText(`${name}'s ${subject} score`, 140, 360);

  ctx.font = "700 240px Sora";
  ctx.fillStyle = "#ffffff";
  ctx.fillText(`${score}/${total}`, 140, 620);

  ctx.font = "500 56px DM Sans";
  ctx.fillStyle = "rgba(255,255,255,0.88)";
  ctx.fillText("10 questions a day. Build the habit.", 140, 760);

  const blob = await new Promise<Blob | null>(resolve =>
    canvas.toBlob(resolve, "image/png")
  );

  if (!blob) return;

  const file = new File([blob], "prepbros-score-card.png", {
    type: "image/png",
  });

  if (
    navigator.share &&
    navigator.canShare &&
    navigator.canShare({ files: [file] })
  ) {
    await navigator.share({
      title: "PrepBros score",
      text: `I scored ${score}/${total} on PrepBros.`,
      files: [file],
    });
    return;
  }

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "prepbros-score-card.png";
  anchor.click();
  URL.revokeObjectURL(url);
}

export default function Practice() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { questions: allQuestions } = useQuestionBank();
  const { preferences } = usePrepPreferences();
  const [stage, setStage] = useState<QuizStage>("setup");
  const [questionCount, setQuestionCount] = useState(preferences.dailyGoal);
  const [difficulty, setDifficulty] = useState<DifficultyMode>("Mixed");
  const [quizQuestions, setQuizQuestions] = useState<typeof allQuestions>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, AnswerState>>({});
  const [elapsed, setElapsed] = useState(0);
  const [sessionStart, setSessionStart] = useState<number | null>(null);
  const [questionStartedAt, setQuestionStartedAt] = useState(Date.now());
  const [sessionRecord, setSessionRecord] = useState<PracticeSessionRecord | null>(
    null
  );
  const [showWrongReview, setShowWrongReview] = useState(false);
  const timerRef = useRef<number | null>(null);
  const subject = getDailySubject(preferences);
  const isHindi = preferences.language === "hi";
  const displayName = getDisplayName(user);

  useEffect(() => {
    if (stage !== "quiz" || !sessionStart) return;
    timerRef.current = window.setInterval(() => {
      setElapsed(Math.floor((Date.now() - sessionStart) / 1000));
    }, 1000);

    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [sessionStart, stage]);

  const currentQuestion = quizQuestions[currentIndex];
  const currentAnswer = answers[currentIndex];
  const swipe = useSwipeable({
    onSwipeLeft: () => {
      if (!currentAnswer) return;
      if (currentIndex < quizQuestions.length - 1) {
        setCurrentIndex(index => index + 1);
        setQuestionStartedAt(Date.now());
      } else {
        finishQuiz();
      }
    },
    onSwipeRight: () => {
      if (currentIndex === 0) return;
      setCurrentIndex(index => index - 1);
      setQuestionStartedAt(Date.now());
    },
  });

  const latestSeries = useMemo(() => {
    const values = getDailyAccuracySeries(getStoredSessions(), 7).map(
      item => item.accuracy
    );
    return values.length ? values : [0, 0, 0, 0, 0, 0, 0];
  }, [sessionRecord]);

  function startQuiz() {
    const nextQuestions = selectQuizQuestions({
      allQuestions,
      exam: preferences.exam,
      subject,
      difficulty,
      count: questionCount,
    });

    setQuizQuestions(nextQuestions);
    setAnswers({});
    setCurrentIndex(0);
    setElapsed(0);
    setQuestionStartedAt(Date.now());
    setSessionStart(Date.now());
    setStage("quiz");
    setSessionRecord(null);
    setShowWrongReview(false);
  }

  function finishQuiz() {
    const answerEntries = Object.entries(answers);
    const correctCount = answerEntries.filter(([, value]) => value.isCorrect).length;
    const wrongCount = answerEntries.length - correctCount;
    const session: PracticeSessionRecord = {
      id: createSessionId(),
      exam: preferences.exam,
      subject,
      totalQuestions: quizQuestions.length,
      correctCount,
      wrongCount,
      skippedCount: Math.max(0, quizQuestions.length - answerEntries.length),
      durationSec: elapsed,
      completedAt: new Date().toISOString(),
      accuracy: quizQuestions.length
        ? Math.round((correctCount / quizQuestions.length) * 100)
        : 0,
      answers: quizQuestions.map((question, index) => {
        const answer = answers[index];
        return {
          questionId: question.id,
          subject,
          selectedIndex: answer?.selectedIndex ?? -1,
          isCorrect: answer?.isCorrect ?? false,
          timeTakenSec: answer
            ? Math.max(
                1,
                Math.round((answer.answeredAtMs - (sessionStart ?? answer.answeredAtMs)) / 1000)
              )
            : 0,
        };
      }),
    };

    appendStoredSession(session);
    setSessionRecord(session);
    setStage("results");
  }

  async function handleSelectOption(optionIndex: number) {
    if (!currentQuestion || currentAnswer) return;

    const answeredAtMs = Date.now();
    const isCorrect = currentQuestion.correct === optionIndex;
    setAnswers(current => ({
      ...current,
      [currentIndex]: {
        selectedIndex: optionIndex,
        isCorrect,
        answeredAtMs,
      },
    }));

    if (user) {
      void saveAnswer(
        user.id,
        currentQuestion.id,
        isCorrect,
        optionIndex,
        Math.max(1, Math.round((answeredAtMs - questionStartedAt) / 1000))
      );
    }
  }

  function resetQuiz() {
    setStage("setup");
    setAnswers({});
    setQuizQuestions([]);
    setSessionRecord(null);
    setElapsed(0);
  }

  const resultAccuracy = sessionRecord?.accuracy ?? 0;
  const wrongQuestions = quizQuestions.filter((_, index) => !answers[index]?.isCorrect);

  return (
    <div className="min-h-screen bg-[var(--color-background)] pb-28">
      {stage !== "quiz" ? (
        <>
          <header className="border-b border-[var(--color-border)] bg-[rgba(255,255,255,0.92)] backdrop-blur dark:bg-[rgba(34,40,64,0.92)]">
            <div className="pb-container flex items-center justify-between px-0 py-4">
              <div className="flex items-center gap-3">
                <PrepLogo compact />
                <div>
                  <p className="text-[var(--text-sm)] text-[var(--color-text-muted)]">
                    {isHindi ? "आज का विषय" : "Subject of the day"}
                  </p>
                  <h1 className="font-[var(--font-body)] text-[var(--text-md)] font-bold">
                    {subject}
                  </h1>
                </div>
              </div>
              <Link href="/dashboard">
                <span className="inline-flex cursor-pointer items-center gap-2 text-[var(--text-sm)] font-medium text-[var(--color-accent)]">
                  <ArrowLeft className="h-4 w-4" />
                  {isHindi ? "डैशबोर्ड" : "Dashboard"}
                </span>
              </Link>
            </div>
          </header>

          <main className="pb-container px-0 py-6">
            {stage === "setup" ? (
              <PrepCard className="mx-auto max-w-3xl p-6 md:p-8">
                <div className="flex items-center gap-3">
                  <SubjectChip subject={subject} active />
                  <span className="text-[var(--text-sm)] text-[var(--color-text-muted)]">
                    {preferences.exam}
                  </span>
                </div>
                <h2 className="mt-6 text-[clamp(30px,5vw,44px)]">
                  {isHindi ? "शुरू करने से पहले एक झलक" : "A quick setup before you begin"}
                </h2>
                <p className="mt-3 text-[var(--text-base)] text-[var(--color-text-secondary)]">
                  {isHindi
                    ? "फोकस एक ही है: साफ़ स्क्रीन, निश्चित समय, और बिना विचलन के पूरा क्विज़।"
                    : "One clear goal: finish a focused quiz with zero clutter and instant feedback."}
                </p>

                <div className="mt-8">
                  <p className="text-[var(--text-sm)] text-[var(--color-text-muted)]">
                    {isHindi ? "कितने सवाल?" : "How many questions?"}
                  </p>
                  <div className="mt-3 inline-flex items-center rounded-[var(--radius-full)] border border-[var(--color-border)] bg-[var(--color-surface)] p-1">
                    <button
                      type="button"
                      onClick={() =>
                        setQuestionCount(value => getSteppedQuestionCount(value, "down"))
                      }
                      className="inline-flex h-11 w-11 items-center justify-center rounded-full text-[var(--color-text-primary)]"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="min-w-[72px] text-center font-[var(--font-mono)] text-[var(--text-lg)] font-medium">
                      {questionCount}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setQuestionCount(value => getSteppedQuestionCount(value, "up"))
                      }
                      className="inline-flex h-11 w-11 items-center justify-center rounded-full text-[var(--color-text-primary)]"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="mt-8">
                  <p className="text-[var(--text-sm)] text-[var(--color-text-muted)]">
                    {isHindi ? "कठिनाई स्तर" : "Difficulty"}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-3">
                    {(["Easy", "Medium", "Hard", "Mixed"] as const).map(item => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => setDifficulty(item)}
                        className={`rounded-[var(--radius-full)] border px-4 py-3 text-[var(--text-sm)] font-medium transition ${
                          difficulty === item
                            ? "border-[var(--color-accent)] bg-[#fff3ef] text-[var(--color-accent)]"
                            : "border-[var(--color-border)] bg-[var(--color-surface-raised)] text-[var(--color-text-primary)]"
                        }`}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-8 flex items-center gap-3 rounded-[var(--radius-lg)] bg-[var(--color-surface)] px-4 py-4 text-[var(--text-base)] text-[var(--color-text-secondary)]">
                  <Clock3 className="h-5 w-5 text-[var(--color-accent)]" />
                  ~{Math.max(5, Math.round(questionCount * 0.8))}{" "}
                  {isHindi ? "मिनट" : "minutes"}
                </div>

                <div className="mt-8">
                  <PrepButton size="lg" fullWidth onClick={startQuiz}>
                    {isHindi ? "क्विज़ शुरू करें" : "Begin Quiz"}{" "}
                    <ArrowRight className="ml-1 inline h-4 w-4" />
                  </PrepButton>
                </div>
              </PrepCard>
            ) : null}

            {stage === "results" && sessionRecord ? (
              <div className="mx-auto max-w-4xl">
                {resultAccuracy >= 70 ? (
                  <div className="pointer-events-none fixed inset-0 overflow-hidden">
                    {Array.from({ length: 18 }).map((_, index) => (
                      <span
                        key={index}
                        className="absolute h-3 w-3 rounded-sm"
                        style={{
                          left: `${5 + index * 5}%`,
                          top: "-20px",
                          background:
                            index % 3 === 0
                              ? "var(--color-accent)"
                              : index % 3 === 1
                                ? "var(--color-success)"
                                : "var(--color-warning)",
                          animation: `pb-confetti ${2.3 + (index % 4) * 0.18}s linear infinite`,
                          animationDelay: `${index * 60}ms`,
                        }}
                      />
                    ))}
                  </div>
                ) : null}

                <PrepCard className="p-6 md:p-8">
                  <ScoreCircle
                    score={sessionRecord.correctCount}
                    total={sessionRecord.totalQuestions}
                  />
                  <h2 className="mt-6 text-center text-[clamp(28px,4vw,42px)]">
                    {resultAccuracy >= 70
                      ? isHindi
                        ? "बहुत बढ़िया!"
                        : "Strong finish!"
                      : isHindi
                        ? "अच्छी कोशिश, जारी रखें"
                        : "Good effort, keep the habit alive"}
                  </h2>

                  <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
                    {[
                      {
                        label: isHindi ? "सही" : "Correct",
                        value: sessionRecord.correctCount,
                      },
                      {
                        label: isHindi ? "गलत" : "Wrong",
                        value: sessionRecord.wrongCount,
                      },
                      {
                        label: isHindi ? "छूटे" : "Skipped",
                        value: sessionRecord.skippedCount,
                      },
                      {
                        label: isHindi ? "समय" : "Time",
                        value: formatDuration(sessionRecord.durationSec),
                      },
                    ].map(item => (
                      <div
                        key={item.label}
                        className="rounded-[var(--radius-lg)] bg-[var(--color-surface)] px-4 py-4 text-center"
                      >
                        <p className="text-[var(--text-sm)] text-[var(--color-text-muted)]">
                          {item.label}
                        </p>
                        <p className="mt-2 text-[var(--text-xl)] font-bold text-[var(--color-text-primary)]">
                          {item.value}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 rounded-[var(--radius-lg)] bg-[var(--color-surface)] p-4">
                    <p className="text-[var(--text-sm)] text-[var(--color-text-muted)]">
                      {isHindi ? "पिछले 7 सेशन की accuracy trend" : "Accuracy trend over your last 7 sessions"}
                    </p>
                    <div className="mt-4">
                      <Sparkline values={latestSeries} />
                    </div>
                  </div>

                  <div className="mt-8 flex flex-col gap-3 md:flex-row">
                    <PrepButton
                      variant="secondary"
                      size="lg"
                      fullWidth
                      onClick={() => setShowWrongReview(value => !value)}
                    >
                      {showWrongReview
                        ? isHindi
                          ? "रिव्यू छिपाएं"
                          : "Hide Review"
                        : isHindi
                          ? "गलत उत्तर रिव्यू करें"
                          : "Review Wrong Answers"}
                    </PrepButton>
                    <PrepButton variant="outline" size="lg" fullWidth onClick={resetQuiz}>
                      {isHindi ? "फिर से प्रैक्टिस करें" : "Practice Again"}
                    </PrepButton>
                  </div>

                  <div className="mt-3">
                    <PrepButton
                      variant="ghost"
                      size="md"
                      fullWidth
                      onClick={() =>
                        shareScoreCard({
                          name: displayName,
                          subject,
                          score: sessionRecord.correctCount,
                          total: sessionRecord.totalQuestions,
                        })
                      }
                    >
                      <Share2 className="h-4 w-4" />
                      {isHindi ? "मेरा स्कोर शेयर करें" : "Share my score"}
                    </PrepButton>
                  </div>

                  {showWrongReview ? (
                    <div className="mt-8 space-y-4">
                      {wrongQuestions.map(question => (
                        <PrepCard key={question.id} className="p-5">
                          <SubjectChip subject={getQuestionSubject(question)} />
                          <p className="mt-4 text-[var(--text-base)] text-[var(--color-text-primary)]">
                            {question.question}
                          </p>
                          <p className="mt-3 text-[var(--text-sm)] text-[var(--color-text-secondary)]">
                            {question.explanation}
                          </p>
                        </PrepCard>
                      ))}
                    </div>
                  ) : null}

                  <div className="mt-6 text-center">
                    <button
                      type="button"
                      onClick={() => setLocation("/dashboard")}
                      className="text-[var(--text-sm)] text-[var(--color-accent)]"
                    >
                      {isHindi ? "डैशबोर्ड पर वापस जाएं" : "Back to Dashboard"}
                    </button>
                  </div>
                </PrepCard>
              </div>
            ) : null}
          </main>

          <PrepBottomNav />
        </>
      ) : (
        <div className="min-h-screen bg-[var(--color-background)]">
          <div className="sticky top-0 z-50 border-b border-[var(--color-border)] bg-[rgba(250,250,248,0.96)] px-4 py-4 backdrop-blur dark:bg-[rgba(15,20,32,0.96)]">
            <div className="mx-auto flex max-w-4xl items-center gap-4">
              <span className="min-w-[60px] text-[var(--text-sm)] font-medium text-[var(--color-text-primary)]">
                Q {currentIndex + 1} / {quizQuestions.length}
              </span>
              <div className="h-2 flex-1 rounded-full bg-[var(--color-surface)]">
                <div
                  className="h-full rounded-full bg-[var(--color-accent)] transition-all"
                  style={{
                    width: `${((currentIndex + (currentAnswer ? 1 : 0)) / quizQuestions.length) * 100}%`,
                  }}
                />
              </div>
              <span className="font-[var(--font-mono)] text-[var(--text-sm)] text-[var(--color-text-primary)]">
                {formatSeconds(elapsed)}
              </span>
              <button
                type="button"
                onClick={() => {
                  if (
                    window.confirm(
                      isHindi
                        ? "क्या आप क्विज़ छोड़ना चाहते हैं?"
                        : "Are you sure you want to exit the quiz?"
                    )
                  ) {
                    resetQuiz();
                  }
                }}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface-raised)]"
                aria-label={isHindi ? "क्विज़ छोड़ें" : "Exit quiz"}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="mx-auto flex max-w-4xl flex-col px-4 py-6">
            <div
              {...swipe.bind}
              style={{
                transform: `translateX(${swipe.offsetX}px)`,
                transition: swipe.isDragging ? "none" : "transform 250ms ease-out",
                touchAction: swipe.touchAction,
              }}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentQuestion?.id}
                  initial={{ opacity: 0, x: 22 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -22 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                >
                  {currentQuestion ? (
                    <PrepCard className="rounded-[var(--radius-xl)] p-6 md:p-8">
                      <SubjectChip subject={getQuestionSubject(currentQuestion)} />
                      <p className="mt-5 text-[var(--text-md)] text-[var(--color-text-primary)]">
                        {currentQuestion.question}
                      </p>

                      <div className="mt-6 grid gap-3">
                        {currentQuestion.options.map((option, optionIndex) => {
                          let state: "default" | "selected" | "correct" | "incorrect" | "showing-correct" =
                            "default";

                          if (currentAnswer) {
                            if (optionIndex === currentAnswer.selectedIndex) {
                              state = currentAnswer.isCorrect ? "correct" : "incorrect";
                            }
                            if (
                              !currentAnswer.isCorrect &&
                              optionIndex === currentQuestion.correct
                            ) {
                              state = "showing-correct";
                            }
                          }

                          return (
                            <QuizOption
                              key={option}
                              label={OPTION_LABELS[optionIndex]}
                              text={option}
                              state={state}
                              disabled={Boolean(currentAnswer)}
                              onClick={() => handleSelectOption(optionIndex)}
                            />
                          );
                        })}
                      </div>
                    </PrepCard>
                  ) : null}
                </motion.div>
              </AnimatePresence>
            </div>

            {currentAnswer && currentQuestion ? (
              <div
                className={`fixed inset-x-0 bottom-0 z-[80] border-t px-4 pb-[calc(env(safe-area-inset-bottom)+16px)] pt-4 shadow-[0_-10px_26px_rgba(0,0,0,0.08)] animate-[pb-slide-up_300ms_ease] ${
                  currentAnswer.isCorrect
                    ? "border-[rgba(46,204,113,0.3)] bg-[var(--color-success-light)]"
                    : "border-[rgba(231,76,60,0.3)] bg-[var(--color-danger-light)]"
                }`}
              >
                <div className="mx-auto max-w-4xl">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p
                        className={`text-[var(--text-md)] font-bold ${
                          currentAnswer.isCorrect
                            ? "text-[var(--color-success)]"
                            : "text-[var(--color-danger)]"
                        }`}
                      >
                        {currentAnswer.isCorrect
                          ? isHindi
                            ? "सही!"
                            : "Correct!"
                          : isHindi
                            ? "गलत"
                            : "Incorrect"}
                      </p>
                      <p className="mt-2 text-[var(--text-sm)] text-[var(--color-text-secondary)]">
                        {currentQuestion.explanation}
                      </p>
                      <button
                        type="button"
                        className="mt-2 text-[var(--text-xs)] text-[var(--color-text-muted)] underline"
                      >
                        {isHindi ? "समस्या रिपोर्ट करें" : "Report issue"}
                      </button>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        if (currentIndex > 0) {
                          setCurrentIndex(index => index - 1);
                          setQuestionStartedAt(Date.now());
                        }
                      }}
                      className="inline-flex h-[52px] w-[52px] items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface-raised)]"
                      aria-label={isHindi ? "पिछला सवाल" : "Previous question"}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <PrepButton
                      fullWidth
                      size="lg"
                      onClick={() => {
                        if (currentIndex < quizQuestions.length - 1) {
                          setCurrentIndex(index => index + 1);
                          setQuestionStartedAt(Date.now());
                        } else {
                          finishQuiz();
                        }
                      }}
                    >
                      {currentIndex === quizQuestions.length - 1
                        ? isHindi
                          ? "रिज़ल्ट देखें"
                          : "See Results"
                        : isHindi
                          ? "अगला सवाल"
                          : "Next Question"}{" "}
                      <ChevronRight className="ml-1 inline h-4 w-4" />
                    </PrepButton>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
