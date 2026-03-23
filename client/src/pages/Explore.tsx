import { useState } from "react";
import { Link } from "wouter";
import {
  Sun, Moon, Flame, BookOpen, Brain, BarChart2,
  Globe, Zap, Trophy, TrendingUp, ArrowRight,
  Star, Clock, Users, Target, ChevronRight
} from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";
import { useAuth } from "../contexts/AuthContext";
import { questions } from "../data/questions";

// ── Daily challenge — rotate by day ─────────────────────────────
const todayIdx = new Date().getDate() % questions.length;
const dailyQ = questions[todayIdx];

// ── Stats from question bank ─────────────────────────────────────
const totalPYQ    = questions.filter(q => q.type === "PYQ").length;
const upscCount   = questions.filter(q => q.exam === "UPSC").length;
const sscCount    = questions.filter(q => q.exam === "SSC").length;
const tspscCount  = questions.filter(q => q.exam === "TSPSC").length;

// ── Topic collections ────────────────────────────────────────────
const TOPIC_COLLECTIONS = [
  { topic: "Polity",              icon: "⚖️",  color: "bg-orange-50 dark:bg-orange-950 border-orange-100 dark:border-orange-900" },
  { topic: "History",             icon: "📜",  color: "bg-amber-50 dark:bg-amber-950 border-amber-100 dark:border-amber-900" },
  { topic: "Geography",           icon: "🗺️",  color: "bg-green-50 dark:bg-green-950 border-green-100 dark:border-green-900" },
  { topic: "Economy",             icon: "📈",  color: "bg-blue-50 dark:bg-blue-950 border-blue-100 dark:border-blue-900" },
  { topic: "Environment",         icon: "🌿",  color: "bg-teal-50 dark:bg-teal-950 border-teal-100 dark:border-teal-900" },
  { topic: "Science & Technology",icon: "🔬",  color: "bg-purple-50 dark:bg-purple-950 border-purple-100 dark:border-purple-900" },
  { topic: "Reasoning",           icon: "🧠",  color: "bg-indigo-50 dark:bg-indigo-950 border-indigo-100 dark:border-indigo-900" },
  { topic: "Quantitative Aptitude",icon: "🔢", color: "bg-cyan-50 dark:bg-cyan-950 border-cyan-100 dark:border-cyan-900" },
  { topic: "English Language",    icon: "📖",  color: "bg-rose-50 dark:bg-rose-950 border-rose-100 dark:border-rose-900" },
  { topic: "Telangana GK",        icon: "🏛️",  color: "bg-violet-50 dark:bg-violet-950 border-violet-100 dark:border-violet-900" },
  { topic: "Current Affairs",     icon: "📰",  color: "bg-yellow-50 dark:bg-yellow-950 border-yellow-100 dark:border-yellow-900" },
  { topic: "Data Interpretation", icon: "📊",  color: "bg-pink-50 dark:bg-pink-950 border-pink-100 dark:border-pink-900" },
];

// ── Exam hubs ────────────────────────────────────────────────────
const EXAM_HUBS = [
  {
    exam: "UPSC",
    label: "UPSC Civil Services",
    icon: "🏛️",
    color: "from-orange-500 to-orange-600",
    count: upscCount,
    desc: "IAS, IPS, IFS — India's most prestigious exam",
    tags: ["GS1", "GS2", "GS3", "GS4", "CSAT"],
    nextExam: "UPSC Prelims 2025 — May 25",
  },
  {
    exam: "SSC",
    label: "SSC Exams",
    icon: "📋",
    color: "from-blue-500 to-blue-600",
    count: sscCount,
    desc: "CGL, CHSL, MTS — Staff Selection Commission",
    tags: ["CGL", "CHSL", "MTS", "GD"],
    nextExam: "SSC CGL 2025 — July",
  },
  {
    exam: "TSPSC",
    label: "TSPSC Exams",
    icon: "🌆",
    color: "from-purple-500 to-purple-600",
    count: tspscCount,
    desc: "Group 1, 2, 4 — Telangana State PSC",
    tags: ["Group 1", "Group 2", "Group 4", "AEE"],
    nextExam: "TSPSC Group 2 2025",
  },
  {
    exam: "RRB",
    label: "Railway Exams",
    icon: "🚂",
    color: "from-green-500 to-green-600",
    count: questions.filter(q => q.exam === "RRB").length,
    desc: "NTPC, Group D — Indian Railways",
    tags: ["NTPC", "Group D", "ALP", "JE"],
    nextExam: "RRB NTPC 2025",
  },
];

