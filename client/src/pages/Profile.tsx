import { useState } from "react";
import { Link } from "wouter";
import {
  Flame, Target, Trophy, BookOpen, TrendingUp, TrendingDown,
  Calendar, Bookmark, ChevronRight, Award, Zap,
  CheckCircle2, Clock, Edit2, Bell, Share2, Sun, Moon,
  BarChart2, Star
} from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";
import { questions } from "../data/questions";

const USER = {
  name: "Antony",
  username: "antonys08",
  avatar: "GM",
  joinedDate: "March 2025",
  targetExam: "UPSC CSE 2026",
  targetExams: ["UPSC CSE 2026", "TSPSC Group 1 2025", "SSC CGL 2025"],
  rank: 342,
  totalUsers: 12400,
  streak: 12,
  maxStreak: 21,
  totalSolved: 87,
  totalQuestions: questions.length,
  accuracy: 73,
  dailyGoal: 10,
  todaySolved: 7,
  solvedByDifficulty: { Easy: 52, Medium: 28, Hard: 7 },
  examProgress: {
    UPSC:  { solved: 48, accuracy: 76 },
    SSC:   { solved: 22, accuracy: 68 },
    TSPSC: { solved: 17, accuracy: 82 },
  },
  strongTopics: ["Polity", "Environment", "Telangana GK"],
  weakTopics:   ["Economy", "Reasoning", "Modern History"],
  topicAccuracy: {
    "Polity":          { solved: 18, accuracy: 89 },
    "History":         { solved: 12, accuracy: 58 },
    "Geography":       { solved: 10, accuracy: 70 },
    "Environment":     { solved: 9,  accuracy: 85 },
    "Economy":         { solved: 7,  accuracy: 51 },
    "Science & Tech":  { solved: 8,  accuracy: 75 },
    "Reasoning":       { solved: 6,  accuracy: 48 },
    "Telangana GK":    { solved: 11, accuracy: 88 },
    "Current Affairs": { solved: 6,  accuracy: 67 },
  },
  pyqCompletion: { UPSC: 38, SSC: 55, TSPSC: 62 },
  recentActivity: [
    { date: "Today",     topic: "Polity",       exam: "UPSC",  score: 8,  total: 10, time: "12 min" },
    { date: "Yesterday", topic: "Geography",    exam: "UPSC",  score: 7,  total: 10, time: "15 min" },
    { date: "Mar 20",    topic: "Telangana GK", exam: "TSPSC", score: 9,  total: 10, time: "10 min" },
    { date: "Mar 19",    topic: "Economy",      exam: "SSC",   score: 5,  total: 10, time: "18 min" },
    { date: "Mar 18",    topic: "Environment",  exam: "UPSC",  score: 8,  total: 10, time: "11 min" },
  ],
  badges: [
    { icon: "🔥", label: "7-Day Streak",    earned: true  },
    { icon: "🎯", label: "First 50 Solved", earned: true  },
    { icon: "⚡", label: "Speed Solver",    earned: true  },
    { icon: "🏆", label: "Top 100",         earned: false },
    { icon: "📚", label: "PYQ Master",      earned: false },
    { icon: "💯", label: "100 Streak",      earned: false },
  ],
  heatmap: Array.from({ length: 15 * 7 }, (_, i) => {
    const r = Math.random();
    if (i > 80) return r > 0.35 ? Math.floor(r * 10) + 1 : 0;
    return r > 0.72 ? Math.floor(r * 6) + 1 : 0;
  }),
};

const heatColor = (v: number) => {
  if (v === 0) return "bg-gray-100 dark:bg-gray-800";
  if (v <= 3)  return "bg-orange-200 dark:bg-orange-900";
  if (v <= 6)  return "bg-orange-400 dark:bg-orange-600";
  return "bg-orange-500";
};

const DAYS = ["M","T","W","T","F","S","S"];

