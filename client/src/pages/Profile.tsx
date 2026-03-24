import { useEffect, useMemo, useState, type ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  AtSign,
  BadgeCheck,
  BellRing,
  Bookmark,
  Flame,
  Github,
  Globe2,
  GraduationCap,
  Linkedin,
  Loader2,
  LogOut,
  MapPin,
  NotebookPen,
  ShieldCheck,
  SquareArrowOutUpRight,
  Target,
  TrendingUp,
  UserCircle2,
} from "lucide-react";
import { Link } from "wouter";

import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { useQuestionBank } from "@/hooks/useQuestionBank";
import { createQuestionIdentityIndex, type QuestionId } from "@/lib/questionIdentity";
import { supabase } from "@/lib/supabase";
import { getAnswerAttempts, getBookmarks } from "@/lib/userProgress";

const EXAM_OPTIONS = [
  "UPSC CSE 2026",
  "UPSC CSE 2027",
  "TSPSC Group 1 2025",
  "TSPSC Group 2 2025",
  "APPSC Group 1 2025",
  "SSC CGL 2025",
  "SSC CHSL 2025",
  "RRB NTPC 2025",
  "IBPS PO 2025",
];

const settingsCardClassName =
  "overflow-hidden rounded-[28px] border border-[rgba(255,255,255,0.08)] bg-[linear-gradient(180deg,rgba(23,23,31,0.96)_0%,rgba(16,16,23,0.98)_100%)] shadow-[0_26px_72px_-48px_rgba(0,0,0,0.95)]";

const sidebarCardClassName =
  "rounded-[28px] border border-[rgba(255,255,255,0.08)] bg-[rgba(19,19,27,0.92)] shadow-[0_24px_64px_-48px_rgba(0,0,0,0.92)]";

type AnswerRow = {
  question_id: QuestionId;
  is_correct: boolean;
  answered_at: string;
};

type ProfileRow = {
  full_name?: string;
  username?: string;
  streak?: number;
  max_streak?: number;
  accuracy?: number;
  total_solved?: number;
  target_exam?: string;
  avatar_url?: string;
  state?: string;
  last_active?: string;
};

type EditableSettings = {
  fullName: string;
  username: string;
  targetExam: string;
  avatarUrl: string;
  location: string;
  state: string;
  website: string;
  github: string;
  linkedin: string;
  xHandle: string;
  bio: string;
  readme: string;
  dailyGoal: string;
  publicProfile: boolean;
  emailReminders: boolean;
  weeklyDigest: boolean;
};

type SaveNotice = {
  section: "general" | "links" | "preferences";
  tone: "success" | "error";
  message: string;
};

const defaultSettings: EditableSettings = {
  fullName: "",
  username: "",
  targetExam: "UPSC CSE 2026",
  avatarUrl: "",
  location: "",
  state: "",
  website: "",
  github: "",
  linkedin: "",
  xHandle: "",
  bio: "",
  readme: "",
  dailyGoal: "12",
  publicProfile: true,
  emailReminders: true,
  weeklyDigest: true,
};

const compactNumber = new Intl.NumberFormat("en-IN", { notation: "compact", maximumFractionDigits: 1 });

const clampGoal = (value: string) => {
  const digitsOnly = value.replace(/[^\d]/g, "");
  if (!digitsOnly) return "1";
  return String(Math.max(1, Math.min(200, Number.parseInt(digitsOnly, 10) || 1)));
};

const sanitizeSettings = (settings: EditableSettings): EditableSettings => ({
  ...settings,
  fullName: settings.fullName.trim(),
  username:
    settings.username
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9_-]/g, "") || "prepbros-user",
  targetExam: settings.targetExam || "UPSC CSE 2026",
  avatarUrl: settings.avatarUrl.trim(),
  location: settings.location.trim(),
  state: settings.state.trim(),
  website: settings.website.trim(),
  github: settings.github.trim(),
  linkedin: settings.linkedin.trim(),
  xHandle: settings.xHandle.trim(),
  bio: settings.bio.trim(),
  readme: settings.readme.trim(),
  dailyGoal: clampGoal(settings.dailyGoal),
});

const buildSettings = (profile: ProfileRow | null, user: ReturnType<typeof useAuth>["user"]): EditableSettings => {
  const metadata = user?.user_metadata || {};
  return sanitizeSettings({
    fullName:
      String(profile?.full_name || metadata.full_name || user?.email?.split("@")[0] || "Aspirant"),
    username:
      String(profile?.username || metadata.username || user?.email?.split("@")[0] || "prepbros-user"),
    targetExam: String(profile?.target_exam || metadata.target_exam || "UPSC CSE 2026"),
    avatarUrl: String(
      profile?.avatar_url || metadata.avatar_url || metadata.picture || metadata.avatar || "",
    ),
    location: String(metadata.location || ""),
    state: String(profile?.state || metadata.state || ""),
    website: String(metadata.website || ""),
    github: String(metadata.github || ""),
    linkedin: String(metadata.linkedin || ""),
    xHandle: String(metadata.x_handle || metadata.twitter || ""),
    bio: String(metadata.bio || ""),
    readme: String(metadata.readme || ""),
    dailyGoal: String(metadata.daily_goal || "12"),
    publicProfile:
      typeof metadata.public_profile === "boolean" ? metadata.public_profile : true,
    emailReminders:
      typeof metadata.email_reminders === "boolean" ? metadata.email_reminders : true,
    weeklyDigest:
      typeof metadata.weekly_digest === "boolean" ? metadata.weekly_digest : true,
  });
};

