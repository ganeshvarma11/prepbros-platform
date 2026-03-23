import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Download, BookOpen, Video, FileText, ExternalLink, Link as LinkIcon, Loader2 } from "lucide-react";
import { supabase } from "../lib/supabase";

// ── Hardcoded fallback data (shows if DB has no resources yet) ────
const DEFAULT_FREE = [
  { title: "UPSC GS1 Syllabus PDF", description: "Complete syllabus for General Studies Paper 1", url: "https://upsc.gov.in/sites/default/files/Syllabus-CSP-2020-Engl-31102019.pdf" },
  { title: "UPSC GS2 Syllabus PDF", description: "Complete syllabus for General Studies Paper 2", url: "https://upsc.gov.in/sites/default/files/Syllabus-CSP-2020-Engl-31102019.pdf" },
  { title: "UPSC GS3 Syllabus PDF", description: "Complete syllabus for General Studies Paper 3", url: "https://upsc.gov.in/sites/default/files/Syllabus-CSP-2020-Engl-31102019.pdf" },
  { title: "CSAT Syllabus PDF", description: "Complete syllabus for Civil Services Aptitude Test", url: "https://upsc.gov.in/sites/default/files/Syllabus-CSP-2020-Engl-31102019.pdf" },
  { title: "Previous Year Papers (2015-2023)", description: "All UPSC Prelims papers with solutions", url: "https://upsc.gov.in/examinations/previous-question-papers" },
  { title: "Topper Notes - Polity", description: "Comprehensive notes from UPSC toppers", url: "https://www.drishtiias.com/hindi/images/pdf/polity-notes.pdf" },
];

const DEFAULT_BOOKS = [
  { title: "Indian Polity by M. Laxmikanth", author: "M. Laxmikanth", description: "The most recommended book for UPSC Polity preparation", price: "₹699", url: "https://www.amazon.in/dp/9355323816" },
  { title: "NCERT History Set", author: "NCERT", description: "Essential for UPSC history section", price: "₹1,200", url: "https://www.amazon.in/s?k=ncert+history+set+upsc" },
  { title: "Spectrum Modern India", author: "Rajiv Ahir", description: "Comprehensive coverage of modern Indian history", price: "₹450", url: "https://www.amazon.in/dp/8193975170" },
  { title: "Geography of India", author: "Majid Husain", description: "Best for physical and human geography", price: "₹550", url: "https://www.amazon.in/s?k=geography+of+india+majid+husain" },
];

const DEFAULT_VIDEOS = [
  { name: "Drishti IAS", description: "Comprehensive UPSC preparation videos", subscribers: "2M+", url: "https://www.youtube.com/@DrishtiIASEnglish" },
  { name: "ForumIAS", description: "In-depth analysis and current affairs", subscribers: "1.5M+", url: "https://www.youtube.com/@ForumIAS" },
  { name: "Unacademy UPSC", description: "Live classes and doubt sessions", subscribers: "5M+", url: "https://www.youtube.com/@UnacademyIAS" },
  { name: "UPSC Pathshala", description: "Focused on UPSC mains preparation", subscribers: "800K+", url: "https://www.youtube.com/@UPSCPathshala" },
];

const TYPE_ICON: Record<string, any> = {
  PDF: FileText, Book: BookOpen, Video: Video, Link: LinkIcon, Notes: FileText,
};

const TYPE_LABEL: Record<string, string> = {
  PDF: "Download PDF", Book: "Buy on Amazon", Video: "Watch on YouTube",
  Link: "Open Link", Notes: "Download Notes",
};

const CATEGORY_ORDER = ["Syllabus", "Previous Papers", "Strategy", "Notes", "Books", "Video Lectures", "Current Affairs", "State Exam"];

