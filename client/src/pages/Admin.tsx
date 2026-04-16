import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation } from "wouter";
import {
  AlertCircle,
  Bell,
  ChartColumn,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Database,
  Download,
  Edit2,
  FileSpreadsheet,
  FileText,
  Layers3,
  Link as LinkIcon,
  Loader2,
  LogOut,
  MousePointerClick,
  Plus,
  RefreshCcw,
  Search,
  Send,
  ShieldCheck,
  Timer,
  Trash2,
  Trophy,
  TrendingUp,
  UserPlus,
  Users,
  Upload,
  X,
  type LucideIcon,
} from "lucide-react";

import type { Difficulty, Exam, QuestionType } from "@/data/questions";
import {
  EXAM_TYPES,
  QUALIFICATION_TIERS,
  type ExamType as UpdateExamType,
  type QualificationTier,
} from "@/data/updates";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { chunkQuestions, parseBulkQuestionInput, type ImportedQuestionPayload } from "@/lib/questionImport";
import { clearPublicCache } from "@/lib/publicCache";
import { buildMailtoLink } from "@/lib/siteConfig";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import AdminConsole from "@/pages/AdminConsole";

const ADMIN_EMAIL = "rakeshmeesa631@gmail.com";
const RESOURCES_PUBLIC_CACHE_KEY = "resources:active";

const QUESTION_EXAMS: Exam[] = ["UPSC", "SSC", "TSPSC", "APPSC", "RRB", "IBPS"];
const FILTER_EXAMS = ["All", ...QUESTION_EXAMS] as const;
const DIFFICULTIES: Difficulty[] = ["Easy", "Medium", "Hard"];
const QUESTION_TYPES: QuestionType[] = ["PYQ", "Conceptual", "CurrentAffairs", "Mock"];
const QUESTION_TOPICS = [
  "Polity",
  "History",
  "Geography",
  "Economy",
  "Environment",
  "Science & Technology",
  "Reasoning",
  "Quantitative Aptitude",
  "English Language",
  "Mental Ability",
  "Reading Comprehension",
  "Data Interpretation",
  "Telangana GK",
  "Current Affairs",
  "AP GK",
] as const;
const RESOURCE_TYPES = ["PDF", "Book", "Video", "Link", "Notes"] as const;
const RESOURCE_CATEGORIES = [
  "Syllabus",
  "Previous Papers",
  "Strategy",
  "Notes",
  "Books",
  "Video Lectures",
  "Current Affairs",
  "State Exam",
  "General",
] as const;
const RESOURCE_EXAMS = ["All", ...QUESTION_EXAMS] as const;
const CONTEST_STATUSES = ["upcoming", "past"] as const;
const STATUS_FILTERS = ["All", "Active", "Inactive"] as const;
const UPDATE_TIMELINE_FILTERS = ["All", "Open", "Upcoming", "Closing Soon"] as const;
const ADMIN_TABS = ["analytics", "questions", "resources", "updates", "contests", "support"] as const;
const SUPABASE_PAGE_SIZE = 1000;

const ADMIN_TAB_META: Record<
  (typeof ADMIN_TABS)[number],
  { label: string; description: string; icon: LucideIcon }
> = {
  analytics: {
    label: "Analytics",
    description: "Traffic, engagement, and top pages.",
    icon: ChartColumn,
  },
  questions: {
    label: "Questions",
    description: "Question bank operations and cleanup.",
    icon: BookOpen,
  },
  resources: {
    label: "Resources",
    description: "Links, PDFs, and study materials.",
    icon: Layers3,
  },
  updates: {
    label: "Updates",
    description: "Publishing desk for opportunities and notices.",
    icon: Bell,
  },
  contests: {
    label: "Contests",
    description: "Schedule, prizes, and contest records.",
    icon: Trophy,
  },
  support: {
    label: "Support",
    description: "Inbox for customer operations and replies.",
    icon: AlertCircle,
  },
};

const BULK_IMPORT_TEMPLATE = `question,option_a,option_b,option_c,option_d,correct_option,explanation,exam,topic,subtopic,difficulty,type,year,tags
Which Article of the Indian Constitution deals with the Right to Education?,Article 19,Article 21A,Article 24,Article 32,B,Article 21A makes free and compulsory education a fundamental right for children aged 6-14.,UPSC,Polity,Fundamental Rights,Easy,PYQ,2019,constitution|education|article-21a`;

const BULK_RESOURCE_TEMPLATE = `title,description,type,url,exam,category,is_active
UPSC Previous Year Papers,Official UPSC previous question papers,PDF,https://upsc.gov.in/examinations/previous-question-papers,UPSC,Previous Papers,true`;

const BULK_UPDATE_TEMPLATE = `title,organization,exam_type,state,qualification,eligibility,application_start,last_date,exam_window,updated_at,summary,tags,apply_url,notice_url,is_active
SSC CGL 2026,Staff Selection Commission,SSC,All India,Graduate,Any graduate candidate,2026-04-01,2026-05-08,Tier I expected in July 2026,2026-04-05,Large central recruitment cycle,graduate jobs|central govt|tier i,https://ssc.gov.in/,https://ssc.gov.in/,true`;

type AdminTab = (typeof ADMIN_TABS)[number];
type FilterExam = (typeof FILTER_EXAMS)[number];
type StatusFilter = (typeof STATUS_FILTERS)[number];
type ResourceExam = (typeof RESOURCE_EXAMS)[number];
type ResourceType = (typeof RESOURCE_TYPES)[number];
type ResourceCategory = (typeof RESOURCE_CATEGORIES)[number];
type ContestStatus = (typeof CONTEST_STATUSES)[number];
type UpdateTimelineFilter = (typeof UPDATE_TIMELINE_FILTERS)[number];
type Tone = "orange" | "blue" | "green" | "rose" | "slate";
type RawRecord = Record<string, unknown>;

type QuestionRecord = ImportedQuestionPayload & {
  id: string | number;
  created_at?: string | null;
};

type QuestionForm = {
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: number;
  explanation: string;
  exam: Exam;
  topic: string;
  subtopic: string;
  difficulty: Difficulty;
  type: QuestionType;
  year: string;
  tags: string;
  is_active: boolean;
};

type ResourceRecord = {
  id: string | number;
  title: string;
  description?: string | null;
  type?: string | null;
  url: string;
  exam?: string | null;
  category?: string | null;
  is_active?: boolean | null;
  created_at?: string | null;
};

type ResourceForm = {
  title: string;
  description: string;
  type: ResourceType;
  url: string;
  exam: ResourceExam;
  category: ResourceCategory;
  is_active: boolean;
};

type ImportedResourcePayload = {
  title: string;
  description: string | null;
  type: string;
  url: string;
  exam: string;
  category: string;
  is_active: boolean;
};

type UpdateRecord = {
  id: string | number;
  title: string;
  organization: string;
  exam_type: UpdateExamType;
  state: string;
  qualification: QualificationTier;
  eligibility: string;
  application_start: string;
  last_date: string;
  exam_window: string;
  updated_at: string;
  summary: string;
  tags: string[] | null;
  apply_url: string;
  notice_url: string;
  is_active?: boolean | null;
  created_at?: string | null;
};

type UpdateForm = {
  title: string;
  organization: string;
  exam_type: UpdateExamType;
  state: string;
  qualification: QualificationTier;
  eligibility: string;
  application_start: string;
  last_date: string;
  exam_window: string;
  updated_at: string;
  summary: string;
  tags: string;
  apply_url: string;
  notice_url: string;
  is_active: boolean;
};

type ImportedUpdatePayload = {
  title: string;
  organization: string;
  exam_type: UpdateExamType;
  state: string;
  qualification: QualificationTier;
  eligibility: string;
  application_start: string;
  last_date: string;
  exam_window: string;
  updated_at: string;
  summary: string;
  tags: string[];
  apply_url: string;
  notice_url: string;
  is_active: boolean;
};

type ContestRecord = {
  id: string | number;
  name: string;
  date: string;
  duration: string;
  topics: string;
  prize: string;
  status: ContestStatus;
  winner?: string | null;
  your_rank?: number | null;
};

type ContestForm = {
  name: string;
  date: string;
  duration: string;
  topics: string;
  prize: string;
  status: ContestStatus;
  winner: string;
  your_rank: string;
};

type SupportRequest = {
  id: string | number;
  email: string;
  category?: string | null;
  subject?: string | null;
  message?: string | null;
  source?: string | null;
  status?: "open" | "in_progress" | "resolved" | null;
  created_at?: string | null;
};

type SupportReply = {
  id: string | number;
  support_request_id: string;
  to_email: string;
  subject: string;
  message: string;
  sent_by_email?: string | null;
  sent_at?: string | null;
  created_at?: string | null;
};

type AnalyticsOverviewRow = {
  page_views: number | null;
  visitors: number | null;
  signins: number | null;
  signups: number | null;
  avg_engaged_seconds: number | null;
};

type QuestionExamCounts = Record<Exam, number>;

type AnalyticsDailyOverviewRow = AnalyticsOverviewRow & {
  day: string;
};

type AnalyticsPeriodOverviewRow = AnalyticsOverviewRow & {
  visitor_growth_pct: number | null;
  signup_growth_pct: number | null;
  signin_growth_pct: number | null;
};

type AnalyticsMonthlyOverviewRow = AnalyticsPeriodOverviewRow & {
  month: string;
};

type AnalyticsYearlyOverviewRow = AnalyticsPeriodOverviewRow & {
  year: string;
};

type AnalyticsTopPageRow = {
  path: string | null;
  page_views: number | null;
  visitors: number | null;
  avg_engaged_seconds: number | null;
};

const EMPTY_Q: QuestionForm = {
  question: "",
  option_a: "",
  option_b: "",
  option_c: "",
  option_d: "",
  correct_option: 0,
  explanation: "",
  exam: "UPSC",
  topic: "Polity",
  subtopic: "",
  difficulty: "Easy",
  type: "PYQ",
  year: "",
  tags: "",
  is_active: true,
};

const EMPTY_R: ResourceForm = {
  title: "",
  description: "",
  type: "PDF",
  url: "",
  exam: "All",
  category: "Syllabus",
  is_active: true,
};

const EMPTY_C: ContestForm = {
  name: "",
  date: "",
  duration: "60 minutes",
  topics: "",
  prize: "",
  status: "upcoming",
  winner: "",
  your_rank: "",
};

const EMPTY_U: UpdateForm = {
  title: "",
  organization: "",
  exam_type: "SSC",
  state: "All India",
  qualification: "Graduate",
  eligibility: "",
  application_start: "",
  last_date: "",
  exam_window: "",
  updated_at: new Date().toISOString().slice(0, 10),
  summary: "",
  tags: "",
  apply_url: "",
  notice_url: "",
  is_active: true,
};

function toId(value: string | number | null | undefined) {
  return String(value ?? "");
}

function createEmptyQuestionExamCounts(): QuestionExamCounts {
  return QUESTION_EXAMS.reduce((counts, exam) => {
    counts[exam] = 0;
    return counts;
  }, {} as QuestionExamCounts);
}

function summarizeQuestionBank(questions: QuestionRecord[]) {
  const examCounts = createEmptyQuestionExamCounts();
  let active = 0;
  let pyq = 0;

  questions.forEach((question) => {
    if (question.is_active) active += 1;
    if (question.type === "PYQ") pyq += 1;
    examCounts[question.exam] += 1;
  });

  return {
    total: questions.length,
    active,
    inactive: questions.length - active,
    pyq,
    upsc: examCounts.UPSC,
    examCounts,
  };
}

function normalizeKey(key: string) {
  return key.trim().toLowerCase().replace(/[\s-]+/g, "_");
}

function mapRecordKeys(record: RawRecord) {
  const normalized: RawRecord = {};

  Object.entries(record).forEach(([key, value]) => {
    normalized[normalizeKey(key)] = value;
  });

  return normalized;
}

function parseDelimitedRow(row: string, delimiter: string) {
  const cells: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let index = 0; index < row.length; index += 1) {
    const char = row[index];
    const nextChar = row[index + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === delimiter && !inQuotes) {
      cells.push(current.trim());
      current = "";
      continue;
    }

    current += char;
  }

  cells.push(current.trim());
  return cells;
}

function parseDelimitedInput(input: string, delimiter: string) {
  const rows = input
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(Boolean);

  if (rows.length < 2) {
    throw new Error("Add a header row and at least one data row.");
  }

  const headers = parseDelimitedRow(rows[0], delimiter).map(normalizeKey);

  return rows.slice(1).map(row => {
    const values = parseDelimitedRow(row, delimiter);
    const record: RawRecord = {};

    headers.forEach((header, index) => {
      record[header] = values[index] ?? "";
    });

    return record;
  });
}

function parseFlexibleInput(input: string, collectionKey?: string) {
  const trimmed = input.trim();

  if (!trimmed) {
    throw new Error("Paste or upload data first.");
  }

  if (trimmed.startsWith("[") || trimmed.startsWith("{")) {
    const parsed = JSON.parse(trimmed) as RawRecord | RawRecord[];

    if (Array.isArray(parsed)) {
      return parsed.map(mapRecordKeys);
    }

    if (collectionKey) {
      const collection = parsed[collectionKey];
      if (Array.isArray(collection)) {
        return collection.map(record => mapRecordKeys(record as RawRecord));
      }
    }

    throw new Error("JSON must be an array or contain the expected collection field.");
  }

  if (trimmed.includes("\t")) {
    return parseDelimitedInput(trimmed, "\t").map(mapRecordKeys);
  }

  return parseDelimitedInput(trimmed, ",").map(mapRecordKeys);
}

function asText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function parseBoolean(value: unknown, fallback = true) {
  if (typeof value === "boolean") return value;

  const text = String(value ?? "").trim().toLowerCase();
  if (!text) return fallback;
  if (["true", "1", "yes", "y", "active"].includes(text)) return true;
  if (["false", "0", "no", "n", "inactive"].includes(text)) return false;
  return fallback;
}

function parseBulkResourceInput(input: string): ImportedResourcePayload[] {
  const records = parseFlexibleInput(input, "resources");

  if (records.length === 0) {
    throw new Error("No resources found.");
  }

  return records.map((record, index) => {
    const title = asText(record.title);
    const url = asText(record.url);

    if (!title) {
      throw new Error(`Row ${index + 1}: title is required.`);
    }

    if (!url) {
      throw new Error(`Row ${index + 1}: url is required.`);
    }

    const exam = asText(record.exam) || "All";
    if (!RESOURCE_EXAMS.includes(exam as ResourceExam)) {
      throw new Error(`Row ${index + 1}: exam must be one of ${RESOURCE_EXAMS.join(", ")}.`);
    }

    return {
      title,
      description: asText(record.description) || null,
      type: asText(record.type) || "Link",
      url,
      exam,
      category: asText(record.category) || "General",
      is_active: parseBoolean(record.is_active, true),
    };
  });
}

function parseBulkUpdateInput(input: string): ImportedUpdatePayload[] {
  const records = parseFlexibleInput(input, "updates");

  if (records.length === 0) {
    throw new Error("No updates found.");
  }

  return records.map((record, index) => {
    const title = asText(record.title);
    const organization = asText(record.organization);
    const examType = asText(record.exam_type) as UpdateExamType;
    const qualification = asText(record.qualification) as QualificationTier;
    const applicationStart = asText(record.application_start);
    const lastDate = asText(record.last_date);

    if (!title) {
      throw new Error(`Row ${index + 1}: title is required.`);
    }

    if (!organization) {
      throw new Error(`Row ${index + 1}: organization is required.`);
    }

    if (!EXAM_TYPES.includes(examType)) {
      throw new Error(`Row ${index + 1}: exam_type must be one of ${EXAM_TYPES.join(", ")}.`);
    }

    if (!QUALIFICATION_TIERS.includes(qualification)) {
      throw new Error(
        `Row ${index + 1}: qualification must be one of ${QUALIFICATION_TIERS.join(", ")}.`
      );
    }

    if (!applicationStart || !lastDate) {
      throw new Error(`Row ${index + 1}: application_start and last_date are required.`);
    }

    return {
      title,
      organization,
      exam_type: examType,
      state: asText(record.state) || "All India",
      qualification,
      eligibility: asText(record.eligibility) || "Check the official notice for full eligibility details.",
      application_start: applicationStart,
      last_date: lastDate,
      exam_window: asText(record.exam_window) || "See official notification",
      updated_at: asText(record.updated_at) || new Date().toISOString().slice(0, 10),
      summary: asText(record.summary) || title,
      tags: asText(record.tags)
        .split(/[|,]/)
        .map(tag => tag.trim())
        .filter(Boolean),
      apply_url: asText(record.apply_url),
      notice_url: asText(record.notice_url) || asText(record.apply_url),
      is_active: parseBoolean(record.is_active, true),
    };
  });
}

function chunkItems<T>(items: T[], size = 200) {
  const chunks: T[][] = [];

  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }

  return chunks;
}

function escapeCsvCell(value: unknown) {
  const text = Array.isArray(value)
    ? value.join("|")
    : value === null || value === undefined
      ? ""
      : String(value);

  if (/[",\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }

  return text;
}

function downloadCsv(filename: string, headers: string[], rows: Array<Record<string, unknown>>) {
  const csv = [
    headers.join(","),
    ...rows.map(row => headers.map(header => escapeCsvCell(row[header])).join(",")),
  ].join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function formatDate(value?: string | null) {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatNumber(value?: number | null) {
  return new Intl.NumberFormat("en-IN").format(value ?? 0);
}

function formatPercent(value?: number | null) {
  if (value === null || value === undefined || Number.isNaN(value)) return "Not enough data yet";

  const direction = value > 0 ? "+" : "";
  return `${direction}${value.toFixed(1)}%`;
}

function formatDurationLabel(value?: number | null) {
  if (value === null || value === undefined || value <= 0) return "Still collecting";

  if (value < 60) {
    return `${Math.round(value)} sec`;
  }

  const minutes = Math.floor(value / 60);
  const seconds = Math.round(value % 60);

  if (seconds === 0) return `${minutes} min`;
  return `${minutes} min ${seconds} sec`;
}

function formatShortDateLabel(value?: string | null) {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
  }).format(date);
}

function formatMonthLabel(value?: string | null) {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("en-IN", {
    month: "long",
    year: "numeric",
  }).format(date);
}

function formatYearLabel(value?: string | null) {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("en-IN", {
    year: "numeric",
  }).format(date);
}

function growthTone(value?: number | null): Tone {
  if (value === null || value === undefined || Number.isNaN(value)) return "slate";
  if (value > 0) return "green";
  if (value < 0) return "rose";
  return "blue";
}

function describeGrowth(metric: string, value?: number | null) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return `${metric}: waiting for an older period to compare against.`;
  }

  if (value > 0) {
    return `${metric}: growing ${value.toFixed(1)}% versus the previous period.`;
  }

  if (value < 0) {
    return `${metric}: down ${Math.abs(value).toFixed(1)}% versus the previous period.`;
  }

  return `${metric}: flat versus the previous period.`;
}

