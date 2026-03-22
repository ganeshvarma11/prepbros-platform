import { useState } from "react";
import { Link } from "wouter";
import {
  Flame, Target, Trophy, BookOpen, TrendingUp, TrendingDown,
  Calendar, Star, Bookmark, ChevronRight, Award, Zap,
  CheckCircle2, Clock, BarChart2, Edit2, Bell, Share2,
  Sun, Moon
} from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";
import { questions } from "../data/questions";

// ── Mock user data (replace with real Supabase data later) ──────────
const USER = {
  name: "Ganesh Meesa",
  username: "ganeshmeesa",
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
    UPSC: { solved: 48, total: 24, accuracy: 76 },
    SSC:  { solved: 22, total: 8,  accuracy: 68 },
    TSPSC:{ solved: 17, total: 8,  accuracy: 82 },
  },
  strongTopics: ["Polity", "Environment", "Telangana GK"],
  weakTopics:   ["Economy", "Reasoning", "Modern History"],
  topicAccuracy: {
    "Polity":        { solved: 18, accuracy: 89 },
    "History":       { solved: 12, accuracy: 58 },
    "Geography":     { solved: 10, accuracy: 70 },
    "Environment":   { solved: 9,  accuracy: 85 },
    "Economy":       { solved: 7,  accuracy: 51 },
    "Science & Technology": { solved: 8, accuracy: 75 },
    "Reasoning":     { solved: 6,  accuracy: 48 },
    "Telangana GK":  { solved: 11, accuracy: 88 },
    "Current Affairs":{ solved: 6, accuracy: 67 },
  },
  pyqCompletion: { UPSC: 38, SSC: 55, TSPSC: 62 },
  recentActivity: [
    { date: "Today",     topic: "Polity",    exam: "UPSC",  score: "8/10",  time: "12 min" },
    { date: "Yesterday", topic: "Geography", exam: "UPSC",  score: "7/10",  time: "15 min" },
    { date: "Mar 20",    topic: "Telangana GK", exam: "TSPSC", score: "9/10", time: "10 min" },
    { date: "Mar 19",    topic: "Economy",   exam: "SSC",   score: "5/10",  time: "18 min" },
    { date: "Mar 18",    topic: "Environment", exam: "UPSC", score: "8/10", time: "11 min" },
  ],
  badges: [
    { icon: "🔥", label: "7-Day Streak",    earned: true  },
    { icon: "🎯", label: "First 50 Solved", earned: true  },
    { icon: "⚡", label: "Speed Solver",    earned: true  },
    { icon: "🏆", label: "Top 100",         earned: false },
    { icon: "📚", label: "PYQ Master",      earned: false },
    { icon: "🌟", label: "100 Streak",      earned: false },
  ],
  // 15-week heatmap data (Mon-Sun, 15 cols)
  heatmap: Array.from({length:15*7}, (_,i) => {
    const r = Math.random();
    if (i > 80) return r > 0.4 ? Math.floor(r*10)+1 : 0;
    return r > 0.7 ? Math.floor(r*8)+1 : 0;
  }),
};

const EXAM_COLORS: Record<string,string> = {
  UPSC:  "bg-orange-100 text-orange-700",
  SSC:   "bg-blue-100 text-blue-700",
  TSPSC: "bg-purple-100 text-purple-700",
};

const heatColor = (v: number) => {
  if (v === 0) return "bg-gray-100 dark:bg-gray-800";
  if (v <= 2)  return "bg-orange-100 dark:bg-orange-900";
  if (v <= 5)  return "bg-orange-300 dark:bg-orange-700";
  if (v <= 8)  return "bg-orange-500";
  return "bg-orange-600";
};

