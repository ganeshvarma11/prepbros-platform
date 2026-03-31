import { Award, ChevronRight, Flame, TrendingUp } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";

import { PrepBottomNav } from "@/components/prep/PrepBottomNav";
import { PrepButton } from "@/components/prep/PrepButton";
import { PrepCard } from "@/components/prep/PrepCard";
import { PrepLogo } from "@/components/prep/PrepLogo";
import { ProgressRing } from "@/components/prep/ProgressRing";
import { StreakBadge } from "@/components/prep/StreakBadge";
import { SubjectChip } from "@/components/prep/SubjectChip";
import { usePrepPreferences } from "@/contexts/PrepPreferencesContext";
import { useAuth } from "@/contexts/AuthContext";
import {
  LEADERBOARD_SEED,
  formatDateLabel,
  formatLongDate,
  getCurrentStreak,
  getDailySubject,
  getDailySubject as getSubjectOfDay,
  getDisplayName,
  getSevenDayActivity,
  getStoredSessions,
  getSubjectStats,
  getTodaysSession,
} from "@/lib/prepbro";

function formatRank(score: number) {
  return new Intl.NumberFormat("en-IN").format(Math.max(341, 3000 - score * 91));
}

export default function Dashboard() {
  const { user } = useAuth();
  const { preferences } = usePrepPreferences();
  const [sessions, setSessions] = useState(getStoredSessions());
  const [showStreakDetail, setShowStreakDetail] = useState(false);

  useEffect(() => {
    const refresh = () => setSessions(getStoredSessions());
    window.addEventListener("focus", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("focus", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const isHindi = preferences.language === "hi";
  const displayName = getDisplayName(user);
  const dailySubject = getDailySubject(preferences);
  const todaysSession = getTodaysSession(sessions, dailySubject);
  const streak = getCurrentStreak(sessions);
  const activity = getSevenDayActivity(sessions);
  const subjectStats = getSubjectStats(sessions).filter(item => item.totalQuestions > 0);
  const latestSessions = sessions.slice(0, 5);
  const latestScore = todaysSession?.correctCount ?? sessions[0]?.correctCount ?? 0;
  const latestTotal = todaysSession?.totalQuestions ?? sessions[0]?.totalQuestions ?? 10;
  const latestAccuracy = latestTotal
    ? Math.round((latestScore / latestTotal) * 100)
    : 0;
  const leaderboard = useMemo(() => {
    const userRow = {
      rank: 2341,
      name: displayName,
      initials: displayName.slice(0, 2).toUpperCase(),
      score: latestScore,
      accuracy: latestAccuracy,
    };
    return [...LEADERBOARD_SEED, userRow];
  }, [displayName, latestAccuracy, latestScore]);

  const streakCopy =
    streak === 0
      ? isHindi
        ? "अपनी स्ट्रीक आज से शुरू करें"
        : "Start your streak!"
      : `${streak}`;

  return (
    <div className="min-h-screen bg-[var(--color-background)] pb-28">
      <div className="sticky top-0 z-50 border-b border-[var(--color-border)] bg-[rgba(255,255,255,0.92)] shadow-[var(--shadow-sm)] backdrop-blur dark:bg-[rgba(34,40,64,0.92)]">
        <div className="pb-container flex items-center justify-between px-0 py-4">
          <div className="flex items-center gap-3">
            <PrepLogo compact />
            <div>
              <p className="text-[var(--text-sm)] text-[var(--color-text-muted)]">
                {isHindi ? "नमस्ते" : "Hi"}
              </p>
              <h1 className="font-[var(--font-body)] text-[var(--text-md)] font-bold">
                {displayName}
              </h1>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowStreakDetail(true)}
            className="inline-flex items-center gap-2 rounded-[var(--radius-full)] bg-[rgba(255,140,0,0.12)] px-3 py-2 text-[var(--text-sm)] font-medium text-[var(--color-streak)]"
          >
            <Flame className="h-4 w-4" />
            {streak === 0 ? streakCopy : `${streak}`}
          </button>
        </div>
      </div>

      <main className="pb-container px-0 py-6">
        <PrepCard
          variant="hero"
          padding="hero"
          className="pb-stagger overflow-hidden rounded-[var(--radius-xl)]"
          style={{ ["--stagger-delay" as string]: "0ms" }}
        >
          <div className="flex items-start justify-between gap-4">
            <span className="rounded-[var(--radius-full)] bg-[rgba(255,107,53,0.18)] px-3 py-1 text-[var(--text-sm)] text-[#ffd6c9]">
              {isHindi ? "आज की प्रैक्टिस" : "Today's Practice"}
            </span>
            <StreakBadge streak={streak} />
          </div>
          <h2 className="mt-5 text-[clamp(28px,5vw,40px)] text-white">
            {isHindi ? `डेली क्विज़ - ${dailySubject}` : `Daily Quiz - ${dailySubject}`}
          </h2>
          <p className="mt-3 text-[var(--text-base)] text-white/74">
            10 {isHindi ? "सवाल" : "questions"} · ~8 {isHindi ? "मिनट" : "minutes"} ·{" "}
            {formatLongDate(new Date())}
          </p>

          {todaysSession ? (
            <div className="mt-6 rounded-[20px] bg-white/10 p-4">
              <p className="text-[var(--text-sm)] text-white/75">
                {isHindi ? "पूरा हो गया" : "Completed"}
              </p>
              <div className="mt-2 flex items-center gap-3 text-[var(--text-md)] font-medium text-[#b7ffce]">
                <Award className="h-5 w-5" />
                {isHindi
                  ? `स्कोर: ${todaysSession.correctCount}/${todaysSession.totalQuestions}`
                  : `Score: ${todaysSession.correctCount}/${todaysSession.totalQuestions}`}
              </div>
            </div>
          ) : (
            <div className="mt-6">
              <div className="flex items-center justify-between text-[var(--text-sm)] text-white/74">
                <span>{isHindi ? "प्रोग्रेस" : "Progress"}</span>
                <span>0 / 10</span>
              </div>
              <div className="mt-3 h-2 rounded-full bg-white/16">
                <div className="h-full w-0 rounded-full bg-[var(--color-accent)]" />
              </div>
            </div>
          )}

          <div className="mt-6">
            <Link href="/practice">
              <PrepButton
                asChild
                fullWidth
                size="lg"
                className={todaysSession ? "border border-white/24 bg-transparent hover:bg-white/8" : ""}
                variant={todaysSession ? "outline" : "primary"}
              >
                <span className={todaysSession ? "text-white" : ""}>
                  {todaysSession
                    ? isHindi
                      ? "उत्तर रिव्यू करें"
                      : "Review Answers"
                    : isHindi
                      ? "अभी शुरू करें"
                      : "Start Now"}{" "}
                  <ChevronRight className="ml-1 inline h-4 w-4" />
                </span>
              </PrepButton>
            </Link>
          </div>

          <p className="mt-4 text-[var(--text-sm)] text-white/64">
            {isHindi ? "847 छात्र आज पूरा कर चुके हैं" : "847 students completed today"}
          </p>
        </PrepCard>

        <div
          className="pb-stagger mt-5 flex gap-3 overflow-x-auto pb-hide-scrollbar"
          style={{ ["--stagger-delay" as string]: "50ms" }}
        >
          {[
            `${isHindi ? "आज का स्कोर" : "Today's Score"}: ${latestScore}/${latestTotal}`,
            `${isHindi ? "एक्युरेसी" : "Accuracy"}: ${latestAccuracy}%`,
            `${isHindi ? "रैंक" : "Rank"}: #${formatRank(latestScore)}`,
          ].map(item => (
            <div
              key={item}
              className="whitespace-nowrap rounded-[var(--radius-full)] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-[var(--text-sm)] text-[var(--color-text-secondary)]"
            >
              {item}
            </div>
          ))}
        </div>

        <PrepCard
          className="pb-stagger mt-5 p-5"
          style={{ ["--stagger-delay" as string]: "100ms" }}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[var(--text-sm)] text-[var(--color-text-muted)]">
                {isHindi ? "कंसिस्टेंसी" : "Consistency"}
              </p>
              <h2 className="mt-2 text-[32px] text-[var(--color-streak)]">
                {streak} {isHindi ? "दिन की स्ट्रीक" : "day streak"}
              </h2>
              <p className="mt-2 text-[var(--text-base)] text-[var(--color-text-secondary)]">
                {isHindi
                  ? "जारी रखें - आप consistency में शीर्ष 8% में हैं।"
                  : "Keep going - you're in the top 8% for consistency."}
              </p>
            </div>
            <TrendingUp className="h-6 w-6 text-[var(--color-accent)]" />
          </div>

          <div className="mt-5 flex items-center justify-between gap-2">
            {activity.map(day => (
              <div key={day.key} className="flex flex-col items-center gap-2">
                <span
                  className={`h-3 w-3 rounded-full border ${
                    day.completed
                      ? "border-[var(--color-accent)] bg-[var(--color-accent)]"
                      : "border-[var(--color-border)] bg-transparent"
                  } ${day.isToday && !day.completed ? "animate-[pb-dot-pulse_1.1s_ease-in-out_infinite]" : ""}`}
                />
                <span className="text-[var(--text-xs)] text-[var(--color-text-muted)]">
                  {day.label}
                </span>
              </div>
            ))}
          </div>
        </PrepCard>

        <section
          className="pb-stagger mt-6"
          style={{ ["--stagger-delay" as string]: "150ms" }}
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-[24px]">
              {isHindi ? "आपके विषय" : "Your subjects"}
            </h2>
            <Link href="/progress">
              <span className="cursor-pointer text-[var(--text-sm)] font-medium text-[var(--color-accent)]">
                {isHindi ? "पूरा देखें" : "View all"}
              </span>
            </Link>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-hide-scrollbar">
            {subjectStats.length > 0 ? (
              subjectStats.map(stat => (
                <PrepCard key={stat.subject} className="min-w-[220px] p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <SubjectChip subject={stat.subject} />
                      <p className="mt-4 text-[var(--text-sm)] text-[var(--color-text-muted)]">
                        {stat.totalQuestions} {isHindi ? "सवाल" : "questions done"}
                      </p>
                    </div>
                    <ProgressRing percentage={stat.accuracy} size={72} />
                  </div>
                </PrepCard>
              ))
            ) : (
              <PrepCard className="w-full p-6">
                <p className="text-[var(--text-base)] text-[var(--color-text-secondary)]">
                  {isHindi
                    ? "पहला क्विज़ पूरा करते ही subject progress दिखेगा।"
                    : "Complete your first quiz to unlock subject progress."}
                </p>
              </PrepCard>
            )}
          </div>
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <PrepCard className="p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-[24px]">
                {isHindi ? "आज का लीडरबोर्ड" : "Today's leaderboard"}
              </h2>
              <span className="text-[var(--text-sm)] text-[var(--color-accent)]">
                {isHindi ? "पूरा देखें" : "Full leaderboard"}
              </span>
            </div>
            <div className="space-y-3">
              {leaderboard.map((entry, index) => (
                <div
                  key={`${entry.rank}-${entry.name}`}
                  className={`flex items-center gap-3 rounded-[var(--radius-md)] px-4 py-3 ${
                    index === 0
                      ? "bg-[rgba(243,156,18,0.14)]"
                      : index === 1
                        ? "bg-[rgba(148,163,184,0.16)]"
                        : index === 2
                          ? "bg-[rgba(180,83,9,0.14)]"
                          : "bg-[var(--color-surface)]"
                  }`}
                >
                  <span className="w-8 text-[var(--text-sm)] font-bold text-[var(--color-text-secondary)]">
                    #{entry.rank}
                  </span>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-primary)] text-[var(--text-sm)] font-bold text-white">
                    {entry.initials}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-[var(--color-text-primary)]">
                      {entry.name}
                    </p>
                    <p className="text-[var(--text-sm)] text-[var(--color-text-muted)]">
                      {entry.accuracy}% {isHindi ? "accuracy" : "accuracy"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-[var(--color-text-primary)]">
                      {entry.score}/10
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </PrepCard>

          <PrepCard className="p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-[24px]">
                {isHindi ? "हाल की सेशंस" : "Recent sessions"}
              </h2>
            </div>
            <div className="space-y-3">
              {latestSessions.length > 0 ? (
                latestSessions.map(session => (
                  <div
                    key={session.id}
                    className="grid grid-cols-[1.3fr_0.7fr_0.9fr] items-center gap-3 rounded-[var(--radius-md)] bg-[var(--color-surface)] px-4 py-3"
                  >
                    <div>
                      <p className="font-medium text-[var(--color-text-primary)]">
                        {session.subject}
                      </p>
                      <p className="text-[var(--text-sm)] text-[var(--color-text-muted)]">
                        {formatDateLabel(session.completedAt)}
                      </p>
                    </div>
                    <p className="text-[var(--text-sm)] text-[var(--color-text-secondary)]">
                      {session.correctCount}/{session.totalQuestions}
                    </p>
                    <p className="text-right text-[var(--text-sm)] text-[var(--color-text-secondary)]">
                      {Math.round(session.durationSec / 60)}m
                    </p>
                  </div>
                ))
              ) : (
                <div className="rounded-[var(--radius-md)] bg-[var(--color-surface)] px-4 py-5 text-[var(--text-base)] text-[var(--color-text-secondary)]">
                  {isHindi
                    ? "पहले क्विज़ के बाद आपकी सेशन हिस्ट्री यहां दिखेगी।"
                    : "Your session history will appear here after your first quiz."}
                </div>
              )}
            </div>
          </PrepCard>
        </section>
      </main>

      {showStreakDetail ? (
        <div className="fixed inset-0 z-[140] flex items-end justify-center bg-[rgba(15,20,32,0.4)] p-4 md:items-center">
          <PrepCard className="w-full max-w-md p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-[24px]">
                {isHindi ? "स्ट्रीक डिटेल" : "Streak details"}
              </h2>
              <button
                type="button"
                onClick={() => setShowStreakDetail(false)}
                className="text-[var(--text-sm)] text-[var(--color-accent)]"
              >
                {isHindi ? "बंद करें" : "Close"}
              </button>
            </div>
            <p className="mt-4 text-[var(--text-base)] text-[var(--color-text-secondary)]">
              {isHindi
                ? "रोज़ एक क्विज़ पूरा करें और आपकी स्ट्रीक अपने आप बढ़ती जाएगी।"
                : "Complete one quiz a day and your streak keeps growing automatically."}
            </p>
            <div className="mt-6">
              <StreakBadge streak={streak} detailed />
            </div>
          </PrepCard>
        </div>
      ) : null}

      <PrepBottomNav />
    </div>
  );
}
