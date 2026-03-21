import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { AlertCircle, CheckCircle2, XCircle, RotateCcw, Zap } from "lucide-react";
import { toast } from "sonner";
import MockTestGenerator, { MockTestConfig } from "@/components/MockTestGenerator";
import MockTestSession, { TestResults } from "@/components/MockTestSession";

interface Question {
  id: number;
  text: string;
  options: string[];
  correct: number;
  explanation: string;
  difficulty: "Easy" | "Medium" | "Hard";
}

interface TopicQuestions {
  [key: string]: Question[];
}

const QUESTIONS_DATA: TopicQuestions = {
  Polity: [
    {
      id: 1,
      text: "Which Article of the Indian Constitution deals with the Right to Education?",
      options: ["Article 19", "Article 21A", "Article 24", "Article 32"],
      correct: 1,
      explanation: "Article 21A was inserted by the 86th Constitutional Amendment Act 2002, making free and compulsory education a fundamental right for children aged 6-14.",
      difficulty: "Easy",
    },
    {
      id: 2,
      text: "The concept of 'Judicial Review' in India is borrowed from which country?",
      options: ["UK", "USA", "Canada", "Australia"],
      correct: 1,
      explanation: "India borrowed the concept of Judicial Review from the USA, though in India it is more limited in scope than in the American system.",
      difficulty: "Medium",
    },
    {
      id: 3,
      text: "Which Article of the Constitution provides for the abolition of untouchability?",
      options: ["Article 15", "Article 17", "Article 19", "Article 21"],
      correct: 1,
      explanation: "Article 17 abolishes untouchability and prohibits its practice in any form. Enforcement of any disability arising out of untouchability is forbidden.",
      difficulty: "Easy",
    },
    {
      id: 4,
      text: "The President of India can dissolve the Lok Sabha on the advice of:",
      options: ["Prime Minister", "Chief Justice", "Speaker", "Vice President"],
      correct: 0,
      explanation: "The President can dissolve the Lok Sabha on the advice of the Prime Minister, as per Article 85 of the Constitution.",
      difficulty: "Medium",
    },
    {
      id: 5,
      text: "Which constitutional amendment introduced the concept of 'Fundamental Duties'?",
      options: ["42nd Amendment", "44th Amendment", "52nd Amendment", "73rd Amendment"],
      correct: 0,
      explanation: "The 42nd Constitutional Amendment, passed in 1976, introduced Part IVA which contains the Fundamental Duties of citizens.",
      difficulty: "Hard",
    },
  ],
  History: [
    {
      id: 1,
      text: "The Indus Valley Civilization was discovered in the year?",
      options: ["1901", "1911", "1921", "1931"],
      correct: 2,
      explanation: "The Indus Valley Civilisation was discovered in 1921 when excavations began at Harappa under the Archaeological Survey of India.",
      difficulty: "Easy",
    },
    {
      id: 2,
      text: "Who was the founder of the Mauryan Empire?",
      options: ["Ashoka", "Chandragupta Maurya", "Bindusara", "Brihadratha"],
      correct: 1,
      explanation: "Chandragupta Maurya founded the Mauryan Empire around 322 BCE with the help of Chanakya (Kautilya).",
      difficulty: "Easy",
    },
    {
      id: 3,
      text: "The Battle of Plassey was fought in which year?",
      options: ["1757", "1764", "1775", "1780"],
      correct: 0,
      explanation: "The Battle of Plassey was fought on June 23, 1757, between the British East India Company and the Nawab of Bengal.",
      difficulty: "Medium",
    },
    {
      id: 4,
      text: "Which Mughal emperor built the Taj Mahal?",
      options: ["Akbar", "Jahangir", "Shah Jahan", "Aurangzeb"],
      correct: 2,
      explanation: "Emperor Shah Jahan built the Taj Mahal in memory of his beloved wife Mumtaz Mahal. Construction began in 1632 and was completed in 1653.",
      difficulty: "Easy",
    },
    {
      id: 5,
      text: "The Revolt of 1857 started from which place?",
      options: ["Delhi", "Meerut", "Kanpur", "Lucknow"],
      correct: 1,
      explanation: "The Revolt of 1857 started from Meerut on May 10, 1857, when Indian soldiers (sepoys) rebelled against the British East India Company.",
      difficulty: "Medium",
    },
  ],
  Geography: [
    {
      id: 1,
      text: "Which river is known as the 'Sorrow of Bihar'?",
      options: ["Gandak", "Kosi", "Ghaghara", "Bagmati"],
      correct: 1,
      explanation: "The Kosi river is called the Sorrow of Bihar due to its frequent and devastating floods that cause massive destruction in the state.",
      difficulty: "Easy",
    },
    {
      id: 2,
      text: "The Western Ghats are located in which part of India?",
      options: ["North", "South", "East", "Northeast"],
      correct: 1,
      explanation: "The Western Ghats run along the western coast of India, primarily in the southern part, extending from Gujarat to Kerala.",
      difficulty: "Easy",
    },
    {
      id: 3,
      text: "Which is the highest peak in India?",
      options: ["Kangchenjunga", "Makalu", "Mount Everest", "Kanchenjunga"],
      correct: 0,
      explanation: "Kangchenjunga (8,586 m) is the highest peak in India, located in the Himalayas on the India-Nepal border.",
      difficulty: "Easy",
    },
    {
      id: 4,
      text: "The Deccan Plateau is located in which part of India?",
      options: ["North", "South", "East", "West"],
      correct: 1,
      explanation: "The Deccan Plateau is located in the southern part of India, covering most of the Peninsular India.",
      difficulty: "Medium",
    },
    {
      id: 5,
      text: "Which state has the longest coastline in India?",
      options: ["Maharashtra", "Odisha", "Andhra Pradesh", "Gujarat"],
      correct: 3,
      explanation: "Gujarat has the longest coastline in India, spanning approximately 1,600 km along the Arabian Sea.",
      difficulty: "Medium",
    },
  ],
  Environment: [
    {
      id: 1,
      text: "The 'Paris Agreement' on climate change was adopted in which year?",
      options: ["2012", "2015", "2017", "2019"],
      correct: 1,
      explanation: "The Paris Agreement was adopted on December 12, 2015 at COP21 and entered into force on November 4, 2016.",
      difficulty: "Easy",
    },
    {
      id: 2,
      text: "Which gas is primarily responsible for the greenhouse effect?",
      options: ["Nitrogen", "Oxygen", "Carbon Dioxide", "Hydrogen"],
      correct: 2,
      explanation: "Carbon Dioxide (CO2) is the primary greenhouse gas responsible for global warming and climate change.",
      difficulty: "Easy",
    },
    {
      id: 3,
      text: "The Montreal Protocol is related to the protection of:",
      options: ["Forests", "Ozone Layer", "Oceans", "Wetlands"],
      correct: 1,
      explanation: "The Montreal Protocol (1987) is an international treaty designed to protect the ozone layer by phasing out CFCs and other ozone-depleting substances.",
      difficulty: "Medium",
    },
    {
      id: 4,
      text: "Which of the following is a renewable energy source?",
      options: ["Coal", "Natural Gas", "Solar Energy", "Petroleum"],
      correct: 2,
      explanation: "Solar energy is a renewable energy source that can be continuously replenished, unlike fossil fuels.",
      difficulty: "Easy",
    },
    {
      id: 5,
      text: "The Kyoto Protocol was adopted in which year?",
      options: ["1992", "1997", "2001", "2005"],
      correct: 1,
      explanation: "The Kyoto Protocol was adopted on December 11, 1997, and entered into force on February 16, 2005.",
      difficulty: "Hard",
    },
  ],
  Economy: [
    {
      id: 1,
      text: "What is the currency of India?",
      options: ["Dollar", "Pound", "Indian Rupee", "Euro"],
      correct: 2,
      explanation: "The Indian Rupee (₹) is the official currency of India, with the currency code INR.",
      difficulty: "Easy",
    },
    {
      id: 2,
      text: "Which organization publishes the Human Development Index (HDI)?",
      options: ["IMF", "World Bank", "UNDP", "WTO"],
      correct: 2,
      explanation: "The United Nations Development Programme (UNDP) publishes the Human Development Index annually.",
      difficulty: "Medium",
    },
    {
      id: 3,
      text: "What is the primary function of the Reserve Bank of India?",
      options: ["Lending money", "Monetary policy", "Tax collection", "Trade regulation"],
      correct: 1,
      explanation: "The RBI is responsible for formulating and implementing monetary policy to maintain price stability and economic growth.",
      difficulty: "Medium",
    },
    {
      id: 4,
      text: "Which is the largest economy in the world by GDP?",
      options: ["China", "Japan", "USA", "Germany"],
      correct: 2,
      explanation: "The United States has the largest economy in the world by nominal GDP.",
      difficulty: "Easy",
    },
    {
      id: 5,
      text: "What is the Gini Coefficient used to measure?",
      options: ["Inflation", "Income Inequality", "GDP Growth", "Unemployment"],
      correct: 1,
      explanation: "The Gini Coefficient measures income inequality within a population, ranging from 0 (perfect equality) to 1 (perfect inequality).",
      difficulty: "Hard",
    },
  ],
};

