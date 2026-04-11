import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, Bell, ExternalLink, Loader2 } from "lucide-react";

import AppShell from "@/components/AppShell";
import {
  EXAM_TYPES,
  QUALIFICATION_TIERS,
  type ExamType,
  type ExamUpdate,
  type QualificationTier,
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
type TimelineFilter = "all" | "upcoming" | "closing_soon";
type ScopeFilter = "all" | "central" | "state";
type RelativeMonthFilter =
  | "all"
  | "previous_month"
  | "this_month"
  | "next_month"
  | "this_year";

const INDIAN_REGION_OPTIONS = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
] as const;

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

const TIMELINE_FILTERS: Array<{ id: TimelineFilter; label: string }> = [
  { id: "all", label: "All" },
  { id: "upcoming", label: "Upcoming" },
  { id: "closing_soon", label: "Closing soon" },
];

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

const getUpdateStatus = (update: ExamUpdate, today: Date): UpdateStatus => {
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

  if (status === "Closed") return "Closed";

  const daysLeft = differenceInDays(end, current);
  if (daysLeft <= 0) return "Last day";
  return `${daysLeft} day${daysLeft === 1 ? "" : "s"} left`;
};

const getScope = (update: ExamUpdate) =>
  update.state === "All India" ? "central" : "state";

const normalizeStateValue = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[()]/g, " ")
    .replace(/[/-]/g, " ")
    .replace(/,/g, " ")
    .replace(/\s+/g, " ");

const STATE_FILTER_ALIASES: Record<string, string[]> = {
  "Andaman and Nicobar Islands": ["andaman and nicobar islands"],
  Chandigarh: ["chandigarh"],
  "Dadra and Nagar Haveli and Daman and Diu": [
    "dadra and nagar haveli and daman and diu",
  ],
  Delhi: ["delhi", "delhi ncr", "nct of delhi"],
  "Jammu and Kashmir": ["jammu and kashmir"],
  Ladakh: ["ladakh"],
  Lakshadweep: ["lakshadweep"],
  Puducherry: ["puducherry", "pondicherry"],
};

const matchesStateFilter = (update: ExamUpdate, selectedState: string) => {
  if (selectedState === "all") return true;
  if (update.state === "All India") return true;

  const normalizedState = normalizeStateValue(update.state);
  const aliases = STATE_FILTER_ALIASES[selectedState] ?? [
    normalizeStateValue(selectedState),
  ];

  return aliases.some(alias => normalizedState.includes(alias));
};

const getMonthFilterLabel = (value: RelativeMonthFilter) => {
  switch (value) {
    case "previous_month":
      return "Previous month";
    case "this_month":
      return "This month";
    case "next_month":
      return "Next month";
    case "this_year":
      return "This year";
    default:
      return "All months";
  }
};

const matchesRelativeMonth = (
  value: string,
  filter: RelativeMonthFilter,
  today: Date
) => {
  if (filter === "all") return true;

  const date = startOfDay(value);
  const year = today.getFullYear();
  const month = today.getMonth();

  if (filter === "this_year") {
    return date.getFullYear() === year;
  }

  if (filter === "this_month") {
    return date.getFullYear() === year && date.getMonth() === month;
  }

  if (filter === "previous_month") {
    const previous = new Date(year, month - 1, 1);
    return (
      date.getFullYear() === previous.getFullYear() &&
      date.getMonth() === previous.getMonth()
    );
  }

  const next = new Date(year, month + 1, 1);
  return (
    date.getFullYear() === next.getFullYear() &&
    date.getMonth() === next.getMonth()
  );
};

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