// ── Trending topics ──────────────────────────────────────────────
const TRENDING = [
  { title: "Environment & Climate Change",  exam: "UPSC", heat: 98, reason: "COP30 + UPSC 2025 focus" },
  { title: "Indian Economy — Budget 2025",  exam: "UPSC", heat: 95, reason: "Union Budget questions expected" },
  { title: "Quantitative Aptitude",         exam: "SSC",  heat: 92, reason: "SSC CGL 2025 prep season" },
  { title: "Telangana History & Culture",   exam: "TSPSC",heat: 89, reason: "TSPSC Group 2 upcoming" },
  { title: "Polity — Constitutional Bodies",exam: "UPSC", heat: 85, reason: "Frequently asked in Prelims" },
  { title: "Science & Technology",          exam: "UPSC", heat: 82, reason: "AI, Space, Defence trending" },
];

// ── Learning paths ───────────────────────────────────────────────
const PATHS = [
  { title: "UPSC Prelims GS1 — Complete",  icon: "🏛️", questions: 31, time: "4 weeks", level: "Beginner → Advanced", color: "border-orange-200 dark:border-orange-900", link: "/practice" },
  { title: "UPSC CSAT Crash Course",        icon: "🧮", questions: 29, time: "2 weeks", level: "Intermediate",       color: "border-blue-200 dark:border-blue-900",   link: "/aptitude" },
  { title: "SSC CGL Complete Prep",         icon: "📋", questions: 17, time: "3 weeks", level: "Beginner",           color: "border-green-200 dark:border-green-900", link: "/practice" },
  { title: "Telangana Special — TSPSC",     icon: "🌆", questions: 8,  time: "1 week",  level: "Beginner",           color: "border-purple-200 dark:border-purple-900",link: "/practice" },
  { title: "Indian Polity Deep Dive",       icon: "⚖️", questions: 6,  time: "1 week",  level: "Intermediate",       color: "border-amber-200 dark:border-amber-900",  link: "/practice" },
  { title: "Reasoning Master Class",        icon: "🧠", questions: 9,  time: "1 week",  level: "Intermediate",       color: "border-indigo-200 dark:border-indigo-900", link: "/aptitude" },
];

// ── PYQ years ────────────────────────────────────────────────────
const PYQ_YEARS = [2024,2023,2022,2021,2020,2019,2018,2017,2016,2015];