const TOPICS = Object.keys(QUESTIONS_DATA);

export default function Practice() {
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<(number | null)[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [timer, setTimer] = useState(0);
  const [showMockTestGenerator, setShowMockTestGenerator] = useState(false);
  const [mockTestConfig, setMockTestConfig] = useState<MockTestConfig | null>(null);
  const [mockTestResults, setMockTestResults] = useState<TestResults | null>(null);

  const questions = selectedTopic ? QUESTIONS_DATA[selectedTopic] : [];
  const currentQuestion = questions[currentQuestionIndex];
  const answered = selectedAnswers.filter((a) => a !== null).length;

  useEffect(() => {
    if (selectedTopic && !completed) {
      const interval = setInterval(() => {
        setTimer((t) => t + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [selectedTopic, completed]);

  const handleSelectAnswer = (optionIndex: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestionIndex] = optionIndex;
    setSelectedAnswers(newAnswers);

    if (optionIndex === currentQuestion.correct) {
      toast.success("Correct! ✅");
    } else {
      toast.error("Incorrect ❌");
    }

    setShowResults(true);

    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setShowResults(false);
      } else {
        setCompleted(true);
      }
    }, 1500);
  };

  const calculateScore = (): number => {
    return selectedAnswers.reduce((score: number, answer: number | null, idx: number) => {
      if (answer === null || !questions[idx]) return score;
      return answer === questions[idx].correct ? score + 1 : score;
    }, 0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  // Handle mock test completion
  const handleMockTestComplete = (results: TestResults) => {
    setMockTestResults(results);
    setMockTestConfig(null);
  };

  // Handle exit from mock test
  const handleExitMockTest = () => {
    setMockTestConfig(null);
  };

  // Show mock test session if config is set
  if (mockTestConfig) {
    return (
      <MockTestSession
        config={mockTestConfig}
        onComplete={handleMockTestComplete}
        onExit={handleExitMockTest}
      />
    );
  }

  // Show mock test results
  if (mockTestResults) {
    const { correctAnswers, totalQuestions, accuracy, timeSpent, topicWisePerformance } = mockTestResults;
    const minutes = Math.floor(timeSpent / 60);
    const seconds = timeSpent % 60;

    return (
      <div className="min-h-screen bg-white dark:bg-slate-900">
        <Navbar />
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
                Test Completed! 🎉
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-400">
                Here's how you performed
              </p>
            </div>

            {/* Score Card */}
            <Card className="p-12 mb-8 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200 dark:border-orange-800 text-center">
              <div className="mb-6">
                <div className="text-7xl font-bold text-orange-600 dark:text-orange-400 mb-2">
                  {accuracy}%
                </div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {correctAnswers} out of {totalQuestions} correct
                </p>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Time spent: {minutes}m {seconds}s
              </p>
              <div className="flex gap-3 justify-center">
                <Button
                  onClick={() => setMockTestResults(null)}
                  className="bg-orange-500 hover:bg-orange-600 text-white font-semibold"
                >
                  Create Another Test
                </Button>
                <Button
                  onClick={() => window.location.href = "/practice"}
                  variant="outline"
                  className="border-orange-500 text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                >
                  Back to Practice
                </Button>
              </div>
            </Card>

            {/* Topic-wise Performance */}
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
              Topic-wise Performance
            </h2>
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {Object.entries(topicWisePerformance).map(([topic, performance]) => {
                const topicAccuracy = Math.round((performance.correct / performance.total) * 100);
                return (
                  <Card key={topic} className="p-6 bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
                    <h3 className="font-bold text-slate-900 dark:text-white mb-3">
                      {topic}
                    </h3>
                    <div className="flex items-end gap-4">
                      <div className="flex-1">
                        <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-3 mb-2">
                          <div
                            className="bg-gradient-to-r from-orange-500 to-orange-600 h-3 rounded-full"
                            style={{ width: `${topicAccuracy}%` }}
                          />
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {performance.correct}/{performance.total} correct
                        </p>
                      </div>
                      <span className="text-2xl font-bold text-orange-500">
                        {topicAccuracy}%
                      </span>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!selectedTopic) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-900">
        <Navbar />
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
              Practice Questions
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
              Select a topic to start practicing
            </p>

            <div className="mb-12 p-6 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    Create Custom Mock Test
                  </h3>
                  <p className="opacity-90">
                    Combine multiple topics and customize difficulty for a personalized test experience
                  </p>
                </div>
                <Button
                  onClick={() => setShowMockTestGenerator(true)}
                  className="bg-white text-orange-600 hover:bg-gray-100 font-bold whitespace-nowrap ml-4"
                >
                  Create Test
                </Button>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {TOPICS.map((topic) => (
                <button
                  key={topic}
                  onClick={() => {
                    setSelectedTopic(topic);
                    setCurrentQuestionIndex(0);
                    setSelectedAnswers(new Array(QUESTIONS_DATA[topic].length).fill(null));
                    setCompleted(false);
                    setTimer(0);
                  }}
                  className="p-8 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-slate-800 dark:to-slate-700 rounded-lg hover:shadow-lg transition-all duration-300 text-left border-2 border-transparent hover:border-orange-500"
                >
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                    {topic}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {QUESTIONS_DATA[topic].length} questions
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>
        <Footer />

        <MockTestGenerator
          isOpen={showMockTestGenerator}
          onClose={() => setShowMockTestGenerator(false)}
          onGenerateTest={(config) => {
            setMockTestConfig(config);
          }}
        />
      </div>
    );
  }

  if (completed) {
    const score: number = calculateScore();
    const accuracy = Math.round((score / questions.length) * 100);

    return (
      <div className="min-h-screen bg-white dark:bg-slate-900">
        <Navbar />
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto">
            <Card className="p-12 text-center bg-gradient-to-br from-orange-50 to-orange-100 dark:from-slate-800 dark:to-slate-700 border-2 border-orange-500">
              <CheckCircle2 className="w-20 h-20 text-green-500 mx-auto mb-6" />
              <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
                Quiz Completed!
              </h2>

              <div className="grid grid-cols-3 gap-6 mb-8">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                    Score
                  </p>
                  <p className="text-3xl font-bold text-orange-500">
                    {score}/{questions.length}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                    Accuracy
                  </p>
                  <p className="text-3xl font-bold text-orange-500">
                    {accuracy}%
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                    Time
                  </p>
                  <p className="text-3xl font-bold text-orange-500">
                    {formatTime(timer)}
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={() => {
                    setCurrentQuestionIndex(0);
                    setSelectedAnswers(new Array(questions.length).fill(null));
                    setCompleted(false);
                    setTimer(0);
                    setShowResults(false);
                  }}
                  className="bg-orange-500 hover:bg-orange-600 text-white"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Practice Again
                </Button>
                <Button
                  onClick={() => {
                    setSelectedTopic(null);
                    setCurrentQuestionIndex(0);
                    setSelectedAnswers([]);
                    setCompleted(false);
                    setTimer(0);
                  }}
                  variant="outline"
                  className="border-2 border-orange-500 text-orange-500 hover:bg-orange-50 dark:hover:bg-slate-800"
                >
                  Try Another Topic
                </Button>
              </div>
            </Card>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {selectedTopic}
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Time: {formatTime(timer)}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Completed: {answered}/{questions.length}
                </p>
              </div>
            </div>
            <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
              <div
                className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${((currentQuestionIndex + 1) / questions.length) * 100}%`,
                }}
              />
            </div>
          </div>

          {/* Question Card */}
          <Card className="p-8 mb-8 bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
            <div className="flex justify-between items-start mb-6">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                  {currentQuestion.text}
                </h3>
              </div>
              <span className={`difficulty-badge difficulty-${currentQuestion.difficulty.toLowerCase()}`}>
                {currentQuestion.difficulty}
              </span>
            </div>

            {/* Options */}
            <div className="space-y-3 mb-8">
              {currentQuestion.options.map((option, idx) => {
                const isSelected = selectedAnswers[currentQuestionIndex] === idx;
                const isCorrect = idx === currentQuestion.correct;
                const showCorrect = showResults && isCorrect;
                const showIncorrect = showResults && isSelected && !isCorrect;

                return (
                  <button
                    key={idx}
                    onClick={() => !showResults && handleSelectAnswer(idx)}
                    disabled={showResults}
                    className={`w-full p-4 text-left rounded-lg border-2 transition-all duration-200 ${
                      showCorrect
                        ? "border-green-500 bg-green-50 dark:bg-green-900"
                        : showIncorrect
                        ? "border-red-500 bg-red-50 dark:bg-red-900"
                        : isSelected
                        ? "border-orange-500 bg-orange-50 dark:bg-orange-900"
                        : "border-gray-200 dark:border-slate-600 hover:border-orange-300 dark:hover:border-orange-400"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center font-bold text-sm ${
                          showCorrect
                            ? "border-green-500 bg-green-500 text-white"
                            : showIncorrect
                            ? "border-red-500 bg-red-500 text-white"
                            : isSelected
                            ? "border-orange-500 bg-orange-500 text-white"
                            : "border-gray-300 dark:border-slate-500"
                        }`}
                      >
                        {String.fromCharCode(65 + idx)}
                      </div>
                      <span className="text-gray-800 dark:text-gray-200">
                        {option}
                      </span>
                      {showCorrect && <CheckCircle2 className="w-5 h-5 text-green-500 ml-auto" />}
                      {showIncorrect && <XCircle className="w-5 h-5 text-red-500 ml-auto" />}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Explanation */}
            {showResults && (
              <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg p-4 flex gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-blue-900 dark:text-blue-200 mb-1">
                    Explanation
                  </p>
                  <p className="text-blue-800 dark:text-blue-300 text-sm">
                    {currentQuestion.explanation}
                  </p>
                </div>
              </div>
            )}
          </Card>

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <Button
              onClick={() => {
                if (currentQuestionIndex > 0) {
                  setCurrentQuestionIndex(currentQuestionIndex - 1);
                  setShowResults(false);
                }
              }}
              disabled={currentQuestionIndex === 0}
              variant="outline"
            >
              Previous
            </Button>

            <Button
              onClick={() => {
                setSelectedTopic(null);
                setCurrentQuestionIndex(0);
                setSelectedAnswers([]);
                setCompleted(false);
                setTimer(0);
              }}
              variant="ghost"
            >
              Back to Topics
            </Button>

            <Button
              onClick={() => {
                if (currentQuestionIndex < questions.length - 1) {
                  setCurrentQuestionIndex(currentQuestionIndex + 1);
                  setShowResults(false);
                }
              }}
              disabled={currentQuestionIndex === questions.length - 1}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              Next
            </Button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
