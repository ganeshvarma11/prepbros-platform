import { useEffect, useMemo, useState } from "react";
import { Crown, Flame, Loader2, Medal, Sparkles, Trophy, Users } from "lucide-react";

import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import SectionHeader from "@/components/SectionHeader";
import { supabase } from "@/lib/supabase";

interface LeaderboardEntry {
  rank: number;
  name: string;
  state: string;
  streak: number;
  questionsSolved: number;
  accuracy: number;
  avatar: string;
}

const leaderboardData: LeaderboardEntry[] = [
  { rank: 1, name: "Arjun Sharma", state: "Telangana", streak: 45, questionsSolved: 1250, accuracy: 87, avatar: "AS" },
  { rank: 2, name: "Priya Patel", state: "Gujarat", streak: 38, questionsSolved: 1180, accuracy: 85, avatar: "PP" },
  { rank: 3, name: "Vikram Reddy", state: "Andhra Pradesh", streak: 42, questionsSolved: 1320, accuracy: 82, avatar: "VR" },
  { rank: 4, name: "Neha Singh", state: "Delhi", streak: 28, questionsSolved: 980, accuracy: 88, avatar: "NS" },
  { rank: 5, name: "Rohit Kumar", state: "Karnataka", streak: 35, questionsSolved: 1100, accuracy: 84, avatar: "RK" },
  { rank: 6, name: "Anjali Verma", state: "Uttar Pradesh", streak: 22, questionsSolved: 850, accuracy: 86, avatar: "AV" },
  { rank: 7, name: "Karan Desai", state: "Maharashtra", streak: 31, questionsSolved: 1050, accuracy: 83, avatar: "KD" },
  { rank: 8, name: "Divya Nair", state: "Kerala", streak: 26, questionsSolved: 920, accuracy: 89, avatar: "DN" },
  { rank: 9, name: "Sanjay Gupta", state: "Rajasthan", streak: 19, questionsSolved: 780, accuracy: 81, avatar: "SG" },
  { rank: 10, name: "Meera Iyer", state: "Tamil Nadu", streak: 33, questionsSolved: 1200, accuracy: 85, avatar: "MI" },
];

const states = ["All India", "Telangana", "Andhra Pradesh", "Karnataka", "Maharashtra", "Gujarat"];

