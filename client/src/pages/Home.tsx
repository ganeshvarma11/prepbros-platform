import {
  ArrowRight,
  BarChart3,
  BookMarked,
  Brain,
  CheckCircle2,
  Flame,
  ShieldCheck,
  Target,
  TrendingUp,
} from "lucide-react";
import { Link } from "wouter";

import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/contexts/AuthContext";
import { trackEvent } from "@/lib/analytics";

const heroSignals = [
  "Daily MCQ practice",
  "PYQs and bookmarks",
  "Weak-topic review",
  "Progress that stays visible",
];

const loopSteps = [
  {
    step: "01",
    icon: Target,
    title: "Practice with a daily target",
    description:
      "Start with a realistic question count, not an overwhelming syllabus dump. The first action is always clear.",
    stat: "12 questions",
    statLabel: "Typical daily goal",
  },
  {
    step: "02",
    icon: TrendingUp,
    title: "See what actually improved",
    description:
      "Accuracy, solved count, and streaks make progress visible after every session.",
    stat: "72%",
    statLabel: "Accuracy trend",
  },
  {
    step: "03",
    icon: Brain,
    title: "Review what still feels weak",
    description:
      "Bookmarks and low-accuracy topics turn practice history into a concrete next step instead of a vague reminder.",
    stat: "6 topics",
    statLabel: "Queued for review",
  },
];

const consistencyCards = [
  {
    icon: Flame,
    title: "Daily momentum stays visible",
    description:
      "Goals, streaks, and recent sessions give users a reason to come back tomorrow without relying on hype.",
  },
  {
    icon: BookMarked,
    title: "Important questions do not get lost",
    description:
      "Bookmarks keep PYQs and revision-worthy questions close, so review starts fast when time is limited.",
  },
  {
    icon: BarChart3,
    title: "Progress feels measurable",
    description:
      "Simple analytics make it obvious whether practice volume and accuracy are moving in the right direction.",
  },
];

const benefitCards = [
  {
    title: "Works for UPSC, SSC, and state exam prep",
    description:
      "The tone is serious, the information hierarchy is clean, and the product stays focused on repeatable practice.",
  },
  {
    title: "Product-first, not coaching-poster design",
    description:
      "The landing page leads with workflows and prep signals instead of oversized claims.",
  },
  {
    title: "Clear enough for desktop and mobile",
    description:
      "Users can move from homepage to practice, dashboard, and review without fighting the interface.",
  },
  {
    title: "A tight V1 loop users can understand fast",
    description:
      "Practice, track, revisit, and stay consistent. The message is simple because the product loop should be simple.",
  },
];

const weekBars = [
  { label: "Mon", value: 52 },
  { label: "Tue", value: 68 },
  { label: "Wed", value: 74 },
  { label: "Thu", value: 61 },
  { label: "Fri", value: 82 },
  { label: "Sat", value: 90 },
];

const streakDays = [
  { label: "M", active: true },
  { label: "T", active: true },
  { label: "W", active: true },
  { label: "T", active: false },
  { label: "F", active: true },
  { label: "S", active: true },
  { label: "S", active: true },
];

const reviewTopics = [
  { name: "Polity", accuracy: "58%", width: "58%", barClassName: "bg-[var(--blue)]" },
  {
    name: "Modern History",
    accuracy: "64%",
    width: "64%",
    barClassName: "bg-[var(--brand)]",
  },
  { name: "Economy", accuracy: "67%", width: "67%", barClassName: "bg-[var(--accent)]" },
];