function adminUpdateTimeline(update: {
  application_start: string;
  last_date: string;
}) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const start = new Date(`${update.application_start}T00:00:00`);
  const end = new Date(`${update.last_date}T00:00:00`);

  if (today < start) return "Upcoming";
  if (today > end) return "Closed";

  const daysLeft = Math.round((end.getTime() - today.getTime()) / 86400000);
  return daysLeft <= 7 ? "Closing Soon" : "Open";
}

function buildSupportReplyLink(request: SupportRequest) {
  return buildMailtoLink(request.email, {
    subject: `Re: ${request.subject || "Your PrepBros support request"}`,
    body: [
      `Hi,`,
      ``,
      `Thanks for reaching out to PrepBros support.`,
      ``,
      `Regarding: ${request.subject || "your request"}`,
      ``,
      `Reply here:`,
      ``,
    ].join("\n"),
  });
}

function buildSupportReplySubject(request: SupportRequest) {
  return `Re: ${request.subject || "Your PrepBros support request"}`;
}

function buildSupportReplyMessage(request: SupportRequest) {
  return [
    `Hi,`,
    ``,
    `Thanks for reaching out to PrepBros support.`,
    ``,
    `About your issue: ${request.subject || "your request"}`,
    ``,
    ``,
    `Best,`,
    `PrepBros Support`,
  ].join("\n");
}

function supportStatusTone(status?: string | null): Tone {
  switch (status) {
    case "resolved":
      return "green";
    case "in_progress":
      return "blue";
    default:
      return "orange";
  }
}

function matchesText(value: string, query: string) {
  return value.toLowerCase().includes(query.toLowerCase());
}

function tagText(tags: string[] | null | undefined) {
  return (tags || []).join(", ");
}

function metricToneClasses(tone: Tone) {
  switch (tone) {
    case "orange":
      return "border-[#e8d1bf] bg-[#fbf4ee] text-[#9a5a2b]";
    case "blue":
      return "border-[#cfd8ec] bg-[#f4f7fc] text-[#35527c]";
    case "green":
      return "border-[#cfe2d8] bg-[#f2f8f4] text-[#2d6b52]";
    case "rose":
      return "border-[#edd2d6] bg-[#fcf4f5] text-[#9c4451]";
    default:
      return "border-[#d8dde5] bg-[#f6f7f9] text-[#4b5563]";
  }
}

const adminInputClass =
  "w-full rounded-xl border border-[#d7dde5] bg-white px-3.5 py-2.5 text-sm text-[#111827] outline-none transition placeholder:text-[#8b95a7] focus:border-[#b86a2d] focus:ring-4 focus:ring-[#b86a2d]/10";
const adminTextAreaClass =
  "w-full rounded-xl border border-[#d7dde5] bg-white px-3.5 py-3 text-sm text-[#111827] outline-none transition placeholder:text-[#8b95a7] focus:border-[#b86a2d] focus:ring-4 focus:ring-[#b86a2d]/10";
const adminPanelClass =
  "rounded-[20px] border border-[#d7dde5] bg-white shadow-[0_14px_40px_rgba(15,23,42,0.05)]";

function MetricCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "slate",
}: {
  label: string;
  value: string | number;
  hint: string;
  icon: LucideIcon;
  tone?: Tone;
}) {
  return (
    <div className={cn(adminPanelClass, "p-4")}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#6b7280]">
            {label}
          </p>
          <p className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-[#111827]">
            {value}
          </p>
          <p className="mt-2 text-sm leading-6 text-[#667085]">{hint}</p>
        </div>
        <div className={cn("inline-flex h-11 w-11 items-center justify-center rounded-xl border", metricToneClasses(tone))}>
          <Icon size={18} />
        </div>
      </div>
    </div>
  );
}

function SectionCard({
  title,
  description,
  children,
  actions,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <section className={cn(adminPanelClass, "overflow-hidden p-5 md:p-6")}>
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-[-0.03em] text-[#111827]">
            {title}
          </h2>
          {description ? (
            <p className="mt-1 max-w-3xl text-sm leading-6 text-[#667085]">{description}</p>
          ) : null}
        </div>
        {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function Pill({
  children,
  tone = "slate",
}: {
  children: React.ReactNode;
  tone?: Tone;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold tracking-[0.01em]",
        metricToneClasses(tone)
      )}
    >
      {children}
    </span>
  );
}

function SmallButton({
  children,
  tone = "neutral",
  onClick,
  disabled,
  icon: Icon,
}: {
  children: React.ReactNode;
  tone?: "neutral" | "primary" | "danger";
  onClick?: () => void;
  disabled?: boolean;
  icon?: LucideIcon;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50",
        tone === "primary" &&
          "bg-[#111827] text-white hover:bg-[#1f2937]",
        tone === "danger" &&
          "border border-[#e7cfd4] bg-[#fcf4f5] text-[#9c4451] hover:bg-[#faecef]",
        tone === "neutral" &&
          "border border-[#d7dde5] bg-white text-[#334155] hover:bg-[#f8fafc]"
      )}
    >
      {Icon ? <Icon size={15} /> : null}
      {children}
    </button>
  );
}

function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-[20px] border border-dashed border-[#d7dde5] bg-[#fbfcfd] px-6 py-12 text-center">
      <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#eef2f6] text-[#64748b]">
        <Icon size={20} />
      </div>
      <p className="mt-4 text-base font-semibold text-[#111827]">{title}</p>
      <p className="mt-2 text-sm leading-6 text-[#667085]">{description}</p>
    </div>
  );
}

