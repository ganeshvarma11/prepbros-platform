import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, Loader2, Search } from "lucide-react";

import AppShell from "@/components/AppShell";
import PageHeader from "@/components/PageHeader";
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

const fetchLiveResources = async () => {
  const { data, error } = await supabase
    .from("resources")
    .select("id, title, description, type, url, exam, category")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data as ResourceRecord[]) || [];
};

export default function Resources() {
  const [dbResources, setDbResources] = useState<ResourceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<FilterTab>("All");
  const [query, setQuery] = useState("");

  useEffect(() => {
    let cancelled = false;

    fetchLiveResources()
      .then(data => {
        if (cancelled) return;
        setDbResources(data);
      })
      .catch(() => {
        if (cancelled) return;
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
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
    <AppShell contentClassName="max-w-[1120px]">
      <div className="space-y-6">
        <PageHeader
          eyebrow="Resources"
          title="Resources"
          description="Study material organized for quick scanning instead of card noise."
          crumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Resources" },
          ]}
        />

        <section className="card space-y-4 px-5 py-5 sm:px-6 sm:py-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-1">
              <p className="section-label">Search and filter</p>
              <p className="text-sm text-[var(--text-secondary)]">
                Narrow the list by exam or format and jump straight into the
                material you need.
              </p>
            </div>
            <label className="relative block w-full lg:max-w-[420px]">
              <Search
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-2)]"
              />
              <input
                type="text"
                inputMode="search"
                value={query}
                onChange={event => setQuery(event.target.value)}
                placeholder="Search resources"
                className="search-input-reset search-input-with-icon h-12 w-full"
              />
            </label>
          </div>

          <div className="border-t border-[var(--border-1)] pt-3">
            <div className="flex flex-wrap gap-2">
              {FILTER_TABS.map(tab => {
                const active = tab === activeTab;

                return (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className={cn(
                      "inline-flex h-10 min-w-[72px] items-center justify-center rounded-[12px] border px-4 text-sm font-semibold transition",
                      active
                        ? "border-[var(--brand)] bg-[var(--brand)] text-[var(--text-on-brand)] shadow-[0_14px_30px_-24px_var(--brand-glow)]"
                        : "border-[var(--border)] bg-[var(--surface-1)] text-[var(--text-2)] hover:border-[var(--border-strong)] hover:bg-[var(--surface-2)] hover:text-[var(--text-1)]"
                    )}
                  >
                    {tab}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        <section>
          {loading ? (
            <div className="card flex min-h-[180px] items-center gap-3 text-sm text-[var(--text-2)]">
              <Loader2 size={16} className="animate-spin text-[var(--amber)]" />
              Loading resources...
            </div>
          ) : filteredResources.length > 0 ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-4">
                <p className="section-label">
                  {filteredResources.length} resource
                  {filteredResources.length === 1 ? "" : "s"}
                </p>
              </div>

              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
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
                      className="flex min-h-[198px] flex-col rounded-[20px] border border-[var(--border)] bg-[var(--bg-card)] px-4 py-4 shadow-[var(--shadow-sm)] transition hover:border-[var(--border-strong)] hover:bg-[var(--surface-1)]"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="inline-flex items-center rounded-full border border-[var(--border)] bg-[var(--surface-2)] px-2.5 py-1 text-[11px] font-semibold text-[var(--text-3)]">
                            {type}
                          </span>
                          {resource.exam && resource.exam !== "All" ? (
                            <span className="inline-flex items-center rounded-full border border-[var(--brand-muted)] bg-[var(--brand-subtle)] px-2.5 py-1 text-[11px] font-semibold text-[var(--brand-light)]">
                              {resource.exam}
                            </span>
                          ) : null}
                        </div>

                        <h2
                          className="mt-2.5 line-clamp-2 font-medium text-[var(--text-2)]"
                          style={{
                            fontSize: "1rem",
                            lineHeight: 1.22,
                            letterSpacing: "-0.02em",
                          }}
                        >
                          {resource.title}
                        </h2>
                        <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11.5px] text-[var(--text-3)]">
                          <span className="font-medium text-[var(--text-2)]">
                            {subject}
                          </span>
                          {meta ? <span>{meta}</span> : null}
                        </div>
                        {resource.description ? (
                          <p className="mt-2 line-clamp-3 max-w-[34ch] text-[11.5px] leading-[1.55] text-[var(--text-3)]">
                            {resource.description}
                          </p>
                        ) : null}
                      </div>

                      <a
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 inline-flex h-8 w-full shrink-0 items-center justify-center gap-2 rounded-[11px] border border-[var(--brand)] bg-[var(--brand)] px-3 text-[13px] font-semibold text-[var(--text-on-brand)] transition hover:bg-[var(--brand-light)]"
                      >
                        Open
                        <ArrowUpRight size={14} />
                      </a>
                    </article>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="card py-12">
              <p className="text-lg font-medium text-[var(--text-1)]">
                No resources found.
              </p>
              <p className="mt-2 text-sm text-[var(--text-2)]">
                Try a different search or switch to another tab.
              </p>
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}
