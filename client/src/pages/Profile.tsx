import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  AtSign,
  BadgeCheck,
  BellRing,
  Bookmark,
  Flame,
  GraduationCap,
  Loader2,
  LogOut,
  MapPin,
  SquareArrowOutUpRight,
  Target,
  TrendingUp,
  UserCircle2,
} from "lucide-react";
import { Link } from "wouter";

import AppShell from "@/components/AppShell";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
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

const panelClassName = "rounded-[20px] border border-[var(--border)] bg-[var(--bg-card)]";
const mutedPanelClassName = "rounded-[16px] border border-[var(--border)] bg-[var(--bg-elevated)]";
const fieldClassName =
  "h-11 rounded-[12px] border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text-primary)]";

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

const compactNumber = new Intl.NumberFormat("en-IN", {
  notation: "compact",
  maximumFractionDigits: 1,
});

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

const buildSettings = (
  profile: ProfileRow | null,
  user: ReturnType<typeof useAuth>["user"],
): EditableSettings => {
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
  if (type === "github") {
    return `https://github.com/${trimmed.replace(/^@/, "").replace(/^github\.com\//, "")}`;
  }
  if (type === "linkedin") {
    return `https://www.linkedin.com/${trimmed.replace(/^https?:\/\/(www\.)?linkedin\.com\//, "")}`;
  }
  return `https://x.com/${trimmed.replace(/^@/, "").replace(/^https?:\/\/(www\.)?x\.com\//, "")}`;
};

function Field({
  label,
  hint,
  children,
  fullWidth,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
  fullWidth?: boolean;
}) {
  return (
    <div className={fullWidth ? "md:col-span-2" : ""}>
      <label className="block text-sm font-medium text-[var(--text-primary)]">{label}</label>
      {hint ? <p className="mt-1 text-xs text-[var(--text-muted)]">{hint}</p> : null}
      <div className="mt-3">{children}</div>
    </div>
  );
}

