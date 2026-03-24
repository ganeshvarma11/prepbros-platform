import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import {
  Plus, Trash2, Edit2, Save, X, CheckCircle2,
  BookOpen, Link as LinkIcon, FileText, LogOut,
  ChevronDown, Loader2, AlertCircle, Trophy, Upload
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";
import { chunkQuestions, parseBulkQuestionInput } from "../lib/questionImport";

const ADMIN_EMAIL = "rakeshmeesa631@gmail.com";

const EXAMS = ["All","UPSC","SSC","TSPSC","APPSC","RRB","IBPS"];
const DIFFICULTIES = ["Easy","Medium","Hard"];
const TYPES = ["PYQ","Conceptual","CurrentAffairs","Mock"];
const TOPICS = ["Polity","History","Geography","Economy","Environment","Science & Technology","Reasoning","Quantitative Aptitude","English Language","Mental Ability","Reading Comprehension","Data Interpretation","Telangana GK","Current Affairs","AP GK"];
const RESOURCE_TYPES = ["PDF","Book","Video","Link","Notes"];
const RESOURCE_CATEGORIES = ["Syllabus","Previous Papers","Strategy","Notes","Books","Video Lectures","Current Affairs","State Exam"];
const CONTEST_STATUSES = ["upcoming", "past"];

const EMPTY_Q = { question:"", option_a:"", option_b:"", option_c:"", option_d:"", correct_option:0, explanation:"", exam:"UPSC", topic:"Polity", subtopic:"", difficulty:"Easy", type:"PYQ", year:"", tags:"" };
const EMPTY_R = { title:"", description:"", type:"PDF", url:"", exam:"All", category:"Syllabus" };
const EMPTY_C = { name:"", date:"", duration:"60 minutes", topics:"", prize:"", status:"upcoming", winner:"", your_rank:"" };
const BULK_IMPORT_TEMPLATE = `question,option_a,option_b,option_c,option_d,correct_option,explanation,exam,topic,subtopic,difficulty,type,year,tags
Which Article of the Indian Constitution deals with the Right to Education?,Article 19,Article 21A,Article 24,Article 32,1,Article 21A makes free and compulsory education a fundamental right for children aged 6-14.,UPSC,Polity,Fundamental Rights,Easy,PYQ,2019,constitution|education|article-21a`;

export default function Admin() {
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<"questions"|"resources"|"contests"|"support">("questions");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  // Questions state
  const [dbQuestions, setDbQuestions] = useState<any[]>([]);
  const [qForm, setQForm] = useState({ ...EMPTY_Q });
  const [editingQ, setEditingQ] = useState<string | null>(null);
  const [showQForm, setShowQForm] = useState(false);
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [bulkInput, setBulkInput] = useState("");

  // Resources state
  const [dbResources, setDbResources] = useState<any[]>([]);
  const [rForm, setRForm] = useState({ ...EMPTY_R });
  const [editingR, setEditingR] = useState<string | null>(null);
  const [showRForm, setShowRForm] = useState(false);

  // Contest state
  const [dbContests, setDbContests] = useState<any[]>([]);
  const [cForm, setCForm] = useState({ ...EMPTY_C });
  const [editingC, setEditingC] = useState<string | null>(null);
  const [showCForm, setShowCForm] = useState(false);

  // Support state
  const [supportRequests, setSupportRequests] = useState<any[]>([]);

  // Guard — only admin
 const { user, signOut, loading: authLoading } = useAuth();

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate("/"); return; }
    if (user.email !== ADMIN_EMAIL) { navigate("/"); return; }
    loadQuestions();
    loadResources();
    loadContests();
    loadSupportRequests();
  }, [user, authLoading]);

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  };

  // ── Questions CRUD ───────────────────────────────────────────────
  const loadQuestions = async () => {
    const { data } = await supabase.from("questions_db").select("*").order("created_at", { ascending: false });
    setDbQuestions(data || []);
  };

  const saveQuestion = async () => {
    if (!qForm.question || !qForm.option_a || !qForm.option_b || !qForm.option_c || !qForm.option_d || !qForm.explanation) {
      showToast("Fill all required fields", false); return;
    }
    setLoading(true);
    const payload = {
      ...qForm,
      correct_option: Number(qForm.correct_option),
      year: qForm.year ? Number(qForm.year) : null,
      tags: qForm.tags ? qForm.tags.split(",").map(t => t.trim()).filter(Boolean) : [],
    };
    let error;
    if (editingQ) {
      ({ error } = await supabase.from("questions_db").update(payload).eq("id", editingQ));
    } else {
      ({ error } = await supabase.from("questions_db").insert(payload));
    }
    setLoading(false);
    if (error) { showToast("Error: " + error.message, false); return; }
    showToast(editingQ ? "Question updated!" : "Question added!");
    setQForm({ ...EMPTY_Q }); setEditingQ(null); setShowQForm(false);
    loadQuestions();
  };

  const importQuestions = async () => {
    let parsedQuestions;

    try {
      parsedQuestions = parseBulkQuestionInput(bulkInput);
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Could not parse bulk import.", false);
      return;
    }

    setLoading(true);

    for (const batch of chunkQuestions(parsedQuestions)) {
      const { error } = await supabase.from("questions_db").insert(batch);

      if (error) {
        setLoading(false);
        showToast(`Import failed: ${error.message}`, false);
        return;
      }
    }

    setLoading(false);
    setBulkInput("");
    setShowBulkImport(false);
    showToast(`${parsedQuestions.length} questions imported successfully.`);
    loadQuestions();
  };

  const deleteQuestion = async (id: string) => {
    if (!confirm("Delete this question?")) return;
    await supabase.from("questions_db").delete().eq("id", id);
    showToast("Question deleted");
    loadQuestions();
  };

  const startEditQ = (q: any) => {
    setQForm({ ...q, year: q.year || "", tags: (q.tags || []).join(", ") });
    setEditingQ(q.id); setShowQForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ── Resources CRUD ───────────────────────────────────────────────
  const loadResources = async () => {
    const { data } = await supabase.from("resources").select("*").order("created_at", { ascending: false });
    setDbResources(data || []);
  };

  const saveResource = async () => {
    if (!rForm.title || !rForm.url) { showToast("Title and URL are required", false); return; }
    setLoading(true);
    let error;
    if (editingR) {
      ({ error } = await supabase.from("resources").update(rForm).eq("id", editingR));
    } else {
      ({ error } = await supabase.from("resources").insert(rForm));
    }
    setLoading(false);
    if (error) { showToast("Error: " + error.message, false); return; }
    showToast(editingR ? "Resource updated!" : "Resource added!");
    setRForm({ ...EMPTY_R }); setEditingR(null); setShowRForm(false);
    loadResources();
  };

  const deleteResource = async (id: string) => {
    if (!confirm("Delete this resource?")) return;
    await supabase.from("resources").delete().eq("id", id);
    showToast("Resource deleted");
    loadResources();
  };

  const startEditR = (r: any) => {
    setRForm({ ...r });
    setEditingR(r.id); setShowRForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ── Contests CRUD ───────────────────────────────────────────────
  const loadContests = async () => {
    const { data } = await supabase.from("contests").select("*").order("date", { ascending: true });
    setDbContests(data || []);
  };

  const saveContest = async () => {
    if (!cForm.name || !cForm.date || !cForm.topics || !cForm.prize) {
      showToast("Fill all required contest fields", false); return;
    }
    setLoading(true);
    const payload = {
      ...cForm,
      your_rank: cForm.your_rank ? Number(cForm.your_rank) : null,
    };
    let error;
    if (editingC) {
      ({ error } = await supabase.from("contests").update(payload).eq("id", editingC));
    } else {
      ({ error } = await supabase.from("contests").insert(payload));
    }
    setLoading(false);
    if (error) { showToast("Error: " + error.message, false); return; }
    showToast(editingC ? "Contest updated!" : "Contest added!");
    setCForm({ ...EMPTY_C }); setEditingC(null); setShowCForm(false);
    loadContests();
  };

  const deleteContest = async (id: string) => {
    if (!confirm("Delete this contest?")) return;
    await supabase.from("contests").delete().eq("id", id);
    showToast("Contest deleted");
    loadContests();
  };

  const startEditC = (contest: any) => {
    setCForm({ ...contest, your_rank: contest.your_rank || "" });
    setEditingC(contest.id); setShowCForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ── Support requests ────────────────────────────────────────────
  const loadSupportRequests = async () => {
    const { data } = await supabase.from("support_requests").select("*").order("created_at", { ascending: false });
    setSupportRequests(data || []);
  };

  if (!user || user.email !== ADMIN_EMAIL) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium ${toast.ok ? "bg-green-500 text-white" : "bg-red-500 text-white"}`}>
          {toast.ok ? <CheckCircle2 size={15}/> : <AlertCircle size={15}/>}
          {toast.msg}
        </div>
      )}

      {/* Navbar */}
      <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-14">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 font-bold text-orange-500">
              <span className="w-7 h-7 bg-orange-500 text-white rounded-lg flex items-center justify-center text-xs font-bold">P</span>
              PrepBros
            </Link>
            <span className="text-xs px-2 py-0.5 bg-orange-100 dark:bg-orange-950 text-orange-600 dark:text-orange-400 rounded-full font-medium">Admin</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400">{user.email}</span>
            <button onClick={() => signOut()} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-red-500 transition-colors">
              <LogOut size={13}/> Sign out
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Admin Panel</h1>
          <p className="text-sm text-gray-400 mt-0.5">Manage questions, resources and platform content</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { label:"DB Questions", value: dbQuestions.length, icon:<BookOpen size={14}/> },
            { label:"Resources",    value: dbResources.length, icon:<LinkIcon size={14}/> },
            { label:"Contests",     value: dbContests.length, icon:<ChevronDown size={14}/> },
            { label:"Support",      value: supportRequests.length, icon:<AlertCircle size={14}/> },
          ].map((s,i) => (
            <div key={i} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-4">
              <div className="text-orange-500 mb-1">{s.icon}</div>
              <p className="text-xl font-black text-gray-900 dark:text-white">{s.value}</p>
              <p className="text-xs text-gray-400">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1 mb-6 w-fit">
          {(["questions","resources","contests","support"] as const).map(t => (
            <button key={t} onClick={() => setActiveTab(t)}
              className={`px-4 py-2 text-sm font-medium rounded-lg capitalize transition-colors ${activeTab===t?"bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm":"text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"}`}>
              {t === "questions"
                ? `Questions (${dbQuestions.length})`
                : t === "resources"
                  ? `Resources (${dbResources.length})`
                  : t === "contests"
                    ? `Contests (${dbContests.length})`
                    : `Support (${supportRequests.length})`}
            </button>
          ))}
        </div>

        {/* ── QUESTIONS TAB ── */}
        {activeTab === "questions" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-gray-700 dark:text-gray-200">Question Bank</h2>
              <div className="flex items-center gap-2">
                <button onClick={() => { setShowBulkImport(current => !current); setShowQForm(false); setEditingQ(null); setQForm({...EMPTY_Q}); }}
                  className={`flex items-center gap-1.5 px-3 py-2 text-sm rounded-xl transition-colors ${showBulkImport ? "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white" : "border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"}`}>
                  {showBulkImport ? <><X size={13}/> Close Import</> : <><Upload size={13}/> Bulk Import</>}
                </button>
                <button onClick={() => { setQForm({...EMPTY_Q}); setEditingQ(null); setShowQForm(!showQForm); setShowBulkImport(false); }}
                  className="flex items-center gap-1.5 px-3 py-2 bg-orange-500 text-white text-sm rounded-xl hover:bg-orange-600 transition-colors">
                  {showQForm ? <><X size={13}/> Cancel</> : <><Plus size={13}/> Add Question</>}
                </button>
              </div>
            </div>

            {showBulkImport && (
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
                <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">Bulk Import Questions</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-3xl">
                      Paste a JSON array, CSV, or tab-separated rows from Google Sheets. This is the fastest way to move from 66 questions to a 2000-question v1.
                    </p>
                  </div>
                  <div className="text-xs text-gray-400 dark:text-gray-500">
                    Supported fields: <span className="font-mono">question, option_a-d, correct_option, explanation, exam, topic, subtopic, difficulty, type, year, tags</span>
                  </div>
                </div>

                <div className="grid gap-4 mt-5 lg:grid-cols-[1.3fr_0.7fr]">
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">Paste question data</label>
                    <textarea
                      value={bulkInput}
                      onChange={(e) => setBulkInput(e.target.value)}
                      rows={16}
                      placeholder="Paste JSON / CSV / TSV here..."
                      className="w-full px-3 py-3 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-400 font-mono"
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="rounded-2xl bg-orange-50 dark:bg-orange-950/40 border border-orange-100 dark:border-orange-900 p-4">
                      <p className="text-sm font-semibold text-orange-700 dark:text-orange-300">Import notes</p>
                      <ul className="mt-2 space-y-2 text-xs text-orange-700/90 dark:text-orange-200/90">
                        <li>Use 4 options per question.</li>
                        <li><span className="font-mono">correct_option</span> accepts <span className="font-mono">0-3</span>, <span className="font-mono">1-4</span>, or <span className="font-mono">A-D</span>.</li>
                        <li><span className="font-mono">tags</span> can be comma-separated or pipe-separated.</li>
                        <li>If <span className="font-mono">year</span> is empty, it will be saved as conceptual/null.</li>
                      </ul>
                    </div>

                    <div>
                      <label className="text-xs font-medium text-gray-500 mb-1 block">Template</label>
                      <textarea
                        readOnly
                        value={BULK_IMPORT_TEMPLATE}
                        rows={10}
                        className="w-full px-3 py-3 text-xs border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-mono"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-5">
                  <button onClick={importQuestions} disabled={loading || !bulkInput.trim()}
                    className="flex items-center gap-1.5 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition-colors">
                    {loading ? <Loader2 size={14} className="animate-spin"/> : <Upload size={14}/>}
                    Import Questions
                  </button>
                  <button onClick={() => setBulkInput(BULK_IMPORT_TEMPLATE)}
                    className="px-4 py-2.5 border border-gray-200 dark:border-gray-700 text-sm text-gray-500 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    Fill Example
                  </button>
                  <button onClick={() => { setBulkInput(""); setShowBulkImport(false); }}
                    className="px-4 py-2.5 border border-gray-200 dark:border-gray-700 text-sm text-gray-500 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Question Form */}
            {showQForm && (
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-4">{editingQ ? "Edit Question" : "Add New Question"}</h3>
                <div className="space-y-4">
                  {/* Question text */}
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">Question *</label>
                    <textarea value={qForm.question} onChange={e => setQForm(f=>({...f, question:e.target.value}))}
                      rows={3} placeholder="Enter the question text..."
                      className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"/>
                  </div>

                  {/* Options */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {["a","b","c","d"].map((opt, i) => (
                      <div key={opt}>
                        <label className="text-xs font-medium text-gray-500 mb-1 flex items-center gap-2">
                          Option {opt.toUpperCase()}
                          <input type="radio" name="correct" checked={qForm.correct_option === i}
                            onChange={() => setQForm(f=>({...f, correct_option:i}))} className="accent-green-500"/>
                          <span className="text-green-600 text-xs">{qForm.correct_option === i ? "✓ Correct" : ""}</span>
                        </label>
                        <input value={(qForm as any)[`option_${opt}`]} onChange={e => setQForm(f=>({...f, [`option_${opt}`]:e.target.value}))}
                          placeholder={`Option ${opt.toUpperCase()}`}
                          className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-400"/>
                      </div>
                    ))}
                  </div>

                  {/* Explanation */}
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">Explanation *</label>
                    <textarea value={qForm.explanation} onChange={e => setQForm(f=>({...f, explanation:e.target.value}))}
                      rows={2} placeholder="Explain why the correct answer is correct..."
                      className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"/>
                  </div>

                  {/* Metadata */}
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                    <div>
                      <label className="text-xs font-medium text-gray-500 mb-1 block">Exam</label>
                      <select value={qForm.exam} onChange={e => setQForm(f=>({...f, exam:e.target.value}))}
                        className="w-full px-2 py-2 text-xs border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-orange-400">
                        {EXAMS.filter(e=>e!=="All").map(e=><option key={e}>{e}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 mb-1 block">Topic</label>
                      <select value={qForm.topic} onChange={e => setQForm(f=>({...f, topic:e.target.value}))}
                        className="w-full px-2 py-2 text-xs border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-orange-400">
                        {TOPICS.map(t=><option key={t}>{t}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 mb-1 block">Subtopic</label>
                      <input value={qForm.subtopic} onChange={e => setQForm(f=>({...f, subtopic:e.target.value}))}
                        placeholder="e.g. Fundamental Rights"
                        className="w-full px-2 py-2 text-xs border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-orange-400"/>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 mb-1 block">Difficulty</label>
                      <select value={qForm.difficulty} onChange={e => setQForm(f=>({...f, difficulty:e.target.value}))}
                        className="w-full px-2 py-2 text-xs border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-orange-400">
                        {DIFFICULTIES.map(d=><option key={d}>{d}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 mb-1 block">Type</label>
                      <select value={qForm.type} onChange={e => setQForm(f=>({...f, type:e.target.value}))}
                        className="w-full px-2 py-2 text-xs border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-orange-400">
                        {TYPES.map(t=><option key={t}>{t}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 mb-1 block">Year</label>
                      <input value={qForm.year} onChange={e => setQForm(f=>({...f, year:e.target.value}))}
                        placeholder="2024"
                        className="w-full px-2 py-2 text-xs border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-orange-400"/>
                    </div>
                  </div>

                  {/* Tags */}
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">Tags (comma separated)</label>
                    <input value={qForm.tags} onChange={e => setQForm(f=>({...f, tags:e.target.value}))}
                      placeholder="e.g. constitution, article-21, fundamental-rights"
                      className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-400"/>
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <button onClick={saveQuestion} disabled={loading}
                      className="flex items-center gap-1.5 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition-colors">
                      {loading ? <Loader2 size={14} className="animate-spin"/> : <Save size={14}/>}
                      {editingQ ? "Update Question" : "Save Question"}
                    </button>
                    <button onClick={() => { setShowQForm(false); setEditingQ(null); setQForm({...EMPTY_Q}); }}
                      className="px-4 py-2.5 border border-gray-200 dark:border-gray-700 text-sm text-gray-500 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Questions list */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
              {dbQuestions.length === 0 ? (
                <div className="text-center py-12">
                  <BookOpen size={28} className="mx-auto text-gray-200 dark:text-gray-700 mb-3"/>
                  <p className="text-sm text-gray-400">No questions in database yet</p>
                  <p className="text-xs text-gray-300 dark:text-gray-600 mt-1">Click "Add Question" to get started</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-[1fr_80px_100px_80px_80px_80px] gap-2 px-4 py-3 bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    <span>Question</span><span>Exam</span><span>Topic</span><span>Difficulty</span><span>Type</span><span>Actions</span>
                  </div>
                  {dbQuestions.map(q => (
                    <div key={q.id} className="grid grid-cols-[1fr_80px_100px_80px_80px_80px] gap-2 px-4 py-3 border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors items-center">
                      <span className="text-sm text-gray-700 dark:text-gray-300 truncate">{q.question.slice(0,70)}...</span>
                      <span className="text-xs px-1.5 py-0.5 rounded font-medium bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400 w-fit">{q.exam}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 truncate">{q.topic}</span>
                      <span className={`text-xs px-1.5 py-0.5 rounded font-medium w-fit ${q.difficulty==="Easy"?"bg-green-100 text-green-700":"bg-yellow-100 text-yellow-700"}`}>{q.difficulty}</span>
                      <span className="text-xs text-gray-400">{q.type}</span>
                      <div className="flex items-center gap-2">
                        <button onClick={() => startEditQ(q)} className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950 text-gray-400 hover:text-blue-500 transition-colors"><Edit2 size={13}/></button>
                        <button onClick={() => deleteQuestion(q.id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950 text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={13}/></button>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        )}

        {/* ── RESOURCES TAB ── */}
        {activeTab === "resources" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-gray-700 dark:text-gray-200">Resources</h2>
              <button onClick={() => { setRForm({...EMPTY_R}); setEditingR(null); setShowRForm(!showRForm); }}
                className="flex items-center gap-1.5 px-3 py-2 bg-orange-500 text-white text-sm rounded-xl hover:bg-orange-600 transition-colors">
                {showRForm ? <><X size={13}/> Cancel</> : <><Plus size={13}/> Add Resource</>}
              </button>
            </div>

            {/* Resource Form */}
            {showRForm && (
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-4">{editingR ? "Edit Resource" : "Add New Resource"}</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium text-gray-500 mb-1 block">Title *</label>
                      <input value={rForm.title} onChange={e => setRForm(f=>({...f, title:e.target.value}))}
                        placeholder="e.g. UPSC GS1 Syllabus PDF"
                        className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-400"/>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 mb-1 block">URL *</label>
                      <input value={rForm.url} onChange={e => setRForm(f=>({...f, url:e.target.value}))}
                        placeholder="https://..."
                        className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-400"/>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">Description</label>
                    <input value={rForm.description} onChange={e => setRForm(f=>({...f, description:e.target.value}))}
                      placeholder="Brief description..."
                      className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-400"/>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs font-medium text-gray-500 mb-1 block">Type</label>
                      <select value={rForm.type} onChange={e => setRForm(f=>({...f, type:e.target.value}))}
                        className="w-full px-2 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-orange-400">
                        {RESOURCE_TYPES.map(t=><option key={t}>{t}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 mb-1 block">Exam</label>
                      <select value={rForm.exam} onChange={e => setRForm(f=>({...f, exam:e.target.value}))}
                        className="w-full px-2 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-orange-400">
                        {EXAMS.map(e=><option key={e}>{e}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 mb-1 block">Category</label>
                      <select value={rForm.category} onChange={e => setRForm(f=>({...f, category:e.target.value}))}
                        className="w-full px-2 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-orange-400">
                        {RESOURCE_CATEGORIES.map(c=><option key={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 pt-2">
                    <button onClick={saveResource} disabled={loading}
                      className="flex items-center gap-1.5 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition-colors">
                      {loading ? <Loader2 size={14} className="animate-spin"/> : <Save size={14}/>}
                      {editingR ? "Update Resource" : "Save Resource"}
                    </button>
                    <button onClick={() => { setShowRForm(false); setEditingR(null); setRForm({...EMPTY_R}); }}
                      className="px-4 py-2.5 border border-gray-200 dark:border-gray-700 text-sm text-gray-500 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Resources list */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
              {dbResources.length === 0 ? (
                <div className="text-center py-12">
                  <FileText size={28} className="mx-auto text-gray-200 dark:text-gray-700 mb-3"/>
                  <p className="text-sm text-gray-400">No resources yet</p>
                  <p className="text-xs text-gray-300 dark:text-gray-600 mt-1">Add PDFs, books, video links and more</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-[1fr_80px_80px_100px_80px] gap-2 px-4 py-3 bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    <span>Title</span><span>Type</span><span>Exam</span><span>Category</span><span>Actions</span>
                  </div>
                  {dbResources.map(r => (
                    <div key={r.id} className="grid grid-cols-[1fr_80px_80px_100px_80px] gap-2 px-4 py-3 border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors items-center">
                      <div>
                        <p className="text-sm text-gray-700 dark:text-gray-300 truncate">{r.title}</p>
                        <a href={r.url} target="_blank" rel="noopener noreferrer" className="text-xs text-orange-500 hover:underline truncate block">{r.url.slice(0,50)}...</a>
                      </div>
                      <span className="text-xs px-1.5 py-0.5 rounded font-medium bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400 w-fit">{r.type}</span>
                      <span className="text-xs text-gray-400">{r.exam}</span>
                      <span className="text-xs text-gray-400">{r.category}</span>
                      <div className="flex items-center gap-2">
                        <button onClick={() => startEditR(r)} className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950 text-gray-400 hover:text-blue-500 transition-colors"><Edit2 size={13}/></button>
                        <button onClick={() => deleteResource(r.id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950 text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={13}/></button>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        )}

        {/* ── CONTESTS TAB ── */}
        {activeTab === "contests" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-gray-700 dark:text-gray-200">Contests</h2>
              <button onClick={() => { setCForm({...EMPTY_C}); setEditingC(null); setShowCForm(!showCForm); }}
                className="flex items-center gap-1.5 px-3 py-2 bg-orange-500 text-white text-sm rounded-xl hover:bg-orange-600 transition-colors">
                {showCForm ? <><X size={13}/> Cancel</> : <><Plus size={13}/> Add Contest</>}
              </button>
            </div>

            {showCForm && (
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-4">{editingC ? "Edit Contest" : "Add New Contest"}</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input value={cForm.name} onChange={e => setCForm(f=>({...f, name:e.target.value}))} placeholder="Contest name" className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-400"/>
                    <input value={cForm.date} onChange={e => setCForm(f=>({...f, date:e.target.value}))} placeholder="March 28, 2026" className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-400"/>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input value={cForm.duration} onChange={e => setCForm(f=>({...f, duration:e.target.value}))} placeholder="60 minutes" className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-400"/>
                    <select value={cForm.status} onChange={e => setCForm(f=>({...f, status:e.target.value}))} className="w-full px-2 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-orange-400">
                      {CONTEST_STATUSES.map(status => <option key={status}>{status}</option>)}
                    </select>
                  </div>
                  <input value={cForm.topics} onChange={e => setCForm(f=>({...f, topics:e.target.value}))} placeholder="GS1 + CSAT" className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-400"/>
                  <input value={cForm.prize} onChange={e => setCForm(f=>({...f, prize:e.target.value}))} placeholder="Prize / reward" className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-400"/>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input value={cForm.winner} onChange={e => setCForm(f=>({...f, winner:e.target.value}))} placeholder="Winner (optional)" className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-400"/>
                    <input value={cForm.your_rank} onChange={e => setCForm(f=>({...f, your_rank:e.target.value}))} placeholder="Your rank (optional)" className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-400"/>
                  </div>
                  <div className="flex items-center gap-3 pt-2">
                    <button onClick={saveContest} disabled={loading} className="flex items-center gap-1.5 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition-colors">
                      {loading ? <Loader2 size={14} className="animate-spin"/> : <Save size={14}/>}
                      {editingC ? "Update Contest" : "Save Contest"}
                    </button>
                    <button onClick={() => { setShowCForm(false); setEditingC(null); setCForm({...EMPTY_C}); }} className="px-4 py-2.5 border border-gray-200 dark:border-gray-700 text-sm text-gray-500 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
              {dbContests.length === 0 ? (
                <div className="text-center py-12">
                  <Trophy size={28} className="mx-auto text-gray-200 dark:text-gray-700 mb-3"/>
                  <p className="text-sm text-gray-400">No contests yet</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-[1fr_100px_100px_100px_80px] gap-2 px-4 py-3 bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    <span>Name</span><span>Date</span><span>Status</span><span>Prize</span><span>Actions</span>
                  </div>
                  {dbContests.map(c => (
                    <div key={c.id} className="grid grid-cols-[1fr_100px_100px_100px_80px] gap-2 px-4 py-3 border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors items-center">
                      <div>
                        <p className="text-sm text-gray-700 dark:text-gray-300 truncate">{c.name}</p>
                        <p className="text-xs text-gray-400 truncate">{c.topics}</p>
                      </div>
                      <span className="text-xs text-gray-400">{c.date}</span>
                      <span className="text-xs px-1.5 py-0.5 rounded font-medium bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400 w-fit">{c.status}</span>
                      <span className="text-xs text-gray-400 truncate">{c.prize}</span>
                      <div className="flex items-center gap-2">
                        <button onClick={() => startEditC(c)} className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950 text-gray-400 hover:text-blue-500 transition-colors"><Edit2 size={13}/></button>
                        <button onClick={() => deleteContest(c.id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950 text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={13}/></button>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        )}

        {/* ── SUPPORT TAB ── */}
        {activeTab === "support" && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
            {supportRequests.length === 0 ? (
              <div className="text-center py-12">
                <AlertCircle size={28} className="mx-auto text-gray-200 dark:text-gray-700 mb-3"/>
                <p className="text-sm text-gray-400">No support requests yet</p>
                <p className="text-xs text-gray-300 dark:text-gray-600 mt-1">Requests submitted from the support page will appear here when the `support_requests` table is available.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-[140px_120px_1fr_120px] gap-2 px-4 py-3 bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  <span>Email</span><span>Category</span><span>Subject</span><span>Date</span>
                </div>
                {supportRequests.map((request) => (
                  <div key={request.id} className="grid grid-cols-[140px_120px_1fr_120px] gap-2 px-4 py-3 border-b border-gray-100 dark:border-gray-800 items-start">
                    <span className="text-xs text-gray-500 dark:text-gray-400 truncate">{request.email}</span>
                    <span className="text-xs px-1.5 py-0.5 rounded font-medium bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400 w-fit">{request.category}</span>
                    <div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">{request.subject}</p>
                      <p className="text-xs text-gray-400 mt-1 line-clamp-2">{request.message}</p>
                    </div>
                    <span className="text-xs text-gray-400">{request.created_at ? new Date(request.created_at).toLocaleDateString("en-IN") : "—"}</span>
                  </div>
                ))}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
