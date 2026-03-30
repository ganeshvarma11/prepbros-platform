import { useEffect, useState } from "react";
import {
  CalendarClock,
  Clock3,
  Loader2,
  Sparkles,
  Trophy,
  Users,
} from "lucide-react";

import AppShell from "@/components/AppShell";
import PageHeader from "@/components/PageHeader";
import SectionHeader from "@/components/SectionHeader";
import { supabase } from "@/lib/supabase";

interface Contest {
  id: number;
  name: string;
  date: string;
  duration: string;
  topics: string;
  prize: string;
  status: "upcoming" | "past";
  winner?: string;
  yourRank?: number;
}

export default function Contests() {
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");
  const [countdown, setCountdown] = useState({
    days: 2,
    hours: 14,
    minutes: 32,
    seconds: 45,
  });
  const [liveUpcoming, setLiveUpcoming] = useState<Contest[]>([]);
  const [livePast, setLivePast] = useState<Contest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(current => {
        let { days, hours, minutes, seconds } = current;
        seconds -= 1;
        if (seconds < 0) {
          seconds = 59;
          minutes -= 1;
        }
        if (minutes < 0) {
          minutes = 59;
          hours -= 1;
        }
        if (hours < 0) {
          hours = 23;
          days -= 1;
        }
        if (days < 0) {
          return { days: 0, hours: 0, minutes: 0, seconds: 0 };
        }
        return { days, hours, minutes, seconds };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("contests")
        .select("*")
        .order("date", { ascending: true });
      if (!error && data && data.length > 0) {
        const normalized = data.map((contest: any, index: number) => ({
          id: contest.id ?? index + 1,
          name: contest.name,
          date: contest.date,
          duration: contest.duration,
          topics: contest.topics,
          prize: contest.prize,
          status: contest.status,
          winner: contest.winner,
          yourRank: contest.your_rank,
        })) as Contest[];
        setLiveUpcoming(
          normalized.filter(contest => contest.status === "upcoming")
        );
        setLivePast(normalized.filter(contest => contest.status === "past"));
      }
      setLoading(false);
    };

    load();
  }, []);

  const upcomingContests: Contest[] = [
    {
      id: 1,
      name: "Weekly Contest #14",
      date: "March 28, 2026",
      duration: "60 minutes",
      topics: "GS1 + CSAT",
      prize: "PrepBros Pro subscription",
      status: "upcoming",
    },
    {
      id: 2,
      name: "Monthly Challenge - March",
      date: "March 31, 2026",
      duration: "120 minutes",
      topics: "All GS subjects",
      prize: "₹5,000 PrepBros Pro credits",
      status: "upcoming",
    },
    {
      id: 3,
      name: "State Exam Special - TSPSC",
      date: "April 5, 2026",
      duration: "90 minutes",
      topics: "TSPSC Group 1 syllabus",
      prize: "Premium resources bundle",
      status: "upcoming",
    },
  ];

  const pastContests: Contest[] = [
    {
      id: 101,
      name: "Weekly Contest #13",
      date: "March 21, 2026",
      duration: "60 minutes",
      topics: "GS2 + CSAT",
      prize: "PrepBros Pro subscription",
      status: "past",
      winner: "Arjun Sharma",
      yourRank: 247,
    },
    {
      id: 102,
      name: "Monthly Challenge - February",
      date: "February 28, 2026",
      duration: "120 minutes",
      topics: "All GS subjects",
      prize: "₹5,000 PrepBros Pro credits",
      status: "past",
      winner: "Priya Patel",
      yourRank: 1543,
    },
    {
      id: 103,
      name: "State Exam Special - APPSC",
      date: "February 20, 2026",
      duration: "90 minutes",
      topics: "APPSC Group 1 syllabus",
      prize: "Premium resources bundle",
      status: "past",
      winner: "Vikram Reddy",
      yourRank: 892,
    },
  ];

  const displayUpcoming =
    liveUpcoming.length > 0 ? liveUpcoming : upcomingContests;
  const displayPast = livePast.length > 0 ? livePast : pastContests;

  return (
    <AppShell>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Workspace"
          title="Contests"
          description="Compete weekly, track outcomes, and bring real exam pressure into your practice loop."
          crumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Contests" },
          ]}
        />

        <div className="card overflow-hidden p-6 md:p-8">
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
            <div>
              <SectionHeader
                eyebrow="Contest rhythm"
                title="Competition should feel exciting, clean, and credible."
                description="Users need dates, prizes, scope, and timing to feel immediately understandable before they decide to care."
              />
              <div className="mt-6 flex flex-wrap gap-3">
                <span className="badge-amber px-4 py-2">Weekly contest</span>
                <span className="badge px-4 py-2">Live leaderboard ready</span>
              </div>
            </div>

            <div className="rounded-[28px] border border-[var(--border)] bg-[var(--surface-1)] p-6 shadow-[var(--shadow-sm)]">
              <p className="section-label">Next up</p>
              <p className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-[var(--text-primary)]">
                Weekly Contest #14
              </p>
              <p className="mt-2 text-sm text-[var(--text-secondary)]">
                See the next contest at a glance, understand the scope quickly,
                and know when to show up.
              </p>
              <div className="mt-6 grid grid-cols-4 gap-3">
                {[
                  { label: "Days", value: countdown.days },
                  { label: "Hours", value: countdown.hours },
                  { label: "Minutes", value: countdown.minutes },
                  { label: "Seconds", value: countdown.seconds },
                ].map(item => (
                  <div
                    key={item.label}
                    className="rounded-[22px] border border-[var(--border)] bg-[var(--surface-2)] p-3 text-center"
                  >
                    <p
                      className="text-2xl tracking-[-0.04em] text-[var(--text-primary)]"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      {String(item.value).padStart(2, "0")}
                    </p>
                    <p className="mt-1 text-xs uppercase tracking-[0.18em] text-[var(--text-faint)]">
                      {item.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="card p-6 md:p-8">
            <SectionHeader
              eyebrow="Why it works"
              title="Contest UX should make the event feel worth showing up for."
              description="Dates, prizes, topic scope, and status all need to be easy to parse if users are going to care."
            />
            <div className="mt-6 grid gap-3">
              {[
                "Countdown and hero context build anticipation before the event starts.",
                "Contest cards make prizes, dates, and topic scope easier to understand.",
                "The surface is ready for fully live rankings and participation data.",
              ].map(item => (
                <div
                  key={item}
                  className="rounded-[22px] border border-[var(--border)] bg-[var(--surface-1)] p-4 text-sm text-[var(--text-secondary)]"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="card p-6 md:p-8">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--brand-subtle)] text-[var(--brand)]">
              <Sparkles size={18} />
            </div>
            <p className="mt-5 text-2xl font-semibold tracking-[-0.05em] text-[var(--text-primary)]">
              This becomes much stronger once contests are fully live and
              synced.
            </p>
            <p className="mt-3 text-sm text-[var(--text-secondary)]">
              The interface is ready. The next step is real contest operations,
              attempts, and rank updates.
            </p>
          </div>
        </div>

        <div className="card p-6 md:p-8">
          {loading ? (
            <div className="mb-6 inline-flex items-center gap-3 rounded-full border border-[var(--border)] bg-[var(--surface-2)] px-5 py-3 text-sm text-[var(--text-secondary)] shadow-[var(--shadow-sm)]">
              <Loader2 size={16} className="animate-spin text-[var(--brand)]" />
              Loading contest data...
            </div>
          ) : null}
          <div className="mb-6 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setActiveTab("upcoming")}
              className={
                activeTab === "upcoming"
                  ? "btn-primary rounded-full px-5 py-2"
                  : "btn-secondary rounded-full px-5 py-2"
              }
            >
              Upcoming
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("past")}
              className={
                activeTab === "past"
                  ? "btn-primary rounded-full px-5 py-2"
                  : "btn-secondary rounded-full px-5 py-2"
              }
            >
              Past contests
            </button>
          </div>

          <div className="grid gap-4">
            {(activeTab === "upcoming" ? displayUpcoming : displayPast).map(
              contest => (
                <div
                  key={contest.id}
                  className="card rounded-[28px] p-5 md:p-6"
                >
                  <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                    <div>
                      <div className="flex flex-wrap gap-2">
                        <span className="badge badge-brand">
                          {contest.status === "upcoming"
                            ? "Upcoming"
                            : "Completed"}
                        </span>
                        <span className="badge badge-gray">
                          {contest.topics}
                        </span>
                      </div>
                      <p className="mt-4 text-2xl font-semibold tracking-[-0.05em] text-[var(--text-primary)]">
                        {contest.name}
                      </p>
                      <div className="mt-4 grid gap-2 text-sm text-[var(--text-secondary)]">
                        <p className="inline-flex items-center gap-2">
                          <CalendarClock
                            size={14}
                            className="text-[var(--brand)]"
                          />
                          {contest.date}
                        </p>
                        <p className="inline-flex items-center gap-2">
                          <Clock3 size={14} className="text-[var(--brand)]" />
                          {contest.duration}
                        </p>
                        <p className="inline-flex items-center gap-2">
                          <Trophy size={14} className="text-[var(--brand)]" />
                          {contest.prize}
                        </p>
                      </div>
                    </div>

                    <div className="rounded-[24px] border border-[var(--border)] bg-[var(--surface-1)] p-4 shadow-[var(--shadow-sm)]">
                      {contest.status === "upcoming" ? (
                        <>
                          <p className="text-sm font-semibold text-[var(--text-primary)]">
                            Why join
                          </p>
                          <p className="mt-2 text-sm text-[var(--text-secondary)]">
                            Contests increase retention by adding shared
                            momentum, urgency, and a stronger reason to come
                            back on a schedule.
                          </p>
                          <button
                            type="button"
                            className="btn-primary mt-5 rounded-full px-5 py-2.5"
                          >
                            Register interest
                          </button>
                        </>
                      ) : (
                        <>
                          <p className="text-sm font-semibold text-[var(--text-primary)]">
                            Results snapshot
                          </p>
                          <p className="mt-2 text-sm text-[var(--text-secondary)]">
                            Winner: {contest.winner}
                          </p>
                          <p className="mt-1 text-sm text-[var(--text-secondary)]">
                            Your rank: {contest.yourRank}
                          </p>
                          <div className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-[var(--brand)]">
                            <Users size={14} />
                            Review leaderboard flow
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
