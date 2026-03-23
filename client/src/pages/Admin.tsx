import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import {
  Plus, Trash2, Edit2, Save, X, CheckCircle2,
  BookOpen, Link as LinkIcon, FileText, LogOut,
  ChevronDown, ChevronUp, Loader2, AlertCircle
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";

const ADMIN_EMAIL = "rakeshmeesa631@gmail.com";

const EXAMS = ["All","UPSC","SSC","TSPSC","APPSC","RRB","IBPS"];
const DIFFICULTIES = ["Easy","Medium","Hard"];
const TYPES = ["PYQ","Conceptual","CurrentAffairs","Mock"];
const TOPICS = ["Polity","History","Geography","Economy","Environment","Science & Technology","Reasoning","Quantitative Aptitude","English Language","Mental Ability","Reading Comprehension","Data Interpretation","Telangana GK","Current Affairs","AP GK"];
const RESOURCE_TYPES = ["PDF","Book","Video","Link","Notes"];
const RESOURCE_CATEGORIES = ["Syllabus","Previous Papers","Strategy","Notes","Books","Video Lectures","Current Affairs","State Exam"];

const EMPTY_Q = { question:"", option_a:"", option_b:"", option_c:"", option_d:"", correct_option:0, explanation:"", exam:"UPSC", topic:"Polity", subtopic:"", difficulty:"Easy", type:"PYQ", year:"", tags:"" };
const EMPTY_R = { title:"", description:"", type:"PDF", url:"", exam:"All", category:"Syllabus" };

export default function Admin() {
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<"questions"|"resources">("questions");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  // Questions state
  const [dbQuestions, setDbQuestions] = useState<any[]>([]);
  const [qForm, setQForm] = useState({ ...EMPTY_Q });
  const [editingQ, setEditingQ] = useState<string | null>(null);
  const [showQForm, setShowQForm] = useState(false);

  // Resources state
  const [dbResources, setDbResources] = useState<any[]>([]);
  const [rForm, setRForm] = useState({ ...EMPTY_R });
  const [editingR, setEditingR] = useState<string | null>(null);
  const [showRForm, setShowRForm] = useState(false);

  // Guard — only admin
 const { user, signOut, loading: authLoading } = useAuth();

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate("/"); return; }
    if (user.email !== ADMIN_EMAIL) { navigate("/"); return; }
    loadQuestions();
    loadResources();
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
            { label:"Active",       value: dbQuestions.filter(q=>q.is_active).length, icon:<CheckCircle2 size={14}/> },
            { label:"Admin",        value: "You", icon:<Edit2 size={14}/> },
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
          {(["questions","resources"] as const).map(t => (
            <button key={t} onClick={() => setActiveTab(t)}
              className={`px-4 py-2 text-sm font-medium rounded-lg capitalize transition-colors ${activeTab===t?"bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm":"text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"}`}>
              {t === "questions" ? `Questions (${dbQuestions.length})` : `Resources (${dbResources.length})`}
            </button>
          ))}
        </div>

        {/* ── QUESTIONS TAB ── */}
        {activeTab === "questions" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-gray-700 dark:text-gray-200">Question Bank</h2>
              <button onClick={() => { setQForm({...EMPTY_Q}); setEditingQ(null); setShowQForm(!showQForm); }}
                className="flex items-center gap-1.5 px-3 py-2 bg-orange-500 text-white text-sm rounded-xl hover:bg-orange-600 transition-colors">
                {showQForm ? <><X size={13}/> Cancel</> : <><Plus size={13}/> Add Question</>}
              </button>
            </div>

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
      </div>
    </div>
  );
}