export default function Resources() {
  const [dbResources, setDbResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeExam, setActiveExam] = useState("All");

  useEffect(() => {
    supabase.from("resources").select("*").eq("is_active", true).order("created_at", { ascending: false })
      .then(({ data }) => { setDbResources(data || []); setLoading(false); });
  }, []);

  // Group DB resources by category
  const grouped = CATEGORY_ORDER.reduce((acc, cat) => {
    const items = dbResources.filter(r => r.category === cat && (activeExam === "All" || r.exam === activeExam || r.exam === "All"));
    if (items.length > 0) acc[cat] = items;
    return acc;
  }, {} as Record<string, any[]>);

  const hasDBResources = dbResources.length > 0;
  const exams = ["All", ...Array.from(new Set(dbResources.map(r => r.exam).filter(e => e !== "All")))];

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      <Navbar />

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
            Study Resources
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
            Everything you need for UPSC and state exam preparation
          </p>

          {/* ── DB Resources (dynamic) ── */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center gap-2 text-gray-400">
                <Loader2 size={18} className="animate-spin"/>
                <span className="text-sm">Loading resources...</span>
              </div>
            </div>
          ) : hasDBResources ? (
            <div className="mb-16">
              {/* Exam filter tabs */}
              {exams.length > 2 && (
                <div className="flex gap-2 flex-wrap mb-8">
                  {exams.map(e => (
                    <button key={e} onClick={() => setActiveExam(e)}
                      className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${activeExam === e ? "bg-orange-500 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-gray-700"}`}>
                      {e}
                    </button>
                  ))}
                </div>
              )}

              {Object.entries(grouped).map(([category, items]) => (
                <section key={category} className="mb-12">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">{category}</h2>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {items.map((r: any) => {
                      const Icon = TYPE_ICON[r.type] || FileText;
                      const isBook = r.type === "Book";
                      const isVideo = r.type === "Video";
                      return (
                        <Card key={r.id} className={`p-6 hover:shadow-lg transition-shadow duration-300 bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 ${isVideo ? "bg-gradient-to-br from-orange-50 to-orange-100 dark:from-slate-800 dark:to-slate-700" : ""}`}>
                          <div className="flex items-start justify-between mb-4">
                            <Icon className="w-7 h-7 text-orange-500 flex-shrink-0"/>
                            {r.exam && r.exam !== "All" && (
                              <span className="text-xs px-2 py-0.5 bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-400 rounded-full font-medium">{r.exam}</span>
                            )}
                          </div>
                          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">{r.title}</h3>
                          {r.description && <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">{r.description}</p>}
                          <a href={r.url} target="_blank" rel="noopener noreferrer" className={isBook ? "inline-flex items-center gap-2 text-orange-500 hover:text-orange-600 font-semibold text-sm" : "block w-full"}>
                            {isBook ? (
                              <>{TYPE_LABEL[r.type]}<ExternalLink className="w-4 h-4"/></>
                            ) : isVideo ? (
                              <span className="inline-flex items-center gap-2 text-orange-500 hover:text-orange-600 font-semibold">{TYPE_LABEL[r.type]}<ExternalLink className="w-4 h-4"/></span>
                            ) : (
                              <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white">{TYPE_LABEL[r.type] || "Open"}</Button>
                            )}
                          </a>
                        </Card>
                      );
                    })}
                  </div>
                </section>
              ))}

              {Object.keys(grouped).length === 0 && (
                <div className="text-center py-12 text-gray-400">
                  <p className="text-sm">No resources found for {activeExam}</p>
                  <button onClick={() => setActiveExam("All")} className="mt-2 text-orange-500 text-sm hover:underline">Show all</button>
                </div>
              )}
            </div>
          ) : (
            /* ── Fallback hardcoded resources ── */
            <>
              <section className="mb-16">
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-8">Free Resources</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {DEFAULT_FREE.map((resource, idx) => (
                    <Card key={idx} className="p-6 hover:shadow-lg transition-shadow duration-300 bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
                      <div className="flex items-start justify-between mb-4">
                        <FileText className="w-8 h-8 text-orange-500 flex-shrink-0"/>
                        <Download className="w-5 h-5 text-gray-400"/>
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{resource.title}</h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">{resource.description}</p>
                      <a href={resource.url} target="_blank" rel="noopener noreferrer" className="block w-full">
                        <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white">Download Free</Button>
                      </a>
                    </Card>
                  ))}
                </div>
              </section>

              <section className="mb-16 bg-gray-50 dark:bg-slate-800 -mx-4 px-4 py-12">
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-8">Recommended Books</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {DEFAULT_BOOKS.map((book, idx) => (
                    <Card key={idx} className="p-6 hover:shadow-lg transition-shadow duration-300 bg-white dark:bg-slate-700 border-gray-200 dark:border-slate-600">
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{book.title}</h3>
                      <p className="text-sm text-orange-500 font-semibold mb-2">{book.author}</p>
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">{book.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-orange-500">{book.price}</span>
                        <a href={book.url} target="_blank" rel="noopener noreferrer" className="text-orange-500 hover:text-orange-600 font-semibold flex items-center gap-2">
                          Buy on Amazon<ExternalLink className="w-4 h-4"/>
                        </a>
                      </div>
                    </Card>
                  ))}
                </div>
              </section>

              <section className="mb-16">
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-8">Video Resources</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {DEFAULT_VIDEOS.map((channel, idx) => (
                    <Card key={idx} className="p-8 hover:shadow-lg transition-shadow bg-gradient-to-br from-orange-50 to-orange-100 dark:from-slate-800 dark:to-slate-700 border-gray-200 dark:border-slate-600">
                      <div className="flex items-center justify-between mb-4">
                        <Video className="w-8 h-8 text-orange-500"/>
                        <span className="text-sm font-semibold text-orange-600 dark:text-orange-400">{channel.subscribers}</span>
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{channel.name}</h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">{channel.description}</p>
                      <a href={channel.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-orange-500 hover:text-orange-600 font-semibold">
                        Watch on YouTube<ExternalLink className="w-4 h-4"/>
                      </a>
                    </Card>
                  ))}
                </div>
              </section>
            </>
          )}

          {/* CTA */}
          <section className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg p-12 text-center">
            <h2 className="text-3xl font-bold mb-4">Want More Resources?</h2>
            <p className="text-lg mb-8 opacity-90">
              Upgrade to PrepBros Pro for unlimited access to premium study materials, personalized study plans, and expert guidance
            </p>
            <a href="/premium">
              <Button className="bg-white text-orange-600 hover:bg-gray-100 font-bold text-lg px-8 py-6">
                Upgrade to Pro
              </Button>
            </a>
          </section>
        </div>
      </div>

      <Footer />
    </div>
  );
}