export default function Profile() {
  const { theme, toggleTheme } = useTheme();
  const [tab, setTab] = useState<"overview"|"progress"|"bookmarks"|"activity">("overview");
  const [targetExam, setTargetExam] = useState(USER.targetExam);

  const rankPct = Math.round(((USER.totalUsers - USER.rank) / USER.totalUsers) * 100);
  const goalPct = Math.min(Math.round((USER.todaySolved / USER.dailyGoal) * 100), 100);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-200">
      <nav className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 flex items-center justify-between h-14">
          <Link href="/" className="flex items-center gap-2 font-bold text-base text-orange-500">
            <span className="w-7 h-7 bg-orange-500 text-white rounded-lg flex items-center justify-center text-xs font-bold">P</span>
            PrepBros
          </Link>
          <div className="hidden md:flex items-center gap-5 text-sm text-gray-500 dark:text-gray-400">
            {[["Home","/"],["Practice","/practice"],["Explore","/explore"],["Contests","/contests"],["Leaderboard","/leaderboard"]].map(([l,h])=>(
              <Link key={h} href={h} className="hover:text-gray-900 dark:hover:text-white transition-colors">{l}</Link>
            ))}
          </div>
          <div className="flex items-center gap-1.5">
            <button onClick={toggleTheme} className="p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              {theme === "dark" ? <Sun size={15}/> : <Moon size={15}/>}
            </button>
            <button className="p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <Bell size={15}/>
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6">

          <div className="space-y-4">
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="w-14 h-14 rounded-2xl bg-orange-500 flex items-center justify-center text-white text-lg font-bold">{USER.avatar}</div>
                <div className="flex gap-1">
                  <button className="p-1.5 rounded-lg text-gray-300 hover:text-gray-500 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"><Share2 size={13}/></button>
                  <button className="p-1.5 rounded-lg text-gray-300 hover:text-gray-500 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"><Edit2 size={13}/></button>
                </div>
              </div>
              <h1 className="text-base font-semibold text-gray-900 dark:text-white">{USER.name}</h1>
              <p className="text-xs text-gray-400 mb-4">@{USER.username} · Joined {USER.joinedDate}</p>
              <div className="mb-4">
                <p className="text-xs text-gray-400 mb-1.5">Target exam</p>
                <select value={targetExam} onChange={e => setTargetExam(e.target.value)}
                  className="w-full text-xs border border-gray-200 dark:border-gray-700 rounded-lg px-2.5 py-2 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-medium focus:outline-none focus:ring-1 focus:ring-orange-400">
                  {USER.targetExams.map(e => <option key={e}>{e}</option>)}
                </select>
              </div>
              <div className="flex items-center justify-between py-3 border-t border-gray-100 dark:border-gray-800">
                <div>
                  <p className="text-xs text-gray-400">Global rank</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">#{USER.rank}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400">Top</p>
                  <p className="text-xl font-bold text-orange-500">{rankPct}%</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3 flex items-center gap-1.5"><Flame size={12} className="text-orange-500"/>Streak</p>
              <div className="flex items-baseline gap-3 mb-4">
                <span className="text-4xl font-black text-gray-900 dark:text-white">{USER.streak}</span>
                <span className="text-sm text-gray-400">days · best <span className="font-semibold text-gray-600 dark:text-gray-300">{USER.maxStreak}</span></span>
              </div>
              <div className="flex gap-1">
                {DAYS.map((d, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                    <div className={`w-full h-1.5 rounded-full ${i < 5 ? "bg-orange-400" : "bg-gray-100 dark:bg-gray-800"}`}/>
                    <span className="text-xs text-gray-300 dark:text-gray-600">{d}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide flex items-center gap-1.5"><Target size={12} className="text-orange-500"/>Today's goal</p>
                <span className="text-xs font-bold text-orange-500">{USER.todaySolved}/{USER.dailyGoal}</span>
              </div>
              <div className="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full mb-2">
                <div className="h-2 bg-orange-500 rounded-full transition-all" style={{width:`${goalPct}%`}}/>
              </div>
              <p className="text-xs text-gray-400 mb-3">{goalPct >= 100 ? "🎉 Goal achieved!" : `${USER.dailyGoal - USER.todaySolved} more to hit your goal`}</p>
              <Link href="/practice">
                <button className="w-full py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-1.5">
                  <Zap size={11}/> Continue practicing
                </button>
              </Link>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3 flex items-center gap-1.5"><Award size={12} className="text-orange-500"/>Badges</p>
              <div className="grid grid-cols-3 gap-2">
                {USER.badges.map((b, i) => (
                  <div key={i} className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border text-center ${b.earned ? "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800" : "border-gray-100 dark:border-gray-800 opacity-30"}`}>
                    <span className="text-lg">{b.icon}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 leading-tight">{b.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label:"Solved",   value:USER.totalSolved,    sub:`of ${USER.totalQuestions}`, icon:<BookOpen size={13}/> },
                { label:"Accuracy", value:`${USER.accuracy}%`, sub:"overall",                  icon:<Target size={13}/>   },
                { label:"Streak",   value:`${USER.streak}d`,   sub:`best ${USER.maxStreak}d`,   icon:<Flame size={13}/>   },
                { label:"Rank",     value:`#${USER.rank}`,     sub:`top ${rankPct}%`,           icon:<Trophy size={13}/>  },
              ].map((s, i) => (
                <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4">
                  <div className="text-gray-300 dark:text-gray-600 mb-2">{s.icon}</div>
                  <p className="text-2xl font-black text-gray-900 dark:text-white">{s.value}</p>
                  <p className="text-xs text-gray-400">{s.label}</p>
                  <p className="text-xs text-gray-300 dark:text-gray-700">{s.sub}</p>
                </div>
              ))}
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
              <div className="flex border-b border-gray-100 dark:border-gray-800">
                {(["overview","progress","bookmarks","activity"] as const).map(t => (
                  <button key={t} onClick={() => setTab(t)}
                    className={`flex-1 py-3 text-xs font-medium capitalize transition-colors ${tab === t ? "text-orange-500 border-b-2 border-orange-500" : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"}`}>
                    {t}
                  </button>
                ))}
              </div>

              <div className="p-5">
                {tab === "overview" && (
                  <div className="space-y-7">
                    <div>
                      <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">Questions by difficulty</p>
                      <div className="grid grid-cols-3 gap-3 mb-4">
                        {Object.entries(USER.solvedByDifficulty).map(([d, n]) => (
                          <div key={d} className="text-center p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
                            <p className={`text-2xl font-black ${d==="Easy"?"text-green-500":d==="Medium"?"text-yellow-500":"text-red-400"}`}>{n}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{d}</p>
                          </div>
                        ))}
                      </div>
                      {Object.entries(USER.solvedByDifficulty).map(([d, n]) => (
                        <div key={d} className="flex items-center gap-3 mb-1.5">
                          <span className="text-xs text-gray-400 w-12">{d}</span>
                          <div className="flex-1 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full">
                            <div className={`h-1.5 rounded-full ${d==="Easy"?"bg-green-400":d==="Medium"?"bg-yellow-400":"bg-red-400"}`} style={{width:`${(n/USER.totalSolved)*100}%`}}/>
                          </div>
                          <span className="text-xs text-gray-400 w-4">{n}</span>
                        </div>
                      ))}
                    </div>

                    <div>
                      <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3 flex items-center gap-1.5"><Calendar size={11}/>Activity — last 15 weeks</p>
                      <div className="flex gap-1">
                        {Array.from({length:15}, (_, week) => (
                          <div key={week} className="flex flex-col gap-1">
                            {Array.from({length:7}, (_, day) => (
                              <div key={day} className={`w-3 h-3 rounded-sm ${heatColor(USER.heatmap[week*7+day])}`}/>
                            ))}
                          </div>
                        ))}
                      </div>
                      <div className="flex items-center gap-1.5 mt-2">
                        <span className="text-xs text-gray-300 dark:text-gray-600">Less</span>
                        {["bg-gray-100 dark:bg-gray-800","bg-orange-200","bg-orange-400","bg-orange-500"].map((c,i)=>(
                          <div key={i} className={`w-3 h-3 rounded-sm ${c}`}/>
                        ))}
                        <span className="text-xs text-gray-300 dark:text-gray-600">More</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2 flex items-center gap-1"><TrendingUp size={11} className="text-green-500"/>Strong</p>
                        <div className="space-y-1.5">
                          {USER.strongTopics.map(t => (
                            <div key={t} className="flex items-center justify-between px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-800">
                              <span className="text-xs text-gray-600 dark:text-gray-300">{t}</span>
                              <span className="text-xs font-semibold text-green-500">{USER.topicAccuracy[t as keyof typeof USER.topicAccuracy]?.accuracy}%</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2 flex items-center gap-1"><TrendingDown size={11} className="text-red-400"/>Needs work</p>
                        <div className="space-y-1.5">
                          {USER.weakTopics.map(t => (
                            <div key={t} className="flex items-center justify-between px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-800">
                              <span className="text-xs text-gray-600 dark:text-gray-300">{t}</span>
                              <span className="text-xs font-semibold text-red-400">{USER.topicAccuracy[t as keyof typeof USER.topicAccuracy]?.accuracy ?? "—"}%</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {tab === "progress" && (
                  <div className="space-y-7">
                    <div>
                      <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3 flex items-center gap-1.5"><BarChart2 size={11}/>Exam-wise</p>
                      {Object.entries(USER.examProgress).map(([exam, d]) => (
                        <div key={exam} className="mb-4">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{exam}</span>
                            <span className="text-xs text-gray-400">{d.accuracy}% accuracy · {d.solved} solved</span>
                          </div>
                          <div className="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full">
                            <div className="h-2 bg-orange-500 rounded-full" style={{width:`${Math.min((d.solved/60)*100,100)}%`}}/>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3 flex items-center gap-1.5"><Star size={11}/>PYQ completion</p>
                      {Object.entries(USER.pyqCompletion).map(([exam, pct]) => (
                        <div key={exam} className="flex items-center gap-3 mb-3">
                          <span className="text-xs font-medium text-gray-500 dark:text-gray-400 w-14">{exam}</span>
                          <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-800 rounded-full">
                            <div className="h-2 bg-orange-400 rounded-full" style={{width:`${pct}%`}}/>
                          </div>
                          <span className="text-xs font-semibold text-orange-500 w-8 text-right">{pct}%</span>
                        </div>
                      ))}
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">Topic accuracy</p>
                      <div className="space-y-2.5">
                        {Object.entries(USER.topicAccuracy).sort((a,b)=>b[1].accuracy-a[1].accuracy).map(([topic, d]) => (
                          <div key={topic} className="flex items-center gap-3">
                            <span className="text-xs text-gray-500 dark:text-gray-400 w-28 truncate">{topic}</span>
                            <div className="flex-1 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full">
                              <div className={`h-1.5 rounded-full ${d.accuracy>=80?"bg-green-400":d.accuracy>=60?"bg-yellow-400":"bg-red-400"}`} style={{width:`${d.accuracy}%`}}/>
                            </div>
                            <span className={`text-xs font-semibold w-8 text-right ${d.accuracy>=80?"text-green-500":d.accuracy>=60?"text-yellow-500":"text-red-400"}`}>{d.accuracy}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {tab === "bookmarks" && (
                  <div className="text-center py-14">
                    <Bookmark size={28} className="mx-auto text-gray-200 dark:text-gray-700 mb-3"/>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">No bookmarks yet</p>
                    <p className="text-xs text-gray-300 dark:text-gray-600 mt-1 mb-4">Save questions while practicing to revisit them here</p>
                    <Link href="/practice">
                      <button className="px-4 py-2 bg-orange-500 text-white text-xs font-medium rounded-xl hover:bg-orange-600 transition-colors">Go to practice</button>
                    </Link>
                  </div>
                )}

                {tab === "activity" && (
                  <div>
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-4 flex items-center gap-1.5"><Clock size={11}/>Recent sessions</p>
                    <div className="space-y-2">
                      {USER.recentActivity.map((a, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                            a.score/a.total >= 0.8 ? "bg-green-50 dark:bg-green-950 text-green-600" :
                            a.score/a.total >= 0.6 ? "bg-yellow-50 dark:bg-yellow-950 text-yellow-600" :
                            "bg-red-50 dark:bg-red-950 text-red-500"}`}>
                            {a.score}/{a.total}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-200">{a.topic}</p>
                            <p className="text-xs text-gray-400">{a.date} · {a.time}</p>
                          </div>
                          <span className="text-xs text-gray-300 dark:text-gray-600">{a.exam}</span>
                        </div>
                      ))}
                    </div>
                    <button className="w-full mt-3 py-2 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 flex items-center justify-center gap-1 transition-colors">
                      View all <ChevronRight size={11}/>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}