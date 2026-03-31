import {
  ArrowRight,
  BookOpenCheck,
  ChartColumnBig,
  CheckCircle2,
  Flame,
  Globe,
  Heart,
  PlayCircle,
  ShieldCheck,
  Star,
  Trophy,
  Youtube,
} from "lucide-react";
import { Link } from "wouter";

import { LiveCounter } from "@/components/prep/LiveCounter";
import { PrepButton } from "@/components/prep/PrepButton";
import { PrepCard } from "@/components/prep/PrepCard";
import { PrepLogo } from "@/components/prep/PrepLogo";
import { usePrepPreferences } from "@/contexts/PrepPreferencesContext";
import { HOME_EXAMS, LANDING_METRICS, TESTIMONIALS } from "@/lib/prepbro";

const STEP_CARDS = [
  {
    step: "01",
    title: "Choose your exam",
    description: "Pick UPSC, SSC, or state prep once. We keep the next step obvious every day.",
    icon: BookOpenCheck,
  },
  {
    step: "02",
    title: "Practice 10 daily Qs",
    description: "A focused question loop designed for evenings when attention is low and consistency matters.",
    icon: PlayCircle,
  },
  {
    step: "03",
    title: "Track your progress",
    description: "See streaks, weak subjects, and score movement without clutter or decision fatigue.",
    icon: ChartColumnBig,
  },
];

const SOCIAL_LINKS = [
  { label: "X", href: "#", icon: Globe },
  { label: "YouTube", href: "#", icon: Youtube },
  { label: "Telegram", href: "#", icon: Trophy },
];

