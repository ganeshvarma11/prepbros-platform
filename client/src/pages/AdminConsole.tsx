import { Link } from "wouter";
import {
  AlertCircle,
  Bell,
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
  Upload,
  UserPlus,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";

const adminInputClass =
  "w-full rounded-xl border border-[#d7dde5] bg-white px-3.5 py-2.5 text-sm text-[#111827] outline-none transition placeholder:text-[#8b95a7] focus:border-[#b86a2d] focus:ring-4 focus:ring-[#b86a2d]/10";
const adminTextAreaClass =
  "w-full rounded-xl border border-[#d7dde5] bg-white px-3.5 py-3 text-sm text-[#111827] outline-none transition placeholder:text-[#8b95a7] focus:border-[#b86a2d] focus:ring-4 focus:ring-[#b86a2d]/10";
const adminPanelClass =
  "rounded-[20px] border border-[#d7dde5] bg-white shadow-[0_14px_40px_rgba(15,23,42,0.05)]";

function metricToneClasses(tone: string) {
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
  tone?: string;
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
          <h2 className="text-lg font-semibold tracking-[-0.03em] text-[#111827]">{title}</h2>
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
  tone?: string;
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
        tone === "primary" && "bg-[#111827] text-white hover:bg-[#1f2937]",
        tone === "danger" && "border border-[#e7cfd4] bg-[#fcf4f5] text-[#9c4451] hover:bg-[#faecef]",
        tone === "neutral" && "border border-[#d7dde5] bg-white text-[#334155] hover:bg-[#f8fafc]"
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

export default function AdminConsole(props: any) {
  const {
    user,
    activeTab,
    setActiveTab,
    activeTabMeta,
    tabCounts,
    loadingTarget,
    loadAll,
    signOut,
    adminTabs,
    adminTabMeta,
    questionStats,
    resourceStats,
    updateStats,
    supportStats,
    todayAnalytics,
    currentMonthAnalytics,
    currentYearAnalytics,
    averagePageViewsPerVisitor,
    trafficSummary,
    engagementSummary,
    analyticsDaily,
    analyticsTopPages,
    formatNumber,
    formatPercent,
    formatDate,
    formatDurationLabel,
    formatShortDateLabel,
    formatMonthLabel,
    formatYearLabel,
    growthTone,
    describeGrowth,
    adminUpdateTimeline,
    questionSearch,
    setQuestionSearch,
    questionExamFilter,
    setQuestionExamFilter,
    questionTopicFilter,
    setQuestionTopicFilter,
    questionTypeFilter,
    setQuestionTypeFilter,
    questionDifficultyFilter,
    setQuestionDifficultyFilter,
    questionStatusFilter,
    setQuestionStatusFilter,
    availableQuestionTopics,
    filteredQuestions,
    selectedQuestionIds,
    allVisibleQuestionsSelected,
    toggleSelectVisibleQuestions,
    updateQuestionsActiveState,
    deleteQuestions,
    exportFilteredQuestions,
    showQuestionImport,
    setShowQuestionImport,
    openNewQuestionForm,
    questionFileInputRef,
    handleQuestionFileUpload,
    questionImportInput,
    setQuestionImportInput,
    questionImportPreview,
    importQuestions,
    replaceFilteredQuestionsWithImport,
    clearQuestionImportState,
    questionImportSource,
    bulkImportTemplate,
    showQuestionForm,
    editingQuestionId,
    resetQuestionForm,
    questionForm,
    setQuestionForm,
    saveQuestion,
    startEditQuestion,
    toggleQuestionSelection,
    filterExams,
    questionExams,
    questionTypes,
    difficulties,
    resourceSearch,
    setResourceSearch,
    resourceExamFilter,
    setResourceExamFilter,
    resourceTypeFilter,
    setResourceTypeFilter,
    resourceCategoryFilter,
    setResourceCategoryFilter,
    resourceStatusFilter,
    setResourceStatusFilter,
    availableResourceCategories,
    filteredResources,
    selectedResourceIds,
    allVisibleResourcesSelected,
    toggleSelectVisibleResources,
    updateResourcesActiveState,
    deleteResources,
    exportFilteredResources,
    showResourceImport,
    setShowResourceImport,
    openNewResourceForm,
    resourceFileInputRef,
    handleResourceFileUpload,
    resourceImportInput,
    setResourceImportInput,
    resourceImportPreview,
    importResources,
    resourceImportSource,
    bulkResourceTemplate,
    showResourceForm,
    editingResourceId,
    resetResourceForm,
    resourceForm,
    setResourceForm,
    saveResource,
    startEditResource,
    toggleResourceSelection,
    resourceExams,
    resourceTypes,
    updateSearch,
    setUpdateSearch,
    updateStateFilter,
    setUpdateStateFilter,
    updateExamTypeFilter,
    setUpdateExamTypeFilter,
    updateQualificationFilter,
    setUpdateQualificationFilter,
    updateStatusFilter,
    setUpdateStatusFilter,
    updateTimelineFilter,
    setUpdateTimelineFilter,
    availableUpdateStates,
    filteredUpdates,
    selectedUpdateIds,
    allVisibleUpdatesSelected,
    toggleSelectVisibleUpdates,
    updateUpdatesActiveState,
    deleteUpdates,
    exportFilteredUpdates,
    showUpdateImport,
    setShowUpdateImport,
    openNewUpdateForm,
    updateFileInputRef,
    handleUpdateFileUpload,
    updateImportInput,
    setUpdateImportInput,
    updateImportPreview,
    importUpdates,
    updateImportSource,
    bulkUpdateTemplate,
    showUpdateForm,
    editingUpdateId,
    resetUpdateForm,
    updateForm,
    setUpdateForm,
    saveUpdate,
    startEditUpdate,
    toggleUpdateSelection,
    examTypes,
    qualificationTiers,
    updateTimelineFilters,
    dbContests,
    showContestForm,
    setShowContestForm,
    contestForm,
    setContestForm,
    resetContestForm,
    saveContest,
    editingContestId,
    startEditContest,
    deleteContest,
    contestStatuses,
    supportSearch,
    setSupportSearch,
    filteredSupportRequests,
    selectedSupportRequest,
    setSelectedSupportId,
    supportRepliesByRequestId,
    openReplyDialog,
    buildSupportReplyLink,
    updateSupportStatus,
    supportStatusTone,
    toId,
  } = props;

  const ActiveTabIcon = activeTabMeta.icon;

  return (
    <div className="mx-auto flex max-w-[1580px] gap-6 px-4 py-4 sm:px-6 lg:px-8">
      <aside className="hidden lg:sticky lg:top-4 lg:flex lg:h-[calc(100vh-2rem)] lg:w-[280px] lg:flex-col lg:overflow-hidden lg:rounded-[24px] lg:border lg:border-[#d7dde5] lg:bg-[#fbfbfa] lg:shadow-[0_18px_48px_rgba(15,23,42,0.06)]">
        <div className="border-b border-[#e4e7ec] px-5 py-5">
          <Link href="/" className="flex items-center gap-3">
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[#111827] text-sm font-bold text-white">
              P
            </div>
            <div>
              <p className="text-sm font-semibold text-[#111827]">PrepBros Admin</p>
              <p className="text-xs text-[#667085]">Operator console</p>
            </div>
          </Link>
          <div className="mt-4 rounded-xl border border-[#e4d2c4] bg-[#fbf4ee] px-3 py-2 text-xs font-medium text-[#9a5a2b]">
            Verified admin access
          </div>
        </div>

        <div className="flex-1 space-y-2 overflow-y-auto px-3 py-4">
          {adminTabs.map((tab: string) => {
            const meta = adminTabMeta[tab];
            const Icon = meta.icon;
            const active = activeTab === tab;

            return (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "flex w-full items-start gap-3 rounded-[18px] px-4 py-3 text-left transition",
                  active ? "bg-[#111827] text-white shadow-[0_16px_30px_rgba(15,23,42,0.18)]" : "text-[#334155] hover:bg-white"
                )}
              >
                <div
                  className={cn(
                    "mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-xl border",
                    active ? "border-white/10 bg-white/10 text-white" : metricToneClasses("slate")
                  )}
                >
                  <Icon size={16} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-semibold">{meta.label}</span>
                    <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-semibold", active ? "bg-white/10 text-white" : "bg-[#eef2f6] text-[#475467]")}>
                      {formatNumber(tabCounts[tab])}
                    </span>
                  </div>
                  <p className={cn("mt-1 text-xs leading-5", active ? "text-white/70" : "text-[#667085]")}>
                    {meta.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        <div className="border-t border-[#e4e7ec] px-5 py-4">
          <div className="grid gap-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-[#667085]">Questions</span>
              <span className="font-semibold text-[#111827]">{questionStats.total}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#667085]">Live updates</span>
              <span className="font-semibold text-[#111827]">{updateStats.active}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#667085]">Open tickets</span>
              <span className="font-semibold text-[#111827]">{supportStats.open}</span>
            </div>
          </div>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <div className="sticky top-0 z-30 -mx-4 border-b border-[#dde3ea] bg-[#f7f7f6]/95 px-4 pb-5 pt-4 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#d7dde5] bg-white text-[#111827] shadow-[0_8px_20px_rgba(15,23,42,0.05)] lg:hidden">
                  <ActiveTabIcon size={16} />
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#667085]">
                    PrepBros Admin
                  </p>
                  <h1 className="mt-1 text-[clamp(1.9rem,2.7vw,3rem)] font-semibold tracking-[-0.06em] text-[#111827]">
                    {activeTabMeta.label}
                  </h1>
                </div>
              </div>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-[#667085]">
                {activeTabMeta.description} The redesign uses a lighter, table-first system so operators can scan, filter, and act without wading through card clutter.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="hidden rounded-full border border-[#d7dde5] bg-white px-3 py-2 text-xs font-medium text-[#475467] md:inline-flex">
                {user.email}
              </span>
              <SmallButton icon={RefreshCcw} onClick={() => void loadAll()} disabled={loadingTarget !== null}>
                {loadingTarget === "refresh" ? "Refreshing..." : "Refresh"}
              </SmallButton>
              <SmallButton icon={LogOut} onClick={() => signOut()}>
                Sign out
              </SmallButton>
            </div>
          </div>

          <div className="mt-5 grid gap-3 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
            <div className="rounded-[20px] border border-[#d7dde5] bg-white px-5 py-5 shadow-[0_14px_38px_rgba(15,23,42,0.05)]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#667085]">
                Console Overview
              </p>
              <div className="mt-4 grid gap-4 md:grid-cols-4">
                <div>
                  <p className="text-xs text-[#667085]">Questions</p>
                  <p className="mt-1 text-2xl font-semibold tracking-[-0.05em] text-[#111827]">{questionStats.total}</p>
                </div>
                <div>
                  <p className="text-xs text-[#667085]">Resources</p>
                  <p className="mt-1 text-2xl font-semibold tracking-[-0.05em] text-[#111827]">{resourceStats.total}</p>
                </div>
                <div>
                  <p className="text-xs text-[#667085]">Open updates</p>
                  <p className="mt-1 text-2xl font-semibold tracking-[-0.05em] text-[#111827]">{updateStats.open}</p>
                </div>
                <div>
                  <p className="text-xs text-[#667085]">Support queue</p>
                  <p className="mt-1 text-2xl font-semibold tracking-[-0.05em] text-[#111827]">{supportStats.total}</p>
                </div>
              </div>
            </div>

            <div className="rounded-[20px] border border-[#d7dde5] bg-[#111827] px-5 py-5 text-white shadow-[0_20px_44px_rgba(15,23,42,0.18)]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/60">
                Operator read
              </p>
              <p className="mt-3 text-lg font-semibold tracking-[-0.04em]">
                {activeTab === "analytics"
                  ? "Cleanly separated performance, growth, and page attention."
                  : activeTab === "questions"
                    ? "Table-led inventory with import and editor controls docked to the side."
                    : activeTab === "resources"
                      ? "Compact management for study assets with stronger metadata hierarchy."
                      : activeTab === "updates"
                        ? "Publishing desk with status, timing, and link review in one place."
                        : activeTab === "contests"
                          ? "Contest schedule and outcomes managed like operational records."
                          : "Inbox-style support workflow with queue on the left and detail on the right."}
              </p>
              <p className="mt-2 text-sm leading-6 text-white/72">
                This panel now commits to a crisp light console, restrained surfaces, sharper structure, and fewer nested containers.
              </p>
            </div>
          </div>

          <div className="mt-4 flex gap-2 overflow-x-auto pb-1 lg:hidden">
            {adminTabs.map((tab: string) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "whitespace-nowrap rounded-xl border px-3.5 py-2 text-sm font-medium transition",
                  activeTab === tab ? "border-[#111827] bg-[#111827] text-white" : "border-[#d7dde5] bg-white text-[#475467]"
                )}
              >
                {adminTabMeta[tab].label} ({formatNumber(tabCounts[tab])})
              </button>
            ))}
          </div>
        </div>

        <main className="space-y-6 py-6">
          {activeTab === "analytics" ? (
            <>
              <SectionCard
                title="Performance Snapshot"
                description="Use this as the front-door read for traffic, conversion activity, and attention quality."
              >
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                  <MetricCard label="Visitors Today" value={formatNumber(todayAnalytics?.visitors)} hint="Unique visitors or sessions." icon={Users} tone="blue" />
                  <MetricCard label="Page Views" value={formatNumber(todayAnalytics?.page_views)} hint="Total tracked page opens today." icon={MousePointerClick} tone="orange" />
                  <MetricCard label="Sign-ins" value={formatNumber(todayAnalytics?.signins)} hint="Successful logins today." icon={ShieldCheck} tone="green" />
                  <MetricCard label="Sign-ups" value={formatNumber(todayAnalytics?.signups)} hint="New accounts created today." icon={UserPlus} tone="blue" />
                  <MetricCard label="Avg Engaged Time" value={formatDurationLabel(todayAnalytics?.avg_engaged_seconds)} hint="Average engaged time per visit." icon={Timer} tone="rose" />
                </div>
              </SectionCard>

              <SectionCard
                title="Growth And Interpretation"
                description="A simple, operator-friendly read on how today compares with month and year movement."
              >
                <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_0.85fr]">
                  <div className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="rounded-[18px] border border-[#d7dde5] bg-[#fbfcfd] p-4">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#667085]">Today</p>
                        <p className="mt-3 text-xl font-semibold tracking-[-0.04em] text-[#111827]">{formatShortDateLabel(todayAnalytics?.day)}</p>
                        <div className="mt-4 space-y-2 text-sm text-[#475467]">
                          <p>{formatNumber(todayAnalytics?.visitors)} visitors</p>
                          <p>{formatNumber(todayAnalytics?.page_views)} page views</p>
                          <p>{formatNumber(todayAnalytics?.signins)} sign-ins</p>
                        </div>
                      </div>

                      <div className="rounded-[18px] border border-[#d7dde5] bg-[#fbfcfd] p-4">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#667085]">This Month</p>
                        <p className="mt-3 text-xl font-semibold tracking-[-0.04em] text-[#111827]">{formatMonthLabel(currentMonthAnalytics?.month)}</p>
                        <div className="mt-4 flex flex-wrap gap-2">
                          <Pill tone={growthTone(currentMonthAnalytics?.visitor_growth_pct)}>Visitors {formatPercent(currentMonthAnalytics?.visitor_growth_pct)}</Pill>
                          <Pill tone={growthTone(currentMonthAnalytics?.signup_growth_pct)}>Sign-ups {formatPercent(currentMonthAnalytics?.signup_growth_pct)}</Pill>
                        </div>
                        <p className="mt-3 text-sm leading-6 text-[#667085]">{describeGrowth("Visitors", currentMonthAnalytics?.visitor_growth_pct)}</p>
                      </div>

                      <div className="rounded-[18px] border border-[#d7dde5] bg-[#fbfcfd] p-4">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#667085]">This Year</p>
                        <p className="mt-3 text-xl font-semibold tracking-[-0.04em] text-[#111827]">{formatYearLabel(currentYearAnalytics?.year)}</p>
                        <div className="mt-4 flex flex-wrap gap-2">
                          <Pill tone={growthTone(currentYearAnalytics?.visitor_growth_pct)}>Visitors {formatPercent(currentYearAnalytics?.visitor_growth_pct)}</Pill>
                          <Pill tone={growthTone(currentYearAnalytics?.signin_growth_pct)}>Sign-ins {formatPercent(currentYearAnalytics?.signin_growth_pct)}</Pill>
                        </div>
                        <p className="mt-3 text-sm leading-6 text-[#667085]">{describeGrowth("Sign-ins", currentYearAnalytics?.signin_growth_pct)}</p>
                      </div>
                    </div>

                    <div className="overflow-hidden rounded-[18px] border border-[#d7dde5]">
                      <div className="border-b border-[#e4e7ec] bg-[#fbfcfd] px-4 py-3">
                        <p className="text-sm font-semibold text-[#111827]">Recent daily pattern</p>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="min-w-full text-left text-sm">
                          <thead className="bg-white">
                            <tr className="border-b border-[#e4e7ec] text-[11px] uppercase tracking-[0.18em] text-[#667085]">
                              <th className="px-4 py-3 font-semibold">Day</th>
                              <th className="px-4 py-3 font-semibold">Visitors</th>
                              <th className="px-4 py-3 font-semibold">Views</th>
                              <th className="px-4 py-3 font-semibold">Sign-ins</th>
                              <th className="px-4 py-3 font-semibold">Engaged</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white">
                            {analyticsDaily.slice(0, 7).map((row: any) => (
                              <tr key={row.day} className="border-b border-[#edf1f5] last:border-b-0">
                                <td className="px-4 py-3 font-medium text-[#111827]">{formatShortDateLabel(row.day)}</td>
                                <td className="px-4 py-3 text-[#475467]">{formatNumber(row.visitors)}</td>
                                <td className="px-4 py-3 text-[#475467]">{formatNumber(row.page_views)}</td>
                                <td className="px-4 py-3 text-[#475467]">{formatNumber(row.signins)}</td>
                                <td className="px-4 py-3 text-[#475467]">{formatDurationLabel(row.avg_engaged_seconds)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="rounded-[18px] border border-[#d7dde5] bg-[#fbfcfd] p-5">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#667085]">What to tell the team</p>
                      <p className="mt-3 text-base font-semibold tracking-[-0.03em] text-[#111827]">
                        {averagePageViewsPerVisitor > 0 ? `${averagePageViewsPerVisitor.toFixed(1)} pages per visitor` : "Still collecting traffic quality"}
                      </p>
                      <p className="mt-2 text-sm leading-7 text-[#667085]">{trafficSummary}</p>
                      <p className="mt-4 text-sm leading-7 text-[#667085]">{engagementSummary}</p>
                    </div>

                    <div className="rounded-[18px] border border-[#d7dde5] bg-white p-5">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#667085]">Reading notes</p>
                      <div className="mt-3 space-y-3 text-sm leading-7 text-[#475467]">
                        <p>Visitors approximate unique people or sessions.</p>
                        <p>Page views count every tracked open, so they should run above visitors.</p>
                        <p>Engaged time is directional and best used as a comparison signal.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </SectionCard>

              <SectionCard title="Top Pages" description="Traffic and attention ranked by page so operators can spot what is holding user focus.">
                {analyticsTopPages.length === 0 ? (
                  <EmptyState icon={Database} title="No analytics pages yet" description="Open the product a few times and the ranking table will start filling in." />
                ) : (
                  <div className="overflow-hidden rounded-[18px] border border-[#d7dde5]">
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-left text-sm">
                        <thead className="bg-[#fbfcfd]">
                          <tr className="border-b border-[#e4e7ec] text-[11px] uppercase tracking-[0.18em] text-[#667085]">
                            <th className="px-4 py-3 font-semibold">Page</th>
                            <th className="px-4 py-3 font-semibold">Views</th>
                            <th className="px-4 py-3 font-semibold">Visitors</th>
                            <th className="px-4 py-3 font-semibold">Avg engaged</th>
                            <th className="px-4 py-3 font-semibold">Read</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white">
                          {analyticsTopPages.map((page: any) => (
                            <tr key={`${page.path}-${page.page_views}-${page.visitors}`} className="border-b border-[#edf1f5] last:border-b-0">
                              <td className="px-4 py-3 font-medium text-[#111827]">{page.path || "/"}</td>
                              <td className="px-4 py-3 text-[#475467]">{formatNumber(page.page_views)}</td>
                              <td className="px-4 py-3 text-[#475467]">{formatNumber(page.visitors)}</td>
                              <td className="px-4 py-3 text-[#475467]">{formatDurationLabel(page.avg_engaged_seconds)}</td>
                              <td className="px-4 py-3 text-[#667085]">
                                {page.avg_engaged_seconds && page.avg_engaged_seconds >= 60 ? "Holding attention well" : page.page_views && page.page_views >= 3 ? "Getting repeat traffic" : "Still early"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </SectionCard>
            </>
          ) : null}

          {activeTab === "questions" ? (
            <>
              <SectionCard title="Question Operations" description="Table-first inventory for cleanup, bulk actions, imports, and one-off editing." actions={<><SmallButton icon={Upload} onClick={() => setShowQuestionImport((current: boolean) => !current)}>{showQuestionImport ? "Hide import" : "Open import"}</SmallButton><SmallButton icon={Plus} tone="primary" onClick={openNewQuestionForm}>Add question</SmallButton></>}>
                <div className="grid gap-4 md:grid-cols-4">
                  <MetricCard label="Total rows" value={questionStats.total} hint="All questions in the bank." icon={Database} tone="slate" />
                  <MetricCard label="Active rows" value={questionStats.active} hint="Currently visible to operators." icon={CheckCircle2} tone="green" />
                  <MetricCard label="PYQs" value={questionStats.pyq} hint="Past-year question coverage." icon={ShieldCheck} tone="blue" />
                  <MetricCard label="UPSC" value={questionStats.upsc} hint="UPSC-tagged rows." icon={BookOpen} tone="orange" />
                </div>
              </SectionCard>

              <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
                <SectionCard title="Question Inventory" description="Filter aggressively, select visible rows, then activate, deactivate, export, or delete with confidence.">
                  <div className="space-y-5">
                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
                      <label className="xl:col-span-2">
                        <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.18em] text-[#667085]">Search</span>
                        <div className="relative">
                          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#98a2b3]" />
                          <input value={questionSearch} onChange={event => setQuestionSearch(event.target.value)} placeholder="Question text, explanation, tags, topic..." className={cn(adminInputClass, "pl-10")} />
                        </div>
                      </label>
                      <label><span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.18em] text-[#667085]">Exam</span><select value={questionExamFilter} onChange={event => setQuestionExamFilter(event.target.value)} className={adminInputClass}>{filterExams.map((exam: string) => <option key={exam} value={exam}>{exam}</option>)}</select></label>
                      <label><span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.18em] text-[#667085]">Topic</span><select value={questionTopicFilter} onChange={event => setQuestionTopicFilter(event.target.value)} className={adminInputClass}>{availableQuestionTopics.map((topic: string) => <option key={topic} value={topic}>{topic}</option>)}</select></label>
                      <label><span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.18em] text-[#667085]">Type</span><select value={questionTypeFilter} onChange={event => setQuestionTypeFilter(event.target.value)} className={adminInputClass}><option value="All">All</option>{questionTypes.map((type: string) => <option key={type} value={type}>{type}</option>)}</select></label>
                    </div>

                    <div className="grid gap-3 md:grid-cols-4">
                      <label><span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.18em] text-[#667085]">Difficulty</span><select value={questionDifficultyFilter} onChange={event => setQuestionDifficultyFilter(event.target.value)} className={adminInputClass}><option value="All">All</option>{difficulties.map((difficulty: string) => <option key={difficulty} value={difficulty}>{difficulty}</option>)}</select></label>
                      <label><span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.18em] text-[#667085]">Status</span><select value={questionStatusFilter} onChange={event => setQuestionStatusFilter(event.target.value)} className={adminInputClass}><option value="All">All</option><option value="Active">Active</option><option value="Inactive">Inactive</option></select></label>
                      <div className="rounded-xl border border-dashed border-[#d7dde5] bg-[#fbfcfd] px-4 py-3"><p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#667085]">Filtered</p><p className="mt-1 text-xl font-semibold tracking-[-0.03em] text-[#111827]">{filteredQuestions.length}</p></div>
                      <div className="rounded-xl border border-dashed border-[#d7dde5] bg-[#fbfcfd] px-4 py-3"><p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#667085]">Selected</p><p className="mt-1 text-xl font-semibold tracking-[-0.03em] text-[#111827]">{selectedQuestionIds.length}</p></div>
                    </div>

                    <div className="flex flex-wrap gap-2 border-t border-[#e4e7ec] pt-4">
                      <SmallButton icon={CheckCircle2} onClick={toggleSelectVisibleQuestions}>{allVisibleQuestionsSelected ? "Unselect visible" : "Select visible"}</SmallButton>
                      <SmallButton icon={ShieldCheck} onClick={() => void updateQuestionsActiveState(selectedQuestionIds, false)} disabled={selectedQuestionIds.length === 0 || loadingTarget !== null}>Deactivate selected</SmallButton>
                      <SmallButton icon={ShieldCheck} onClick={() => void updateQuestionsActiveState(selectedQuestionIds, true)} disabled={selectedQuestionIds.length === 0 || loadingTarget !== null}>Activate selected</SmallButton>
                      <SmallButton icon={Trash2} tone="danger" onClick={() => void deleteQuestions(selectedQuestionIds)} disabled={selectedQuestionIds.length === 0 || loadingTarget !== null}>Delete selected</SmallButton>
                      <SmallButton icon={Download} onClick={exportFilteredQuestions} disabled={filteredQuestions.length === 0}>Export filtered</SmallButton>
                    </div>

                    {filteredQuestions.length === 0 ? (
                      <EmptyState icon={BookOpen} title="No questions match the current filters" description="Widen the filters or import more rows." />
                    ) : (
                      <div className="overflow-hidden rounded-[18px] border border-[#d7dde5]">
                        <div className="overflow-x-auto">
                          <table className="min-w-[1120px] text-left text-sm">
                            <thead className="bg-[#fbfcfd]">
                              <tr className="border-b border-[#e4e7ec] text-[11px] uppercase tracking-[0.18em] text-[#667085]">
                                <th className="px-4 py-3 font-semibold">Select</th>
                                <th className="px-4 py-3 font-semibold">Question</th>
                                <th className="px-4 py-3 font-semibold">Classification</th>
                                <th className="px-4 py-3 font-semibold">Correct</th>
                                <th className="px-4 py-3 font-semibold">Status</th>
                                <th className="px-4 py-3 font-semibold">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white">
                              {filteredQuestions.map((question: any) => {
                                const questionId = toId(question.id);
                                const selected = selectedQuestionIds.includes(questionId);
                                return (
                                  <tr key={questionId} className={cn("border-b border-[#edf1f5] last:border-b-0", selected && "bg-[#fbf4ee]")}>
                                    <td className="px-4 py-4 align-top"><input type="checkbox" checked={selected} onChange={() => toggleQuestionSelection(questionId)} className="mt-1 h-4 w-4 rounded accent-[#b86a2d]" /></td>
                                    <td className="px-4 py-4 align-top"><p className="max-w-xl text-sm font-medium leading-6 text-[#111827]">{question.question}</p><p className="mt-2 line-clamp-2 max-w-xl text-sm leading-6 text-[#667085]">{question.explanation}</p></td>
                                    <td className="px-4 py-4 align-top"><div className="flex max-w-[240px] flex-wrap gap-2"><Pill tone="orange">{question.exam}</Pill><Pill tone="blue">{question.type}</Pill><Pill tone="slate">{question.topic}</Pill><Pill tone="green">{question.difficulty}</Pill>{question.year ? <Pill tone="slate">PYQ {question.year}</Pill> : null}</div></td>
                                    <td className="px-4 py-4 align-top text-[#475467]">{String.fromCharCode(65 + question.correct_option)}. {[question.option_a, question.option_b, question.option_c, question.option_d][question.correct_option]}</td>
                                    <td className="px-4 py-4 align-top"><Pill tone={question.is_active ? "green" : "rose"}>{question.is_active ? "Active" : "Inactive"}</Pill></td>
                                    <td className="px-4 py-4 align-top"><div className="flex flex-wrap gap-2"><SmallButton icon={Edit2} onClick={() => startEditQuestion(question)}>Edit</SmallButton><SmallButton icon={ShieldCheck} onClick={() => void updateQuestionsActiveState([questionId], !question.is_active)} disabled={loadingTarget !== null}>{question.is_active ? "Deactivate" : "Activate"}</SmallButton><SmallButton icon={Trash2} tone="danger" onClick={() => void deleteQuestions([questionId])} disabled={loadingTarget !== null}>Delete</SmallButton></div></td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                </SectionCard>

                <div className="space-y-6">
                  {showQuestionImport ? (
                    <SectionCard title="Bulk Import" description="Paste from Sheets or upload CSV, TSV, TXT, or JSON. Replace filtered is intentionally high-friction." actions={<SmallButton icon={FileSpreadsheet} onClick={() => questionFileInputRef.current?.click()}>Upload file</SmallButton>}>
                      <input ref={questionFileInputRef} type="file" accept=".csv,.tsv,.txt,.json" className="hidden" onChange={handleQuestionFileUpload} />
                      <textarea value={questionImportInput} onChange={event => setQuestionImportInput(event.target.value)} rows={14} placeholder="Paste JSON, CSV, or tab-separated rows here..." className={cn(adminTextAreaClass, "font-mono text-[13px]")} />
                      <div className="mt-4 flex flex-wrap gap-2">
                        <SmallButton icon={Upload} tone="primary" onClick={() => void importQuestions()} disabled={Boolean(questionImportPreview.error) || questionImportPreview.rows.length === 0 || loadingTarget !== null}>{loadingTarget === "import-questions" ? "Importing..." : "Import rows"}</SmallButton>
                        <SmallButton icon={RefreshCcw} tone="danger" onClick={() => void replaceFilteredQuestionsWithImport()} disabled={Boolean(questionImportPreview.error) || questionImportPreview.rows.length === 0 || filteredQuestions.length === 0 || loadingTarget !== null}>{loadingTarget === "replace-filtered-questions" ? "Replacing..." : `Replace filtered (${filteredQuestions.length})`}</SmallButton>
                        <SmallButton onClick={() => setQuestionImportInput(bulkImportTemplate)}>Fill template</SmallButton>
                        <SmallButton onClick={clearQuestionImportState}>Clear</SmallButton>
                      </div>
                      <div className="mt-4 rounded-[18px] border border-[#d7dde5] bg-[#fbfcfd] p-4 text-sm">
                        {questionImportPreview.error ? <p className="text-[#9c4451]">{questionImportPreview.error}</p> : questionImportPreview.rows.length > 0 ? <div className="space-y-3"><p className="font-medium text-[#111827]">{questionImportPreview.rows.length} row{questionImportPreview.rows.length === 1 ? "" : "s"} ready{questionImportSource ? ` from ${questionImportSource}` : ""}</p><p className="text-xs leading-6 text-[#667085]">Current filters match {filteredQuestions.length} question{filteredQuestions.length === 1 ? "" : "s"}.</p></div> : <p className="leading-6 text-[#667085]">Supported fields: question, option_a, option_b, option_c, option_d, correct_option, explanation, exam, topic, subtopic, difficulty, type, year, tags.</p>}
                      </div>
                    </SectionCard>
                  ) : null}

                  {showQuestionForm ? (
                    <SectionCard title={editingQuestionId ? "Edit Question" : "Create Question"} description="Use the side editor for smaller content fixes while keeping the full table in view." actions={<SmallButton onClick={resetQuestionForm} icon={X}>Close editor</SmallButton>}>
                      <div className="space-y-4">
                        <label className="block"><span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.18em] text-[#667085]">Question</span><textarea value={questionForm.question} onChange={event => setQuestionForm((current: any) => ({ ...current, question: event.target.value }))} rows={4} className={adminTextAreaClass} /></label>
                        <div className="grid gap-3 md:grid-cols-2">{(["option_a", "option_b", "option_c", "option_d"] as const).map((field, index) => <label key={field} className="block"><span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.18em] text-[#667085]">Option {String.fromCharCode(65 + index)}</span><input value={questionForm[field]} onChange={event => setQuestionForm((current: any) => ({ ...current, [field]: event.target.value }))} className={adminInputClass} /></label>)}</div>
                        <label className="block"><span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.18em] text-[#667085]">Explanation</span><textarea value={questionForm.explanation} onChange={event => setQuestionForm((current: any) => ({ ...current, explanation: event.target.value }))} rows={4} className={adminTextAreaClass} /></label>
                        <div className="grid gap-3 md:grid-cols-2"><label className="block"><span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.18em] text-[#667085]">Correct option</span><select value={questionForm.correct_option} onChange={event => setQuestionForm((current: any) => ({ ...current, correct_option: Number(event.target.value) }))} className={adminInputClass}>{[0, 1, 2, 3].map(index => <option key={index} value={index}>{String.fromCharCode(65 + index)}</option>)}</select></label><label className="block"><span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.18em] text-[#667085]">Exam</span><select value={questionForm.exam} onChange={event => setQuestionForm((current: any) => ({ ...current, exam: event.target.value }))} className={adminInputClass}>{questionExams.map((exam: string) => <option key={exam} value={exam}>{exam}</option>)}</select></label></div>
                        <div className="grid gap-3 md:grid-cols-2"><label className="block"><span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.18em] text-[#667085]">Topic</span><select value={questionForm.topic} onChange={event => setQuestionForm((current: any) => ({ ...current, topic: event.target.value }))} className={adminInputClass}>{availableQuestionTopics.filter((topic: string) => topic !== "All").map((topic: string) => <option key={topic} value={topic}>{topic}</option>)}</select></label><label className="block"><span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.18em] text-[#667085]">Subtopic</span><input value={questionForm.subtopic} onChange={event => setQuestionForm((current: any) => ({ ...current, subtopic: event.target.value }))} className={adminInputClass} /></label></div>
                        <div className="grid gap-3 md:grid-cols-3"><label className="block"><span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.18em] text-[#667085]">Difficulty</span><select value={questionForm.difficulty} onChange={event => setQuestionForm((current: any) => ({ ...current, difficulty: event.target.value }))} className={adminInputClass}>{difficulties.map((difficulty: string) => <option key={difficulty} value={difficulty}>{difficulty}</option>)}</select></label><label className="block"><span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.18em] text-[#667085]">Type</span><select value={questionForm.type} onChange={event => setQuestionForm((current: any) => ({ ...current, type: event.target.value }))} className={adminInputClass}>{questionTypes.map((type: string) => <option key={type} value={type}>{type}</option>)}</select></label><label className="block"><span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.18em] text-[#667085]">Year</span><input value={questionForm.year} onChange={event => setQuestionForm((current: any) => ({ ...current, year: event.target.value }))} placeholder="2024" className={adminInputClass} /></label></div>
                        <label className="block"><span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.18em] text-[#667085]">Tags</span><input value={questionForm.tags} onChange={event => setQuestionForm((current: any) => ({ ...current, tags: event.target.value }))} placeholder="constitution, article-21a, education" className={adminInputClass} /></label>
                        <label className="flex items-center gap-3 rounded-xl border border-[#d7dde5] bg-[#fbfcfd] px-4 py-3"><input type="checkbox" checked={questionForm.is_active} onChange={event => setQuestionForm((current: any) => ({ ...current, is_active: event.target.checked }))} className="h-4 w-4 rounded accent-[#111827]" /><span className="text-sm font-medium text-[#344054]">Active row</span></label>
                        <div className="flex flex-wrap gap-2"><SmallButton tone="primary" icon={CheckCircle2} onClick={() => void saveQuestion()} disabled={loadingTarget !== null}>{loadingTarget === "save-question" ? "Saving..." : editingQuestionId ? "Update question" : "Save question"}</SmallButton><SmallButton onClick={resetQuestionForm}>Cancel</SmallButton></div>
                      </div>
                    </SectionCard>
                  ) : null}
                </div>
              </div>
            </>
          ) : null}

          {activeTab === "resources" ? (
            <>
              <SectionCard title="Resource Operations" description="Manage PDFs, books, notes, and video links with a quieter, metadata-led workflow." actions={<><SmallButton icon={Upload} onClick={() => setShowResourceImport((current: boolean) => !current)}>{showResourceImport ? "Hide import" : "Open import"}</SmallButton><SmallButton icon={Plus} tone="primary" onClick={openNewResourceForm}>Add resource</SmallButton></>}>
                <div className="grid gap-4 md:grid-cols-3">
                  <MetricCard label="Total resources" value={resourceStats.total} hint="All resource rows." icon={Layers3} tone="slate" />
                  <MetricCard label="Active" value={resourceStats.active} hint="Visible on public surfaces." icon={CheckCircle2} tone="green" />
                  <MetricCard label="Inactive" value={resourceStats.inactive} hint="Archived or hidden rows." icon={FileText} tone="blue" />
                </div>
              </SectionCard>

              <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
                <SectionCard title="Resource Inventory" description="Compact filters, clearer status signals, and a table optimized for management instead of browsing.">
                  <div className="space-y-5">
                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
                      <label className="xl:col-span-2"><span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.18em] text-[#667085]">Search</span><div className="relative"><Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#98a2b3]" /><input value={resourceSearch} onChange={event => setResourceSearch(event.target.value)} placeholder="Title, URL, description..." className={cn(adminInputClass, "pl-10")} /></div></label>
                      <label><span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.18em] text-[#667085]">Exam</span><select value={resourceExamFilter} onChange={event => setResourceExamFilter(event.target.value)} className={adminInputClass}>{resourceExams.map((exam: string) => <option key={exam} value={exam}>{exam}</option>)}</select></label>
                      <label><span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.18em] text-[#667085]">Type</span><select value={resourceTypeFilter} onChange={event => setResourceTypeFilter(event.target.value)} className={adminInputClass}><option value="All">All</option>{resourceTypes.map((type: string) => <option key={type} value={type}>{type}</option>)}</select></label>
                      <label><span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.18em] text-[#667085]">Category</span><select value={resourceCategoryFilter} onChange={event => setResourceCategoryFilter(event.target.value)} className={adminInputClass}>{availableResourceCategories.map((category: string) => <option key={category} value={category}>{category}</option>)}</select></label>
                    </div>

                    <div className="grid gap-3 md:grid-cols-4">
                      <label><span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.18em] text-[#667085]">Status</span><select value={resourceStatusFilter} onChange={event => setResourceStatusFilter(event.target.value)} className={adminInputClass}><option value="All">All</option><option value="Active">Active</option><option value="Inactive">Inactive</option></select></label>
                      <div className="rounded-xl border border-dashed border-[#d7dde5] bg-[#fbfcfd] px-4 py-3"><p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#667085]">Filtered</p><p className="mt-1 text-xl font-semibold tracking-[-0.03em] text-[#111827]">{filteredResources.length}</p></div>
                      <div className="rounded-xl border border-dashed border-[#d7dde5] bg-[#fbfcfd] px-4 py-3"><p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#667085]">Selected</p><p className="mt-1 text-xl font-semibold tracking-[-0.03em] text-[#111827]">{selectedResourceIds.length}</p></div>
                      <div className="flex items-end"><SmallButton icon={Download} onClick={exportFilteredResources} disabled={filteredResources.length === 0}>Export filtered</SmallButton></div>
                    </div>

                    <div className="flex flex-wrap gap-2 border-t border-[#e4e7ec] pt-4">
                      <SmallButton icon={CheckCircle2} onClick={toggleSelectVisibleResources}>{allVisibleResourcesSelected ? "Unselect visible" : "Select visible"}</SmallButton>
                      <SmallButton icon={ShieldCheck} onClick={() => void updateResourcesActiveState(selectedResourceIds, false)} disabled={selectedResourceIds.length === 0 || loadingTarget !== null}>Deactivate selected</SmallButton>
                      <SmallButton icon={ShieldCheck} onClick={() => void updateResourcesActiveState(selectedResourceIds, true)} disabled={selectedResourceIds.length === 0 || loadingTarget !== null}>Activate selected</SmallButton>
                      <SmallButton icon={Trash2} tone="danger" onClick={() => void deleteResources(selectedResourceIds)} disabled={selectedResourceIds.length === 0 || loadingTarget !== null}>Delete selected</SmallButton>
                    </div>

                    {filteredResources.length === 0 ? (
                      <EmptyState icon={FileText} title="No resources match the current filters" description="Widen the filters or import a new batch." />
                    ) : (
                      <div className="overflow-hidden rounded-[18px] border border-[#d7dde5]">
                        <div className="overflow-x-auto">
                          <table className="min-w-[1020px] text-left text-sm">
                            <thead className="bg-[#fbfcfd]">
                              <tr className="border-b border-[#e4e7ec] text-[11px] uppercase tracking-[0.18em] text-[#667085]">
                                <th className="px-4 py-3 font-semibold">Select</th><th className="px-4 py-3 font-semibold">Resource</th><th className="px-4 py-3 font-semibold">Type</th><th className="px-4 py-3 font-semibold">Exam</th><th className="px-4 py-3 font-semibold">Category</th><th className="px-4 py-3 font-semibold">Status</th><th className="px-4 py-3 font-semibold">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white">
                              {filteredResources.map((resource: any) => {
                                const resourceId = toId(resource.id);
                                const selected = selectedResourceIds.includes(resourceId);
                                const active = resource.is_active !== false;
                                return (
                                  <tr key={resourceId} className={cn("border-b border-[#edf1f5] last:border-b-0", selected && "bg-[#f4f7fc]")}>
                                    <td className="px-4 py-4 align-top"><input type="checkbox" checked={selected} onChange={() => toggleResourceSelection(resourceId)} className="mt-1 h-4 w-4 rounded accent-[#111827]" /></td>
                                    <td className="px-4 py-4 align-top"><p className="text-sm font-medium text-[#111827]">{resource.title}</p>{resource.description ? <p className="mt-2 line-clamp-2 max-w-md text-sm leading-6 text-[#667085]">{resource.description}</p> : null}<a href={resource.url} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-[#35527c] hover:underline"><LinkIcon size={14} />Open resource</a></td>
                                    <td className="px-4 py-4 align-top text-[#475467]">{resource.type || "Link"}</td>
                                    <td className="px-4 py-4 align-top text-[#475467]">{resource.exam || "All"}</td>
                                    <td className="px-4 py-4 align-top text-[#475467]">{resource.category || "General"}</td>
                                    <td className="px-4 py-4 align-top"><Pill tone={active ? "green" : "rose"}>{active ? "Active" : "Inactive"}</Pill></td>
                                    <td className="px-4 py-4 align-top"><div className="flex flex-wrap gap-2"><SmallButton icon={Edit2} onClick={() => startEditResource(resource)}>Edit</SmallButton><SmallButton icon={ShieldCheck} onClick={() => void updateResourcesActiveState([resourceId], !active)} disabled={loadingTarget !== null}>{active ? "Deactivate" : "Activate"}</SmallButton><SmallButton icon={Trash2} tone="danger" onClick={() => void deleteResources([resourceId])} disabled={loadingTarget !== null}>Delete</SmallButton></div></td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                </SectionCard>

                <div className="space-y-6">
                  {showResourceImport ? (
                    <SectionCard title="Bulk Import" description="Useful for loading libraries, playlists, PDFs, or notes in one pass." actions={<SmallButton icon={FileSpreadsheet} onClick={() => resourceFileInputRef.current?.click()}>Upload file</SmallButton>}>
                      <input ref={resourceFileInputRef} type="file" accept=".csv,.tsv,.txt,.json" className="hidden" onChange={handleResourceFileUpload} />
                      <textarea value={resourceImportInput} onChange={event => setResourceImportInput(event.target.value)} rows={12} placeholder="Paste resource data here..." className={cn(adminTextAreaClass, "font-mono text-[13px]")} />
                      <div className="mt-4 flex flex-wrap gap-2"><SmallButton tone="primary" icon={Upload} onClick={() => void importResources()} disabled={Boolean(resourceImportPreview.error) || resourceImportPreview.rows.length === 0 || loadingTarget !== null}>{loadingTarget === "import-resources" ? "Importing..." : "Import rows"}</SmallButton><SmallButton onClick={() => setResourceImportInput(bulkResourceTemplate)}>Fill template</SmallButton><SmallButton onClick={() => { setResourceImportInput(""); }}>Clear</SmallButton></div>
                    </SectionCard>
                  ) : null}

                  {showResourceForm ? (
                    <SectionCard title={editingResourceId ? "Edit Resource" : "Create Resource"} description="A quiet editor for precise changes without leaving the inventory table." actions={<SmallButton onClick={resetResourceForm} icon={X}>Close editor</SmallButton>}>
                      <div className="space-y-4">
                        <div className="grid gap-3 md:grid-cols-2"><input value={resourceForm.title} onChange={event => setResourceForm((current: any) => ({ ...current, title: event.target.value }))} placeholder="Title" className={adminInputClass} /><input value={resourceForm.url} onChange={event => setResourceForm((current: any) => ({ ...current, url: event.target.value }))} placeholder="URL" className={adminInputClass} /></div>
                        <textarea value={resourceForm.description} onChange={event => setResourceForm((current: any) => ({ ...current, description: event.target.value }))} rows={4} placeholder="Description" className={adminTextAreaClass} />
                        <div className="grid gap-3 md:grid-cols-3"><select value={resourceForm.type} onChange={event => setResourceForm((current: any) => ({ ...current, type: event.target.value }))} className={adminInputClass}>{resourceTypes.map((type: string) => <option key={type} value={type}>{type}</option>)}</select><select value={resourceForm.exam} onChange={event => setResourceForm((current: any) => ({ ...current, exam: event.target.value }))} className={adminInputClass}>{resourceExams.map((exam: string) => <option key={exam} value={exam}>{exam}</option>)}</select><select value={resourceForm.category} onChange={event => setResourceForm((current: any) => ({ ...current, category: event.target.value }))} className={adminInputClass}>{availableResourceCategories.filter((category: string) => category !== "All").map((category: string) => <option key={category} value={category}>{category}</option>)}</select></div>
                        <label className="flex items-center gap-3 rounded-xl border border-[#d7dde5] bg-[#fbfcfd] px-4 py-3"><input type="checkbox" checked={resourceForm.is_active} onChange={event => setResourceForm((current: any) => ({ ...current, is_active: event.target.checked }))} className="h-4 w-4 rounded accent-[#111827]" /><span className="text-sm font-medium text-[#344054]">Active row</span></label>
                        <div className="flex flex-wrap gap-2"><SmallButton tone="primary" icon={CheckCircle2} onClick={() => void saveResource()} disabled={loadingTarget !== null}>{loadingTarget === "save-resource" ? "Saving..." : editingResourceId ? "Update resource" : "Save resource"}</SmallButton><SmallButton onClick={resetResourceForm}>Cancel</SmallButton></div>
                      </div>
                    </SectionCard>
                  ) : null}
                </div>
              </div>
            </>
          ) : null}

          {activeTab === "updates" ? (
            <>
              <SectionCard title="Updates Desk" description="A publishing console for opportunity tracking, deadline visibility, and official link review." actions={<><SmallButton icon={Upload} onClick={() => setShowUpdateImport((current: boolean) => !current)}>{showUpdateImport ? "Hide import" : "Open import"}</SmallButton><SmallButton icon={Plus} tone="primary" onClick={openNewUpdateForm}>Add update</SmallButton></>}>
                <div className="grid gap-4 md:grid-cols-4">
                  <MetricCard label="Total" value={updateStats.total} hint="All rows in the desk." icon={Database} tone="slate" />
                  <MetricCard label="Open" value={updateStats.open} hint="Currently accepting forms." icon={Bell} tone="green" />
                  <MetricCard label="Closing soon" value={updateStats.closingSoon} hint="Deadlines inside seven days." icon={CalendarDays} tone="rose" />
                  <MetricCard label="Upcoming" value={updateStats.upcoming} hint="Good for early tracking." icon={Layers3} tone="blue" />
                </div>
              </SectionCard>

              <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
                <SectionCard title="Update Inventory" description="Structured to make status, timing, location, and official links easy to scan.">
                  <div className="space-y-5">
                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
                      <label className="xl:col-span-2"><span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.18em] text-[#667085]">Search</span><div className="relative"><Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#98a2b3]" /><input value={updateSearch} onChange={event => setUpdateSearch(event.target.value)} placeholder="Title, organization, state, tags..." className={cn(adminInputClass, "pl-10")} /></div></label>
                      <label><span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.18em] text-[#667085]">State</span><select value={updateStateFilter} onChange={event => setUpdateStateFilter(event.target.value)} className={adminInputClass}>{availableUpdateStates.map((state: string) => <option key={state} value={state}>{state}</option>)}</select></label>
                      <label><span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.18em] text-[#667085]">Exam type</span><select value={updateExamTypeFilter} onChange={event => setUpdateExamTypeFilter(event.target.value)} className={adminInputClass}><option value="All">All</option>{examTypes.map((type: string) => <option key={type} value={type}>{type}</option>)}</select></label>
                      <label><span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.18em] text-[#667085]">Eligibility</span><select value={updateQualificationFilter} onChange={event => setUpdateQualificationFilter(event.target.value)} className={adminInputClass}><option value="All">All</option>{qualificationTiers.map((qualification: string) => <option key={qualification} value={qualification}>{qualification}</option>)}</select></label>
                    </div>
                    <div className="grid gap-3 md:grid-cols-5">
                      <label><span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.18em] text-[#667085]">Row status</span><select value={updateStatusFilter} onChange={event => setUpdateStatusFilter(event.target.value)} className={adminInputClass}><option value="All">All</option><option value="Active">Active</option><option value="Inactive">Inactive</option></select></label>
                      <label><span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.18em] text-[#667085]">Timeline</span><select value={updateTimelineFilter} onChange={event => setUpdateTimelineFilter(event.target.value)} className={adminInputClass}>{updateTimelineFilters.map((status: string) => <option key={status} value={status}>{status}</option>)}</select></label>
                      <div className="rounded-xl border border-dashed border-[#d7dde5] bg-[#fbfcfd] px-4 py-3"><p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#667085]">Filtered</p><p className="mt-1 text-xl font-semibold tracking-[-0.03em] text-[#111827]">{filteredUpdates.length}</p></div>
                      <div className="rounded-xl border border-dashed border-[#d7dde5] bg-[#fbfcfd] px-4 py-3"><p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#667085]">Selected</p><p className="mt-1 text-xl font-semibold tracking-[-0.03em] text-[#111827]">{selectedUpdateIds.length}</p></div>
                      <div className="flex items-end"><SmallButton icon={Download} onClick={exportFilteredUpdates} disabled={filteredUpdates.length === 0}>Export filtered</SmallButton></div>
                    </div>

                    <div className="flex flex-wrap gap-2 border-t border-[#e4e7ec] pt-4">
                      <SmallButton icon={CheckCircle2} onClick={toggleSelectVisibleUpdates}>{allVisibleUpdatesSelected ? "Unselect visible" : "Select visible"}</SmallButton>
                      <SmallButton icon={ShieldCheck} onClick={() => void updateUpdatesActiveState(selectedUpdateIds, false)} disabled={selectedUpdateIds.length === 0 || loadingTarget !== null}>Deactivate selected</SmallButton>
                      <SmallButton icon={ShieldCheck} onClick={() => void updateUpdatesActiveState(selectedUpdateIds, true)} disabled={selectedUpdateIds.length === 0 || loadingTarget !== null}>Activate selected</SmallButton>
                      <SmallButton icon={Trash2} tone="danger" onClick={() => void deleteUpdates(selectedUpdateIds)} disabled={selectedUpdateIds.length === 0 || loadingTarget !== null}>Delete selected</SmallButton>
                    </div>

                    {filteredUpdates.length === 0 ? <EmptyState icon={Bell} title="No updates match the current filters" description="Widen the filters or import a fresh batch of notice rows." /> : (
                      <div className="overflow-hidden rounded-[18px] border border-[#d7dde5]">
                        <div className="overflow-x-auto">
                          <table className="min-w-[1180px] text-left text-sm">
                            <thead className="bg-[#fbfcfd]">
                              <tr className="border-b border-[#e4e7ec] text-[11px] uppercase tracking-[0.18em] text-[#667085]">
                                <th className="px-4 py-3 font-semibold">Select</th><th className="px-4 py-3 font-semibold">Update</th><th className="px-4 py-3 font-semibold">Location</th><th className="px-4 py-3 font-semibold">Timeline</th><th className="px-4 py-3 font-semibold">Links</th><th className="px-4 py-3 font-semibold">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white">
                              {filteredUpdates.map((update: any) => {
                                const updateId = toId(update.id);
                                const selected = selectedUpdateIds.includes(updateId);
                                const active = update.is_active !== false;
                                const timeline = adminUpdateTimeline(update);
                                return (
                                  <tr key={updateId} className={cn("border-b border-[#edf1f5] last:border-b-0", selected && "bg-[#f6f3fb]")}>
                                    <td className="px-4 py-4 align-top"><input type="checkbox" checked={selected} onChange={() => toggleUpdateSelection(updateId)} className="mt-1 h-4 w-4 rounded accent-[#111827]" /></td>
                                    <td className="px-4 py-4 align-top"><p className="text-sm font-medium text-[#111827]">{update.title}</p><p className="mt-1 text-sm text-[#667085]">{update.organization}</p><p className="mt-2 max-w-md text-sm leading-6 text-[#475467]">{update.summary}</p><div className="mt-3 flex flex-wrap gap-2"><Pill tone="blue">{update.exam_type}</Pill><Pill tone="orange">{update.qualification}</Pill><Pill tone={active ? "green" : "rose"}>{active ? "Active" : "Inactive"}</Pill></div></td>
                                    <td className="px-4 py-4 align-top"><div className="space-y-2 text-sm text-[#475467]"><p>{update.state}</p><p>{update.qualification}</p><p className="text-[#667085]">{update.exam_window}</p></div></td>
                                    <td className="px-4 py-4 align-top"><div className="space-y-2"><Pill tone={timeline === "Closing Soon" ? "rose" : timeline === "Open" ? "green" : "blue"}>{timeline}</Pill><p className="text-sm text-[#475467]">{formatDate(update.application_start)} to {formatDate(update.last_date)}</p></div></td>
                                    <td className="px-4 py-4 align-top"><div className="flex flex-col items-start gap-2"><a href={update.apply_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm font-medium text-[#35527c] hover:underline"><LinkIcon size={14} />Apply</a><a href={update.notice_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm font-medium text-[#35527c] hover:underline"><LinkIcon size={14} />Notice</a></div></td>
                                    <td className="px-4 py-4 align-top"><div className="flex flex-wrap gap-2"><SmallButton icon={Edit2} onClick={() => startEditUpdate(update)}>Edit</SmallButton><SmallButton icon={ShieldCheck} onClick={() => void updateUpdatesActiveState([updateId], !active)} disabled={loadingTarget !== null}>{active ? "Deactivate" : "Activate"}</SmallButton><SmallButton icon={Trash2} tone="danger" onClick={() => void deleteUpdates([updateId])} disabled={loadingTarget !== null}>Delete</SmallButton></div></td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                </SectionCard>

                <div className="space-y-6">
                  {showUpdateImport ? (
                    <SectionCard title="Bulk Import" description="Load opportunity windows from CSV, TSV, pasted Sheets rows, or JSON." actions={<SmallButton icon={FileSpreadsheet} onClick={() => updateFileInputRef.current?.click()}>Upload file</SmallButton>}>
                      <input ref={updateFileInputRef} type="file" accept=".csv,.tsv,.txt,.json" className="hidden" onChange={handleUpdateFileUpload} />
                      <textarea value={updateImportInput} onChange={event => setUpdateImportInput(event.target.value)} rows={12} placeholder="Paste update data here..." className={cn(adminTextAreaClass, "font-mono text-[13px]")} />
                      <div className="mt-4 flex flex-wrap gap-2"><SmallButton tone="primary" icon={Upload} onClick={() => void importUpdates()} disabled={Boolean(updateImportPreview.error) || updateImportPreview.rows.length === 0 || loadingTarget !== null}>{loadingTarget === "import-updates" ? "Importing..." : "Import rows"}</SmallButton><SmallButton onClick={() => setUpdateImportInput(bulkUpdateTemplate)}>Fill template</SmallButton><SmallButton onClick={() => setUpdateImportInput("")}>Clear</SmallButton></div>
                    </SectionCard>
                  ) : null}

                  {showUpdateForm ? (
                    <SectionCard title={editingUpdateId ? "Edit Update Entry" : "Create Update Entry"} description="This side editor maps directly to the public updates desk." actions={<SmallButton onClick={resetUpdateForm} icon={X}>Close editor</SmallButton>}>
                      <div className="space-y-4">
                        <div className="grid gap-3 md:grid-cols-2"><input value={updateForm.title} onChange={event => setUpdateForm((current: any) => ({ ...current, title: event.target.value }))} placeholder="Title" className={adminInputClass} /><input value={updateForm.organization} onChange={event => setUpdateForm((current: any) => ({ ...current, organization: event.target.value }))} placeholder="Organization" className={adminInputClass} /></div>
                        <div className="grid gap-3 md:grid-cols-3"><select value={updateForm.exam_type} onChange={event => setUpdateForm((current: any) => ({ ...current, exam_type: event.target.value }))} className={adminInputClass}>{examTypes.map((type: string) => <option key={type} value={type}>{type}</option>)}</select><input value={updateForm.state} onChange={event => setUpdateForm((current: any) => ({ ...current, state: event.target.value }))} placeholder="State" className={adminInputClass} /><select value={updateForm.qualification} onChange={event => setUpdateForm((current: any) => ({ ...current, qualification: event.target.value }))} className={adminInputClass}>{qualificationTiers.map((qualification: string) => <option key={qualification} value={qualification}>{qualification}</option>)}</select></div>
                        <textarea value={updateForm.eligibility} onChange={event => setUpdateForm((current: any) => ({ ...current, eligibility: event.target.value }))} rows={3} placeholder="Eligibility" className={adminTextAreaClass} />
                        <textarea value={updateForm.summary} onChange={event => setUpdateForm((current: any) => ({ ...current, summary: event.target.value }))} rows={4} placeholder="Summary" className={adminTextAreaClass} />
                        <div className="grid gap-3 md:grid-cols-2"><input type="date" value={updateForm.application_start} onChange={event => setUpdateForm((current: any) => ({ ...current, application_start: event.target.value }))} className={adminInputClass} /><input type="date" value={updateForm.last_date} onChange={event => setUpdateForm((current: any) => ({ ...current, last_date: event.target.value }))} className={adminInputClass} /></div>
                        <div className="grid gap-3 md:grid-cols-2"><input type="date" value={updateForm.updated_at} onChange={event => setUpdateForm((current: any) => ({ ...current, updated_at: event.target.value }))} className={adminInputClass} /><input value={updateForm.exam_window} onChange={event => setUpdateForm((current: any) => ({ ...current, exam_window: event.target.value }))} placeholder="Exam window" className={adminInputClass} /></div>
                        <div className="grid gap-3 md:grid-cols-2"><input value={updateForm.apply_url} onChange={event => setUpdateForm((current: any) => ({ ...current, apply_url: event.target.value }))} placeholder="Apply URL" className={adminInputClass} /><input value={updateForm.notice_url} onChange={event => setUpdateForm((current: any) => ({ ...current, notice_url: event.target.value }))} placeholder="Notice URL" className={adminInputClass} /></div>
                        <input value={updateForm.tags} onChange={event => setUpdateForm((current: any) => ({ ...current, tags: event.target.value }))} placeholder="graduate jobs, central govt, tier i" className={adminInputClass} />
                        <label className="flex items-center gap-3 rounded-xl border border-[#d7dde5] bg-[#fbfcfd] px-4 py-3"><input type="checkbox" checked={updateForm.is_active} onChange={event => setUpdateForm((current: any) => ({ ...current, is_active: event.target.checked }))} className="h-4 w-4 rounded accent-[#111827]" /><span className="text-sm font-medium text-[#344054]">Active row</span></label>
                        <div className="flex flex-wrap gap-2"><SmallButton tone="primary" icon={CheckCircle2} onClick={() => void saveUpdate()} disabled={loadingTarget !== null}>{loadingTarget === "save-update" ? "Saving..." : editingUpdateId ? "Update entry" : "Save entry"}</SmallButton><SmallButton onClick={resetUpdateForm}>Cancel</SmallButton></div>
                      </div>
                    </SectionCard>
                  ) : null}
                </div>
              </div>
            </>
          ) : null}

          {activeTab === "contests" ? (
            <>
              <SectionCard title="Contest Operations" description="A simpler contest console with clearer schedule, status, and outcome structure." actions={<SmallButton icon={Plus} tone="primary" onClick={() => setShowContestForm((current: boolean) => !current)}>{showContestForm ? "Close editor" : "Add contest"}</SmallButton>}>
                <div className="grid gap-4 md:grid-cols-3">
                  <MetricCard label="Upcoming" value={dbContests.filter((contest: any) => contest.status === "upcoming").length} hint="Visible contests users can prepare for." icon={Trophy} tone="orange" />
                  <MetricCard label="Past" value={dbContests.filter((contest: any) => contest.status === "past").length} hint="Completed contests with results." icon={Layers3} tone="blue" />
                  <MetricCard label="Total" value={dbContests.length} hint="All contest records in Supabase." icon={Database} tone="green" />
                </div>
              </SectionCard>

              <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
                <SectionCard title="Contest Inventory" description="Manage each contest as an operational record instead of a stack of promo-style cards.">
                  {dbContests.length === 0 ? (
                    <EmptyState icon={Trophy} title="No contests yet" description="Add the first contest row to populate the public page." />
                  ) : (
                    <div className="overflow-hidden rounded-[18px] border border-[#d7dde5]">
                      <div className="overflow-x-auto">
                        <table className="min-w-[920px] text-left text-sm">
                          <thead className="bg-[#fbfcfd]">
                            <tr className="border-b border-[#e4e7ec] text-[11px] uppercase tracking-[0.18em] text-[#667085]">
                              <th className="px-4 py-3 font-semibold">Contest</th><th className="px-4 py-3 font-semibold">Date</th><th className="px-4 py-3 font-semibold">Duration</th><th className="px-4 py-3 font-semibold">Prize</th><th className="px-4 py-3 font-semibold">Status</th><th className="px-4 py-3 font-semibold">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white">
                            {dbContests.map((contest: any) => (
                              <tr key={toId(contest.id)} className="border-b border-[#edf1f5] last:border-b-0">
                                <td className="px-4 py-4 align-top"><p className="text-sm font-medium text-[#111827]">{contest.name}</p><p className="mt-2 text-sm leading-6 text-[#667085]">{contest.topics}</p>{contest.winner ? <p className="mt-2 text-sm text-[#475467]">Winner: {contest.winner}</p> : null}</td>
                                <td className="px-4 py-4 align-top text-[#475467]">{contest.date}</td>
                                <td className="px-4 py-4 align-top text-[#475467]">{contest.duration}</td>
                                <td className="px-4 py-4 align-top text-[#475467]">{contest.prize}</td>
                                <td className="px-4 py-4 align-top"><Pill tone={contest.status === "upcoming" ? "orange" : "blue"}>{contest.status}</Pill></td>
                                <td className="px-4 py-4 align-top"><div className="flex flex-wrap gap-2"><SmallButton icon={Edit2} onClick={() => startEditContest(contest)}>Edit</SmallButton><SmallButton icon={Trash2} tone="danger" onClick={() => void deleteContest(toId(contest.id))}>Delete</SmallButton></div></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </SectionCard>

                {showContestForm ? (
                  <SectionCard title={editingContestId ? "Edit Contest" : "Create Contest"} description="A focused form for maintaining dates, prizes, and outcome data." actions={<SmallButton onClick={resetContestForm} icon={X}>Close editor</SmallButton>}>
                    <div className="space-y-4">
                      <div className="grid gap-3 md:grid-cols-2">
                        <input value={contestForm.name} onChange={event => setContestForm((current: any) => ({ ...current, name: event.target.value }))} placeholder="Contest name" className={adminInputClass} />
                        <input value={contestForm.date} onChange={event => setContestForm((current: any) => ({ ...current, date: event.target.value }))} placeholder="March 28, 2026" className={adminInputClass} />
                        <input value={contestForm.duration} onChange={event => setContestForm((current: any) => ({ ...current, duration: event.target.value }))} placeholder="60 minutes" className={adminInputClass} />
                        <select value={contestForm.status} onChange={event => setContestForm((current: any) => ({ ...current, status: event.target.value }))} className={adminInputClass}>{contestStatuses.map((status: string) => <option key={status} value={status}>{status}</option>)}</select>
                        <input value={contestForm.topics} onChange={event => setContestForm((current: any) => ({ ...current, topics: event.target.value }))} placeholder="GS1 + CSAT" className={adminInputClass} />
                        <input value={contestForm.prize} onChange={event => setContestForm((current: any) => ({ ...current, prize: event.target.value }))} placeholder="Prize" className={adminInputClass} />
                        <input value={contestForm.winner} onChange={event => setContestForm((current: any) => ({ ...current, winner: event.target.value }))} placeholder="Winner (optional)" className={adminInputClass} />
                        <input value={contestForm.your_rank} onChange={event => setContestForm((current: any) => ({ ...current, your_rank: event.target.value }))} placeholder="Your rank (optional)" className={adminInputClass} />
                      </div>
                      <div className="flex flex-wrap gap-2"><SmallButton tone="primary" icon={CheckCircle2} onClick={() => void saveContest()} disabled={loadingTarget !== null}>{loadingTarget === "save-contest" ? "Saving..." : editingContestId ? "Update contest" : "Save contest"}</SmallButton><SmallButton onClick={resetContestForm}>Cancel</SmallButton></div>
                    </div>
                  </SectionCard>
                ) : null}
              </div>
            </>
          ) : null}

          {activeTab === "support" ? (
            <>
              <SectionCard title="Support Operations" description="Inbox-style triage with the queue separated from the active conversation and reply history.">
                <div className="grid gap-4 md:grid-cols-4">
                  <MetricCard label="All tickets" value={supportStats.total} hint="Total requests in the inbox." icon={AlertCircle} tone="slate" />
                  <MetricCard label="Open" value={supportStats.open} hint="Needs first response or action." icon={Bell} tone="orange" />
                  <MetricCard label="In progress" value={supportStats.inProgress} hint="Actively being handled." icon={Send} tone="blue" />
                  <MetricCard label="Resolved" value={supportStats.resolved} hint="Closed support items." icon={CheckCircle2} tone="green" />
                </div>
              </SectionCard>

              <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
                <SectionCard title="Queue" description="Search and choose a conversation to open in the detail pane.">
                  <label className="block">
                    <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.18em] text-[#667085]">Search</span>
                    <div className="relative">
                      <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#98a2b3]" />
                      <input value={supportSearch} onChange={event => setSupportSearch(event.target.value)} placeholder="Email, category, subject, or message..." className={cn(adminInputClass, "pl-10")} />
                    </div>
                  </label>

                  {filteredSupportRequests.length === 0 ? (
                    <div className="mt-5"><EmptyState icon={AlertCircle} title="No support requests found" description="New messages from the support form will show up here." /></div>
                  ) : (
                    <div className="mt-5 space-y-2">
                      {filteredSupportRequests.map((request: any) => {
                        const requestId = toId(request.id);
                        const active = selectedSupportRequest ? toId(selectedSupportRequest.id) === requestId : false;
                        return (
                          <button key={requestId} type="button" onClick={() => setSelectedSupportId(requestId)} className={cn("w-full rounded-[18px] border px-4 py-3 text-left transition", active ? "border-[#111827] bg-[#111827] text-white shadow-[0_16px_28px_rgba(15,23,42,0.18)]" : "border-[#d7dde5] bg-white hover:bg-[#fbfcfd]")}>
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0"><p className={cn("truncate text-sm font-semibold", active ? "text-white" : "text-[#111827]")}>{request.subject || "No subject"}</p><p className={cn("mt-1 truncate text-xs", active ? "text-white/70" : "text-[#667085]")}>{request.email}</p></div>
                              <Pill tone={supportStatusTone(request.status)}>{request.status || "open"}</Pill>
                            </div>
                            <p className={cn("mt-3 line-clamp-2 text-sm leading-6", active ? "text-white/75" : "text-[#475467]")}>{request.message || "No message provided."}</p>
                            <div className="mt-3 flex items-center justify-between gap-3 text-xs"><span className={active ? "text-white/65" : "text-[#667085]"}>{request.category || "General support"}</span><span className={active ? "text-white/65" : "text-[#98a2b3]"}>{formatDate(request.created_at)}</span></div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </SectionCard>

                <SectionCard title={selectedSupportRequest?.subject || "Support detail"} description={selectedSupportRequest ? "Message detail, ticket controls, and reply history." : "Choose a conversation from the queue to open it here."} actions={selectedSupportRequest ? <><SmallButton icon={Send} tone="primary" onClick={() => openReplyDialog(selectedSupportRequest)}>Reply here</SmallButton><a href={buildSupportReplyLink(selectedSupportRequest)} className="inline-flex items-center gap-2 rounded-xl border border-[#d7dde5] bg-white px-3.5 py-2.5 text-sm font-medium text-[#334155] transition hover:bg-[#f8fafc]">Open email app</a></> : null}>
                  {selectedSupportRequest ? (
                    <div className="space-y-6">
                      <div className="flex flex-wrap gap-2">
                        <Pill tone="orange">{selectedSupportRequest.category || "General support"}</Pill>
                        <Pill tone="slate">{selectedSupportRequest.email}</Pill>
                        <Pill tone="blue">{selectedSupportRequest.source || "support_page_direct"}</Pill>
                        <Pill tone={supportStatusTone(selectedSupportRequest.status)}>{selectedSupportRequest.status || "open"}</Pill>
                        <Pill tone="slate">{supportRepliesByRequestId[toId(selectedSupportRequest.id)]?.length || 0} replies</Pill>
                      </div>

                      <div className="rounded-[18px] border border-[#d7dde5] bg-[#fbfcfd] p-5">
                        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                          <div><p className="text-sm font-semibold text-[#111827]">{selectedSupportRequest.subject || "No subject"}</p><p className="mt-1 text-sm text-[#667085]">Received {formatDate(selectedSupportRequest.created_at)}</p></div>
                          <div className="flex flex-wrap gap-2"><SmallButton onClick={() => void updateSupportStatus(toId(selectedSupportRequest.id), "open")} disabled={selectedSupportRequest.status === "open"}>Open</SmallButton><SmallButton onClick={() => void updateSupportStatus(toId(selectedSupportRequest.id), "in_progress")} disabled={selectedSupportRequest.status === "in_progress"}>In progress</SmallButton><SmallButton onClick={() => void updateSupportStatus(toId(selectedSupportRequest.id), "resolved")} disabled={selectedSupportRequest.status === "resolved"}>Resolved</SmallButton></div>
                        </div>
                        <div className="mt-5 whitespace-pre-wrap text-sm leading-7 text-[#475467]">{selectedSupportRequest.message || "No message provided."}</div>
                      </div>

                      <div className="rounded-[18px] border border-[#d7dde5] bg-white">
                        <div className="border-b border-[#e4e7ec] px-5 py-4"><p className="text-sm font-semibold text-[#111827]">Reply history</p></div>
                        <div className="space-y-4 px-5 py-5">
                          {supportRepliesByRequestId[toId(selectedSupportRequest.id)]?.length ? supportRepliesByRequestId[toId(selectedSupportRequest.id)].map((reply: any) => <div key={toId(reply.id)} className="rounded-[18px] border border-[#e4e7ec] bg-[#fbfcfd] p-4"><div className="flex flex-wrap items-center gap-2"><Pill tone="blue">Sent</Pill><Pill tone="slate">{reply.to_email}</Pill>{reply.sent_by_email ? <Pill tone="slate">{reply.sent_by_email}</Pill> : null}</div><p className="mt-3 text-sm font-semibold text-[#111827]">{reply.subject}</p><p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-[#475467]">{reply.message}</p><p className="mt-3 text-xs text-[#667085]">{formatDate(reply.sent_at || reply.created_at)}</p></div>) : <EmptyState icon={Send} title="No replies yet" description="Send the first reply from the detail pane to start a clean history here." />}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <EmptyState icon={AlertCircle} title="No conversation selected" description="Choose a ticket from the queue to open the message and reply history." />
                  )}
                </SectionCard>
              </div>
            </>
          ) : null}
        </main>
      </div>
    </div>
  );
}
