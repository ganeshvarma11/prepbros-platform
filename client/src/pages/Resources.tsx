import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, Loader2, Search } from "lucide-react";

import AppShell from "@/components/AppShell";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

type ResourceRecord = {
  id?: string;
  title: string;
  description?: string | null;
  type?: string | null;
  url: string;
  exam?: string | null;
  category?: string | null;
};

type FilterTab = "All" | "UPSC" | "SSC" | "Books" | "PDFs" | "Channels";

const FILTER_TABS: FilterTab[] = [
  "All",
  "UPSC",
  "SSC",
  "Books",
  "PDFs",
  "Channels",
];

const FALLBACK_RESOURCES: ResourceRecord[] = [
  {
    id: "fallback-upsc-syllabus",
    title: "UPSC Civil Services Syllabus",
    type: "PDF",
    exam: "UPSC",
    category: "Syllabus",
    url: "https://upsc.gov.in/sites/default/files/Syllabus-CSP-2020-Engl-31102019.pdf",
  },
  {
    id: "fallback-upsc-papers",
    title: "UPSC Previous Year Papers",
    type: "PDF",
    exam: "UPSC",
    category: "Previous Papers",
    url: "https://upsc.gov.in/examinations/previous-question-papers",
  },
  {
    id: "fallback-ssc-syllabus",
    title: "SSC Exams And Syllabus",
    type: "PDF",
    exam: "SSC",
    category: "Syllabus",
    url: "https://ssc.nic.in/",
  },
  {
    id: "fallback-polity-book",
    title: "Indian Polity",
    type: "Book",
    exam: "UPSC",
    category: "Books",
    url: "https://www.amazon.in/dp/9355323816",
  },
  {
    id: "fallback-lucent-book",
    title: "Lucent's General Knowledge",
    type: "Book",
    exam: "SSC",
    category: "Books",
    url: "https://www.amazon.in/dp/935501404X",
  },
  {
    id: "fallback-mrunal",
    title: "Mrunal Economy Playlist",
    type: "Video",
    exam: "UPSC",
    category: "Video Lectures",
    url: "https://www.youtube.com/@TheMrunalPatel",
  },
  {
    id: "fallback-ssc-channel",
    title: "SSC Adda Study Channel",
    type: "Video",
    exam: "SSC",
    category: "Video Lectures",
    url: "https://www.youtube.com/@sscadda247",
  },
];

const normalizeType = (type?: string | null) => type?.trim() || "Link";

const isChannelResource = (resource: ResourceRecord) => {
  const type = normalizeType(resource.type).toLowerCase();
  const url = resource.url.toLowerCase();

  return (
    type === "video" || url.includes("youtube.com") || url.includes("youtu.be")
  );
};

const isPdfResource = (resource: ResourceRecord) => {
  const type = normalizeType(resource.type).toLowerCase();
  return type === "pdf" || type === "notes";
};

const getSubject = (resource: ResourceRecord) =>
  resource.category?.trim() || "General";

const getSourceLabel = (url: string) => {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");

    if (host.includes("youtube.com") || host.includes("youtu.be"))
      return "YouTube";
    if (host.includes("upsc.gov.in")) return "Official UPSC";
    if (host.includes("ssc.nic.in")) return "Official SSC";
    if (host.includes("amazon.")) return "Amazon";

    return host;
  } catch {
    return "External source";
  }
};

const matchesTab = (resource: ResourceRecord, tab: FilterTab) => {
  const exam = resource.exam?.trim();
  const type = normalizeType(resource.type);

  if (tab === "All") return true;
  if (tab === "UPSC") return exam === "UPSC" || exam === "All";
  if (tab === "SSC") return exam === "SSC" || exam === "All";
  if (tab === "Books") return type === "Book";
  if (tab === "PDFs") return isPdfResource(resource);
  return isChannelResource(resource);
};

