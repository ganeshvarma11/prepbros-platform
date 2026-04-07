import { useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  Bell,
  CalendarDays,
  Clock3,
  ExternalLink,
  FileText,
  Filter,
  GraduationCap,
  Landmark,
  Loader2,
  MapPin,
  Search,
  Sparkles,
  X,
} from "lucide-react";

import AppShell from "@/components/AppShell";
import PageHeader from "@/components/PageHeader";
import {
  type ExamType,
  type ExamUpdate,
  type QualificationTier,
  EXAM_TYPES,
  QUALIFICATION_TIERS,
  examUpdates,
} from "@/data/updates";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type UpdateStatus = "Open" | "Closing Soon" | "Upcoming" | "Closed";

type UpdateRecord = {
  id?: string;
  title: string;
  organization: string;
  exam_type?: string | null;
  state?: string | null;
  qualification?: string | null;
  eligibility?: string | null;
  application_start?: string | null;
  last_date?: string | null;
  exam_window?: string | null;
  updated_at?: string | null;
  summary?: string | null;
  tags?: string[] | null;
  apply_url?: string | null;
  notice_url?: string | null;
  is_active?: boolean | null;
};

const statusOrder: Record<UpdateStatus, number> = {
  "Closing Soon": 0,
  Open: 1,
  Upcoming: 2,
  Closed: 3,
};

const statusTone: Record<UpdateStatus, string> = {
  "Closing Soon":
    "border-[rgba(231,177,90,0.28)] bg-[var(--yellow-bg)] text-[var(--yellow)]",
  Open: "border-[rgba(86,194,136,0.24)] bg-[var(--green-bg)] text-[var(--green)]",
  Upcoming:
    "border-[rgba(110,151,255,0.24)] bg-[var(--blue-bg)] text-[var(--blue)]",
  Closed:
    "border-[var(--border)] bg-[var(--surface-1)] text-[var(--text-3)]",
};

const searchFields = (update: ExamUpdate) =>
  [
    update.title,
    update.organization,
    update.state,
    update.examType,
    update.qualification,
    update.eligibility,
    update.summary,
    ...update.tags,
  ]
    .join(" ")
    .toLowerCase();

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));

const startOfDay = (value: string | Date) => {
  const date =
    typeof value === "string" ? new Date(`${value}T00:00:00`) : new Date(value);

  date.setHours(0, 0, 0, 0);
  return date;
};

const differenceInDays = (target: Date, today: Date) =>
  Math.round((target.getTime() - today.getTime()) / 86400000);

const getUpdateStatus = (
  update: ExamUpdate,
  today: Date
): UpdateStatus => {
  const current = startOfDay(today);
  const start = startOfDay(update.applicationStart);
  const end = startOfDay(update.lastDate);

  if (current < start) return "Upcoming";
  if (current > end) return "Closed";

  const daysLeft = differenceInDays(end, current);
  if (daysLeft <= 7) return "Closing Soon";
  return "Open";
};

const getStatusNote = (update: ExamUpdate, today: Date) => {
  const current = startOfDay(today);
  const start = startOfDay(update.applicationStart);
  const end = startOfDay(update.lastDate);
  const status = getUpdateStatus(update, current);

  if (status === "Upcoming") {
    const daysUntilOpen = differenceInDays(start, current);
    return daysUntilOpen === 0
      ? "Opens today"
      : `Opens in ${daysUntilOpen} day${daysUntilOpen === 1 ? "" : "s"}`;
  }

  if (status === "Closed") return "Application window closed";

  const daysLeft = differenceInDays(end, current);

  if (daysLeft <= 0) return "Last day today";
  return `${daysLeft} day${daysLeft === 1 ? "" : "s"} left`;
};

const getUpdatedLabel = (updatedAt: string, today: Date) => {
  const diff = differenceInDays(startOfDay(today), startOfDay(updatedAt));

  if (diff <= 1) return "Fresh";
  if (diff <= 7) return `Updated ${diff}d ago`;
  return `Updated ${formatDate(updatedAt)}`;
};

const sortUpdates = (updates: ExamUpdate[], today: Date) =>
  [...updates].sort((left, right) => {
    const leftStatus = getUpdateStatus(left, today);
    const rightStatus = getUpdateStatus(right, today);

    if (statusOrder[leftStatus] !== statusOrder[rightStatus]) {
      return statusOrder[leftStatus] - statusOrder[rightStatus];
    }

    if (leftStatus === "Upcoming" && rightStatus === "Upcoming") {
      return (
        startOfDay(left.applicationStart).getTime() -
        startOfDay(right.applicationStart).getTime()
      );
    }

    return (
      startOfDay(left.lastDate).getTime() - startOfDay(right.lastDate).getTime()
    );
  });

