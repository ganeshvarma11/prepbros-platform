import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Clock, AlertTriangle, CheckCircle, XCircle, SkipForward } from "lucide-react";
import { MockTestConfig } from "./MockTestGenerator";

interface Question {
  id: number;
  topic: string;
  question: string;
  options: string[];
  correct: number;
  difficulty: "easy" | "medium" | "hard";
  explanation: string;
}

interface MockTestSessionProps {
  config: MockTestConfig;
  onComplete: (results: TestResults) => void;
  onExit: () => void;
}

export interface TestResults {
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  skippedQuestions: number;
  accuracy: number;
  timeSpent: number;
  topicWisePerformance: Record<string, { correct: number; total: number }>;
  config: MockTestConfig;
}

// Mock question generator - in production, this would come from backend
const generateMockQuestions = (config: MockTestConfig): Question[] => {
  const topicQuestions: Record<string, Question[]> = {
    polity: [
      {
        id: 1,
        topic: "Polity",
        question: "Which article of the Indian Constitution deals with the abolition of slavery?",
        options: ["Article 21", "Article 23", "Article 25", "Article 27"],
        correct: 1,
        difficulty: "medium",
        explanation:
          "Article 23 of the Indian Constitution prohibits traffic in human beings and forced labour. This is a fundamental right that protects individuals from exploitation.",
      },
      {
        id: 2,
        topic: "Polity",
        question: "The Directive Principles of State Policy are enshrined in which part of the Constitution?",
        options: ["Part III", "Part IV", "Part V", "Part VI"],
        correct: 1,
        difficulty: "easy",
        explanation:
          "The Directive Principles of State Policy are contained in Part IV of the Indian Constitution (Articles 36-51). They are non-justiciable principles that guide the state in making policies.",
      },
    ],
    history: [
      {
        id: 3,
        topic: "History",
        question: "Who was the first President of the Indian National Congress?",
        options: ["Dadabhai Naoroji", "W.C. Banerjee", "Surendranath Banerjee", "Anand Mohan Bose"],
        correct: 1,
        difficulty: "medium",
        explanation:
          "W.C. Banerjee was the first President of the Indian National Congress when it was founded in 1885. Dadabhai Naoroji was the first Indian President of the Congress.",
      },
    ],
    geography: [
      {
        id: 4,
        topic: "Geography",
        question: "Which is the longest river in India?",
        options: ["Brahmaputra", "Ganges", "Godavari", "Yamuna"],
        correct: 1,
        difficulty: "easy",
        explanation:
          "The Ganges is the longest river in India with a length of approximately 2,525 km. It is also the most sacred river in Hinduism.",
      },
    ],
    economy: [
      {
        id: 5,
        topic: "Economy",
        question: "What is the primary objective of the Reserve Bank of India?",
        options: [
          "To maximize profits",
          "Monetary stability and development",
          "To control stock market",
          "To manage government accounts only",
        ],
        correct: 1,
        difficulty: "medium",
        explanation:
          "The primary objective of the RBI is to maintain monetary stability and to support the economic development of the country. It acts as the central bank of India.",
      },
    ],
    environment: [
      {
        id: 6,
        topic: "Environment",
        question: "Which of the following is a greenhouse gas?",
        options: ["Nitrogen", "Oxygen", "Carbon Dioxide", "Argon"],
        correct: 2,
        difficulty: "easy",
        explanation:
          "Carbon Dioxide (CO2) is a major greenhouse gas that contributes to global warming. It is produced by burning fossil fuels and other human activities.",
      },
    ],
  };

  const allQuestions: Question[] = [];
  config.selectedTopics.forEach((topic) => {
    const topicQs = topicQuestions[topic] || [];
    allQuestions.push(...topicQs);
  });

  // Shuffle and limit to questionCount
  return allQuestions
    .sort(() => Math.random() - 0.5)
    .slice(0, config.questionCount);
};