export default function Home() {
  const { preferences, updatePreferences } = usePrepPreferences();
  const isHindi = preferences.language === "hi";

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <a href="#main-content" className="skip-link">
        {isHindi ? "मुख्य सामग्री पर जाएं" : "Skip to content"}
      </a>

      <header className="bg-[var(--color-primary)] text-white">
        <div className="pb-container flex items-center justify-between px-0 py-4">
          <PrepLogo compact />
          <button
            type="button"
            onClick={() =>
              updatePreferences({
                language: isHindi ? "en" : "hi",
              })
            }
            className="inline-flex items-center gap-2 rounded-[var(--radius-full)] border border-white/16 px-4 py-2 text-[var(--text-sm)] text-white/82 transition hover:bg-white/10"
          >
            <Globe className="h-4 w-4" />
            {isHindi ? "EN" : "हिंदी"}
          </button>
        </div>
      </header>

      <main id="main-content">
        <section className="pb-dot-grid relative overflow-hidden bg-[var(--color-primary)] text-white">
          <div className="pb-container grid min-h-[calc(100vh-76px)] items-center gap-10 py-10 md:grid-cols-[minmax(0,1fr)_460px] md:py-16">
            <div className="flex flex-col items-center text-center md:items-start md:text-left">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white/10">
                <Flame className="h-7 w-7 animate-[pb-flame-float_1.8s_ease-in-out_infinite] text-[var(--color-accent)]" />
              </div>
              <h1 className="pb-display max-w-[11ch] text-white">
                {isHindi
                  ? "UPSC और SSC के लिए भारत की सबसे तेज़ डेली प्रैक्टिस"
                  : "India's fastest daily practice for UPSC & SSC"}
              </h1>
              <p className="mt-5 max-w-xl text-[var(--text-md)] text-white/75">
                {isHindi
                  ? "हर दिन 10 सवाल। वही आदत बनाइए जो टॉपर्स को लगातार आगे रखती है।"
                  : "10 questions. Every day. Build the habit that toppers have."}
              </p>
              <div className="mt-6">
                <LiveCounter
                  initialValue={2847}
                  label={
                    isHindi ? "छात्र आज प्रैक्टिस कर चुके हैं" : "students practiced today"
                  }
                />
              </div>
              <div className="mt-8 w-full max-w-sm">
                <Link href="/onboarding">
                  <PrepButton
                    asChild
                    size="lg"
                    fullWidth
                    className="font-[var(--font-display)]"
                  >
                    <span>
                      {isHindi ? "फ्री प्रैक्टिस शुरू करें" : "Start Practicing Free"}{" "}
                      <ArrowRight className="ml-1 inline h-4 w-4" />
                    </span>
                  </PrepButton>
                </Link>
                <p className="mt-3 text-[var(--text-sm)] text-white/65">
                  {isHindi
                    ? "कोई क्रेडिट कार्ड नहीं। कोई ऐप डाउनलोड नहीं। ब्राउज़र में तुरंत चलेगा।"
                    : "No credit card. No app download. Works in browser."}
                </p>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-[420px]">
              <div className="absolute inset-x-10 top-4 h-40 rounded-full bg-[rgba(255,107,53,0.28)] blur-3xl" />
              <PrepCard
                variant="raised"
                className="relative overflow-hidden rounded-[28px] border-white/10 bg-white/95 p-5 text-[var(--color-text-primary)]"
              >
                <div className="flex items-center justify-between">
                  <span className="rounded-[var(--radius-full)] bg-[#fff3ef] px-3 py-1 text-[var(--text-sm)] font-medium text-[var(--color-accent)]">
                    {isHindi ? "आज की प्रैक्टिस" : "Today's Practice"}
                  </span>
                  <span className="font-[var(--font-mono)] text-[var(--text-sm)] text-[var(--color-text-muted)]">
                    08:12
                  </span>
                </div>
                <h2 className="mt-5 text-[28px] leading-tight">
                  {isHindi ? "डेली क्विज़, बिना शोर के" : "Daily quiz, without the noise"}
                </h2>
                <p className="mt-3 text-[var(--text-base)] text-[var(--color-text-secondary)]">
                  {isHindi
                    ? "आज का विषय: पॉलिटी। 10 सवाल, साफ़ explanations, और तुरंत feedback."
                    : "Today's subject: Polity. 10 questions, clean explanations, instant feedback."}
                </p>
                <div className="mt-6 rounded-[20px] bg-[var(--color-surface)] p-4">
                  <div className="flex items-center justify-between text-[var(--text-sm)] text-[var(--color-text-secondary)]">
                    <span>{isHindi ? "प्रोग्रेस" : "Progress"}</span>
                    <span>7 / 10</span>
                  </div>
                  <div className="mt-3 h-2 rounded-full bg-white">
                    <div className="h-full w-[70%] rounded-full bg-[var(--color-accent)]" />
                  </div>
                  <div className="mt-4 grid gap-3">
                    {["Correct answers", "Weak area focus", "Review answers"].map(item => (
                      <div
                        key={item}
                        className="flex items-center gap-3 rounded-[16px] bg-white px-4 py-3"
                      >
                        <CheckCircle2 className="h-4 w-4 text-[var(--color-success)]" />
                        <span className="text-[var(--text-sm)] text-[var(--color-text-primary)]">
                          {item}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </PrepCard>
            </div>
          </div>
        </section>

        <section className="border-y border-[var(--color-border)] bg-[var(--color-surface-raised)] py-5">
          <div className="pb-container flex gap-4 overflow-x-auto pb-hide-scrollbar">
            {LANDING_METRICS.map(metric => (
              <div
                key={metric.label}
                className="min-w-[180px] rounded-[var(--radius-lg)] bg-[var(--color-surface-raised)] px-5 py-4 shadow-[var(--shadow-card)]"
              >
                <div className="flex items-center gap-3">
                  <Star className="h-4 w-4 text-[var(--color-accent)]" />
                  <strong className="font-[var(--font-display)] text-[24px]">
                    {metric.value}
                  </strong>
                </div>
                <p className="mt-2 text-[var(--text-sm)] text-[var(--color-text-muted)]">
                  {metric.label}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="pb-container py-16">
          <div className="text-center">
            <p className="pb-kicker">{isHindi ? "कैसे काम करता है" : "How it works"}</p>
            <h2 className="pb-section-title mt-3">
              {isHindi ? "PrepBros कैसे काम करता है" : "How PrepBros works"}
            </h2>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {STEP_CARDS.map(card => {
              const Icon = card.icon;
              return (
                <PrepCard key={card.step} className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#fff3ef] font-[var(--font-display)] text-[20px] font-bold text-[var(--color-accent)]">
                      {card.step}
                    </div>
                    <Icon className="h-6 w-6 text-[var(--color-primary)]" />
                  </div>
                  <h3 className="mt-6 text-[22px]">{card.title}</h3>
                  <p className="mt-3 text-[var(--text-base)] text-[var(--color-text-secondary)]">
                    {card.description}
                  </p>
                </PrepCard>
              );
            })}
          </div>
        </section>

        <section className="bg-[var(--color-surface)] py-16">
          <div className="pb-container">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="pb-kicker">{isHindi ? "सोशल प्रूफ" : "Social proof"}</p>
                <h2 className="pb-section-title mt-3">
                  {isHindi ? "वे टॉपर्स जिन्होंने यहीं से शुरुआत की" : "Toppers who started here"}
                </h2>
              </div>
            </div>
            <div className="mt-8 flex gap-4 overflow-x-auto pb-hide-scrollbar">
              {TESTIMONIALS.map(item => (
                <PrepCard
                  key={item.name}
                  className="min-w-[290px] max-w-[320px] p-5"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[linear-gradient(135deg,var(--color-primary),var(--color-primary-light))] text-[var(--text-base)] font-bold text-white">
                      {item.initials}
                    </div>
                    <div>
                      <h3 className="text-[18px]">{item.name}</h3>
                      <p className="text-[var(--text-sm)] text-[var(--color-text-muted)]">
                        {item.exam}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-1 text-[var(--color-accent)]">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Star key={index} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                  <p className="mt-4 text-[var(--text-base)] text-[var(--color-text-secondary)]">
                    "{item.quote}"
                  </p>
                  <p className="mt-4 text-[var(--text-sm)] font-medium text-[var(--color-primary)]">
                    {item.rank}
                  </p>
                </PrepCard>
              ))}
            </div>
          </div>
        </section>

        <section className="pb-container py-16">
          <div className="text-center">
            <p className="pb-kicker">{isHindi ? "कवरेज" : "Coverage"}</p>
            <h2 className="pb-section-title mt-3">
              {isHindi ? "आप जिस भी परीक्षा की तैयारी करें" : "Prep for the exam you're chasing"}
            </h2>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3">
            {HOME_EXAMS.map(exam => (
              <div
                key={exam}
                className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-4 text-center text-[var(--text-base)] font-medium text-[var(--color-text-primary)] transition hover:-translate-y-0.5 hover:bg-[var(--color-surface-raised)] hover:shadow-[var(--shadow-card)]"
              >
                {exam}
              </div>
            ))}
          </div>
        </section>

        <section className="bg-[var(--color-primary)] py-16 text-white">
          <div className="pb-container text-center">
            <h2 className="pb-section-title text-white">
              {isHindi
                ? "आपकी 15 मिनट की रोज़ की आदत अभी से शुरू होती है"
                : "Your 15-minute daily habit starts now"}
            </h2>
            <p className="mt-4 text-[var(--text-md)] text-white/72">
              {isHindi
                ? "50,000+ अभ्यर्थियों के साथ जुड़ें जो पहले से रोज़ प्रैक्टिस कर रहे हैं।"
                : "Join 50,000+ aspirants already practicing."}
            </p>
            <div className="mx-auto mt-8 max-w-sm">
              <Link href="/onboarding">
                <PrepButton asChild size="lg" fullWidth className="font-[var(--font-display)]">
                  <span>
                    {isHindi ? "अभी शुरू करें" : "Start Practicing Free"}{" "}
                    <ArrowRight className="ml-1 inline h-4 w-4" />
                  </span>
                </PrepButton>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[var(--color-border)] bg-[var(--color-surface-raised)] py-8">
        <div className="pb-container flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <PrepLogo />
            <p className="mt-3 flex items-center gap-2 text-[var(--text-sm)] text-[var(--color-text-muted)]">
              <Heart className="h-4 w-4 text-[var(--color-accent)]" />
              Made with care for India's aspirants
            </p>
          </div>
          <div className="flex flex-wrap gap-4 text-[var(--text-sm)] text-[var(--color-text-secondary)]">
            {["About", "Blog", "Contact", "Privacy", "Terms"].map(link => (
              <a key={link} href="#" className="transition hover:text-[var(--color-primary)]">
                {link}
              </a>
            ))}
          </div>
          <div className="flex gap-3">
            {SOCIAL_LINKS.map(link => {
              const Icon = link.icon;
              return (
                <a
                  key={link.label}
                  href={link.href}
                  aria-label={link.label}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[var(--color-border)] text-[var(--color-text-secondary)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
                >
                  <Icon className="h-4 w-4" />
                </a>
              );
            })}
          </div>
        </div>
      </footer>
    </div>
  );
}
