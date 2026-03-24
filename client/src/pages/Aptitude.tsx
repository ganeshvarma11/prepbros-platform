import { useState, useMemo } from "react";
import { Link } from "wouter";
import {
  ChevronLeft, ChevronRight, Shuffle, BookOpen,
  Brain, FileText, BarChart2, Globe, Zap,
  CheckCircle2, X, Bookmark, BookmarkCheck, Flag, Clock, Sun, Moon, Loader2
} from "lucide-react";
import { useQuestionBank } from "../hooks/useQuestionBank";
import { useTheme } from "../contexts/ThemeContext";
import { type Question, type Difficulty } from "../data/questions";

const APTITUDE_TOPICS = [
  "Quantitative Aptitude",
  "Reasoning",
  "Reading Comprehension",
  "Data Interpretation",
  "English Language",
  "Mental Ability",
];

const TOPIC_META: Record<string, { icon: any; color: string; bg: string; desc: string }> = {
  "Quantitative Aptitude": {
    icon: BarChart2,
    color: "text-blue-600",
    bg: "bg-blue-50 dark:bg-blue-950 border-blue-100 dark:border-blue-900",
    desc: "Arithmetic, percentages, profit-loss, time-speed, ratios",
  },
  "Reasoning": {
    icon: Brain,
    color: "text-purple-600",
    bg: "bg-purple-50 dark:bg-purple-950 border-purple-100 dark:border-purple-900",
    desc: "Syllogisms, blood relations, coding-decoding, series, puzzles",
  },
  "Reading Comprehension": {
    icon: BookOpen,
    color: "text-green-600",
    bg: "bg-green-50 dark:bg-green-950 border-green-100 dark:border-green-900",
    desc: "Passages, main idea, inference, tone and summary",
  },
  "Data Interpretation": {
    icon: BarChart2,
    color: "text-orange-600",
    bg: "bg-orange-50 dark:bg-orange-950 border-orange-100 dark:border-orange-900",
    desc: "Tables, bar charts, pie charts, set theory, Venn diagrams",
  },
  "English Language": {
    icon: Globe,
    color: "text-red-600",
    bg: "bg-red-50 dark:bg-red-950 border-red-100 dark:border-red-900",
    desc: "Grammar, vocabulary, synonyms, antonyms, spelling",
  },
  "Mental Ability": {
    icon: Zap,
    color: "text-yellow-600",
    bg: "bg-yellow-50 dark:bg-yellow-950 border-yellow-100 dark:border-yellow-900",
    desc: "Calendar, clocks, figure counting, alphabet series",
  },
};

const DIFF_COLORS: Record<Difficulty, string> = {
  Easy:   "text-green-600 bg-green-50 border border-green-200 dark:bg-green-950 dark:border-green-900",
  Medium: "text-yellow-600 bg-yellow-50 border border-yellow-200 dark:bg-yellow-950 dark:border-yellow-900",
  Hard:   "text-red-500 bg-red-50 border border-red-200 dark:bg-red-950 dark:border-red-900",
};

const EXAM_COLORS: Record<string, string> = {
  UPSC:  "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400",
  SSC:   "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
  RRB:   "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400",
  IBPS:  "bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-400",
  TSPSC: "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400",
  APPSC: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400",
};

