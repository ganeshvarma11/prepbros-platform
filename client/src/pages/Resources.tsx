import { useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  BookOpen,
  ExternalLink,
  FileText,
  Loader2,
  PlayCircle,
  Sparkles,
  Target,
} from "lucide-react";

import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import SectionHeader from "@/components/SectionHeader";
import { supabase } from "@/lib/supabase";

const DEFAULT_FREE = [
  { title: "UPSC GS1 Syllabus PDF", description: "Complete syllabus for General Studies Paper 1", url: "https://upsc.gov.in/sites/default/files/Syllabus-CSP-2020-Engl-31102019.pdf" },
  { title: "Previous Year Papers", description: "Official question papers and archive links for revision planning", url: "https://upsc.gov.in/examinations/previous-question-papers" },
  { title: "CSAT Syllabus PDF", description: "Use this to align aptitude prep with the actual exam scope", url: "https://upsc.gov.in/sites/default/files/Syllabus-CSP-2020-Engl-31102019.pdf" },
];

const DEFAULT_BOOKS = [
  { title: "Indian Polity", author: "M. Laxmikanth", description: "A must-have foundational book for polity preparation.", price: "₹699", url: "https://www.amazon.in/dp/9355323816" },
  { title: "Spectrum Modern India", author: "Rajiv Ahir", description: "Reliable coverage for modern history revision.", price: "₹450", url: "https://www.amazon.in/dp/8193975170" },
];

const DEFAULT_VIDEOS = [
  { name: "Drishti IAS", description: "Structured UPSC-oriented teaching and current affairs coverage.", subscribers: "2M+", url: "https://www.youtube.com/@DrishtiIASEnglish" },
  { name: "ForumIAS", description: "Useful for analysis and revision-oriented sessions.", subscribers: "1.5M+", url: "https://www.youtube.com/@ForumIAS" },
];

const TYPE_ICON: Record<string, typeof FileText> = {
  PDF: FileText,
  Book: BookOpen,
  Video: PlayCircle,
  Link: FileText,
  Notes: FileText,
};

const CATEGORY_ORDER = [
  "Syllabus",
  "Previous Papers",
  "Strategy",
  "Notes",
  "Books",
  "Video Lectures",
  "Current Affairs",
  "State Exam",
];

