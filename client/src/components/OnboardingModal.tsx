import { useEffect, useState } from "react";
import { ArrowRight, CheckCircle2, Target, X } from "lucide-react";

import { supabase } from "@/lib/supabase";
import { trackEvent } from "@/lib/analytics";

const EXAM_OPTIONS = [
  "UPSC CSE 2026",
  "UPSC CSE 2027",
  "TSPSC Group 1 2025",
  "TSPSC Group 2 2025",
  "APPSC Group 1 2025",
  "SSC CGL 2025",
  "SSC CHSL 2025",
  "RRB NTPC 2025",
  "IBPS PO 2025",
];

const GOAL_OPTIONS = ["10 questions/day", "20 questions/day", "30 questions/day"];

interface OnboardingModalProps {
  isOpen: boolean;
  userId: string;
  defaultExam?: string;
  onClose: () => void;
  onComplete?: (details: { targetExam: string; dailyGoal: string }) => void;
}

export default function OnboardingModal({
  isOpen,
  userId,
  defaultExam = "UPSC CSE 2026",
  onClose,
  onComplete,
}: OnboardingModalProps) {
  const [targetExam, setTargetExam] = useState(defaultExam);
  const [dailyGoal, setDailyGoal] = useState(GOAL_OPTIONS[0]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setTargetExam(defaultExam);
    setDailyGoal(GOAL_OPTIONS[0]);
    setSaving(false);
  }, [defaultExam, isOpen]);

  if (!isOpen) return null;

  const handleComplete = async () => {
    setSaving(true);
    await supabase.from("profiles").update({ target_exam: targetExam }).eq("id", userId);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    await supabase.auth.updateUser({
      data: {
        ...(user?.user_metadata || {}),
        target_exam: targetExam,
        daily_goal: dailyGoal,
        onboarding_completed_at: new Date().toISOString(),
      },
    });
    setSaving(false);
    trackEvent("onboarding_completed", { target_exam: targetExam, daily_goal: dailyGoal });
    onComplete?.({ targetExam, dailyGoal });
    onClose();
  };

  const handleSkip = () => {
    trackEvent("onboarding_skipped");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close onboarding"
        className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm"
        onClick={handleSkip}
      />

      <div className="relative w-full max-w-2xl overflow-hidden rounded-[32px] border border-white/10 bg-[var(--bg-card-strong)] shadow-[0_40px_120px_-32px_rgba(15,23,42,0.55)]">
        <button
          type="button"
          onClick={handleSkip}
          className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-secondary)] transition hover:text-[var(--text-primary)]"
        >
          <X size={16} />
        </button>

        <div className="grid md:grid-cols-[0.95fr_1.05fr]">
          <div className="bg-[linear-gradient(160deg,#0f172a_0%,#1d4ed8_40%,#16a34a_120%)] px-6 py-8 text-white md:px-8 md:py-10">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/70">
              First-session onboarding
            </p>
            <h2 className="mt-4 text-4xl font-semibold tracking-[-0.06em] text-white">
              Set your prep direction before you start.
            </h2>
            <p className="mt-4 text-sm leading-7 text-white/78">
              A little context makes the dashboard, profile, and practice flow feel far more
              relevant from day one.
            </p>

            <div className="mt-8 space-y-3">
              {[
                "Choose a target exam so the platform feels personal.",
                "Pick a simple daily goal to create early momentum.",
                "Start with practice instead of wondering where to begin.",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-start gap-3 rounded-3xl border border-white/12 bg-white/8 p-4"
                >
                  <CheckCircle2 size={18} className="mt-0.5 text-emerald-300" />
                  <p className="text-sm text-white/82">{item}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="px-6 py-8 md:px-8 md:py-10">
            <div className="space-y-5">
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
                  Target exam
                </label>
                <select
                  value={targetExam}
                  onChange={(event) => setTargetExam(event.target.value)}
                  className="w-full"
                >
                  {EXAM_OPTIONS.map((exam) => (
                    <option key={exam}>{exam}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
                  Daily goal
                </label>
                <div className="grid gap-2">
                  {GOAL_OPTIONS.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setDailyGoal(option)}
                      className={`rounded-2xl border px-4 py-3 text-left text-sm transition ${
                        dailyGoal === option
                          ? "border-[var(--brand-muted)] bg-[var(--brand-subtle)] text-[var(--brand-dark)]"
                          : "border-[var(--border)] bg-[var(--bg-subtle)] text-[var(--text-secondary)]"
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-[24px] border border-[var(--border)] bg-[var(--bg-subtle)] p-4">
                <div className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--text-primary)]">
                  <Target size={16} className="text-[var(--brand)]" />
                  Launch-ready onboarding note
                </div>
                <p className="mt-2 text-sm text-[var(--text-secondary)]">
                  This is intentionally short. New users should feel guided, not blocked by setup.
                </p>
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleComplete}
                  disabled={saving}
                  className="btn-primary rounded-full px-6 py-3"
                >
                  {saving ? "Saving..." : "Start with my plan"}
                  {!saving ? <ArrowRight size={16} /> : null}
                </button>
                <button type="button" onClick={handleSkip} className="btn-secondary rounded-full px-6 py-3">
                  Skip for now
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
