import { useState, useMemo, useEffect } from "react";
import { Link } from "wouter";
import { useTheme } from "../contexts/ThemeContext";
import { useAuth } from "../contexts/AuthContext";
import { saveAnswer, toggleBookmark, getBookmarks, getSolvedQuestions } from "../lib/userProgress";
import { fetchQuestions } from "../lib/questionsDB";
import {
  Filter, Search, Shuffle, ChevronLeft, ChevronRight,
  Bookmark, BookmarkCheck, Flag, Clock, CheckCircle2, Circle,
  X, SlidersHorizontal, Sun, Moon, LogIn, Loader2
} from "lucide-react";
import { type Exam, type Difficulty, type QuestionType, type Question } from "../data/questions";

const EXAM_COLORS: Record<string, string> = {
  UPSC:  "bg-orange-100 text-orange-700 border border-orange-200",
  SSC:   "bg-blue-100 text-blue-700 border border-blue-200",
  TSPSC: "bg-purple-100 text-purple-700 border border-purple-200",
  APPSC: "bg-green-100 text-green-700 border border-green-200",
  RRB:   "bg-red-100 text-red-700 border border-red-200",
  IBPS:  "bg-cyan-100 text-cyan-700 border border-cyan-200",
};

const DIFF_COLORS: Record<string, string> = {
  Easy:   "text-green-600 bg-green-50 border border-green-200",
  Medium: "text-yellow-600 bg-yellow-50 border border-yellow-200",
  Hard:   "text-red-600 bg-red-50 border border-red-200",
};

const EXAMS = ["UPSC", "SSC", "TSPSC", "APPSC", "RRB", "IBPS"];
const DIFFICULTIES = ["Easy", "Medium", "Hard"];
const TYPES = ["PYQ", "Conceptual", "CurrentAffairs", "Mock"];
const PER_PAGE = 15;

