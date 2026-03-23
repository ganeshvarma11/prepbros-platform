import { Link } from "wouter";
import { ArrowRight, BookOpen, Brain, BarChart2, Trophy, Flame, Users, Star, CheckCircle2, Zap, Target, TrendingUp } from "lucide-react";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/contexts/AuthContext";

const FEATURES = [
  { icon: BookOpen, title: "10,000+ PYQ Questions", desc: "Every UPSC, SSC, TSPSC and RRB question from the last 20 years — with explanations.", color: "#6366F1" },
  { icon: Brain,    title: "Aptitude & Reasoning",   desc: "Dedicated section for CSAT, quantitative aptitude, logical reasoning and English.", color: "#8B5CF6" },
  { icon: BarChart2,title: "Real Progress Tracking",  desc: "See your accuracy, streaks, weak topics and performance heatmap in real time.", color: "#06B6D4" },
  { icon: Trophy,   title: "Daily Challenges",        desc: "One question every day. Maintain your streak. Build the habit that toppers have.", color: "#F59E0B" },
  { icon: Target,   title: "Personalised Paths",      desc: "Curated learning paths for UPSC GS1, CSAT, SSC CGL, TSPSC and more.", color: "#10B981" },
  { icon: TrendingUp, title: "Leaderboard & Ranks",  desc: "See where you stand nationally. Compete with aspirants across India.", color: "#EF4444" },
];

const EXAMS = [
  { name: "UPSC CSE", desc: "GS1 · GS2 · GS3 · GS4 · CSAT", color: "#6366F1", bg: "#EEF2FF" },
  { name: "SSC CGL",  desc: "Quant · Reasoning · English · GK", color: "#3B82F6", bg: "#EFF6FF" },
  { name: "TSPSC",    desc: "Group 1 · Group 2 · Telangana GK", color: "#8B5CF6", bg: "#F5F3FF" },
  { name: "RRB NTPC", desc: "CBT 1 · CBT 2 · General Science",  color: "#EF4444", bg: "#FEF2F2" },
  { name: "IBPS PO",  desc: "Reasoning · Quant · English · GK", color: "#0EA5E9", bg: "#F0F9FF" },
  { name: "APPSC",    desc: "Group 1 · AP History & Culture",    color: "#10B981", bg: "#ECFDF5" },
];

const STATS = [
  { value: "65+",   label: "Questions Live",   icon: BookOpen },
  { value: "6",     label: "Exams Covered",    icon: Target   },
  { value: "100%",  label: "Free Forever",     icon: Star     },
  { value: "Daily", label: "New Questions",    icon: Zap      },
];

const TESTIMONIALS = [
  { name: "Priya Sharma", exam: "UPSC 2025 Aspirant", text: "PrepBros is the only free platform that feels like a real product. The question quality and explanations are excellent.", avatar: "PS" },
  { name: "Rahul Reddy",  exam: "TSPSC Group 1",      text: "The Telangana GK section is incredibly well curated. I practice here every morning before office.", avatar: "RR" },
  { name: "Ananya K",     exam: "SSC CGL Qualifier",  text: "Clean interface, no ads, no paywalls. Just pure practice. PrepBros changed how I prepare.", avatar: "AK" },
];

const F = ({ children, style = {} }: any) => (
  <span style={{ fontFamily: "var(--font-sans)", ...style }}>{children}</span>
);

