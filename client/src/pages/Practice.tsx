import { useEffect, useMemo, useState } from "react";
import {
  Bookmark,
  BookmarkCheck,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Flag,
  Loader2,
  Search,
  SlidersHorizontal,
  Sparkles,
  X,
} from "lucide-react";
import { useLocation } from "wouter";

import AppShell from "@/components/AppShell";
import { PageEmpty, PracticeTableSkeleton } from "@/components/PageState";
import SwipeDismissNotice from "@/components/SwipeDismissNotice";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useAuth } from "@/contexts/AuthContext";
import { type Question } from "@/data/questions";
import { useQuestionBank } from "@/hooks/useQuestionBank";
import { useSwipeable } from "@/hooks/useSwipeable";
import { trackEvent } from "@/lib/analytics";
import {
  createQuestionIdentityIndex,
  getStoredQuestionId,
  toQuestionId,
  type QuestionId,
} from "@/lib/questionIdentity";
import {
  type AnswerAttempt,
  buildAnswerStatuses,
  getAnswerAttempts,
  getBookmarks,
  saveAnswer,
  toggleBookmark,
} from "@/lib/userProgress";
import { cn } from "@/lib/utils";

type ReviewMode = "all" | "bookmarked" | "solved" | "wrong";
type SortBy = "default" | "difficulty" | "year";
type ExamFilter =
  | "UPSC"
  | "SSC CGL"
  | "Other State Services"
  | "Banking"
  | "Other";
type FilterSection =
  | "review"
  | "exam"
  | "difficulty"
  | "type"
  | "topic"
  | "year";

type PracticeFilters = {
  exams: ExamFilter[];
  difficulty: string;
  types: string[];
  topics: string[];
  years: number[];
  reviewMode: ReviewMode;
  sortBy: SortBy;
};

const EXAM_FILTERS: ExamFilter[] = [
  "UPSC",
  "SSC CGL",
  "Other State Services",
  "Banking",
  "Other",
];
const DIFFICULTIES = ["Easy", "Medium", "Hard"];
const TYPES = ["PYQ", "Conceptual", "CurrentAffairs", "Mock"];
const TYPE_LABELS: Record<string, string> = {
  PYQ: "PYQ",
  Conceptual: "Conceptual",
  CurrentAffairs: "Current Affairs",
  Mock: "Mock Test",
};
const OPTION_LABELS = ["A", "B", "C", "D"] as const;
const TOPIC_ORDER = [
  "Polity & Governance",
  "History & Culture",
  "Geography",
  "Economy",
  "Banking & Finance",
  "Environment",
  "Science & Tech",
  "Current Affairs",
  "General Awareness",
  "Quantitative Aptitude",
  "Reasoning",
  "English",
  "State Affairs",
  "Other",
];
const REVIEW_OPTIONS: ReadonlyArray<{ value: ReviewMode; label: string }> = [
  { value: "all", label: "All Questions" },
  { value: "bookmarked", label: "Bookmarked" },
  { value: "solved", label: "Solved" },
  { value: "wrong", label: "Incorrect" },
];
const DEFAULT_OPEN_SECTIONS: Record<FilterSection, boolean> = {
  review: true,
  exam: true,
  difficulty: false,
  type: false,
  topic: false,
  year: false,
};
const PER_PAGE = 15;
const TABLE_COLUMNS = [
  { label: "#", className: "w-[6%]" },
  { label: "Question", className: "w-[38%]" },
  { label: "Exam", className: "w-[12%]" },
  { label: "Topic", className: "w-[20%]" },
  { label: "Difficulty", className: "w-[10%]" },
  { label: "Year", className: "w-[6%]" },
  { label: "Status", className: "w-[8%]" },
];

const panelClassName =
  "overflow-hidden rounded-[24px] border border-[var(--border)] bg-[var(--bg-card)] shadow-[var(--shadow-lg)] backdrop-blur-xl";
const softPanelClassName =
  "rounded-[18px] border border-[var(--border)] bg-[var(--surface-1)] shadow-[var(--shadow-md)] backdrop-blur-xl";
const fieldClassName =
  "w-full rounded-[14px] border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3 text-sm text-[var(--text-primary)] outline-none transition placeholder:text-[var(--text-faint)] focus:border-[var(--border-focus)] focus:bg-[var(--surface-3)] focus:ring-4 focus:ring-[color:var(--brand-subtle)]";
const accentChipClassName =
  "rounded-full border border-[var(--brand-muted)] bg-[var(--brand-subtle)] text-[var(--brand)]";
const ghostButtonClassName =
  "inline-flex items-center justify-center rounded-[14px] border border-[var(--border)] bg-[var(--surface-2)] text-[var(--text-primary)] shadow-[var(--shadow-sm)] transition hover:border-[var(--border-strong)] hover:bg-[var(--surface-1)]";
const primaryButtonClassName =
  "inline-flex items-center justify-center rounded-[14px] bg-[var(--brand)] text-[var(--text-on-brand)] shadow-[var(--shadow-sm)] transition hover:translate-y-[-1px] hover:bg-[var(--brand-light)]";
const insetCardClassName =
  "rounded-[16px] border border-[var(--border)] bg-[var(--surface-2)]";
const sectionLabelClassName =
  "text-[0.78rem] font-semibold uppercase tracking-[0.24em] text-[var(--text-secondary)]";
const neutralMetaPillClassName =
  "inline-flex items-center rounded-full border border-[var(--border)] bg-[var(--surface-1)] px-3 py-1.5 text-[0.72rem] font-semibold tracking-[0.03em] text-[var(--text-secondary)] shadow-[var(--shadow-sm)]";
const navigationButtonClassName =
  "inline-flex items-center justify-center rounded-[14px] border border-[var(--border)] bg-[var(--bg-card-strong)] text-[var(--text-primary)] shadow-[var(--shadow-sm)] transition hover:-translate-y-0.5 hover:border-[var(--border-strong)] hover:bg-[var(--surface-1)]";

function createEmptyFilters(): PracticeFilters {
  return {
    exams: [],
    difficulty: "",
    types: [],
    topics: [],
    years: [],
    reviewMode: "all",
    sortBy: "default",
  };
}

function normalizeToken(value: string) {
  return value.trim().toLowerCase();
}

function getExamFilterLabel(exam: string): ExamFilter {
  const value = normalizeToken(exam);

  if (value.includes("upsc")) return "UPSC";
  if (value.includes("ssc")) return "SSC CGL";
  if (/(ibps|sbi|rbi|bank|banking|nabard|insurance|lic|clerk|po)/.test(value)) {
    return "Banking";
  }
  if (
    /(psc|state|group[-\s]?1|group[-\s]?2|tspsc|appsc|mppsc|uppsc|bpsc|gpsc|kpsc)/.test(
      value
    )
  ) {
    return "Other State Services";
  }

  return "Other";
}

function getExamPillClass(exam: string) {
  switch (getExamFilterLabel(exam)) {
    case "UPSC":
      return "border-[rgba(37,99,235,0.16)] bg-[rgba(37,99,235,0.08)] text-[var(--blue)]";
    case "SSC CGL":
      return "border-[rgba(14,116,144,0.16)] bg-[rgba(14,116,144,0.08)] text-[#0f766e]";
    case "Other State Services":
      return "border-[rgba(21,128,61,0.16)] bg-[rgba(21,128,61,0.08)] text-[var(--green)]";
    case "Banking":
      return "border-[rgba(8,145,178,0.16)] bg-[rgba(8,145,178,0.08)] text-[#0891b2]";
    default:
      return "border-[var(--border)] bg-[var(--surface-1)] text-[var(--text-secondary)]";
  }
}

