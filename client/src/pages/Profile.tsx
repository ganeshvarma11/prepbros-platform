import {
  ChevronRight,
  Lock,
  MoonStar,
  PencilLine,
  Trophy,
} from "lucide-react";
import { useMemo, useState } from "react";

import { PrepBottomNav } from "@/components/prep/PrepBottomNav";
import { PrepButton } from "@/components/prep/PrepButton";
import { PrepCard } from "@/components/prep/PrepCard";
import { usePrepPreferences } from "@/contexts/PrepPreferencesContext";
import { useAuth } from "@/contexts/AuthContext";
import {
  ACHIEVEMENTS,
  PREP_EXAMS,
  getDisplayName,
  getProfileExam,
  getProgressSummary,
  getStoredProfile,
  getStoredSessions,
  setStoredProfile,
} from "@/lib/prepbro";

function getInitials(value: string) {
  return value
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map(item => item[0]?.toUpperCase() || "")
    .join("");
}

export default function Profile() {
  const { user } = useAuth();
  const { preferences, updatePreferences } = usePrepPreferences();
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState(getStoredProfile());
  const sessions = getStoredSessions();
  const summary = getProgressSummary(sessions);
  const name = getDisplayName(user) || profile.displayName;
  const exam = getProfileExam(user) || profile.exam;
  const initials = useMemo(() => getInitials(name || "Prep Bros"), [name]);
  const isHindi = preferences.language === "hi";

  const unlockedBadges = useMemo(
    () => ({
      "7-Day Warrior": summary.streak >= 7,
      "Century Club": summary.totalQuestions >= 100,
      "Accuracy King": summary.accuracy >= 90,
      "Speed Demon": sessions.length > 0 && summary.totalTimeSec / sessions.length <= 300,
    }),
    [sessions.length, summary.accuracy, summary.streak, summary.totalQuestions, summary.totalTimeSec]
  );

  return (
    <div className="min-h-screen bg-[var(--color-background)] pb-28">
      <main className="pb-container px-0 py-6">
        <PrepCard className="p-6">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-[72px] w-[72px] items-center justify-center rounded-full bg-[linear-gradient(135deg,var(--color-primary),var(--color-primary-light))] text-[24px] font-bold text-white">
                {initials}
              </div>
              <div>
                <h1 className="text-[28px]">{name}</h1>
                <p className="mt-1 text-[var(--text-base)] text-[var(--color-text-secondary)]">
                  {exam}
                </p>
              </div>
            </div>
            <PrepButton variant="outline" onClick={() => setIsEditing(true)}>
              <PencilLine className="h-4 w-4" />
              {isHindi ? "प्रोफाइल एडिट करें" : "Edit profile"}
            </PrepButton>
          </div>
        </PrepCard>

        <section className="mt-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-[24px]">{isHindi ? "उपलब्धियां" : "Achievements"}</h2>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-hide-scrollbar">
            {ACHIEVEMENTS.map(badge => {
              const unlocked = unlockedBadges[badge.name as keyof typeof unlockedBadges];
              return (
                <PrepCard
                  key={badge.name}
                  className={`min-w-[220px] p-5 ${
                    unlocked ? "" : "grayscale-[0.9] opacity-70"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[rgba(255,107,53,0.14)] text-[var(--color-accent)]">
                      <Trophy className="h-5 w-5" />
                    </div>
                    {!unlocked ? <Lock className="h-4 w-4 text-[var(--color-text-muted)]" /> : null}
                  </div>
                  <h3 className="mt-4 text-[20px]">{badge.name}</h3>
                  <p className="mt-2 text-[var(--text-sm)] text-[var(--color-text-secondary)]">
                    {badge.description}
                  </p>
                </PrepCard>
              );
            })}
          </div>
        </section>

        <section className="mt-6">
          <h2 className="text-[24px]">{isHindi ? "सेटिंग्स" : "Settings"}</h2>
          <div className="mt-4 overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] shadow-[var(--shadow-card)]">
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="flex w-full items-center justify-between border-b border-[var(--color-border)] px-5 py-4 text-left"
            >
              <div>
                <p className="font-medium text-[var(--color-text-primary)]">
                  {isHindi ? "परीक्षा प्रकार" : "Exam type"}
                </p>
                <p className="text-[var(--text-sm)] text-[var(--color-text-muted)]">
                  {exam}
                </p>
              </div>
              <ChevronRight className="h-4 w-4 text-[var(--color-text-muted)]" />
            </button>

            <div className="flex items-center justify-between border-b border-[var(--color-border)] px-5 py-4">
              <div>
                <p className="font-medium text-[var(--color-text-primary)]">
                  {isHindi ? "डेली गोल" : "Daily goal"}
                </p>
                <p className="text-[var(--text-sm)] text-[var(--color-text-muted)]">
                  {preferences.dailyGoal} {isHindi ? "सवाल" : "questions"}
                </p>
              </div>
              <div className="inline-flex rounded-[var(--radius-full)] bg-[var(--color-surface)] p-1">
                {[5, 10, 20, 30].map(goal => (
                  <button
                    key={goal}
                    type="button"
                    onClick={() => updatePreferences({ dailyGoal: goal as 5 | 10 | 20 | 30 })}
                    className={`rounded-[var(--radius-full)] px-3 py-2 text-[var(--text-sm)] ${
                      preferences.dailyGoal === goal
                        ? "bg-[var(--color-surface-raised)] text-[var(--color-primary)] shadow-[var(--shadow-sm)]"
                        : "text-[var(--color-text-secondary)]"
                    }`}
                  >
                    {goal}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between border-b border-[var(--color-border)] px-5 py-4">
              <div>
                <p className="font-medium text-[var(--color-text-primary)]">
                  {isHindi ? "Adaptive dark mode" : "Adaptive dark mode"}
                </p>
                <p className="text-[var(--text-sm)] text-[var(--color-text-muted)]">
                  {isHindi
                    ? "डिवाइस के dark preference पर चलेगा"
                    : "Turns on only when your device prefers dark mode"}
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  updatePreferences({
                    adaptiveDarkMode: !preferences.adaptiveDarkMode,
                  })
                }
                className={`inline-flex h-11 items-center gap-2 rounded-[var(--radius-full)] px-4 ${
                  preferences.adaptiveDarkMode
                    ? "bg-[var(--color-primary)] text-white"
                    : "bg-[var(--color-surface)] text-[var(--color-text-secondary)]"
                }`}
              >
                <MoonStar className="h-4 w-4" />
                {preferences.adaptiveDarkMode ? "On" : "Off"}
              </button>
            </div>

            <div className="flex items-center justify-between border-b border-[var(--color-border)] px-5 py-4">
              <div>
                <p className="font-medium text-[var(--color-text-primary)]">
                  {isHindi ? "भाषा" : "Language"}
                </p>
                <p className="text-[var(--text-sm)] text-[var(--color-text-muted)]">
                  {preferences.language === "hi" ? "हिंदी" : "English"}
                </p>
              </div>
              <div className="inline-flex rounded-[var(--radius-full)] bg-[var(--color-surface)] p-1">
                {[
                  ["en", "EN"],
                  ["hi", "हिंदी"],
                ].map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => updatePreferences({ language: value as "en" | "hi" })}
                    className={`rounded-[var(--radius-full)] px-4 py-2 text-[var(--text-sm)] ${
                      preferences.language === value
                        ? "bg-[var(--color-surface-raised)] text-[var(--color-primary)] shadow-[var(--shadow-sm)]"
                        : "text-[var(--color-text-secondary)]"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {[
              isHindi ? "Notification preferences" : "Notification preferences",
              isHindi ? "Account & billing" : "Account & billing",
              isHindi ? "Help & Support" : "Help & Support",
            ].map(item => (
              <button
                key={item}
                type="button"
                className="flex w-full items-center justify-between border-b border-[var(--color-border)] px-5 py-4 text-left last:border-b-0"
              >
                <span className="font-medium text-[var(--color-text-primary)]">
                  {item}
                </span>
                <ChevronRight className="h-4 w-4 text-[var(--color-text-muted)]" />
              </button>
            ))}

            <button
              type="button"
              className="w-full px-5 py-4 text-left font-medium text-[var(--color-danger)]"
            >
              {isHindi ? "लॉगआउट" : "Logout"}
            </button>
          </div>
        </section>
      </main>

      {isEditing ? (
        <div className="fixed inset-0 z-[140] flex items-end justify-center bg-[rgba(15,20,32,0.4)] p-4 md:items-center">
          <PrepCard className="w-full max-w-lg p-6">
            <h2 className="text-[24px]">{isHindi ? "प्रोफाइल एडिट करें" : "Edit profile"}</h2>
            <div className="mt-5">
              <label className="text-[var(--text-sm)] text-[var(--color-text-muted)]">
                {isHindi ? "नाम" : "Name"}
              </label>
              <input
                value={profile.displayName}
                onChange={event =>
                  setProfile(current => ({ ...current, displayName: event.target.value }))
                }
                className="mt-2 w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3"
              />
            </div>
            <div className="mt-5">
              <label className="text-[var(--text-sm)] text-[var(--color-text-muted)]">
                {isHindi ? "परीक्षा" : "Exam"}
              </label>
              <select
                value={profile.exam}
                onChange={event =>
                  setProfile(current => ({
                    ...current,
                    exam: event.target.value as typeof current.exam,
                  }))
                }
                className="mt-2 w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3"
              >
                {PREP_EXAMS.map(option => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div className="mt-6 flex gap-3">
              <PrepButton variant="outline" fullWidth onClick={() => setIsEditing(false)}>
                {isHindi ? "रद्द करें" : "Cancel"}
              </PrepButton>
              <PrepButton
                fullWidth
                onClick={() => {
                  setStoredProfile(profile);
                  setIsEditing(false);
                }}
              >
                {isHindi ? "सेव करें" : "Save changes"}
              </PrepButton>
            </div>
          </PrepCard>
        </div>
      ) : null}

      <PrepBottomNav />
    </div>
  );
}