export default function Explore() {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const [dailySolved, setDailySolved] = useState(false);
  const [dailySelected, setDailySelected] = useState<number|null>(null);

  const topicCount = (topic: string) => questions.filter(q => q.topic === topic).length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
      {/* Navbar */}
      <nav className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-14">
          <Link href="/" className="flex items-center gap-2 font-bold text-base text-orange-500">
            <span className="w-7 h-7 bg-orange-500 text-white rounded-lg flex items-center justify-center text-xs font-bold">P</span>
            PrepBros
          </Link>
          <div className="hidden md:flex items-center gap-5 text-sm text-gray-500 dark:text-gray-400">
            {[["Home","/"],["Practice","/practice"],["Aptitude","/aptitude"],["Explore","/explore"],["Contests","/contests"],["Leaderboard","/leaderboard"]].map(([l,h])=>(
              <Link key={h} href={h} className={`hover:text-gray-900 dark:hover:text-white transition-colors ${h==="/explore"?"text-orange-500 font-semibold":""}`}>{l}</Link>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={toggleTheme} className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              {theme==="dark"?<Sun size={15}/>:<Moon size={15}/>}
            </button>
            {user ? (
              <Link href="/profile"><span className="text-sm px-3 py-1.5 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">{user.user_metadata?.full_name?.split(" ")[0] || "Profile"}</span></Link>
            ) : (
              <Link href="/"><span className="text-sm px-3 py-1.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 cursor-pointer">Login</span></Link>
            )}
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-8 space-y-12">

        {/* Hero */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Explore PrepBros</h1>
          <p className="text-sm text-gray-400">Structured paths, daily challenges and curated content for every government exam</p>
        </div>

        {/* ── Daily Challenge ── */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Flame size={16} className="text-orange-500"/>
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wide">Today's Challenge</h2>
            <span className="text-xs text-gray-400 ml-auto">{new Date().toLocaleDateString("en-IN", { weekday:"long", day:"numeric", month:"long" })}</span>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-5 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame size={14} className="text-white"/>
                <span className="text-xs font-semibold text-white">Daily Challenge — {dailyQ.exam}</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-orange-100">
                <span className="flex items-center gap-1"><Users size={11}/> 2,847 solved today</span>
                <span className="flex items-center gap-1"><Clock size={11}/> {dailyQ.difficulty}</span>
              </div>
            </div>
            <div className="p-5">
              <div className="flex flex-wrap gap-2 mb-3">
                <span className="text-xs px-2 py-0.5 rounded-full bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-400 font-medium">{dailyQ.exam}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 font-medium">{dailyQ.topic}</span>
                {dailyQ.year && <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 font-medium">PYQ {dailyQ.year}</span>}
              </div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">{dailyQ.question}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {dailyQ.options.map((opt, i) => {
                  let cls = "border-2 border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 hover:border-orange-300 hover:bg-orange-50 dark:hover:bg-gray-700";
                  if (dailySelected !== null) {
                    if (i === dailyQ.correct) cls = "border-2 border-green-500 bg-green-50 dark:bg-green-950";
                    else if (i === dailySelected) cls = "border-2 border-red-400 bg-red-50 dark:bg-red-950";
                    else cls = "border-2 border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 opacity-50";
                  }
                  return (
                    <button key={i} onClick={() => { if (dailySelected === null) { setDailySelected(i); setDailySolved(true); }}}
                      className={`text-left px-4 py-2.5 rounded-xl text-sm transition-all ${cls} ${dailySelected===null?"cursor-pointer":"cursor-default"}`}>
                      <span className="flex items-center gap-2">
                        <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center text-xs font-bold flex-shrink-0 ${dailySelected!==null && i===dailyQ.correct?"border-green-500 bg-green-500 text-white":dailySelected!==null && i===dailySelected?"border-red-400 bg-red-400 text-white":"border-gray-300 dark:border-gray-600 text-gray-400"}`}>
                          {["A","B","C","D"][i]}
                        </span>
                        <span className="text-gray-700 dark:text-gray-300">{opt}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
              {dailySelected !== null && (
                <div className={`mt-4 p-3 rounded-xl border ${dailySelected===dailyQ.correct?"border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-900":"border-orange-200 bg-orange-50 dark:bg-orange-950 dark:border-orange-900"}`}>
                  <p className="text-sm font-semibold mb-1 ${dailySelected===dailyQ.correct?'text-green-700 dark:text-green-400':'text-orange-700 dark:text-orange-400'}">
                    {dailySelected===dailyQ.correct ? "✓ Correct! Well done 🎉" : `✗ Answer: ${dailyQ.options[dailyQ.correct]}`}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{dailyQ.explanation}</p>
                </div>
              )}
              {!dailySolved && (
                <p className="text-xs text-gray-400 mt-3 flex items-center gap-1"><Flame size={11} className="text-orange-400"/> Solve daily to maintain your streak</p>
              )}
            </div>
          </div>
        </section>

        {/* ── Exam Hubs ── */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Trophy size={16} className="text-orange-500"/>
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wide">Exam Hubs</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {EXAM_HUBS.map(hub => (
              <Link key={hub.exam} href={`/practice`}>
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden hover:shadow-md transition-all cursor-pointer group">
                  <div className={`bg-gradient-to-r ${hub.color} px-5 py-4`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{hub.icon}</span>
                        <div>
                          <h3 className="text-base font-bold text-white">{hub.label}</h3>
                          <p className="text-xs text-white/80">{hub.desc}</p>
                        </div>
                      </div>
                      <ArrowRight size={16} className="text-white/70 group-hover:translate-x-1 transition-transform"/>
                    </div>
                  </div>
                  <div className="px-5 py-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex gap-1.5 flex-wrap">
                        {hub.tags.map(tag => (
                          <span key={tag} className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full">{tag}</span>
                        ))}
                      </div>
                      <span className="text-xs font-semibold text-orange-500">{hub.count} questions</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <Clock size={11}/>
                      <span>{hub.nextExam}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ── Learning Paths ── */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <BookOpen size={16} className="text-orange-500"/>
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wide">Curated Learning Paths</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {PATHS.map((path, i) => (
              <Link key={i} href={path.link}>
                <div className={`bg-white dark:bg-gray-900 rounded-2xl border-2 ${path.color} p-5 hover:shadow-md transition-all cursor-pointer group`}>
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-2xl">{path.icon}</span>
                    <span className="text-xs text-gray-400">{path.time}</span>
                  </div>
                  <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1">{path.title}</h3>
                  <p className="text-xs text-gray-400 mb-3">{path.level}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 dark:text-gray-400">{path.questions} questions</span>
                    <span className="flex items-center gap-1 text-xs font-medium text-orange-500 opacity-0 group-hover:opacity-100 transition-opacity">
                      Start <ChevronRight size={12}/>
                    </span>
                  </div>
                  <div className="mt-3 w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full">
                    <div className="h-1.5 bg-orange-400 rounded-full w-0"/>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ── Topic Collections ── */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Brain size={16} className="text-orange-500"/>
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wide">Topic Collections</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {TOPIC_COLLECTIONS.map(({ topic, icon, color }) => {
              const count = topicCount(topic);
              if (count === 0) return null;
              const isAptitude = ["Reasoning","Quantitative Aptitude","English Language","Data Interpretation"].includes(topic);
              return (
                <Link key={topic} href={isAptitude ? "/aptitude" : `/practice`}>
                  <div className={`${color} border rounded-2xl p-4 text-center hover:shadow-md transition-all cursor-pointer group`}>
                    <span className="text-2xl block mb-2">{icon}</span>
                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300 leading-tight mb-1">{topic}</p>
                    <p className="text-xs text-gray-400">{count}q</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* ── PYQ Year Browser ── */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Star size={16} className="text-orange-500"/>
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wide">Practice PYQs by Year</h2>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {PYQ_YEARS.map(year => {
              const count = questions.filter(q => q.year === year).length;
              return (
                <Link key={year} href="/practice">
                  <div className="flex-shrink-0 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 text-center hover:border-orange-300 dark:hover:border-orange-700 hover:shadow-sm transition-all cursor-pointer min-w-[90px]">
                    <p className="text-base font-bold text-gray-900 dark:text-white">{year}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{count} questions</p>
                    <button className="mt-2 text-xs text-orange-500 font-medium hover:underline">Practice</button>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* ── Trending ── */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={16} className="text-orange-500"/>
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wide">Trending Now</h2>
            <span className="text-xs text-gray-400 ml-auto">Based on upcoming exams</span>
          </div>
          <div className="space-y-3">
            {TRENDING.map((t, i) => (
              <Link key={i} href="/practice">
                <div className="flex items-center gap-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 px-5 py-4 hover:border-orange-200 dark:hover:border-orange-900 transition-all cursor-pointer group">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-orange-50 dark:bg-orange-950 flex items-center justify-center flex-shrink-0">
                      <TrendingUp size={14} className="text-orange-500"/>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{t.title}</p>
                      <p className="text-xs text-gray-400">{t.reason}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="text-right">
                      <div className="flex items-center gap-1 mb-1">
                        <div className="w-16 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full">
                          <div className="h-1.5 bg-orange-500 rounded-full" style={{width:`${t.heat}%`}}/>
                        </div>
                        <span className="text-xs font-bold text-orange-500">{t.heat}%</span>
                      </div>
                      <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${t.exam==="UPSC"?"bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400":t.exam==="SSC"?"bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400":"bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400"}`}>{t.exam}</span>
                    </div>
                    <ChevronRight size={14} className="text-gray-300 group-hover:text-orange-400 transition-colors"/>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ── Quick Stats ── */}
        <section>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label:"Total Questions",  value: questions.length,  icon:<BookOpen size={16}/>,  color:"text-orange-500" },
              { label:"PYQs Available",   value: totalPYQ,          icon:<Star size={16}/>,       color:"text-amber-500"  },
              { label:"Exams Covered",    value: "6+",              icon:<Trophy size={16}/>,     color:"text-green-500"  },
              { label:"Topics",           value: "15+",             icon:<Target size={16}/>,     color:"text-purple-500" },
            ].map((s,i) => (
              <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 text-center">
                <div className={`${s.color} flex justify-center mb-2`}>{s.icon}</div>
                <p className="text-2xl font-black text-gray-900 dark:text-white">{s.value}</p>
                <p className="text-xs text-gray-400">{s.label}</p>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}