function getDifficultyPillClass(difficulty: string) {
  switch (difficulty) {
    case "Easy":
      return "border-[rgba(21,128,61,0.16)] bg-[rgba(21,128,61,0.08)] text-[var(--green)]";
    case "Medium":
      return "border-[rgba(180,83,9,0.18)] bg-[rgba(180,83,9,0.08)] text-[var(--yellow)]";
    case "Hard":
      return "border-[rgba(220,38,38,0.16)] bg-[rgba(220,38,38,0.08)] text-[var(--red)]";
    default:
      return "border-[var(--border)] bg-[var(--surface-1)] text-[var(--text-secondary)]";
  }
}

function getStatusPill(status?: "correct" | "wrong") {
  if (status === "correct") {
    return {
      label: "Solved",
      className:
        "border-[rgba(21,128,61,0.16)] bg-[rgba(21,128,61,0.08)] text-[var(--green)]",
      icon: <Check size={12} />,
    };
  }

  if (status === "wrong") {
    return {
      label: "Incorrect",
      className:
        "border-[rgba(220,38,38,0.16)] bg-[rgba(220,38,38,0.08)] text-[var(--red)]",
      icon: <X size={12} />,
    };
  }

  return {
    label: "New",
    className:
      "border-[var(--brand-muted)] bg-[var(--brand-subtle)] text-[var(--brand-light)]",
    icon: <Sparkles size={12} />,
  };
}

function formatQuestionForDisplay(question: string) {
  return question
    .replace(/[ \t]+/g, " ")
    .trim()
    .replace(/:\s*(?=1\.\s)/g, ":\n")
    .replace(/\s(?=\d+\.\s)/g, "\n")
    .replace(
      /([.?!])\s+(?=(Which|What|How|Select|Choose|In the context|With reference|Arrange|Match|Identify)\b)/g,
      "$1\n"
    );
}

function toggleItem<T>(items: T[], value: T) {
  return items.includes(value)
    ? items.filter(item => item !== value)
    : [...items, value];
}

function sortWithTopicOrder(values: string[]) {
  const order = new Map(TOPIC_ORDER.map((topic, index) => [topic, index]));
  return [...values].sort((left, right) => {
    const leftOrder = order.get(left) ?? 999;
    const rightOrder = order.get(right) ?? 999;
    if (leftOrder !== rightOrder) return leftOrder - rightOrder;
    return left.localeCompare(right);
  });
}

function mapTypeFromQuery(value: string) {
  const normalized = normalizeToken(value).replace(/\s+/g, "");
  return TYPES.find(type => normalizeToken(type) === normalized) || null;
}

function getTopicBucket(question: Question) {
  const haystack = normalizeToken(
    [
      question.topic,
      question.subtopic,
      question.tags.join(" "),
      question.exam,
      question.type,
    ].join(" ")
  );
  const examBucket = getExamFilterLabel(question.exam);

  if (
    /(polity|constitution|governance|judiciary|rights|parliament|president|directive principles|election|citizenship)/.test(
      haystack
    )
  ) {
    return "Polity & Governance";
  }

  if (
    /(history|ancient|medieval|modern|freedom|culture|art|civilization|battle)/.test(
      haystack
    )
  ) {
    return "History & Culture";
  }

  if (
    /(geography|river|lake|climate|monsoon|soil|map|physical geography)/.test(
      haystack
    )
  ) {
    return "Geography";
  }

  if (
    examBucket === "Banking" ||
    /(banking|finance|monetary|credit|loan|npci|upi|rbi|financial)/.test(
      haystack
    )
  ) {
    return "Banking & Finance";
  }

  if (
    /(economy|economic|budget|gdp|inflation|fiscal|planning|trade)/.test(
      haystack
    )
  ) {
    return "Economy";
  }

  if (
    /(environment|ecology|biodiversity|climate change|ozone|conservation)/.test(
      haystack
    )
  ) {
    return "Environment";
  }

  if (
    /(science|technology|biology|physics|chemistry|space|dna|computer|satellite)/.test(
      haystack
    )
  ) {
    return "Science & Tech";
  }

  if (/(currentaffairs|current affairs|current affair)/.test(haystack)) {
    return "Current Affairs";
  }

  if (
    /(quantitative aptitude|aptitude|arithmetic|algebra|profit|loss|percentage|speed|distance|ratio|time)/.test(
      haystack
    )
  ) {
    return "Quantitative Aptitude";
  }

  if (/(reasoning|logical|analogy|series|puzzle)/.test(haystack)) {
    return "Reasoning";
  }

  if (
    /(english|grammar|vocabulary|comprehension|synonym|antonym)/.test(haystack)
  ) {
    return "English";
  }

  if (
    examBucket === "Other State Services" ||
    /(state affairs|state polity|local government|regional)/.test(haystack)
  ) {
    return "State Affairs";
  }

  if (/(general awareness|general studies|gk)/.test(haystack)) {
    return "General Awareness";
  }

  if (question.topic.trim()) return question.topic.trim();

  return "Other";
}

function parseFiltersFromSearch(params: URLSearchParams): PracticeFilters {
  const filters = createEmptyFilters();
  const getList = (key: string, fallbackKey?: string) => {
    const raw =
      params.get(key) || (fallbackKey ? params.get(fallbackKey) : "") || "";
    return raw
      .split(",")
      .map(item => item.trim())
      .filter(Boolean);
  };

  filters.exams = Array.from(
    new Set(getList("exams", "exam").map(value => getExamFilterLabel(value)))
  );

  const difficulty = params.get("difficulty") || "";
  filters.difficulty = DIFFICULTIES.includes(difficulty) ? difficulty : "";

  filters.types = getList("types", "type")
    .map(mapTypeFromQuery)
    .filter((value): value is string => Boolean(value));
  filters.topics = Array.from(new Set(getList("topics", "topic")));
  filters.years = Array.from(
    new Set(
      getList("years", "year")
        .map(value => Number.parseInt(value, 10))
        .filter(value => Number.isFinite(value))
    )
  );

  const reviewParam = normalizeToken(params.get("review") || "");
  if (reviewParam === "bookmarked") {
    filters.reviewMode = "bookmarked";
  } else if (reviewParam === "solved") {
    filters.reviewMode = "solved";
  } else if (reviewParam === "wrong" || reviewParam === "incorrect") {
    filters.reviewMode = "wrong";
  } else if (params.get("bookmarked") === "1") {
    filters.reviewMode = "bookmarked";
  } else if (params.get("solved") === "1") {
    filters.reviewMode = "solved";
  } else if (params.get("incorrect") === "1") {
    filters.reviewMode = "wrong";
  }

  const sortBy = params.get("sort");
  if (sortBy === "difficulty" || sortBy === "year") {
    filters.sortBy = sortBy;
  }

  return filters;
}

function getFilterCount(filters: PracticeFilters) {
  return (
    filters.exams.length +
    (filters.difficulty ? 1 : 0) +
    filters.types.length +
    filters.topics.length +
    filters.years.length +
    (filters.reviewMode !== "all" ? 1 : 0) +
    (filters.sortBy !== "default" ? 1 : 0)
  );
}

function areFiltersEqual(left: PracticeFilters, right: PracticeFilters) {
  return JSON.stringify(left) === JSON.stringify(right);
}

function FilterDisclosure({
  title,
  summary,
  open,
  onToggle,
  children,
}: {
  title: string;
  summary: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <section className={softPanelClassName}>
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left"
      >
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-faint)]">
            {title}
          </p>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">{summary}</p>
        </div>
        <span
          className={cn(
            "inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--bg-card-strong)] text-[var(--text-secondary)] transition",
            open && "rotate-180 text-[var(--text-primary)]"
          )}
        >
          <ChevronDown size={16} />
        </span>
      </button>

      {open ? (
        <div className="border-t border-[var(--border)] px-4 pb-4 pt-3">
          {children}
        </div>
      ) : null}
    </section>
  );
}

