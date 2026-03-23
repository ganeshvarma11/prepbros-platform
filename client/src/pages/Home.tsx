import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  BookOpen,
  Brain,
  CalendarClock,
  CheckCircle2,
  Layers3,
  ShieldCheck,
  Sparkles,
  Target,
  Trophy,
  Users,
} from "lucide-react";
import { Link } from "wouter";

import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import SectionHeader from "@/components/SectionHeader";
import { useAuth } from "@/contexts/AuthContext";
import { trackEvent } from "@/lib/analytics";

const HERO_STATS = [
  { label: "Questions live", value: "65+" },
  { label: "Exam tracks", value: "6" },
  { label: "Free forever", value: "100%" },
  { label: "Daily momentum", value: "Yes" },
];

const FEATURE_CARDS = [
  {
    icon: BookOpen,
    title: "Real question-bank experience",
    description: "A cleaner way to browse, filter, solve, and review PYQs without the clutter of coaching portals.",
  },
  {
    icon: BarChart3,
    title: "Progress that feels actionable",
    description: "Track daily goals, question volume, streaks, and accuracy so users understand whether they’re improving.",
  },
  {
    icon: Brain,
    title: "Exam-aware practice flows",
    description: "Switch between UPSC, SSC, state exams, aptitude, and revision paths with less friction and clearer context.",
  },
  {
    icon: Trophy,
    title: "Retention loops built in",
    description: "Daily challenge, weak-topic cues, and a stronger dashboard turn one-off visits into repeat usage.",
  },
  {
    icon: Layers3,
    title: "Trustable design system",
    description: "Consistent spacing, hierarchy, forms, and empty states make the product feel deliberate instead of improvised.",
  },
  {
    icon: ShieldCheck,
    title: "Launch-ready foundations",
    description: "Auth, Supabase-backed flows, responsive surfaces, and better copy make the platform safer to market publicly.",
  },
];

const EXAM_TRACKS = [
  { name: "UPSC CSE", detail: "GS1, GS2, GS3, GS4 and CSAT practice" },
  { name: "SSC CGL", detail: "Reasoning, quant, English, and GK" },
  { name: "TSPSC", detail: "State-focused preparation and Telangana topics" },
  { name: "APPSC", detail: "Targeted state exam revision paths" },
  { name: "RRB", detail: "General awareness and railway-focused prep" },
  { name: "IBPS", detail: "Aptitude, speed, and decision making" },
];

const TRUST_STRIPS = [
  "No coaching-style visual clutter",
  "Mobile-friendly practice flow",
  "Bookmarking and progress persistence",
  "Dashboard-led habit building",
];