export default function MockTestSession({
  config,
  onComplete,
  onExit,
}: MockTestSessionProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [timeRemaining, setTimeRemaining] = useState(config.timeLimit * 60);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [showReview, setShowReview] = useState(false);

  useEffect(() => {
    // Generate mock questions
    const generatedQuestions = generateMockQuestions(config);
    setQuestions(generatedQuestions);
    setAnswers(new Array(generatedQuestions.length).fill(null));
  }, [config]);

  useEffect(() => {
    if (timeRemaining <= 0) {
      handleSubmitTest();
      return;
    }

    const timer = setInterval(() => {
      setTimeRemaining((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining]);

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  const isTimeWarning = timeRemaining < 300; // 5 minutes

  const handleAnswerSelect = (optionIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = optionIndex;
    setAnswers(newAnswers);
  };

  const handleSkipQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handleSubmitTest = () => {
    const correctAnswers = answers.filter(
      (answer, idx) => answer !== null && answer === questions[idx]?.correct
    ).length;
    const skippedQuestions = answers.filter((a) => a === null).length;
    const wrongAnswers = questions.length - correctAnswers - skippedQuestions;

    // Calculate topic-wise performance
    const topicWisePerformance: Record<string, { correct: number; total: number }> = {};
    config.selectedTopics.forEach((topic) => {
      topicWisePerformance[topic] = { correct: 0, total: 0 };
    });

    questions.forEach((q, idx) => {
      if (topicWisePerformance[q.topic]) {
        topicWisePerformance[q.topic].total++;
        if (answers[idx] === q.correct) {
          topicWisePerformance[q.topic].correct++;
        }
      }
    });

    const results: TestResults = {
      totalQuestions: questions.length,
      correctAnswers,
      wrongAnswers,
      skippedQuestions,
      accuracy: Math.round((correctAnswers / questions.length) * 100),
      timeSpent: config.timeLimit * 60 - timeRemaining,
      topicWisePerformance,
      config,
    };

    onComplete(results);
  };

  if (!currentQuestion) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">Loading test...</p>
        </div>
      </div>
    );
  }

  if (showReview) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-900 p-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-8">
            Test Review
          </h2>

          <div className="space-y-6">
            {questions.map((question, idx) => {
              const userAnswer = answers[idx];
              const isCorrect = userAnswer === question.correct;
              const isSkipped = userAnswer === null;

              return (
                <Card
                  key={question.id}
                  className={`p-6 border-2 ${
                    isSkipped
                      ? "border-gray-300 dark:border-slate-600"
                      : isCorrect
                      ? "border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/20"
                      : "border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20"
                  }`}
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                          Q{idx + 1}
                        </span>
                        {isSkipped ? (
                          <span className="text-xs px-2 py-1 bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded">
                            Skipped
                          </span>
                        ) : isCorrect ? (
                          <span className="text-xs px-2 py-1 bg-green-200 dark:bg-green-900 text-green-800 dark:text-green-200 rounded flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" /> Correct
                          </span>
                        ) : (
                          <span className="text-xs px-2 py-1 bg-red-200 dark:bg-red-900 text-red-800 dark:text-red-200 rounded flex items-center gap-1">
                            <XCircle className="w-3 h-3" /> Wrong
                          </span>
                        )}
                      </div>
                      <p className="font-semibold text-slate-900 dark:text-white mb-3">
                        {question.question}
                      </p>

                      <div className="space-y-2 mb-4">
                        {question.options.map((option, optIdx) => (
                          <div
                            key={optIdx}
                            className={`p-3 rounded-lg border-2 ${
                              optIdx === question.correct
                                ? "border-green-500 bg-green-50 dark:bg-green-900/30"
                                : optIdx === userAnswer && !isCorrect
                                ? "border-red-500 bg-red-50 dark:bg-red-900/30"
                                : "border-gray-200 dark:border-slate-700"
                            }`}
                          >
                            <p className="text-sm">
                              <span className="font-semibold">
                                {String.fromCharCode(65 + optIdx)}.
                              </span>{" "}
                              {option}
                            </p>
                          </div>
                        ))}
                      </div>

                      {config.includeExplanations && (
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                          <p className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-2">
                            Explanation:
                          </p>
                          <p className="text-sm text-blue-800 dark:text-blue-300">
                            {question.explanation}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          <div className="mt-8 flex gap-3 justify-center">
            <Button
              onClick={() => setShowReview(false)}
              className="bg-orange-500 hover:bg-orange-600 text-white font-semibold"
            >
              Back to Results
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Question {currentQuestionIndex + 1} of {questions.length}
              </p>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {currentQuestion.topic}
              </h2>
            </div>

            <div className={`flex items-center gap-2 text-2xl font-bold ${
              isTimeWarning ? "text-red-600 dark:text-red-400" : "text-orange-500"
            }`}>
              <Clock className="w-6 h-6" />
              {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
            </div>
          </div>

          <Progress value={progress} className="h-2" />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto p-4 py-8">
        {/* Question */}
        <Card className="p-8 mb-8 bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="inline-block px-3 py-1 bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 rounded-full text-sm font-semibold">
                {currentQuestion.difficulty}
              </span>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-8">
              {currentQuestion.question}
            </h3>
          </div>

          {/* Options */}
          <div className="space-y-3 mb-8">
            {currentQuestion.options.map((option, idx) => (
              <button
                key={idx}
                onClick={() => handleAnswerSelect(idx)}
                className={`w-full p-4 text-left rounded-lg border-2 transition-all duration-200 ${
                  answers[currentQuestionIndex] === idx
                    ? "border-orange-500 bg-orange-50 dark:bg-orange-900/20"
                    : "border-gray-200 dark:border-slate-700 hover:border-orange-300 dark:hover:border-orange-700"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold ${
                      answers[currentQuestionIndex] === idx
                        ? "border-orange-500 bg-orange-500 text-white"
                        : "border-gray-300 dark:border-slate-600 text-gray-600 dark:text-gray-400"
                    }`}
                  >
                    {String.fromCharCode(65 + idx)}
                  </div>
                  <span className="text-slate-900 dark:text-white">{option}</span>
                </div>
              </button>
            ))}
          </div>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex gap-3 justify-between mb-8">
          <div className="flex gap-3">
            <Button
              onClick={handlePreviousQuestion}
              disabled={currentQuestionIndex === 0}
              variant="outline"
              className="border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700"
            >
              Previous
            </Button>
            <Button
              onClick={handleSkipQuestion}
              variant="outline"
              className="border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 flex items-center gap-2"
            >
              <SkipForward className="w-4 h-4" />
              Skip
            </Button>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={() => setShowExitConfirm(true)}
              variant="outline"
              className="border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              Exit Test
            </Button>

            {currentQuestionIndex === questions.length - 1 ? (
              <Button
                onClick={handleSubmitTest}
                className="bg-green-500 hover:bg-green-600 text-white font-semibold"
              >
                Submit Test
              </Button>
            ) : (
              <Button
                onClick={handleNextQuestion}
                className="bg-orange-500 hover:bg-orange-600 text-white font-semibold"
              >
                Next
              </Button>
            )}
          </div>
        </div>

        {/* Question Navigator */}
        <Card className="p-6 bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700">
          <p className="text-sm font-semibold text-slate-900 dark:text-white mb-4">
            Quick Navigation
          </p>
          <div className="grid grid-cols-10 gap-2">
            {questions.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentQuestionIndex(idx)}
                className={`w-full aspect-square rounded-lg font-semibold text-sm transition-all duration-200 ${
                  idx === currentQuestionIndex
                    ? "bg-orange-500 text-white border-2 border-orange-600"
                    : answers[idx] !== null
                    ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border-2 border-green-300 dark:border-green-700"
                    : "bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-slate-600"
                }`}
              >
                {idx + 1}
              </button>
            ))}
          </div>
        </Card>
      </div>

      {/* Exit Confirmation Dialog */}
      <AlertDialog open={showExitConfirm} onOpenChange={setShowExitConfirm}>
        <AlertDialogContent className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-slate-900 dark:text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              Exit Test?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600 dark:text-gray-400">
              Are you sure you want to exit? Your progress will not be saved.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel className="border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700">
              Continue Test
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={onExit}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Exit
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