function FilterCheckboxRow({
  label,
  checked,
  onChange,
  meta,
  truncateLabel = false,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
  meta?: React.ReactNode;
  truncateLabel?: boolean;
}) {
  return (
    <label className="group flex cursor-pointer items-center gap-3 rounded-[16px] border border-[var(--border)] bg-[var(--bg-card-strong)] px-3 py-2.5 text-sm text-[var(--text-secondary)] transition hover:border-[var(--border-strong)] has-[:focus-visible]:border-[var(--border-focus)] has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-[color:var(--brand-subtle)]">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="sr-only"
      />
      <span
        className={cn(
          "flex h-5 w-5 shrink-0 items-center justify-center rounded-[6px] border bg-[var(--surface-2)] transition-all",
          checked
            ? "border-[var(--brand)] bg-[var(--brand)] text-[var(--text-on-brand)]"
            : "border-[var(--border-strong)] text-transparent group-hover:border-[var(--brand-muted)]"
        )}
      >
        <Check size={13} strokeWidth={3} />
      </span>
      <span className={cn("min-w-0 flex-1", truncateLabel && "line-clamp-1")}>
        {label}
      </span>
      {meta ? (
        <span className="text-xs text-[var(--text-faint)]">{meta}</span>
      ) : null}
    </label>
  );
}

