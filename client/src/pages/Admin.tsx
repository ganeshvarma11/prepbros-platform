import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation } from "wouter";
import {
  AlertCircle,
  BookOpen,
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
  Plus,
  RefreshCcw,
  Search,
  Send,
  ShieldCheck,
  Trash2,
  Trophy,
  Upload,
  X,
  type LucideIcon,
} from "lucide-react";

import type { Difficulty, Exam, QuestionType } from "@/data/questions";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { chunkQuestions, parseBulkQuestionInput, type ImportedQuestionPayload } from "@/lib/questionImport";
import { buildMailtoLink } from "@/lib/siteConfig";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

const ADMIN_EMAIL = "rakeshmeesa631@gmail.com";

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
const ADMIN_TABS = ["questions", "resources", "contests", "support"] as const;

const BULK_IMPORT_TEMPLATE = `question,option_a,option_b,option_c,option_d,correct_option,explanation,exam,topic,subtopic,difficulty,type,year,tags
Which Article of the Indian Constitution deals with the Right to Education?,Article 19,Article 21A,Article 24,Article 32,B,Article 21A makes free and compulsory education a fundamental right for children aged 6-14.,UPSC,Polity,Fundamental Rights,Easy,PYQ,2019,constitution|education|article-21a`;

const BULK_RESOURCE_TEMPLATE = `title,description,type,url,exam,category,is_active
UPSC Previous Year Papers,Official UPSC previous question papers,PDF,https://upsc.gov.in/examinations/previous-question-papers,UPSC,Previous Papers,true`;

type AdminTab = (typeof ADMIN_TABS)[number];
type FilterExam = (typeof FILTER_EXAMS)[number];
type StatusFilter = (typeof STATUS_FILTERS)[number];
type ResourceExam = (typeof RESOURCE_EXAMS)[number];
type ResourceType = (typeof RESOURCE_TYPES)[number];
type ResourceCategory = (typeof RESOURCE_CATEGORIES)[number];
type ContestStatus = (typeof CONTEST_STATUSES)[number];
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

function toId(value: string | number | null | undefined) {
  return String(value ?? "");
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
      return "border-orange-200/70 bg-orange-50 text-orange-700 dark:border-orange-900/70 dark:bg-orange-950/30 dark:text-orange-300";
    case "blue":
      return "border-sky-200/70 bg-sky-50 text-sky-700 dark:border-sky-900/70 dark:bg-sky-950/30 dark:text-sky-300";
    case "green":
      return "border-emerald-200/70 bg-emerald-50 text-emerald-700 dark:border-emerald-900/70 dark:bg-emerald-950/30 dark:text-emerald-300";
    case "rose":
      return "border-rose-200/70 bg-rose-50 text-rose-700 dark:border-rose-900/70 dark:bg-rose-950/30 dark:text-rose-300";
    default:
      return "border-slate-200/80 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-300";
  }
}

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
    <div className="rounded-[24px] border border-white/60 bg-white/90 p-4 shadow-[0_10px_30px_rgba(15,23,42,0.06)] backdrop-blur dark:border-white/5 dark:bg-slate-950/70">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
            {label}
          </p>
          <p className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-slate-950 dark:text-white">
            {value}
          </p>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{hint}</p>
        </div>
        <div className={cn("inline-flex h-11 w-11 items-center justify-center rounded-2xl border", metricToneClasses(tone))}>
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
    <section className="rounded-[28px] border border-white/60 bg-white/90 p-5 shadow-[0_12px_34px_rgba(15,23,42,0.06)] backdrop-blur dark:border-white/5 dark:bg-slate-950/70 md:p-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-[-0.03em] text-slate-950 dark:text-white">
            {title}
          </h2>
          {description ? (
            <p className="mt-1 max-w-3xl text-sm text-slate-500 dark:text-slate-400">{description}</p>
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
        "inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-medium",
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
        "inline-flex items-center gap-2 rounded-2xl px-3.5 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50",
        tone === "primary" &&
          "bg-orange-500 text-white hover:bg-orange-600",
        tone === "danger" &&
          "border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 dark:border-rose-900/70 dark:bg-rose-950/30 dark:text-rose-300 dark:hover:bg-rose-950/50",
        tone === "neutral" &&
          "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900"
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
    <div className="rounded-[24px] border border-dashed border-slate-200 px-6 py-12 text-center dark:border-slate-800">
      <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 dark:bg-slate-900 dark:text-slate-300">
        <Icon size={20} />
      </div>
      <p className="mt-4 text-base font-semibold text-slate-900 dark:text-white">{title}</p>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{description}</p>
    </div>
  );
}