export default function Resources() {
  const [dbResources, setDbResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeExam, setActiveExam] = useState("All");

  useEffect(() => {
    supabase
      .from("resources")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setDbResources(data || []);
        setLoading(false);
      });
  }, []);

  const exams = useMemo(
    () => ["All", ...Array.from(new Set(dbResources.map((item) => item.exam).filter((exam) => exam && exam !== "All")))],
    [dbResources],
  );

  const grouped = useMemo(
    () =>
      CATEGORY_ORDER.reduce((acc, category) => {
        const items = dbResources.filter(
          (item) =>
            item.category === category &&
            (activeExam === "All" || item.exam === activeExam || item.exam === "All"),
        );
        if (items.length) acc[category] = items;
        return acc;
      }, {} as Record<string, any[]>),
    [activeExam, dbResources],
  );

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="px-4 py-8 md:py-10">
        <div className="container-shell space-y-6">
          <div className="glass-panel rounded-[32px] px-6 py-8 md:px-8 md:py-10">
            <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
              <div>
                <SectionHeader
                  eyebrow="Resources"
                  title="A study library that feels curated, not dumped on the page."
                  description="Resources now read like a product feature instead of a fallback page: clearer organization, better trust cues, and cleaner external-link behavior."
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  { label: "Live resources", value: dbResources.length || "Fallback" },
                  { label: "Categories", value: CATEGORY_ORDER.length },
                  { label: "Designed for", value: "Clarity" },
                ].map((item) => (
                  <div key={item.label} className="rounded-3xl border border-[var(--border)] bg-[var(--bg-card-strong)] p-4">
                    <p className="text-2xl font-semibold tracking-[-0.05em] text-[var(--text-primary)]">{item.value}</p>
                    <p className="mt-1 text-sm text-[var(--text-muted)]">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="glass-panel rounded-[32px] p-6 md:p-8">
              <SectionHeader
                eyebrow="Why this page is better"
                title="It now helps users trust your curation."
                description="A strong resources page improves conversion because it makes the platform feel useful beyond MCQs."
              />
              <div className="mt-6 grid gap-3">
                {[
                  "Cleaner grouping makes the page easier to skim on mobile.",
                  "Empty states and fallbacks make the product feel resilient.",
                  "External resources are framed more intentionally, which improves credibility.",
                ].map((item) => (
                  <div key={item} className="rounded-3xl border border-[var(--border)] bg-[var(--bg-card-strong)] p-4 text-sm text-[var(--text-secondary)]">
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[32px] border border-[var(--border)] bg-[var(--bg-inverse)] p-6 text-white md:p-8">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-white">
                <Sparkles size={18} />
              </div>
              <p className="mt-5 text-2xl font-semibold tracking-[-0.05em] text-white">
                Strong resources give users another reason to return between practice sessions.
              </p>
              <p className="mt-3 text-sm text-white/72">
                As your content library improves, resources can support revision, deeper reading, and calmer study days outside the question bank.
              </p>
            </div>
          </div>

          {loading ? (
            <div className="glass-panel flex min-h-[320px] items-center justify-center rounded-[32px] p-6">
              <div className="inline-flex items-center gap-3 rounded-full border border-[var(--border)] bg-[var(--bg-card-strong)] px-5 py-3 text-sm text-[var(--text-secondary)]">
                <Loader2 size={16} className="animate-spin text-[var(--brand)]" />
                Loading resources...
              </div>
            </div>
          ) : dbResources.length > 0 ? (
            <div className="glass-panel rounded-[32px] p-6 md:p-8">
              {exams.length > 1 ? (
                <div className="mb-6 flex flex-wrap gap-2">
                  {exams.map((exam) => (
                    <button
                      key={exam}
                      type="button"
                      onClick={() => setActiveExam(exam)}
                      className={activeExam === exam ? "btn-primary rounded-full px-5 py-2" : "btn-secondary rounded-full px-5 py-2"}
                    >
                      {exam}
                    </button>
                  ))}
                </div>
              ) : null}

              {Object.keys(grouped).length > 0 ? (
                <div className="space-y-10">
                  {Object.entries(grouped).map(([category, items]) => (
                    <section key={category}>
                      <div className="mb-5 flex items-center justify-between gap-4">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--brand)]">{category}</p>
                          <p className="mt-1 text-sm text-[var(--text-secondary)]">{items.length} curated item{items.length === 1 ? "" : "s"}</p>
                        </div>
                        <Target size={16} className="text-[var(--brand)]" />
                      </div>
                      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {items.map((item: any) => {
                          const Icon = TYPE_ICON[item.type] || FileText;
                          return (
                            <a
                              key={item.id}
                              href={item.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="card card-interactive block rounded-[28px] p-5"
                            >
                              <div className="flex items-center justify-between gap-3">
                                <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--brand-subtle)] text-[var(--brand)]">
                                  <Icon size={18} />
                                </div>
                                {item.exam && item.exam !== "All" ? <span className="badge badge-brand">{item.exam}</span> : null}
                              </div>
                              <p className="mt-5 text-lg font-semibold tracking-[-0.04em] text-[var(--text-primary)]">{item.title}</p>
                              {item.description ? <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">{item.description}</p> : null}
                              <div className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-[var(--brand)]">
                                Open resource
                                <ArrowUpRight size={14} />
                              </div>
                            </a>
                          );
                        })}
                      </div>
                    </section>
                  ))}
                </div>
              ) : (
                <div className="rounded-[28px] border border-dashed border-[var(--border-strong)] bg-[var(--bg-subtle)] p-8 text-center">
                  <p className="text-lg font-semibold text-[var(--text-primary)]">No resources found for {activeExam}.</p>
                  <p className="mt-2 text-sm text-[var(--text-secondary)]">Switch back to All to show the broader library.</p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              <div className="glass-panel rounded-[32px] p-6 md:p-8">
                <SectionHeader
                  eyebrow="Fallback library"
                  title="You still have a useful base even before your database is full."
                  description="This fallback state is now much cleaner, which matters if your live resources catalog is still small."
                />
                <div className="mt-6 grid gap-4 md:grid-cols-3">
                  {DEFAULT_FREE.map((item) => (
                    <a key={item.title} href={item.url} target="_blank" rel="noopener noreferrer" className="card card-interactive block rounded-[28px] p-5">
                      <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--brand-subtle)] text-[var(--brand)]">
                        <FileText size={18} />
                      </div>
                      <p className="mt-5 text-lg font-semibold tracking-[-0.04em] text-[var(--text-primary)]">{item.title}</p>
                      <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">{item.description}</p>
                      <div className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-[var(--brand)]">
                        Open
                        <ExternalLink size={14} />
                      </div>
                    </a>
                  ))}
                </div>
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <div className="glass-panel rounded-[32px] p-6 md:p-8">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--brand)]">Books</p>
                  <div className="mt-5 space-y-4">
                    {DEFAULT_BOOKS.map((book) => (
                      <a key={book.title} href={book.url} target="_blank" rel="noopener noreferrer" className="card card-interactive block rounded-[28px] p-5">
                        <p className="text-lg font-semibold tracking-[-0.04em] text-[var(--text-primary)]">{book.title}</p>
                        <p className="mt-1 text-sm text-[var(--text-muted)]">{book.author} · {book.price}</p>
                        <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">{book.description}</p>
                      </a>
                    ))}
                  </div>
                </div>

                <div className="glass-panel rounded-[32px] p-6 md:p-8">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--brand)]">Channels</p>
                  <div className="mt-5 space-y-4">
                    {DEFAULT_VIDEOS.map((video) => (
                      <a key={video.name} href={video.url} target="_blank" rel="noopener noreferrer" className="card card-interactive block rounded-[28px] p-5">
                        <p className="text-lg font-semibold tracking-[-0.04em] text-[var(--text-primary)]">{video.name}</p>
                        <p className="mt-1 text-sm text-[var(--text-muted)]">{video.subscribers}</p>
                        <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">{video.description}</p>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