export default function Leaderboard() {
  const [activeTab, setActiveTab] = useState<"daily" | "weekly" | "alltime" | "state">("daily");
  const [selectedState, setSelectedState] = useState("All India");
  const [entries, setEntries] = useState<LeaderboardEntry[]>(leaderboardData);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data, error } = await supabase.from("profiles").select("*").order("total_solved", { ascending: false }).limit(50);
      if (!error && data && data.length > 0) {
        const mapped = data.map((profile: any, index: number) => ({
          rank: index + 1,
          name: profile.full_name || profile.username || "PrepBros User",
          state: profile.state || "All India",
          streak: profile.streak || 0,
          questionsSolved: profile.total_solved || 0,
          accuracy: profile.accuracy || 0,
          avatar: (profile.full_name || profile.username || "PB")
            .split(" ")
            .map((part: string) => part[0])
            .join("")
            .slice(0, 2)
            .toUpperCase(),
        }));
        setEntries(mapped);
      } else {
        setEntries(leaderboardData);
      }
      setLoading(false);
    };

    load();
  }, []);

  const filteredData = useMemo(() => {
    if (activeTab === "state" && selectedState !== "All India") {
      return entries.filter((entry) => entry.state === selectedState);
    }
    return entries;
  }, [activeTab, selectedState, entries]);

  const topThree = filteredData.slice(0, 3);
  const rest = filteredData.slice(3);

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="px-4 py-8 md:py-10">
        <div className="container-shell space-y-6">
          <div className="rounded-[36px] border border-[var(--border)] bg-[linear-gradient(135deg,#0f172a_0%,#1e293b_45%,#4f46e5_100%)] px-6 py-8 text-white md:px-8 md:py-10">
            <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
              <div>
                <SectionHeader
                  eyebrow="Leaderboard"
                  title="Recognition now looks worthy of the effort users put in."
                  description="The leaderboard is cleaner, more premium, and much better at framing competition as a motivation loop instead of a noisy table."
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  { label: "Tracked users", value: entries.length },
                  { label: "Top streak", value: `${entries[0]?.streak ?? 0}d` },
                  { label: "Best accuracy", value: `${Math.max(...entries.map((item) => item.accuracy))}%` },
                ].map((item) => (
                  <div key={item.label} className="rounded-3xl border border-white/12 bg-white/8 p-4">
                    <p className="text-2xl font-semibold tracking-[-0.05em] text-white">{item.value}</p>
                    <p className="mt-1 text-sm text-white/65">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="glass-panel rounded-[32px] p-6 md:p-8">
              <SectionHeader
                eyebrow="Why this matters"
                title="A better leaderboard increases aspiration and repeat visits."
                description="Even before it becomes fully dynamic, this page now supports the brand better and feels more like part of a real product."
              />
              <div className="mt-6 grid gap-3">
                {[
                  "Clearer visual hierarchy makes ranks easier to parse.",
                  "The top-performer section now feels more celebratory and less generic.",
                  "This page is ready for live Supabase-backed rankings later.",
                ].map((item) => (
                  <div key={item} className="rounded-3xl border border-[var(--border)] bg-[var(--bg-card-strong)] p-4 text-sm text-[var(--text-secondary)]">
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[32px] border border-[var(--border)] bg-[var(--bg-inverse)] p-6 text-white md:p-8">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-white">
                <Sparkles size={18} />
              </div>
              <p className="mt-5 text-2xl font-semibold tracking-[-0.05em] text-white">
                Recognition becomes a real retention feature once it feels credible.
              </p>
              <p className="mt-3 text-sm text-white/72">
                The UI now supports that. The next step is replacing placeholders with live ranking
                logic and user-specific positioning.
              </p>
            </div>
          </div>

          <div className="glass-panel rounded-[32px] p-6 md:p-8">
            {loading ? (
              <div className="mb-6 inline-flex items-center gap-3 rounded-full border border-[var(--border)] bg-[var(--bg-card-strong)] px-5 py-3 text-sm text-[var(--text-secondary)]">
                <Loader2 size={16} className="animate-spin text-[var(--brand)]" />
                Loading leaderboard...
              </div>
            ) : null}
            <div className="flex flex-wrap gap-2">
              {["daily", "weekly", "alltime", "state"].map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => {
                    setActiveTab(tab as typeof activeTab);
                    if (tab !== "state") setSelectedState("All India");
                  }}
                  className={activeTab === tab ? "btn-primary rounded-full px-5 py-2" : "btn-secondary rounded-full px-5 py-2"}
                >
                  {tab === "alltime" ? "All time" : tab === "state" ? "By state" : tab}
                </button>
              ))}
            </div>

            {activeTab === "state" ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {states.map((state) => (
                  <button
                    key={state}
                    type="button"
                    onClick={() => setSelectedState(state)}
                    className={selectedState === state ? "btn-primary rounded-full px-5 py-2" : "btn-secondary rounded-full px-5 py-2"}
                  >
                    {state}
                  </button>
                ))}
              </div>
            ) : null}

            <div className="mt-8 grid gap-4 lg:grid-cols-3">
              {topThree.map((entry, index) => (
                <div
                  key={entry.rank}
                  className={`rounded-[28px] border p-6 text-center ${
                    index === 0
                      ? "border-[var(--brand-muted)] bg-[var(--brand-subtle)]"
                      : "border-[var(--border)] bg-[var(--bg-card-strong)]"
                  }`}
                >
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[var(--bg-inverse)] text-lg font-semibold text-white">
                    {entry.avatar}
                  </div>
                  <div className="mt-4 inline-flex items-center gap-2 text-[var(--brand)]">
                    {index === 0 ? <Crown size={16} /> : <Medal size={16} />}
                    <span className="text-sm font-semibold">
                      {entry.rank === 1 ? "1st place" : entry.rank === 2 ? "2nd place" : "3rd place"}
                    </span>
                  </div>
                  <p className="mt-4 text-xl font-semibold tracking-[-0.04em] text-[var(--text-primary)]">
                    {entry.name}
                  </p>
                  <p className="mt-1 text-sm text-[var(--text-muted)]">{entry.state}</p>
                  <div className="mt-5 grid gap-2 text-sm text-[var(--text-secondary)]">
                    <p className="inline-flex items-center justify-center gap-2"><Flame size={14} className="text-[var(--brand)]" />{entry.streak} day streak</p>
                    <p className="inline-flex items-center justify-center gap-2"><Trophy size={14} className="text-[var(--brand)]" />{entry.questionsSolved} questions solved</p>
                    <p className="inline-flex items-center justify-center gap-2"><Users size={14} className="text-[var(--brand)]" />{entry.accuracy}% accuracy</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 overflow-hidden rounded-[28px] border border-[var(--border)]">
              <div className="grid grid-cols-[72px_1fr_120px_120px_110px] gap-3 border-b border-[var(--border)] bg-[var(--bg-subtle)] px-5 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
                <span>Rank</span>
                <span>Aspirant</span>
                <span>State</span>
                <span>Solved</span>
                <span>Accuracy</span>
              </div>
              <div className="divide-y divide-[var(--border)]">
                {rest.map((entry) => (
                  <div key={entry.rank} className="grid grid-cols-[72px_1fr_120px_120px_110px] gap-3 px-5 py-4">
                    <span className="text-sm font-semibold text-[var(--text-primary)]">#{entry.rank}</span>
                    <div>
                      <p className="text-sm font-semibold text-[var(--text-primary)]">{entry.name}</p>
                      <p className="text-sm text-[var(--text-muted)]">{entry.streak} day streak</p>
                    </div>
                    <span className="text-sm text-[var(--text-secondary)]">{entry.state}</span>
                    <span className="text-sm text-[var(--text-secondary)]">{entry.questionsSolved}</span>
                    <span className="text-sm text-[var(--text-secondary)]">{entry.accuracy}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
