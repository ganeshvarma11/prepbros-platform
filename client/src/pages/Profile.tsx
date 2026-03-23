import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import {
  Flame, Target, Trophy, BookOpen, TrendingUp, TrendingDown,
  Calendar, Bookmark, ChevronRight, Award, Zap,
  Clock, Edit2, Bell, Share2, Sun, Moon,
  BarChart2, Star, LogIn, Loader2
} from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";
import { questions } from "../data/questions";

const DAYS = ["M","T","W","T","F","S","S"];

const heatColor = (v: number) => {
  if (v === 0) return "bg-gray-100 dark:bg-gray-800";
  if (v <= 3)  return "bg-orange-200 dark:bg-orange-900";
  if (v <= 6)  return "bg-orange-400 dark:bg-orange-600";
  return "bg-orange-500";
};

export default function Profile() {
  const { theme, toggleTheme } = useTheme();
  const { user, signOut } = useAuth();
  const [, navigate] = useLocation();
  const [tab, setTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [answers, setAnswers] = useState<any[]>([]);
  const [bookmarkIds, setBookmarkIds] = useState<number[]>([]);
  const [targetExam, setTargetExam] = useState("UPSC CSE 2026");

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    const load = async () => {
      setLoading(true);
      const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      if (profile) { setStats(profile); setTargetExam(profile.target_exam || "UPSC CSE 2026"); }
      else setStats({ full_name: user.user_metadata?.full_name || "Aspirant", username: user.email?.split("@")[0], target_exam: "UPSC CSE 2026", streak: 0, max_streak: 0 });
      const { data: ans } = await supabase.from("user_answers").select("question_id, is_correct, answered_at").eq("user_id", user.id).order("answered_at", { ascending: false });
      setAnswers(ans || []);
      const { data: bm } = await supabase.from("bookmarks").select("question_id").eq("user_id", user.id);
      setBookmarkIds(bm?.map((b: any) => b.question_id) || []);
      setLoading(false);
    };
    load();
  }, [user]);

  const handleTargetExamChange = async (exam: string) => {
    setTargetExam(exam);
    if (user) await supabase.from("profiles").update({ target_exam: exam }).eq("id", user.id);
  };

  const solvedIds = [...new Set(answers.map(a => a.question_id))];
  const totalSolved = solvedIds.length;
  const totalAnswered = answers.length;
  const correctAnswers = answers.filter(a => a.is_correct).length;
  const accuracy = totalAnswered > 0 ? Math.round((correctAnswers / totalAnswered) * 100) : 0;
  const today = new Date().toISOString().split("T")[0];
  const todaySolved = answers.filter(a => a.answered_at?.startsWith(today)).length;
  const dailyGoal = 10;
  const goalPct = Math.min(Math.round((todaySolved / dailyGoal) * 100), 100);
  const streak = stats?.streak || 0;
  const maxStreak = stats?.max_streak || 0;

  const solvedByDifficulty: Record<string, number> = { Easy: 0, Medium: 0, Hard: 0 };
  solvedIds.forEach(id => { const q = questions.find(q => q.id === id); if (q) solvedByDifficulty[q.difficulty] = (solvedByDifficulty[q.difficulty] || 0) + 1; });

  const topicMap: Record<string, { correct: number; total: number }> = {};
  answers.forEach(a => { const q = questions.find(q => q.id === a.question_id); if (!q) return; if (!topicMap[q.topic]) topicMap[q.topic] = { correct: 0, total: 0 }; topicMap[q.topic].total++; if (a.is_correct) topicMap[q.topic].correct++; });
  const topicAccuracy = Object.entries(topicMap).map(([topic, d]) => ({ topic, solved: d.total, accuracy: Math.round((d.correct / d.total) * 100) })).sort((a, b) => b.accuracy - a.accuracy);
  const strongTopics = topicAccuracy.filter(t => t.accuracy >= 70).slice(0, 3);
  const weakTopics = topicAccuracy.filter(t => t.accuracy < 60).slice(0, 3);

  const examMap: Record<string, { correct: number; total: number }> = {};
  answers.forEach(a => { const q = questions.find(q => q.id === a.question_id); if (!q) return; if (!examMap[q.exam]) examMap[q.exam] = { correct: 0, total: 0 }; examMap[q.exam].total++; if (a.is_correct) examMap[q.exam].correct++; });

  const pyqByExam: Record<string, { solved: number; total: number }> = {};
  questions.filter(q => q.type === "PYQ").forEach(q => { if (!pyqByExam[q.exam]) pyqByExam[q.exam] = { solved: 0, total: 0 }; pyqByExam[q.exam].total++; if (solvedIds.includes(q.id)) pyqByExam[q.exam].solved++; });

  const recentActivity = answers.slice(0, 20).reduce((acc: any[], a) => {
    const q = questions.find(q => q.id === a.question_id);
    if (!q) return acc;
    const dateStr = new Date(a.answered_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
    if (!acc.find(r => r.topic === q.topic && r.date === dateStr) && acc.length < 5) acc.push({ date: dateStr, topic: q.topic, exam: q.exam, isCorrect: a.is_correct });
    return acc;
  }, []);

  const heatmap = Array.from({ length: 15 * 7 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() - (15 * 7 - 1 - i)); const dStr = d.toISOString().split("T")[0]; return answers.filter(a => a.answered_at?.startsWith(dStr)).length; });

  const displayName = stats?.full_name || user?.user_metadata?.full_name || "Aspirant";
  const avatarLetters = displayName.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase();

  if (loading) return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
      <div className="flex items-center gap-2 text-gray-400"><Loader2 size={20} className="animate-spin"/><span className="text-sm">Loading profile...</span></div>
    </div>
  );

  if (!user) return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
      <div className="text-center">
        <p className="text-4xl mb-4">🔒</p>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Login to view your profile</h2>
        <p className="text-sm text-gray-400 mb-6">Track your progress, streaks and performance</p>
        <Link href="/"><button className="px-4 py-2 bg-orange-500 text-white text-sm rounded-xl hover:bg-orange-600 flex items-center gap-1.5 mx-auto"><LogIn size={13}/>Login</button></Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-200">
      <nav className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 flex items-center justify-between h-14">
          <Link href="/" className="flex items-center gap-2 font-bold text-base text-orange-500">
            <span className="w-7 h-7 bg-orange-500 text-white rounded-lg flex items-center justify-center text-xs font-bold">P</span>PrepBros
          </Link>
          <div className="hidden md:flex items-center gap-5 text-sm text-gray-500 dark:text-gray-400">
            {[["Home","/"],["Practice","/practice"],["Aptitude","/aptitude"],["Contests","/contests"],["Leaderboard","/leaderboard"]].map(([l,h])=>(
              <Link key={h} href={h} className="hover:text-gray-900 dark:hover:text-white transition-colors">{l}</Link>
            ))}
          </div>
          <div className="flex items-center gap-1.5">
            <button onClick={toggleTheme} className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">{theme === "dark" ? <Sun size={15}/> : <Moon size={15}/>}</button>
            <button className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"><Bell size={15}/></button>
            <button onClick={() => signOut()} className="text-xs px-3 py-1.5 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">Sign out</button>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6">
          <div className="space-y-4">
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="w-14 h-14 rounded-2xl bg-orange-500 flex items-center justify-center text-white text-lg font-bold">{avatarLetters}</div>
                <div className="flex gap-1">
                  <button className="p-1.5 rounded-lg text-gray-300 hover:text-gray-500 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"><Share2 size={13}/></button>
                  <button className="p-1.5 rounded-lg text-gray-300 hover:text-gray-500 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"><Edit2 size={13}/></button>
                </div>
              </div>
              <h1 className="text-base font-semibold text-gray-900 dark:text-white">{displayName}</h1>
              <p className="text-xs text-gray-400 mb-4">@{stats?.username || user.email?.split("@")[0]} · Joined {new Date(user.created_at).toLocaleDateString("en-IN", { month: "long", year: "numeric" })}</p>
              <div className="mb-4">
                <p className="text-xs text-gray-400 mb-1.5">Target exam</p>
                <select value={targetExam} onChange={e => handleTargetExamChange(e.target.value)} className="w-full text-xs border border-gray-200 dark:border-gray-700 rounded-lg px-2.5 py-2 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-medium focus:outline-none focus:ring-1 focus:ring-orange-400">
                  {["UPSC CSE 2026","UPSC CSE 2027","TSPSC Group 1 2025","TSPSC Group 2 2025","APPSC Group 1 2025","SSC CGL 2025","SSC CHSL 2025","RRB NTPC 2025","IBPS PO 2025"].map(e => <option key={e}>{e}</option>)}
                </select>
              </div>
              <div className="flex items-center justify-between py-3 border-t border-gray-100 dark:border-gray-800">
                <div><p className="text-xs text-gray-400">Solved</p><p className="text-xl font-bold text-gray-900 dark:text-white">{totalSolved}</p></div>
                <div className="text-right"><p className="text-xs text-gray-400">Accuracy</p><p className="text-xl font-bold text-orange-500">{accuracy}%</p></div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3 flex items-center gap-1.5"><Flame size={12} className="text-orange-500"/>Streak</p>
              <div className="flex items-baseline gap-3 mb-4">
                <span className="text-4xl font-black text-gray-900 dark:text-white">{streak}</span>
                <span className="text-sm text-gray-400">days · best <span className="font-semibold text-gray-600 dark:text-gray-300">{maxStreak}</span></span>
              </div>
              <div className="flex gap-1">
                {DAYS.map((d, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                    <div className={`w-full h-1.5 rounded-full ${i < (streak % 7) ? "bg-orange-400" : "bg-gray-100 dark:bg-gray-800"}`}/>
                    <span className="text-xs text-gray-300 dark:text-gray-600">{d}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide flex items-center gap-1.5"><Target size={12} className="text-orange-500"/>Today's goal</p>
                <span className="text-xs font-bold text-orange-500">{todaySolved}/{dailyGoal}</span>
              </div>
              <div className="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full mb-2">
                <div className="h-2 bg-orange-500 rounded-full transition-all" style={{width:`${goalPct}%`}}/>
              </div>
              <p className="text-xs text-gray-400 mb-3">{goalPct >= 100 ? "🎉 Goal achieved today!" : `${dailyGoal - todaySolved} more to hit your goal`}</p>
              <Link href="/practice"><button className="w-full py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-1.5"><Zap size={11}/> Continue practicing</button></Link>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3 flex items-center gap-1.5"><Award size={12} className="text-orange-500"/>Badges</p>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { icon: "🔥", label: "7-Day Streak",    earned: streak >= 7 },
                  { icon: "🎯", label: "First 50 Solved", earned: totalSolved >= 50 },
                  { icon: "⚡", label: "Speed Solver",    earned: totalAnswered >= 20 },
                  { icon: "🏆", label: "Top 100",         earned: false },
                  { icon: "📚", label: "PYQ Master",      earned: false },
                  { icon: "💯", label: "100 Streak",      earned: streak >= 100 },
                ].map((b, i) => (
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
                { label:"Solved",   value: totalSolved,    sub:`of ${questions.length}`,     icon:<BookOpen size={13}/> },
                { label:"Accuracy", value:`${accuracy}%`,  sub:"overall",                    icon:<Target size={13}/>   },
                { label:"Streak",   value:`${streak}d`,    sub:`best ${maxStreak}d`,          icon:<Flame size={13}/>    },
                { label:"Answered", value: totalAnswered,  sub:`${correctAnswers} correct`,   icon:<Trophy size={13}/>   },
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
                {["overview","progress","bookmarks","activity"].map(t => (
                  <button key={t} onClick={() => setTab(t)} className={`flex-1 py-3 text-xs font-medium capitalize transition-colors ${tab === t ? "text-orange-500 border-b-2 border-orange-500" : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"}`}>{t}</button>
                ))}
              </div>
              <div className="p-5">
                {tab === "overview" && (
                  <div className="space-y-7">
                    {totalSolved === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-3xl mb-3">📚</p>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">No questions solved yet</p>
                        <p className="text-xs text-gray-400 mb-4">Start practicing to see your stats here</p>
                        <Link href="/practice"><button className="px-4 py-2 bg-orange-500 text-white text-xs rounded-xl hover:bg-orange-600">Start Practicing</button></Link>
                      </div>
                    ) : (
                      <>
                        <div>
                          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">Questions by difficulty</p>
                          <div className="grid grid-cols-3 gap-3 mb-4">
                            {Object.entries(solvedByDifficulty).map(([d, n]) => (
                              <div key={d} className="text-center p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
                                <p className={`text-2xl font-black ${d==="Easy"?"text-green-500":d==="Medium"?"text-yellow-500":"text-red-400"}`}>{n}</p>
                                <p className="text-xs text-gray-400 mt-0.5">{d}</p>
                              </div>
                            ))}
                          </div>
                          {Object.entries(solvedByDifficulty).map(([d, n]) => (
                            <div key={d} className="flex items-center gap-3 mb-1.5">
                              <span className="text-xs text-gray-400 w-12">{d}</span>
                              <div className="flex-1 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full">
                                <div className={`h-1.5 rounded-full ${d==="Easy"?"bg-green-400":d==="Medium"?"bg-yellow-400":"bg-red-400"}`} style={{width:`${totalSolved>0?(n/totalSolved)*100:0}%`}}/>
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
                                {Array.from({length:7}, (_, day) => <div key={day} className={`w-3 h-3 rounded-sm ${heatColor(heatmap[week*7+day])}`}/>)}
                              </div>
                            ))}
                          </div>
                          <div className="flex items-center gap-1.5 mt-2">
                            <span className="text-xs text-gray-300 dark:text-gray-600">Less</span>
                            {["bg-gray-100 dark:bg-gray-800","bg-orange-200","bg-orange-400","bg-orange-500"].map((c,i)=><div key={i} className={`w-3 h-3 rounded-sm ${c}`}/>)}
                            <span className="text-xs text-gray-300 dark:text-gray-600">More</span>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2 flex items-center gap-1"><TrendingUp size={11} className="text-green-500"/>Strong</p>
                            {strongTopics.length > 0 ? (
                              <div className="space-y-1.5">{strongTopics.map(t => <div key={t.topic} className="flex items-center justify-between px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-800"><span className="text-xs text-gray-600 dark:text-gray-300 truncate">{t.topic}</span><span className="text-xs font-semibold text-green-500 ml-2">{t.accuracy}%</span></div>)}</div>
                            ) : <p className="text-xs text-gray-400">Solve more to see strong topics</p>}
                          </div>
                          <div>
                            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2 flex items-center gap-1"><TrendingDown size={11} className="text-red-400"/>Needs work</p>
                            {weakTopics.length > 0 ? (
                              <div className="space-y-1.5">{weakTopics.map(t => <div key={t.topic} className="flex items-center justify-between px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-800"><span className="text-xs text-gray-600 dark:text-gray-300 truncate">{t.topic}</span><span className="text-xs font-semibold text-red-400 ml-2">{t.accuracy}%</span></div>)}</div>
                            ) : <p className="text-xs text-gray-400">Keep solving to find weak areas</p>}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {tab === "progress" && (
                  <div className="space-y-7">
                    <div>
                      <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3 flex items-center gap-1.5"><BarChart2 size={11}/>Exam-wise</p>
                      {Object.keys(examMap).length === 0 ? <p className="text-xs text-gray-400">No data yet</p> : Object.entries(examMap).map(([exam, d]) => (
                        <div key={exam} className="mb-4">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{exam}</span>
                            <span className="text-xs text-gray-400">{Math.round((d.correct/d.total)*100)}% · {d.total} answered</span>
                          </div>
                          <div className="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full">
                            <div className="h-2 bg-orange-500 rounded-full" style={{width:`${Math.min((d.total/20)*100,100)}%`}}/>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3 flex items-center gap-1.5"><Star size={11}/>PYQ completion</p>
                      {Object.entries(pyqByExam).map(([exam, d]) => (
                        <div key={exam} className="flex items-center gap-3 mb-3">
                          <span className="text-xs font-medium text-gray-500 dark:text-gray-400 w-14">{exam}</span>
                          <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-800 rounded-full">
                            <div className="h-2 bg-orange-400 rounded-full" style={{width:`${d.total>0?Math.round((d.solved/d.total)*100):0}%`}}/>
                          </div>
                          <span className="text-xs font-semibold text-orange-500 w-8 text-right">{d.total>0?Math.round((d.solved/d.total)*100):0}%</span>
                        </div>
                      ))}
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">Topic accuracy</p>
                      {topicAccuracy.length === 0 ? <p className="text-xs text-gray-400">No data yet</p> : (
                        <div className="space-y-2.5">
                          {topicAccuracy.map(({ topic, accuracy: acc }) => (
                            <div key={topic} className="flex items-center gap-3">
                              <span className="text-xs text-gray-500 dark:text-gray-400 w-28 truncate">{topic}</span>
                              <div className="flex-1 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full">
                                <div className={`h-1.5 rounded-full ${acc>=80?"bg-green-400":acc>=60?"bg-yellow-400":"bg-red-400"}`} style={{width:`${acc}%`}}/>
                              </div>
                              <span className={`text-xs font-semibold w-8 text-right ${acc>=80?"text-green-500":acc>=60?"text-yellow-500":"text-red-400"}`}>{acc}%</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {tab === "bookmarks" && (
                  <div>
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-4 flex items-center gap-1.5"><Bookmark size={11} className="text-orange-500"/>Bookmarked questions</p>
                    {bookmarkIds.length === 0 ? (
                      <div className="text-center py-10">
                        <Bookmark size={28} className="mx-auto text-gray-200 dark:text-gray-700 mb-3"/>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">No bookmarks yet</p>
                        <p className="text-xs text-gray-300 dark:text-gray-600 mt-1 mb-4">Tap the bookmark icon while practicing</p>
                        <Link href="/practice"><button className="px-4 py-2 bg-orange-500 text-white text-xs rounded-xl hover:bg-orange-600">Go to practice</button></Link>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {bookmarkIds.map(id => {
                          const q = questions.find(q => q.id === id);
                          if (!q) return null;
                          return (
                            <Link key={id} href="/practice">
                              <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors border border-gray-100 dark:border-gray-800">
                                <Bookmark size={13} className="text-orange-400 flex-shrink-0"/>
                                <p className="text-xs text-gray-700 dark:text-gray-300 flex-1 truncate">{q.question}</p>
                                <span className="text-xs text-gray-400 flex-shrink-0">{q.topic}</span>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {tab === "activity" && (
                  <div>
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-4 flex items-center gap-1.5"><Clock size={11} className="text-orange-500"/>Recent activity</p>
                    {recentActivity.length === 0 ? (
                      <div className="text-center py-10">
                        <p className="text-sm text-gray-400">No activity yet</p>
                        <Link href="/practice"><button className="mt-3 px-4 py-2 bg-orange-500 text-white text-xs rounded-xl hover:bg-orange-600">Start Practicing</button></Link>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {recentActivity.map((a: any, i: number) => (
                          <div key={i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-bold ${a.isCorrect ? "bg-green-50 dark:bg-green-950 text-green-600" : "bg-red-50 dark:bg-red-950 text-red-500"}`}>{a.isCorrect ? "✓" : "✗"}</div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-700 dark:text-gray-200">{a.topic}</p>
                              <p className="text-xs text-gray-400">{a.date}</p>
                            </div>
                            <span className="text-xs text-gray-300 dark:text-gray-600">{a.exam}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    <button className="w-full mt-3 py-2 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 flex items-center justify-center gap-1 transition-colors">View all <ChevronRight size={11}/></button>
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