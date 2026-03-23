import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Brain,
  CheckCircle2,
  Flame,
  ShieldCheck,
  Target,
  Trophy,
} from "lucide-react";
import { Link } from "wouter";

import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/contexts/AuthContext";
import { trackEvent } from "@/lib/analytics";

const stats = [
  { value: "65+", label: "Questions live" },
  { value: "6", label: "Exam Tracks" },
  { value: "Daily", label: "Challenge loop" },
  { value: "Free", label: "Core practice" },
];

const featureRows = [
  {
    icon: BookOpen,
    title: "A cleaner question bank",
    description:
      "Browse and solve PYQs with the kind of structure users expect from a serious practice platform, not a coaching portal.",
  },
  {
    icon: BarChart3,
    title: "Progress that feels measurable",
    description:
      "Users can see streaks, solved counts, accuracy, bookmarks, and review cues without digging through noisy screens.",
  },
  {
    icon: Brain,
    title: "Built for exam repetition",
    description:
      "The product is designed around consistency, review, and question volume so aspirants actually come back every day.",
  },
  {
    icon: Trophy,
    title: "Contest and leaderboard layer",
    description:
      "Competitive surfaces make the platform feel alive and give users another reason to keep showing up.",
  },
];

const trustItems = [
  "Supabase-backed auth and progress persistence",
  "First-session onboarding for target exam and daily goal",
  "Legal, support, and status pages in place",
  "Mobile-friendly navigation and question flow",
];

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="page-container">
      <Navbar />

      <main className="px-4 py-8 md:py-10">
        <div className="container-shell space-y-8">
          <section className="rounded-[24px] border border-[var(--border)] bg-[linear-gradient(180deg,#1b1b1b_0%,#151515_100%)] p-6 md:p-10">
            <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr]">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-[var(--brand-muted)] bg-[var(--brand-subtle)] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--brand-light)]">
                  <ShieldCheck size={13} />
                  Built for serious exam preparation
                </div>
                <h1 className="mt-5 max-w-3xl text-4xl font-semibold tracking-[-0.06em] text-[var(--text-primary)] md:text-6xl">
                  A sharper practice platform for UPSC, SSC, and state exam prep.
                </h1>
                <p className="mt-5 max-w-2xl text-base leading-8 text-[var(--text-secondary)]">
                  Solve questions, track progress, build streaks, and keep your preparation in one
                  focused system. The product is designed to feel fast, credible, and habit-forming
                  from the first session.
                </p>

                <div className="mt-7 flex flex-wrap gap-3">
                  <Link href={user ? "/dashboard" : "/practice"}>
                    <span
                      onClick={() =>
                        trackEvent("home_primary_cta_clicked", {
                          destination: user ? "dashboard" : "practice",
                        })
                      }
                      className="btn-primary cursor-pointer px-6 py-3"
                    >
                      {user ? "Open dashboard" : "Start practicing"}
                      <ArrowRight size={16} />
                    </span>
                  </Link>
                  <Link href="/explore">
                    <span
                      onClick={() =>
                        trackEvent("home_secondary_cta_clicked", { destination: "explore" })
                      }
                      className="btn-secondary cursor-pointer px-6 py-3"
                    >
                      Explore tracks
                    </span>
                  </Link>
                </div>

                <div className="mt-7 flex flex-wrap gap-2">
                  {trustItems.map((item) => (
                    <span
                      key={item}
                      className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--bg-muted)] px-3 py-2 text-xs text-[var(--text-secondary)]"
                    >
                      <CheckCircle2 size={12} className="text-[var(--accent)]" />
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid gap-4">
                <div className="rounded-[20px] border border-[var(--border)] bg-[var(--bg-card-strong)] p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand)]">
                        Daily prep loop
                      </p>
                      <p className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-[var(--text-primary)]">
                        Practice {"->"} review {"->"} improve
                      </p>
                    </div>
                    <div className="rounded-2xl bg-[var(--brand-subtle)] p-3 text-[var(--brand)]">
                      <Target size={20} />
                    </div>
                  </div>
                  <div className="mt-5 grid grid-cols-2 gap-3">
                    {stats.map((item) => (
                      <div key={item.label} className="rounded-[16px] border border-[var(--border)] bg-[var(--bg-subtle)] p-4">
                        <p className="text-2xl font-semibold tracking-[-0.04em] text-[var(--text-primary)]">
                          {item.value}
                        </p>
                        <p className="mt-1 text-xs uppercase tracking-[0.12em] text-[var(--text-muted)]">
                          {item.label}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-[20px] border border-[var(--border)] bg-[linear-gradient(135deg,#2b1d05_0%,#1b1b1b_65%)] p-5">
                  <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--brand-subtle)] text-[var(--brand)]">
                    <Flame size={18} />
                  </div>
                  <p className="mt-4 text-xl font-semibold tracking-[-0.04em] text-[var(--text-primary)]">
                    Designed to reward consistency
                  </p>
                  <p className="mt-2 text-sm leading-7 text-[var(--text-secondary)]">
                    Strong product design is what makes a practice app feel believable. The goal
                    is simple: less noise, tighter focus, and better reasons to come back daily.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {featureRows.map((feature) => {
              const Icon = feature.icon;
              return (
                <div key={feature.title} className="card card-interactive p-6">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--brand-subtle)] text-[var(--brand)]">
                    <Icon size={18} />
                  </div>
                  <h2 className="mt-5 text-xl font-semibold tracking-[-0.04em] text-[var(--text-primary)]">
                    {feature.title}
                  </h2>
                  <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