const mapUpdateRecord = (record: UpdateRecord): ExamUpdate | null => {
  const examType = record.exam_type?.trim() as ExamType | undefined;
  const qualification = record.qualification?.trim() as
    | QualificationTier
    | undefined;

  if (
    !record.title ||
    !record.organization ||
    !examType ||
    !EXAM_TYPES.includes(examType) ||
    !qualification ||
    !QUALIFICATION_TIERS.includes(qualification) ||
    !record.state ||
    !record.eligibility ||
    !record.application_start ||
    !record.last_date ||
    !record.exam_window ||
    !record.updated_at ||
    !record.summary ||
    !record.apply_url ||
    !record.notice_url
  ) {
    return null;
  }

  return {
    id: record.id || record.title.toLowerCase().replace(/\s+/g, "-"),
    title: record.title,
    organization: record.organization,
    examType,
    state: record.state,
    qualification,
    eligibility: record.eligibility,
    applicationStart: record.application_start,
    lastDate: record.last_date,
    examWindow: record.exam_window,
    updatedAt: record.updated_at,
    summary: record.summary,
    tags: Array.isArray(record.tags) ? record.tags.filter(Boolean) : [],
    applyUrl: record.apply_url,
    noticeUrl: record.notice_url,
  };
};

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <label className="space-y-2">
      <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-3)]">
        {label}
      </span>
      <select
        value={value}
        onChange={event => onChange(event.target.value)}
        className="input h-12 appearance-none bg-[var(--surface-1)]"
      >
        {options.map(option => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

export default function Updates() {
  const [liveUpdates, setLiveUpdates] = useState<ExamUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [selectedState, setSelectedState] = useState("All states");
  const [selectedQualification, setSelectedQualification] =
    useState("All eligibility");
  const [selectedExamType, setSelectedExamType] = useState("All types");
  const [selectedStatus, setSelectedStatus] = useState("All timelines");
  const today = useMemo(() => new Date(), []);
  const updates = liveUpdates.length > 0 ? liveUpdates : examUpdates;

  useEffect(() => {
    let cancelled = false;

    supabase
      .from("updates")
      .select("*")
      .eq("is_active", true)
      .order("updated_at", { ascending: false })
      .then(({ data, error }) => {
        if (cancelled) return;

        if (error) {
          setLoading(false);
          return;
        }

        const mapped = ((data || []) as UpdateRecord[])
          .map(mapUpdateRecord)
          .filter((update): update is ExamUpdate => Boolean(update));

        setLiveUpdates(mapped);
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const stateOptions = useMemo(
    () => [
      "All states",
      ...Array.from(new Set(updates.map(update => update.state))).sort(),
    ],
    [updates]
  );

  const qualificationOptions = useMemo(
    () => [
      "All eligibility",
      ...Array.from(
        new Set(updates.map(update => update.qualification))
      ).sort(),
    ],
    [updates]
  );

  const examTypeOptions = useMemo(
    () => [
      "All types",
      ...Array.from(new Set(updates.map(update => update.examType))).sort(),
    ],
    [updates]
  );

  const statusOptions = ["All timelines", "Closing Soon", "Open", "Upcoming"];

  const filteredUpdates = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return sortUpdates(updates, today).filter(update => {
      const status = getUpdateStatus(update, today);

      if (status === "Closed") return false;

      if (
        selectedState !== "All states" &&
        update.state !== selectedState
      ) {
        return false;
      }

      if (
        selectedQualification !== "All eligibility" &&
        update.qualification !== selectedQualification
      ) {
        return false;
      }

      if (
        selectedExamType !== "All types" &&
        update.examType !== selectedExamType
      ) {
        return false;
      }

      if (
        selectedStatus !== "All timelines" &&
        status !== selectedStatus
      ) {
        return false;
      }

      if (!normalizedQuery) return true;
      return searchFields(update).includes(normalizedQuery);
    });
  }, [
    query,
    selectedExamType,
    selectedQualification,
    selectedState,
    selectedStatus,
    today,
    updates,
  ]);

  const spotlightUpdates = useMemo(
    () =>
      sortUpdates(updates, today)
        .filter(update => getUpdateStatus(update, today) !== "Closed")
        .slice(0, 3),
    [today, updates]
  );

  const stats = useMemo(() => {
    const visibleUpdates = updates.filter(
      update => getUpdateStatus(update, today) !== "Closed"
    );
    const statuses = visibleUpdates.map(update => getUpdateStatus(update, today));

    return {
      live: statuses.filter(status => status !== "Upcoming").length,
      closingSoon: statuses.filter(status => status === "Closing Soon").length,
      upcoming: statuses.filter(status => status === "Upcoming").length,
      allIndia: visibleUpdates.filter(update => update.state === "All India")
        .length,
    };
  }, [today, updates]);

  const hasActiveFilters =
    query.trim().length > 0 ||
    selectedState !== "All states" ||
    selectedQualification !== "All eligibility" ||
    selectedExamType !== "All types" ||
    selectedStatus !== "All timelines";

  const clearFilters = () => {
    setQuery("");
    setSelectedState("All states");
    setSelectedQualification("All eligibility");
    setSelectedExamType("All types");
    setSelectedStatus("All timelines");
  };

  const quickTypeFilters = examTypeOptions.filter(option => option !== "All types");

  return (
    <AppShell contentClassName="max-w-[1220px]">
      <div className="space-y-6 md:space-y-7">
        <PageHeader
          eyebrow="Opportunity Radar"
          title="Exam and job updates"
          description="Search fresh openings, scan deadlines by state and eligibility, and jump straight to official notices and application pages."
          crumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Updates" },
          ]}
        />

        <section className="card relative overflow-hidden px-5 py-5 sm:px-6 sm:py-6">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,140,50,0.18),transparent_32%),radial-gradient(circle_at_top_right,rgba(110,151,255,0.14),transparent_26%)]" />
          <div className="relative grid gap-5 xl:grid-cols-[1.25fr_0.9fr] xl:items-start">
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-2 rounded-full border border-[var(--brand-muted)] bg-[var(--brand-subtle)] px-3 py-1 text-xs font-semibold text-[var(--brand-light)]">
                  <Bell size={14} />
                  Live application desk
                </span>
                {loading ? (
                  <span className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface-1)] px-3 py-1 text-xs font-semibold text-[var(--text-2)]">
                    <Loader2 size={14} className="animate-spin" />
                    Syncing live updates
                  </span>
                ) : null}
                <span className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface-1)] px-3 py-1 text-xs font-semibold text-[var(--text-2)]">
                  <Sparkles size={14} />
                  Built for quick scanning
                </span>
              </div>

              <div className="space-y-3">
                <h2 className="max-w-[12ch] text-[2rem] tracking-[-0.055em] text-[var(--text-1)] sm:text-[2.5rem]">
                  Stay ahead of upcoming exams and job windows.
                </h2>
                <p className="max-w-[62ch] text-[15px] leading-7 text-[var(--text-2)]">
                  This page is shaped like a student desk, not a noisy job
                  portal. Search by exam name, state, qualification, or exam
                  type, then open the official notice or application page in one
                  click.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {["All India", "Graduate", "12th Pass", "State PSC"].map(
                  chip => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => {
                        if (chip === "All India") setSelectedState(chip);
                        if (chip === "Graduate" || chip === "12th Pass") {
                          setSelectedQualification(chip);
                        }
                        if (chip === "State PSC") setSelectedExamType(chip);
                      }}
                      className="inline-flex items-center rounded-full border border-[var(--border)] bg-[var(--surface-1)] px-3 py-1.5 text-xs font-semibold text-[var(--text-2)] transition hover:border-[var(--border-strong)] hover:text-[var(--text-1)]"
                    >
                      {chip}
                    </button>
                  )
                )}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {[
                {
                  label: "Live now",
                  value: stats.live,
                  note: "Open and closing soon",
                  icon: Bell,
                },
                {
                  label: "Closing soon",
                  value: stats.closingSoon,
                  note: "Short-window forms first",
                  icon: Clock3,
                },
                {
                  label: "Upcoming",
                  value: stats.upcoming,
                  note: "Worth tracking early",
                  icon: CalendarDays,
                },
                {
                  label: "All-India cycles",
                  value: stats.allIndia,
                  note: "National recruitment",
                  icon: Landmark,
                },
              ].map(stat => {
                const Icon = stat.icon;

                return (
                  <div
                    key={stat.label}
                    className="rounded-[20px] border border-[var(--border)] bg-[var(--surface-overlay)] p-4 shadow-[var(--shadow-sm)]"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-medium text-[var(--text-2)]">
                        {stat.label}
                      </p>
                      <span className="inline-flex h-9 w-9 items-center justify-center rounded-[12px] border border-[var(--border)] bg-[var(--surface-1)] text-[var(--brand)]">
                        <Icon size={16} />
                      </span>
                    </div>
                    <p className="mt-4 text-[2rem] font-semibold tracking-[-0.05em] text-[var(--text-1)]">
                      {stat.value}
                    </p>
                    <p className="mt-1 text-xs text-[var(--text-3)]">
                      {stat.note}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="card space-y-4 px-5 py-5 sm:px-6">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-1">
              <p className="section-label">Search and filters</p>
              <p className="text-sm text-[var(--text-2)]">
                Filter by state, exam type, eligibility, and timeline without
                leaving the page.
              </p>
            </div>

            {hasActiveFilters ? (
              <button
                type="button"
                onClick={clearFilters}
                className="btn-ghost h-11 px-4 text-sm"
              >
                <X size={14} />
                Clear filters
              </button>
            ) : null}
          </div>

          <div className="grid gap-3 xl:grid-cols-[2fr_repeat(4,minmax(0,1fr))]">
            <label className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-3)]">
                Search
              </span>
              <span className="relative block">
                <Search
                  size={18}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-3)]"
                />
                <input
                  type="search"
                  value={query}
                  onChange={event => setQuery(event.target.value)}
                  placeholder="Search exam, department, state, or keyword"
                  className="input h-12 pl-12"
                />
              </span>
            </label>

            <SelectField
              label="State"
              value={selectedState}
              onChange={setSelectedState}
              options={stateOptions}
            />
            <SelectField
              label="Eligibility"
              value={selectedQualification}
              onChange={setSelectedQualification}
              options={qualificationOptions}
            />
            <SelectField
              label="Exam type"
              value={selectedExamType}
              onChange={setSelectedExamType}
              options={examTypeOptions}
            />
            <SelectField
              label="Timeline"
              value={selectedStatus}
              onChange={setSelectedStatus}
              options={statusOptions}
            />
          </div>

          <div className="border-t border-[var(--border-1)] pt-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-3)]">
                <Filter size={14} />
                Quick types
              </span>
              {quickTypeFilters.map(type => {
                const active = selectedExamType === type;

                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() =>
                      setSelectedExamType(current =>
                        current === type ? "All types" : type
                      )
                    }
                    className={cn(
                      "inline-flex h-9 items-center justify-center rounded-full border px-4 text-sm font-semibold transition",
                      active
                        ? "border-[var(--brand)] bg-[var(--brand)] text-[var(--text-on-brand)]"
                        : "border-[var(--border)] bg-[var(--surface-1)] text-[var(--text-2)] hover:border-[var(--border-strong)] hover:text-[var(--text-1)]"
                    )}
                  >
                    {type}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
          <section className="card px-5 py-5 sm:px-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="section-label">Spotlight</p>
                <h2 className="mt-2 text-[1.4rem] text-[var(--text-1)]">
                  What deserves attention first
                </h2>
              </div>
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-[14px] border border-[var(--border)] bg-[var(--surface-1)] text-[var(--brand)]">
                <Bell size={18} />
              </span>
            </div>

            <div className="mt-5 grid gap-3">
              {spotlightUpdates.map(update => {
                const status = getUpdateStatus(update, today);

                return (
                  <article
                    key={update.id}
                    className="rounded-[20px] border border-[var(--border)] bg-[var(--surface-1)] p-4"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold",
                          statusTone[status]
                        )}
                      >
                        {status}
                      </span>
                      <span className="inline-flex items-center rounded-full border border-[var(--border)] bg-[var(--surface-2)] px-2.5 py-1 text-[11px] font-semibold text-[var(--text-3)]">
                        {getStatusNote(update, today)}
                      </span>
                    </div>

                    <div className="mt-3 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div className="min-w-0">
                        <h3 className="text-[1rem] font-semibold text-[var(--text-1)]">
                          {update.title}
                        </h3>
                        <p className="mt-1 text-sm text-[var(--text-2)]">
                          {update.organization}
                        </p>
                      </div>
                      <span className="text-xs font-medium text-[var(--text-3)]">
                        {getUpdatedLabel(update.updatedAt, today)}
                      </span>
                    </div>

                    <p className="mt-3 text-sm leading-6 text-[var(--text-2)]">
                      {update.summary}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2 text-xs text-[var(--text-3)]">
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--surface-2)] px-3 py-1.5">
                        <MapPin size={13} />
                        {update.state}
                      </span>
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--surface-2)] px-3 py-1.5">
                        <GraduationCap size={13} />
                        {update.qualification}
                      </span>
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--surface-2)] px-3 py-1.5">
                        <CalendarDays size={13} />
                        Last date {formatDate(update.lastDate)}
                      </span>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          <section className="card px-5 py-5 sm:px-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="section-label">Student checklist</p>
                <h2 className="mt-2 text-[1.4rem] text-[var(--text-1)]">
                  Before you click apply
                </h2>
              </div>
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-[14px] border border-[var(--border)] bg-[var(--surface-1)] text-[var(--brand)]">
                <FileText size={18} />
              </span>
            </div>

            <div className="mt-5 space-y-3">
              {[
                "Open the official notification first and verify age, reservation, and document rules before payment.",
                "Use state and qualification filters together to cut noise and surface only realistic applications.",
                "Prioritize 'Closing Soon' forms early in the week so you do not lose time to last-day traffic.",
                "Track upcoming cycles now, especially banking and state PSC notices, so syllabus prep starts before the form opens.",
              ].map(point => (
                <div
                  key={point}
                  className="rounded-[18px] border border-[var(--border)] bg-[var(--surface-1)] px-4 py-3"
                >
                  <p className="text-sm leading-6 text-[var(--text-2)]">
                    {point}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <section className="space-y-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="section-label">
                {filteredUpdates.length} match
                {filteredUpdates.length === 1 ? "" : "es"}
              </p>
              <p className="mt-1 text-sm text-[var(--text-2)]">
                Results stay sorted by urgency first, then by the nearest action
                date.
              </p>
            </div>
          </div>

          {filteredUpdates.length === 0 ? (
            <div className="card px-5 py-12 text-center sm:px-6">
              <h2 className="text-[1.3rem] text-[var(--text-1)]">
                No updates match these filters.
              </h2>
              <p className="mt-3 text-sm text-[var(--text-2)]">
                Try another state, reset eligibility, or search with a broader
                keyword like SSC, bank, police, or state PSC.
              </p>
            </div>
          ) : (
            <>
              <div className="grid gap-3 xl:hidden">
                {filteredUpdates.map(update => {
                  const status = getUpdateStatus(update, today);

                  return (
                    <article
                      key={update.id}
                      className="card px-4 py-4 sm:px-5"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={cn(
                            "inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold",
                            statusTone[status]
                          )}
                        >
                          {status}
                        </span>
                        <span className="inline-flex items-center rounded-full border border-[var(--border)] bg-[var(--surface-1)] px-2.5 py-1 text-[11px] font-semibold text-[var(--text-3)]">
                          {update.examType}
                        </span>
                        <span className="inline-flex items-center rounded-full border border-[var(--border)] bg-[var(--surface-1)] px-2.5 py-1 text-[11px] font-semibold text-[var(--text-3)]">
                          {getUpdatedLabel(update.updatedAt, today)}
                        </span>
                      </div>

                      <div className="mt-3 space-y-2">
                        <h2 className="text-[1rem] font-semibold text-[var(--text-1)]">
                          {update.title}
                        </h2>
                        <p className="text-sm text-[var(--text-2)]">
                          {update.organization}
                        </p>
                        <p className="text-sm leading-6 text-[var(--text-2)]">
                          {update.summary}
                        </p>
                      </div>

                      <div className="mt-4 grid gap-2 text-sm text-[var(--text-2)] sm:grid-cols-2">
                        <div className="rounded-[14px] border border-[var(--border)] bg-[var(--surface-1)] px-3 py-2.5">
                          <p className="text-xs uppercase tracking-[0.16em] text-[var(--text-3)]">
                            State
                          </p>
                          <p className="mt-1 font-medium text-[var(--text-1)]">
                            {update.state}
                          </p>
                        </div>
                        <div className="rounded-[14px] border border-[var(--border)] bg-[var(--surface-1)] px-3 py-2.5">
                          <p className="text-xs uppercase tracking-[0.16em] text-[var(--text-3)]">
                            Eligibility
                          </p>
                          <p className="mt-1 font-medium text-[var(--text-1)]">
                            {update.qualification}
                          </p>
                        </div>
                        <div className="rounded-[14px] border border-[var(--border)] bg-[var(--surface-1)] px-3 py-2.5 sm:col-span-2">
                          <p className="text-xs uppercase tracking-[0.16em] text-[var(--text-3)]">
                            Timeline
                          </p>
                          <p className="mt-1 font-medium text-[var(--text-1)]">
                            {formatDate(update.applicationStart)} to{" "}
                            {formatDate(update.lastDate)}
                          </p>
                          <p className="mt-1 text-xs text-[var(--text-3)]">
                            {getStatusNote(update, today)} • {update.examWindow}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                        <a
                          href={update.applyUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-primary h-11 flex-1"
                        >
                          {status === "Upcoming" ? "Official site" : "Apply now"}
                          <ArrowUpRight size={15} />
                        </a>
                        <a
                          href={update.noticeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-ghost h-11 flex-1"
                        >
                          View notice
                          <ExternalLink size={15} />
                        </a>
                      </div>
                    </article>
                  );
                })}
              </div>

              <div className="hidden xl:block">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-[var(--border)]">
                      <TableHead className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-3)]">
                        Opportunity
                      </TableHead>
                      <TableHead className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-3)]">
                        Type
                      </TableHead>
                      <TableHead className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-3)]">
                        State
                      </TableHead>
                      <TableHead className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-3)]">
                        Eligibility
                      </TableHead>
                      <TableHead className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-3)]">
                        Timeline
                      </TableHead>
                      <TableHead className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-3)]">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUpdates.map(update => {
                      const status = getUpdateStatus(update, today);

                      return (
                        <TableRow key={update.id} className="align-top">
                          <TableCell className="px-4 py-4 align-top whitespace-normal">
                            <div className="min-w-[250px]">
                              <div className="flex flex-wrap items-center gap-2">
                                <span
                                  className={cn(
                                    "inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold",
                                    statusTone[status]
                                  )}
                                >
                                  {status}
                                </span>
                                <span className="inline-flex items-center rounded-full border border-[var(--border)] bg-[var(--surface-1)] px-2.5 py-1 text-[11px] font-semibold text-[var(--text-3)]">
                                  {getUpdatedLabel(update.updatedAt, today)}
                                </span>
                              </div>
                              <h3 className="mt-3 text-[1rem] font-semibold text-[var(--text-1)]">
                                {update.title}
                              </h3>
                              <p className="mt-1 text-sm text-[var(--text-2)]">
                                {update.organization}
                              </p>
                              <p className="mt-2 max-w-[38ch] text-sm leading-6 text-[var(--text-2)]">
                                {update.summary}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell className="px-4 py-4 align-top whitespace-normal">
                            <div className="min-w-[130px]">
                              <p className="font-medium text-[var(--text-1)]">
                                {update.examType}
                              </p>
                              <p className="mt-1 text-sm text-[var(--text-3)]">
                                {update.tags.slice(0, 2).join(" • ")}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell className="px-4 py-4 align-top whitespace-normal">
                            <div className="min-w-[120px]">
                              <p className="font-medium text-[var(--text-1)]">
                                {update.state}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell className="px-4 py-4 align-top whitespace-normal">
                            <div className="min-w-[220px]">
                              <p className="font-medium text-[var(--text-1)]">
                                {update.qualification}
                              </p>
                              <p className="mt-1 text-sm leading-6 text-[var(--text-3)]">
                                {update.eligibility}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell className="px-4 py-4 align-top whitespace-normal">
                            <div className="min-w-[210px]">
                              <p className="font-medium text-[var(--text-1)]">
                                {formatDate(update.applicationStart)} to{" "}
                                {formatDate(update.lastDate)}
                              </p>
                              <p className="mt-1 text-sm text-[var(--text-3)]">
                                {getStatusNote(update, today)}
                              </p>
                              <p className="mt-1 text-sm text-[var(--text-3)]">
                                {update.examWindow}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell className="px-4 py-4 align-top whitespace-normal">
                            <div className="flex min-w-[180px] flex-col gap-2">
                              <a
                                href={update.applyUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn-primary h-10 w-full text-sm"
                              >
                                {status === "Upcoming"
                                  ? "Official site"
                                  : "Apply now"}
                                <ArrowUpRight size={14} />
                              </a>
                              <a
                                href={update.noticeUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn-ghost h-10 w-full text-sm"
                              >
                                View notice
                                <ExternalLink size={14} />
                              </a>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </section>
      </div>
    </AppShell>
  );
}