function Admin() {
  const [, navigate] = useLocation();
  const { user, session, signOut, loading: authLoading } = useAuth();

  const [activeTab, setActiveTab] = useState<AdminTab>("questions");
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

  const [dbContests, setDbContests] = useState<ContestRecord[]>([]);
  const [contestForm, setContestForm] = useState<ContestForm>({ ...EMPTY_C });
  const [editingContestId, setEditingContestId] = useState<string | null>(null);
  const [showContestForm, setShowContestForm] = useState(false);

  const [supportRequests, setSupportRequests] = useState<SupportRequest[]>([]);
  const [supportReplies, setSupportReplies] = useState<SupportReply[]>([]);
  const [supportSearch, setSupportSearch] = useState("");
  const [replyTarget, setReplyTarget] = useState<SupportRequest | null>(null);
  const [replySubject, setReplySubject] = useState("");
  const [replyMessage, setReplyMessage] = useState("");
  const [sendingReply, setSendingReply] = useState(false);

  const questionFileInputRef = useRef<HTMLInputElement | null>(null);
  const resourceFileInputRef = useRef<HTMLInputElement | null>(null);

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    window.setTimeout(() => setToast(null), 3000);
  };

  const setBusy = (target: string | null) => {
    setLoadingTarget(target);
  };

  const loadQuestions = async () => {
    const { data, error } = await supabase
      .from("questions_db")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    setDbQuestions((data || []) as QuestionRecord[]);
  };

  const loadResources = async () => {
    const { data, error } = await supabase
      .from("resources")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    setDbResources((data || []) as ResourceRecord[]);
  };

  const loadContests = async () => {
    const { data, error } = await supabase
      .from("contests")
      .select("*")
      .order("date", { ascending: true });

    if (error) throw error;
    setDbContests((data || []) as ContestRecord[]);
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
        loadQuestions(),
        loadResources(),
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
          loadQuestions(),
          loadResources(),
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

  const supportRepliesByRequestId = useMemo(() => {
    return supportReplies.reduce<Record<string, SupportReply[]>>((acc, reply) => {
      const key = reply.support_request_id;
      acc[key] = acc[key] || [];
      acc[key].push(reply);
      return acc;
    }, {});
  }, [supportReplies]);

  const questionStats = useMemo(() => {
    const active = dbQuestions.filter(question => question.is_active).length;
    const pyq = dbQuestions.filter(question => question.type === "PYQ").length;
    const upsc = dbQuestions.filter(question => question.exam === "UPSC").length;

    return {
      total: dbQuestions.length,
      active,
      inactive: dbQuestions.length - active,
      pyq,
      upsc,
    };
  }, [dbQuestions]);

  const resourceStats = useMemo(() => {
    const active = dbResources.filter(resource => resource.is_active !== false).length;
    return {
      total: dbResources.length,
      active,
      inactive: dbResources.length - active,
    };
  }, [dbResources]);

  const visibleQuestionIds = filteredQuestions.map(question => toId(question.id));
  const visibleResourceIds = filteredResources.map(resource => toId(resource.id));
  const allVisibleQuestionsSelected =
    visibleQuestionIds.length > 0 &&
    visibleQuestionIds.every(id => selectedQuestionIds.includes(id));
  const allVisibleResourcesSelected =
    visibleResourceIds.length > 0 &&
    visibleResourceIds.every(id => selectedResourceIds.includes(id));

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

  const replaceFilteredQuestionsWithImport = async () => {
    if (questionImportPreview.error) {
      showToast(questionImportPreview.error, false);
      return;
    }

    if (questionImportPreview.rows.length === 0) {
      showToast("Paste or upload questions first.", false);
      return;
    }

    if (filteredQuestions.length === 0) {
      showToast("Adjust filters first so there are questions to replace.", false);
      return;
    }

    const filteredIds = filteredQuestions.map(question => toId(question.id));
    const confirmation = window.confirm(
      `Replace ${filteredQuestions.length} filtered question${filteredQuestions.length === 1 ? "" : "s"} with ${questionImportPreview.rows.length} imported row${questionImportPreview.rows.length === 1 ? "" : "s"}?\n\nThis will permanently delete the currently filtered rows before importing the new batch.`
    );

    if (!confirmation) return;

    setBusy("replace-filtered-questions");

    try {
      for (const batch of chunkItems(filteredIds, 200)) {
        const { error } = await supabase.from("questions_db").delete().in("id", batch);
        if (error) throw error;
      }

      for (const batch of chunkQuestions(questionImportPreview.rows)) {
        const { error } = await supabase.from("questions_db").insert(batch);
        if (error) throw error;
      }

      await loadQuestions();
      clearQuestionImportState();
      setSelectedQuestionIds([]);
      showToast(
        `Replaced ${filteredQuestions.length} filtered question${filteredQuestions.length === 1 ? "" : "s"} with ${questionImportPreview.rows.length} imported row${questionImportPreview.rows.length === 1 ? "" : "s"}.`
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not replace filtered questions.";
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
      <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,#fff7ed_0%,#f8fafc_55%,#eef2ff_100%)] dark:bg-[linear-gradient(180deg,#020617_0%,#0f172a_55%,#111827_100%)]">
        <div className="inline-flex items-center gap-3 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
          <Loader2 size={16} className="animate-spin" />
          Preparing admin workspace...
        </div>
      </div>
    );
  }

  if (!user || user.email !== ADMIN_EMAIL) return null;

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#fff7ed_0%,#f8fafc_48%,#eef2ff_100%)] text-slate-900 dark:bg-[linear-gradient(180deg,#020617_0%,#0f172a_48%,#111827_100%)] dark:text-white">
      {toast ? (
        <div
          className={cn(
            "fixed right-4 top-4 z-50 flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-medium shadow-lg",
            toast.ok ? "bg-emerald-500 text-white" : "bg-rose-500 text-white"
          )}
        >
          {toast.ok ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
          {toast.msg}
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

      <nav className="sticky top-0 z-40 border-b border-white/50 bg-white/70 backdrop-blur-xl dark:border-white/5 dark:bg-slate-950/75">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <Link href="/" className="inline-flex items-center gap-3">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-orange-500 text-sm font-bold text-white shadow-[0_12px_30px_rgba(249,115,22,0.35)]">
                P
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-950 dark:text-white">PrepBros Admin</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Operations, imports, and content control</p>
              </div>
            </Link>
            <Pill tone="orange">Admin access</Pill>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden text-xs text-slate-500 dark:text-slate-400 md:inline">{user.email}</span>
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
        <section className="relative overflow-hidden rounded-[32px] border border-white/50 bg-[linear-gradient(135deg,rgba(15,23,42,0.98),rgba(30,41,59,0.92)_45%,rgba(249,115,22,0.95)_100%)] px-6 py-7 text-white shadow-[0_30px_90px_rgba(15,23,42,0.18)] md:px-8 md:py-8">
          <div className="absolute inset-y-0 right-0 hidden w-[42%] bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.18),transparent_58%)] lg:block" />
          <div className="relative grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-orange-100/80">
                Control Center
              </p>
              <h1 className="mt-4 max-w-2xl text-4xl font-semibold tracking-[-0.06em] md:text-5xl">
                Redesigning admin work around bulk operations instead of one-off edits.
              </h1>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-white/75 md:text-base">
                Import question banks from copy-paste, CSV, TSV, or JSON. Filter aggressively, bulk
                remove or deactivate bad rows, export clean slices, and keep resources, contests,
                and support in one operational panel.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/practice"
                  className="inline-flex items-center rounded-2xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white/16"
                >
                  Review practice surface
                </Link>
                <Link
                  href="/resources"
                  className="inline-flex items-center rounded-2xl border border-white/12 bg-black/10 px-4 py-2.5 text-sm font-medium text-white/90 transition hover:bg-black/20"
                >
                  Review resources
                </Link>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <div className="rounded-[24px] border border-white/12 bg-white/10 p-4 backdrop-blur">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/60">Question bank</p>
                <p className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-white">{questionStats.total}</p>
                <p className="mt-2 text-sm text-white/70">
                  {questionStats.active} active, {questionStats.inactive} inactive, {questionStats.pyq} PYQs
                </p>
              </div>
              <div className="rounded-[24px] border border-white/12 bg-white/10 p-4 backdrop-blur">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/60">Resources</p>
                <p className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-white">{resourceStats.total}</p>
                <p className="mt-2 text-sm text-white/70">
                  {resourceStats.active} active, {dbContests.length} contests, {supportRequests.length} support items
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Questions" value={questionStats.total} hint="Live rows available to manage" icon={Database} tone="orange" />
          <MetricCard label="UPSC Rows" value={questionStats.upsc} hint="Useful when replacing PYQ banks" icon={ShieldCheck} tone="blue" />
          <MetricCard label="Resources" value={resourceStats.total} hint="Study links, PDFs, books, and videos" icon={Layers3} tone="green" />
          <MetricCard label="Support" value={supportRequests.length} hint="User issues waiting for triage" icon={AlertCircle} tone="rose" />
        </section>

        <section className="mt-6 flex flex-wrap gap-2 rounded-[24px] border border-white/60 bg-white/80 p-2 backdrop-blur dark:border-white/5 dark:bg-slate-950/70">
          {ADMIN_TABS.map(tab => {
            const label =
              tab === "questions"
                ? `Questions (${dbQuestions.length})`
                : tab === "resources"
                  ? `Resources (${dbResources.length})`
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
                  "rounded-2xl px-4 py-2.5 text-sm font-medium transition",
                  active
                    ? "bg-slate-950 text-white shadow-sm dark:bg-white dark:text-slate-950"
                    : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900"
                )}
              >
                {label}
              </button>
            );
          })}
        </section>

        <div className="mt-6 space-y-6">
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
                            className="w-full rounded-2xl border border-slate-200 bg-white px-10 py-2.5 text-sm outline-none transition focus:border-orange-300 dark:border-slate-800 dark:bg-slate-950"
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
                            Paste from Google Sheets, or upload a CSV, TSV, TXT, or JSON file.
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
                        <SmallButton
                          icon={RefreshCcw}
                          tone="danger"
                          onClick={() => void replaceFilteredQuestionsWithImport()}
                          disabled={
                            Boolean(questionImportPreview.error) ||
                            questionImportPreview.rows.length === 0 ||
                            filteredQuestions.length === 0 ||
                            loadingTarget !== null
                          }
                        >
                          {loadingTarget === "replace-filtered-questions"
                            ? "Replacing..."
                            : `Replace filtered (${filteredQuestions.length})`}
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
                              Use "Replace filtered" to swap that exact slice in one step.
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
                            className="w-full rounded-2xl border border-slate-200 bg-white px-10 py-2.5 text-sm outline-none transition focus:border-orange-300 dark:border-slate-800 dark:bg-slate-950"
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
                      className="w-full rounded-2xl border border-slate-200 bg-white px-10 py-2.5 text-sm outline-none transition focus:border-orange-300 dark:border-slate-800 dark:bg-slate-950"
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
