import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { AlertCircle, Zap, BookOpen } from "lucide-react";

interface MockTestGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerateTest: (config: MockTestConfig) => void;
}

export interface MockTestConfig {
  selectedTopics: string[];
  difficulty: "easy" | "medium" | "hard" | "mixed";
  questionCount: number;
  timeLimit: number;
  includeExplanations: boolean;
}

const AVAILABLE_TOPICS = [
  { id: "polity", name: "Polity", icon: "📜", questionCount: 250 },
  { id: "history", name: "History", icon: "📚", questionCount: 280 },
  { id: "geography", name: "Geography", icon: "🗺️", questionCount: 200 },
  { id: "economy", name: "Economy", icon: "💰", questionCount: 220 },
  { id: "environment", name: "Environment", icon: "🌍", questionCount: 180 },
  { id: "science", name: "Science & Tech", icon: "🔬", questionCount: 240 },
  { id: "current", name: "Current Affairs", icon: "📰", questionCount: 300 },
  { id: "csat", name: "CSAT", icon: "🧠", questionCount: 150 },
];

export default function MockTestGenerator({
  isOpen,
  onClose,
  onGenerateTest,
}: MockTestGeneratorProps) {
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard" | "mixed">("mixed");
  const [questionCount, setQuestionCount] = useState(20);
  const [timeLimit, setTimeLimit] = useState(60);
  const [includeExplanations, setIncludeExplanations] = useState(true);
  const [step, setStep] = useState<"topics" | "config">("topics");

  const handleTopicToggle = (topicId: string) => {
    setSelectedTopics((prev) =>
      prev.includes(topicId)
        ? prev.filter((id) => id !== topicId)
        : [...prev, topicId]
    );
  };

  const handleSelectAll = () => {
    if (selectedTopics.length === AVAILABLE_TOPICS.length) {
      setSelectedTopics([]);
    } else {
      setSelectedTopics(AVAILABLE_TOPICS.map((t) => t.id));
    }
  };

  const handleGenerateTest = () => {
    if (selectedTopics.length === 0) {
      alert("Please select at least one topic");
      return;
    }

    onGenerateTest({
      selectedTopics,
      difficulty,
      questionCount,
      timeLimit,
      includeExplanations,
    });

    // Reset form
    setSelectedTopics([]);
    setDifficulty("mixed");
    setQuestionCount(20);
    setTimeLimit(60);
    setIncludeExplanations(true);
    setStep("topics");
    onClose();
  };

  const totalAvailableQuestions = selectedTopics.reduce((sum, topicId) => {
    const topic = AVAILABLE_TOPICS.find((t) => t.id === topicId);
    return sum + (topic?.questionCount || 0);
  }, 0);

  const maxQuestions = Math.min(totalAvailableQuestions, 100);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-slate-900 dark:text-white">
            Create Custom Mock Test
          </DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-400">
            {step === "topics"
              ? "Select topics for your mock test"
              : "Configure your test settings"}
          </DialogDescription>
        </DialogHeader>

        {step === "topics" ? (
          <div className="space-y-6">
            {/* Select All Button */}
            <div className="flex items-center justify-between p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
              <Label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-900 dark:text-white">
                <Checkbox
                  checked={selectedTopics.length === AVAILABLE_TOPICS.length}
                  onCheckedChange={handleSelectAll}
                  className="cursor-pointer"
                />
                Select All Topics
              </Label>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {selectedTopics.length} selected
              </span>
            </div>

            {/* Topic Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {AVAILABLE_TOPICS.map((topic) => (
                <Card
                  key={topic.id}
                  className={`p-4 cursor-pointer transition-all duration-200 ${
                    selectedTopics.includes(topic.id)
                      ? "border-2 border-orange-500 bg-orange-50 dark:bg-orange-900/20"
                      : "border-gray-200 dark:border-slate-700 hover:border-orange-300 dark:hover:border-orange-700"
                  }`}
                  onClick={() => handleTopicToggle(topic.id)}
                >
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={selectedTopics.includes(topic.id)}
                      onCheckedChange={() => handleTopicToggle(topic.id)}
                      className="cursor-pointer mt-0.5"
                    />
                    <div className="flex-1">
                      <div className="text-2xl mb-1">{topic.icon}</div>
                      <p className="font-semibold text-slate-900 dark:text-white text-sm">
                        {topic.name}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        {topic.questionCount} questions
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Summary */}
            {selectedTopics.length > 0 && (
              <Card className="p-4 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-blue-900 dark:text-blue-200">
                      {selectedTopics.length} topic{selectedTopics.length !== 1 ? "s" : ""} selected
                    </p>
                    <p className="text-sm text-blue-800 dark:text-blue-300 mt-1">
                      {totalAvailableQuestions} questions available across selected topics
                    </p>
                  </div>
                </div>
              </Card>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={onClose}
                className="border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700"
              >
                Cancel
              </Button>
              <Button
                onClick={() => setStep("config")}
                disabled={selectedTopics.length === 0}
                className="bg-orange-500 hover:bg-orange-600 text-white font-semibold"
              >
                Next: Configure Test
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Difficulty Selection */}
            <div>
              <Label className="text-base font-semibold text-slate-900 dark:text-white mb-4 block">
                Difficulty Level
              </Label>
              <RadioGroup value={difficulty} onValueChange={(value: any) => setDifficulty(value)}>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 cursor-pointer">
                    <RadioGroupItem value="easy" id="easy" />
                    <Label htmlFor="easy" className="cursor-pointer flex-1">
                      <span className="font-semibold text-slate-900 dark:text-white">Easy</span>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Beginner-friendly questions
                      </p>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 cursor-pointer">
                    <RadioGroupItem value="medium" id="medium" />
                    <Label htmlFor="medium" className="cursor-pointer flex-1">
                      <span className="font-semibold text-slate-900 dark:text-white">Medium</span>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Intermediate level questions
                      </p>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 cursor-pointer">
                    <RadioGroupItem value="hard" id="hard" />
                    <Label htmlFor="hard" className="cursor-pointer flex-1">
                      <span className="font-semibold text-slate-900 dark:text-white">Hard</span>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Advanced/UPSC-level questions
                      </p>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 cursor-pointer">
                    <RadioGroupItem value="mixed" id="mixed" />
                    <Label htmlFor="mixed" className="cursor-pointer flex-1">
                      <span className="font-semibold text-slate-900 dark:text-white">Mixed</span>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Balanced mix of all difficulty levels
                      </p>
                    </Label>
                  </div>
                </div>
              </RadioGroup>
            </div>

            {/* Question Count Slider */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <Label className="text-base font-semibold text-slate-900 dark:text-white">
                  Number of Questions
                </Label>
                <span className="text-2xl font-bold text-orange-500">
                  {questionCount}
                </span>
              </div>
              <Slider
                value={[questionCount]}
                onValueChange={(value) => setQuestionCount(value[0])}
                min={5}
                max={maxQuestions}
                step={5}
                className="w-full"
              />
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                Available: {maxQuestions} questions
              </p>
            </div>

            {/* Time Limit Slider */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <Label className="text-base font-semibold text-slate-900 dark:text-white">
                  Time Limit (minutes)
                </Label>
                <span className="text-2xl font-bold text-orange-500">
                  {timeLimit}
                </span>
              </div>
              <Slider
                value={[timeLimit]}
                onValueChange={(value) => setTimeLimit(value[0])}
                min={15}
                max={180}
                step={15}
                className="w-full"
              />
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                {Math.round((timeLimit / questionCount) * 60)} seconds per question
              </p>
            </div>

            {/* Include Explanations */}
            <div className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-slate-700 rounded-lg">
              <Checkbox
                checked={includeExplanations}
                onCheckedChange={(checked) => setIncludeExplanations(checked as boolean)}
                id="explanations"
                className="cursor-pointer"
              />
              <Label htmlFor="explanations" className="cursor-pointer flex-1">
                <span className="font-semibold text-slate-900 dark:text-white">
                  Include Explanations
                </span>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  View detailed explanations after answering each question
                </p>
              </Label>
            </div>

            {/* Test Summary */}
            <Card className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200 dark:border-orange-800">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  <p className="font-semibold text-slate-900 dark:text-white">
                    {selectedTopics.map((id) => AVAILABLE_TOPICS.find((t) => t.id === id)?.name).join(", ")}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  <p className="text-slate-900 dark:text-white">
                    {questionCount} questions • {difficulty} difficulty • {timeLimit} minutes
                  </p>
                </div>
              </div>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => setStep("topics")}
                className="border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700"
              >
                Back
              </Button>
              <Button
                onClick={handleGenerateTest}
                className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6"
              >
                Generate Test
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
