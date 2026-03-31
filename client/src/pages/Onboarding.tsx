import { Check, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";

import { PrepButton } from "@/components/prep/PrepButton";
import { PrepCard } from "@/components/prep/PrepCard";
import { usePrepPreferences } from "@/contexts/PrepPreferencesContext";
import {
  GOAL_OPTIONS,
  PREP_EXAMS,
  PREP_SUBJECTS,
  type GoalOption,
  type PrepExam,
  type PrepSubject,
} from "@/lib/prepbro";

export default function Onboarding() {
  const [, setLocation] = useLocation();
  const { preferences, updatePreferences } = usePrepPreferences();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedExam, setSelectedExam] = useState<PrepExam>(preferences.exam);
  const [selectedGoal, setSelectedGoal] = useState<GoalOption>(
    preferences.dailyGoal
  );
  const [weakSubjects, setWeakSubjects] = useState<PrepSubject[]>(
    preferences.weakSubjects
  );

  const isHindi = preferences.language === "hi";
  const progress = useMemo(() => (step === 4 ? 100 : step * 33), [step]);

  useEffect(() => {
    if (step !== 4) return;

    const timer = window.setTimeout(() => {
      updatePreferences({
        exam: selectedExam,
        dailyGoal: selectedGoal,
        weakSubjects,
        onboardedAt: new Date().toISOString(),
      });
      setLocation("/dashboard");
    }, 1500);

    return () => window.clearTimeout(timer);
  }, [selectedExam, selectedGoal, setLocation, step, updatePreferences, weakSubjects]);

  const stepTitle =
    step === 1
      ? isHindi
        ? "आप किस परीक्षा की तैयारी कर रहे हैं?"
        : "Which exam are you preparing for?"
      : step === 2
        ? isHindi
          ? "रोज़ कितने सवाल हल करना चाहते हैं?"
          : "How many questions per day?"
        : isHindi
          ? "किन विषयों में सबसे ज़्यादा मदद चाहिए?"
          : "Pick your weak areas - we'll focus there first";

  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-background)]">
      <div className="mx-auto w-full max-w-3xl px-4 pb-8 pt-8">
        <div className="mb-10">
          <div className="flex items-center justify-between text-[var(--text-sm)] text-[var(--color-text-secondary)]">
            <span>{isHindi ? "आपकी योजना" : "Your setup"}</span>
            <span>{progress}%</span>
          </div>
          <div className="mt-3 h-2 rounded-full bg-[var(--color-surface)]">
            <div
              className="h-full rounded-full bg-[var(--color-accent)] transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {step < 4 ? (
          <>
            <div className="text-center">
              <p className="pb-kicker">
                {step === 1
                  ? isHindi
                    ? "स्टेप 1"
                    : "Step 1"
                  : step === 2
                    ? isHindi
                      ? "स्टेप 2"
                      : "Step 2"
                    : isHindi
                      ? "स्टेप 3"
                      : "Step 3"}
              </p>
              <h1 className="mt-3 text-[clamp(30px,6vw,42px)]">{stepTitle}</h1>
            </div>

            {step === 1 ? (
              <div className="mt-10 grid grid-cols-2 gap-4">
                {PREP_EXAMS.map(exam => (
                  <button
                    key={exam}
                    type="button"
                    onClick={() => {
                      setSelectedExam(exam);
                      window.setTimeout(() => setStep(2), 400);
                    }}
                    className={`rounded-[var(--radius-lg)] border-2 px-4 py-6 text-left transition ${
                      selectedExam === exam
                        ? "border-[var(--color-accent)] bg-[#fff3ef]"
                        : "border-transparent bg-[var(--color-surface-raised)] shadow-[var(--shadow-card)] hover:border-[var(--color-border)]"
                    }`}
                  >
                    <div className="text-[var(--text-lg)] font-bold text-[var(--color-text-primary)]">
                      {exam}
                    </div>
                  </button>
                ))}
              </div>
            ) : null}

            {step === 2 ? (
              <div className="mt-10 flex flex-wrap justify-center gap-3">
                {GOAL_OPTIONS.map(goal => {
                  const active = selectedGoal === goal;
                  const recommended = goal === 10;
                  return (
                    <button
                      key={goal}
                      type="button"
                      onClick={() => {
                        setSelectedGoal(goal);
                        window.setTimeout(() => setStep(3), 300);
                      }}
                      className={`rounded-[var(--radius-full)] border px-5 py-4 text-[var(--text-base)] font-medium transition ${
                        active || recommended
                          ? "border-[var(--color-accent)] bg-[#fff3ef] text-[var(--color-accent)]"
                          : "border-[var(--color-border)] bg-[var(--color-surface-raised)] text-[var(--color-text-primary)]"
                      }`}
                    >
                      {goal} Qs{" "}
                      {goal === 5
                        ? isHindi
                          ? "(आराम से)"
                          : "(Easy start)"
                        : goal === 10
                          ? isHindi
                            ? "(Recommended)"
                            : "(Recommended)"
                          : goal === 20
                            ? isHindi
                              ? "(Serious)"
                              : "(Serious)"
                            : isHindi
                              ? "(Intense)"
                              : "(Intense)"}
                    </button>
                  );
                })}
              </div>
            ) : null}

            {step === 3 ? (
              <>
                <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {PREP_SUBJECTS.map(subject => {
                    const active = weakSubjects.includes(subject);
                    return (
                      <button
                        key={subject}
                        type="button"
                        onClick={() =>
                          setWeakSubjects(current =>
                            current.includes(subject)
                              ? current.filter(item => item !== subject)
                              : [...current, subject]
                          )
                        }
                        className={`rounded-[var(--radius-full)] border px-4 py-3 text-[var(--text-sm)] font-medium transition ${
                          active
                            ? "border-[var(--color-accent)] bg-[var(--color-accent)] text-white"
                            : "border-[var(--color-border)] bg-[var(--color-surface-raised)] text-[var(--color-text-primary)]"
                        }`}
                      >
                        {subject}
                      </button>
                    );
                  })}
                </div>

                {weakSubjects.length > 0 ? (
                  <div className="fixed inset-x-0 bottom-0 border-t border-[var(--color-border)] bg-[rgba(250,250,248,0.96)] px-4 pb-[calc(env(safe-area-inset-bottom)+16px)] pt-4 backdrop-blur md:static md:mt-10 md:border-0 md:bg-transparent md:px-0 md:pb-0 md:pt-0">
                    <PrepButton
                      size="lg"
                      fullWidth
                      className="md:max-w-sm md:mx-auto"
                      onClick={() => setStep(4)}
                    >
                      {isHindi ? "प्रैक्टिस शुरू करें" : "Start Practicing"}{" "}
                    </PrepButton>
                  </div>
                ) : null}
              </>
            ) : null}
          </>
        ) : (
          <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[var(--color-success-light)] text-[var(--color-success)]">
              <div className="relative flex h-12 w-12 items-center justify-center rounded-full border-4 border-[var(--color-success)]">
                <Check className="h-6 w-6 animate-[pb-check-bounce_300ms_ease]" />
              </div>
            </div>
            <h1 className="mt-8 text-[clamp(30px,6vw,42px)]">
              {isHindi ? "आपकी योजना तैयार है!" : "Your plan is ready!"}
            </h1>
            <p className="mt-3 text-[var(--text-md)] text-[var(--color-text-secondary)]">
              {isHindi
                ? "आपको सीधे आज की प्रैक्टिस पर ले जा रहे हैं।"
                : "Taking you straight to today's practice."}
            </p>
            <PrepCard className="mt-8 max-w-md p-6">
              <div className="flex items-center justify-center gap-3 text-[var(--color-primary)]">
                <Sparkles className="h-5 w-5" />
                <span className="font-medium">
                  {selectedExam} · {selectedGoal} Qs
                </span>
              </div>
            </PrepCard>
          </div>
        )}
      </div>
    </div>
  );
}