export default function Profile() {
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<"overview"|"progress"|"bookmarks"|"activity">("overview");
  const [targetExam, setTargetExam] = useState(USER.targetExam);

  const solvedPct = Math.round((USER.totalSolved / USER.totalQuestions) * 100);
  const goalPct   = Math.round((USER.todaySolved / USER.dailyGoal) * 100);
  const rankPct   = Math.round(((USER.totalUsers - USER.rank) / USER.totalUsers) * 100);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
      {/* ── Navbar ── */}
      <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-14">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg text-orange-500">
            <span className="w-8 h-8 bg-orange-500 text-white rounded-lg flex items-center justify-center text-sm font-bold">P</span>
            PrepBros
          </Link>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600 dark:text-gray-300">
            {[["Home","/"],["Practice","/practice"],["Explore","/explore"],["Contests","/contests"],["Leaderboard","/leaderboard"],["Resources","/resources"]].map(([l,h])=>(
              <Link key={h} href={h} className="hover:text-orange-500 transition-colors">{l}</Link>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={toggleTheme} className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800">
              {theme==="dark"?<Sun size={15}/>:<Moon size={15}/>}
            </button>
            <button className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800">
              <Bell size={15}/>
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6">

          {/* ── LEFT: Profile Card ── */}
          <div className="space-y-4">

            {/* Avatar + Info */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-xl font-bold shadow-lg">
                  {USER.avatar}
                </div>
                <div className="flex gap-1.5">
                  <button className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-400 hover:text-orange-500 hover:border-orange-300 transition-colors">
                    <Share2 size={13}/>
                  </button>
                  <button className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-400 hover:text-orange-500 hover:border-orange-300 transition-colors">
                    <Edit2 size={13}/>
                  </button>
                </div>
              </div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white">{USER.name}</h1>
              <p className="text-sm text-gray-400 mb-3">@{USER.username} · Joined {USER.joinedDate}</p>

              {/* Target Exam */}
              <div className="mb-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Target Exam</p>
                <select value={targetExam} onChange={e=>setTargetExam(e.target.value)}
                  className="w-full text-sm border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-orange-50 dark:bg-gray-800 text-orange-700 dark:text-orange-400 font-medium focus:outline-none focus:ring-1 focus:ring-orange-400">
                  {USER.targetExams.map(e=><option key={e} value={e}>{e}</option>)}
                </select>
              </div>

              {/* Rank */}
              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-gray-800 dark:to-gray-800 rounded-xl border border-orange-100 dark:border-gray-700">
                <div>
                  <p className="text-xs text-gray-500">Global Rank</p>
                  <p className="text-xl font-bold text-orange-500">#{USER.rank}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">Top</p>
                  <p className="text-xl font-bold text-gray-700 dark:text-gray-200">{rankPct}%</p>
                </div>
                <Trophy size={32} className="text-orange-300"/>
              </div>
            </div>

            {/* Streak Card */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-1.5"><Flame size={15} className="text-orange-500"/>Streak</p>
              </div>
              <div className="flex items-end gap-4 mb-4">
                <div>
                  <p className="text-4xl font-black text-orange-500">{USER.streak}</p>
                  <p className="text-xs text-gray-400">Current days</p>
                </div>
                <div className="pb-1">
                  <p className="text-xl font-bold text-gray-400">{USER.maxStreak}</p>
                  <p className="text-xs text-gray-400">Best ever</p>
                </div>
              </div>
              {/* Week dots */}
              <div className="flex gap-1.5">
                {["M","T","W","T","F","S","S"].map((d,i)=>(
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div className={`w-full h-2 rounded-full ${i<5?"bg-orange-400":"bg-gray-200 dark:bg-gray-700"}`}/>
                    <span className="text-xs text-gray-400">{d}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Daily Goal */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-1.5"><Target size={15} className="text-orange-500"/>Today's Goal</p>
                <span className="text-xs font-bold text-orange-500">{USER.todaySolved}/{USER.dailyGoal}</span>
              </div>
              <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-3 mb-2">
                <div className="bg-gradient-to-r from-orange-400 to-orange-500 h-3 rounded-full transition-all" style={{width:`${Math.min(goalPct,100)}%`}}/>
              </div>
              <p className="text-xs text-gray-400">{goalPct>=100?"🎉 Daily goal achieved!":` ${USER.dailyGoal-USER.todaySolved} more questions to reach your goal`}</p>
              <Link href="/practice">
                <button className="w-full mt-3 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-xl transition-colors flex items-center justify-center gap-1.5">
                  <Zap size={13}/> Continue Practicing
                </button>
              </Link>
            </div>

            {/* Badges */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-1.5 mb-3"><Award size={15} className="text-orange-500"/>Badges</p>
              <div className="grid grid-cols-3 gap-2">
                {USER.badges.map((b,i)=>(
                  <div key={i} className={`flex flex-col items-center gap-1 p-2 rounded-xl border transition-colors ${b.earned?"border-orange-200 bg-orange-50 dark:bg-gray-800 dark:border-orange-900":"border-gray-100 dark:border-gray-800 opacity-40 grayscale"}`}>
                    <span className="text-xl">{b.icon}</span>
                    <span className="text-xs text-center text-gray-600 dark:text-gray-400 leading-tight">{b.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── RIGHT: Main Content ── */}
          <div className="space-y-4">

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label:"Questions Solved", value:USER.totalSolved, sub:`of ${USER.totalQuestions}`, icon:<BookOpen size={16}/>, color:"text-orange-500" },
                { label:"Accuracy", value:`${USER.accuracy}%`, sub:"overall", icon:<Target size={16}/>, color:"text-green-500" },
                { label:"Streak", value:`${USER.streak}d`, sub:`best: ${USER.maxStreak}d`, icon:<Flame size={16}/>, color:"text-orange-400" },
                { label:"Rank", value:`#${USER.rank}`, sub:`top ${rankPct}%`, icon:<Trophy size={16}/>, color:"text-amber-500" },
              ].map((s,i)=>(
                <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-4">
                  <div className={`${s.color} mb-2`}>{s.icon}</div>
                  <p className="text-2xl font-black text-gray-900 dark:text-white">{s.value}</p>
                  <p className="text-xs text-gray-400">{s.label}</p>
                  <p className="text-xs text-gray-300 dark:text-gray-600">{s.sub}</p>
                </div>
              ))}
            </div>

            {/* Tabs */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="flex border-b border-gray-100 dark:border-gray-800">
                {(["overview","progress","bookmarks","activity"] as const).map(tab=>(
                  <button key={tab} onClick={()=>setActiveTab(tab)}
                    className={`flex-1 py-3 text-sm font-medium capitalize transition-colors ${activeTab===tab?"text-orange-500 border-b-2 border-orange-500 bg-orange-50 dark:bg-gray-800":"text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"}`}>
                    {tab}
                  </button>
                ))}
              </div>

              <div className="p-5">

                {/* ── OVERVIEW TAB ── */}
                {activeTab==="overview" && (
                  <div className="space-y-6">

                    {/* Difficulty breakdown */}
                    <div>
                      <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">Questions by Difficulty</p>
                      <div className="flex gap-3 mb-3">
                        {Object.entries(USER.solvedByDifficulty).map(([d,n])=>(
                          <div key={d} className="flex-1 text-center p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                            <p className={`text-xl font-black ${d==="Easy"?"text-green-500":d==="Medium"?"text-yellow-500":"text-red-500"}`}>{n}</p>
                            <p className="text-xs text-gray-400">{d}</p>
                          </div>
                        ))}
                      </div>
                      {/* Progress bars */}
                      {Object.entries(USER.solvedByDifficulty).map(([d,n])=>(
                        <div key={d} className="flex items-center gap-3 mb-2">
                          <span className="text-xs w-14 text-gray-500">{d}</span>
                          <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-full h-2">
                            <div className={`h-2 rounded-full ${d==="Easy"?"bg-green-400":d==="Medium"?"bg-yellow-400":"bg-red-400"}`} style={{width:`${(n/USER.totalSolved)*100}%`}}/>
                          </div>
                          <span className="text-xs text-gray-400 w-6">{n}</span>
                        </div>
                      ))}
                    </div>

                    {/* Activity Heatmap */}
                    <div>
                      <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3 flex items-center gap-1.5"><Calendar size={14}/>Activity — Last 15 Weeks</p>
                      <div className="flex gap-1 overflow-x-auto pb-2">
                        {Array.from({length:15},(_,week)=>(
                          <div key={week} className="flex flex-col gap-1">
                            {Array.from({length:7},(_,day)=>(
                              <div key={day} className={`w-3 h-3 rounded-sm ${heatColor(USER.heatmap[week*7+day])} transition-colors`} title={`${USER.heatmap[week*7+day]} questions`}/>
                            ))}
                          </div>
                        ))}
                      </div>
                      <div className="flex items-center gap-1.5 mt-2">
                        <span className="text-xs text-gray-400">Less</span>
                        {["bg-gray-100 dark:bg-gray-800","bg-orange-100","bg-orange-300","bg-orange-500","bg-orange-600"].map((c,i)=>(
                          <div key={i} className={`w-3 h-3 rounded-sm ${c}`}/>
                        ))}
                        <span className="text-xs text-gray-400">More</span>
                      </div>
                    </div>

                    {/* Strong & Weak Topics */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2 flex items-center gap-1.5"><TrendingUp size={13} className="text-green-500"/>Strong Topics</p>
                        <div className="space-y-2">
                          {USER.strongTopics.map(t=>(
                            <div key={t} className="flex items-center justify-between p-2 bg-green-50 dark:bg-green-950 rounded-lg border border-green-100 dark:border-green-900">
                              <span className="text-xs font-medium text-green-700 dark:text-green-400">{t}</span>
                              <span className="text-xs font-bold text-green-600">{USER.topicAccuracy[t as keyof typeof USER.topicAccuracy]?.accuracy}%</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2 flex items-center gap-1.5"><TrendingDown size={13} className="text-red-500"/>Needs Work</p>
                        <div className="space-y-2">
                          {USER.weakTopics.map(t=>(
                            <div key={t} className="flex items-center justify-between p-2 bg-red-50 dark:bg-red-950 rounded-lg border border-red-100 dark:border-red-900">
                              <span className="text-xs font-medium text-red-700 dark:text-red-400">{t}</span>
                              <span className="text-xs font-bold text-red-600">{USER.topicAccuracy[t as keyof typeof USER.topicAccuracy]?.accuracy ?? "—"}%</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── PROGRESS TAB ── */}
                {activeTab==="progress" && (
                  <div className="space-y-6">

                    {/* Exam-wise progress */}
                    <div>
                      <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3 flex items-center gap-1.5"><BarChart2 size={14}/>Exam-wise Progress</p>
                      {Object.entries(USER.examProgress).map(([exam,data])=>(
                        <div key={exam} className="mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
                          <div className="flex items-center justify-between mb-2">
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${EXAM_COLORS[exam]}`}>{exam}</span>
                            <span className="text-xs text-gray-500">{data.accuracy}% accuracy</span>
                          </div>
                          <div className="flex items-center gap-3 mb-1">
                            <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div className="bg-orange-500 h-2 rounded-full" style={{width:`${Math.min((data.solved/50)*100,100)}%`}}/>
                            </div>
                            <span className="text-xs text-gray-500 w-16 text-right">{data.solved} solved</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* PYQ Completion */}
                    <div>
                      <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3 flex items-center gap-1.5"><Star size={14} className="text-orange-500"/>PYQ Completion</p>
                      {Object.entries(USER.pyqCompletion).map(([exam,pct])=>(
                        <div key={exam} className="flex items-center gap-3 mb-3">
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full w-16 text-center ${EXAM_COLORS[exam]}`}>{exam}</span>
                          <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-full h-3">
                            <div className="bg-gradient-to-r from-orange-400 to-orange-500 h-3 rounded-full transition-all" style={{width:`${pct}%`}}/>
                          </div>
                          <span className="text-xs font-bold text-orange-500 w-8">{pct}%</span>
                        </div>
                      ))}
                    </div>

                    {/* Topic accuracy table */}
                    <div>
                      <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">Topic-wise Accuracy</p>
                      <div className="space-y-2">
                        {Object.entries(USER.topicAccuracy).sort((a,b)=>b[1].accuracy-a[1].accuracy).map(([topic,data])=>(
                          <div key={topic} className="flex items-center gap-3">
                            <span className="text-xs text-gray-600 dark:text-gray-400 w-32 truncate">{topic}</span>
                            <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-full h-2">
                              <div className={`h-2 rounded-full ${data.accuracy>=80?"bg-green-400":data.accuracy>=60?"bg-yellow-400":"bg-red-400"}`} style={{width:`${data.accuracy}%`}}/>
                            </div>
                            <span className={`text-xs font-bold w-8 text-right ${data.accuracy>=80?"text-green-500":data.accuracy>=60?"text-yellow-500":"text-red-500"}`}>{data.accuracy}%</span>
                            <span className="text-xs text-gray-400 w-12 text-right">{data.solved} solved</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* ── BOOKMARKS TAB ── */}
                {activeTab==="bookmarks" && (
                  <div>
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-4 flex items-center gap-1.5"><Bookmark size={14} className="text-orange-500"/>Bookmarked Questions</p>
                    <div className="text-center py-12">
                      <Bookmark size={32} className="mx-auto text-gray-300 dark:text-gray-700 mb-3"/>
                      <p className="text-sm text-gray-400">No bookmarks yet</p>
                      <p className="text-xs text-gray-300 dark:text-gray-600 mt-1">Bookmark questions while practicing to revisit them here</p>
                      <Link href="/practice">
                        <button className="mt-4 px-4 py-2 bg-orange-500 text-white text-sm rounded-xl hover:bg-orange-600 transition-colors">Start Practicing</button>
                      </Link>
                    </div>
                  </div>
                )}

                {/* ── ACTIVITY TAB ── */}
                {activeTab==="activity" && (
                  <div>
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-4 flex items-center gap-1.5"><Clock size={14} className="text-orange-500"/>Recent Activity</p>
                    <div className="space-y-3">
                      {USER.recentActivity.map((a,i)=>(
                        <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-orange-200 dark:hover:border-orange-900 transition-colors">
                          <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-950 flex items-center justify-center flex-shrink-0">
                            <CheckCircle2 size={14} className="text-orange-500"/>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{a.topic}</p>
                            <p className="text-xs text-gray-400">{a.date} · {a.time}</p>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${EXAM_COLORS[a.exam]}`}>{a.exam}</span>
                            <span className="text-sm font-bold text-orange-500">{a.score}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <button className="w-full mt-4 py-2 border border-gray-200 dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center justify-center gap-1.5 transition-colors">
                      View all activity <ChevronRight size={13}/>
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