export default function Practice() {
  const [, navigate] = useLocation();
  const { user, loading: authLoading } = useAuth();
  const {
    questions,
    loading: questionsLoading,
    syncing: questionsSyncing,
  } = useQuestionBank();

  const [search, setSearch] = useState("");
  const [appliedFilters, setAppliedFilters] =
    useState<PracticeFilters>(createEmptyFilters());
  const [draftFilters, setDraftFilters] =
    useState<PracticeFilters>(createEmptyFilters());
  const [filterSections, setFilterSections] = useState(DEFAULT_OPEN_SECTIONS);
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [activeQ, setActiveQ] = useState<Question | null>(null);
  const [activeSequenceIds, setActiveSequenceIds] = useState<QuestionId[]>([]);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [submittedOption, setSubmittedOption] = useState<number | null>(null);
  const [rawBookmarks, setRawBookmarks] = useState<QuestionId[]>([]);
  const [rawAttempts, setRawAttempts] = useState<AnswerAttempt[]>([]);
  const [answerStart, setAnswerStart] = useState<number>(Date.now());
  const [queryHydrated, setQueryHydrated] = useState(false);
  const [requestedQuestionId, setRequestedQuestionId] = useState<string | null>(
    null
  );
  const [progressLoading, setProgressLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const parsedFilters = parseFiltersFromSearch(params);

    setSearch(params.get("search") || "");
    setAppliedFilters(parsedFilters);
    setDraftFilters(parsedFilters);
    setRequestedQuestionId(params.get("question")?.trim() || null);
    setQueryHydrated(true);
  }, []);

  useEffect(() => {
    let cancelled = false;

    if (authLoading) {
      return () => {
        cancelled = true;
      };
    }

    if (!user) {
      setRawBookmarks([]);
      setRawAttempts([]);
      setProgressLoading(false);
      return () => {
        cancelled = true;
      };
    }

    const loadProgress = async () => {
      setProgressLoading(true);
      const [bookmarkIds, attempts] = await Promise.all([
        getBookmarks(user.id),
        getAnswerAttempts(user.id),
      ]);

      if (cancelled) return;

      setRawBookmarks(bookmarkIds);
      setRawAttempts(attempts);
      setProgressLoading(false);
    };

    void loadProgress();

    return () => {
      cancelled = true;
    };
  }, [authLoading, user]);

  const questionIdentity = useMemo(
    () => createQuestionIdentityIndex(questions),
    [questions]
  );
  const questionLookup = useMemo(
    () =>
      new Map(questions.map(question => [toQuestionId(question.id), question])),
    [questions]
  );
  const resolveStoredQuestionId = (rawId: QuestionId) =>
    questionIdentity.resolveQuestionId(rawId);
  const progressSyncing =
    Boolean(user) && (questionsSyncing || progressLoading);

  const bookmarks = useMemo(() => {
    const mapped = rawBookmarks
      .map(resolveStoredQuestionId)
      .filter((questionId): questionId is string => Boolean(questionId));

    return Array.from(new Set(mapped));
  }, [rawBookmarks, questionIdentity]);

  const answerStatuses = useMemo(() => {
    const mappedAttempts = rawAttempts
      .map(attempt => {
        const questionId = resolveStoredQuestionId(attempt.question_id);
        if (!questionId) return null;

        return {
          ...attempt,
          question_id: questionId,
        };
      })
      .filter((attempt): attempt is AnswerAttempt => Boolean(attempt));

    return buildAnswerStatuses(mappedAttempts);
  }, [rawAttempts, questionIdentity]);

  const bookmarkSet = useMemo(() => new Set(bookmarks), [bookmarks]);
  const solvedSet = useMemo(
    () =>
      new Set(
        Object.entries(answerStatuses)
          .filter(([, status]) => status === "correct")
          .map(([questionId]) => questionId)
      ),
    [answerStatuses]
  );
  const wrongSet = useMemo(
    () =>
      new Set(
        Object.entries(answerStatuses)
          .filter(([, status]) => status === "wrong")
          .map(([questionId]) => questionId)
      ),
    [answerStatuses]
  );

  const topicCounts = useMemo(() => {
    return questions.reduce<Record<string, number>>((acc, question) => {
      const topicBucket = getTopicBucket(question);
      acc[topicBucket] = (acc[topicBucket] || 0) + 1;
      return acc;
    }, {});
  }, [questions]);

  const allTopics = useMemo(
    () => sortWithTopicOrder(Object.keys(topicCounts)),
    [topicCounts]
  );
  const allYears = useMemo(
    () =>
      Array.from(
        new Set(
          questions
            .filter(question => question.year)
            .map(question => question.year as number)
        )
      ).sort((a, b) => b - a),
    [questions]
  );
  const examCounts = useMemo(() => {
    return questions.reduce<Record<ExamFilter, number>>(
      (acc, question) => {
        const examFilter = getExamFilterLabel(question.exam);
        acc[examFilter] += 1;
        return acc;
      },
      {
        UPSC: 0,
        "SSC CGL": 0,
        "Other State Services": 0,
        Banking: 0,
        Other: 0,
      }
    );
  }, [questions]);

  const stats = useMemo(() => {
    let fresh = 0;
    let solved = 0;
    let incorrect = 0;

    for (const question of questions) {
      const status = answerStatuses[toQuestionId(question.id)];
      if (!status) {
        fresh += 1;
      } else if (status === "correct") {
        solved += 1;
      } else {
        incorrect += 1;
      }
    }

    return {
      fresh,
      solved,
      incorrect,
      bookmarked: bookmarks.length,
    };
  }, [answerStatuses, bookmarks.length, questions]);

  const filtered = useMemo(() => {
    const questionOrder = new Map(
      questions.map((question, index) => [toQuestionId(question.id), index])
    );
    const query = search.trim().toLowerCase();

    let current = [...questions];

    if (query) {
      current = current.filter(item => {
        const topicBucket = getTopicBucket(item).toLowerCase();
        const typeLabel = (TYPE_LABELS[item.type] || item.type).toLowerCase();
        return (
          item.question.toLowerCase().includes(query) ||
          item.topic.toLowerCase().includes(query) ||
          item.subtopic.toLowerCase().includes(query) ||
          topicBucket.includes(query) ||
          item.exam.toLowerCase().includes(query) ||
          typeLabel.includes(query)
        );
      });
    }

    if (appliedFilters.exams.length) {
      current = current.filter(item =>
        appliedFilters.exams.includes(getExamFilterLabel(item.exam))
      );
    }

    if (appliedFilters.difficulty) {
      current = current.filter(
        item => item.difficulty === appliedFilters.difficulty
      );
    }

    if (appliedFilters.types.length) {
      current = current.filter(item =>
        appliedFilters.types.includes(item.type)
      );
    }

    if (appliedFilters.topics.length) {
      current = current.filter(item =>
        appliedFilters.topics.includes(getTopicBucket(item))
      );
    }

    if (appliedFilters.years.length) {
      current = current.filter(
        item =>
          item.year !== null &&
          appliedFilters.years.includes(item.year as number)
      );
    }

    if (appliedFilters.reviewMode === "bookmarked") {
      current = current.filter(item => bookmarkSet.has(toQuestionId(item.id)));
    }

    if (appliedFilters.reviewMode === "solved") {
      current = current.filter(item => solvedSet.has(toQuestionId(item.id)));
    }

    if (appliedFilters.reviewMode === "wrong") {
      current = current.filter(item => wrongSet.has(toQuestionId(item.id)));
    }

    current.sort((left, right) => {
      const leftId = toQuestionId(left.id);
      const rightId = toQuestionId(right.id);
      const leftStatus = answerStatuses[leftId];
      const rightStatus = answerStatuses[rightId];

      if (appliedFilters.reviewMode === "all") {
        const statusRank = (status?: "correct" | "wrong") => {
          if (!status) return 0;
          return status === "wrong" ? 1 : 2;
        };

        const rankDiff = statusRank(leftStatus) - statusRank(rightStatus);
        if (rankDiff !== 0) return rankDiff;
      }

      if (appliedFilters.sortBy === "difficulty") {
        const order = ["Easy", "Medium", "Hard"];
        const diff =
          order.indexOf(left.difficulty) - order.indexOf(right.difficulty);
        if (diff !== 0) return diff;
      }

      if (appliedFilters.sortBy === "year") {
        const diff = (right.year ?? 0) - (left.year ?? 0);
        if (diff !== 0) return diff;
      }

      return (
        (questionOrder.get(leftId) ?? 0) - (questionOrder.get(rightId) ?? 0)
      );
    });

    return current;
  }, [
    answerStatuses,
    appliedFilters,
    bookmarkSet,
    questions,
    search,
    solvedSet,
    wrongSet,
  ]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const reviewModeSyncing =
    progressSyncing && appliedFilters.reviewMode !== "all";
  const activeQuestionId = activeQ ? toQuestionId(activeQ.id) : null;
  const activeIdx = activeQuestionId
    ? activeSequenceIds.indexOf(activeQuestionId)
    : -1;
  const canNavigatePrev = activeIdx > 0;
  const canNavigateNext =
    activeIdx >= 0 && activeIdx < activeSequenceIds.length - 1;
  const formattedActiveQuestion = activeQ
    ? formatQuestionForDisplay(activeQ.question)
    : "";
  const filterCount = getFilterCount(appliedFilters);
  const draftFilterCount = getFilterCount(draftFilters);
  const draftChanged = !areFiltersEqual(appliedFilters, draftFilters);
  const questionParamId = activeQ
    ? toQuestionId(activeQ.id)
    : requestedQuestionId || null;
  const buildQuestionSequence = (questionId: QuestionId) => {
    const filteredIds = filtered.map(question => toQuestionId(question.id));
    if (filteredIds.includes(questionId)) {
      return filteredIds;
    }

    const allIds = questions.map(question => toQuestionId(question.id));
    return allIds.includes(questionId) ? allIds : filteredIds;
  };
  const activeQuestionSwipe = useSwipeable({
    axis: "x",
    enabled: Boolean(activeQ),
    mouse: true,
    minDistance: 84,
    resistance: 0.58,
    onSwipeLeft: () => {
      if (canNavigateNext) {
        navigateQuestion(1);
      }
    },
    onSwipeRight: () => {
      if (canNavigatePrev) {
        navigateQuestion(-1);
      }
    },
  });

  useEffect(() => {
    setPage(current => Math.min(current, totalPages));
  }, [totalPages]);

  useEffect(() => {
    if (!queryHydrated) return;

    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (appliedFilters.exams.length) {
      params.set("exams", appliedFilters.exams.join(","));
    }
    if (appliedFilters.difficulty) {
      params.set("difficulty", appliedFilters.difficulty);
    }
    if (appliedFilters.types.length) {
      params.set("types", appliedFilters.types.join(","));
    }
    if (appliedFilters.topics.length) {
      params.set("topics", appliedFilters.topics.join(","));
    }
    if (appliedFilters.years.length) {
      params.set("years", appliedFilters.years.join(","));
    }
    if (appliedFilters.reviewMode !== "all") {
      params.set("review", appliedFilters.reviewMode);
    }
    if (appliedFilters.sortBy !== "default") {
      params.set("sort", appliedFilters.sortBy);
    }
    if (questionParamId) {
      params.set("question", questionParamId);
    }

    const query = params.toString();
    window.history.replaceState(
      {},
      "",
      query ? `/practice?${query}` : "/practice"
    );
  }, [appliedFilters, queryHydrated, questionParamId, search]);

  useEffect(() => {
    if (
      questionsSyncing ||
      questions.length === 0 ||
      requestedQuestionId === null
    ) {
      return;
    }

    const match = questions.find(
      question => toQuestionId(question.id) === requestedQuestionId
    );
    if (!match) return;

    setActiveSequenceIds(buildQuestionSequence(requestedQuestionId));
    setActiveQ(match);
    setSelectedOption(null);
    setSubmittedOption(null);
    setAnswerStart(Date.now());
    setRequestedQuestionId(null);
  }, [questions, questionsSyncing, requestedQuestionId, buildQuestionSequence]);

  const openFilterPanel = () => {
    setDraftFilters(appliedFilters);
    setShowFilters(true);
  };

  const applyFilters = () => {
    setAppliedFilters(draftFilters);
    setPage(1);
    setShowFilters(false);
  };

  const clearAll = () => {
    const empty = createEmptyFilters();
    setAppliedFilters(empty);
    setDraftFilters(empty);
    setPage(1);
  };

  const setQuickReviewMode = (reviewMode: ReviewMode) => {
    const nextFilters = {
      ...appliedFilters,
      reviewMode,
    };
    setAppliedFilters(nextFilters);
    setDraftFilters(nextFilters);
    setPage(1);
  };

  const setQuickSort = (sortBy: SortBy) => {
    const nextFilters = {
      ...appliedFilters,
      sortBy,
    };
    setAppliedFilters(nextFilters);
    setDraftFilters(nextFilters);
    setPage(1);
  };

  const clearDraft = () => {
    setDraftFilters(createEmptyFilters());
  };

  const resetQuestionState = () => {
    setSelectedOption(null);
    setSubmittedOption(null);
    setAnswerStart(Date.now());
  };

  const closeQuestion = () => {
    setActiveQ(null);
    setActiveSequenceIds([]);
    resetQuestionState();
  };

  const openQuestion = (question: Question) => {
    setActiveSequenceIds(buildQuestionSequence(toQuestionId(question.id)));
    setActiveQ(question);
    resetQuestionState();
  };

  const navigateQuestion = (direction: -1 | 1) => {
    if (activeIdx < 0) return;

    const nextQuestionId = activeSequenceIds[activeIdx + direction];
    if (!nextQuestionId) return;

    const nextQuestion = questionLookup.get(nextQuestionId);
    if (!nextQuestion) return;

    setActiveQ(nextQuestion);
    resetQuestionState();
  };

  const submitAnswer = () => {
    if (selectedOption === null || submittedOption !== null || !activeQ) return;
    if (user && questionsSyncing) return;

    const isCorrect = selectedOption === activeQ.correct;
    const questionId = getStoredQuestionId(activeQ);

    setSubmittedOption(selectedOption);
    setRawAttempts(current => [
      {
        question_id: questionId,
        is_correct: isCorrect,
        answered_at: new Date().toISOString(),
      },
      ...current,
    ]);

    trackEvent("practice_answered", {
      exam: activeQ.exam,
      topic: activeQ.topic,
      correct: isCorrect,
    });

    if (user) {
      const timeTaken = Math.round((Date.now() - answerStart) / 1000);
      void saveAnswer(
        user.id,
        questionId,
        isCorrect,
        selectedOption,
        timeTaken
      );
    }
  };

  const handleBookmark = () => {
    if (!activeQ) return;
    if (user && questionsSyncing) return;

    const questionId = getStoredQuestionId(activeQ);

    if (user) {
      void toggleBookmark(user.id, questionId).then(isBookmarked => {
        trackEvent("bookmark_toggled", {
          question_id: activeQ.id,
          bookmarked: isBookmarked,
        });
        setRawBookmarks(current =>
          isBookmarked
            ? Array.from(new Set([...current, questionId]))
            : current.filter(item => item !== questionId)
        );
      });
      return;
    }

    setRawBookmarks(current =>
      current.includes(questionId)
        ? current.filter(item => item !== questionId)
        : [...current, questionId]
    );
  };

  const handleReportQuestion = () => {
    if (!activeQ) return;

    const params = new URLSearchParams({
      category: "Question issue",
      subject: `Practice question report: ${activeQ.topic}`,
      message: `Please review this question.\n\nQuestion ID: ${toQuestionId(activeQ.id)}\nExam: ${activeQ.exam}\nTopic: ${activeQ.topic}\nQuestion: ${activeQ.question}`,
    });

    navigate(`/support?${params.toString()}`);
  };

  const activeFilterPills = [
    ...appliedFilters.exams.map(item => ({ key: `exam-${item}`, label: item })),
    ...(appliedFilters.difficulty
      ? [
          {
            key: `difficulty-${appliedFilters.difficulty}`,
            label: appliedFilters.difficulty,
          },
        ]
      : []),
    ...appliedFilters.types.map(item => ({
      key: `type-${item}`,
      label: TYPE_LABELS[item] || item,
    })),
    ...appliedFilters.topics.map(item => ({
      key: `topic-${item}`,
      label: item,
    })),
    ...appliedFilters.years.map(item => ({
      key: `year-${item}`,
      label: String(item),
    })),
    ...(appliedFilters.reviewMode !== "all"
      ? [
          {
            key: `review-${appliedFilters.reviewMode}`,
            label:
              REVIEW_OPTIONS.find(
                item => item.value === appliedFilters.reviewMode
              )?.label || appliedFilters.reviewMode,
          },
        ]
      : []),
    ...(appliedFilters.sortBy !== "default"
      ? [
          {
            key: `sort-${appliedFilters.sortBy}`,
            label:
              appliedFilters.sortBy === "year"
                ? "Latest year"
                : "Difficulty order",
          },
        ]
      : []),
  ];

  const questionStateSummary = questionsLoading
    ? "Loading question bank..."
    : reviewModeSyncing
      ? "Syncing your saved progress..."
      : `${filtered.length} questions${!user ? " · sign in to save progress" : ""}`;
  const visibleRangeStart = filtered.length ? (page - 1) * PER_PAGE + 1 : 0;
  const visibleRangeEnd = filtered.length
    ? Math.min(page * PER_PAGE, filtered.length)
    : 0;
  const practiceSummaryItems = [
    {
      label: "Fresh",
      value: stats.fresh,
      hint: "Ready now",
    },
    {
      label: "Solved",
      value: stats.solved,
      hint: "Completed",
    },
    {
      label: "Retry",
      value: stats.incorrect,
      hint: "Needs review",
    },
    {
      label: "Saved",
      value: stats.bookmarked,
      hint: "Bookmarked",
    },
  ];

  const getDisclosureSummary = (section: FilterSection) => {
    switch (section) {
      case "review":
        return (
          REVIEW_OPTIONS.find(item => item.value === draftFilters.reviewMode)
            ?.label || "All Questions"
        );
      case "exam":
        return draftFilters.exams.length
          ? `${draftFilters.exams.length} selected`
          : "All exam groups";
      case "difficulty":
        return draftFilters.difficulty || "Any difficulty";
      case "type":
        return draftFilters.types.length
          ? `${draftFilters.types.length} selected`
          : "Any type";
      case "topic":
        return draftFilters.topics.length
          ? `${draftFilters.topics.length} selected`
          : "Core topics only";
      case "year":
        return draftFilters.years.length
          ? `${draftFilters.years.length} selected`
          : "Any year";
      default:
        return "";
    }
  };

  const filterPanel = (
    <div className="flex h-full flex-col text-[var(--text-primary)]">
      <div className="border-b border-[var(--border)] pb-5">
        <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-[var(--text-faint)]">
          Progressive filters
        </p>
        <h2 className="mt-2 text-[1.65rem] font-semibold tracking-[-0.05em] text-[var(--text-primary)]">
          Tune the library
        </h2>
        <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
          Hide the extra detail until you need it, then save the exact question
          mix you want to see.
        </p>
        <div className="mt-4 flex items-center gap-3">
          <span
            className={`${accentChipClassName} px-3 py-1 text-[11px] font-medium`}
          >
            {draftFilterCount} active
          </span>
          {draftFilterCount > 0 ? (
            <button
              type="button"
              onClick={clearDraft}
              className="text-sm font-medium text-[var(--text-secondary)] transition hover:text-[var(--text-primary)]"
            >
              Reset draft
            </button>
          ) : null}
        </div>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto py-5 pr-1">
        <FilterDisclosure
          title="Status"
          summary={getDisclosureSummary("review")}
          open={filterSections.review}
          onToggle={() =>
            setFilterSections(current => ({
              ...current,
              review: !current.review,
            }))
          }
        >
          <div className="grid grid-cols-2 gap-2">
            {REVIEW_OPTIONS.map(item => (
              <button
                key={item.value}
                type="button"
                onClick={() =>
                  setDraftFilters(current => ({
                    ...current,
                    reviewMode: item.value,
                  }))
                }
                className={cn(
                  "rounded-[16px] border px-3 py-3 text-left text-sm transition",
                  draftFilters.reviewMode === item.value
                    ? "border-[var(--brand-muted)] bg-[var(--brand-subtle)] text-[var(--text-primary)]"
                    : "border-[var(--border)] bg-[var(--bg-card-strong)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
        </FilterDisclosure>

        <FilterDisclosure
          title="Exam"
          summary={getDisclosureSummary("exam")}
          open={filterSections.exam}
          onToggle={() =>
            setFilterSections(current => ({
              ...current,
              exam: !current.exam,
            }))
          }
        >
          <div className="space-y-2">
            {EXAM_FILTERS.map(exam => (
              <FilterCheckboxRow
                key={exam}
                label={exam}
                checked={draftFilters.exams.includes(exam)}
                onChange={() =>
                  setDraftFilters(current => ({
                    ...current,
                    exams: toggleItem(current.exams, exam),
                  }))
                }
                meta={examCounts[exam]}
              />
            ))}
          </div>
        </FilterDisclosure>

        <FilterDisclosure
          title="Difficulty"
          summary={getDisclosureSummary("difficulty")}
          open={filterSections.difficulty}
          onToggle={() =>
            setFilterSections(current => ({
              ...current,
              difficulty: !current.difficulty,
            }))
          }
        >
          <div className="flex flex-wrap gap-2">
            {["All", ...DIFFICULTIES].map(difficulty => {
              const value = difficulty === "All" ? "" : difficulty;
              return (
                <button
                  key={difficulty}
                  type="button"
                  onClick={() =>
                    setDraftFilters(current => ({
                      ...current,
                      difficulty: value,
                    }))
                  }
                  className={cn(
                    "rounded-full border px-3 py-2 text-xs font-medium transition",
                    draftFilters.difficulty === value
                      ? "border-[var(--brand-muted)] bg-[var(--brand-subtle)] text-[var(--text-primary)]"
                      : "border-[var(--border)] bg-[var(--bg-card-strong)] text-[var(--text-secondary)]"
                  )}
                >
                  {difficulty}
                </button>
              );
            })}
          </div>
        </FilterDisclosure>

        <FilterDisclosure
          title="Type"
          summary={getDisclosureSummary("type")}
          open={filterSections.type}
          onToggle={() =>
            setFilterSections(current => ({
              ...current,
              type: !current.type,
            }))
          }
        >
          <div className="space-y-2">
            {TYPES.map(type => (
              <FilterCheckboxRow
                key={type}
                label={TYPE_LABELS[type] || type}
                checked={draftFilters.types.includes(type)}
                onChange={() =>
                  setDraftFilters(current => ({
                    ...current,
                    types: toggleItem(current.types, type),
                  }))
                }
              />
            ))}
          </div>
        </FilterDisclosure>

        <FilterDisclosure
          title="Topic"
          summary={getDisclosureSummary("topic")}
          open={filterSections.topic}
          onToggle={() =>
            setFilterSections(current => ({
              ...current,
              topic: !current.topic,
            }))
          }
        >
          <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
            {allTopics.map(topic => (
              <FilterCheckboxRow
                key={topic}
                label={topic}
                checked={draftFilters.topics.includes(topic)}
                onChange={() =>
                  setDraftFilters(current => ({
                    ...current,
                    topics: toggleItem(current.topics, topic),
                  }))
                }
                meta={topicCounts[topic] || 0}
                truncateLabel
              />
            ))}
          </div>
        </FilterDisclosure>

        <FilterDisclosure
          title="Year"
          summary={getDisclosureSummary("year")}
          open={filterSections.year}
          onToggle={() =>
            setFilterSections(current => ({
              ...current,
              year: !current.year,
            }))
          }
        >
          <div className="max-h-48 space-y-2 overflow-y-auto pr-1">
            {allYears.map(year => (
              <FilterCheckboxRow
                key={year}
                label={String(year)}
                checked={draftFilters.years.includes(year)}
                onChange={() =>
                  setDraftFilters(current => ({
                    ...current,
                    years: toggleItem(current.years, year),
                  }))
                }
              />
            ))}
          </div>
        </FilterDisclosure>

        <section className={softPanelClassName}>
          <div className="px-4 py-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-faint)]">
              Sort
            </p>
            <select
              value={draftFilters.sortBy}
              onChange={event =>
                setDraftFilters(current => ({
                  ...current,
                  sortBy: event.target.value as SortBy,
                }))
              }
              className={`${fieldClassName} mt-3`}
            >
              <option value="default">New questions first</option>
              <option value="difficulty">Difficulty</option>
              <option value="year">Latest year</option>
            </select>
          </div>
        </section>
      </div>

      <div className="border-t border-[var(--border)] pt-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={applyFilters}
            disabled={!draftChanged}
            className={`${primaryButtonClassName} h-12 px-5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-45`}
          >
            Save filters
          </button>
          <button
            type="button"
            onClick={() => setShowFilters(false)}
            className={`${ghostButtonClassName} h-12 px-5 text-sm font-medium`}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <AppShell
      allowDesktopSidebarToggle
      shellClassName="practice-shell"
      contentClassName="max-w-none"
    >
      <div className="space-y-5">
        {!activeQ ? (
          <>
            <section
              className={cn(
                panelClassName,
                "border-[var(--border-soft)] bg-[var(--bg-card)]"
              )}
            >
              <div className="px-5 py-5 md:px-6 md:py-6">
                <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--text-faint)]">
                      Practice workspace
                    </p>
                    <h1 className="mt-2 text-[2.3rem] font-semibold tracking-[-0.07em] text-[var(--text-primary)] md:text-[3rem]">
                      Practice Questions
                    </h1>
                    <p className="mt-2 text-[15px] text-[var(--text-secondary)]">
                      {questionStateSummary}
                    </p>
                  </div>

                  <div className="grid w-full gap-3 sm:grid-cols-[minmax(0,1fr)_200px_auto] xl:w-auto xl:min-w-[720px]">
                    <div className="relative min-w-0">
                      <Search
                        size={18}
                        className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-[var(--text-faint)]"
                      />
                      <input
                        value={search}
                        onChange={event => {
                          setSearch(event.target.value);
                          setPage(1);
                        }}
                        placeholder="Search by question, topic, exam, or type"
                        className={`search-input-reset search-input-with-icon ${fieldClassName} h-[52px] rounded-[18px] bg-[var(--surface-2)] text-[15px] shadow-none`}
                      />
                    </div>
                    <select
                      value={appliedFilters.sortBy}
                      onChange={event =>
                        setQuickSort(event.target.value as SortBy)
                      }
                      className={`${fieldClassName} h-[52px] rounded-[18px] bg-[var(--surface-2)] pr-10 text-[15px] shadow-none`}
                    >
                      <option value="default">New questions first</option>
                      <option value="difficulty">Sort by difficulty</option>
                      <option value="year">Latest year</option>
                    </select>
                    <button
                      type="button"
                      onClick={openFilterPanel}
                      className={`${ghostButtonClassName} h-[52px] gap-2 rounded-[18px] px-5 text-sm font-semibold`}
                    >
                      <SlidersHorizontal size={16} />
                      Filters
                      {filterCount > 0 ? (
                        <span
                          className={`${accentChipClassName} px-2 py-0.5 text-[11px]`}
                        >
                          {filterCount}
                        </span>
                      ) : null}
                    </button>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap items-center gap-2.5">
                  {REVIEW_OPTIONS.map(item => {
                    const active = appliedFilters.reviewMode === item.value;
                    return (
                      <button
                        key={item.value}
                        type="button"
                        onClick={() => setQuickReviewMode(item.value)}
                        className={cn(
                          "inline-flex h-10 items-center rounded-full border px-4 text-sm font-semibold transition",
                          active
                            ? "border-[var(--brand-muted)] bg-[var(--brand-subtle)] text-[var(--brand)]"
                            : "border-[var(--border)] bg-[var(--surface-2)] text-[var(--text-secondary)] hover:border-[var(--border-strong)] hover:bg-[var(--surface-1)] hover:text-[var(--text-primary)]"
                        )}
                      >
                        {item.label}
                      </button>
                    );
                  })}
                  {filterCount > 0 ? (
                    <button
                      type="button"
                      onClick={clearAll}
                      className="text-sm font-semibold text-[var(--brand)] transition hover:text-[var(--brand-dark)]"
                    >
                      Clear all
                    </button>
                  ) : null}
                </div>

                <div className="mt-5 grid gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
                  {practiceSummaryItems.map(item => (
                    <div
                      key={item.label}
                      className="rounded-[18px] border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-faint)]">
                          {item.label}
                        </p>
                        <span className="text-xs font-medium uppercase tracking-[0.14em] text-[var(--text-faint)]">
                          {item.hint}
                        </span>
                      </div>
                      <p className="mt-2 text-[1.7rem] font-semibold tracking-[-0.06em] text-[var(--text-primary)]">
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border)] pt-4">
                  <p className="text-sm text-[var(--text-secondary)]">
                    {questionsLoading
                      ? "Preparing the question library."
                      : reviewModeSyncing
                        ? "Restoring your saved progress."
                        : `Showing ${visibleRangeStart}-${visibleRangeEnd} of ${filtered.length}`}
                  </p>
                  {activeFilterPills.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {activeFilterPills.map(item => (
                        <span
                          key={item.key}
                          className={`${accentChipClassName} px-3 py-1 text-[11px] font-medium`}
                        >
                          {item.label}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            </section>

            <section
              className={cn(
                panelClassName,
                "border-[var(--border-soft)] bg-[var(--bg-card)]"
              )}
            >
              {questionsLoading ? (
                <PracticeTableSkeleton rows={10} />
              ) : reviewModeSyncing ? (
                <div className="flex min-h-[420px] items-center justify-center px-6 py-10">
                  <div className="inline-flex items-center gap-3 rounded-full border border-[var(--border)] bg-[var(--surface-2)] px-5 py-3 text-sm text-[var(--text-secondary)] shadow-[var(--shadow-sm)]">
                    <Loader2 size={16} className="animate-spin" />
                    Restoring saved progress...
                  </div>
                </div>
              ) : paginated.length === 0 ? (
                <div className="min-h-[360px] px-4 py-8">
                  <PageEmpty
                    title="No questions match those filters"
                    description="Clear a few filters to widen the list and get back into solving mode."
                  >
                    <button
                      type="button"
                      onClick={clearAll}
                      className={`${primaryButtonClassName} mt-2 px-4 py-2.5 text-sm font-semibold`}
                    >
                      Clear filters
                    </button>
                  </PageEmpty>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="min-w-[940px] w-full table-fixed border-collapse">
                      <thead>
                        <tr className="border-b border-[var(--border)]">
                          {TABLE_COLUMNS.map(column => (
                            <th
                              key={column.label}
                              className={`px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)] ${column.className}`}
                            >
                              {column.label}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {paginated.map((question, index) => {
                          const rowNumber = (page - 1) * PER_PAGE + index + 1;
                          const status =
                            answerStatuses[toQuestionId(question.id)];
                          const statusPill = getStatusPill(status);
                          const topicBucket = getTopicBucket(question);

                          return (
                            <tr
                              key={question.id}
                              onClick={() => openQuestion(question)}
                              className="cursor-pointer border-b border-[var(--border)] transition hover:bg-[var(--surface-1)]"
                            >
                              <td className="px-5 py-4 align-middle text-sm font-semibold text-[var(--text-secondary)]">
                                {rowNumber}
                              </td>
                              <td className="px-5 py-4 align-middle">
                                <p className="line-clamp-2 text-[17px] font-semibold leading-7 tracking-[-0.02em] text-[var(--text-primary)]">
                                  {question.question}
                                </p>
                              </td>
                              <td className="px-5 py-4 align-middle">
                                <span
                                  className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-medium ${getExamPillClass(
                                    question.exam
                                  )}`}
                                >
                                  {question.exam}
                                </span>
                              </td>
                              <td className="px-5 py-4 align-middle">
                                <p className="text-[16px] font-semibold tracking-[-0.01em] text-[var(--text-primary)]">
                                  {topicBucket}
                                </p>
                                {topicBucket !== question.topic ? (
                                  <p className="mt-1 text-[14px] text-[var(--text-secondary)]">
                                    {question.topic}
                                  </p>
                                ) : null}
                              </td>
                              <td className="px-5 py-4 align-middle">
                                <span
                                  className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-medium ${getDifficultyPillClass(
                                    question.difficulty
                                  )}`}
                                >
                                  {question.difficulty}
                                </span>
                              </td>
                              <td className="px-5 py-4 align-middle text-sm font-semibold text-[var(--text-secondary)]">
                                {question.year ?? "—"}
                              </td>
                              <td className="px-5 py-4 align-middle">
                                {progressSyncing ? (
                                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--bg-card-strong)] text-[var(--text-muted)]">
                                    <Loader2
                                      size={12}
                                      className="animate-spin"
                                    />
                                  </span>
                                ) : (
                                  <span
                                    className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium ${statusPill.className}`}
                                  >
                                    {statusPill.icon}
                                    {statusPill.label}
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {totalPages > 1 ? (
                    <div className="flex flex-col gap-3 px-5 py-4 md:flex-row md:items-center md:justify-between">
                      <p className="text-sm text-[var(--text-secondary)]">
                        {visibleRangeStart}-{visibleRangeEnd} of {filtered.length}
                      </p>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            setPage(current => Math.max(1, current - 1))
                          }
                          disabled={page === 1}
                          className={`${ghostButtonClassName} h-10 w-10 disabled:opacity-40`}
                        >
                          <ChevronLeft size={14} />
                        </button>
                        {Array.from(
                          { length: Math.min(5, totalPages) },
                          (_, index) => {
                            const currentPage =
                              page <= 3 ? index + 1 : page + index - 2;
                            if (currentPage < 1 || currentPage > totalPages) {
                              return null;
                            }

                            const isActive = currentPage === page;

                            return (
                              <button
                                key={currentPage}
                                type="button"
                                onClick={() => setPage(currentPage)}
                                className={
                                  isActive
                                    ? `${primaryButtonClassName} h-10 min-w-10 px-3 text-sm font-semibold`
                                    : `${ghostButtonClassName} h-10 min-w-10 px-3 text-sm font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)]`
                                }
                              >
                                {currentPage}
                              </button>
                            );
                          }
                        )}
                        <button
                          type="button"
                          onClick={() =>
                            setPage(current =>
                              Math.min(totalPages, current + 1)
                            )
                          }
                          disabled={page === totalPages}
                          className={`${ghostButtonClassName} h-10 w-10 disabled:opacity-40`}
                        >
                          <ChevronRight size={14} />
                        </button>
                      </div>
                    </div>
                  ) : null}
                </>
              )}
            </section>

            <Sheet open={showFilters} onOpenChange={setShowFilters}>
              <SheetContent
                side="right"
                className="w-[96vw] max-w-[430px] border-l border-[var(--border)] bg-[var(--bg-base)] p-5 text-[var(--text-primary)]"
              >
                {filterPanel}
              </SheetContent>
            </Sheet>
          </>
        ) : (
          <section className={panelClassName}>
            <div className="border-b border-[var(--border)] px-5 py-4 md:px-6">
              <div className="mx-auto max-w-[1040px]">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={closeQuestion}
                      className={`${ghostButtonClassName} h-11 gap-2 px-4 text-sm font-semibold`}
                    >
                      <ChevronLeft size={14} />
                      Back to library
                    </button>
                    <span
                      className={`${accentChipClassName} px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em]`}
                    >
                      {activeIdx + 1} of {filtered.length}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleBookmark}
                      disabled={Boolean(user) && questionsSyncing}
                      className={`${ghostButtonClassName} h-10 w-10`}
                    >
                      {Boolean(user) && questionsSyncing ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : bookmarkSet.has(toQuestionId(activeQ.id)) ? (
                        <BookmarkCheck
                          size={14}
                          className="text-[var(--brand)]"
                        />
                      ) : (
                        <Bookmark size={14} />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={handleReportQuestion}
                      className={`${ghostButtonClassName} h-10 w-10`}
                    >
                      <Flag size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={closeQuestion}
                      className={`${ghostButtonClassName} h-10 w-10`}
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-2.5">
                  <span
                    className={`inline-flex items-center rounded-full border px-3 py-1.5 text-[0.72rem] font-semibold tracking-[0.03em] shadow-[var(--shadow-sm)] ${getExamPillClass(
                      activeQ.exam
                    )}`}
                  >
                    {activeQ.exam}
                  </span>
                  <span
                    className={`inline-flex items-center rounded-full border px-3 py-1.5 text-[0.72rem] font-semibold tracking-[0.03em] shadow-[var(--shadow-sm)] ${getDifficultyPillClass(
                      activeQ.difficulty
                    )}`}
                  >
                    {activeQ.difficulty}
                  </span>
                  <span className={neutralMetaPillClassName}>
                    {getTopicBucket(activeQ)}
                  </span>
                  <span className={neutralMetaPillClassName}>
                    {TYPE_LABELS[activeQ.type] || activeQ.type}
                  </span>
                  {activeQ.year ? (
                    <span className={neutralMetaPillClassName}>
                      {activeQ.year}
                    </span>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="px-5 py-5 md:px-6 md:py-6">
              <div className="mx-auto mb-5 max-w-[1040px]">
                <SwipeDismissNotice
                  title="Swipe between questions"
                  description="Swipe left for next, right for previous. Buttons still work for click-first users."
                  className="bg-[var(--surface-1)]"
                />
              </div>

              <div
                {...activeQuestionSwipe.bind}
                className="mx-auto max-w-[1040px] space-y-5 transition-[transform,opacity] duration-200"
                style={{
                  transform: `translateX(${activeQuestionSwipe.offsetX}px)`,
                  opacity: activeQuestionSwipe.isDragging
                    ? Math.max(
                        0.78,
                        1 - Math.abs(activeQuestionSwipe.offsetX) / 320
                      )
                    : 1,
                  touchAction: activeQuestionSwipe.touchAction,
                  transition: activeQuestionSwipe.isDragging
                    ? "none"
                    : "transform 200ms cubic-bezier(0.4,0,0.2,1), opacity 200ms cubic-bezier(0.4,0,0.2,1)",
                }}
              >
                <div
                  className={cn(
                    softPanelClassName,
                    "relative overflow-hidden bg-[var(--bg-card-strong)] px-5 py-4 md:px-6 md:py-5"
                  )}
                >
                  <div className="absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,var(--brand-light)_0%,var(--brand)_60%,transparent_100%)]" />
                  <p className={sectionLabelClassName}>Question</p>
                  <div className="mt-4 max-w-[46rem] whitespace-pre-line text-[1.08rem] font-semibold leading-[1.65] tracking-[-0.025em] text-[var(--text-primary)] md:text-[1.32rem]">
                    {formattedActiveQuestion}
                  </div>
                </div>

                <div className="grid gap-2.5">
                  {activeQ.options.map((option, index) => {
                    const isSelected = selectedOption === index;
                    const isSubmitted = submittedOption !== null;

                    let optionClass =
                      "option-btn group border-[var(--border)] bg-[var(--bg-card-strong)]";

                    if (isSubmitted) {
                      if (index === activeQ.correct) {
                        optionClass = "option-btn group correct";
                      } else if (index === submittedOption) {
                        optionClass = "option-btn group wrong";
                      } else {
                        optionClass = "option-btn group dimmed";
                      }
                    } else if (isSelected) {
                      optionClass =
                        "option-btn group border-[var(--brand)] bg-[var(--brand-subtle)] -translate-y-0.5";
                    }

                    return (
                      <button
                        key={`${option}-${index}`}
                        type="button"
                        onClick={() => {
                          if (submittedOption !== null) return;
                          setSelectedOption(index);
                        }}
                        disabled={Boolean(user) && questionsSyncing}
                        className={optionClass}
                      >
                        <span className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-3">
                          <span
                            className={cn(
                              "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border text-sm font-semibold transition-all",
                              submittedOption !== null &&
                                index === activeQ.correct
                                ? "border-[var(--green)] bg-[var(--green)] text-white"
                              : submittedOption !== null &&
                                    index === submittedOption
                                  ? "border-[var(--red)] bg-[var(--red)] text-white"
                                  : isSelected
                                    ? "border-[var(--brand)] bg-[var(--brand)] text-[var(--text-on-brand)] shadow-[var(--shadow-sm)]"
                                    : "border-[var(--border-strong)] bg-[var(--surface-1)] text-[var(--text-muted)] group-hover:border-[var(--brand-muted)] group-hover:bg-[var(--brand-subtle)] group-hover:text-[var(--brand)]"
                            )}
                          >
                            {OPTION_LABELS[index]}
                          </span>
                          <span
                            className={cn(
                              "pt-0.5 text-[1rem] leading-7 text-[var(--text-primary)] md:text-[1.04rem]",
                              isSelected && submittedOption === null
                                ? "font-semibold"
                                : "font-medium"
                            )}
                          >
                            {option}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="flex flex-col gap-3 rounded-[18px] border border-[var(--border)] bg-[var(--surface-1)] px-5 py-4 shadow-[var(--shadow-sm)] md:flex-row md:items-center md:justify-between">
                  <p className="text-sm leading-6 text-[var(--text-secondary)] md:max-w-[38rem]">
                    {submittedOption === null
                      ? selectedOption === null
                        ? "Choose one option to lock your attention on an answer, then submit to reveal the explanation."
                        : `Option ${OPTION_LABELS[selectedOption]} is selected. Submit when you're ready to check it.`
                      : "Answer submitted. The explanation is unlocked below."}
                  </p>
                  <button
                    type="button"
                    onClick={submitAnswer}
                    disabled={
                      selectedOption === null ||
                      submittedOption !== null ||
                      (Boolean(user) && questionsSyncing)
                    }
                    className={`${primaryButtonClassName} h-11 min-w-[9rem] px-6 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-45`}
                  >
                    Submit
                  </button>
                </div>

                {user && questionsSyncing ? (
                  <p className="text-xs text-[var(--brand-light)]">
                    Syncing the live question bank before answers and bookmarks
                    are written to your account.
                  </p>
                ) : null}

                {submittedOption !== null ? (
                  <div
                    className={cn(
                      softPanelClassName,
                      "overflow-hidden bg-[var(--bg-card-strong)]"
                    )}
                  >
                    <div
                      className={cn(
                        "border-b px-5 py-4 md:px-6",
                        submittedOption === activeQ.correct
                          ? "border-[rgba(21,128,61,0.14)] bg-[rgba(21,128,61,0.08)]"
                          : "border-[rgba(220,38,38,0.14)] bg-[rgba(220,38,38,0.08)]"
                      )}
                    >
                      <p className={sectionLabelClassName}>Answer</p>
                      <p className="mt-2 text-lg font-semibold tracking-[-0.02em] text-[var(--text-primary)]">
                        {submittedOption === activeQ.correct
                          ? "Correct. Keep the flow going."
                          : `Not quite. The correct answer is ${OPTION_LABELS[activeQ.correct]}.`}
                      </p>
                    </div>

                    <div className="space-y-4 px-5 py-5 md:px-6">
                      <div className={`${insetCardClassName} px-4 py-4`}>
                        <p className={sectionLabelClassName}>Explanation</p>
                        <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)] md:text-[0.98rem]">
                          {activeQ.explanation}
                        </p>
                      </div>

                      {!user ? (
                        <p className="text-xs text-[var(--brand-light)]">
                          Sign in to save progress, accuracy, and streaks across
                          sessions.
                        </p>
                      ) : questionsSyncing ? (
                        <p className="text-xs text-[var(--brand-light)]">
                          Hold for a moment while PrepBros syncs the live
                          question bank before saving progress.
                        </p>
                      ) : null}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>

            <div className="border-t border-[var(--border)] px-5 py-5 md:px-6">
              <div className="mx-auto grid max-w-[1040px] gap-3 md:grid-cols-2">
                <button
                  type="button"
                  onClick={() => navigateQuestion(-1)}
                  disabled={!canNavigatePrev}
                  className={`${navigationButtonClassName} h-12 justify-start gap-2 px-5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-40`}
                >
                  <ChevronLeft size={15} />
                  Previous
                </button>
                <button
                  type="button"
                  onClick={() => navigateQuestion(1)}
                  disabled={!canNavigateNext}
                  className={`${primaryButtonClassName} h-12 justify-end gap-2 px-5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-40`}
                >
                  Next
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>
          </section>
        )}
      </div>
    </AppShell>
  );
}