const formatActivityStamp = (value: string) =>
  new Date(value).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });

const formatJoinedDate = (value?: string) => {
  if (!value) return "Recently joined";
  return new Date(value).toLocaleDateString("en-IN", { month: "short", year: "numeric" });
};

const toDisplayProvider = (value?: string) => {
  if (!value) return "Email";
  return value
    .split("_")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
};

const toExternalHref = (type: "website" | "github" | "linkedin" | "x", value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;
  if (type === "website") return `https://${trimmed}`;
  if (type === "github") return `https://github.com/${trimmed.replace(/^@/, "").replace(/^github\.com\//, "")}`;
  if (type === "linkedin") {
    return `https://www.linkedin.com/${trimmed.replace(/^https?:\/\/(www\.)?linkedin\.com\//, "")}`;
  }
  return `https://x.com/${trimmed.replace(/^@/, "").replace(/^https?:\/\/(www\.)?x\.com\//, "")}`;
};

function StatTile({
  icon: Icon,
  label,
  value,
  meta,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  meta: string;
}) {
  return (
    <div className="rounded-[24px] border border-[rgba(255,255,255,0.08)] bg-[rgba(14,14,20,0.9)] p-4">
      <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[rgba(255,161,22,0.12)] text-[var(--brand)]">
        <Icon size={18} />
      </div>
      <p className="mt-4 text-[1.7rem] font-semibold tracking-[-0.05em] text-[var(--text-primary)]">{value}</p>
      <p className="mt-1 text-sm font-medium text-[var(--text-primary)]">{label}</p>
      <p className="mt-1 text-xs text-[var(--text-muted)]">{meta}</p>
    </div>
  );
}

function SettingsRow({
  icon: Icon,
  label,
  description,
  children,
  noBorder,
}: {
  icon: LucideIcon;
  label: string;
  description: string;
  children: ReactNode;
  noBorder?: boolean;
}) {
  return (
    <div
      className={[
        "grid gap-4 px-5 py-5 md:grid-cols-[220px_minmax(0,1fr)] md:gap-6 md:px-6",
        noBorder ? "" : "border-t border-[rgba(255,255,255,0.06)]",
      ].join(" ")}
    >
      <div className="flex gap-3">
        <div className="mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[rgba(255,255,255,0.04)] text-[var(--text-secondary)]">
          <Icon size={18} />
        </div>
        <div>
          <p className="text-base font-semibold text-[var(--text-primary)]">{label}</p>
          <p className="mt-1 text-sm text-[var(--text-muted)]">{description}</p>
        </div>
      </div>
      <div>{children}</div>
    </div>
  );
}