export default function Practice() {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [allTopics, setAllTopics] = useState<string[]>([]);
  const [allYears, setAllYears] = useState<number[]>([]);
  const [questionsLoading, setQuestionsLoading] = useState(true);

  const [search, setSearch]           = useState("");
  const [selExams, setSelExams]       = useState<string[]>([]);
  const [selDiff, setSelDiff]         = useState<string>("");
  const [selTypes, setSelTypes]       = useState<string[]>([]);
  const [selTopics, setSelTopics]     = useState<string[]>([]);
  const [selYears, setSelYears]       = useState<number[]>([]);
  const [sortBy, setSortBy]           = useState<"default"|"difficulty"|"year">("default");
  const [page, setPage]               = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [activeQ, setActiveQ]         = useState<Question | null>(null);
  const [selected, setSelected]       = useState<number | null>(null);
  const [bookmarks, setBookmarks]     = useState<number[]>([]);
  const [solved, setSolved]           = useState<number[]>([]);
  const [answerStart, setAnswerStart] = useState<number>(Date.now());

  // Load questions from Supabase
  useEffect(() => {
    fetchQuestions().then(qs => {
      setQuestions(qs);
      setAllTopics([...new Set(qs.map(q => q.topic))]);
      setAllYears([...new Set(qs.filter(q => q.year).map(q => q.year as number))].sort((a,b) => b-a));
      setQuestionsLoading(false);
    });
  }, []);

  // Load user progress from Supabase
  useEffect(() => {
    if (!user) { setBookmarks([]); setSolved([]); return; }
    getBookmarks(user.id).then(setBookmarks);
    getSolvedQuestions(user.id).then(setSolved);
  }, [user]);

  const filtered = useMemo(() => {
    let q = [...questions];
    if (search)           q = q.filter(x => x.question.toLowerCase().includes(search.toLowerCase()) || x.topic.toLowerCase().includes(search.toLowerCase()));
    if (selExams.length)  q = q.filter(x => selExams.includes(x.exam));
    if (selDiff)          q = q.filter(x => x.difficulty === selDiff);
    if (selTypes.length)  q = q.filter(x => selTypes.includes(x.type));
    if (selTopics.length) q = q.filter(x => selTopics.includes(x.topic));
    if (selYears.length)  q = q.filter(x => x.year !== null && selYears.includes(x.year!));
    if (sortBy === "difficulty") q.sort((a,b) => ["Easy","Medium","Hard"].indexOf(a.difficulty) - ["Easy","Medium","Hard"].indexOf(b.difficulty));
    if (sortBy === "year")       q.sort((a,b) => (b.year ?? 0) - (a.year ?? 0));
    return q;
  }, [questions, search, selExams, selDiff, selTypes, selTopics, selYears, sortBy]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated  = filtered.slice((page-1)*PER_PAGE, page*PER_PAGE);
  const activeIdx  = activeQ ? filtered.findIndex(q=>q.id===activeQ.id) : -1;
  const filterCount = selExams.length + (selDiff?1:0) + selTypes.length + selTopics.length + selYears.length;

  const toggle = <T,>(arr: T[], setArr: (v:T[])=>void, val: T) =>
    arr.includes(val) ? setArr(arr.filter(x=>x!==val)) : setArr([...arr, val]);

  const clearAll = () => {
    setSearch(""); setSelExams([]); setSelDiff(""); setSelTypes([]);
    setSelTopics([]); setSelYears([]); setSortBy("default"); setPage(1);
  };

  const openRandom = () => {
    const pool = filtered.length > 0 ? filtered : questions;
    const r = pool[Math.floor(Math.random()*pool.length)];
    if (r) { setActiveQ(r); setSelected(null); setAnswerStart(Date.now()); }
  };

  const openQuestion = (q: Question) => {
    setActiveQ(q); setSelected(null); setAnswerStart(Date.now());
  };

  const handleAnswer = (i: number) => {
    if (selected !== null || !activeQ) return;
    setSelected(i);
    if (!solved.includes(activeQ.id)) setSolved(s => [...s, activeQ.id]);
    if (user) {
      const timeTaken = Math.round((Date.now() - answerStart) / 1000);
      saveAnswer(user.id, activeQ.id, i === activeQ.correct, i, timeTaken);
    }
  };

  const handleBookmark = () => {
    if (!activeQ) return;
    if (user) {
      toggleBookmark(user.id, activeQ.id).then(isBookmarked => {
        setBookmarks(b => isBookmarked ? [...b, activeQ.id] : b.filter(x => x !== activeQ.id));
      });
    } else {
      setBookmarks(b => b.includes(activeQ.id) ? b.filter(x=>x!==activeQ.id) : [...b, activeQ.id]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-14">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg text-orange-500">
            <span className="w-8 h-8 bg-orange-500 text-white rounded-lg flex items-center justify-center text-sm font-bold">P</span>
            PrepBros
          </Link>
          <div className="hidden md:flex items-center gap-5 text-sm font-medium text-gray-600 dark:text-gray-300">
            {[["Home","/"],["Practice","/practice"],["Aptitude","/aptitude"],["Explore","/explore"],["Contests","/contests"],["Leaderboard","/leaderboard"],["Resources","/resources"]].map(([label,href])=>(
              <Link key={href} href={href} className={`hover:text-orange-500 transition-colors ${href==="/practice"?"text-orange-500 font-semibold":""}`}>{label}</Link>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={toggleTheme} className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              {theme === "dark" ? <Sun size={15}/> : <Moon size={15}/>}
            </button>
            {user ? (
              <Link href="/profile">
                <span className="text-sm px-3 py-1.5 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 cursor-pointer">
                  {user.user_metadata?.full_name?.split(" ")[0] || "Profile"}
                </span>
              </Link>
            ) : (
              <Link href="/">
                <span className="flex items-center gap-1.5 text-sm px-3 py-1.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 cursor-pointer">
                  <LogIn size={13}/> Login
                </span>
              </Link>
            )}
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Practice Questions</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {questionsLoading ? "Loading..." : <>Showing <span className="font-semibold text-orange-500">{filtered.length}</span> questions</>}
              {!user && <span className="ml-2 text-orange-400 text-xs">· Login to save progress</span>}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={openRandom} disabled={questionsLoading} className="flex items-center gap-1.5 px-3 py-2 bg-orange-500 text-white text-sm rounded-lg hover:bg-orange-600 disabled:opacity-50 transition-colors">
              <Shuffle size={14}/> Random
            </button>
            <select value={sortBy} onChange={e=>setSortBy(e.target.value as any)} className="text-sm border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200">
              <option value="default">Sort: Default</option>
              <option value="difficulty">Sort: Difficulty</option>
              <option value="year">Sort: Year</option>
            </select>
            <button onClick={()=>setShowFilters(!showFilters)} className="md:hidden flex items-center gap-1.5 px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200">
              <SlidersHorizontal size={14}/> Filters {filterCount>0 && <span className="bg-orange-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">{filterCount}</span>}
            </button>
          </div>
        </div>

        <div className="flex gap-4">
          <aside className={`w-56 flex-shrink-0 ${showFilters?"block":"hidden"} md:block`}>
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4 sticky top-20">
              <div className="flex items-center justify-between mb-3">
                <span className="font-semibold text-sm text-gray-700 dark:text-gray-200 flex items-center gap-1.5"><Filter size={14}/>Filters</span>
                {filterCount>0 && <button onClick={clearAll} className="text-xs text-orange-500 hover:underline">Clear all</button>}
              </div>
              <div className="relative mb-4">
                <Search size={13} className="absolute left-2.5 top-2.5 text-gray-400"/>
                <input value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}} placeholder="Search questions..." className="w-full pl-8 pr-3 py-2 text-xs border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-orange-400"/>
              </div>
              <div className="mb-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Exam</p>
                {EXAMS.map(e=>(
                  <label key={e} className="flex items-center gap-2 py-1 cursor-pointer">
                    <input type="checkbox" checked={selExams.includes(e)} onChange={()=>{toggle(selExams,setSelExams,e);setPage(1);}} className="accent-orange-500"/>
                    <span className="text-xs text-gray-700 dark:text-gray-300">{e}</span>
                    <span className={`ml-auto text-xs px-1.5 py-0.5 rounded font-medium ${EXAM_COLORS[e]}`}>{questions.filter(q=>q.exam===e).length}</span>
                  </label>
                ))}
              </div>
              <div className="mb-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Difficulty</p>
                {["", ...DIFFICULTIES].map(d=>(
                  <label key={d} className="flex items-center gap-2 py-1 cursor-pointer">
                    <input type="radio" name="diff" checked={selDiff===d} onChange={()=>{setSelDiff(d);setPage(1);}} className="accent-orange-500"/>
                    <span className="text-xs text-gray-700 dark:text-gray-300">{d||"All"}</span>
                  </label>
                ))}
              </div>
              <div className="mb-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Type</p>
                {TYPES.map(t=>(
                  <label key={t} className="flex items-center gap-2 py-1 cursor-pointer">
                    <input type="checkbox" checked={selTypes.includes(t)} onChange={()=>{toggle(selTypes,setSelTypes,t);setPage(1);}} className="accent-orange-500"/>
                    <span className="text-xs text-gray-700 dark:text-gray-300">{t}</span>
                  </label>
                ))}
              </div>
              <div className="mb-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Topic</p>
                <div className="max-h-40 overflow-y-auto">
                  {allTopics.map(t=>(
                    <label key={t} className="flex items-center gap-2 py-1 cursor-pointer">
                      <input type="checkbox" checked={selTopics.includes(t)} onChange={()=>{toggle(selTopics,setSelTopics,t);setPage(1);}} className="accent-orange-500"/>
                      <span className="text-xs text-gray-700 dark:text-gray-300">{t}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="mb-2">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Year</p>
                <div className="max-h-36 overflow-y-auto">
                  {allYears.map(y=>(
                    <label key={y} className="flex items-center gap-2 py-1 cursor-pointer">
                      <input type="checkbox" checked={selYears.includes(y)} onChange={()=>{toggle(selYears,setSelYears,y);setPage(1);}} className="accent-orange-500"/>
                      <span className="text-xs text-gray-700 dark:text-gray-300">{y}</span>
                    </label>
                  ))}
                </div>
              </div>
              <button onClick={openRandom} className="w-full mt-3 flex items-center justify-center gap-1.5 px-3 py-2 bg-orange-500 text-white text-xs rounded-lg hover:bg-orange-600 transition-colors">
                <Shuffle size={12}/> Random Question
              </button>
            </div>
          </aside>

          <div className="flex-1 min-w-0">
            {questionsLoading ? (
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center justify-center py-24">
                <div className="flex items-center gap-2 text-gray-400">
                  <Loader2 size={18} className="animate-spin"/>
                  <span className="text-sm">Loading questions...</span>
                </div>
              </div>
            ) : !activeQ ? (
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="grid grid-cols-[40px_1fr_80px_120px_80px_60px_60px] gap-2 px-4 py-3 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  <span>#</span><span>Question</span><span>Exam</span><span>Topic</span><span>Difficulty</span><span>Year</span><span>Solved</span>
                </div>
                {paginated.length === 0 ? (
                  <div className="text-center py-16 text-gray-400">
                    <Search size={32} className="mx-auto mb-2 opacity-40"/>
                    <p className="text-sm">No questions match your filters</p>
                    <button onClick={clearAll} className="mt-2 text-orange-500 text-sm hover:underline">Clear filters</button>
                  </div>
                ) : paginated.map((q, i) => (
                  <div key={q.id} onClick={()=>openQuestion(q)} className="grid grid-cols-[40px_1fr_80px_120px_80px_60px_60px] gap-2 px-4 py-3 border-b border-gray-100 dark:border-gray-800 hover:bg-orange-50 dark:hover:bg-gray-800 cursor-pointer transition-colors">
                    <span className="text-xs text-gray-400 flex items-center">{(page-1)*PER_PAGE+i+1}</span>
                    <span className="text-sm text-gray-800 dark:text-gray-200 flex items-center truncate pr-2">{q.question.length>65?q.question.slice(0,65)+"...":q.question}</span>
                    <span className="flex items-center"><span className={`text-xs px-1.5 py-0.5 rounded font-medium ${EXAM_COLORS[q.exam]||"bg-gray-100 text-gray-600"}`}>{q.exam}</span></span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center truncate">{q.topic}</span>
                    <span className="flex items-center"><span className={`text-xs px-1.5 py-0.5 rounded font-medium ${DIFF_COLORS[q.difficulty]}`}>{q.difficulty}</span></span>
                    <span className="text-xs text-gray-400 flex items-center">{q.year ?? "—"}</span>
                    <span className="flex items-center">{solved.includes(q.id) ? <CheckCircle2 size={14} className="text-green-500"/> : <Circle size={14} className="text-gray-300"/>}</span>
                  </div>
                ))}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-gray-800">
                    <span className="text-xs text-gray-500">{(page-1)*PER_PAGE+1}–{Math.min(page*PER_PAGE,filtered.length)} of {filtered.length}</span>
                    <div className="flex items-center gap-1">
                      <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1} className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300">
                        <ChevronLeft size={14}/>
                      </button>
                      {Array.from({length:Math.min(5,totalPages)},(_,i)=>{
                        const p = page<=3?i+1:page+i-2;
                        if(p<1||p>totalPages) return null;
                        return <button key={p} onClick={()=>setPage(p)} className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${p===page?"bg-orange-500 text-white":"border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300"}`}>{p}</button>;
                      })}
                      <button onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={page===totalPages} className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300">
                        <ChevronRight size={14}/>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-4">
                  <button onClick={()=>{setActiveQ(null);setSelected(null);}} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-orange-500 transition-colors">
                    <ChevronLeft size={16}/> Back to list
                  </button>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">Question {activeIdx+1} of {filtered.length}</span>
                    <button onClick={handleBookmark} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                      {bookmarks.includes(activeQ.id)?<BookmarkCheck size={16} className="text-orange-500"/>:<Bookmark size={16} className="text-gray-400"/>}
                    </button>
                    <button className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-red-500 transition-colors">
                      <Flag size={16}/>
                    </button>
                    <button onClick={()=>{setActiveQ(null);setSelected(null);}} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                      <X size={16} className="text-gray-400"/>
                    </button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${EXAM_COLORS[activeQ.exam]||"bg-gray-100 text-gray-600"}`}>{activeQ.exam}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${DIFF_COLORS[activeQ.difficulty]}`}>{activeQ.difficulty}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700">{activeQ.topic}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900">{activeQ.type}</span>
                  {activeQ.year && <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 flex items-center gap-1"><Clock size={10}/>{activeQ.year}</span>}
                </div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 leading-relaxed">{activeQ.question}</h2>
                <div className="grid grid-cols-1 gap-3 mb-6">
                  {activeQ.options.map((opt, i) => {
                    let cls = "border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-orange-400 hover:bg-orange-50 dark:hover:bg-gray-700";
                    if (selected !== null) {
                      if (i === activeQ.correct) cls = "border-2 border-green-500 bg-green-50 dark:bg-green-950";
                      else if (i === selected)   cls = "border-2 border-red-500 bg-red-50 dark:bg-red-950";
                      else cls = "border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 opacity-60";
                    }
                    return (
                      <button key={i} onClick={() => handleAnswer(i)}
                        className={`w-full text-left px-4 py-3 rounded-xl transition-all ${cls} ${selected===null?"cursor-pointer":"cursor-default"}`}>
                        <span className="inline-flex items-center gap-3">
                          <span className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold flex-shrink-0 ${selected!==null && i===activeQ.correct?"border-green-500 bg-green-500 text-white":selected!==null && i===selected?"border-red-500 bg-red-500 text-white":"border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400"}`}>
                            {["A","B","C","D"][i]}
                          </span>
                          <span className="text-sm text-gray-800 dark:text-gray-200">{opt}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
                {selected !== null && (
                  <div className={`p-4 rounded-xl border-2 mb-6 ${selected===activeQ.correct?"border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800":"border-orange-200 bg-orange-50 dark:bg-orange-950 dark:border-orange-800"}`}>
                    <p className="text-sm font-semibold mb-1 flex items-center gap-1.5">
                      {selected===activeQ.correct?<CheckCircle2 size={14} className="text-green-600"/>:<Flag size={14} className="text-orange-600"/>}
                      <span className={selected===activeQ.correct?"text-green-700 dark:text-green-400":"text-orange-700 dark:text-orange-400"}>
                        {selected===activeQ.correct?"Correct! Well done 🎉":"Incorrect — the correct answer is: "+activeQ.options[activeQ.correct]}
                      </span>
                    </p>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{activeQ.explanation}</p>
                    {!user && (
                      <p className="text-xs text-orange-500 mt-2 flex items-center gap-1">
                        <LogIn size={11}/> Login to save your progress and track streaks
                      </p>
                    )}
                  </div>
                )}
                <div className="flex flex-wrap gap-1.5 mb-6">
                  {activeQ.tags.map(tag=>(
                    <span key={tag} className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-500 rounded-full">#{tag}</span>
                  ))}
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
                  <button onClick={()=>{if(activeIdx>0){setActiveQ(filtered[activeIdx-1]);setSelected(null);setAnswerStart(Date.now());}}} disabled={activeIdx===0}
                    className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 transition-colors">
                    <ChevronLeft size={14}/> Previous
                  </button>
                  <button onClick={openRandom}
                    className="flex items-center gap-1.5 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-lg text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                    <Shuffle size={14}/> Random
                  </button>
                  <button onClick={()=>{if(activeIdx<filtered.length-1){setActiveQ(filtered[activeIdx+1]);setSelected(null);setAnswerStart(Date.now());}}} disabled={activeIdx===filtered.length-1}
                    className="flex items-center gap-1.5 px-4 py-2 bg-orange-500 text-white rounded-lg text-sm hover:bg-orange-600 disabled:opacity-40 transition-colors">
                    Next <ChevronRight size={14}/>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}