const NEXT_STEPS = [
  "Add your real domain and support email across the site.",
  "Replace placeholder testimonials and counts with live proof.",
  "Publish privacy policy, terms, and refund/disclaimer pages.",
  "Instrument analytics, activation funnel, and retention events.",
];

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="page-container">
      <Navbar />

      <main>
        <section className="relative overflow-hidden px-4 pb-16 pt-10 md:pb-24 md:pt-16">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(79,70,229,0.12),transparent_24%),radial-gradient(circle_at_82%_10%,rgba(34,197,94,0.12),transparent_18%)]" />
          <div className="container-shell">
            <div className="glass-panel hero-grid rounded-[36px] border border-[var(--border)] px-6 py-8 md:px-10 md:py-12">
              <div className="grid items-center gap-10 lg:grid-cols-[1.15fr_0.85fr]">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-[var(--brand-muted)] bg-[var(--brand-subtle)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--brand-dark)]">
                    <Sparkles size={14} />
                    Premium redesign in motion
                  </div>
                  <h1 className="mt-6 max-w-3xl text-4xl font-semibold tracking-[-0.07em] text-[var(--text-primary)] md:text-6xl">
                    A sharper, more credible way to prepare for government exams.
                  </h1>
                  <p className="mt-6 max-w-2xl text-base leading-8 text-[var(--text-secondary)] md:text-lg">
                    PrepBros now feels less like a side project and more like a focused exam-prep
                    platform: clearer onboarding, stronger dashboard context, better mobile
                    usability, and a practice experience designed to keep users coming back.
                  </p>

                  <div className="mt-8 flex flex-wrap items-center gap-3">
                    <Link href={user ? "/dashboard" : "/practice"}>
                      <span
                        onClick={() => trackEvent("home_primary_cta_clicked", { destination: user ? "dashboard" : "practice" })}
                        className="btn-primary cursor-pointer rounded-full px-6 py-3 text-sm md:text-base"
                      >
                        {user ? "Go to dashboard" : "Start practicing free"}
                        <ArrowRight size={16} />
                      </span>
                    </Link>
                    {!user ? (
                      <Link href="/explore">
                        <span
                          onClick={() => trackEvent("home_secondary_cta_clicked", { destination: "explore" })}
                          className="btn-secondary cursor-pointer rounded-full px-6 py-3 text-sm md:text-base"
                        >
                          Explore the platform
                        </span>
                      </Link>
                    ) : null}
                  </div>

                  <div className="mt-8 flex flex-wrap gap-3">
                    {TRUST_STRIPS.map((item) => (
                      <div
                        key={item}
                        className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--bg-card-strong)] px-4 py-2 text-sm text-[var(--text-secondary)]"
                      >
                        <CheckCircle2 size={14} className="text-[var(--accent)]" />
                        {item}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="rounded-[28px] border border-[var(--border)] bg-[var(--bg-card-strong)] p-5 premium-ring">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--brand)]">
                          Product snapshot
                        </p>
                        <p className="mt-2 text-2xl font-semibold tracking-[-0.05em] text-[var(--text-primary)]">
                          Feels launch-ready, not stitched together.
                        </p>
                      </div>
                      <div className="rounded-2xl bg-[var(--brand-subtle)] p-3 text-[var(--brand)]">
                        <BadgeCheck size={22} />
                      </div>
                    </div>
                    <div className="mt-6 grid grid-cols-2 gap-3">
                      {HERO_STATS.map((item) => (
                        <div
                          key={item.label}
                          className="rounded-3xl border border-[var(--border)] bg-[var(--bg-subtle)] p-4"
                        >
                          <p className="text-2xl font-semibold tracking-[-0.05em] text-[var(--text-primary)]">
                            {item.value}
                          </p>
                          <p className="mt-1 text-sm text-[var(--text-muted)]">{item.label}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-[28px] border border-[var(--border)] bg-[var(--bg-inverse)] p-6 text-white">
                    <div className="flex items-center gap-3">
                      <div className="rounded-2xl bg-white/10 p-3">
                        <Target size={18} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white/65">
                          Stronger conversion path
                        </p>
                        <p className="mt-1 text-lg font-semibold">Visitor → practice → dashboard → habit</p>
                      </div>
                    </div>
                    <div className="mt-5 grid gap-3 text-sm text-white/78">
                      <p>Clearer homepage messaging reduces “what is this?” friction.</p>
                      <p>Cleaner auth and dashboard reduce post-signup drop-off.</p>
                      <p>Better mobile spacing makes the platform safer for social traffic.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 py-16 md:py-20">
          <div className="container-shell space-y-10">
            <SectionHeader
              eyebrow="Why it now feels stronger"
              title="The redesign shifts PrepBros from functional to memorable."
              description="These aren’t cosmetic tweaks. The product now has a more credible system underneath the visuals: better structure, clearer actions, and stronger habit loops."
              align="center"
            />
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {FEATURE_CARDS.map((feature) => {
                const Icon = feature.icon;

                return (
                  <div
                    key={feature.title}
                    className="card card-interactive rounded-[28px] p-6 md:p-7"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--brand-subtle)] text-[var(--brand)]">
                      <Icon size={20} />
                    </div>
                    <h3 className="mt-5 text-xl font-semibold tracking-[-0.04em] text-[var(--text-primary)]">
                      {feature.title}
                    </h3>
                    <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">
                      {feature.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="px-4 py-16 md:py-20">
          <div className="container-shell grid gap-8 lg:grid-cols-[0.88fr_1.12fr]">
            <div className="glass-panel rounded-[32px] p-6 md:p-8">
              <SectionHeader
                eyebrow="Coverage"
                title="Built to support the exams your early users care about."
                description="The interface now presents breadth more intentionally, which helps trust and reduces perceived product immaturity."
              />
              <div className="mt-8 grid gap-3">
                {EXAM_TRACKS.map((item) => (
                  <div
                    key={item.name}
                    className="flex items-start gap-3 rounded-3xl border border-[var(--border)] bg-[var(--bg-card-strong)] px-4 py-4"
                  >
                    <div className="mt-1 rounded-2xl bg-[var(--brand-subtle)] p-2 text-[var(--brand)]">
                      <BookOpen size={16} />
                    </div>
                    <div>
                      <p className="font-semibold text-[var(--text-primary)]">{item.name}</p>
                      <p className="mt-1 text-sm text-[var(--text-secondary)]">{item.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              {[
                {
                  icon: Users,
                  title: "For first-time visitors",
                  description:
                    "The homepage now explains the product faster, looks more trustworthy, and gives clearer next steps.",
                },
                {
                  icon: CalendarClock,
                  title: "For retention",
                  description:
                    "The dashboard and practice flow do a better job of creating daily momentum rather than isolated sessions.",
                },
                {
                  icon: ShieldCheck,
                  title: "For trust",
                  description:
                    "Cleaner surfaces, fewer jarring patterns, and stronger messaging make users more willing to sign up.",
                },
                {
                  icon: Target,
                  title: "For launch readiness",
                  description:
                    "The product feels closer to something you can put behind a domain, content strategy, and real acquisition spend.",
                },
              ].map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.title}
                    className="card rounded-[28px] p-6"
                  >
                    <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--bg-subtle)] text-[var(--brand)]">
                      <Icon size={18} />
                    </div>
                    <p className="mt-5 text-lg font-semibold tracking-[-0.04em] text-[var(--text-primary)]">
                      {item.title}
                    </p>
                    <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">
                      {item.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="px-4 py-16 md:py-20">
          <div className="container-shell rounded-[36px] border border-[var(--border)] bg-[linear-gradient(135deg,#0f172a_0%,#1e293b_42%,#1d4ed8_100%)] px-6 py-8 text-white md:px-10 md:py-12">
            <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/65">
                  Before you launch publicly
                </p>
                <h2 className="mt-4 text-4xl font-semibold tracking-[-0.06em] text-white">
                  A premium redesign helps, but trust details still matter.
                </h2>
                <p className="mt-4 max-w-2xl text-base text-white/76">
                  The platform now looks stronger. To convert real traffic confidently, you still
                  want clear support, legal, and proof signals in place before buying the domain
                  and pushing users here from Instagram.
                </p>
              </div>
              <div className="grid gap-3">
                {NEXT_STEPS.map((item) => (
                  <div
                    key={item}
                    className="rounded-3xl border border-white/12 bg-white/8 px-4 py-4 text-sm text-white/82 backdrop-blur"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
