import { ArrowRight, BarChart3, BookOpenText, Check, Clock3, Flame, Target } from "lucide-react";
import { Link } from "wouter";

import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/contexts/AuthContext";
import { trackEvent } from "@/lib/analytics";

const workflowCards = [
  {
    icon: BookOpenText,
    title: "Practice",
    description: "Daily questions that keep your prep active without adding noise to the routine.",
  },
  {
    icon: BarChart3,
    title: "Track",
    description: "Clear accuracy and progress signals so you always know how the week is going.",
  },
  {
    icon: Target,
    title: "Improve",
    description: "Revisit weak topics, correct mistakes, and keep consistency working in your favor.",
  },
];

const proofPoints = [
  "No distractions",
  "Focused question solving",
  "Clear progress tracking",
];

export default function Home() {
  const { user } = useAuth();
  const primaryHref = user ? "/dashboard" : "/practice";
  const primaryLabel = user ? "Continue Practice" : "Start Free Today";

  const handlePrimaryClick = (source: "hero" | "cta") => {
    trackEvent("home_primary_cta_clicked", {
      source,
      destination: user ? "dashboard" : "practice",
    });
  };

  return (
    <div className="page-container landing-minimal-page">
      <Navbar variant="landing" />

      <main className="relative px-4 pb-20 pt-4 md:pb-24 md:pt-6">
        <div className="container-shell">
          <section className="landing-hero-shell overflow-hidden px-6 pb-10 pt-8 md:px-10 md:pb-14 md:pt-9 lg:px-12 lg:pb-16">
            <div className="landing-hero-glow landing-hero-glow-left" />
            <div className="landing-hero-glow landing-hero-glow-right" />

            <div className="relative grid gap-10 lg:grid-cols-[minmax(0,1.02fr)_minmax(320px,390px)] lg:items-center lg:gap-12">
              <div className="max-w-2xl">
                <p className="text-lg font-medium text-[var(--text-secondary)] md:text-xl">
                  Prep for UPSC, SSC &amp; State Exams
                </p>

                <h1 className="mt-5 max-w-[10ch] text-balance text-5xl font-semibold leading-[0.98] tracking-[-0.08em] text-[var(--text-primary)] md:text-6xl lg:text-[4.6rem]">
                  Daily practice that actually improves your score.
                </h1>

                <p className="mt-6 max-w-[34rem] text-lg leading-8 text-[var(--text-secondary)] md:text-[1.45rem]">
                  Prep with a simple system: Practice. Track. Improve.
                </p>

                <p className="mt-3 text-lg leading-8 text-[var(--text-secondary)] md:text-[1.45rem]">
                  Start today. Stay consistent. See results.
                </p>

                <div className="mt-8 flex flex-wrap gap-3">
                  <Link href={primaryHref}>
                    <span
                      onClick={() => handlePrimaryClick("hero")}
                      className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-[18px] bg-[linear-gradient(180deg,#ff9a3d_0%,#ff7d17_100%)] px-7 py-4 text-lg font-medium text-white shadow-[0_22px_48px_-26px_rgba(255,125,23,0.95)] transition hover:brightness-105"
                    >
                      {primaryLabel}
                      <ArrowRight size={18} />
                    </span>
                  </Link>

                  <a
                    href="#review-system"
                    className="inline-flex items-center justify-center rounded-[18px] border border-[var(--border)] bg-[rgba(255,255,255,0.02)] px-6 py-4 text-lg font-medium text-[var(--text-primary)] transition hover:border-[var(--border-strong)]"
                  >
                    How it works
                  </a>
                </div>

                <div className="mt-8 inline-flex flex-wrap items-center gap-3 rounded-full border border-[var(--border)] bg-[rgba(255,255,255,0.03)] px-5 py-3 text-base text-[var(--text-secondary)]">
                  <span>Daily MCQs</span>
                  <span className="text-[var(--text-muted)]">•</span>
                  <span>PYQs</span>
                  <span className="text-[var(--text-muted)]">•</span>
                  <span>Weak Topic Tracking</span>
                </div>
              </div>

              <div className="landing-panel mx-auto w-full max-w-[390px] p-5 md:p-7">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm uppercase tracking-[0.2em] text-[var(--text-muted)]">
                      Daily Goal
                    </p>
                    <h2 className="mt-2 text-[2.2rem] font-semibold tracking-[-0.05em] text-[var(--text-primary)]">
                      Keep the streak moving
                    </h2>
                  </div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--border)] bg-[rgba(255,255,255,0.03)] text-[var(--brand)]">
                    <Flame size={18} />
                  </div>
                </div>

                <div className="mt-6 h-3 overflow-hidden rounded-full bg-[rgba(255,255,255,0.08)]">
                  <div className="landing-progress-fill h-full w-[72%] rounded-full" />
                </div>

                <div className="mt-5 space-y-3">
                  <div className="landing-panel-soft flex items-center justify-between gap-4 px-5 py-4">
                    <div className="flex items-center gap-3">
                      <Target size={18} className="text-[var(--brand-light)]" />
                      <span className="text-lg text-[var(--text-secondary)]">Accuracy</span>
                    </div>
                    <span className="text-[2.3rem] font-semibold tracking-[-0.05em] text-[var(--text-primary)]">
                      82%
                    </span>
                  </div>

                  <div className="landing-panel-soft flex items-center justify-between gap-4 px-5 py-4">
                    <div className="flex items-center gap-3">
                      <Clock3 size={18} className="text-[#7ed8f7]" />
                      <span className="text-lg text-[var(--text-secondary)]">Time</span>
                    </div>
                    <span className="text-[2rem] font-semibold tracking-[-0.05em] text-[var(--text-primary)]">
                      16 min left
                    </span>
                  </div>
                </div>

                <Link href={primaryHref}>
                  <span
                    onClick={() => handlePrimaryClick("cta")}
                    className="mt-6 inline-flex w-full cursor-pointer items-center justify-center rounded-[18px] bg-[linear-gradient(180deg,#ff9a3d_0%,#ff7d17_100%)] px-6 py-4 text-xl font-medium text-white shadow-[0_24px_48px_-28px_rgba(255,125,23,0.9)] transition hover:brightness-105"
                  >
                    {primaryLabel}
                  </span>
                </Link>
              </div>
            </div>
          </section>

          <section id="review-system" className="mt-20 md:mt-24">
            <div className="text-center">
              <h2 className="text-4xl font-semibold tracking-[-0.06em] text-[var(--text-primary)] md:text-5xl">
                How it works
              </h2>
            </div>

            <div className="mt-10 grid gap-4 lg:grid-cols-[1fr_auto_1fr_auto_1fr] lg:items-center">
              {workflowCards.map((item, index) => {
                const Icon = item.icon;

                return (
                  <div key={item.title} className="contents">
                    <div className="landing-step-card px-6 py-6 md:px-7 md:py-7">
                      <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[16px] border border-[var(--border)] bg-[rgba(255,255,255,0.03)] text-[var(--text-primary)]">
                          <Icon size={22} />
                        </div>
                        <div>
                          <h3 className="text-[2rem] font-semibold tracking-[-0.05em] text-[var(--text-primary)]">
                            {item.title}
                          </h3>
                          <p className="mt-2 text-lg leading-8 text-[var(--text-secondary)]">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    </div>

                    {index < workflowCards.length - 1 ? (
                      <div className="hidden text-center text-4xl text-[var(--text-muted)] lg:block">
                        ›
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </section>

          <section className="mt-20 md:mt-24">
            <div className="text-center">
              <h2 className="text-4xl font-semibold tracking-[-0.06em] text-[var(--text-primary)] md:text-5xl">
                Built for serious aspirants
              </h2>
            </div>

            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {proofPoints.map((item) => (
                <div
                  key={item}
                  className="landing-proof-pill flex items-center justify-center gap-3 px-5 py-5 text-center"
                >
                  <Check size={24} className="shrink-0 text-[var(--text-primary)]" />
                  <span className="text-xl font-medium text-[var(--text-secondary)]">{item}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-20 pb-4 pt-4 text-center md:mt-24">
            <p className="text-4xl font-medium tracking-[-0.06em] text-[var(--text-primary)] md:text-[3.4rem]">
              Stop consuming. Start solving.
            </p>

            <Link href={primaryHref}>
              <span
                onClick={() => handlePrimaryClick("cta")}
                className="mt-8 inline-flex cursor-pointer items-center justify-center rounded-[20px] bg-[linear-gradient(180deg,#ff9a3d_0%,#ff7d17_100%)] px-10 py-5 text-[1.95rem] font-medium text-white shadow-[0_28px_60px_-34px_rgba(255,125,23,0.95)] transition hover:brightness-105"
              >
                {primaryLabel}
              </span>
            </Link>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