export default function Home() {
  const { user } = useAuth();

  return (
    <div style={{ background: "var(--bg-base)", minHeight: "100vh", fontFamily: "var(--font-sans)" }}>
      <Navbar />

      {/* ── Hero ──────────────────────────────────────────────────── */}
      <section style={{ position: "relative", overflow: "hidden", paddingTop: 80, paddingBottom: 100 }}>
        {/* Background decoration */}
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -100, right: -100, width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)" }}/>
          <div style={{ position: "absolute", bottom: -50, left: -50, width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 70%)" }}/>
        </div>

        <div style={{ maxWidth: 1120, margin: "0 auto", padding: "0 24px", position: "relative" }}>
          <div style={{ maxWidth: 780, margin: "0 auto", textAlign: "center" }}>
            {/* Badge */}
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 16px", borderRadius: 9999, background: "var(--brand-subtle)", border: "1px solid var(--brand-muted)", marginBottom: 28 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--brand)", animation: "pulse-brand 2s infinite" }}/>
              <span style={{ fontSize: 13, fontWeight: 600, color: "var(--brand)" }}>100% Free · No Coaching Required</span>
            </div>

            {/* Heading */}
            <h1 style={{
              fontSize: "clamp(2.2rem, 5vw, 3.5rem)",
              fontWeight: 800, letterSpacing: "-0.04em",
              color: "var(--text-primary)", lineHeight: 1.1,
              marginBottom: 24,
            }}>
              Crack Government Exams<br/>
              <span style={{ background: "linear-gradient(135deg, #6366F1 0%, #8B5CF6 60%, #06B6D4 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                Without Spending ₹1 Lakh
              </span>
            </h1>

            <p style={{ fontSize: "1.125rem", color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 40, maxWidth: 580, margin: "0 auto 40px" }}>
              Free daily MCQ practice, real streaks, AI-curated content and study resources — built for serious UPSC, SSC, TSPSC and state exam aspirants.
            </p>

            {/* CTA buttons */}
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginBottom: 56 }}>
              <Link href="/practice">
                <button style={{
                  display: "flex", alignItems: "center", gap: 8,
                  padding: "13px 28px", borderRadius: 12,
                  background: "var(--brand)", border: "none",
                  fontSize: 15, fontWeight: 600, color: "#fff",
                  cursor: "pointer", fontFamily: "var(--font-sans)",
                  boxShadow: "0 4px 16px rgba(99,102,241,0.35)",
                  transition: "all 0.2s ease",
                }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "var(--brand-dark)"; (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)"; (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 8px 24px rgba(99,102,241,0.45)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "var(--brand)"; (e.currentTarget as HTMLButtonElement).style.transform = "none"; (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 16px rgba(99,102,241,0.35)"; }}
                >
                  Start Practicing Free
                  <ArrowRight size={16}/>
                </button>
              </Link>
              <Link href="/explore">
                <button style={{
                  display: "flex", alignItems: "center", gap: 8,
                  padding: "13px 28px", borderRadius: 12,
                  background: "transparent", border: "1.5px solid var(--border)",
                  fontSize: 15, fontWeight: 500, color: "var(--text-primary)",
                  cursor: "pointer", fontFamily: "var(--font-sans)",
                  transition: "all 0.2s ease",
                }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border-strong)"; (e.currentTarget as HTMLButtonElement).style.background = "var(--bg-muted)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border)"; (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
                >
                  Browse Questions
                </button>
              </Link>
            </div>

            {/* Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, maxWidth: 640, margin: "0 auto" }}>
              {STATS.map(({ value, label, icon: Icon }, i) => (
                <div key={i} style={{ textAlign: "center", padding: "16px 8px", borderRadius: 14, background: "var(--bg-card)", border: "1px solid var(--border)" }}>
                  <p style={{ fontSize: "1.5rem", fontWeight: 800, letterSpacing: "-0.04em", color: "var(--text-primary)", lineHeight: 1, marginBottom: 4 }}>{value}</p>
                  <p style={{ fontSize: 11, fontWeight: 500, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Exam Hubs ─────────────────────────────────────────────── */}
      <section style={{ padding: "80px 0", background: "var(--bg-subtle)", borderTop: "1px solid var(--border)" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", padding: "0 24px" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--brand)", marginBottom: 12 }}>All Major Exams</p>
            <h2 style={{ fontSize: "clamp(1.75rem, 3vw, 2.25rem)", fontWeight: 800, letterSpacing: "-0.03em", color: "var(--text-primary)", marginBottom: 12 }}>One Platform. Every Exam.</h2>
            <p style={{ fontSize: "1rem", color: "var(--text-secondary)", maxWidth: 480, margin: "0 auto" }}>Curated questions, study paths and resources for every major government exam in India.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 14 }}>
            {EXAMS.map(({ name, desc, color, bg }, i) => (
              <Link key={i} href="/practice">
                <div style={{
                  padding: "20px 18px", borderRadius: 16,
                  background: "var(--bg-card)", border: "1px solid var(--border)",
                  cursor: "pointer", transition: "all 0.2s ease",
                }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = color; (e.currentTarget as HTMLElement).style.transform = "translateY(-3px)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 24px rgba(0,0,0,0.08)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"; (e.currentTarget as HTMLElement).style.transform = "none"; (e.currentTarget as HTMLElement).style.boxShadow = "none"; }}
                >
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: bg, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12, fontSize: 16, fontWeight: 800, color, fontFamily: "var(--font-sans)" }}>
                    {name[0]}
                  </div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4, letterSpacing: "-0.01em" }}>{name}</p>
                  <p style={{ fontSize: 11.5, color: "var(--text-muted)", lineHeight: 1.5 }}>{desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────────────── */}
      <section style={{ padding: "80px 0" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", padding: "0 24px" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--brand)", marginBottom: 12 }}>Why PrepBros</p>
            <h2 style={{ fontSize: "clamp(1.75rem, 3vw, 2.25rem)", fontWeight: 800, letterSpacing: "-0.03em", color: "var(--text-primary)", marginBottom: 12 }}>Everything You Need. Nothing You Don't.</h2>
            <p style={{ fontSize: "1rem", color: "var(--text-secondary)", maxWidth: 480, margin: "0 auto" }}>Built by aspirants, for aspirants. No ads. No paywalls. No fluff.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>
            {FEATURES.map(({ icon: Icon, title, desc, color }, i) => (
              <div key={i} style={{
                padding: "28px", borderRadius: 18,
                background: "var(--bg-card)", border: "1px solid var(--border)",
                transition: "all 0.2s ease",
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border-strong)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 24px rgba(0,0,0,0.06)"; (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"; (e.currentTarget as HTMLElement).style.boxShadow = "none"; (e.currentTarget as HTMLElement).style.transform = "none"; }}
              >
                <div style={{ width: 44, height: 44, borderRadius: 12, background: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                  <Icon size={20} style={{ color }}/>
                </div>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginBottom: 8, letterSpacing: "-0.01em" }}>{title}</h3>
                <p style={{ fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.65 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Social proof ──────────────────────────────────────────── */}
      <section style={{ padding: "80px 0", background: "var(--bg-subtle)", borderTop: "1px solid var(--border)" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", padding: "0 24px" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--brand)", marginBottom: 12 }}>Aspirants Love It</p>
            <h2 style={{ fontSize: "clamp(1.75rem, 3vw, 2.25rem)", fontWeight: 800, letterSpacing: "-0.03em", color: "var(--text-primary)" }}>What Aspirants Are Saying</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
            {TESTIMONIALS.map(({ name, exam, text, avatar }, i) => (
              <div key={i} style={{ padding: "24px", borderRadius: 18, background: "var(--bg-card)", border: "1px solid var(--border)" }}>
                <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                  {[1,2,3,4,5].map(s => <Star key={s} size={14} style={{ color: "#F59E0B", fill: "#F59E0B" }}/>)}
                </div>
                <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 20 }}>"{text}"</p>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--brand-subtle)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "var(--brand)" }}>{avatar}</div>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{name}</p>
                    <p style={{ fontSize: 12, color: "var(--text-muted)" }}>{exam}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ────────────────────────────────────────────── */}
      <section style={{ padding: "80px 0" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", padding: "0 24px" }}>
          <div style={{
            borderRadius: 24, overflow: "hidden",
            background: "linear-gradient(135deg, #4F46E5 0%, #6366F1 40%, #8B5CF6 100%)",
            padding: "60px 40px", textAlign: "center",
            position: "relative",
          }}>
            <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle at 20% 50%, rgba(255,255,255,0.08) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.06) 0%, transparent 40%)", pointerEvents: "none" }}/>
            <div style={{ position: "relative" }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 16px", borderRadius: 9999, background: "rgba(255,255,255,0.15)", marginBottom: 20, border: "1px solid rgba(255,255,255,0.2)" }}>
                <Flame size={14} style={{ color: "#FCD34D" }}/>
                <span style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>Join thousands of aspirants already practicing</span>
              </div>
              <h2 style={{ fontSize: "clamp(1.75rem, 4vw, 2.75rem)", fontWeight: 800, color: "#fff", letterSpacing: "-0.03em", marginBottom: 16 }}>
                Your UPSC Journey Starts Today
              </h2>
              <p style={{ fontSize: "1rem", color: "rgba(255,255,255,0.8)", marginBottom: 36, maxWidth: 480, margin: "0 auto 36px" }}>
                Free forever. No credit card. No coaching fees. Just practice, consistency and results.
              </p>
              <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
                <Link href="/practice">
                  <button style={{
                    display: "flex", alignItems: "center", gap: 8,
                    padding: "13px 28px", borderRadius: 12,
                    background: "#fff", border: "none",
                    fontSize: 15, fontWeight: 700, color: "#4F46E5",
                    cursor: "pointer", fontFamily: "var(--font-sans)",
                    transition: "all 0.2s ease",
                  }}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)"; (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 8px 24px rgba(0,0,0,0.15)"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = "none"; (e.currentTarget as HTMLButtonElement).style.boxShadow = "none"; }}
                  >
                    Start Practicing Free <ArrowRight size={16}/>
                  </button>
                </Link>
                <Link href="/explore">
                  <button style={{
                    padding: "13px 28px", borderRadius: 12,
                    background: "transparent", border: "1.5px solid rgba(255,255,255,0.4)",
                    fontSize: 15, fontWeight: 500, color: "#fff",
                    cursor: "pointer", fontFamily: "var(--font-sans)",
                    transition: "all 0.2s ease",
                  }}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.1)"; (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.6)"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.4)"; }}
                  >
                    Explore Content
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────── */}
      <footer style={{ borderTop: "1px solid var(--border)", padding: "40px 0", background: "var(--bg-subtle)" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", padding: "0 24px", display: "flex", flexWrap: "wrap", gap: 24, alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: "linear-gradient(135deg, #6366F1, #8B5CF6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, color: "#fff" }}>P</div>
            <span style={{ fontWeight: 700, fontSize: 15, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>PrepBros</span>
            <span style={{ fontSize: 12, color: "var(--text-muted)", marginLeft: 8 }}>Free UPSC & Govt Exam Prep</span>
          </div>
          <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
            {[["Practice","/practice"],["Aptitude","/aptitude"],["Explore","/explore"],["Leaderboard","/leaderboard"],["Resources","/resources"],["Premium","/premium"]].map(([l,h]) => (
              <Link key={h} href={h}><span style={{ fontSize: 13, color: "var(--text-muted)", cursor: "pointer", transition: "color 0.15s" }}>{l}</span></Link>
            ))}
          </div>
          <p style={{ fontSize: 12, color: "var(--text-faint)" }}>© 2025 PrepBros. Free forever.</p>
        </div>
      </footer>
    </div>
  );
}