function ToggleRow({
  title,
  description,
  checked,
  onCheckedChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <div className={`${mutedPanelClassName} flex items-start justify-between gap-4 px-4 py-3`}>
      <div>
        <p className="text-sm font-medium text-[var(--text-primary)]">{title}</p>
        <p className="mt-1 text-xs text-[var(--text-muted)]">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}

function SectionShell({
  id,
  title,
  description,
  children,
  action,
}: {
  id: string;
  title: string;
  description: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <section id={id} className={panelClassName}>
      <div className="flex flex-col gap-3 border-b border-[var(--border)] px-5 py-4 md:flex-row md:items-center md:justify-between md:px-6">
        <div>
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">{title}</h2>
          <p className="mt-1 text-sm text-[var(--text-muted)]">{description}</p>
        </div>
        {action}
      </div>
      <div className="px-5 py-5 md:px-6">{children}</div>
    </section>
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
          ? "Profile details saved."
          : section === "links"
            ? "Profile links updated."
            : "Preferences saved.",
    });
    setSavingSection(null);
  };

  if (loading || pageLoading || questionsSyncing) {
    return (
      <AppShell>
        <div className="container-shell flex min-h-[62vh] items-center justify-center">
          <div className="inline-flex items-center gap-3 rounded-full border border-[var(--border)] bg-[var(--bg-card)] px-5 py-3 text-sm text-[var(--text-secondary)]">
            <Loader2 size={16} className="animate-spin text-[var(--brand)]" />
            Loading account settings...
          </div>
        </div>
      </AppShell>
    );
  }

  if (!user) {
    return (
      <AppShell>
        <div className="container-shell py-14">
          <div className={`${panelClassName} p-8 text-center md:p-12`}>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--brand)]">
              Profile settings
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-[-0.06em] text-[var(--text-primary)]">
              Sign in to manage your PrepBros profile.
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-sm text-[var(--text-secondary)] md:text-base">
              Your account settings live here, along with the study preferences that shape your prep experience.
            </p>
            <Link href="/">
              <span className="btn-primary mt-8 inline-flex cursor-pointer px-6 py-3">
                Back to home
              </span>
            </Link>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-4">
        <section className={`${panelClassName} px-5 py-5 md:px-6`}>
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex min-w-0 items-start gap-4">
              <Avatar className="h-16 w-16 rounded-[18px] border border-[var(--border)] bg-[var(--brand-subtle)]">
                <AvatarImage src={settings.avatarUrl} alt={settings.fullName} className="object-cover" />
                <AvatarFallback className="rounded-[18px] bg-[var(--brand-subtle)] text-[var(--brand)]">
                  <UserCircle2 size={28} />
                </AvatarFallback>
              </Avatar>

              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--text-faint)]">
                  Profile
                </p>
                <h1 className="mt-2 text-[1.75rem] font-semibold tracking-[-0.05em] text-[var(--text-primary)] md:text-[2rem]">
                  {settings.fullName}
                </h1>
                <p className="mt-1 text-sm text-[var(--text-muted)]">
                  @{settings.username} · {user.email}
                </p>
                <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--text-secondary)]">
                  {settings.bio ||
                    "Keep the account clean, current, and easy to trust. This page is meant to feel like a working settings area, not a public profile showcase."}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link href="/practice">
                <span className="btn-primary cursor-pointer px-4 py-2.5 text-sm">
                  Continue practice
                </span>
              </Link>
              <Link href="/dashboard">
                <span className="btn-secondary cursor-pointer px-4 py-2.5 text-sm">
                  Open dashboard
                </span>
              </Link>
              <button type="button" onClick={() => signOut()} className="btn-secondary px-4 py-2.5 text-sm">
                <LogOut size={14} />
                Sign out
              </button>
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { label: "Target exam", value: settings.targetExam, icon: Target },
              { label: "Joined", value: formatJoinedDate(user.created_at), icon: BadgeCheck },
              {
                label: "Login method",
                value: toDisplayProvider(String(user.app_metadata?.provider || "email")),
                icon: AtSign,
              },
              {
                label: "Last active",
                value: profile?.last_active ? formatActivityStamp(profile.last_active) : "Not available",
                icon: Flame,
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className={`${mutedPanelClassName} px-4 py-3.5`}>
                  <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--text-faint)]">
                    <Icon size={14} className="text-[var(--brand)]" />
                    {item.label}
                  </div>
                  <p className="mt-3 text-sm font-medium leading-6 text-[var(--text-primary)]">
                    {item.value}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        <div className="flex flex-wrap gap-2">
          {[
            { href: "#general", label: "General" },
            { href: "#links", label: "Links" },
            { href: "#preferences", label: "Preferences" },
          ].map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="rounded-full border border-[var(--border)] bg-[var(--bg-card)] px-4 py-2 text-sm font-medium text-[var(--text-secondary)] transition hover:border-[var(--border-strong)] hover:text-[var(--text-primary)]"
            >
              {item.label}
            </a>
          ))}
        </div>

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-4">
            <SectionShell
              id="general"
              title="General"
              description="Basic profile details used across PrepBros."
              action={
                <button
                  type="button"
                  onClick={() => saveSettings("general")}
                  disabled={savingSection === "general"}
                  className="btn-primary px-4 py-2.5 text-sm"
                >
                  {savingSection === "general" ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Saving
                    </>
                  ) : (
                    "Save changes"
                  )}
                </button>
              }
            >
              <div className="grid gap-5 md:grid-cols-2">
                <Field label="Display name">
                  <Input
                    value={settings.fullName}
                    onChange={(event) =>
                      setSettings((current) => ({ ...current, fullName: event.target.value }))
                    }
                    placeholder="Your full name"
                    className={fieldClassName}
                  />
                </Field>

                <Field label="Username">
                  <Input
                    value={settings.username}
                    onChange={(event) =>
                      setSettings((current) => ({ ...current, username: event.target.value }))
                    }
                    placeholder="prepbros-user"
                    className={fieldClassName}
                  />
                </Field>

                <Field label="Target exam">
                  <select
                    value={settings.targetExam}
                    onChange={(event) =>
                      setSettings((current) => ({ ...current, targetExam: event.target.value }))
                    }
                    className={`${fieldClassName} w-full px-3 text-sm outline-none transition focus:border-[var(--brand)]`}
                  >
                    {EXAM_OPTIONS.map((exam) => (
                      <option key={exam} value={exam} className="bg-[var(--bg-card-strong)] text-[var(--text-primary)]">
                        {exam}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Avatar URL">
                  <Input
                    value={settings.avatarUrl}
                    onChange={(event) =>
                      setSettings((current) => ({ ...current, avatarUrl: event.target.value }))
                    }
                    placeholder="https://..."
                    className={fieldClassName}
                  />
                </Field>

                <Field label="Location">
                  <Input
                    value={settings.location}
                    onChange={(event) =>
                      setSettings((current) => ({ ...current, location: event.target.value }))
                    }
                    placeholder="Hyderabad, Telangana"
                    className={fieldClassName}
                  />
                </Field>

                <Field label="State">
                  <Input
                    value={settings.state}
                    onChange={(event) =>
                      setSettings((current) => ({ ...current, state: event.target.value }))
                    }
                    placeholder="State"
                    className={fieldClassName}
                  />
                </Field>

                <Field label="Bio" hint="Short introduction or your current prep focus." fullWidth>
                  <Textarea
                    value={settings.bio}
                    onChange={(event) =>
                      setSettings((current) => ({ ...current, bio: event.target.value }))
                    }
                    placeholder="UPSC aspirant focused on consistent daily revision and topic-wise practice."
                    className="min-h-28 rounded-[14px] border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text-primary)]"
                  />
                </Field>
              </div>

              <p
                className={`mt-4 text-sm ${
                  saveNotice?.section === "general" && saveNotice.tone === "error"
                    ? "text-[var(--red)]"
                    : "text-[var(--text-muted)]"
                }`}
              >
                {saveNotice?.section === "general"
                  ? saveNotice.message
                  : "These details shape how your account appears anywhere identity is shown in the app."}
              </p>
            </SectionShell>

            <SectionShell
              id="links"
              title="Links and showcase"
              description="Optional links that help the account feel complete without overdoing it."
              action={
                <button
                  type="button"
                  onClick={() => saveSettings("links")}
                  disabled={savingSection === "links"}
                  className="btn-primary px-4 py-2.5 text-sm"
                >
                  {savingSection === "links" ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Saving
                    </>
                  ) : (
                    "Save links"
                  )}
                </button>
              }
            >
              <div className="grid gap-5 md:grid-cols-2">
                <Field label="Website">
                  <Input
                    value={settings.website}
                    onChange={(event) =>
                      setSettings((current) => ({ ...current, website: event.target.value }))
                    }
                    placeholder="yourdomain.com"
                    className={fieldClassName}
                  />
                </Field>

                <Field label="GitHub">
                  <Input
                    value={settings.github}
                    onChange={(event) =>
                      setSettings((current) => ({ ...current, github: event.target.value }))
                    }
                    placeholder="username or full URL"
                    className={fieldClassName}
                  />
                </Field>

                <Field label="LinkedIn">
                  <Input
                    value={settings.linkedin}
                    onChange={(event) =>
                      setSettings((current) => ({ ...current, linkedin: event.target.value }))
                    }
                    placeholder="in/your-handle or full URL"
                    className={fieldClassName}
                  />
                </Field>

                <Field label="X">
                  <Input
                    value={settings.xHandle}
                    onChange={(event) =>
                      setSettings((current) => ({ ...current, xHandle: event.target.value }))
                    }
                    placeholder="@handle"
                    className={fieldClassName}
                  />
                </Field>

                <Field label="Readme" hint="A longer note about your current prep journey." fullWidth>
                  <Textarea
                    value={settings.readme}
                    onChange={(event) =>
                      setSettings((current) => ({ ...current, readme: event.target.value }))
                    }
                    placeholder="What are you working on this month? Which topics need extra attention?"
                    className="min-h-28 rounded-[14px] border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text-primary)]"
                  />
                </Field>
              </div>

              {socialPreview.length > 0 ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {socialPreview.map((item) => (
                    <a
                      key={item.label}
                      href={item.href}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2 text-xs font-medium text-[var(--text-primary)]"
                    >
                      {item.label}
                      <SquareArrowOutUpRight size={12} className="text-[var(--text-muted)]" />
                    </a>
                  ))}
                </div>
              ) : null}

              <p
                className={`mt-4 text-sm ${
                  saveNotice?.section === "links" && saveNotice.tone === "error"
                    ? "text-[var(--red)]"
                    : "text-[var(--text-muted)]"
                }`}
              >
                {saveNotice?.section === "links"
                  ? saveNotice.message
                  : "Links are optional, but they make the account feel intentional instead of half-finished."}
              </p>
            </SectionShell>

            <SectionShell
              id="preferences"
              title="Preferences"
              description="Simple settings that shape how the account behaves."
              action={
                <button
                  type="button"
                  onClick={() => saveSettings("preferences")}
                  disabled={savingSection === "preferences"}
                  className="btn-primary px-4 py-2.5 text-sm"
                >
                  {savingSection === "preferences" ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Saving
                    </>
                  ) : (
                    <>
                      <BellRing size={14} />
                      Save preferences
                    </>
                  )}
                </button>
              }
            >
              <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                <div className={`${mutedPanelClassName} p-4`}>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-[var(--text-primary)]">Daily question goal</p>
                      <p className="mt-1 text-xs text-[var(--text-muted)]">
                        Keep the target realistic enough to stay repeatable.
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
                      className="h-10 w-20 rounded-[12px] border-[var(--border)] bg-[var(--bg-elevated)] text-center text-[var(--text-primary)]"
                    />
                  </div>

                  <div className="mt-4">
                    <div className="mb-2 flex items-center justify-between gap-3 text-xs text-[var(--text-muted)]">
                      <span>Today</span>
                      <span>
                        {todayAttempts}/{dailyGoal} attempts
                      </span>
                    </div>
                    <Progress value={dailyProgress} className="h-1.5 bg-white/6 [&_[data-slot=progress-indicator]]:bg-[var(--accent)]" />
                  </div>
                </div>

                <div className="space-y-3">
                  <ToggleRow
                    title="Public profile"
                    description="Keep the account ready for future shareable profile surfaces."
                    checked={settings.publicProfile}
                    onCheckedChange={(checked) =>
                      setSettings((current) => ({ ...current, publicProfile: checked }))
                    }
                  />
                  <ToggleRow
                    title="Email reminders"
                    description="Light accountability nudges for practice continuity."
                    checked={settings.emailReminders}
                    onCheckedChange={(checked) =>
                      setSettings((current) => ({ ...current, emailReminders: checked }))
                    }
                  />
                  <ToggleRow
                    title="Weekly digest"
                    description="A recap of solved questions, accuracy, and what needs attention."
                    checked={settings.weeklyDigest}
                    onCheckedChange={(checked) =>
                      setSettings((current) => ({ ...current, weeklyDigest: checked }))
                    }
                  />
                </div>
              </div>

              <p
                className={`mt-4 text-sm ${
                  saveNotice?.section === "preferences" && saveNotice.tone === "error"
                    ? "text-[var(--red)]"
                    : "text-[var(--text-muted)]"
                }`}
              >
                {saveNotice?.section === "preferences"
                  ? saveNotice.message
                  : "These settings stay intentionally light, so the account remains easy to manage."}
              </p>
            </SectionShell>
          </div>

          <aside className="space-y-4 xl:sticky xl:top-7 xl:self-start">
            <section className={`${panelClassName} p-5`}>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--text-faint)]">
                Account overview
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                {[
                  { label: "Solved", value: compactNumber.format(totalSolved), icon: Target },
                  { label: "Accuracy", value: `${accuracy}%`, icon: TrendingUp },
                  { label: "Bookmarks", value: String(bookmarkCount), icon: Bookmark },
                  { label: "Streak", value: `${streak}d`, icon: Flame },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.label} className={`${mutedPanelClassName} px-4 py-3`}>
                      <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--text-faint)]">
                        <Icon size={14} className="text-[var(--brand)]" />
                        {item.label}
                      </div>
                      <p className="mt-2 text-xl font-semibold tracking-[-0.05em] text-[var(--text-primary)]">
                        {item.value}
                      </p>
                    </div>
                  );
                })}
              </div>

              <div className={`${mutedPanelClassName} mt-4 px-4 py-3`}>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-medium text-[var(--text-primary)]">Profile completion</span>
                  <span className="text-sm font-semibold text-[var(--brand-light)]">{completionPercent}%</span>
                </div>
                <Progress
                  value={completionPercent}
                  className="mt-3 h-1.5 bg-white/6 [&_[data-slot=progress-indicator]]:bg-[var(--brand)]"
                />
                <p className="mt-3 text-xs text-[var(--text-muted)]">
                  Filling the core details keeps the account complete and easy to trust.
                </p>
              </div>
            </section>

            <section className={`${panelClassName} p-5`}>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--text-faint)]">
                Daily target
              </p>
              <p className="mt-2 text-[1.6rem] font-semibold tracking-[-0.05em] text-[var(--text-primary)]">
                {todayAttempts}/{dailyGoal}
              </p>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">
                Best streak: {maxStreak} day{maxStreak === 1 ? "" : "s"}.
              </p>
              <Progress value={dailyProgress} className="mt-4 h-1.5 bg-white/6 [&_[data-slot=progress-indicator]]:bg-[var(--accent)]" />
            </section>

            <section className={`${panelClassName} p-5`}>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--text-faint)]">
                Recent activity
              </p>
              <div className="mt-4 space-y-2.5">
                {recentActivity.length > 0 ? (
                  recentActivity.map((item) => (
                    <div
                      key={`${item.id}-${item.answeredAt}`}
                      className={`${mutedPanelClassName} flex items-start justify-between gap-4 px-4 py-3`}
                    >
                      <div>
                        <p className="text-sm font-medium text-[var(--text-primary)]">{item.topic}</p>
                        <p className="mt-1 text-xs text-[var(--text-muted)]">{item.exam}</p>
                        <p className="mt-2 text-xs text-[var(--text-muted)]">
                          {formatActivityStamp(item.answeredAt)}
                        </p>
                      </div>
                      <span
                        className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] ${
                          item.isCorrect
                            ? "bg-[var(--accent-subtle)] text-[var(--accent)]"
                            : "bg-[var(--yellow-bg)] text-[var(--yellow)]"
                        }`}
                      >
                        {item.isCorrect ? "Correct" : "Review"}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className={`${mutedPanelClassName} px-4 py-4 text-sm text-[var(--text-muted)]`}>
                    Your recent attempts will appear here once you begin solving.
                  </div>
                )}
              </div>
            </section>

            <section className={`${panelClassName} p-5`}>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--text-faint)]">
                Insights
              </p>
              <div className="mt-4 space-y-3">
                <div className={`${mutedPanelClassName} px-4 py-3`}>
                  <div className="flex items-center gap-2 text-sm font-medium text-[var(--text-primary)]">
                    <BadgeCheck size={15} className="text-[var(--brand)]" />
                    Strongest topic
                  </div>
                  <p className="mt-2 text-sm text-[var(--text-secondary)]">
                    {bestTopics[0]
                      ? `${bestTopics[0].topic} · ${bestTopics[0].accuracy}% accuracy`
                      : "Solve a few more questions to surface your strongest area."}
                  </p>
                </div>

                <div className={`${mutedPanelClassName} px-4 py-3`}>
                  <div className="flex items-center gap-2 text-sm font-medium text-[var(--text-primary)]">
                    <MapPin size={15} className="text-[var(--brand)]" />
                    Needs attention
                  </div>
                  <p className="mt-2 text-sm text-[var(--text-secondary)]">
                    {needsWork[0]
                      ? `${needsWork[0].topic} · ${needsWork[0].accuracy}% accuracy`
                      : "Weak-topic guidance will appear as your answer history grows."}
                  </p>
                </div>

                <div className={`${mutedPanelClassName} px-4 py-3`}>
                  <div className="flex items-center gap-2 text-sm font-medium text-[var(--text-primary)]">
                    <GraduationCap size={15} className="text-[var(--brand)]" />
                    Study baseline
                  </div>
                  <p className="mt-2 text-sm text-[var(--text-secondary)]">
                    Daily target is {dailyGoal} question{dailyGoal === 1 ? "" : "s"} with {bookmarkCount} saved for review.
                  </p>
                </div>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </AppShell>
  );
}