export default function Resources() {
  const [dbResources, setDbResources] = useState<ResourceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<FilterTab>("All");
  const [query, setQuery] = useState("");

  useEffect(() => {
    supabase
      .from("resources")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setDbResources((data as ResourceRecord[]) || []);
        setLoading(false);
      });
  }, []);

  const resources = dbResources.length > 0 ? dbResources : FALLBACK_RESOURCES;

  const filteredResources = useMemo(() => {
    const search = query.trim().toLowerCase();

    return resources.filter(resource => {
      if (!matchesTab(resource, activeTab)) return false;
      if (!search) return true;

      const haystack = [
        resource.title,
        resource.description,
        resource.type,
        resource.exam,
        resource.category,
        getSourceLabel(resource.url),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(search);
    });
  }, [activeTab, query, resources]);

  return (
    <AppShell contentClassName="max-w-[1040px]">
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-56 bg-[radial-gradient(circle_at_top,rgba(255,161,22,0.1),transparent_60%)]" />

        <div className="relative mx-auto space-y-8 px-1 pb-8 pt-4 md:space-y-10 md:pt-8">
          <header className="space-y-3">
            <h1 className="text-4xl font-semibold tracking-[-0.06em] text-[var(--text-primary)] md:text-5xl">
              Resources
            </h1>
            <p className="max-w-2xl text-sm text-[var(--text-secondary)] md:text-base">
              Useful study materials, books, PDFs, and channels in one focused
              place.
            </p>
          </header>

          <section className="space-y-5">
            <label className="relative block">
              <Search
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-faint)]"
              />
              <input
                type="search"
                value={query}
                onChange={event => setQuery(event.target.value)}
                placeholder="Search resources"
                className="w-full rounded-[20px] border border-transparent bg-white/[0.035] px-12 py-3.5 text-sm text-[var(--text-primary)] outline-none transition placeholder:text-[var(--text-faint)] focus:border-[rgba(255,161,22,0.24)] focus:bg-white/[0.045]"
              />
            </label>

            <div className="border-b border-[var(--border)]">
              <div className="flex flex-wrap gap-6">
                {FILTER_TABS.map(tab => {
                  const active = tab === activeTab;

                  return (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setActiveTab(tab)}
                      className={cn(
                        "relative pb-3 text-sm font-medium transition",
                        active
                          ? "text-[var(--text-primary)]"
                          : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                      )}
                    >
                      {tab}
                      <span
                        className={cn(
                          "absolute inset-x-0 bottom-0 h-0.5 rounded-full transition",
                          active ? "bg-[var(--brand)]" : "bg-transparent"
                        )}
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          <section>
            {loading ? (
              <div className="flex min-h-[180px] items-center gap-3 text-sm text-[var(--text-muted)]">
                <Loader2
                  size={16}
                  className="animate-spin text-[var(--brand)]"
                />
                Loading resources...
              </div>
            ) : filteredResources.length > 0 ? (
              <div>
                <div className="flex items-center justify-between gap-4 border-b border-[var(--border)] pb-3">
                  <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-faint)]">
                    {filteredResources.length} resource
                    {filteredResources.length === 1 ? "" : "s"}
                  </p>
                </div>

                <div>
                  {filteredResources.map(resource => {
                    const type = normalizeType(resource.type);
                    const subject = getSubject(resource);
                    const meta = [
                      resource.exam && resource.exam !== "All"
                        ? resource.exam
                        : null,
                      getSourceLabel(resource.url),
                    ]
                      .filter(Boolean)
                      .join(" • ");

                    return (
                      <article
                        key={resource.id || `${resource.title}-${resource.url}`}
                        className="grid gap-3 border-b border-[var(--border)] py-5 md:grid-cols-[minmax(0,1fr)_auto] md:items-center md:gap-8"
                      >
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                            <h2 className="text-lg font-medium tracking-[-0.03em] text-[var(--text-primary)]">
                              {resource.title}
                            </h2>
                            <span className="text-[11px] uppercase tracking-[0.18em] text-[var(--text-faint)]">
                              {type}
                            </span>
                          </div>

                          <p className="mt-2 text-sm text-[var(--text-secondary)]">
                            {subject}
                          </p>
                          <p className="mt-1 text-xs text-[var(--text-muted)]">
                            {meta}
                          </p>
                        </div>

                        <a
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-sm font-medium text-[var(--brand)] transition hover:text-[var(--brand-light)]"
                        >
                          Open resource
                          <ArrowUpRight size={15} />
                        </a>
                      </article>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="py-12">
                <p className="text-lg font-medium text-[var(--text-primary)]">
                  No resources found.
                </p>
                <p className="mt-2 text-sm text-[var(--text-muted)]">
                  Try a different search or switch to another tab.
                </p>
              </div>
            )}
          </section>
        </div>
      </div>
    </AppShell>
  );
}