export default function Profile() {
  const { user, loading, signOut } = useAuth();
  const [pageLoading, setPageLoading] = useState(true);
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [answers, setAnswers] = useState<AnswerRow[]>([]);
  const [bookmarkIds, setBookmarkIds] = useState<QuestionId[]>([]);
  const [settings, setSettings] = useState<EditableSettings>(defaultSettings);
  const [savingSection, setSavingSection] = useState<SaveNotice["section"] | null>(null);
  const [saveNotice, setSaveNotice] = useState<SaveNotice | null>(null);
  const { questions, syncing: questionsSyncing } = useQuestionBank();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      setPageLoading(false);
      return;
    }

    const load = async () => {
      setPageLoading(true);
      const [{ data: profileData }, answerData, bookmarkData] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).single(),
        getAnswerAttempts(user.id),
        getBookmarks(user.id),
      ]);

      const nextProfile = (profileData || null) as ProfileRow | null;
      setProfile(nextProfile);
      setSettings(buildSettings(nextProfile, user));
      setAnswers(
        (answerData || []).map((item) => ({
          ...item,
          answered_at: item.answered_at ?? new Date(0).toISOString(),
        })),
      );
      setBookmarkIds(bookmarkData || []);
      setPageLoading(false);
    };

    load();
  }, [loading, user]);

  const questionIdentity = useMemo(() => createQuestionIdentityIndex(questions), [questions]);

  const resolvedAnswers = useMemo(
    () =>
      answers
        .map((item) => {
          const questionId = questionIdentity.resolveQuestionId(item.question_id);
          if (!questionId) return null;
          return { ...item, question_id: questionId };
        })
        .filter((item): item is AnswerRow => Boolean(item)),
    [answers, questionIdentity],
  );

  const resolvedBookmarkIds = useMemo(
    () =>
      Array.from(
        new Set(
          bookmarkIds
            .map((questionId) => questionIdentity.resolveQuestionId(questionId))
            .filter((questionId): questionId is QuestionId => Boolean(questionId)),
        ),
      ),
    [bookmarkIds, questionIdentity],
  );

  const solvedIds = useMemo(
    () => Array.from(new Set(resolvedAnswers.map((item) => item.question_id))),
    [resolvedAnswers],
  );

  const totalAttempts = resolvedAnswers.length;
  const totalSolved = solvedIds.length;
  const correctAttempts = resolvedAnswers.filter((item) => item.is_correct).length;
  const accuracy =
    totalAttempts > 0
      ? Math.round((correctAttempts / totalAttempts) * 100)
      : profile?.accuracy ?? 0;
  const streak = profile?.streak ?? 0;
  const maxStreak = profile?.max_streak ?? 0;
  const bookmarkCount = resolvedBookmarkIds.length;

  const topicPerformance = useMemo(
    () =>
      Object.values(
        resolvedAnswers.reduce<Record<string, { topic: string; correct: number; total: number }>>(
          (acc, item) => {
            const question = questionIdentity.getQuestion(item.question_id);
            if (!question) return acc;
            const current = acc[question.topic] || { topic: question.topic, correct: 0, total: 0 };
            current.total += 1;
            if (item.is_correct) current.correct += 1;
            acc[question.topic] = current;
            return acc;
          },
          {},
        ),
      )
        .map((item) => ({
          ...item,
          accuracy: Math.round((item.correct / item.total) * 100),
        }))
        .sort((a, b) => b.accuracy - a.accuracy),
    [questionIdentity, resolvedAnswers],
  );

  const bestTopics = topicPerformance.slice(0, 3);
  const needsWork = topicPerformance.slice(-3).reverse();

  const recentActivity = useMemo(
    () =>
      resolvedAnswers.slice(0, 4).map((item) => {
        const question = questionIdentity.getQuestion(item.question_id);
        return {
          id: item.question_id,
          topic: question?.topic || "Practice session",
          exam: question?.exam || settings.targetExam,
          isCorrect: item.is_correct,
          answeredAt: item.answered_at,
        };
      }),
    [questionIdentity, resolvedAnswers, settings.targetExam],
  );

  const completionItems = [
    settings.avatarUrl,
    settings.fullName,
    settings.username,
    settings.location,
    settings.state,
    settings.targetExam,
    settings.bio,
    settings.website || settings.github || settings.linkedin || settings.xHandle,
    settings.readme,
  ];
  const completionPercent = Math.round(
    (completionItems.filter((value) => value.trim().length > 0).length / completionItems.length) * 100,
  );

  const dailyGoal = Number.parseInt(settings.dailyGoal, 10) || 12;
  const todayKey = new Date().toLocaleDateString("en-CA");
  const todayAttempts = resolvedAnswers.filter(
    (item) => new Date(item.answered_at).toLocaleDateString("en-CA") === todayKey,
  ).length;
  const dailyProgress = Math.max(0, Math.min(100, Math.round((todayAttempts / dailyGoal) * 100)));

  const socialPreview = [
    { label: "Website", href: toExternalHref("website", settings.website), value: settings.website },
    { label: "GitHub", href: toExternalHref("github", settings.github), value: settings.github },
    { label: "LinkedIn", href: toExternalHref("linkedin", settings.linkedin), value: settings.linkedin },
    { label: "X", href: toExternalHref("x", settings.xHandle), value: settings.xHandle },
  ].filter((item) => item.value.trim().length > 0);

  const saveSettings = async (section: SaveNotice["section"]) => {
    if (!user) return;

    const nextSettings = sanitizeSettings(settings);
    const metadata = user.user_metadata || {};
    const metadataPayload = {
      ...metadata,
      full_name: nextSettings.fullName,
      username: nextSettings.username,
      target_exam: nextSettings.targetExam,
      avatar_url: nextSettings.avatarUrl,
      location: nextSettings.location,
      state: nextSettings.state,
      website: nextSettings.website,
      github: nextSettings.github,
      linkedin: nextSettings.linkedin,
      x_handle: nextSettings.xHandle,
      bio: nextSettings.bio,
      readme: nextSettings.readme,
      daily_goal: Number.parseInt(nextSettings.dailyGoal, 10) || 12,
      public_profile: nextSettings.publicProfile,
      email_reminders: nextSettings.emailReminders,
      weekly_digest: nextSettings.weeklyDigest,
    };

    setSettings(nextSettings);
    setSavingSection(section);
    setSaveNotice(null);

    const { error: authError } = await supabase.auth.updateUser({ data: metadataPayload });
    if (authError) {
      setSaveNotice({
        section,
        tone: "error",
        message: "We couldn't save those changes right now. Please try again.",
      });
      setSavingSection(null);
      return;
    }

    const profilePayload = {
      full_name: nextSettings.fullName,
      username: nextSettings.username,
      target_exam: nextSettings.targetExam,
      avatar_url: nextSettings.avatarUrl,
      state: nextSettings.state,
    };

    const { error: profileError } = await supabase
      .from("profiles")
      .update(profilePayload)
      .eq("id", user.id);

    if (!profileError) {
      setProfile((current) => ({ ...(current || {}), ...profilePayload }));
    } else {
      console.error("Profile table sync failed:", profileError);
    }

    setSaveNotice({
      section,
      tone: "success",
      message:
        section === "general"
          ? "General profile details saved."
          : section === "links"
            ? "Profile links updated."
            : "Account preferences saved.",
    });
    setSavingSection(null);
  };

  if (loading || pageLoading || questionsSyncing) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container-shell flex min-h-[62vh] items-center justify-center">
          <div className="inline-flex items-center gap-3 rounded-full border border-[var(--border)] bg-[var(--bg-card)] px-5 py-3 text-sm text-[var(--text-secondary)]">
            <Loader2 size={16} className="animate-spin text-[var(--brand)]" />
            Loading account settings...
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container-shell py-14">
          <div className="rounded-[32px] border border-[var(--border)] bg-[linear-gradient(180deg,rgba(20,20,28,0.96)_0%,rgba(12,12,18,0.98)_100%)] p-8 text-center md:p-12">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--brand)]">
              Profile settings
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-[-0.06em] text-[var(--text-primary)]">
              Sign in to manage your PrepBros profile.
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-sm text-[var(--text-secondary)] md:text-base">
              Your account area now combines profile details, study preferences, and performance
              signals in one focused space.
            </p>
            <Link href="/">
              <span className="btn-primary mt-8 inline-flex cursor-pointer rounded-full px-6 py-3">
                Back to home
              </span>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="px-4 py-8 md:py-10">
        <div className="container-shell">
          <div className="mb-6 rounded-[30px] border border-[rgba(255,255,255,0.08)] bg-[linear-gradient(135deg,rgba(255,161,22,0.14)_0%,rgba(255,161,22,0.03)_28%,rgba(15,15,22,0.96)_100%)] p-6 shadow-[0_28px_90px_-56px_rgba(0,0,0,0.95)] md:p-8">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--brand)]">
                  Account settings
                </p>
                <h1 className="mt-3 text-[2.2rem] font-semibold tracking-[-0.06em] text-[var(--text-primary)] md:text-[3rem]">
                  A sharper profile page with real study settings.
                </h1>
                <p className="mt-3 max-w-2xl text-sm text-[var(--text-secondary)] md:text-base">
                  Inspired by the clarity of LeetCode’s settings flow, but tuned for exam prep:
                  keep your identity, targets, links, and study preferences in one cleaner workspace.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link href="/practice">
                  <span className="btn-primary cursor-pointer rounded-full px-5 py-3">
                    Continue practice
                    <ArrowRight size={16} />
                  </span>
                </Link>
                <button
                  type="button"
                  onClick={() => signOut()}
                  className="btn-secondary rounded-full px-5 py-3"
                >
                  <LogOut size={16} />
                  Sign out
                </button>
              </div>
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
            <aside className="space-y-6">
              <div className={`${sidebarCardClassName} p-5`}>
                <div className="flex items-start gap-4">
                  <Avatar className="h-20 w-20 rounded-[24px] border border-[rgba(255,255,255,0.1)]">
                    <AvatarImage src={settings.avatarUrl} alt={settings.fullName} className="object-cover" />
                    <AvatarFallback className="rounded-[24px] bg-[rgba(255,161,22,0.14)] text-[var(--brand)]">
                      <UserCircle2 size={34} />
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[1.4rem] font-semibold tracking-[-0.05em] text-[var(--text-primary)]">
                      {settings.fullName}
                    </p>
                    <p className="mt-1 truncate text-sm text-[var(--text-muted)]">@{settings.username}</p>
                    <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-[rgba(255,161,22,0.2)] bg-[rgba(255,161,22,0.09)] px-3 py-1 text-xs font-semibold text-[var(--brand-light)]">
                      <GraduationCap size={13} />
                      {settings.targetExam}
                    </div>
                  </div>
                </div>

                <div className="mt-5 rounded-[24px] border border-[rgba(255,255,255,0.08)] bg-[rgba(13,13,18,0.9)] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-[var(--text-primary)]">Profile completion</p>
                      <p className="text-xs text-[var(--text-muted)]">
                        A complete profile feels more credible and easier to return to.
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-[var(--brand-light)]">{completionPercent}%</span>
                  </div>
                  <Progress value={completionPercent} className="mt-4 h-2 bg-white/6 [&_[data-slot=progress-indicator]]:bg-[var(--brand)]" />
                </div>

                <div className="mt-5 grid gap-3">
                  <div className="rounded-[22px] border border-[rgba(255,255,255,0.08)] bg-[rgba(13,13,18,0.9)] p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">Email</p>
                    <p className="mt-2 truncate text-sm font-medium text-[var(--text-primary)]">{user.email}</p>
                  </div>
                  <div className="rounded-[22px] border border-[rgba(255,255,255,0.08)] bg-[rgba(13,13,18,0.9)] p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">Account</p>
                    <p className="mt-2 text-sm font-medium text-[var(--text-primary)]">
                      Joined {formatJoinedDate(user.created_at)}
                    </p>
                    <p className="mt-1 text-xs text-[var(--text-muted)]">
                      Sign-in via {toDisplayProvider(String(user.app_metadata?.provider || "email"))}
                    </p>
                  </div>
                </div>

                <Separator className="my-5 bg-white/6" />

                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                  <Link href="/dashboard">
                    <span className="flex cursor-pointer items-center justify-between rounded-[18px] border border-[rgba(255,255,255,0.08)] bg-[rgba(13,13,18,0.9)] px-4 py-3 text-sm font-medium text-[var(--text-primary)] transition hover:border-[rgba(255,255,255,0.14)]">
                      Dashboard
                      <ArrowRight size={15} className="text-[var(--text-muted)]" />
                    </span>
                  </Link>
                  <Link href="/practice?bookmarked=1">
                    <span className="flex cursor-pointer items-center justify-between rounded-[18px] border border-[rgba(255,255,255,0.08)] bg-[rgba(13,13,18,0.9)] px-4 py-3 text-sm font-medium text-[var(--text-primary)] transition hover:border-[rgba(255,255,255,0.14)]">
                      Review bookmarks
                      <ArrowRight size={15} className="text-[var(--text-muted)]" />
                    </span>
                  </Link>
                </div>
              </div>

              <div className={`${sidebarCardClassName} p-5`}>
                <div className="grid gap-3">
                  <StatTile
                    icon={Target}
                    label="Solved"
                    value={compactNumber.format(totalSolved)}
                    meta={`${totalAttempts} total attempts tracked`}
                  />
                  <StatTile
                    icon={TrendingUp}
                    label="Accuracy"
                    value={`${accuracy}%`}
                    meta={accuracy >= 60 ? "Solid accuracy band" : "Room to tighten your review loop"}
                  />
                  <StatTile
                    icon={Bookmark}
                    label="Bookmarks"
                    value={String(bookmarkCount)}
                    meta="Saved for revision and focused review"
                  />
                  <StatTile
                    icon={Flame}
                    label="Streak"
                    value={`${streak}d`}
                    meta={`Best streak so far: ${maxStreak} days`}
                  />
                </div>
              </div>
            </aside>

            <div className="space-y-6">
              <div className="grid gap-6 2xl:grid-cols-[minmax(0,1fr)_320px]">
                <div className="space-y-6">
                  <section className={settingsCardClassName}>
                    <div className="px-5 py-5 md:px-6">
                      <p className="text-lg font-semibold text-[var(--text-primary)]">General</p>
                      <p className="mt-1 text-sm text-[var(--text-muted)]">
                        Manage the parts of your profile people notice first.
                      </p>
                    </div>

                    <SettingsRow
                      icon={UserCircle2}
                      label="Display name"
                      description="Shown across your profile, dashboard, and other signed-in surfaces."
                      noBorder
                    >
                      <Input
                        value={settings.fullName}
                        onChange={(event) =>
                          setSettings((current) => ({ ...current, fullName: event.target.value }))
                        }
                        placeholder="Your full name"
                        className="h-11 rounded-2xl border-white/8 bg-white/3 text-[var(--text-primary)]"
                      />
                    </SettingsRow>

                    <SettingsRow
                      icon={AtSign}
                      label="Username"
                      description="A clean handle for your account and future public profile surfaces."
                    >
                      <Input
                        value={settings.username}
                        onChange={(event) =>
                          setSettings((current) => ({ ...current, username: event.target.value }))
                        }
                        placeholder="prepbros-user"
                        className="h-11 rounded-2xl border-white/8 bg-white/3 text-[var(--text-primary)]"
                      />
                    </SettingsRow>

                    <SettingsRow
                      icon={GraduationCap}
                      label="Target exam"
                      description="Keeps the rest of the product aligned with the exam you care about most."
                    >
                      <select
                        value={settings.targetExam}
                        onChange={(event) =>
                          setSettings((current) => ({ ...current, targetExam: event.target.value }))
                        }
                        className="h-11 w-full rounded-2xl border border-white/8 bg-white/3 px-3 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--brand)]"
                      >
                        {EXAM_OPTIONS.map((exam) => (
                          <option key={exam} value={exam} className="bg-[#15151d] text-white">
                            {exam}
                          </option>
                        ))}
                      </select>
                    </SettingsRow>

                    <SettingsRow
                      icon={MapPin}
                      label="Location"
                      description="Useful for regional context and leaderboard identity."
                    >
                      <div className="grid gap-3 md:grid-cols-2">
                        <Input
                          value={settings.location}
                          onChange={(event) =>
                            setSettings((current) => ({ ...current, location: event.target.value }))
                          }
                          placeholder="Hyderabad, Telangana"
                          className="h-11 rounded-2xl border-white/8 bg-white/3 text-[var(--text-primary)]"
                        />
                        <Input
                          value={settings.state}
                          onChange={(event) =>
                            setSettings((current) => ({ ...current, state: event.target.value }))
                          }
                          placeholder="State for leaderboard"
                          className="h-11 rounded-2xl border-white/8 bg-white/3 text-[var(--text-primary)]"
                        />
                      </div>
                    </SettingsRow>

                    <SettingsRow
                      icon={BadgeCheck}
                      label="Avatar"
                      description="Paste an image URL for a sharper, more personal account card."
                    >
                      <Input
                        value={settings.avatarUrl}
                        onChange={(event) =>
                          setSettings((current) => ({ ...current, avatarUrl: event.target.value }))
                        }
                        placeholder="https://..."
                        className="h-11 rounded-2xl border-white/8 bg-white/3 text-[var(--text-primary)]"
                      />
                    </SettingsRow>

                    <SettingsRow
                      icon={NotebookPen}
                      label="Bio"
                      description="A short introduction, your goal, or how you are preparing right now."
                    >
                      <Textarea
                        value={settings.bio}
                        onChange={(event) =>
                          setSettings((current) => ({ ...current, bio: event.target.value }))
                        }
                        placeholder="UPSC aspirant focusing on polity, economy, and disciplined daily revision."
                        className="min-h-28 rounded-[22px] border-white/8 bg-white/3 text-[var(--text-primary)]"
                      />
                    </SettingsRow>

                    <div className="flex flex-col items-start justify-between gap-3 border-t border-[rgba(255,255,255,0.06)] px-5 py-5 md:flex-row md:items-center md:px-6">
                      <div>
                        <p
                          className={`text-sm ${
                            saveNotice?.section === "general" && saveNotice.tone === "error"
                              ? "text-[var(--red)]"
                              : "text-[var(--text-muted)]"
                          }`}
                        >
                          {saveNotice?.section === "general"
                            ? saveNotice.message
                            : "These are the identity details learners will feel immediately."}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => saveSettings("general")}
                        disabled={savingSection === "general"}
                        className="btn-primary rounded-full px-5 py-3"
                      >
                        {savingSection === "general" ? (
                          <>
                            <Loader2 size={15} className="animate-spin" />
                            Saving
                          </>
                        ) : (
                          "Save general settings"
                        )}
                      </button>
                    </div>
                  </section>

                  <section className={settingsCardClassName}>
                    <div className="px-5 py-5 md:px-6">
                      <p className="text-lg font-semibold text-[var(--text-primary)]">Links and showcase</p>
                      <p className="mt-1 text-sm text-[var(--text-muted)]">
                        Add the links that make your profile feel complete and credible.
                      </p>
                    </div>

                    <SettingsRow
                      icon={Globe2}
                      label="Website"
                      description="Portfolio, personal website, blog, or notes hub."
                      noBorder
                    >
                      <Input
                        value={settings.website}
                        onChange={(event) =>
                          setSettings((current) => ({ ...current, website: event.target.value }))
                        }
                        placeholder="yourdomain.com"
                        className="h-11 rounded-2xl border-white/8 bg-white/3 text-[var(--text-primary)]"
                      />
                    </SettingsRow>

                    <SettingsRow
                      icon={Github}
                      label="GitHub"
                      description="Link your code, notes repo, or practice archive."
                    >
                      <Input
                        value={settings.github}
                        onChange={(event) =>
                          setSettings((current) => ({ ...current, github: event.target.value }))
                        }
                        placeholder="username or full URL"
                        className="h-11 rounded-2xl border-white/8 bg-white/3 text-[var(--text-primary)]"
                      />
                    </SettingsRow>

                    <SettingsRow
                      icon={Linkedin}
                      label="LinkedIn"
                      description="Show your professional identity alongside your prep journey."
                    >
                      <Input
                        value={settings.linkedin}
                        onChange={(event) =>
                          setSettings((current) => ({ ...current, linkedin: event.target.value }))
                        }
                        placeholder="in/your-handle or full URL"
                        className="h-11 rounded-2xl border-white/8 bg-white/3 text-[var(--text-primary)]"
                      />
                    </SettingsRow>

                    <SettingsRow
                      icon={AtSign}
                      label="X"
                      description="Optional, but useful if you want a lighter public-facing identity."
                    >
                      <Input
                        value={settings.xHandle}
                        onChange={(event) =>
                          setSettings((current) => ({ ...current, xHandle: event.target.value }))
                        }
                        placeholder="@handle"
                        className="h-11 rounded-2xl border-white/8 bg-white/3 text-[var(--text-primary)]"
                      />
                    </SettingsRow>

                    <SettingsRow
                      icon={NotebookPen}
                      label="Readme"
                      description="Longer-form note about your prep approach, strengths, or current focus."
                    >
                      <Textarea
                        value={settings.readme}
                        onChange={(event) =>
                          setSettings((current) => ({ ...current, readme: event.target.value }))
                        }
                        placeholder="What are you working on this month? What topics are getting extra attention?"
                        className="min-h-28 rounded-[22px] border-white/8 bg-white/3 text-[var(--text-primary)]"
                      />
                    </SettingsRow>

                    <div className="border-t border-[rgba(255,255,255,0.06)] px-5 py-5 md:px-6">
                      <div className="flex flex-wrap gap-2">
                        {socialPreview.length > 0 ? (
                          socialPreview.map((item) => (
                            <a
                              key={item.label}
                              href={item.href}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-2 rounded-full border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] px-3 py-2 text-xs font-medium text-[var(--text-primary)]"
                            >
                              {item.label}
                              <SquareArrowOutUpRight size={13} className="text-[var(--text-muted)]" />
                            </a>
                          ))
                        ) : (
                          <p className="text-sm text-[var(--text-muted)]">
                            Add at least one link to make the profile feel more complete.
                          </p>
                        )}
                      </div>

                      <div className="mt-4 flex flex-col items-start justify-between gap-3 md:flex-row md:items-center">
                        <p
                          className={`text-sm ${
                            saveNotice?.section === "links" && saveNotice.tone === "error"
                              ? "text-[var(--red)]"
                              : "text-[var(--text-muted)]"
                          }`}
                        >
                          {saveNotice?.section === "links"
                            ? saveNotice.message
                            : "Links are optional, but they make the profile page feel intentional instead of empty."}
                        </p>
                        <button
                          type="button"
                          onClick={() => saveSettings("links")}
                          disabled={savingSection === "links"}
                          className="btn-primary rounded-full px-5 py-3"
                        >
                          {savingSection === "links" ? (
                            <>
                              <Loader2 size={15} className="animate-spin" />
                              Saving
                            </>
                          ) : (
                            "Save links"
                          )}
                        </button>
                      </div>
                    </div>
                  </section>
                </div>

                <div className="space-y-6">
                  <section className={`${sidebarCardClassName} p-5`}>
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-lg font-semibold text-[var(--text-primary)]">Study preferences</p>
                        <p className="mt-1 text-sm text-[var(--text-muted)]">
                          Small settings that make the account feel more alive.
                        </p>
                      </div>
                      <ShieldCheck size={18} className="text-[var(--brand)]" />
                    </div>

                    <div className="mt-5 space-y-4">
                      <div className="rounded-[22px] border border-[rgba(255,255,255,0.08)] bg-[rgba(13,13,18,0.9)] p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-sm font-semibold text-[var(--text-primary)]">Daily question goal</p>
                            <p className="mt-1 text-xs text-[var(--text-muted)]">
                              Used to measure today’s momentum across the product.
                            </p>
                          </div>
                          <Input
                            value={settings.dailyGoal}
                            onChange={(event) =>
                              setSettings((current) => ({
                                ...current,
                                dailyGoal: clampGoal(event.target.value),
                              }))
                            }
                            inputMode="numeric"
                            className="h-10 w-20 rounded-2xl border-white/8 bg-white/3 text-center text-[var(--text-primary)]"
                          />
                        </div>
                        <div className="mt-4">
                          <div className="mb-2 flex items-center justify-between gap-3">
                            <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">Today</p>
                            <p className="text-xs text-[var(--text-muted)]">
                              {todayAttempts}/{dailyGoal} attempts
                            </p>
                          </div>
                          <Progress value={dailyProgress} className="h-2 bg-white/6 [&_[data-slot=progress-indicator]]:bg-[var(--accent)]" />
                        </div>
                      </div>

                      <div className="rounded-[22px] border border-[rgba(255,255,255,0.08)] bg-[rgba(13,13,18,0.9)] p-4">
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <p className="text-sm font-semibold text-[var(--text-primary)]">Public profile</p>
                            <p className="mt-1 text-xs text-[var(--text-muted)]">
                              Keep your account ready for future shareable profile surfaces.
                            </p>
                          </div>
                          <Switch
                            checked={settings.publicProfile}
                            onCheckedChange={(checked) =>
                              setSettings((current) => ({ ...current, publicProfile: checked }))
                            }
                          />
                        </div>
                      </div>

                      <div className="rounded-[22px] border border-[rgba(255,255,255,0.08)] bg-[rgba(13,13,18,0.9)] p-4">
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <p className="text-sm font-semibold text-[var(--text-primary)]">Email reminders</p>
                            <p className="mt-1 text-xs text-[var(--text-muted)]">
                              Light accountability nudges for practice continuity.
                            </p>
                          </div>
                          <Switch
                            checked={settings.emailReminders}
                            onCheckedChange={(checked) =>
                              setSettings((current) => ({ ...current, emailReminders: checked }))
                            }
                          />
                        </div>
                      </div>

                      <div className="rounded-[22px] border border-[rgba(255,255,255,0.08)] bg-[rgba(13,13,18,0.9)] p-4">
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <p className="text-sm font-semibold text-[var(--text-primary)]">Weekly digest</p>
                            <p className="mt-1 text-xs text-[var(--text-muted)]">
                              A recap of solved questions, accuracy, and where to refocus.
                            </p>
                          </div>
                          <Switch
                            checked={settings.weeklyDigest}
                            onCheckedChange={(checked) =>
                              setSettings((current) => ({ ...current, weeklyDigest: checked }))
                            }
                          />
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 flex flex-col items-start gap-3">
                      <button
                        type="button"
                        onClick={() => saveSettings("preferences")}
                        disabled={savingSection === "preferences"}
                        className="btn-primary w-full rounded-full px-5 py-3"
                      >
                        {savingSection === "preferences" ? (
                          <>
                            <Loader2 size={15} className="animate-spin" />
                            Saving
                          </>
                        ) : (
                          <>
                            <BellRing size={15} />
                            Save preferences
                          </>
                        )}
                      </button>
                      <p
                        className={`text-sm ${
                          saveNotice?.section === "preferences" && saveNotice.tone === "error"
                            ? "text-[var(--red)]"
                            : "text-[var(--text-muted)]"
                        }`}
                      >
                        {saveNotice?.section === "preferences"
                          ? saveNotice.message
                          : "These settings are lightweight now, but they prepare the account for richer product behavior."}
                      </p>
                    </div>
                  </section>

                  <section className={`${sidebarCardClassName} p-5`}>
                    <p className="text-lg font-semibold text-[var(--text-primary)]">Performance snapshot</p>
                    <p className="mt-1 text-sm text-[var(--text-muted)]">
                      Keep the encouraging signals close to the settings flow.
                    </p>

                    <div className="mt-5 space-y-3">
                      <div className="rounded-[22px] border border-[rgba(255,255,255,0.08)] bg-[rgba(13,13,18,0.9)] p-4">
                        <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">Best lane</p>
                        <p className="mt-2 text-lg font-semibold text-[var(--text-primary)]">
                          {bestTopics[0]?.topic || "Start solving to surface strengths"}
                        </p>
                        <p className="mt-1 text-sm text-[var(--text-muted)]">
                          {bestTopics[0]
                            ? `${bestTopics[0].accuracy}% accuracy over ${bestTopics[0].total} attempts.`
                            : "A few more attempts will make this profile feel personalized."}
                        </p>
                      </div>

                      <div className="rounded-[22px] border border-[rgba(255,255,255,0.08)] bg-[rgba(13,13,18,0.9)] p-4">
                        <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">Focus next</p>
                        <p className="mt-2 text-lg font-semibold text-[var(--text-primary)]">
                          {needsWork[0]?.topic || "Review queue will appear here"}
                        </p>
                        <p className="mt-1 text-sm text-[var(--text-muted)]">
                          {needsWork[0]
                            ? `${needsWork[0].accuracy}% accuracy, so this is the clearest next revision target.`
                            : "Weak-topic guidance will become more useful as answer history grows."}
                        </p>
                      </div>
                    </div>
                  </section>
                </div>
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <section className={`${sidebarCardClassName} p-5`}>
                  <p className="text-lg font-semibold text-[var(--text-primary)]">Strongest areas</p>
                  <p className="mt-1 text-sm text-[var(--text-muted)]">
                    Good profile pages should also remind you where momentum already exists.
                  </p>

                  <div className="mt-5 space-y-3">
                    {bestTopics.length > 0 ? (
                      bestTopics.map((topic) => (
                        <div
                          key={topic.topic}
                          className="flex items-center justify-between gap-4 rounded-[22px] border border-[rgba(255,255,255,0.08)] bg-[rgba(13,13,18,0.9)] p-4"
                        >
                          <div>
                            <p className="font-semibold text-[var(--text-primary)]">{topic.topic}</p>
                            <p className="text-xs text-[var(--text-muted)]">{topic.total} attempts logged</p>
                          </div>
                          <span className="rounded-full border border-[rgba(45,181,93,0.24)] bg-[rgba(45,181,93,0.12)] px-3 py-1 text-xs font-semibold text-[#67da8b]">
                            {topic.accuracy}%
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="rounded-[22px] border border-dashed border-[rgba(255,255,255,0.12)] bg-[rgba(13,13,18,0.72)] p-5 text-sm text-[var(--text-muted)]">
                        Solve a few questions and your strongest topics will appear here.
                      </div>
                    )}
                  </div>
                </section>

                <section className={`${sidebarCardClassName} p-5`}>
                  <p className="text-lg font-semibold text-[var(--text-primary)]">Recent activity</p>
                  <p className="mt-1 text-sm text-[var(--text-muted)]">
                    A lightweight feed makes the profile feel active instead of static.
                  </p>

                  <div className="mt-5 space-y-3">
                    {recentActivity.length > 0 ? (
                      recentActivity.map((item) => (
                        <div
                          key={`${item.id}-${item.answeredAt}`}
                          className="rounded-[22px] border border-[rgba(255,255,255,0.08)] bg-[rgba(13,13,18,0.9)] p-4"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="font-semibold text-[var(--text-primary)]">{item.topic}</p>
                              <p className="mt-1 text-xs text-[var(--text-muted)]">{item.exam}</p>
                            </div>
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                item.isCorrect
                                  ? "border border-[rgba(45,181,93,0.24)] bg-[rgba(45,181,93,0.12)] text-[#67da8b]"
                                  : "border border-[rgba(255,184,0,0.24)] bg-[rgba(255,184,0,0.12)] text-[#ffc857]"
                              }`}
                            >
                              {item.isCorrect ? "Correct" : "Needs review"}
                            </span>
                          </div>
                          <p className="mt-3 text-xs text-[var(--text-muted)]">
                            {formatActivityStamp(item.answeredAt)}
                          </p>
                        </div>
                      ))
                    ) : (
                      <div className="rounded-[22px] border border-dashed border-[rgba(255,255,255,0.12)] bg-[rgba(13,13,18,0.72)] p-5 text-sm text-[var(--text-muted)]">
                        Your recent attempts will show up here once you begin solving.
                      </div>
                    )}
                  </div>
                </section>
              </div>

              <section className={`${sidebarCardClassName} p-5`}>
                <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                  <div>
                    <p className="text-lg font-semibold text-[var(--text-primary)]">Account health</p>
                    <p className="mt-1 text-sm text-[var(--text-muted)]">
                      A few signals that make the whole profile feel trustworthy and useful.
                    </p>
                  </div>
                  <p className="text-sm text-[var(--text-muted)]">
                    Last activity: {profile?.last_active ? formatActivityStamp(profile.last_active) : "Not available yet"}
                  </p>
                </div>

                <div className="mt-5 grid gap-3 md:grid-cols-3">
                  {[
                    {
                      label: "Identity ready",
                      value: settings.fullName && settings.username ? "Yes" : "Incomplete",
                      tone: settings.fullName && settings.username ? "text-[#67da8b]" : "text-[#ffc857]",
                    },
                    {
                      label: "Goal alignment",
                      value: settings.targetExam,
                      tone: "text-[var(--brand-light)]",
                    },
                    {
                      label: "Study target",
                      value: `${dailyGoal} questions/day`,
                      tone: "text-[#9ec5ff]",
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="rounded-[22px] border border-[rgba(255,255,255,0.08)] bg-[rgba(13,13,18,0.9)] p-4"
                    >
                      <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">{item.label}</p>
                      <p className={`mt-3 text-lg font-semibold ${item.tone}`}>{item.value}</p>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