export default function Home() {
  const { user } = useAuth();
  const primaryHref = user ? "/dashboard" : "/practice";
  const primaryLabel = user ? "Open dashboard" : "Start practicing";

  return (
    <div className="page-container">
      <Navbar />

      <main className="px-4 pb-12 pt-6 md:pb-16 md:pt-8">
        <div className="container-shell space-y-6 md:space-y-8">
          <section className="home-hero-surface home-grid-pattern relative overflow-hidden rounded-[32px] p-6 md:p-8 lg:p-10">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.22),transparent)]" />
            <div className="relative grid gap-10 lg:grid-cols-[1.02fr_0.98fr] lg:items-center">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--brand-light)]">
                  <ShieldCheck size={13} />
                  Daily exam practice for serious aspirants
                </div>

                <h1 className="mt-6 max-w-3xl text-4xl font-semibold tracking-[-0.07em] text-[var(--text-primary)] md:text-6xl">
                  Daily exam practice that actually helps you improve.
                </h1>

                <p className="mt-5 max-w-2xl text-base leading-8 text-[var(--text-secondary)] md:text-lg">
                  PrepBros keeps the core prep loop simple: solve a focused set of MCQs, see what
                  changed, revisit weak areas, and return the next day with momentum.
                </p>

                <div className="mt-8 flex flex-wrap gap-3">
                  <Link href={primaryHref}>
                    <span
                      onClick={() =>
                        trackEvent("home_primary_cta_clicked", {
                          destination: user ? "dashboard" : "practice",
                        })
                      }
                      className="btn-primary cursor-pointer rounded-[14px] px-6 py-3.5"
                    >
                      {primaryLabel}
                      <ArrowRight size={16} />
                    </span>
                  </Link>

                  <Link href="/explore">
                    <span
                      onClick={() =>
                        trackEvent("home_secondary_cta_clicked", { destination: "explore" })
                      }
                      className="btn-secondary cursor-pointer rounded-[14px] px-6 py-3.5"
                    >
                      Explore exam tracks
                    </span>
                  </Link>
                </div>

                <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  {heroSignals.map((item) => (
                    <div
                      key={item}
                      className="rounded-[18px] border border-white/8 bg-white/5 px-4 py-3 text-sm text-[var(--text-secondary)] backdrop-blur"
                    >
                      <div className="flex items-center gap-2">
                        <CheckCircle2 size={15} className="text-[var(--accent)]" />
                        <span>{item}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 flex flex-wrap items-center gap-3 text-sm text-[var(--text-muted)]">
                  <span className="rounded-full border border-white/8 bg-white/5 px-3 py-1.5">
                    UPSC
                  </span>
                  <span className="rounded-full border border-white/8 bg-white/5 px-3 py-1.5">
                    SSC
                  </span>
                  <span className="rounded-full border border-white/8 bg-white/5 px-3 py-1.5">
                    State exams
                  </span>
                  <span>Focused product UX. No coaching-flyer noise.</span>
                </div>
              </div>

              <div className="relative">
                <div className="home-preview-surface rounded-[28px] p-4 md:p-5">
                  <div className="flex items-center justify-between rounded-[20px] border border-white/8 bg-black/15 px-4 py-3 backdrop-blur">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
                        Tuesday plan
                      </p>
                      <p className="mt-1 text-lg font-semibold text-[var(--text-primary)]">
                        Finish today’s MCQ set, then review weak areas.
                      </p>
                    </div>
                    <div className="rounded-full border border-[var(--brand-muted)] bg-[var(--brand-subtle)] px-3 py-1 text-xs font-semibold text-[var(--brand-light)]">
                      Streak: 6 days
                    </div>
                  </div>

                  <div className="mt-4 grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
                    <div className="space-y-4">
                      <div className="home-soft-card rounded-[22px] p-5">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
                              Daily goal
                            </p>
                            <p className="mt-2 text-3xl font-semibold tracking-[-0.05em] text-[var(--text-primary)]">
                              12 / 20
                            </p>
                          </div>
                          <div className="rounded-2xl bg-[var(--brand-subtle)] p-3 text-[var(--brand)]">
                            <Target size={20} />
                          </div>
                        </div>
                        <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/6">
                          <div className="h-full w-[60%] rounded-full bg-[linear-gradient(90deg,var(--brand)_0%,#ffd08a_100%)]" />
                        </div>
                        <div className="mt-4 grid gap-3 sm:grid-cols-3">
                          <div className="rounded-[16px] border border-white/8 bg-white/4 p-3">
                            <p className="text-lg font-semibold text-[var(--text-primary)]">84</p>
                            <p className="text-xs uppercase tracking-[0.14em] text-[var(--text-muted)]">
                              Solved this week
                            </p>
                          </div>
                          <div className="rounded-[16px] border border-white/8 bg-white/4 p-3">
                            <p className="text-lg font-semibold text-[var(--text-primary)]">18</p>
                            <p className="text-xs uppercase tracking-[0.14em] text-[var(--text-muted)]">
                              Bookmarks
                            </p>
                          </div>
                          <div className="rounded-[16px] border border-white/8 bg-white/4 p-3">
                            <p className="text-lg font-semibold text-[var(--text-primary)]">72%</p>
                            <p className="text-xs uppercase tracking-[0.14em] text-[var(--text-muted)]">
                              Accuracy
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="home-soft-card rounded-[22px] p-5">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
                              Sample question
                            </p>
                            <p className="mt-2 text-sm font-medium text-[var(--text-secondary)]">
                              UPSC Polity PYQ • Medium • 2021
                            </p>
                          </div>
                          <div className="rounded-full border border-[var(--blue)]/25 bg-[var(--blue-bg)] px-3 py-1 text-xs font-semibold text-[var(--blue)]">
                            Saved for review
                          </div>
                        </div>

                        <div className="mt-4 rounded-[18px] border border-white/8 bg-black/10 p-4">
                          <p className="text-base font-medium leading-7 text-[var(--text-primary)]">
                            Which Article of the Constitution is called the heart and soul of the
                            Constitution by Dr. B. R. Ambedkar?
                          </p>
                          <div className="mt-4 grid gap-2">
                            {[
                              "Article 14",
                              "Article 19",
                              "Article 21",
                              "Article 32",
                            ].map((option, index) => (
                              <div
                                key={option}
                                className={`rounded-[14px] border px-4 py-3 text-sm ${
                                  index === 3
                                    ? "border-[var(--accent)]/35 bg-[var(--accent-subtle)] text-[var(--text-primary)]"
                                    : "border-white/8 bg-white/4 text-[var(--text-secondary)]"
                                }`}
                              >
                                {option}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="home-soft-card rounded-[22px] p-5">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
                              Recent progress
                            </p>
                            <p className="mt-2 text-lg font-semibold text-[var(--text-primary)]">
                              Accuracy is trending up
                            </p>
                          </div>
                          <TrendingUp size={18} className="text-[var(--blue)]" />
                        </div>
                        <div className="mt-5 flex h-28 items-end gap-2">
                          {weekBars.map((bar, index) => (
                            <div key={bar.label} className="flex flex-1 flex-col items-center gap-2">
                              <div
                                className={`w-full rounded-t-[10px] ${
                                  index >= 4
                                    ? "bg-[linear-gradient(180deg,var(--blue)_0%,rgba(77,163,255,0.22)_100%)]"
                                    : "bg-[linear-gradient(180deg,rgba(148,163,184,0.7)_0%,rgba(148,163,184,0.12)_100%)]"
                                }`}
                                style={{ height: `${bar.value}%` }}
                              />
                              <span className="text-[11px] text-[var(--text-muted)]">
                                {bar.label}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="home-soft-card rounded-[22px] p-5">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
                          Weak-topic review
                        </p>
                        <div className="mt-4 space-y-3">
                          {reviewTopics.map((topic) => (
                            <div
                              key={topic.name}
                              className="rounded-[16px] border border-white/8 bg-white/4 px-4 py-3"
                            >
                              <div className="flex items-center justify-between gap-3">
                                <span className="text-sm font-medium text-[var(--text-primary)]">
                                  {topic.name}
                                </span>
                                <span className="text-sm font-semibold text-[var(--text-secondary)]">
                                  {topic.accuracy}
                                </span>
                              </div>
                              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/6">
                                <div
                                  className={`h-full rounded-full ${topic.barClassName}`}
                                  style={{ width: topic.width }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="home-soft-card rounded-[22px] p-5">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
                          Consistency
                        </p>
                        <div className="mt-4 flex items-center justify-between gap-2">
                          {streakDays.map((day, index) => (
                            <div
                              key={`${day.label}-${index}`}
                              className={`flex h-10 w-10 items-center justify-center rounded-[14px] border text-xs font-semibold ${
                                day.active
                                  ? "border-[var(--brand-muted)] bg-[var(--brand-subtle)] text-[var(--brand-light)]"
                                  : "border-white/8 bg-white/4 text-[var(--text-muted)]"
                              }`}
                            >
                              {day.label}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pointer-events-none absolute -bottom-5 -left-5 h-24 w-24 rounded-full bg-[var(--brand-glow)] blur-3xl" />
                <div className="pointer-events-none absolute -right-4 top-10 h-28 w-28 rounded-full bg-[var(--blue-bg)] blur-3xl" />
              </div>
            </div>
          </section>

          <section
            id="how-it-works"
            className="home-section-surface rounded-[32px] p-6 md:p-8 lg:p-10"
          >
            <div className="max-w-3xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--brand-light)]">
                How it works
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.06em] text-[var(--text-primary)] md:text-4xl">
                A prep loop built for daily repetition, not one-time motivation.
              </h2>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--text-secondary)] md:text-base">
                Every section of the product points back to the same outcome: do the work, see the
                result, and know what deserves your next session.
              </p>
            </div>

            <div className="mt-8 grid gap-4 lg:grid-cols-3">
              {loopSteps.map((item) => {
                const Icon = item.icon;

                return (
                  <div key={item.title} className="home-soft-card rounded-[24px] p-6">
                    <div className="flex items-start justify-between gap-4">
                      <span className="text-sm font-semibold tracking-[0.2em] text-[var(--brand-light)]">
                        {item.step}
                      </span>
                      <div className="rounded-2xl bg-[var(--brand-subtle)] p-3 text-[var(--brand)]">
                        <Icon size={18} />
                      </div>
                    </div>
                    <h3 className="mt-6 text-2xl font-semibold tracking-[-0.05em] text-[var(--text-primary)]">
                      {item.title}
                    </h3>
                    <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">
                      {item.description}
                    </p>
                    <div className="mt-6 rounded-[18px] border border-white/8 bg-white/4 px-4 py-4">
                      <p className="text-2xl font-semibold tracking-[-0.05em] text-[var(--text-primary)]">
                        {item.stat}
                      </p>
                      <p className="mt-1 text-xs uppercase tracking-[0.16em] text-[var(--text-muted)]">
                        {item.statLabel}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="home-section-surface rounded-[32px] p-6 md:p-8">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--brand-light)]">
                Why users stay consistent
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.06em] text-[var(--text-primary)] md:text-4xl">
                One calm workflow is easier to return to than a noisy prep portal.
              </h2>
              <p className="mt-4 text-sm leading-7 text-[var(--text-secondary)] md:text-base">
                Serious aspirants do not need more visual chaos. They need a home screen that makes
                the next useful action obvious and a system that remembers what happened yesterday.
              </p>

              <div className="mt-8 space-y-4">
                {consistencyCards.map((item) => {
                  const Icon = item.icon;

                  return (
                    <div
                      key={item.title}
                      className="rounded-[22px] border border-white/8 bg-white/4 p-5"
                    >
                      <div className="flex items-start gap-4">
                        <div className="mt-1 rounded-2xl bg-[var(--blue-bg)] p-3 text-[var(--blue)]">
                          <Icon size={18} />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold tracking-[-0.03em] text-[var(--text-primary)]">
                            {item.title}
                          </h3>
                          <p className="mt-2 text-sm leading-7 text-[var(--text-secondary)]">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="home-section-surface rounded-[32px] p-6 md:p-8">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="home-soft-card rounded-[24px] p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
                    Today
                  </p>
                  <p className="mt-2 text-3xl font-semibold tracking-[-0.05em] text-[var(--text-primary)]">
                    18 solved
                  </p>
                  <p className="mt-2 text-sm text-[var(--text-secondary)]">
                    Enough volume to keep the day moving without turning prep into a marathon.
                  </p>
                  <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/6">
                    <div className="h-full w-[78%] rounded-full bg-[linear-gradient(90deg,var(--blue)_0%,#7db9ff_100%)]" />
                  </div>
                </div>

                <div className="home-soft-card rounded-[24px] p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
                    Review queue
                  </p>
                  <div className="mt-4 space-y-3">
                    {["8 bookmarked PYQs", "5 incorrect Economy questions", "3 Polity concepts"].map(
                      (item) => (
                        <div
                          key={item}
                          className="flex items-center gap-3 rounded-[16px] border border-white/8 bg-white/4 px-4 py-3"
                        >
                          <CheckCircle2 size={15} className="text-[var(--accent)]" />
                          <span className="text-sm text-[var(--text-primary)]">{item}</span>
                        </div>
                      ),
                    )}
                  </div>
                </div>

                <div className="home-soft-card rounded-[24px] p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
                    Weekly streak
                  </p>
                  <div className="mt-4 grid grid-cols-7 gap-2">
                    {streakDays.map((day, index) => (
                      <div
                        key={`${day.label}-${index}-week`}
                        className={`rounded-[16px] px-2 py-3 text-center text-xs font-semibold ${
                          day.active
                            ? "border border-[var(--brand-muted)] bg-[var(--brand-subtle)] text-[var(--brand-light)]"
                            : "border border-white/8 bg-white/4 text-[var(--text-muted)]"
                        }`}
                      >
                        {day.label}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="home-soft-card rounded-[24px] p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
                    Focus next
                  </p>
                  <div className="mt-4 space-y-3">
                    {[
                      "Revise Polity fundamental rights PYQs",
                      "Redo missed Economy questions",
                      "Finish one SSC mixed set",
                    ].map((item) => (
                      <div
                        key={item}
                        className="rounded-[16px] border border-white/8 bg-white/4 px-4 py-3 text-sm text-[var(--text-primary)]"
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="home-section-surface rounded-[32px] p-6 md:p-8 lg:p-10">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--brand-light)]">
                  Product fit
                </p>
                <h2 className="mt-3 text-3xl font-semibold tracking-[-0.06em] text-[var(--text-primary)] md:text-4xl">
                  Clear by design, because aspirants decide quickly what feels usable.
                </h2>
              </div>
              <p className="max-w-xl text-sm leading-7 text-[var(--text-secondary)]">
                The homepage does not try to show everything. It shows enough of the product to
                make the core loop clear and useful.
              </p>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {benefitCards.map((item) => (
                <div key={item.title} className="home-soft-card rounded-[24px] p-6">
                  <h3 className="text-xl font-semibold tracking-[-0.04em] text-[var(--text-primary)]">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="home-hero-surface rounded-[32px] p-6 md:p-8 lg:p-10">
            <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
              <div className="max-w-2xl">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--brand-light)]">
                  Start your loop
                </p>
                <h2 className="mt-3 text-3xl font-semibold tracking-[-0.06em] text-[var(--text-primary)] md:text-4xl">
                  Practice daily. Track what changed. Come back sharper tomorrow.
                </h2>
                <p className="mt-4 text-sm leading-7 text-[var(--text-secondary)] md:text-base">
                  PrepBros is at its best when the experience feels calm, measurable, and easy to
                  repeat. That is exactly what this homepage now leads with.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link href={primaryHref}>
                  <span
                    onClick={() =>
                      trackEvent("home_final_cta_clicked", {
                        destination: user ? "dashboard" : "practice",
                      })
                    }
                    className="btn-primary cursor-pointer rounded-[14px] px-6 py-3.5"
                  >
                    {primaryLabel}
                    <ArrowRight size={16} />
                  </span>
                </Link>
                <Link href="/resources">
                  <span className="btn-secondary cursor-pointer rounded-[14px] px-6 py-3.5">
                    Browse resources
                  </span>
                </Link>
              </div>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