export default function Aptitude() {
  const { resolvedTheme, toggleTheme } = useTheme();
  const { questions, loading } = useQuestionBank();
  const [activeTopic, setActiveTopic] = useState<string | null>(null);
  const [activeQ, setActiveQ] = useState<Question | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [bookmarks, setBookmarks] = useState<Array<Question["id"]>>([]);
  const [solved, setSolved] = useState<Array<Question["id"]>>([]);
  const [diffFilter, setDiffFilter] = useState<Difficulty | "">("");
  const [examFilter, setExamFilter] = useState<string>("");

  const aptitudeQuestions = useMemo(() =>
    questions.filter(q => APTITUDE_TOPICS.includes(q.topic)), [questions]);

  const topicQuestions = useMemo(() => {
    if (!activeTopic) return [];
    return aptitudeQuestions.filter(q => {
      if (q.topic !== activeTopic) return false;
      if (diffFilter && q.difficulty !== diffFilter) return false;
      if (examFilter && q.exam !== examFilter) return false;
      return true;
    });
  }, [activeTopic, diffFilter, examFilter, aptitudeQuestions]);

  const activeIdx = activeQ ? topicQuestions.findIndex(q => q.id === activeQ.id) : -1;

  const openRandom = () => {
    const pool = activeTopic ? topicQuestions : aptitudeQuestions;
    const r = pool[Math.floor(Math.random() * pool.length)];
    if (r) { setActiveQ(r); setSelected(null); setActiveTopic(r.topic); }
  };

  const topicCounts = useMemo(
    () =>
      aptitudeQuestions.reduce<Record<string, number>>((acc, question) => {
        acc[question.topic] = (acc[question.topic] || 0) + 1;
        return acc;
      }, {}),
    [aptitudeQuestions],
  );

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
            {[["Home","/"],["Practice","/practice"],["Aptitude","/aptitude"],["Contests","/contests"],["Leaderboard","/leaderboard"]].map(([l,h])=>(
              <Link key={h} href={h} className={`hover:text-gray-900 dark:hover:text-white transition-colors ${h==="/aptitude"?"text-orange-500 font-semibold":""}`}>{l}</Link>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={openRandom} className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-orange-500 text-white text-xs font-medium rounded-lg hover:bg-orange-600 transition-colors">
              <Shuffle size={12}/> Random
            </button>
            <button onClick={toggleTheme} className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              {resolvedTheme === "dark" ? <Sun size={15}/> : <Moon size={15}/>}
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
            {activeTopic && (
              <>
                <button onClick={() => { setActiveTopic(null); setActiveQ(null); setSelected(null); }}
                  className="hover:text-orange-500 transition-colors">Aptitude</button>
                <span>/</span>
                <span className="text-gray-600 dark:text-gray-300">{activeTopic}</span>
              </>
            )}
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {activeTopic ?? "Aptitude & Reasoning"}
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            {activeTopic
              ? TOPIC_META[activeTopic]?.desc
              : loading
                ? "Loading aptitude question bank..."
                : `${aptitudeQuestions.length} questions across all government exams — UPSC CSAT, SSC, RRB, IBPS, TSPSC, APPSC`}
          </p>
        </div>

        {/* Topic selection grid */}
        {!activeTopic && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {APTITUDE_TOPICS.map(topic => {
              const meta = TOPIC_META[topic];
              const Icon = meta.icon;
              const count = topicCounts[topic] || 0;
              return (
                <button key={topic} onClick={() => setActiveTopic(topic)}
                  className={`text-left p-5 rounded-2xl border ${meta.bg} hover:shadow-md transition-all group`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className={`p-2 rounded-xl bg-white dark:bg-gray-900 shadow-sm`}>
                      <Icon size={18} className={meta.color}/>
                    </div>
                    <span className="text-xs font-medium text-gray-400">{count} questions</span>
                  </div>
                  <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1">{topic}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{meta.desc}</p>
                  <div className="mt-3 flex items-center gap-1 text-xs font-medium text-orange-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    Start practicing <ChevronRight size={12}/>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Quick stats when on landing */}
        {!activeTopic && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
            {[
              { label: "Total questions", value: loading ? "..." : aptitudeQuestions.length },
              { label: "Exams covered", value: "6+" },
              { label: "Topics", value: APTITUDE_TOPICS.length },
              { label: "PYQs included", value: loading ? "..." : aptitudeQuestions.filter(q=>q.type==="PYQ").length },
            ].map((s,i) => (
              <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 text-center">
                <p className="text-2xl font-black text-orange-500">{s.value}</p>
                <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Question list for selected topic */}
        {activeTopic && !activeQ && (
          <div>
            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3 mb-5">
              <select value={diffFilter} onChange={e => setDiffFilter(e.target.value as any)}
                className="text-xs border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-orange-400">
                <option value="">All difficulties</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
              <select value={examFilter} onChange={e => setExamFilter(e.target.value)}
                className="text-xs border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-orange-400">
                <option value="">All exams</option>
                {["UPSC","SSC","RRB","IBPS","TSPSC","APPSC"].map(e => (
                  <option key={e} value={e}>{e}</option>
                ))}
              </select>
              <span className="text-xs text-gray-400 ml-auto">{topicQuestions.length} questions</span>
              <button onClick={openRandom} className="flex items-center gap-1.5 px-3 py-2 bg-orange-500 text-white text-xs rounded-lg hover:bg-orange-600 transition-colors">
                <Shuffle size={11}/> Random
              </button>
            </div>

            {/* Question cards */}
            <div className="space-y-2">
              {loading ? (
                <div className="text-center py-12 text-gray-400">
                  <Loader2 size={28} className="mx-auto mb-2 opacity-60 animate-spin"/>
                  <p className="text-sm">Loading questions...</p>
                </div>
              ) : topicQuestions.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <FileText size={28} className="mx-auto mb-2 opacity-40"/>
                  <p className="text-sm">No questions match these filters</p>
                </div>
              ) : topicQuestions.map((q, i) => (
                <div key={q.id} onClick={() => { setActiveQ(q); setSelected(null); }}
                  className="flex items-center gap-3 p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-orange-200 dark:hover:border-orange-900 cursor-pointer transition-all group">
                  <span className="text-xs text-gray-300 dark:text-gray-700 w-5 flex-shrink-0">{i+1}</span>
                  <p className="flex-1 text-sm text-gray-700 dark:text-gray-300 truncate">
                    {q.question.length > 80 ? q.question.slice(0,80)+"..." : q.question}
                  </p>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${EXAM_COLORS[q.exam]}`}>{q.exam}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${DIFF_COLORS[q.difficulty]}`}>{q.difficulty}</span>
                    {solved.includes(q.id) && <CheckCircle2 size={13} className="text-green-500"/>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Question solve view */}
        {activeQ && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 max-w-3xl mx-auto">
            {/* Top bar */}
            <div className="flex items-center justify-between mb-5">
              <button onClick={() => { setActiveQ(null); setSelected(null); }}
                className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-orange-500 transition-colors">
                <ChevronLeft size={15}/> Back
              </button>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">{activeIdx+1} / {topicQuestions.length}</span>
                <button onClick={() => setBookmarks(b => b.includes(activeQ.id) ? b.filter(x=>x!==activeQ.id) : [...b,activeQ.id])}
                  className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                  {bookmarks.includes(activeQ.id)
                    ? <BookmarkCheck size={15} className="text-orange-500"/>
                    : <Bookmark size={15} className="text-gray-300"/>}
                </button>
                <button className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-300 hover:text-red-400 transition-colors">
                  <Flag size={15}/>
                </button>
                <button onClick={() => { setActiveQ(null); setSelected(null); }}
                  className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                  <X size={15} className="text-gray-300"/>
                </button>
              </div>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-2 mb-4">
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${EXAM_COLORS[activeQ.exam]}`}>{activeQ.exam}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${DIFF_COLORS[activeQ.difficulty]}`}>{activeQ.difficulty}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 font-medium">{activeQ.subtopic}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1"><Clock size={9}/>{activeQ.year ?? "Conceptual"}</span>
            </div>

            {/* Question */}
            <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-6 leading-relaxed whitespace-pre-line">{activeQ.question}</h2>

            {/* Options */}
            <div className="space-y-3 mb-6">
              {activeQ.options.map((opt, i) => {
                let cls = "border-2 border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-orange-300 hover:bg-orange-50 dark:hover:bg-gray-800";
                if (selected !== null) {
                  if (i === activeQ.correct) cls = "border-2 border-green-400 bg-green-50 dark:bg-green-950";
                  else if (i === selected) cls = "border-2 border-red-400 bg-red-50 dark:bg-red-950";
                  else cls = "border-2 border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 opacity-50";
                }
                return (
                  <button key={i} onClick={() => {
                    if (selected === null) {
                      setSelected(i);
                      if (!solved.includes(activeQ.id)) setSolved(s => [...s, activeQ.id]);
                    }
                  }} className={`w-full text-left px-4 py-3 rounded-xl transition-all ${cls} ${selected===null?"cursor-pointer":"cursor-default"}`}>
                    <span className="flex items-center gap-3">
                      <span className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                        selected!==null && i===activeQ.correct ? "border-green-500 bg-green-500 text-white" :
                        selected!==null && i===selected ? "border-red-400 bg-red-400 text-white" :
                        "border-gray-200 dark:border-gray-700 text-gray-400"}`}>
                        {["A","B","C","D"][i]}
                      </span>
                      <span className="text-sm text-gray-700 dark:text-gray-300">{opt}</span>
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Explanation */}
            {selected !== null && (
              <div className={`p-4 rounded-xl border-2 mb-5 ${selected===activeQ.correct
                ? "border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-900"
                : "border-orange-200 bg-orange-50 dark:bg-orange-950 dark:border-orange-900"}`}>
                <p className="text-sm font-semibold mb-1">
                  {selected===activeQ.correct
                    ? <span className="text-green-700 dark:text-green-400">✓ Correct! Well done</span>
                    : <span className="text-orange-700 dark:text-orange-400">✗ Incorrect — Answer: {activeQ.options[activeQ.correct]}</span>}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{activeQ.explanation}</p>
              </div>
            )}

            {/* Tags */}
            <div className="flex flex-wrap gap-1.5 mb-5">
              {activeQ.tags.map(tag => (
                <span key={tag} className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-400 rounded-full">#{tag}</span>
              ))}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
              <button onClick={() => { if(activeIdx>0){ setActiveQ(topicQuestions[activeIdx-1]); setSelected(null); }}}
                disabled={activeIdx===0}
                className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 rounded-xl text-sm hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-30 transition-colors">
                <ChevronLeft size={13}/> Previous
              </button>
              <button onClick={openRandom}
                className="flex items-center gap-1.5 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-xl text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                <Shuffle size={13}/> Random
              </button>
              <button onClick={() => { if(activeIdx<topicQuestions.length-1){ setActiveQ(topicQuestions[activeIdx+1]); setSelected(null); }}}
                disabled={activeIdx===topicQuestions.length-1}
                className="flex items-center gap-1.5 px-4 py-2 bg-orange-500 text-white rounded-xl text-sm hover:bg-orange-600 disabled:opacity-30 transition-colors">
                Next <ChevronRight size={13}/>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