function Admin() {
  const [, navigate] = useLocation();
  const { user, session, signOut, loading: authLoading } = useAuth();

  const [activeTab, setActiveTab] = useState<AdminTab>("analytics");
  const [booting, setBooting] = useState(true);
  const [loadingTarget, setLoadingTarget] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  const [dbQuestions, setDbQuestions] = useState<QuestionRecord[]>([]);
  const [questionForm, setQuestionForm] = useState<QuestionForm>({ ...EMPTY_Q });
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [showQuestionImport, setShowQuestionImport] = useState(true);
  const [questionImportInput, setQuestionImportInput] = useState("");
  const [questionImportSource, setQuestionImportSource] = useState("");
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<string[]>([]);
  const [questionSearch, setQuestionSearch] = useState("");
  const [questionExamFilter, setQuestionExamFilter] = useState<FilterExam>("All");
  const [questionTopicFilter, setQuestionTopicFilter] = useState<string>("All");
  const [questionTypeFilter, setQuestionTypeFilter] = useState<"All" | QuestionType>("All");
  const [questionDifficultyFilter, setQuestionDifficultyFilter] = useState<"All" | Difficulty>("All");
  const [questionStatusFilter, setQuestionStatusFilter] = useState<StatusFilter>("All");

  const [dbResources, setDbResources] = useState<ResourceRecord[]>([]);
  const [resourceForm, setResourceForm] = useState<ResourceForm>({ ...EMPTY_R });
  const [editingResourceId, setEditingResourceId] = useState<string | null>(null);
  const [showResourceForm, setShowResourceForm] = useState(false);
  const [showResourceImport, setShowResourceImport] = useState(false);
  const [resourceImportInput, setResourceImportInput] = useState("");
  const [resourceImportSource, setResourceImportSource] = useState("");
  const [selectedResourceIds, setSelectedResourceIds] = useState<string[]>([]);
  const [resourceSearch, setResourceSearch] = useState("");
  const [resourceExamFilter, setResourceExamFilter] = useState<ResourceExam>("All");
  const [resourceTypeFilter, setResourceTypeFilter] = useState<"All" | ResourceType>("All");
  const [resourceCategoryFilter, setResourceCategoryFilter] = useState<string>("All");
  const [resourceStatusFilter, setResourceStatusFilter] = useState<StatusFilter>("All");

  const [dbUpdates, setDbUpdates] = useState<UpdateRecord[]>([]);
  const [updateForm, setUpdateForm] = useState<UpdateForm>({ ...EMPTY_U });
  const [editingUpdateId, setEditingUpdateId] = useState<string | null>(null);
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [showUpdateImport, setShowUpdateImport] = useState(false);
  const [updateImportInput, setUpdateImportInput] = useState("");
  const [updateImportSource, setUpdateImportSource] = useState("");
  const [selectedUpdateIds, setSelectedUpdateIds] = useState<string[]>([]);
  const [updateSearch, setUpdateSearch] = useState("");
  const [updateStateFilter, setUpdateStateFilter] = useState("All");
  const [updateExamTypeFilter, setUpdateExamTypeFilter] = useState<"All" | UpdateExamType>("All");
  const [updateQualificationFilter, setUpdateQualificationFilter] = useState<"All" | QualificationTier>("All");
  const [updateStatusFilter, setUpdateStatusFilter] = useState<StatusFilter>("All");
  const [updateTimelineFilter, setUpdateTimelineFilter] = useState<UpdateTimelineFilter>("All");

  const [dbContests, setDbContests] = useState<ContestRecord[]>([]);
  const [contestForm, setContestForm] = useState<ContestForm>({ ...EMPTY_C });
  const [editingContestId, setEditingContestId] = useState<string | null>(null);
  const [showContestForm, setShowContestForm] = useState(false);

  const [analyticsDaily, setAnalyticsDaily] = useState<AnalyticsDailyOverviewRow[]>([]);
  const [analyticsMonthly, setAnalyticsMonthly] = useState<AnalyticsMonthlyOverviewRow[]>([]);
  const [analyticsYearly, setAnalyticsYearly] = useState<AnalyticsYearlyOverviewRow[]>([]);
  const [analyticsTopPages, setAnalyticsTopPages] = useState<AnalyticsTopPageRow[]>([]);

  const [supportRequests, setSupportRequests] = useState<SupportRequest[]>([]);
  const [supportReplies, setSupportReplies] = useState<SupportReply[]>([]);
  const [supportSearch, setSupportSearch] = useState("");
  const [selectedSupportId, setSelectedSupportId] = useState<string | null>(null);
  const [replyTarget, setReplyTarget] = useState<SupportRequest | null>(null);
  const [replySubject, setReplySubject] = useState("");
  const [replyMessage, setReplyMessage] = useState("");
  const [sendingReply, setSendingReply] = useState(false);

  const questionFileInputRef = useRef<HTMLInputElement | null>(null);
  const resourceFileInputRef = useRef<HTMLInputElement | null>(null);
  const updateFileInputRef = useRef<HTMLInputElement | null>(null);

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    window.setTimeout(() => setToast(null), 3000);
  };

  const setBusy = (target: string | null) => {
    setLoadingTarget(target);
  };

  const loadQuestions = async () => {
    const rows: QuestionRecord[] = [];

    for (let from = 0; ; from += SUPABASE_PAGE_SIZE) {
      const to = from + SUPABASE_PAGE_SIZE - 1;
      const { data, error } = await supabase
        .from("questions_db")
        .select("*")
        .order("created_at", { ascending: false })
        .range(from, to);

      if (error) throw error;

      const batch = (data || []) as QuestionRecord[];
      rows.push(...batch);

      if (batch.length < SUPABASE_PAGE_SIZE) {
        break;
      }
    }

    setDbQuestions(rows);
  };

  const loadResources = async () => {
    const { data, error } = await supabase
      .from("resources")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    setDbResources((data || []) as ResourceRecord[]);
  };

  const loadUpdates = async () => {
    const { data, error } = await supabase
      .from("updates")
      .select("*")
      .order("updated_at", { ascending: false });

    if (error) throw error;
    setDbUpdates((data || []) as UpdateRecord[]);
  };

  const loadContests = async () => {
    const { data, error } = await supabase
      .from("contests")
      .select("*")
      .order("date", { ascending: true });

    if (error) throw error;
    setDbContests((data || []) as ContestRecord[]);
  };

  const loadAnalyticsDaily = async () => {
    const { data, error } = await supabase
      .from("analytics_daily_overview")
      .select("*")
      .order("day", { ascending: false })
      .limit(30);

    if (error) throw error;
    setAnalyticsDaily((data || []) as AnalyticsDailyOverviewRow[]);
  };

  const loadAnalyticsMonthly = async () => {
    const { data, error } = await supabase
      .from("analytics_monthly_overview")
      .select("*")
      .order("month", { ascending: false })
      .limit(12);

    if (error) throw error;
    setAnalyticsMonthly((data || []) as AnalyticsMonthlyOverviewRow[]);
  };

  const loadAnalyticsYearly = async () => {
    const { data, error } = await supabase
      .from("analytics_yearly_overview")
      .select("*")
      .order("year", { ascending: false })
      .limit(5);

    if (error) throw error;
    setAnalyticsYearly((data || []) as AnalyticsYearlyOverviewRow[]);
  };

  const loadAnalyticsTopPages = async () => {
    const { data, error } = await supabase
      .from("analytics_top_pages")
      .select("*")
      .limit(20);

    if (error) throw error;
    setAnalyticsTopPages((data || []) as AnalyticsTopPageRow[]);
  };

  const loadSupportRequests = async () => {
    const { data, error } = await supabase
      .from("support_requests")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    setSupportRequests((data || []) as SupportRequest[]);
  };

  const loadSupportReplies = async () => {
    const { data, error } = await supabase
      .from("support_replies")
      .select("*")
      .order("sent_at", { ascending: false });

    if (error) throw error;
    setSupportReplies((data || []) as SupportReply[]);
  };

  const loadAll = async (silent = false) => {
    if (!silent) setBusy("refresh");

    try {
      await Promise.all([
        loadAnalyticsDaily(),
        loadAnalyticsMonthly(),
        loadAnalyticsYearly(),
        loadAnalyticsTopPages(),
        loadQuestions(),
        loadResources(),
        loadUpdates(),
        loadContests(),
        loadSupportRequests(),
        loadSupportReplies(),
      ]);
      if (!silent) showToast("Admin data refreshed.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not refresh admin data.";
      showToast(message, false);
    } finally {
      if (!silent) setBusy(null);
    }
  };

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      navigate("/");
      return;
    }

    if (user.email !== ADMIN_EMAIL) {
      navigate("/");
      return;
    }

    let cancelled = false;

    const boot = async () => {
      setBooting(true);

      try {
        await Promise.all([
          loadAnalyticsDaily(),
          loadAnalyticsMonthly(),
          loadAnalyticsYearly(),
          loadAnalyticsTopPages(),
          loadQuestions(),
          loadResources(),
          loadUpdates(),
          loadContests(),
          loadSupportRequests(),
          loadSupportReplies(),
        ]);
      } catch (error) {
        if (!cancelled) {
          const message = error instanceof Error ? error.message : "Could not load admin data.";
          showToast(message, false);
        }
      } finally {
        if (!cancelled) {
          setBooting(false);
        }
      }
    };

    void boot();

    return () => {
      cancelled = true;
    };
  }, [authLoading, navigate, user]);

  const availableQuestionTopics = useMemo(() => {
    const topics = new Set<string>(QUESTION_TOPICS);
    dbQuestions.forEach(question => {
      if (question.topic) topics.add(question.topic);
    });
    return ["All", ...Array.from(topics).sort((a, b) => a.localeCompare(b))];
  }, [dbQuestions]);

  const availableResourceCategories = useMemo(() => {
    const categories = new Set<string>(RESOURCE_CATEGORIES);
    dbResources.forEach(resource => {
      if (resource.category) categories.add(resource.category);
    });
    return ["All", ...Array.from(categories).sort((a, b) => a.localeCompare(b))];
  }, [dbResources]);

  const availableUpdateStates = useMemo(() => {
    const states = new Set<string>(["All"]);
    dbUpdates.forEach(update => {
      if (update.state) states.add(update.state);
    });
    return Array.from(states).sort((a, b) => a.localeCompare(b));
  }, [dbUpdates]);

  const questionImportPreview: { rows: ImportedQuestionPayload[]; error: string | null } = useMemo(() => {
    if (!questionImportInput.trim()) {
      return { rows: [] as ImportedQuestionPayload[], error: null as string | null };
    }

    try {
      return { rows: parseBulkQuestionInput(questionImportInput), error: null };
    } catch (error) {
      return {
        rows: [] as ImportedQuestionPayload[],
        error: error instanceof Error ? error.message : "Could not parse import.",
      };
    }
  }, [questionImportInput]);

  const resourceImportPreview: { rows: ImportedResourcePayload[]; error: string | null } = useMemo(() => {
    if (!resourceImportInput.trim()) {
      return { rows: [] as ImportedResourcePayload[], error: null as string | null };
    }

    try {
      return { rows: parseBulkResourceInput(resourceImportInput), error: null };
    } catch (error) {
      return {
        rows: [] as ImportedResourcePayload[],
        error: error instanceof Error ? error.message : "Could not parse import.",
      };
    }
  }, [resourceImportInput]);

  const updateImportPreview: { rows: ImportedUpdatePayload[]; error: string | null } = useMemo(() => {
    if (!updateImportInput.trim()) {
      return { rows: [] as ImportedUpdatePayload[], error: null as string | null };
    }

    try {
      return { rows: parseBulkUpdateInput(updateImportInput), error: null };
    } catch (error) {
      return {
        rows: [] as ImportedUpdatePayload[],
        error: error instanceof Error ? error.message : "Could not parse import.",
      };
    }
  }, [updateImportInput]);

  const filteredQuestions = useMemo(() => {
    const query = questionSearch.trim().toLowerCase();

    return dbQuestions.filter(question => {
      if (questionExamFilter !== "All" && question.exam !== questionExamFilter) return false;
      if (questionTopicFilter !== "All" && question.topic !== questionTopicFilter) return false;
      if (questionTypeFilter !== "All" && question.type !== questionTypeFilter) return false;
      if (questionDifficultyFilter !== "All" && question.difficulty !== questionDifficultyFilter) return false;
      if (questionStatusFilter === "Active" && !question.is_active) return false;
      if (questionStatusFilter === "Inactive" && question.is_active) return false;

      if (!query) return true;

      return [
        question.question,
        question.explanation,
        question.topic,
        question.subtopic,
        question.exam,
        question.type,
        question.difficulty,
        String(question.year ?? ""),
        tagText(question.tags),
      ]
        .join(" ")
        .toLowerCase()
        .includes(query);
    });
  }, [
    dbQuestions,
    questionDifficultyFilter,
    questionExamFilter,
    questionSearch,
    questionStatusFilter,
    questionTopicFilter,
    questionTypeFilter,
  ]);

  const filteredResources = useMemo(() => {
    const query = resourceSearch.trim().toLowerCase();

    return dbResources.filter(resource => {
      const exam = resource.exam?.trim() || "All";
      const type = resource.type?.trim() || "Link";
      const category = resource.category?.trim() || "General";
      const active = resource.is_active !== false;

      if (resourceExamFilter !== "All" && exam !== resourceExamFilter) return false;
      if (resourceTypeFilter !== "All" && type !== resourceTypeFilter) return false;
      if (resourceCategoryFilter !== "All" && category !== resourceCategoryFilter) return false;
      if (resourceStatusFilter === "Active" && !active) return false;
      if (resourceStatusFilter === "Inactive" && active) return false;

      if (!query) return true;

      return [
        resource.title,
        resource.description,
        resource.url,
        exam,
        type,
        category,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query);
    });
  }, [
    dbResources,
    resourceCategoryFilter,
    resourceExamFilter,
    resourceSearch,
    resourceStatusFilter,
    resourceTypeFilter,
  ]);

  const filteredUpdates = useMemo(() => {
    const query = updateSearch.trim().toLowerCase();

    return dbUpdates.filter(update => {
      const active = update.is_active !== false;
      const timeline = adminUpdateTimeline(update);

      if (updateStateFilter !== "All" && update.state !== updateStateFilter) return false;
      if (updateExamTypeFilter !== "All" && update.exam_type !== updateExamTypeFilter) return false;
      if (updateQualificationFilter !== "All" && update.qualification !== updateQualificationFilter) return false;
      if (updateStatusFilter === "Active" && !active) return false;
      if (updateStatusFilter === "Inactive" && active) return false;
      if (updateTimelineFilter !== "All" && timeline !== updateTimelineFilter) return false;

      if (!query) return true;

      return [
        update.title,
        update.organization,
        update.state,
        update.exam_type,
        update.qualification,
        update.eligibility,
        update.summary,
        update.apply_url,
        update.notice_url,
        tagText(update.tags),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query);
    });
  }, [
    dbUpdates,
    updateExamTypeFilter,
    updateQualificationFilter,
    updateSearch,
    updateStateFilter,
    updateStatusFilter,
    updateTimelineFilter,
  ]);

  const filteredSupportRequests = useMemo(() => {
    const query = supportSearch.trim().toLowerCase();
    if (!query) return supportRequests;

    return supportRequests.filter(request =>
      [
        request.email,
        request.category,
        request.subject,
        request.message,
        request.source,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query)
      );
  }, [supportRequests, supportSearch]);

  const supportStats = useMemo(() => {
    const open = supportRequests.filter(request => (request.status || "open") === "open").length;
    const inProgress = supportRequests.filter(
      request => (request.status || "open") === "in_progress"
    ).length;
    const resolved = supportRequests.filter(
      request => (request.status || "open") === "resolved"
    ).length;

    return {
      total: supportRequests.length,
      open,
      inProgress,
      resolved,
    };
  }, [supportRequests]);

  const supportRepliesByRequestId = useMemo(() => {
    return supportReplies.reduce<Record<string, SupportReply[]>>((acc, reply) => {
      const key = reply.support_request_id;
      acc[key] = acc[key] || [];
      acc[key].push(reply);
      return acc;
    }, {});
  }, [supportReplies]);

  const selectedSupportRequest = useMemo(() => {
    if (!filteredSupportRequests.length) return null;

    return (
      filteredSupportRequests.find(request => toId(request.id) === selectedSupportId) ||
      filteredSupportRequests[0]
    );
  }, [filteredSupportRequests, selectedSupportId]);

  useEffect(() => {
    if (!filteredSupportRequests.length) {
      if (selectedSupportId !== null) setSelectedSupportId(null);
      return;
    }

    const hasCurrent = filteredSupportRequests.some(
      request => toId(request.id) === selectedSupportId
    );

    if (!hasCurrent) {
      setSelectedSupportId(toId(filteredSupportRequests[0].id));
    }
  }, [filteredSupportRequests, selectedSupportId]);

  const questionStats = useMemo(() => summarizeQuestionBank(dbQuestions), [dbQuestions]);

  const questionSummaryCards = useMemo(
    () => [
      {
        label: "Total Questions",
        value: questionStats.total,
        hint: "Full bank size across all supported exams.",
        icon: Database,
        tone: "slate" as const,
      },
      {
        label: "Active Questions",
        value: questionStats.active,
        hint: "Currently enabled in the question bank.",
        icon: CheckCircle2,
        tone: "green" as const,
      },
      {
        label: "PYQs",
        value: questionStats.pyq,
        hint: "Previous-year questions across the full bank.",
        icon: ShieldCheck,
        tone: "blue" as const,
      },
      {
        label: "UPSC Rows",
        value: questionStats.examCounts.UPSC,
        hint: "UPSC-tagged rows in dbQuestions.",
        icon: BookOpen,
        tone: "orange" as const,
      },
      {
        label: "TSPSC Rows",
        value: questionStats.examCounts.TSPSC,
        hint: "TSPSC-tagged rows in dbQuestions.",
        icon: BookOpen,
        tone: "rose" as const,
      },
      {
        label: "APPSC Rows",
        value: questionStats.examCounts.APPSC,
        hint: "APPSC-tagged rows in dbQuestions.",
        icon: BookOpen,
        tone: "green" as const,
      },
      {
        label: "SSC Rows",
        value: questionStats.examCounts.SSC,
        hint: "SSC-tagged rows in dbQuestions.",
        icon: BookOpen,
        tone: "blue" as const,
      },
      {
        label: "RRB Rows",
        value: questionStats.examCounts.RRB,
        hint: "RRB-tagged rows in dbQuestions.",
        icon: BookOpen,
        tone: "slate" as const,
      },
      {
        label: "IBPS Rows",
        value: questionStats.examCounts.IBPS,
        hint: "IBPS-tagged rows in dbQuestions.",
        icon: BookOpen,
        tone: "orange" as const,
      },
    ],
    [questionStats]
  );

  const resourceStats = useMemo(() => {
    const active = dbResources.filter(resource => resource.is_active !== false).length;
    return {
      total: dbResources.length,
      active,
      inactive: dbResources.length - active,
    };
  }, [dbResources]);

  const updateStats = useMemo(() => {
    const active = dbUpdates.filter(update => update.is_active !== false);
    const open = active.filter(update => adminUpdateTimeline(update) === "Open").length;
    const upcoming = active.filter(update => adminUpdateTimeline(update) === "Upcoming").length;
    const closingSoon = active.filter(update => adminUpdateTimeline(update) === "Closing Soon").length;

    return {
      total: dbUpdates.length,
      active: active.length,
      inactive: dbUpdates.length - active.length,
      open,
      upcoming,
      closingSoon,
    };
  }, [dbUpdates]);

  const todayAnalytics = analyticsDaily[0] || null;
  const currentMonthAnalytics = analyticsMonthly[0] || null;
  const currentYearAnalytics = analyticsYearly[0] || null;
  const topPage = analyticsTopPages[0] || null;
  const averagePageViewsPerVisitor =
    (todayAnalytics?.visitors || 0) > 0
      ? (todayAnalytics?.page_views || 0) / (todayAnalytics?.visitors || 1)
      : 0;
  const engagementSummary = todayAnalytics?.avg_engaged_seconds
    ? `People are staying about ${formatDurationLabel(
        todayAnalytics.avg_engaged_seconds
      )} on average before leaving or switching tabs.`
    : "Engaged time will fill in as more people stay on a page and then switch tabs or close it.";
  const trafficSummary = topPage
    ? `${topPage.path || "/"} is the strongest page right now with ${formatNumber(
        topPage.page_views
      )} views and ${formatDurationLabel(topPage.avg_engaged_seconds)} average engaged time.`
    : "Top-page signals will appear here once traffic starts flowing through the app.";

  const visibleQuestionIds = filteredQuestions.map(question => toId(question.id));
  const visibleResourceIds = filteredResources.map(resource => toId(resource.id));
  const visibleUpdateIds = filteredUpdates.map(update => toId(update.id));
  const allVisibleQuestionsSelected =
    visibleQuestionIds.length > 0 &&
    visibleQuestionIds.every(id => selectedQuestionIds.includes(id));
  const allVisibleResourcesSelected =
    visibleResourceIds.length > 0 &&
    visibleResourceIds.every(id => selectedResourceIds.includes(id));
  const allVisibleUpdatesSelected =
    visibleUpdateIds.length > 0 &&
    visibleUpdateIds.every(id => selectedUpdateIds.includes(id));
  const activeTabMeta = ADMIN_TAB_META[activeTab];
  const tabCounts: Record<AdminTab, number> = {
    analytics: todayAnalytics?.visitors || 0,
    questions: dbQuestions.length,
    resources: dbResources.length,
    updates: dbUpdates.length,
    contests: dbContests.length,
    support: supportRequests.length,
  };

  const resetQuestionForm = () => {
    setQuestionForm({ ...EMPTY_Q });
    setEditingQuestionId(null);
    setShowQuestionForm(false);
  };

  const resetResourceForm = () => {
    setResourceForm({ ...EMPTY_R });
    setEditingResourceId(null);
    setShowResourceForm(false);
  };

  const resetUpdateForm = () => {
    setUpdateForm({ ...EMPTY_U });
    setEditingUpdateId(null);
    setShowUpdateForm(false);
  };

  const resetContestForm = () => {
    setContestForm({ ...EMPTY_C });
    setEditingContestId(null);
    setShowContestForm(false);
  };

  const openNewQuestionForm = () => {
    setQuestionForm({ ...EMPTY_Q });
    setEditingQuestionId(null);
    setShowQuestionForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const startEditQuestion = (question: QuestionRecord) => {
    setQuestionForm({
      question: question.question,
      option_a: question.option_a,
      option_b: question.option_b,
      option_c: question.option_c,
      option_d: question.option_d,
      correct_option: question.correct_option,
      explanation: question.explanation,
      exam: question.exam,
      topic: question.topic,
      subtopic: question.subtopic,
      difficulty: question.difficulty,
      type: question.type,
      year: question.year ? String(question.year) : "",
      tags: tagText(question.tags),
      is_active: question.is_active,
    });
    setEditingQuestionId(toId(question.id));
    setShowQuestionForm(true);
    setShowQuestionImport(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openNewResourceForm = () => {
    setResourceForm({ ...EMPTY_R });
    setEditingResourceId(null);
    setShowResourceForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const startEditResource = (resource: ResourceRecord) => {
    setResourceForm({
      title: resource.title,
      description: resource.description?.trim() || "",
      type: (resource.type?.trim() as ResourceType) || "Link",
      url: resource.url,
      exam: (resource.exam?.trim() as ResourceExam) || "All",
      category: (resource.category?.trim() as ResourceCategory) || "General",
      is_active: resource.is_active !== false,
    });
    setEditingResourceId(toId(resource.id));
    setShowResourceForm(true);
    setShowResourceImport(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openNewUpdateForm = () => {
    setUpdateForm({ ...EMPTY_U });
    setEditingUpdateId(null);
    setShowUpdateForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const startEditUpdate = (update: UpdateRecord) => {
    setUpdateForm({
      title: update.title,
      organization: update.organization,
      exam_type: update.exam_type,
      state: update.state,
      qualification: update.qualification,
      eligibility: update.eligibility,
      application_start: update.application_start,
      last_date: update.last_date,
      exam_window: update.exam_window,
      updated_at: update.updated_at,
      summary: update.summary,
      tags: tagText(update.tags),
      apply_url: update.apply_url,
      notice_url: update.notice_url,
      is_active: update.is_active !== false,
    });
    setEditingUpdateId(toId(update.id));
    setShowUpdateForm(true);
    setShowUpdateImport(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const startEditContest = (contest: ContestRecord) => {
    setContestForm({
      name: contest.name,
      date: contest.date,
      duration: contest.duration,
      topics: contest.topics,
      prize: contest.prize,
      status: contest.status,
      winner: contest.winner || "",
      your_rank: contest.your_rank ? String(contest.your_rank) : "",
    });
    setEditingContestId(toId(contest.id));
    setShowContestForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const saveQuestion = async () => {
    if (
      !questionForm.question ||
      !questionForm.option_a ||
      !questionForm.option_b ||
      !questionForm.option_c ||
      !questionForm.option_d ||
      !questionForm.explanation
    ) {
      showToast("Fill all required question fields.", false);
      return;
    }

    setBusy("save-question");

    try {
      const payload: ImportedQuestionPayload = {
        question: questionForm.question.trim(),
        option_a: questionForm.option_a.trim(),
        option_b: questionForm.option_b.trim(),
        option_c: questionForm.option_c.trim(),
        option_d: questionForm.option_d.trim(),
        correct_option: Number(questionForm.correct_option),
        explanation: questionForm.explanation.trim(),
        exam: questionForm.exam,
        topic: questionForm.topic.trim(),
        subtopic: questionForm.subtopic.trim(),
        difficulty: questionForm.difficulty,
        type: questionForm.type,
        year: questionForm.year ? Number(questionForm.year) : null,
        tags: questionForm.tags
          .split(/[|,]/)
          .map(tag => tag.trim())
          .filter(Boolean),
        is_active: questionForm.is_active,
      };

      const query = editingQuestionId
        ? supabase.from("questions_db").update(payload).eq("id", editingQuestionId)
        : supabase.from("questions_db").insert(payload);

      const { error } = await query;
      if (error) throw error;

      await loadQuestions();
      resetQuestionForm();
      showToast(editingQuestionId ? "Question updated." : "Question saved.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not save question.";
      showToast(message, false);
    } finally {
      setBusy(null);
    }
  };

  const saveResource = async () => {
    if (!resourceForm.title || !resourceForm.url) {
      showToast("Title and URL are required.", false);
      return;
    }

    setBusy("save-resource");

    try {
      const payload = {
        title: resourceForm.title.trim(),
        description: resourceForm.description.trim() || null,
        type: resourceForm.type,
        url: resourceForm.url.trim(),
        exam: resourceForm.exam,
        category: resourceForm.category,
        is_active: resourceForm.is_active,
      };

      const query = editingResourceId
        ? supabase.from("resources").update(payload).eq("id", editingResourceId)
        : supabase.from("resources").insert(payload);

      const { error } = await query;
      if (error) throw error;

      clearPublicCache(RESOURCES_PUBLIC_CACHE_KEY);
      await loadResources();
      resetResourceForm();
      showToast(editingResourceId ? "Resource updated." : "Resource saved.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not save resource.";
      showToast(message, false);
    } finally {
      setBusy(null);
    }
  };

  const saveUpdate = async () => {
    if (
      !updateForm.title ||
      !updateForm.organization ||
      !updateForm.state ||
      !updateForm.eligibility ||
      !updateForm.application_start ||
      !updateForm.last_date ||
      !updateForm.exam_window ||
      !updateForm.summary ||
      !updateForm.apply_url ||
      !updateForm.notice_url
    ) {
      showToast("Fill all required update fields.", false);
      return;
    }

    setBusy("save-update");

    try {
      const payload: ImportedUpdatePayload = {
        title: updateForm.title.trim(),
        organization: updateForm.organization.trim(),
        exam_type: updateForm.exam_type,
        state: updateForm.state.trim(),
        qualification: updateForm.qualification,
        eligibility: updateForm.eligibility.trim(),
        application_start: updateForm.application_start,
        last_date: updateForm.last_date,
        exam_window: updateForm.exam_window.trim(),
        updated_at: updateForm.updated_at,
        summary: updateForm.summary.trim(),
        tags: updateForm.tags
          .split(/[|,]/)
          .map(tag => tag.trim())
          .filter(Boolean),
        apply_url: updateForm.apply_url.trim(),
        notice_url: updateForm.notice_url.trim(),
        is_active: updateForm.is_active,
      };

      const query = editingUpdateId
        ? supabase.from("updates").update(payload).eq("id", editingUpdateId)
        : supabase.from("updates").insert(payload);

      const { error } = await query;
      if (error) throw error;

      await loadUpdates();
      resetUpdateForm();
      showToast(editingUpdateId ? "Update entry saved." : "Update entry created.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not save update entry.";
      showToast(message, false);
    } finally {
      setBusy(null);
    }
  };

  const saveContest = async () => {
    if (!contestForm.name || !contestForm.date || !contestForm.topics || !contestForm.prize) {
      showToast("Fill all required contest fields.", false);
      return;
    }

    setBusy("save-contest");

    try {
      const payload = {
        ...contestForm,
        your_rank: contestForm.your_rank ? Number(contestForm.your_rank) : null,
        winner: contestForm.winner.trim() || null,
      };

      const query = editingContestId
        ? supabase.from("contests").update(payload).eq("id", editingContestId)
        : supabase.from("contests").insert(payload);

      const { error } = await query;
      if (error) throw error;

      await loadContests();
      resetContestForm();
      showToast(editingContestId ? "Contest updated." : "Contest saved.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not save contest.";
      showToast(message, false);
    } finally {
      setBusy(null);
    }
  };

  const clearQuestionImportState = () => {
    setQuestionImportInput("");
    setQuestionImportSource("");
  };

  const importQuestions = async () => {
    if (questionImportPreview.error) {
      showToast(questionImportPreview.error, false);
      return;
    }

    if (questionImportPreview.rows.length === 0) {
      showToast("Paste or upload questions first.", false);
      return;
    }

    setBusy("import-questions");

    try {
      for (const batch of chunkQuestions(questionImportPreview.rows)) {
        const { error } = await supabase.from("questions_db").insert(batch);
        if (error) throw error;
      }

      await loadQuestions();
      clearQuestionImportState();
      setSelectedQuestionIds([]);
      showToast(`${questionImportPreview.rows.length} questions imported.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not import questions.";
      showToast(message, false);
    } finally {
      setBusy(null);
    }
  };

  const importResources = async () => {
    if (resourceImportPreview.error) {
      showToast(resourceImportPreview.error, false);
      return;
    }

    if (resourceImportPreview.rows.length === 0) {
      showToast("Paste or upload resources first.", false);
      return;
    }

    setBusy("import-resources");

    try {
      for (const batch of chunkItems(resourceImportPreview.rows, 200)) {
        const { error } = await supabase.from("resources").insert(batch);
        if (error) throw error;
      }

      clearPublicCache(RESOURCES_PUBLIC_CACHE_KEY);
      await loadResources();
      setResourceImportInput("");
      setResourceImportSource("");
      setSelectedResourceIds([]);
      showToast(`${resourceImportPreview.rows.length} resources imported.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not import resources.";
      showToast(message, false);
    } finally {
      setBusy(null);
    }
  };

  const importUpdates = async () => {
    if (updateImportPreview.error) {
      showToast(updateImportPreview.error, false);
      return;
    }

    if (updateImportPreview.rows.length === 0) {
      showToast("Paste or upload updates first.", false);
      return;
    }

    setBusy("import-updates");

    try {
      for (const batch of chunkItems(updateImportPreview.rows, 200)) {
        const { error } = await supabase.from("updates").insert(batch);
        if (error) throw error;
      }

      await loadUpdates();
      setUpdateImportInput("");
      setUpdateImportSource("");
      setSelectedUpdateIds([]);
      showToast(`${updateImportPreview.rows.length} updates imported.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not import updates.";
      showToast(message, false);
    } finally {
      setBusy(null);
    }
  };

  const updateQuestionsActiveState = async (ids: string[], isActive: boolean) => {
    if (ids.length === 0) {
      showToast("Select questions first.", false);
      return;
    }

    setBusy(isActive ? "activate-questions" : "deactivate-questions");

    try {
      for (const batch of chunkItems(ids, 200)) {
        const { error } = await supabase.from("questions_db").update({ is_active: isActive }).in("id", batch);
        if (error) throw error;
      }

      await loadQuestions();
      setSelectedQuestionIds(current => current.filter(id => !ids.includes(id)));
      showToast(isActive ? "Selected questions activated." : "Selected questions deactivated.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not update selected questions.";
      showToast(message, false);
    } finally {
      setBusy(null);
    }
  };

  const deleteQuestions = async (ids: string[]) => {
    if (ids.length === 0) {
      showToast("Select questions first.", false);
      return;
    }

    if (!window.confirm(`Delete ${ids.length} question${ids.length === 1 ? "" : "s"} permanently?`)) {
      return;
    }

    setBusy("delete-questions");

    try {
      for (const batch of chunkItems(ids, 200)) {
        const { error } = await supabase.from("questions_db").delete().in("id", batch);
        if (error) throw error;
      }

      await loadQuestions();
      setSelectedQuestionIds(current => current.filter(id => !ids.includes(id)));
      showToast(`${ids.length} question${ids.length === 1 ? "" : "s"} deleted.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not delete selected questions.";
      showToast(message, false);
    } finally {
      setBusy(null);
    }
  };

  const updateResourcesActiveState = async (ids: string[], isActive: boolean) => {
    if (ids.length === 0) {
      showToast("Select resources first.", false);
      return;
    }

    setBusy(isActive ? "activate-resources" : "deactivate-resources");

    try {
      for (const batch of chunkItems(ids, 200)) {
        const { error } = await supabase.from("resources").update({ is_active: isActive }).in("id", batch);
        if (error) throw error;
      }

      clearPublicCache(RESOURCES_PUBLIC_CACHE_KEY);
      await loadResources();
      setSelectedResourceIds(current => current.filter(id => !ids.includes(id)));
      showToast(isActive ? "Selected resources activated." : "Selected resources deactivated.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not update selected resources.";
      showToast(message, false);
    } finally {
      setBusy(null);
    }
  };

  const deleteResources = async (ids: string[]) => {
    if (ids.length === 0) {
      showToast("Select resources first.", false);
      return;
    }

    if (!window.confirm(`Delete ${ids.length} resource${ids.length === 1 ? "" : "s"} permanently?`)) {
      return;
    }

    setBusy("delete-resources");

    try {
      for (const batch of chunkItems(ids, 200)) {
        const { error } = await supabase.from("resources").delete().in("id", batch);
        if (error) throw error;
      }

      clearPublicCache(RESOURCES_PUBLIC_CACHE_KEY);
      await loadResources();
      setSelectedResourceIds(current => current.filter(id => !ids.includes(id)));
      showToast(`${ids.length} resource${ids.length === 1 ? "" : "s"} deleted.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not delete selected resources.";
      showToast(message, false);
    } finally {
      setBusy(null);
    }
  };

  const updateUpdatesActiveState = async (ids: string[], isActive: boolean) => {
    if (ids.length === 0) {
      showToast("Select updates first.", false);
      return;
    }

    setBusy(isActive ? "activate-updates" : "deactivate-updates");

    try {
      for (const batch of chunkItems(ids, 200)) {
        const { error } = await supabase.from("updates").update({ is_active: isActive }).in("id", batch);
        if (error) throw error;
      }

      await loadUpdates();
      setSelectedUpdateIds(current => current.filter(id => !ids.includes(id)));
      showToast(isActive ? "Selected updates activated." : "Selected updates deactivated.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not update selected updates.";
      showToast(message, false);
    } finally {
      setBusy(null);
    }
  };

  const deleteUpdates = async (ids: string[]) => {
    if (ids.length === 0) {
      showToast("Select updates first.", false);
      return;
    }

    if (!window.confirm(`Delete ${ids.length} update row${ids.length === 1 ? "" : "s"} permanently?`)) {
      return;
    }

    setBusy("delete-updates");

    try {
      for (const batch of chunkItems(ids, 200)) {
        const { error } = await supabase.from("updates").delete().in("id", batch);
        if (error) throw error;
      }

      await loadUpdates();
      setSelectedUpdateIds(current => current.filter(id => !ids.includes(id)));
      showToast(`${ids.length} update row${ids.length === 1 ? "" : "s"} deleted.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not delete selected updates.";
      showToast(message, false);
    } finally {
      setBusy(null);
    }
  };

  const deleteContest = async (id: string) => {
    if (!window.confirm("Delete this contest?")) return;

    setBusy("delete-contest");

    try {
      const { error } = await supabase.from("contests").delete().eq("id", id);
      if (error) throw error;

      await loadContests();
      showToast("Contest deleted.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not delete contest.";
      showToast(message, false);
    } finally {
      setBusy(null);
    }
  };

  const toggleQuestionSelection = (id: string) => {
    setSelectedQuestionIds(current =>
      current.includes(id) ? current.filter(item => item !== id) : [...current, id]
    );
  };

  const toggleResourceSelection = (id: string) => {
    setSelectedResourceIds(current =>
      current.includes(id) ? current.filter(item => item !== id) : [...current, id]
    );
  };

  const toggleUpdateSelection = (id: string) => {
    setSelectedUpdateIds(current =>
      current.includes(id) ? current.filter(item => item !== id) : [...current, id]
    );
  };

  const toggleSelectVisibleQuestions = () => {
    setSelectedQuestionIds(current => {
      if (allVisibleQuestionsSelected) {
        return current.filter(id => !visibleQuestionIds.includes(id));
      }

      return Array.from(new Set([...current, ...visibleQuestionIds]));
    });
  };

  const toggleSelectVisibleResources = () => {
    setSelectedResourceIds(current => {
      if (allVisibleResourcesSelected) {
        return current.filter(id => !visibleResourceIds.includes(id));
      }

      return Array.from(new Set([...current, ...visibleResourceIds]));
    });
  };

  const toggleSelectVisibleUpdates = () => {
    setSelectedUpdateIds(current => {
      if (allVisibleUpdatesSelected) {
        return current.filter(id => !visibleUpdateIds.includes(id));
      }

      return Array.from(new Set([...current, ...visibleUpdateIds]));
    });
  };

  const exportFilteredQuestions = () => {
    downloadCsv(
      "prepbros-questions-export.csv",
      [
        "question",
        "option_a",
        "option_b",
        "option_c",
        "option_d",
        "correct_option",
        "explanation",
        "exam",
        "topic",
        "subtopic",
        "difficulty",
        "type",
        "year",
        "tags",
        "is_active",
      ],
      filteredQuestions.map(question => ({
        question: question.question,
        option_a: question.option_a,
        option_b: question.option_b,
        option_c: question.option_c,
        option_d: question.option_d,
        correct_option: question.correct_option,
        explanation: question.explanation,
        exam: question.exam,
        topic: question.topic,
        subtopic: question.subtopic,
        difficulty: question.difficulty,
        type: question.type,
        year: question.year ?? "",
        tags: question.tags,
        is_active: question.is_active,
      }))
    );
    showToast(`${filteredQuestions.length} questions exported.`);
  };

  const exportFilteredResources = () => {
    downloadCsv(
      "prepbros-resources-export.csv",
      ["title", "description", "type", "url", "exam", "category", "is_active"],
      filteredResources.map(resource => ({
        title: resource.title,
        description: resource.description || "",
        type: resource.type || "Link",
        url: resource.url,
        exam: resource.exam || "All",
        category: resource.category || "General",
        is_active: resource.is_active !== false,
      }))
    );
    showToast(`${filteredResources.length} resources exported.`);
  };

  const exportFilteredUpdates = () => {
    downloadCsv(
      "prepbros-updates-export.csv",
      [
        "title",
        "organization",
        "exam_type",
        "state",
        "qualification",
        "eligibility",
        "application_start",
        "last_date",
        "exam_window",
        "updated_at",
        "summary",
        "tags",
        "apply_url",
        "notice_url",
        "is_active",
      ],
      filteredUpdates.map(update => ({
        title: update.title,
        organization: update.organization,
        exam_type: update.exam_type,
        state: update.state,
        qualification: update.qualification,
        eligibility: update.eligibility,
        application_start: update.application_start,
        last_date: update.last_date,
        exam_window: update.exam_window,
        updated_at: update.updated_at,
        summary: update.summary,
        tags: update.tags || [],
        apply_url: update.apply_url,
        notice_url: update.notice_url,
        is_active: update.is_active !== false,
      }))
    );
    showToast(`${filteredUpdates.length} updates exported.`);
  };

  const handleQuestionFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      setQuestionImportInput(text);
      setQuestionImportSource(file.name);
      setShowQuestionImport(true);
      showToast(`Loaded ${file.name}`);
    } catch {
      showToast("Could not read the selected file.", false);
    } finally {
      event.target.value = "";
    }
  };

  const handleResourceFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      setResourceImportInput(text);
      setResourceImportSource(file.name);
      setShowResourceImport(true);
      showToast(`Loaded ${file.name}`);
    } catch {
      showToast("Could not read the selected file.", false);
    } finally {
      event.target.value = "";
    }
  };

  const handleUpdateFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      setUpdateImportInput(text);
      setUpdateImportSource(file.name);
      setShowUpdateImport(true);
      showToast(`Loaded ${file.name}`);
    } catch {
      showToast("Could not read the selected file.", false);
    } finally {
      event.target.value = "";
    }
  };

  const openReplyDialog = (request: SupportRequest) => {
    setReplyTarget(request);
    setReplySubject(buildSupportReplySubject(request));
    setReplyMessage(buildSupportReplyMessage(request));
  };

  const closeReplyDialog = () => {
    if (sendingReply) return;
    setReplyTarget(null);
    setReplySubject("");
    setReplyMessage("");
  };

  const sendSupportReply = async () => {
    if (!replyTarget) return;
    if (!session?.access_token) {
      showToast("Please sign in again before sending a reply.", false);
      return;
    }

    if (!replySubject.trim() || !replyMessage.trim()) {
      showToast("Add a subject and reply message first.", false);
      return;
    }

    setSendingReply(true);

    try {
      const response = await fetch("/api/support-reply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          to: replyTarget.email,
          subject: replySubject,
          message: replyMessage,
          requestId: toId(replyTarget.id),
        }),
      });

      const payload = (await response.json().catch(() => null)) as
        | { ok?: boolean; message?: string }
        | null;

      if (!response.ok || !payload?.ok) {
        throw new Error(payload?.message || "Could not send reply.");
      }

      showToast(payload.message || "Reply sent.");
      await Promise.all([loadSupportRequests(), loadSupportReplies()]);
      closeReplyDialog();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not send reply.";
      showToast(message, false);
    } finally {
      setSendingReply(false);
    }
  };

  const updateSupportStatus = async (
    requestId: string,
    status: "open" | "in_progress" | "resolved"
  ) => {
    try {
      const { error } = await supabase
        .from("support_requests")
        .update({ status })
        .eq("id", requestId);

      if (error) throw error;

      setSupportRequests((current) =>
        current.map((request) =>
          toId(request.id) === requestId ? { ...request, status } : request
        )
      );
      showToast(`Support status updated to ${status.replace("_", " ")}.`);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not update support status.";
      showToast(message, false);
    }
  };

  if (authLoading || booting) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--page-background)]">
        <div className="inline-flex items-center gap-3 rounded-[14px] border border-[var(--border)] bg-[var(--surface-1)] px-5 py-3 text-sm text-[var(--text-secondary)] shadow-[var(--shadow-sm)]">
          <Loader2 size={16} className="animate-spin" />
          Preparing admin workspace...
        </div>
      </div>
    );
  }

  if (!user || user.email !== ADMIN_EMAIL) return null;

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f7f7f6_0%,#f1f3f5_100%)] text-[#111827]">
      {toast ? (
        <div
          className={cn(
            "fixed right-4 top-4 z-50 flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium shadow-[0_18px_48px_rgba(15,23,42,0.18)]",
            toast?.ok ? "bg-[#111827] text-white" : "bg-[#9c4451] text-white"
          )}
        >
          {toast?.ok ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
          {toast?.msg}
        </div>
      ) : null}

      <Dialog open={Boolean(replyTarget)} onOpenChange={(open) => (open ? null : closeReplyDialog())}>
        <DialogContent className="max-w-2xl border border-[#d7dde5] bg-[#fbfcfd]">
          <DialogHeader>
            <DialogTitle>Reply To Support Request</DialogTitle>
            <DialogDescription>
              Send a direct reply from the admin panel using your verified PrepBros support domain.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#344054]">To</label>
              <input
                value={replyTarget?.email || ""}
                readOnly
                className={cn(adminInputClass, "bg-[#f7f8fa] text-[#667085]")}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-[#344054]">Subject</label>
              <input
                value={replySubject}
                onChange={(event) => setReplySubject(event.target.value)}
                className={adminInputClass}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-[#344054]">Reply</label>
              <textarea
                value={replyMessage}
                onChange={(event) => setReplyMessage(event.target.value)}
                rows={10}
                className={adminTextAreaClass}
              />
            </div>
          </div>

          <DialogFooter>
            <SmallButton onClick={closeReplyDialog} disabled={sendingReply}>
              Cancel
            </SmallButton>
            <SmallButton icon={Send} tone="primary" onClick={() => void sendSupportReply()} disabled={sendingReply}>
              {sendingReply ? "Sending..." : "Send Reply"}
            </SmallButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AdminConsole
        user={{ ...user, email: user?.email || "" }}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeTabMeta={activeTabMeta}
        tabCounts={tabCounts}
        loadingTarget={loadingTarget}
        loadAll={loadAll}
        signOut={signOut}
        adminTabs={ADMIN_TABS}
        adminTabMeta={ADMIN_TAB_META}
        questionStats={questionStats}
        questionSummaryCards={questionSummaryCards}
        resourceStats={resourceStats}
        updateStats={updateStats}
        supportStats={supportStats}
        todayAnalytics={todayAnalytics}
        currentMonthAnalytics={currentMonthAnalytics}
        currentYearAnalytics={currentYearAnalytics}
        averagePageViewsPerVisitor={averagePageViewsPerVisitor}
        trafficSummary={trafficSummary}
        engagementSummary={engagementSummary}
        analyticsDaily={analyticsDaily}
        analyticsTopPages={analyticsTopPages}
        formatNumber={formatNumber}
        formatPercent={formatPercent}
        formatDate={formatDate}
        formatDurationLabel={formatDurationLabel}
        formatShortDateLabel={formatShortDateLabel}
        formatMonthLabel={formatMonthLabel}
        formatYearLabel={formatYearLabel}
        growthTone={growthTone}
        describeGrowth={describeGrowth}
        adminUpdateTimeline={adminUpdateTimeline}
        questionSearch={questionSearch}
        setQuestionSearch={setQuestionSearch}
        questionExamFilter={questionExamFilter}
        setQuestionExamFilter={setQuestionExamFilter}
        questionTopicFilter={questionTopicFilter}
        setQuestionTopicFilter={setQuestionTopicFilter}
        questionTypeFilter={questionTypeFilter}
        setQuestionTypeFilter={setQuestionTypeFilter}
        questionDifficultyFilter={questionDifficultyFilter}
        setQuestionDifficultyFilter={setQuestionDifficultyFilter}
        questionStatusFilter={questionStatusFilter}
        setQuestionStatusFilter={setQuestionStatusFilter}
        availableQuestionTopics={availableQuestionTopics}
        filteredQuestions={filteredQuestions}
        selectedQuestionIds={selectedQuestionIds}
        allVisibleQuestionsSelected={allVisibleQuestionsSelected}
        toggleSelectVisibleQuestions={toggleSelectVisibleQuestions}
        updateQuestionsActiveState={updateQuestionsActiveState}
        deleteQuestions={deleteQuestions}
        exportFilteredQuestions={exportFilteredQuestions}
        showQuestionImport={showQuestionImport}
        setShowQuestionImport={setShowQuestionImport}
        openNewQuestionForm={openNewQuestionForm}
        questionFileInputRef={questionFileInputRef}
        handleQuestionFileUpload={handleQuestionFileUpload}
        questionImportInput={questionImportInput}
        setQuestionImportInput={setQuestionImportInput}
        questionImportPreview={questionImportPreview}
        importQuestions={importQuestions}
        clearQuestionImportState={clearQuestionImportState}
        questionImportSource={questionImportSource}
        bulkImportTemplate={BULK_IMPORT_TEMPLATE}
        showQuestionForm={showQuestionForm}
        editingQuestionId={editingQuestionId}
        resetQuestionForm={resetQuestionForm}
        questionForm={questionForm}
        setQuestionForm={setQuestionForm}
        saveQuestion={saveQuestion}
        startEditQuestion={startEditQuestion}
        toggleQuestionSelection={toggleQuestionSelection}
        filterExams={FILTER_EXAMS}
        questionExams={QUESTION_EXAMS}
        questionTypes={QUESTION_TYPES}
        difficulties={DIFFICULTIES}
        resourceSearch={resourceSearch}
        setResourceSearch={setResourceSearch}
        resourceExamFilter={resourceExamFilter}
        setResourceExamFilter={setResourceExamFilter}
        resourceTypeFilter={resourceTypeFilter}
        setResourceTypeFilter={setResourceTypeFilter}
        resourceCategoryFilter={resourceCategoryFilter}
        setResourceCategoryFilter={setResourceCategoryFilter}
        resourceStatusFilter={resourceStatusFilter}
        setResourceStatusFilter={setResourceStatusFilter}
        availableResourceCategories={availableResourceCategories}
        filteredResources={filteredResources}
        selectedResourceIds={selectedResourceIds}
        allVisibleResourcesSelected={allVisibleResourcesSelected}
        toggleSelectVisibleResources={toggleSelectVisibleResources}
        updateResourcesActiveState={updateResourcesActiveState}
        deleteResources={deleteResources}
        exportFilteredResources={exportFilteredResources}
        showResourceImport={showResourceImport}
        setShowResourceImport={setShowResourceImport}
        openNewResourceForm={openNewResourceForm}
        resourceFileInputRef={resourceFileInputRef}
        handleResourceFileUpload={handleResourceFileUpload}
        resourceImportInput={resourceImportInput}
        setResourceImportInput={setResourceImportInput}
        resourceImportPreview={resourceImportPreview}
        importResources={importResources}
        resourceImportSource={resourceImportSource}
        bulkResourceTemplate={BULK_RESOURCE_TEMPLATE}
        showResourceForm={showResourceForm}
        editingResourceId={editingResourceId}
        resetResourceForm={resetResourceForm}
        resourceForm={resourceForm}
        setResourceForm={setResourceForm}
        saveResource={saveResource}
        startEditResource={startEditResource}
        toggleResourceSelection={toggleResourceSelection}
        resourceExams={RESOURCE_EXAMS}
        resourceTypes={RESOURCE_TYPES}
        updateSearch={updateSearch}
        setUpdateSearch={setUpdateSearch}
        updateStateFilter={updateStateFilter}
        setUpdateStateFilter={setUpdateStateFilter}
        updateExamTypeFilter={updateExamTypeFilter}
        setUpdateExamTypeFilter={setUpdateExamTypeFilter}
        updateQualificationFilter={updateQualificationFilter}
        setUpdateQualificationFilter={setUpdateQualificationFilter}
        updateStatusFilter={updateStatusFilter}
        setUpdateStatusFilter={setUpdateStatusFilter}
        updateTimelineFilter={updateTimelineFilter}
        setUpdateTimelineFilter={setUpdateTimelineFilter}
        availableUpdateStates={availableUpdateStates}
        filteredUpdates={filteredUpdates}
        selectedUpdateIds={selectedUpdateIds}
        allVisibleUpdatesSelected={allVisibleUpdatesSelected}
        toggleSelectVisibleUpdates={toggleSelectVisibleUpdates}
        updateUpdatesActiveState={updateUpdatesActiveState}
        deleteUpdates={deleteUpdates}
        exportFilteredUpdates={exportFilteredUpdates}
        showUpdateImport={showUpdateImport}
        setShowUpdateImport={setShowUpdateImport}
        openNewUpdateForm={openNewUpdateForm}
        updateFileInputRef={updateFileInputRef}
        handleUpdateFileUpload={handleUpdateFileUpload}
        updateImportInput={updateImportInput}
        setUpdateImportInput={setUpdateImportInput}
        updateImportPreview={updateImportPreview}
        importUpdates={importUpdates}
        updateImportSource={updateImportSource}
        bulkUpdateTemplate={BULK_UPDATE_TEMPLATE}
        showUpdateForm={showUpdateForm}
        editingUpdateId={editingUpdateId}
        resetUpdateForm={resetUpdateForm}
        updateForm={updateForm}
        setUpdateForm={setUpdateForm}
        saveUpdate={saveUpdate}
        startEditUpdate={startEditUpdate}
        toggleUpdateSelection={toggleUpdateSelection}
        examTypes={EXAM_TYPES}
        qualificationTiers={QUALIFICATION_TIERS}
        updateTimelineFilters={UPDATE_TIMELINE_FILTERS}
        dbContests={dbContests}
        showContestForm={showContestForm}
        setShowContestForm={setShowContestForm}
        contestForm={contestForm}
        setContestForm={setContestForm}
        resetContestForm={resetContestForm}
        saveContest={saveContest}
        editingContestId={editingContestId}
        startEditContest={startEditContest}
        deleteContest={deleteContest}
        contestStatuses={CONTEST_STATUSES}
        supportSearch={supportSearch}
        setSupportSearch={setSupportSearch}
        filteredSupportRequests={filteredSupportRequests}
        selectedSupportRequest={selectedSupportRequest}
        setSelectedSupportId={setSelectedSupportId}
        supportRepliesByRequestId={supportRepliesByRequestId}
        openReplyDialog={openReplyDialog}
        buildSupportReplyLink={buildSupportReplyLink}
        updateSupportStatus={updateSupportStatus}
        supportStatusTone={supportStatusTone}
        toId={toId}
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-[var(--page-background)] text-[var(--text-primary)]">
      {toast ? (
        <div
          className={cn(
            "fixed right-4 top-4 z-50 flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-medium shadow-lg",
            toast?.ok ? "bg-emerald-500 text-white" : "bg-rose-500 text-white"
          )}
        >
          {toast?.ok ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
          {toast?.msg}
        </div>
      ) : null}

      <Dialog open={Boolean(replyTarget)} onOpenChange={(open) => (open ? null : closeReplyDialog())}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Reply To Support Request</DialogTitle>
            <DialogDescription>
              Send a direct reply from the admin panel using your verified PrepBros support domain.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200">To</label>
              <input
                value={replyTarget?.email || ""}
                readOnly
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Subject</label>
              <input
                value={replySubject}
                onChange={(event) => setReplySubject(event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-orange-300 dark:border-slate-800 dark:bg-slate-950"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Reply</label>
              <textarea
                value={replyMessage}
                onChange={(event) => setReplyMessage(event.target.value)}
                rows={10}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-orange-300 dark:border-slate-800 dark:bg-slate-950"
              />
            </div>
          </div>

          <DialogFooter>
            <SmallButton onClick={closeReplyDialog} disabled={sendingReply}>
              Cancel
            </SmallButton>
            <SmallButton icon={Send} tone="primary" onClick={() => void sendSupportReply()} disabled={sendingReply}>
              {sendingReply ? "Sending..." : "Send Reply"}
            </SmallButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <nav className="sticky top-0 z-40 border-b border-[var(--border-soft)] bg-[var(--navbar-bg)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <Link href="/" className="inline-flex items-center gap-3">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-[14px] bg-[var(--brand)] text-sm font-bold text-[var(--text-on-brand)] shadow-[var(--shadow-sm)]">
                P
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--text-primary)]">PrepBros Admin</p>
                <p className="text-xs text-[var(--text-faint)]">Operations, imports, and content control</p>
              </div>
            </Link>
            <Pill tone="orange">Admin access</Pill>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden text-xs text-[var(--text-faint)] md:inline">{user?.email}</span>
            <SmallButton
              icon={RefreshCcw}
              onClick={() => void loadAll()}
              disabled={loadingTarget !== null}
            >
              {loadingTarget === "refresh" ? "Refreshing..." : "Refresh"}
            </SmallButton>
            <SmallButton icon={LogOut} onClick={() => signOut()}>
              Sign out
            </SmallButton>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:py-8">
        <section className="relative overflow-hidden rounded-[24px] border border-[var(--border)] bg-[linear-gradient(135deg,rgba(16,23,34,0.98),rgba(13,18,24,0.98)_62%,rgba(21,29,42,0.96)_100%)] px-6 py-7 text-[var(--text-primary)] shadow-[var(--shadow-lg)] md:px-8 md:py-8">
          <div className="absolute inset-y-0 right-0 hidden w-[42%] bg-[radial-gradient(circle_at_top_right,rgba(255,140,50,0.12),transparent_58%)] lg:block" />
          <div className="relative grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--text-faint)]">
                Control Center
              </p>
              <h1 className="mt-4 max-w-2xl text-4xl font-semibold tracking-[-0.06em] md:text-5xl">
                Admin work in the same calm operating system.
              </h1>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-[var(--text-secondary)] md:text-base">
                Import question banks from copy-paste, CSV, TSV, or JSON. Filter aggressively, bulk
                remove or deactivate bad rows, export clean slices, and keep resources, contests,
                and support in one operational panel.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/practice"
                  className="inline-flex items-center rounded-[14px] border border-[var(--border)] bg-[var(--surface-1)] px-4 py-2.5 text-sm font-medium text-[var(--text-primary)] transition hover:bg-[var(--surface-2)]"
                >
                  Review practice surface
                </Link>
                <Link
                  href="/resources"
                  className="inline-flex items-center rounded-[14px] border border-[var(--border)] bg-[var(--surface-2)] px-4 py-2.5 text-sm font-medium text-[var(--text-secondary)] transition hover:bg-[var(--surface-1)] hover:text-[var(--text-primary)]"
                >
                  Review resources
                </Link>
                <Link
                  href="/updates"
                  className="inline-flex items-center rounded-[14px] border border-[var(--border)] bg-[var(--surface-2)] px-4 py-2.5 text-sm font-medium text-[var(--text-secondary)] transition hover:bg-[var(--surface-1)] hover:text-[var(--text-primary)]"
                >
                  Review updates
                </Link>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <div className="rounded-[18px] border border-[var(--border)] bg-[rgba(255,255,255,0.03)] p-4 backdrop-blur">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-faint)]">Question bank</p>
                <p className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-[var(--text-primary)]">{questionStats.total}</p>
                <p className="mt-2 text-sm text-[var(--text-secondary)]">
                  {questionStats.active} active, {questionStats.inactive} inactive, {questionStats.pyq} PYQs
                </p>
              </div>
              <div className="rounded-[18px] border border-[var(--border)] bg-[rgba(255,255,255,0.03)] p-4 backdrop-blur">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-faint)]">Resources and updates</p>
                <p className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-[var(--text-primary)]">{resourceStats.total + updateStats.total}</p>
                <p className="mt-2 text-sm text-[var(--text-secondary)]">
                  {resourceStats.active} resources, {updateStats.active} updates, {supportRequests.length} support items
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Questions" value={questionStats.total} hint="Live rows available to manage" icon={Database} tone="orange" />
          <MetricCard label="UPSC Rows" value={questionStats.upsc} hint="Useful when replacing PYQ banks" icon={ShieldCheck} tone="blue" />
          <MetricCard label="Resources" value={resourceStats.total} hint="Study links, PDFs, books, and videos" icon={Layers3} tone="green" />
          <MetricCard label="Updates" value={updateStats.active} hint="Active opportunities on the public desk" icon={Bell} tone="blue" />
        </section>

        <section className="mt-6 flex flex-wrap gap-2 rounded-[18px] border border-[var(--border)] bg-[var(--surface-1)] p-2 backdrop-blur">
          {ADMIN_TABS.map(tab => {
            const label =
              tab === "analytics"
                ? `Analytics (${formatNumber(todayAnalytics?.visitors)})`
                : tab === "questions"
                ? `Questions (${dbQuestions.length})`
                : tab === "resources"
                  ? `Resources (${dbResources.length})`
                  : tab === "updates"
                    ? `Updates (${dbUpdates.length})`
                    : tab === "contests"
                      ? `Contests (${dbContests.length})`
                      : `Support (${supportRequests.length})`;

            const active = activeTab === tab;

            return (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "rounded-[14px] px-4 py-2.5 text-sm font-medium transition",
                  active
                    ? "bg-[var(--surface-elevated)] text-[var(--text-primary)] shadow-[var(--shadow-sm)]"
                    : "text-[var(--text-secondary)] hover:bg-[var(--surface-2)] hover:text-[var(--text-primary)]"
                )}
              >
                {label}
              </button>
            );
          })}
        </section>

        <div className="mt-6 space-y-6">
          {activeTab === "analytics" ? (
            <>
              <SectionCard
                title="Product Analytics"
                description="These numbers are designed to answer simple questions fast: how many people came, what they opened, whether they logged in or signed up, and which pages are holding attention."
              >
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                  <MetricCard
                    label="Visitors Today"
                    value={formatNumber(todayAnalytics?.visitors)}
                    hint="Unique people or sessions that opened at least one tracked page today"
                    icon={Users}
                    tone="blue"
                  />
                  <MetricCard
                    label="Page Views Today"
                    value={formatNumber(todayAnalytics?.page_views)}
                    hint="Total page opens across the product today"
                    icon={MousePointerClick}
                    tone="orange"
                  />
                  <MetricCard
                    label="Sign-ins Today"
                    value={formatNumber(todayAnalytics?.signins)}
                    hint="Successful logins recorded today"
                    icon={ShieldCheck}
                    tone="green"
                  />
                  <MetricCard
                    label="Sign-ups Today"
                    value={formatNumber(todayAnalytics?.signups)}
                    hint="New accounts successfully created today"
                    icon={UserPlus}
                    tone="blue"
                  />
                  <MetricCard
                    label="Avg Engaged Time"
                    value={formatDurationLabel(todayAnalytics?.avg_engaged_seconds)}
                    hint="Average time before a person switches tabs or closes the page"
                    icon={Timer}
                    tone="rose"
                  />
                </div>

                <div className="mt-5 grid gap-4 xl:grid-cols-3">
                  <div className="rounded-[22px] border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/40">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                      Read this first
                    </p>
                    <div className="mt-3 space-y-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                      <p>
                        Visitors are unique people or sessions.
                      </p>
                      <p>
                        Page views count every page open, so this will usually be higher than visitors.
                      </p>
                      <p>
                        Engaged time is a simple attention signal, not an exact stopwatch.
                      </p>
                    </div>
                  </div>

                  <div className="rounded-[22px] border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                      Traffic quality
                    </p>
                    <p className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-slate-950 dark:text-white">
                      {averagePageViewsPerVisitor > 0
                        ? `${averagePageViewsPerVisitor.toFixed(1)} pages / visitor`
                        : "Still collecting"}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                      {trafficSummary}
                    </p>
                  </div>

                  <div className="rounded-[22px] border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                      Engagement read
                    </p>
                    <p className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-slate-950 dark:text-white">
                      {formatDurationLabel(todayAnalytics?.avg_engaged_seconds)}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                      {engagementSummary}
                    </p>
                  </div>
                </div>
              </SectionCard>

              <SectionCard
                title="Trends and Growth"
                description="Today shows live movement. Monthly and yearly views help you see whether the product is growing or flattening out."
              >
                <div className="grid gap-4 xl:grid-cols-3">
                  <div className="rounded-[22px] border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                          Today
                        </p>
                        <p className="mt-2 text-lg font-semibold text-slate-950 dark:text-white">
                          {formatShortDateLabel(todayAnalytics?.day)}
                        </p>
                      </div>
                      <div className={cn("inline-flex h-11 w-11 items-center justify-center rounded-2xl border", metricToneClasses("orange"))}>
                        <ChartColumn size={18} />
                      </div>
                    </div>
                    <div className="mt-4 space-y-2 text-sm text-slate-600 dark:text-slate-300">
                      <p>{formatNumber(todayAnalytics?.page_views)} page views</p>
                      <p>{formatNumber(todayAnalytics?.visitors)} visitors</p>
                      <p>{formatNumber(todayAnalytics?.signins)} sign-ins</p>
                      <p>{formatNumber(todayAnalytics?.signups)} sign-ups</p>
                    </div>
                  </div>

                  <div className="rounded-[22px] border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                          This Month
                        </p>
                        <p className="mt-2 text-lg font-semibold text-slate-950 dark:text-white">
                          {formatMonthLabel(currentMonthAnalytics?.month)}
                        </p>
                      </div>
                      <div className={cn("inline-flex h-11 w-11 items-center justify-center rounded-2xl border", metricToneClasses(growthTone(currentMonthAnalytics?.visitor_growth_pct)))}>
                        <TrendingUp size={18} />
                      </div>
                    </div>
                    <div className="mt-4 space-y-2 text-sm text-slate-600 dark:text-slate-300">
                      <p>{formatNumber(currentMonthAnalytics?.page_views)} page views</p>
                      <p>{formatNumber(currentMonthAnalytics?.visitors)} visitors</p>
                      <p>{formatNumber(currentMonthAnalytics?.signins)} sign-ins</p>
                      <p>{formatNumber(currentMonthAnalytics?.signups)} sign-ups</p>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Pill tone={growthTone(currentMonthAnalytics?.visitor_growth_pct)}>
                        Visitors {formatPercent(currentMonthAnalytics?.visitor_growth_pct)}
                      </Pill>
                      <Pill tone={growthTone(currentMonthAnalytics?.signup_growth_pct)}>
                        Sign-ups {formatPercent(currentMonthAnalytics?.signup_growth_pct)}
                      </Pill>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
                      {describeGrowth("Visitors", currentMonthAnalytics?.visitor_growth_pct)}
                    </p>
                  </div>

                  <div className="rounded-[22px] border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                          This Year
                        </p>
                        <p className="mt-2 text-lg font-semibold text-slate-950 dark:text-white">
                          {formatYearLabel(currentYearAnalytics?.year)}
                        </p>
                      </div>
                      <div className={cn("inline-flex h-11 w-11 items-center justify-center rounded-2xl border", metricToneClasses(growthTone(currentYearAnalytics?.signin_growth_pct)))}>
                        <CalendarDays size={18} />
                      </div>
                    </div>
                    <div className="mt-4 space-y-2 text-sm text-slate-600 dark:text-slate-300">
                      <p>{formatNumber(currentYearAnalytics?.page_views)} page views</p>
                      <p>{formatNumber(currentYearAnalytics?.visitors)} visitors</p>
                      <p>{formatNumber(currentYearAnalytics?.signins)} sign-ins</p>
                      <p>{formatNumber(currentYearAnalytics?.signups)} sign-ups</p>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Pill tone={growthTone(currentYearAnalytics?.visitor_growth_pct)}>
                        Visitors {formatPercent(currentYearAnalytics?.visitor_growth_pct)}
                      </Pill>
                      <Pill tone={growthTone(currentYearAnalytics?.signin_growth_pct)}>
                        Sign-ins {formatPercent(currentYearAnalytics?.signin_growth_pct)}
                      </Pill>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
                      {describeGrowth("Sign-ins", currentYearAnalytics?.signin_growth_pct)}
                    </p>
                  </div>
                </div>
              </SectionCard>

              <SectionCard
                title="Top Pages"
                description="This shows where attention is actually landing. Higher engaged time usually means the page is holding focus better."
              >
                {analyticsTopPages.length === 0 ? (
                  <EmptyState
                    icon={ChartColumn}
                    title="No analytics pages yet"
                    description="Open the product a few times and this table will start ranking your strongest pages."
                  />
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-slate-200 text-xs uppercase tracking-[0.18em] text-slate-500 dark:border-slate-800 dark:text-slate-400">
                          <th className="px-3 py-3 font-semibold">Page</th>
                          <th className="px-3 py-3 font-semibold">Views</th>
                          <th className="px-3 py-3 font-semibold">Visitors</th>
                          <th className="px-3 py-3 font-semibold">Avg Engaged Time</th>
                          <th className="px-3 py-3 font-semibold">Quick Read</th>
                        </tr>
                      </thead>
                      <tbody>
                        {analyticsTopPages.map(page => (
                          <tr
                            key={`${page.path}-${page.page_views}-${page.visitors}`}
                            className="border-b border-slate-100 last:border-b-0 dark:border-slate-900"
                          >
                            <td className="px-3 py-3 font-medium text-slate-950 dark:text-white">
                              {page.path || "/"}
                            </td>
                            <td className="px-3 py-3 text-slate-600 dark:text-slate-300">
                              {formatNumber(page.page_views)}
                            </td>
                            <td className="px-3 py-3 text-slate-600 dark:text-slate-300">
                              {formatNumber(page.visitors)}
                            </td>
                            <td className="px-3 py-3 text-slate-600 dark:text-slate-300">
                              {formatDurationLabel(page.avg_engaged_seconds)}
                            </td>
                            <td className="px-3 py-3 text-slate-500 dark:text-slate-400">
                              {page.avg_engaged_seconds && page.avg_engaged_seconds >= 60
                                ? "Holding attention well"
                                : page.page_views && page.page_views >= 3
                                  ? "Getting repeat traffic"
                                  : "Still early"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </SectionCard>
            </>
          ) : null}

          {activeTab === "questions" ? (
            <>
              <SectionCard
                title="Question Operations"
                description="Use filters to isolate bad rows, then select visible results for bulk deactivate or hard delete. Import accepts pasted Sheets rows, CSV, TSV, and JSON."
                actions={
                  <>
                    <SmallButton icon={Upload} onClick={() => setShowQuestionImport(current => !current)}>
                      {showQuestionImport ? "Hide import" : "Open import"}
                    </SmallButton>
                    <SmallButton icon={Plus} tone="primary" onClick={openNewQuestionForm}>
                      Add question
                    </SmallButton>
                  </>
                }
              >
                <div className="grid gap-4 xl:grid-cols-[1.25fr_0.75fr]">
                  <div className="space-y-4">
                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
                      <label className="xl:col-span-2">
                        <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                          Search
                        </span>
                        <div className="relative">
                          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            value={questionSearch}
                            onChange={event => setQuestionSearch(event.target.value)}
                            placeholder="Question text, explanation, tags, topic..."
                            className="search-input-reset search-input-with-icon w-full rounded-2xl border border-slate-200 bg-white py-2.5 text-sm outline-none transition focus:border-orange-300 dark:border-slate-800 dark:bg-slate-950"
                          />
                        </div>
                      </label>

                      <label>
                        <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                          Exam
                        </span>
                        <select
                          value={questionExamFilter}
                          onChange={event => setQuestionExamFilter(event.target.value as FilterExam)}
                          className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-orange-300 dark:border-slate-800 dark:bg-slate-950"
                        >
                          {FILTER_EXAMS.map(exam => (
                            <option key={exam} value={exam}>
                              {exam}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label>
                        <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                          Topic
                        </span>
                        <select
                          value={questionTopicFilter}
                          onChange={event => setQuestionTopicFilter(event.target.value)}
                          className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-orange-300 dark:border-slate-800 dark:bg-slate-950"
                        >
                          {availableQuestionTopics.map(topic => (
                            <option key={topic} value={topic}>
                              {topic}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label>
                        <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                          Type
                        </span>
                        <select
                          value={questionTypeFilter}
                          onChange={event => setQuestionTypeFilter(event.target.value as "All" | QuestionType)}
                          className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-orange-300 dark:border-slate-800 dark:bg-slate-950"
                        >
                          <option value="All">All</option>
                          {QUESTION_TYPES.map(type => (
                            <option key={type} value={type}>
                              {type}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>

                    <div className="grid gap-3 md:grid-cols-4">
                      <label>
                        <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                          Difficulty
                        </span>
                        <select
                          value={questionDifficultyFilter}
                          onChange={event => setQuestionDifficultyFilter(event.target.value as "All" | Difficulty)}
                          className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-orange-300 dark:border-slate-800 dark:bg-slate-950"
                        >
                          <option value="All">All</option>
                          {DIFFICULTIES.map(difficulty => (
                            <option key={difficulty} value={difficulty}>
                              {difficulty}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label>
                        <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                          Status
                        </span>
                        <select
                          value={questionStatusFilter}
                          onChange={event => setQuestionStatusFilter(event.target.value as StatusFilter)}
                          className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-orange-300 dark:border-slate-800 dark:bg-slate-950"
                        >
                          {STATUS_FILTERS.map(status => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                      </label>

                      <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-3 dark:border-slate-800">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                          Filtered
                        </p>
                        <p className="mt-1 text-xl font-semibold tracking-[-0.03em] text-slate-950 dark:text-white">
                          {filteredQuestions.length}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-3 dark:border-slate-800">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                          Selected
                        </p>
                        <p className="mt-1 text-xl font-semibold tracking-[-0.03em] text-slate-950 dark:text-white">
                          {selectedQuestionIds.length}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <SmallButton icon={CheckCircle2} onClick={toggleSelectVisibleQuestions}>
                        {allVisibleQuestionsSelected ? "Unselect visible" : "Select visible"}
                      </SmallButton>
                      <SmallButton
                        icon={ShieldCheck}
                        onClick={() => void updateQuestionsActiveState(selectedQuestionIds, false)}
                        disabled={selectedQuestionIds.length === 0 || loadingTarget !== null}
                      >
                        Deactivate selected
                      </SmallButton>
                      <SmallButton
                        icon={ShieldCheck}
                        onClick={() => void updateQuestionsActiveState(selectedQuestionIds, true)}
                        disabled={selectedQuestionIds.length === 0 || loadingTarget !== null}
                      >
                        Activate selected
                      </SmallButton>
                      <SmallButton
                        icon={Trash2}
                        tone="danger"
                        onClick={() => void deleteQuestions(selectedQuestionIds)}
                        disabled={selectedQuestionIds.length === 0 || loadingTarget !== null}
                      >
                        Delete selected
                      </SmallButton>
                      <SmallButton
                        icon={Download}
                        onClick={exportFilteredQuestions}
                        disabled={filteredQuestions.length === 0}
                      >
                        Export filtered
                      </SmallButton>
                    </div>
                  </div>

                  {showQuestionImport ? (
                    <div className="rounded-[24px] border border-orange-200/70 bg-orange-50/80 p-4 dark:border-orange-900/60 dark:bg-orange-950/20">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-orange-800 dark:text-orange-200">
                            Bulk question import
                          </p>
                          <p className="mt-1 text-sm text-orange-700/80 dark:text-orange-200/70">
                            Paste from Google Sheets, or upload a CSV, TSV, TXT, or JSON file to append new rows.
                          </p>
                        </div>
                        <input
                          ref={questionFileInputRef}
                          type="file"
                          accept=".csv,.tsv,.txt,.json"
                          className="hidden"
                          onChange={handleQuestionFileUpload}
                        />
                        <SmallButton
                          icon={FileSpreadsheet}
                          onClick={() => questionFileInputRef.current?.click()}
                        >
                          Upload file
                        </SmallButton>
                      </div>

                      <textarea
                        value={questionImportInput}
                        onChange={event => setQuestionImportInput(event.target.value)}
                        rows={13}
                        placeholder="Paste JSON, CSV, or tab-separated rows here..."
                        className="mt-4 w-full rounded-[22px] border border-orange-200 bg-white px-4 py-3 font-mono text-sm text-slate-900 outline-none transition focus:border-orange-300 dark:border-orange-900/70 dark:bg-slate-950 dark:text-white"
                      />

                      <div className="mt-4 flex flex-wrap gap-2">
                        <SmallButton
                          icon={Upload}
                          tone="primary"
                          onClick={() => void importQuestions()}
                          disabled={Boolean(questionImportPreview.error) || questionImportPreview.rows.length === 0 || loadingTarget !== null}
                        >
                          {loadingTarget === "import-questions" ? "Importing..." : "Import rows"}
                        </SmallButton>
                        <SmallButton onClick={() => setQuestionImportInput(BULK_IMPORT_TEMPLATE)}>
                          Fill template
                        </SmallButton>
                        <SmallButton
                          onClick={() => {
                            clearQuestionImportState();
                          }}
                        >
                          Clear
                        </SmallButton>
                      </div>

                      <div className="mt-4 rounded-2xl border border-orange-200 bg-white/90 p-4 text-sm dark:border-orange-900/70 dark:bg-slate-950/70">
                        {questionImportPreview.error ? (
                          <p className="text-rose-600 dark:text-rose-300">{questionImportPreview.error}</p>
                        ) : questionImportPreview.rows.length > 0 ? (
                          <div className="space-y-3">
                            <p className="font-medium text-slate-800 dark:text-slate-100">
                              {questionImportPreview.rows.length} row{questionImportPreview.rows.length === 1 ? "" : "s"} ready
                              {questionImportSource ? ` from ${questionImportSource}` : ""}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              Current filters match {filteredQuestions.length} existing question{filteredQuestions.length === 1 ? "" : "s"}.
                            </p>
                            {questionImportPreview.rows.slice(0, 2).map((row, index) => (
                              <div key={`${row.question}-${index}`} className="rounded-2xl border border-slate-200 p-3 dark:border-slate-800">
                                <p className="line-clamp-2 text-sm font-medium text-slate-900 dark:text-white">{row.question}</p>
                                <div className="mt-2 flex flex-wrap gap-2">
                                  <Pill tone="slate">{row.exam}</Pill>
                                  <Pill tone="orange">{row.topic}</Pill>
                                  <Pill tone="blue">{row.type}</Pill>
                                  <Pill tone={row.is_active ? "green" : "rose"}>{row.is_active ? "Active" : "Inactive"}</Pill>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-slate-500 dark:text-slate-400">
                            Supported fields: question, option_a-d, correct_option, explanation, exam, topic, subtopic, difficulty, type, year, tags, is_active.
                          </p>
                        )}
                      </div>
                    </div>
                  ) : null}
                </div>
              </SectionCard>

              {showQuestionForm ? (
                <SectionCard
                  title={editingQuestionId ? "Edit Question" : "Create Question"}
                  description="Use this for precise manual edits when the bulk tool is too heavy."
                  actions={
                    <SmallButton onClick={resetQuestionForm} icon={X}>
                      Close editor
                    </SmallButton>
                  }
                >
                  <div className="space-y-4">
                    <label className="block">
                      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                        Question
                      </span>
                      <textarea
                        value={questionForm.question}
                        onChange={event => setQuestionForm(current => ({ ...current, question: event.target.value }))}
                        rows={3}
                        className="w-full rounded-[22px] border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-orange-300 dark:border-slate-800 dark:bg-slate-950"
                      />
                    </label>

                    <div className="grid gap-3 md:grid-cols-2">
                      {(["a", "b", "c", "d"] as const).map((optionKey, index) => (
                        <label key={optionKey} className="block">
                          <span className="mb-1.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                            Option {optionKey.toUpperCase()}
                            <input
                              type="radio"
                              name="correct-option"
                              checked={questionForm.correct_option === index}
                              onChange={() => setQuestionForm(current => ({ ...current, correct_option: index }))}
                              className="accent-orange-500"
                            />
                            <span className="text-[11px] text-emerald-600 dark:text-emerald-400">
                              {questionForm.correct_option === index ? "Correct" : ""}
                            </span>
                          </span>
                          <input
                            value={questionForm[`option_${optionKey}`]}
                            onChange={event =>
                              setQuestionForm(current => ({
                                ...current,
                                [`option_${optionKey}`]: event.target.value,
                              }))
                            }
                            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-orange-300 dark:border-slate-800 dark:bg-slate-950"
                          />
                        </label>
                      ))}
                    </div>

                    <label className="block">
                      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                        Explanation
                      </span>
                      <textarea
                        value={questionForm.explanation}
                        onChange={event => setQuestionForm(current => ({ ...current, explanation: event.target.value }))}
                        rows={3}
                        className="w-full rounded-[22px] border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-orange-300 dark:border-slate-800 dark:bg-slate-950"
                      />
                    </label>

                    <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-6">
                      <label className="block">
                        <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                          Exam
                        </span>
                        <select
                          value={questionForm.exam}
                          onChange={event => setQuestionForm(current => ({ ...current, exam: event.target.value as Exam }))}
                          className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-orange-300 dark:border-slate-800 dark:bg-slate-950"
                        >
                          {QUESTION_EXAMS.map(exam => (
                            <option key={exam} value={exam}>
                              {exam}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label className="block">
                        <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                          Topic
                        </span>
                        <select
                          value={questionForm.topic}
                          onChange={event => setQuestionForm(current => ({ ...current, topic: event.target.value }))}
                          className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-orange-300 dark:border-slate-800 dark:bg-slate-950"
                        >
                          {availableQuestionTopics.filter(topic => topic !== "All").map(topic => (
                            <option key={topic} value={topic}>
                              {topic}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label className="block">
                        <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                          Subtopic
                        </span>
                        <input
                          value={questionForm.subtopic}
                          onChange={event => setQuestionForm(current => ({ ...current, subtopic: event.target.value }))}
                          className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-orange-300 dark:border-slate-800 dark:bg-slate-950"
                        />
                      </label>

                      <label className="block">
                        <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                          Difficulty
                        </span>
                        <select
                          value={questionForm.difficulty}
                          onChange={event => setQuestionForm(current => ({ ...current, difficulty: event.target.value as Difficulty }))}
                          className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-orange-300 dark:border-slate-800 dark:bg-slate-950"
                        >
                          {DIFFICULTIES.map(difficulty => (
                            <option key={difficulty} value={difficulty}>
                              {difficulty}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label className="block">
                        <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                          Type
                        </span>
                        <select
                          value={questionForm.type}
                          onChange={event => setQuestionForm(current => ({ ...current, type: event.target.value as QuestionType }))}
                          className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-orange-300 dark:border-slate-800 dark:bg-slate-950"
                        >
                          {QUESTION_TYPES.map(type => (
                            <option key={type} value={type}>
                              {type}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label className="block">
                        <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                          Year
                        </span>
                        <input
                          value={questionForm.year}
                          onChange={event => setQuestionForm(current => ({ ...current, year: event.target.value }))}
                          placeholder="2024"
                          className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-orange-300 dark:border-slate-800 dark:bg-slate-950"
                        />
                      </label>
                    </div>

                    <div className="grid gap-3 md:grid-cols-[1fr_auto]">
                      <label className="block">
                        <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                          Tags
                        </span>
                        <input
                          value={questionForm.tags}
                          onChange={event => setQuestionForm(current => ({ ...current, tags: event.target.value }))}
                          placeholder="constitution, article-21a, education"
                          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-orange-300 dark:border-slate-800 dark:bg-slate-950"
                        />
                      </label>

                      <label className="flex items-end gap-2 rounded-2xl border border-slate-200 px-4 py-3 dark:border-slate-800">
                        <input
                          type="checkbox"
                          checked={questionForm.is_active}
                          onChange={event => setQuestionForm(current => ({ ...current, is_active: event.target.checked }))}
                          className="accent-orange-500"
                        />
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Active row</span>
                      </label>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <SmallButton
                        tone="primary"
                        icon={CheckCircle2}
                        onClick={() => void saveQuestion()}
                        disabled={loadingTarget !== null}
                      >
                        {loadingTarget === "save-question"
                          ? "Saving..."
                          : editingQuestionId
                            ? "Update question"
                            : "Save question"}
                      </SmallButton>
                      <SmallButton onClick={resetQuestionForm}>Cancel</SmallButton>
                    </div>
                  </div>
                </SectionCard>
              ) : null}

              <SectionCard
                title="Question Inventory"
                description="This list is optimized for cleanup. Filter first, select visible results, then bulk deactivate or delete."
              >
                {filteredQuestions.length === 0 ? (
                  <EmptyState
                    icon={BookOpen}
                    title="No questions match the current filters"
                    description="Widen the filters or import more rows."
                  />
                ) : (
                  <div className="space-y-3">
                    {filteredQuestions.map(question => {
                      const questionId = toId(question.id);
                      const selected = selectedQuestionIds.includes(questionId);

                      return (
                        <div
                          key={questionId}
                          className={cn(
                            "rounded-[24px] border p-4 transition",
                            selected
                              ? "border-orange-300 bg-orange-50/60 dark:border-orange-900 dark:bg-orange-950/10"
                              : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950"
                          )}
                        >
                          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                            <div className="flex gap-3">
                              <input
                                type="checkbox"
                                checked={selected}
                                onChange={() => toggleQuestionSelection(questionId)}
                                className="mt-1 h-4 w-4 rounded accent-orange-500"
                              />
                              <div>
                                <p className="text-base font-medium leading-7 text-slate-950 dark:text-white">
                                  {question.question}
                                </p>
                                <p className="mt-2 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">
                                  {question.explanation}
                                </p>
                                <div className="mt-3 flex flex-wrap gap-2">
                                  <Pill tone="orange">{question.exam}</Pill>
                                  <Pill tone="blue">{question.type}</Pill>
                                  <Pill tone="slate">{question.topic}</Pill>
                                  <Pill tone="green">{question.difficulty}</Pill>
                                  <Pill tone={question.is_active ? "green" : "rose"}>
                                    {question.is_active ? "Active" : "Inactive"}
                                  </Pill>
                                  {question.year ? <Pill tone="slate">PYQ {question.year}</Pill> : null}
                                </div>
                                <div className="mt-3 grid gap-2 md:grid-cols-2">
                                  {[question.option_a, question.option_b, question.option_c, question.option_d].map(
                                    (option, index) => (
                                      <div
                                        key={`${questionId}-${index}`}
                                        className={cn(
                                          "rounded-2xl border px-3 py-2 text-sm",
                                          question.correct_option === index
                                            ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/20 dark:text-emerald-300"
                                            : "border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
                                        )}
                                      >
                                        {String.fromCharCode(65 + index)}. {option}
                                      </div>
                                    )
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="flex shrink-0 flex-wrap gap-2 lg:justify-end">
                              <SmallButton icon={Edit2} onClick={() => startEditQuestion(question)}>
                                Edit
                              </SmallButton>
                              <SmallButton
                                icon={ShieldCheck}
                                onClick={() => void updateQuestionsActiveState([questionId], !question.is_active)}
                                disabled={loadingTarget !== null}
                              >
                                {question.is_active ? "Deactivate" : "Activate"}
                              </SmallButton>
                              <SmallButton
                                icon={Trash2}
                                tone="danger"
                                onClick={() => void deleteQuestions([questionId])}
                                disabled={loadingTarget !== null}
                              >
                                Delete
                              </SmallButton>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </SectionCard>
            </>
          ) : null}

          {activeTab === "resources" ? (
            <>
              <SectionCard
                title="Resource Operations"
                description="Keep PDFs, books, notes, and video links clean. You can bulk import, filter by exam or category, and toggle active status without leaving the panel."
                actions={
                  <>
                    <SmallButton icon={Upload} onClick={() => setShowResourceImport(current => !current)}>
                      {showResourceImport ? "Hide import" : "Open import"}
                    </SmallButton>
                    <SmallButton icon={Plus} tone="primary" onClick={openNewResourceForm}>
                      Add resource
                    </SmallButton>
                  </>
                }
              >
                <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
                  <div className="space-y-4">
                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
                      <label className="xl:col-span-2">
                        <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                          Search
                        </span>
                        <div className="relative">
                          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            value={resourceSearch}
                            onChange={event => setResourceSearch(event.target.value)}
                            placeholder="Title, URL, description..."
                            className="search-input-reset search-input-with-icon w-full rounded-2xl border border-slate-200 bg-white py-2.5 text-sm outline-none transition focus:border-orange-300 dark:border-slate-800 dark:bg-slate-950"
                          />
                        </div>
                      </label>

                      <label>
                        <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                          Exam
                        </span>
                        <select
                          value={resourceExamFilter}
                          onChange={event => setResourceExamFilter(event.target.value as ResourceExam)}
                          className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-orange-300 dark:border-slate-800 dark:bg-slate-950"
                        >
                          {RESOURCE_EXAMS.map(exam => (
                            <option key={exam} value={exam}>
                              {exam}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label>
                        <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                          Type
                        </span>
                        <select
                          value={resourceTypeFilter}
                          onChange={event => setResourceTypeFilter(event.target.value as "All" | ResourceType)}
                          className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-orange-300 dark:border-slate-800 dark:bg-slate-950"
                        >
                          <option value="All">All</option>
                          {RESOURCE_TYPES.map(type => (
                            <option key={type} value={type}>
                              {type}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label>
                        <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                          Category
                        </span>
                        <select
                          value={resourceCategoryFilter}
                          onChange={event => setResourceCategoryFilter(event.target.value)}
                          className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-orange-300 dark:border-slate-800 dark:bg-slate-950"
                        >
                          {availableResourceCategories.map(category => (
                            <option key={category} value={category}>
                              {category}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>

                    <div className="grid gap-3 md:grid-cols-4">
                      <label>
                        <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                          Status
                        </span>
                        <select
                          value={resourceStatusFilter}
                          onChange={event => setResourceStatusFilter(event.target.value as StatusFilter)}
                          className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-orange-300 dark:border-slate-800 dark:bg-slate-950"
                        >
                          {STATUS_FILTERS.map(status => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                      </label>

                      <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-3 dark:border-slate-800">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                          Filtered
                        </p>
                        <p className="mt-1 text-xl font-semibold tracking-[-0.03em] text-slate-950 dark:text-white">
                          {filteredResources.length}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-3 dark:border-slate-800">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                          Selected
                        </p>
                        <p className="mt-1 text-xl font-semibold tracking-[-0.03em] text-slate-950 dark:text-white">
                          {selectedResourceIds.length}
                        </p>
                      </div>

                      <div className="flex items-end">
                        <SmallButton icon={Download} onClick={exportFilteredResources} disabled={filteredResources.length === 0}>
                          Export filtered
                        </SmallButton>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <SmallButton icon={CheckCircle2} onClick={toggleSelectVisibleResources}>
                        {allVisibleResourcesSelected ? "Unselect visible" : "Select visible"}
                      </SmallButton>
                      <SmallButton
                        icon={ShieldCheck}
                        onClick={() => void updateResourcesActiveState(selectedResourceIds, false)}
                        disabled={selectedResourceIds.length === 0 || loadingTarget !== null}
                      >
                        Deactivate selected
                      </SmallButton>
                      <SmallButton
                        icon={ShieldCheck}
                        onClick={() => void updateResourcesActiveState(selectedResourceIds, true)}
                        disabled={selectedResourceIds.length === 0 || loadingTarget !== null}
                      >
                        Activate selected
                      </SmallButton>
                      <SmallButton
                        icon={Trash2}
                        tone="danger"
                        onClick={() => void deleteResources(selectedResourceIds)}
                        disabled={selectedResourceIds.length === 0 || loadingTarget !== null}
                      >
                        Delete selected
                      </SmallButton>
                    </div>
                  </div>

                  {showResourceImport ? (
                    <div className="rounded-[24px] border border-sky-200/70 bg-sky-50/70 p-4 dark:border-sky-900/60 dark:bg-sky-950/20">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-sky-800 dark:text-sky-200">Bulk resource import</p>
                          <p className="mt-1 text-sm text-sky-700/80 dark:text-sky-200/70">
                            Useful when you want to load PDF libraries, playlists, or notes in one pass.
                          </p>
                        </div>
                        <input
                          ref={resourceFileInputRef}
                          type="file"
                          accept=".csv,.tsv,.txt,.json"
                          className="hidden"
                          onChange={handleResourceFileUpload}
                        />
                        <SmallButton icon={FileSpreadsheet} onClick={() => resourceFileInputRef.current?.click()}>
                          Upload file
                        </SmallButton>
                      </div>

                      <textarea
                        value={resourceImportInput}
                        onChange={event => setResourceImportInput(event.target.value)}
                        rows={11}
                        placeholder="Paste resource data here..."
                        className="mt-4 w-full rounded-[22px] border border-sky-200 bg-white px-4 py-3 font-mono text-sm text-slate-900 outline-none transition focus:border-sky-300 dark:border-sky-900/70 dark:bg-slate-950 dark:text-white"
                      />

                      <div className="mt-4 flex flex-wrap gap-2">
                        <SmallButton
                          tone="primary"
                          icon={Upload}
                          onClick={() => void importResources()}
                          disabled={Boolean(resourceImportPreview.error) || resourceImportPreview.rows.length === 0 || loadingTarget !== null}
                        >
                          {loadingTarget === "import-resources" ? "Importing..." : "Import rows"}
                        </SmallButton>
                        <SmallButton onClick={() => setResourceImportInput(BULK_RESOURCE_TEMPLATE)}>
                          Fill template
                        </SmallButton>
                        <SmallButton
                          onClick={() => {
                            setResourceImportInput("");
                            setResourceImportSource("");
                          }}
                        >
                          Clear
                        </SmallButton>
                      </div>

                      <div className="mt-4 rounded-2xl border border-sky-200 bg-white/90 p-4 text-sm dark:border-sky-900/70 dark:bg-slate-950/70">
                        {resourceImportPreview.error ? (
                          <p className="text-rose-600 dark:text-rose-300">{resourceImportPreview.error}</p>
                        ) : resourceImportPreview.rows.length > 0 ? (
                          <div className="space-y-3">
                            <p className="font-medium text-slate-800 dark:text-slate-100">
                              {resourceImportPreview.rows.length} row{resourceImportPreview.rows.length === 1 ? "" : "s"} ready
                              {resourceImportSource ? ` from ${resourceImportSource}` : ""}
                            </p>
                            {resourceImportPreview.rows.slice(0, 2).map((row, index) => (
                              <div key={`${row.title}-${index}`} className="rounded-2xl border border-slate-200 p-3 dark:border-slate-800">
                                <p className="text-sm font-medium text-slate-900 dark:text-white">{row.title}</p>
                                <div className="mt-2 flex flex-wrap gap-2">
                                  <Pill tone="blue">{row.type}</Pill>
                                  <Pill tone="orange">{row.exam}</Pill>
                                  <Pill tone="slate">{row.category}</Pill>
                                  <Pill tone={row.is_active ? "green" : "rose"}>{row.is_active ? "Active" : "Inactive"}</Pill>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-slate-500 dark:text-slate-400">
                            Supported fields: title, description, type, url, exam, category, is_active.
                          </p>
                        )}
                      </div>
                    </div>
                  ) : null}
                </div>
              </SectionCard>

              {showResourceForm ? (
                <SectionCard
                  title={editingResourceId ? "Edit Resource" : "Create Resource"}
                  description="Add or tune a single resource when the bulk tool is overkill."
                  actions={
                    <SmallButton onClick={resetResourceForm} icon={X}>
                      Close editor
                    </SmallButton>
                  }
                >
                  <div className="space-y-4">
                    <div className="grid gap-3 md:grid-cols-2">
                      <label className="block">
                        <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                          Title
                        </span>
                        <input
                          value={resourceForm.title}
                          onChange={event => setResourceForm(current => ({ ...current, title: event.target.value }))}
                          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-orange-300 dark:border-slate-800 dark:bg-slate-950"
                        />
                      </label>

                      <label className="block">
                        <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                          URL
                        </span>
                        <input
                          value={resourceForm.url}
                          onChange={event => setResourceForm(current => ({ ...current, url: event.target.value }))}
                          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-orange-300 dark:border-slate-800 dark:bg-slate-950"
                        />
                      </label>
                    </div>

                    <label className="block">
                      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                        Description
                      </span>
                      <textarea
                        value={resourceForm.description}
                        onChange={event => setResourceForm(current => ({ ...current, description: event.target.value }))}
                        rows={3}
                        className="w-full rounded-[22px] border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-orange-300 dark:border-slate-800 dark:bg-slate-950"
                      />
                    </label>

                    <div className="grid gap-3 md:grid-cols-4">
                      <label className="block">
                        <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                          Type
                        </span>
                        <select
                          value={resourceForm.type}
                          onChange={event => setResourceForm(current => ({ ...current, type: event.target.value as ResourceType }))}
                          className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-orange-300 dark:border-slate-800 dark:bg-slate-950"
                        >
                          {RESOURCE_TYPES.map(type => (
                            <option key={type} value={type}>
                              {type}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label className="block">
                        <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                          Exam
                        </span>
                        <select
                          value={resourceForm.exam}
                          onChange={event => setResourceForm(current => ({ ...current, exam: event.target.value as ResourceExam }))}
                          className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-orange-300 dark:border-slate-800 dark:bg-slate-950"
                        >
                          {RESOURCE_EXAMS.map(exam => (
                            <option key={exam} value={exam}>
                              {exam}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label className="block">
                        <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                          Category
                        </span>
                        <select
                          value={resourceForm.category}
                          onChange={event => setResourceForm(current => ({ ...current, category: event.target.value as ResourceCategory }))}
                          className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-orange-300 dark:border-slate-800 dark:bg-slate-950"
                        >
                          {availableResourceCategories.filter(category => category !== "All").map(category => (
                            <option key={category} value={category}>
                              {category}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label className="flex items-end gap-2 rounded-2xl border border-slate-200 px-4 py-3 dark:border-slate-800">
                        <input
                          type="checkbox"
                          checked={resourceForm.is_active}
                          onChange={event => setResourceForm(current => ({ ...current, is_active: event.target.checked }))}
                          className="accent-orange-500"
                        />
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Active row</span>
                      </label>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <SmallButton
                        tone="primary"
                        icon={CheckCircle2}
                        onClick={() => void saveResource()}
                        disabled={loadingTarget !== null}
                      >
                        {loadingTarget === "save-resource"
                          ? "Saving..."
                          : editingResourceId
                            ? "Update resource"
                            : "Save resource"}
                      </SmallButton>
                      <SmallButton onClick={resetResourceForm}>Cancel</SmallButton>
                    </div>
                  </div>
                </SectionCard>
              ) : null}

              <SectionCard
                title="Resource Inventory"
                description="Keep the public resource page trustworthy by archiving stale links and exporting clean subsets."
              >
                {filteredResources.length === 0 ? (
                  <EmptyState
                    icon={FileText}
                    title="No resources match the current filters"
                    description="Widen the filters or import a new batch."
                  />
                ) : (
                  <div className="space-y-3">
                    {filteredResources.map(resource => {
                      const resourceId = toId(resource.id);
                      const selected = selectedResourceIds.includes(resourceId);
                      const active = resource.is_active !== false;

                      return (
                        <div
                          key={resourceId}
                          className={cn(
                            "rounded-[24px] border p-4 transition",
                            selected
                              ? "border-sky-300 bg-sky-50/60 dark:border-sky-900 dark:bg-sky-950/10"
                              : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950"
                          )}
                        >
                          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                            <div className="flex gap-3">
                              <input
                                type="checkbox"
                                checked={selected}
                                onChange={() => toggleResourceSelection(resourceId)}
                                className="mt-1 h-4 w-4 rounded accent-orange-500"
                              />
                              <div>
                                <p className="text-base font-medium text-slate-950 dark:text-white">{resource.title}</p>
                                {resource.description ? (
                                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{resource.description}</p>
                                ) : null}
                                <div className="mt-3 flex flex-wrap gap-2">
                                  <Pill tone="blue">{resource.type || "Link"}</Pill>
                                  <Pill tone="orange">{resource.exam || "All"}</Pill>
                                  <Pill tone="slate">{resource.category || "General"}</Pill>
                                  <Pill tone={active ? "green" : "rose"}>{active ? "Active" : "Inactive"}</Pill>
                                </div>
                                <a
                                  href={resource.url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="mt-3 inline-flex items-center gap-2 text-sm text-orange-600 hover:underline dark:text-orange-300"
                                >
                                  <LinkIcon size={14} />
                                  {resource.url}
                                </a>
                              </div>
                            </div>

                            <div className="flex shrink-0 flex-wrap gap-2 lg:justify-end">
                              <SmallButton icon={Edit2} onClick={() => startEditResource(resource)}>
                                Edit
                              </SmallButton>
                              <SmallButton
                                icon={ShieldCheck}
                                onClick={() => void updateResourcesActiveState([resourceId], !active)}
                                disabled={loadingTarget !== null}
                              >
                                {active ? "Deactivate" : "Activate"}
                              </SmallButton>
                              <SmallButton
                                icon={Trash2}
                                tone="danger"
                                onClick={() => void deleteResources([resourceId])}
                                disabled={loadingTarget !== null}
                              >
                                Delete
                              </SmallButton>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </SectionCard>
            </>
          ) : null}

          {activeTab === "updates" ? (
            <>
              <SectionCard
                title="Updates Manager"
                description="Run the public updates desk from here. Add live recruitment rows, bulk import notices, and quickly archive stale entries."
                actions={
                  <>
                    <SmallButton icon={Upload} onClick={() => setShowUpdateImport(current => !current)}>
                      {showUpdateImport ? "Hide import" : "Open import"}
                    </SmallButton>
                    <SmallButton icon={Plus} tone="primary" onClick={openNewUpdateForm}>
                      Add update
                    </SmallButton>
                  </>
                }
              >
                <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
                  <div className="space-y-4">
                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
                      <label className="xl:col-span-2">
                        <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                          Search
                        </span>
                        <div className="relative">
                          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            value={updateSearch}
                            onChange={event => setUpdateSearch(event.target.value)}
                            placeholder="Title, organization, state, tags..."
                            className="search-input-reset search-input-with-icon w-full rounded-2xl border border-slate-200 bg-white py-2.5 text-sm outline-none transition focus:border-orange-300 dark:border-slate-800 dark:bg-slate-950"
                          />
                        </div>
                      </label>

                      <label>
                        <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                          State
                        </span>
                        <select
                          value={updateStateFilter}
                          onChange={event => setUpdateStateFilter(event.target.value)}
                          className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-orange-300 dark:border-slate-800 dark:bg-slate-950"
                        >
                          {availableUpdateStates.map(state => (
                            <option key={state} value={state}>
                              {state}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label>
                        <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                          Exam type
                        </span>
                        <select
                          value={updateExamTypeFilter}
                          onChange={event => setUpdateExamTypeFilter(event.target.value as "All" | UpdateExamType)}
                          className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-orange-300 dark:border-slate-800 dark:bg-slate-950"
                        >
                          <option value="All">All</option>
                          {EXAM_TYPES.map(type => (
                            <option key={type} value={type}>
                              {type}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label>
                        <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                          Eligibility
                        </span>
                        <select
                          value={updateQualificationFilter}
                          onChange={event => setUpdateQualificationFilter(event.target.value as "All" | QualificationTier)}
                          className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-orange-300 dark:border-slate-800 dark:bg-slate-950"
                        >
                          <option value="All">All</option>
                          {QUALIFICATION_TIERS.map(qualification => (
                            <option key={qualification} value={qualification}>
                              {qualification}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>

                    <div className="grid gap-3 md:grid-cols-5">
                      <label>
                        <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                          Row status
                        </span>
                        <select
                          value={updateStatusFilter}
                          onChange={event => setUpdateStatusFilter(event.target.value as StatusFilter)}
                          className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-orange-300 dark:border-slate-800 dark:bg-slate-950"
                        >
                          {STATUS_FILTERS.map(status => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label>
                        <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                          Timeline
                        </span>
                        <select
                          value={updateTimelineFilter}
                          onChange={event => setUpdateTimelineFilter(event.target.value as UpdateTimelineFilter)}
                          className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-orange-300 dark:border-slate-800 dark:bg-slate-950"
                        >
                          {UPDATE_TIMELINE_FILTERS.map(status => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                      </label>

                      <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-3 dark:border-slate-800">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                          Filtered
                        </p>
                        <p className="mt-1 text-xl font-semibold tracking-[-0.03em] text-slate-950 dark:text-white">
                          {filteredUpdates.length}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-3 dark:border-slate-800">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                          Selected
                        </p>
                        <p className="mt-1 text-xl font-semibold tracking-[-0.03em] text-slate-950 dark:text-white">
                          {selectedUpdateIds.length}
                        </p>
                      </div>

                      <div className="flex items-end">
                        <SmallButton icon={Download} onClick={exportFilteredUpdates} disabled={filteredUpdates.length === 0}>
                          Export filtered
                        </SmallButton>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <SmallButton icon={CheckCircle2} onClick={toggleSelectVisibleUpdates}>
                        {allVisibleUpdatesSelected ? "Unselect visible" : "Select visible"}
                      </SmallButton>
                      <SmallButton
                        icon={ShieldCheck}
                        onClick={() => void updateUpdatesActiveState(selectedUpdateIds, false)}
                        disabled={selectedUpdateIds.length === 0 || loadingTarget !== null}
                      >
                        Deactivate selected
                      </SmallButton>
                      <SmallButton
                        icon={ShieldCheck}
                        onClick={() => void updateUpdatesActiveState(selectedUpdateIds, true)}
                        disabled={selectedUpdateIds.length === 0 || loadingTarget !== null}
                      >
                        Activate selected
                      </SmallButton>
                      <SmallButton
                        icon={Trash2}
                        tone="danger"
                        onClick={() => void deleteUpdates(selectedUpdateIds)}
                        disabled={selectedUpdateIds.length === 0 || loadingTarget !== null}
                      >
                        Delete selected
                      </SmallButton>
                    </div>
                  </div>

                  {showUpdateImport ? (
                    <div className="rounded-[24px] border border-violet-200/70 bg-violet-50/70 p-4 dark:border-violet-900/60 dark:bg-violet-950/20">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-violet-800 dark:text-violet-200">Bulk updates import</p>
                          <p className="mt-1 text-sm text-violet-700/80 dark:text-violet-200/70">
                            Load application windows in one pass from CSV, TSV, pasted Sheets rows, or JSON.
                          </p>
                        </div>
                        <input
                          ref={updateFileInputRef}
                          type="file"
                          accept=".csv,.tsv,.txt,.json"
                          className="hidden"
                          onChange={handleUpdateFileUpload}
                        />
                        <SmallButton icon={FileSpreadsheet} onClick={() => updateFileInputRef.current?.click()}>
                          Upload file
                        </SmallButton>
                      </div>

                      <textarea
                        value={updateImportInput}
                        onChange={event => setUpdateImportInput(event.target.value)}
                        rows={11}
                        placeholder="Paste update data here..."
                        className="mt-4 w-full rounded-[22px] border border-violet-200 bg-white px-4 py-3 font-mono text-sm text-slate-900 outline-none transition focus:border-violet-300 dark:border-violet-900/70 dark:bg-slate-950 dark:text-white"
                      />

                      <div className="mt-4 flex flex-wrap gap-2">
                        <SmallButton
                          tone="primary"
                          icon={Upload}
                          onClick={() => void importUpdates()}
                          disabled={Boolean(updateImportPreview.error) || updateImportPreview.rows.length === 0 || loadingTarget !== null}
                        >
                          {loadingTarget === "import-updates" ? "Importing..." : "Import rows"}
                        </SmallButton>
                        <SmallButton onClick={() => setUpdateImportInput(BULK_UPDATE_TEMPLATE)}>
                          Fill template
                        </SmallButton>
                        <SmallButton
                          onClick={() => {
                            setUpdateImportInput("");
                            setUpdateImportSource("");
                          }}
                        >
                          Clear
                        </SmallButton>
                      </div>

                      <div className="mt-4 rounded-2xl border border-violet-200 bg-white/90 p-4 text-sm dark:border-violet-900/70 dark:bg-slate-950/70">
                        {updateImportPreview.error ? (
                          <p className="text-rose-600 dark:text-rose-300">{updateImportPreview.error}</p>
                        ) : updateImportPreview.rows.length > 0 ? (
                          <div className="space-y-3">
                            <p className="font-medium text-slate-800 dark:text-slate-100">
                              {updateImportPreview.rows.length} row{updateImportPreview.rows.length === 1 ? "" : "s"} ready
                              {updateImportSource ? ` from ${updateImportSource}` : ""}
                            </p>
                            {updateImportPreview.rows.slice(0, 2).map((row, index) => (
                              <div key={`${row.title}-${index}`} className="rounded-2xl border border-slate-200 p-3 dark:border-slate-800">
                                <p className="text-sm font-medium text-slate-900 dark:text-white">{row.title}</p>
                                <div className="mt-2 flex flex-wrap gap-2">
                                  <Pill tone="blue">{row.exam_type}</Pill>
                                  <Pill tone="orange">{row.qualification}</Pill>
                                  <Pill tone="slate">{row.state}</Pill>
                                  <Pill tone={row.is_active ? "green" : "rose"}>{row.is_active ? "Active" : "Inactive"}</Pill>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-slate-500 dark:text-slate-400">
                            Supported fields: title, organization, exam_type, state, qualification, eligibility, application_start, last_date, exam_window, updated_at, summary, tags, apply_url, notice_url, is_active.
                          </p>
                        )}
                      </div>
                    </div>
                  ) : null}
                </div>
              </SectionCard>

              <SectionCard
                title="Updates metrics"
                description="Watch how the opportunity desk is balanced between live forms, upcoming notices, and near-deadline items."
              >
                <div className="grid gap-4 md:grid-cols-4">
                  <MetricCard label="Total" value={updateStats.total} hint="All rows in Supabase" icon={Database} tone="orange" />
                  <MetricCard label="Open" value={updateStats.open} hint="Currently accepting forms" icon={Bell} tone="green" />
                  <MetricCard label="Closing soon" value={updateStats.closingSoon} hint="Within the next 7 days" icon={CalendarDays} tone="rose" />
                  <MetricCard label="Upcoming" value={updateStats.upcoming} hint="Good for early tracking" icon={Layers3} tone="blue" />
                </div>
              </SectionCard>

              {showUpdateForm ? (
                <SectionCard
                  title={editingUpdateId ? "Edit Update Entry" : "Create Update Entry"}
                  description="This maps directly to the public updates page. Keep notice links official and summaries short."
                  actions={<SmallButton onClick={resetUpdateForm} icon={X}>Close editor</SmallButton>}
                >
                  <div className="space-y-4">
                    <div className="grid gap-3 md:grid-cols-2">
                      <label className="block">
                        <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                          Title
                        </span>
                        <input
                          value={updateForm.title}
                          onChange={event => setUpdateForm(current => ({ ...current, title: event.target.value }))}
                          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-orange-300 dark:border-slate-800 dark:bg-slate-950"
                        />
                      </label>

                      <label className="block">
                        <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                          Organization
                        </span>
                        <input
                          value={updateForm.organization}
                          onChange={event => setUpdateForm(current => ({ ...current, organization: event.target.value }))}
                          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-orange-300 dark:border-slate-800 dark:bg-slate-950"
                        />
                      </label>
                    </div>

                    <div className="grid gap-3 md:grid-cols-4">
                      <label className="block">
                        <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                          Exam type
                        </span>
                        <select
                          value={updateForm.exam_type}
                          onChange={event => setUpdateForm(current => ({ ...current, exam_type: event.target.value as UpdateExamType }))}
                          className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-orange-300 dark:border-slate-800 dark:bg-slate-950"
                        >
                          {EXAM_TYPES.map(type => (
                            <option key={type} value={type}>
                              {type}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label className="block">
                        <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                          State
                        </span>
                        <input
                          value={updateForm.state}
                          onChange={event => setUpdateForm(current => ({ ...current, state: event.target.value }))}
                          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-orange-300 dark:border-slate-800 dark:bg-slate-950"
                        />
                      </label>

                      <label className="block">
                        <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                          Qualification
                        </span>
                        <select
                          value={updateForm.qualification}
                          onChange={event => setUpdateForm(current => ({ ...current, qualification: event.target.value as QualificationTier }))}
                          className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-orange-300 dark:border-slate-800 dark:bg-slate-950"
                        >
                          {QUALIFICATION_TIERS.map(qualification => (
                            <option key={qualification} value={qualification}>
                              {qualification}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label className="flex items-end gap-2 rounded-2xl border border-slate-200 px-4 py-3 dark:border-slate-800">
                        <input
                          type="checkbox"
                          checked={updateForm.is_active}
                          onChange={event => setUpdateForm(current => ({ ...current, is_active: event.target.checked }))}
                          className="accent-orange-500"
                        />
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Active row</span>
                      </label>
                    </div>

                    <label className="block">
                      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                        Eligibility
                      </span>
                      <textarea
                        value={updateForm.eligibility}
                        onChange={event => setUpdateForm(current => ({ ...current, eligibility: event.target.value }))}
                        rows={3}
                        className="w-full rounded-[22px] border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-orange-300 dark:border-slate-800 dark:bg-slate-950"
                      />
                    </label>

                    <label className="block">
                      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                        Summary
                      </span>
                      <textarea
                        value={updateForm.summary}
                        onChange={event => setUpdateForm(current => ({ ...current, summary: event.target.value }))}
                        rows={3}
                        className="w-full rounded-[22px] border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-orange-300 dark:border-slate-800 dark:bg-slate-950"
                      />
                    </label>

                    <div className="grid gap-3 md:grid-cols-4">
                      <label className="block">
                        <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                          Apply start
                        </span>
                        <input
                          type="date"
                          value={updateForm.application_start}
                          onChange={event => setUpdateForm(current => ({ ...current, application_start: event.target.value }))}
                          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-orange-300 dark:border-slate-800 dark:bg-slate-950"
                        />
                      </label>

                      <label className="block">
                        <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                          Last date
                        </span>
                        <input
                          type="date"
                          value={updateForm.last_date}
                          onChange={event => setUpdateForm(current => ({ ...current, last_date: event.target.value }))}
                          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-orange-300 dark:border-slate-800 dark:bg-slate-950"
                        />
                      </label>

                      <label className="block">
                        <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                          Updated at
                        </span>
                        <input
                          type="date"
                          value={updateForm.updated_at}
                          onChange={event => setUpdateForm(current => ({ ...current, updated_at: event.target.value }))}
                          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-orange-300 dark:border-slate-800 dark:bg-slate-950"
                        />
                      </label>

                      <label className="block">
                        <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                          Exam window
                        </span>
                        <input
                          value={updateForm.exam_window}
                          onChange={event => setUpdateForm(current => ({ ...current, exam_window: event.target.value }))}
                          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-orange-300 dark:border-slate-800 dark:bg-slate-950"
                        />
                      </label>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2">
                      <label className="block">
                        <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                          Apply URL
                        </span>
                        <input
                          value={updateForm.apply_url}
                          onChange={event => setUpdateForm(current => ({ ...current, apply_url: event.target.value }))}
                          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-orange-300 dark:border-slate-800 dark:bg-slate-950"
                        />
                      </label>

                      <label className="block">
                        <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                          Notice URL
                        </span>
                        <input
                          value={updateForm.notice_url}
                          onChange={event => setUpdateForm(current => ({ ...current, notice_url: event.target.value }))}
                          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-orange-300 dark:border-slate-800 dark:bg-slate-950"
                        />
                      </label>
                    </div>

                    <label className="block">
                      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                        Tags
                      </span>
                      <input
                        value={updateForm.tags}
                        onChange={event => setUpdateForm(current => ({ ...current, tags: event.target.value }))}
                        placeholder="graduate jobs, central govt, tier i"
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-orange-300 dark:border-slate-800 dark:bg-slate-950"
                      />
                    </label>

                    <div className="flex flex-wrap gap-2">
                      <SmallButton tone="primary" icon={CheckCircle2} onClick={() => void saveUpdate()} disabled={loadingTarget !== null}>
                        {loadingTarget === "save-update"
                          ? "Saving..."
                          : editingUpdateId
                            ? "Update entry"
                            : "Save entry"}
                      </SmallButton>
                      <SmallButton onClick={resetUpdateForm}>Cancel</SmallButton>
                    </div>
                  </div>
                </SectionCard>
              ) : null}

              <SectionCard
                title="Update Inventory"
                description="This feeds the public updates page. Keep titles clear, links official, and inactive rows out of the live desk."
              >
                {filteredUpdates.length === 0 ? (
                  <EmptyState
                    icon={Bell}
                    title="No updates match the current filters"
                    description="Widen the filters or import a fresh batch of notice rows."
                  />
                ) : (
                  <div className="space-y-3">
                    {filteredUpdates.map(update => {
                      const updateId = toId(update.id);
                      const selected = selectedUpdateIds.includes(updateId);
                      const active = update.is_active !== false;
                      const timeline = adminUpdateTimeline(update);

                      return (
                        <div
                          key={updateId}
                          className={cn(
                            "rounded-[24px] border p-4 transition",
                            selected
                              ? "border-violet-300 bg-violet-50/60 dark:border-violet-900 dark:bg-violet-950/10"
                              : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950"
                          )}
                        >
                          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                            <div className="flex gap-3">
                              <input
                                type="checkbox"
                                checked={selected}
                                onChange={() => toggleUpdateSelection(updateId)}
                                className="mt-1 h-4 w-4 rounded accent-orange-500"
                              />
                              <div>
                                <p className="text-base font-medium text-slate-950 dark:text-white">{update.title}</p>
                                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                  {update.organization}
                                </p>
                                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{update.summary}</p>
                                <div className="mt-3 flex flex-wrap gap-2">
                                  <Pill tone="blue">{update.exam_type}</Pill>
                                  <Pill tone="orange">{update.qualification}</Pill>
                                  <Pill tone="slate">{update.state}</Pill>
                                  <Pill tone={active ? "green" : "rose"}>{active ? "Active" : "Inactive"}</Pill>
                                  <Pill tone={timeline === "Closing Soon" ? "rose" : timeline === "Open" ? "green" : "blue"}>
                                    {timeline}
                                  </Pill>
                                </div>
                                <div className="mt-3 flex flex-wrap gap-2 text-sm text-slate-500 dark:text-slate-400">
                                  <span>{formatDate(update.application_start)} to {formatDate(update.last_date)}</span>
                                  <span>•</span>
                                  <span>{update.exam_window}</span>
                                </div>
                                <div className="mt-3 flex flex-wrap gap-3">
                                  <a
                                    href={update.apply_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-2 text-sm text-orange-600 hover:underline dark:text-orange-300"
                                  >
                                    <LinkIcon size={14} />
                                    Apply link
                                  </a>
                                  <a
                                    href={update.notice_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-2 text-sm text-orange-600 hover:underline dark:text-orange-300"
                                  >
                                    <LinkIcon size={14} />
                                    Notice link
                                  </a>
                                </div>
                              </div>
                            </div>

                            <div className="flex shrink-0 flex-wrap gap-2 lg:justify-end">
                              <SmallButton icon={Edit2} onClick={() => startEditUpdate(update)}>
                                Edit
                              </SmallButton>
                              <SmallButton
                                icon={ShieldCheck}
                                onClick={() => void updateUpdatesActiveState([updateId], !active)}
                                disabled={loadingTarget !== null}
                              >
                                {active ? "Deactivate" : "Activate"}
                              </SmallButton>
                              <SmallButton
                                icon={Trash2}
                                tone="danger"
                                onClick={() => void deleteUpdates([updateId])}
                                disabled={loadingTarget !== null}
                              >
                                Delete
                              </SmallButton>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </SectionCard>
            </>
          ) : null}

          {activeTab === "contests" ? (
            <>
              <SectionCard
                title="Contest Manager"
                description="Keep upcoming and past contests current so the public contests page stays credible."
                actions={
                  <SmallButton icon={Plus} tone="primary" onClick={() => setShowContestForm(current => !current)}>
                    {showContestForm ? "Close editor" : "Add contest"}
                  </SmallButton>
                }
              >
                <div className="grid gap-4 md:grid-cols-3">
                  <MetricCard label="Upcoming" value={dbContests.filter(contest => contest.status === "upcoming").length} hint="Visible contests users can prepare for" icon={Trophy} tone="orange" />
                  <MetricCard label="Past" value={dbContests.filter(contest => contest.status === "past").length} hint="Completed contests with winners or ranks" icon={Layers3} tone="blue" />
                  <MetricCard label="Total" value={dbContests.length} hint="All live contest rows in Supabase" icon={Database} tone="green" />
                </div>
              </SectionCard>

              {showContestForm ? (
                <SectionCard
                  title={editingContestId ? "Edit Contest" : "Create Contest"}
                  description="Use this to keep dates, prizes, and topic scope aligned with what the public page shows."
                  actions={<SmallButton onClick={resetContestForm} icon={X}>Close editor</SmallButton>}
                >
                  <div className="grid gap-3 md:grid-cols-2">
                    <input
                      value={contestForm.name}
                      onChange={event => setContestForm(current => ({ ...current, name: event.target.value }))}
                      placeholder="Contest name"
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-orange-300 dark:border-slate-800 dark:bg-slate-950"
                    />
                    <input
                      value={contestForm.date}
                      onChange={event => setContestForm(current => ({ ...current, date: event.target.value }))}
                      placeholder="March 28, 2026"
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-orange-300 dark:border-slate-800 dark:bg-slate-950"
                    />
                    <input
                      value={contestForm.duration}
                      onChange={event => setContestForm(current => ({ ...current, duration: event.target.value }))}
                      placeholder="60 minutes"
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-orange-300 dark:border-slate-800 dark:bg-slate-950"
                    />
                    <select
                      value={contestForm.status}
                      onChange={event => setContestForm(current => ({ ...current, status: event.target.value as ContestStatus }))}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-orange-300 dark:border-slate-800 dark:bg-slate-950"
                    >
                      {CONTEST_STATUSES.map(status => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                    <input
                      value={contestForm.topics}
                      onChange={event => setContestForm(current => ({ ...current, topics: event.target.value }))}
                      placeholder="GS1 + CSAT"
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-orange-300 dark:border-slate-800 dark:bg-slate-950"
                    />
                    <input
                      value={contestForm.prize}
                      onChange={event => setContestForm(current => ({ ...current, prize: event.target.value }))}
                      placeholder="Prize"
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-orange-300 dark:border-slate-800 dark:bg-slate-950"
                    />
                    <input
                      value={contestForm.winner}
                      onChange={event => setContestForm(current => ({ ...current, winner: event.target.value }))}
                      placeholder="Winner (optional)"
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-orange-300 dark:border-slate-800 dark:bg-slate-950"
                    />
                    <input
                      value={contestForm.your_rank}
                      onChange={event => setContestForm(current => ({ ...current, your_rank: event.target.value }))}
                      placeholder="Your rank (optional)"
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-orange-300 dark:border-slate-800 dark:bg-slate-950"
                    />
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <SmallButton tone="primary" icon={CheckCircle2} onClick={() => void saveContest()} disabled={loadingTarget !== null}>
                      {loadingTarget === "save-contest"
                        ? "Saving..."
                        : editingContestId
                          ? "Update contest"
                          : "Save contest"}
                    </SmallButton>
                    <SmallButton onClick={resetContestForm}>Cancel</SmallButton>
                  </div>
                </SectionCard>
              ) : null}

              <SectionCard title="Contest Inventory" description="Quickly update schedule changes or clean out outdated entries.">
                {dbContests.length === 0 ? (
                  <EmptyState
                    icon={Trophy}
                    title="No contests yet"
                    description="Add the first contest row to populate the public page."
                  />
                ) : (
                  <div className="grid gap-3 md:grid-cols-2">
                    {dbContests.map(contest => (
                      <div key={toId(contest.id)} className="rounded-[24px] border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-base font-medium text-slate-950 dark:text-white">{contest.name}</p>
                            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{contest.topics}</p>
                          </div>
                          <Pill tone={contest.status === "upcoming" ? "orange" : "blue"}>{contest.status}</Pill>
                        </div>
                        <div className="mt-4 flex flex-wrap gap-2">
                          <Pill tone="slate">{contest.date}</Pill>
                          <Pill tone="green">{contest.duration}</Pill>
                          <Pill tone="slate">{contest.prize}</Pill>
                        </div>
                        <div className="mt-4 flex flex-wrap gap-2">
                          <SmallButton icon={Edit2} onClick={() => startEditContest(contest)}>
                            Edit
                          </SmallButton>
                          <SmallButton icon={Trash2} tone="danger" onClick={() => void deleteContest(toId(contest.id))}>
                            Delete
                          </SmallButton>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </SectionCard>
            </>
          ) : null}

          {activeTab === "support" ? (
            <SectionCard
              title="Support Inbox"
              description="Use search to triage recurring issues, broken questions, or billing complaints without hopping between tools."
            >
              <div className="mb-5 max-w-xl">
                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                    Search
                  </span>
                  <div className="relative">
                    <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      value={supportSearch}
                      onChange={event => setSupportSearch(event.target.value)}
                      placeholder="Email, category, subject, or message..."
                      className="search-input-reset search-input-with-icon w-full rounded-2xl border border-slate-200 bg-white py-2.5 text-sm outline-none transition focus:border-orange-300 dark:border-slate-800 dark:bg-slate-950"
                    />
                  </div>
                </label>
              </div>

              {filteredSupportRequests.length === 0 ? (
                <EmptyState
                  icon={AlertCircle}
                  title="No support requests found"
                  description="New messages from the support form will show up here."
                />
              ) : (
                <div className="space-y-3">
                  {filteredSupportRequests.map(request => (
                    <div key={toId(request.id)} className="rounded-[24px] border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div>
                          <div className="flex flex-wrap gap-2">
                            <Pill tone="orange">{request.category || "General support"}</Pill>
                            <Pill tone="slate">{request.email}</Pill>
                            <Pill tone="blue">{request.source || "support_page_direct"}</Pill>
                            <Pill tone={supportStatusTone(request.status)}>{request.status || "open"}</Pill>
                            <Pill tone="slate">
                              {supportRepliesByRequestId[toId(request.id)]?.length || 0} replies
                            </Pill>
                          </div>
                          <p className="mt-3 text-base font-medium text-slate-950 dark:text-white">
                            {request.subject || "No subject"}
                          </p>
                          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600 dark:text-slate-300">
                            {request.message || "No message provided."}
                          </p>
                          <div className="mt-4 flex flex-wrap gap-2">
                            <SmallButton icon={Send} tone="primary" onClick={() => openReplyDialog(request)}>
                              Reply Here
                            </SmallButton>
                            <a
                              href={buildSupportReplyLink(request)}
                              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900"
                            >
                              Open Email App
                            </a>
                            <SmallButton
                              onClick={() => void updateSupportStatus(toId(request.id), "open")}
                              disabled={request.status === "open"}
                            >
                              Open
                            </SmallButton>
                            <SmallButton
                              onClick={() => void updateSupportStatus(toId(request.id), "in_progress")}
                              disabled={request.status === "in_progress"}
                            >
                              In Progress
                            </SmallButton>
                            <SmallButton
                              onClick={() => void updateSupportStatus(toId(request.id), "resolved")}
                              disabled={request.status === "resolved"}
                            >
                              Resolved
                            </SmallButton>
                          </div>
                          {supportRepliesByRequestId[toId(request.id)]?.length ? (
                            <div className="mt-4 rounded-2xl border border-slate-200/80 bg-slate-50/60 p-3 dark:border-slate-800 dark:bg-slate-900/40">
                              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                                Reply History
                              </p>
                              <div className="mt-3 space-y-3">
                                {supportRepliesByRequestId[toId(request.id)].map((reply) => (
                                  <div key={toId(reply.id)} className="rounded-2xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-950">
                                    <div className="flex flex-wrap items-center gap-2">
                                      <Pill tone="blue">Sent</Pill>
                                      <Pill tone="slate">{reply.to_email}</Pill>
                                      {reply.sent_by_email ? <Pill tone="slate">{reply.sent_by_email}</Pill> : null}
                                    </div>
                                    <p className="mt-3 text-sm font-medium text-slate-900 dark:text-white">
                                      {reply.subject}
                                    </p>
                                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600 dark:text-slate-300">
                                      {reply.message}
                                    </p>
                                    <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                                      {formatDate(reply.sent_at || reply.created_at)}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : null}
                        </div>
                        <div className="text-sm text-slate-500 dark:text-slate-400">{formatDate(request.created_at)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </SectionCard>
          ) : null}
        </div>
      </main>
    </div>
  );
}

export default Admin;
