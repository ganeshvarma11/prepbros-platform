import { Flame, Timer, TrendingDown, TrendingUp } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { PrepBottomNav } from "@/components/prep/PrepBottomNav";
import { PrepCard } from "@/components/prep/PrepCard";
import { usePrepPreferences } from "@/contexts/PrepPreferencesContext";
import { useQuestionBank } from "@/hooks/useQuestionBank";
import {
  formatDuration,
  getDailyAccuracySeries,
  getNinetyDayGrid,
  getProgressSummary,
  getStoredSessions,
  getSubjectStats,
  getWeakTopics,
} from "@/lib/prepbro";

type RangeKey = "week" | "month" | "all";

const RANGE_MAP: Record<RangeKey, 7 | 30 | 90> = {
  week: 7,
  month: 30,
  all: 90,
};

export default function Progress() {
  const { preferences } = usePrepPreferences();
  const { questions } = useQuestionBank();
  const [range, setRange] = useState<RangeKey>("week");
  const [sessions, setSessions] = useState(getStoredSessions());
  const isHindi = preferences.language === "hi";

  useEffect(() => {
    const refresh = () => setSessions(getStoredSessions());
    window.addEventListener("focus", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("focus", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const summary = getProgressSummary(sessions);
  const chartData = getDailyAccuracySeries(sessions, RANGE_MAP[range]);
  const subjectStats = getSubjectStats(sessions).filter(item => item.totalQuestions > 0);
  const weakTopics = getWeakTopics(questions, sessions);
  const streakGrid = getNinetyDayGrid(sessions);
  const trendDelta = useMemo(() => {
    if (chartData.length < 2) return 0;
    return chartData[chartData.length - 1].accuracy - chartData[0].accuracy;
  }, [chartData]);

  return (
    <div className="min-h-screen bg-[var(--color-background)] pb-28">
      <main className="pb-container px-0 py-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="pb-kicker">{isHindi ? "एनालिटिक्स" : "Analytics"}</p>
            <h1 className="mt-3 text-[clamp(30px,5vw,44px)]">
              {isHindi ? "आपकी प्रोग्रेस" : "Your Progress"}
            </h1>
          </div>
          <div className="inline-flex rounded-[var(--radius-full)] bg-[var(--color-surface)] p-1">
            {([
              ["week", isHindi ? "सप्ताह" : "Week"],
              ["month", isHindi ? "महीना" : "Month"],
              ["all", isHindi ? "ऑल टाइम" : "All Time"],
            ] as const).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setRange(key)}
                className={`rounded-[var(--radius-full)] px-4 py-2 text-[var(--text-sm)] font-medium transition ${
                  range === key
                    ? "bg-[var(--color-surface-raised)] text-[var(--color-primary)] shadow-[var(--shadow-sm)]"
                    : "text-[var(--color-text-secondary)]"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <section className="mt-8 grid grid-cols-2 gap-4">
          {[
            {
              label: isHindi ? "कुल सवाल" : "Total questions answered",
              value: summary.totalQuestions,
              icon: TrendingUp,
            },
            {
              label: isHindi ? "ओवरऑल accuracy" : "Overall accuracy",
              value: `${summary.accuracy}%`,
              icon: trendDelta >= 0 ? TrendingUp : TrendingDown,
            },
            {
              label: isHindi ? "मौजूदा स्ट्रीक" : "Current streak",
              value: summary.streak,
              icon: Flame,
            },
            {
              label: isHindi ? "कुल समय" : "Total time studied",
              value: formatDuration(summary.totalTimeSec),
              icon: Timer,
            },
          ].map(item => {
            const Icon = item.icon;
            return (
              <PrepCard key={item.label} className="p-5">
                <div className="flex items-center justify-between">
                  <p className="text-[var(--text-sm)] text-[var(--color-text-muted)]">
                    {item.label}
                  </p>
                  <Icon className="h-5 w-5 text-[var(--color-accent)]" />
                </div>
                <h2 className="mt-4 text-[28px]">{item.value}</h2>
              </PrepCard>
            );
          })}
        </section>

        <section className="mt-6">
          <PrepCard className="p-5">
            <h2 className="text-[24px]">
              {isHindi ? "Accuracy trend" : "Accuracy trend"}
            </h2>
            <div className="mt-6 h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="prepAccuracy" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#1A2E5A" stopOpacity={0.18} />
                      <stop offset="100%" stopColor="#1A2E5A" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(154,154,175,0.14)" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#9A9AAF" }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "#9A9AAF" }} />
                  <Tooltip />
                  <ReferenceLine
                    y={60}
                    stroke="#FF6B35"
                    strokeDasharray="4 4"
                    label={{ value: "60%", fill: "#FF6B35", fontSize: 11 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="accuracy"
                    stroke="#1A2E5A"
                    strokeWidth={3}
                    fill="url(#prepAccuracy)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </PrepCard>
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-[1fr_0.95fr]">
          <PrepCard className="p-5">
            <h2 className="text-[24px]">
              {isHindi ? "सब्जेक्ट ब्रेकडाउन" : "Subject breakdown"}
            </h2>
            <div className="mt-6 h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={subjectStats} layout="vertical" margin={{ left: 16 }}>
                  <CartesianGrid stroke="rgba(154,154,175,0.1)" horizontal={false} />
                  <XAxis type="number" domain={[0, 100]} hide />
                  <YAxis
                    type="category"
                    dataKey="subject"
                    width={88}
                    tick={{ fontSize: 12, fill: "#5A5A72" }}
                  />
                  <Tooltip />
                  <Bar dataKey="accuracy" radius={[999, 999, 999, 999]}>
                    {subjectStats.map(entry => (
                      <Cell
                        key={entry.subject}
                        fill={
                          entry.accuracy >= 70
                            ? "#2ECC71"
                            : entry.accuracy >= 50
                              ? "#F39C12"
                              : "#E74C3C"
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            {subjectStats[0] ? (
              <div className="mt-4 inline-flex rounded-[var(--radius-full)] bg-[#fff3ef] px-4 py-2 text-[var(--text-sm)] font-medium text-[var(--color-accent)]">
                {isHindi ? "यहां फोकस करें" : "Focus here"}: {subjectStats[0].subject}
              </div>
            ) : null}
          </PrepCard>

          <PrepCard className="p-5">
            <h2 className="text-[24px]">
              {isHindi ? "जिन topics पर ध्यान चाहिए" : "Topics that need attention"}
            </h2>
            <div className="mt-6 flex flex-wrap gap-3">
              {weakTopics.length > 0 ? (
                weakTopics.map(topic => {
                  const intensity = 1 - topic.accuracy / 100;
                  return (
                    <button
                      key={topic.topic}
                      type="button"
                      className="rounded-[var(--radius-full)] px-4 py-3 text-left text-[var(--text-sm)] font-medium text-[var(--color-primary)]"
                      style={{
                        background: `rgba(255,107,53,${0.08 + intensity * 0.28})`,
                      }}
                    >
                      {topic.topic}
                    </button>
                  );
                })
              ) : (
                <p className="text-[var(--text-base)] text-[var(--color-text-secondary)]">
                  {isHindi
                    ? "जैसे-जैसे आप सवाल हल करेंगे, कमजोर topics यहां दिखेंगे।"
                    : "Weak topics will appear here as you solve more questions."}
                </p>
              )}
            </div>
          </PrepCard>
        </section>

        <section className="mt-6">
          <PrepCard className="p-5">
            <h2 className="text-[24px]">
              {isHindi ? "पिछले 90 दिनों की स्ट्रीक हिस्ट्री" : "Streak history"}
            </h2>
            <div className="mt-6 overflow-x-auto pb-hide-scrollbar">
              <div
                className="grid min-w-[720px] gap-2"
                style={{ gridTemplateColumns: "repeat(18, minmax(0, 1fr))" }}
              >
                {streakGrid.map(day => (
                  <div
                    key={day.key}
                    title={`${day.label} - ${day.score}`}
                    className={`h-5 w-5 rounded-[6px] ${
                      day.practiced
                        ? "bg-[var(--color-accent)]"
                        : "bg-[var(--color-surface)]"
                    }`}
                  />
                ))}
              </div>
            </div>
          </PrepCard>
        </section>
      </main>

      <PrepBottomNav />
    </div>
  );
}