const statusTone: Record<Exclude<UpdateStatus, "Closed">, string> = {
  Open: "border-[rgba(86,194,136,0.24)] bg-[var(--green-bg)] text-[var(--green)]",
  "Closing Soon":
    "border-[rgba(231,177,90,0.28)] bg-[var(--yellow-bg)] text-[var(--yellow)]",
  Upcoming:
    "border-[rgba(110,151,255,0.24)] bg-[var(--blue-bg)] text-[var(--blue)]",
};

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <label className="space-y-1.5">
      <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--text-3)]">
        {label}
      </span>
      <select
        value={value}
        onChange={event => onChange(event.target.value)}
        className="h-9 min-w-[150px] rounded-full border border-[var(--border)] bg-[var(--bg)] px-4 text-sm text-[var(--text-2)] outline-none transition focus:border-[var(--brand)]"
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export default function Updates() {
  const [liveUpdates, setLiveUpdates] = useState<ExamUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [timelineFilter, setTimelineFilter] =
    useState<TimelineFilter>("all");
  const [scopeFilter, setScopeFilter] = useState<ScopeFilter>("all");
  const [stateFilter, setStateFilter] = useState("all");
  const [qualificationFilter, setQualificationFilter] =
    useState<"all" | QualificationTier>("all");
  const [monthFilter, setMonthFilter] =
    useState<RelativeMonthFilter>("all");
  const today = useMemo(() => new Date(), []);

  useEffect(() => {
    let cancelled = false;

    supabase
      .from("updates")
      .select("*")
      .eq("is_active", true)
      .order("last_date", { ascending: true })
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

  const updates = liveUpdates.length > 0 ? liveUpdates : examUpdates;
  const stateOptions = useMemo(
    () => [
      { value: "all", label: "All states" },
      ...INDIAN_REGION_OPTIONS.map(region => ({
        value: region,
        label: region,
      })),
    ],
    []
  );

  const filteredUpdates = useMemo(() => {
    return updates
      .filter(update => getUpdateStatus(update, today) !== "Closed")
      .filter(update => {
        const status = getUpdateStatus(update, today);

        if (timelineFilter === "upcoming" && status !== "Upcoming") {
          return false;
        }

        if (timelineFilter === "closing_soon" && status !== "Closing Soon") {
          return false;
        }

        if (scopeFilter !== "all" && getScope(update) !== scopeFilter) {
          return false;
        }

        if (!matchesStateFilter(update, stateFilter)) {
          return false;
        }

        if (
          qualificationFilter !== "all" &&
          update.qualification !== qualificationFilter
        ) {
          return false;
        }

        if (!matchesRelativeMonth(update.lastDate, monthFilter, today)) {
          return false;
        }

        return true;
      })
      .sort(
        (left, right) =>
          startOfDay(left.lastDate).getTime() -
          startOfDay(right.lastDate).getTime()
      );
  }, [
    monthFilter,
    qualificationFilter,
    scopeFilter,
    stateFilter,
    timelineFilter,
    today,
    updates,
  ]);

  return (
    <AppShell contentClassName="max-w-[1120px]">
      <div className="space-y-5">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[var(--text-3)]">
            <Bell size={15} />
            <span className="text-xs font-semibold uppercase tracking-[0.18em]">
              Updates
            </span>
            <span
              className={cn(
                "inline-flex min-w-[88px] items-center justify-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface-1)] px-2.5 py-1 text-[11px] font-medium text-[var(--text-2)] transition-opacity",
                loading ? "opacity-100" : "opacity-0"
              )}
              aria-hidden={!loading}
            >
              <Loader2 size={12} className="animate-spin" />
              Syncing
            </span>
          </div>
          <h1 className="text-[2rem] tracking-[-0.05em] text-[var(--text-1)]">
            Exam updates
          </h1>
        </div>

        <section className="rounded-[18px] border border-[var(--border)] bg-[var(--surface-1)] p-4">
          <div className="grid gap-3 lg:grid-cols-[auto_auto_auto_auto_1fr] lg:items-end">
            <FilterSelect
              label="Scope"
              value={scopeFilter}
              onChange={value => setScopeFilter(value as ScopeFilter)}
              options={[
                { value: "all", label: "All" },
                { value: "central", label: "Central" },
                { value: "state", label: "State" },
              ]}
            />

            <FilterSelect
              label="Eligibility"
              value={qualificationFilter}
              onChange={value =>
                setQualificationFilter(value as "all" | QualificationTier)
              }
              options={[
                { value: "all", label: "All" },
                ...QUALIFICATION_TIERS.map(option => ({
                  value: option,
                  label: option,
                })),
              ]}
            />

            <FilterSelect
              label="State"
              value={stateFilter}
              onChange={setStateFilter}
              options={stateOptions}
            />

            <FilterSelect
              label="Month"
              value={monthFilter}
              onChange={value => setMonthFilter(value as RelativeMonthFilter)}
              options={[
                { value: "all", label: "All months" },
                { value: "previous_month", label: "Previous month" },
                { value: "this_month", label: "This month" },
                { value: "next_month", label: "Next month" },
                { value: "this_year", label: "This year" },
              ]}
            />

            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--text-3)]">
                Timeline
              </span>
              <div className="flex flex-wrap gap-2">
                {TIMELINE_FILTERS.map(filter => {
                  const active = timelineFilter === filter.id;

                  return (
                    <button
                      key={filter.id}
                      type="button"
                      onClick={() => setTimelineFilter(filter.id)}
                      className={cn(
                        "inline-flex h-9 items-center justify-center rounded-full border px-4 text-sm font-medium transition",
                        active
                          ? "border-[var(--brand)] bg-[var(--brand)] text-[var(--text-on-brand)]"
                          : "border-[var(--border)] bg-[var(--bg)] text-[var(--text-2)] hover:border-[var(--border-strong)] hover:text-[var(--text-1)]"
                      )}
                    >
                      {filter.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <div className="text-sm text-[var(--text-3)]">
          {filteredUpdates.length} update
          {filteredUpdates.length === 1 ? "" : "s"}
          <span className="ml-2">• {scopeFilter === "all" ? "all scopes" : scopeFilter}</span>
          <span className="ml-2">• {stateFilter === "all" ? "all states" : stateFilter}</span>
          <span className="ml-2">
            • {qualificationFilter === "all" ? "all eligibility" : qualificationFilter}
          </span>
          <span className="ml-2">• {getMonthFilterLabel(monthFilter)}</span>
        </div>

        {filteredUpdates.length === 0 ? (
          <div className="rounded-[18px] border border-[var(--border)] bg-[var(--surface-1)] px-5 py-8 text-sm text-[var(--text-2)]">
            No updates found for this filter.
          </div>
        ) : (
          <>
            <div className="space-y-2 lg:hidden">
              {filteredUpdates.map(update => {
                const status = getUpdateStatus(update, today);

                return (
                  <article
                    key={update.id}
                    className="rounded-[18px] border border-[var(--border)] bg-[var(--surface-1)] px-4 py-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h2 className="text-[1rem] font-semibold text-[var(--text-1)]">
                          {update.title}
                        </h2>
                        <p className="mt-1 text-sm text-[var(--text-2)]">
                          {update.organization}
                        </p>
                      </div>
                      <span
                        className={cn(
                          "inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold",
                          statusTone[status as Exclude<UpdateStatus, "Closed">]
                        )}
                      >
                        {status}
                      </span>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2 text-xs text-[var(--text-3)]">
                      <span>{getScope(update) === "central" ? "Central" : "State"}</span>
                      <span>•</span>
                      <span>{update.state}</span>
                      <span>•</span>
                      <span>{update.qualification}</span>
                      <span>•</span>
                      <span>Last date {formatDate(update.lastDate)}</span>
                      <span>•</span>
                      <span>{getStatusNote(update, today)}</span>
                    </div>

                    <div className="mt-4 flex gap-2">
                      <a
                        href={update.applyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-primary h-9 flex-1 text-sm"
                      >
                        Apply
                        <ArrowUpRight size={14} />
                      </a>
                      <a
                        href={update.noticeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-ghost h-9 flex-1 text-sm"
                      >
                        Notice
                        <ExternalLink size={14} />
                      </a>
                    </div>
                  </article>
                );
              })}
            </div>

            <div className="hidden lg:block">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-[var(--border)]">
                    <TableHead className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-3)]">
                      Exam
                    </TableHead>
                    <TableHead className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-3)]">
                      Scope
                    </TableHead>
                    <TableHead className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-3)]">
                      State
                    </TableHead>
                    <TableHead className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-3)]">
                      Eligibility
                    </TableHead>
                    <TableHead className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-3)]">
                      Last date
                    </TableHead>
                    <TableHead className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-3)]">
                      Status
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
                      <TableRow key={update.id}>
                        <TableCell className="px-4 py-4 whitespace-normal">
                          <div>
                            <p className="font-medium text-[var(--text-1)]">
                              {update.title}
                            </p>
                            <p className="mt-1 text-sm text-[var(--text-3)]">
                              {update.organization}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="px-4 py-4 text-sm text-[var(--text-2)]">
                          {getScope(update) === "central" ? "Central" : "State"}
                        </TableCell>
                        <TableCell className="px-4 py-4 text-sm text-[var(--text-2)]">
                          {update.state}
                        </TableCell>
                        <TableCell className="px-4 py-4 text-sm text-[var(--text-2)]">
                          {update.qualification}
                        </TableCell>
                        <TableCell className="px-4 py-4 text-sm text-[var(--text-2)]">
                          {formatDate(update.lastDate)}
                        </TableCell>
                        <TableCell className="px-4 py-4">
                          <span
                            className={cn(
                              "inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold",
                              statusTone[status as Exclude<UpdateStatus, "Closed">]
                            )}
                          >
                            {getStatusNote(update, today)}
                          </span>
                        </TableCell>
                        <TableCell className="px-4 py-4">
                          <div className="flex gap-2">
                            <a
                              href={update.applyUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn-primary h-9 px-4 text-sm"
                            >
                              Apply
                            </a>
                            <a
                              href={update.noticeUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn-ghost h-9 px-4 text-sm"
                            >
                              Notice
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
      </div>
    </AppShell>
  );
}
