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
    <AppShell contentClassName="max-w-[1120px]">
      <div className="space-y-8">
        <PageHeader
          eyebrow="Progress"
          title="Resources"
          description="Useful study materials, books, PDFs, and channels in one focused place."
          crumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Resources" },
          ]}
        />

        <section className="card grid gap-5 overflow-hidden p-5 lg:grid-cols-[minmax(0,1fr)_240px] md:p-6">
          <div>
            <p className="section-label">Library</p>
            <h2 className="mt-3 text-[2rem] tracking-[-0.05em] text-[var(--text-primary)]">
              Study material without the clutter.
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--text-secondary)]">
              Search by exam, keep only the formats you want, and jump straight
              to the material that fits the current study block.
            </p>
          </div>
          <div className="rounded-[24px] border border-[var(--border)] bg-[var(--surface-1)] p-5 shadow-[var(--shadow-sm)]">
            <p className="section-label">Available now</p>
            <p
              className="mt-3 text-[2.6rem] leading-none tracking-[-0.07em] text-[var(--text-primary)]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {filteredResources.length}
            </p>
            <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
              Curated items visible with your current filters.
            </p>
          </div>
        </section>

        <section className="card space-y-5">
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
                type="search"
                value={query}
                onChange={event => setQuery(event.target.value)}
                placeholder="Search resources"
                className="w-full pl-12"
              />
            </label>
          </div>

          <div className="border-t border-[var(--border-1)] pt-4">
            <div className="flex flex-wrap gap-2">
              {FILTER_TABS.map(tab => {
                const active = tab === activeTab;

                return (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className={cn(
                      active ? "btn-primary" : "btn-ghost",
                      "min-w-[80px]"
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
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <p className="section-label">
                  {filteredResources.length} resource
                  {filteredResources.length === 1 ? "" : "s"}
                </p>
              </div>

              <div className="space-y-4">
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
                      className="card grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-center md:gap-8"
                    >
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="badge">{type}</span>
                          {resource.exam && resource.exam !== "All" ? (
                            <span className="badge-amber">{resource.exam}</span>
                          ) : null}
                        </div>

                        <h2 className="mt-4 text-xl font-medium tracking-[-0.03em] text-[var(--text-1)]">
                          {resource.title}
                        </h2>
                        <p className="mt-2 text-sm font-medium text-[var(--text-2)]">
                          {subject}
                        </p>
                        <p className="mt-1 text-xs text-[var(--text-3)]">
                          {meta}
                        </p>
                      </div>

                      <a
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-primary"
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
