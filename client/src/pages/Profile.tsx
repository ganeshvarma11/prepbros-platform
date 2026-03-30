import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  ArrowRight,
  Copy,
  Crown,
  Flame,
  Loader2,
  LogOut,
  Mail,
  MapPin,
  PencilLine,
  Shield,
  Sparkles,
  Trophy,
} from "lucide-react";
import { Link } from "wouter";

import AppShell from "@/components/AppShell";
import { ThemeToggle } from "@/components/ThemeToggle";
import { PageEmpty } from "@/components/PageState";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { useQuestionBank } from "@/hooks/useQuestionBank";
import {
  buildQuestionProgress,
  countCurrentStreak,
  getAnswerAttempts,
} from "@/lib/userProgress";
import { supabase } from "@/lib/supabase";

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

const PREP_LEVEL_OPTIONS = ["Beginner", "Intermediate", "Advanced"];

type ActiveTab = "profile" | "settings" | "account";

type ProfileRow = {
  full_name?: string;
  username?: string;
  target_exam?: string;
  state?: string;
  last_active?: string;
};

type EditableSettings = {
  fullName: string;
  username: string;
  targetExam: string;
  location: string;
  state: string;
  bio: string;
  dailyGoal: string;
  prepLevel: string;
  publicProfile: boolean;
  emailReminders: boolean;
  weeklyDigest: boolean;
  streakAlerts: boolean;
};

type SaveNotice = {
  tone: "success" | "error";
  message: string;
};

const defaultSettings: EditableSettings = {
  fullName: "",
  username: "",
  targetExam: "UPSC CSE 2026",
  location: "",
  state: "",
  bio: "",
  dailyGoal: "12",
  prepLevel: "Intermediate",
  publicProfile: true,
  emailReminders: true,
  weeklyDigest: true,
  streakAlerts: true,
};

const fieldClassName =
  "h-[46px] rounded-[12px] border border-white/8 bg-white/[0.03] px-4 text-[14px] text-[#f0ede6] shadow-none placeholder:text-[#5f5d58] focus-visible:border-[#c9a84c] focus-visible:ring-0";
const textareaClassName =
  "min-h-[110px] rounded-[12px] border border-white/8 bg-white/[0.03] px-4 py-3 text-[14px] text-[#f0ede6] shadow-none placeholder:text-[#5f5d58] focus-visible:border-[#c9a84c] focus-visible:ring-0";

const clampGoal = (value: string) => {
  const digitsOnly = value.replace(/[^\d]/g, "");
  if (!digitsOnly) return "1";
  return String(
    Math.max(1, Math.min(200, Number.parseInt(digitsOnly, 10) || 1))
  );
};

const formatCount = (value: number) =>
  new Intl.NumberFormat("en-IN").format(value);

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
  location: settings.location.trim(),
  state: settings.state.trim(),
  bio: settings.bio.trim(),
  dailyGoal: clampGoal(settings.dailyGoal),
  prepLevel: settings.prepLevel || "Intermediate",
});

const buildSettings = (
  profile: ProfileRow | null,
  user: ReturnType<typeof useAuth>["user"]
): EditableSettings => {
  const metadata = user?.user_metadata || {};

  return sanitizeSettings({
    fullName: String(
      profile?.full_name ||
        metadata.full_name ||
        user?.email?.split("@")[0] ||
        "Aspirant"
    ),
    username: String(
      profile?.username ||
        metadata.username ||
        user?.email?.split("@")[0] ||
        "prepbros-user"
    ),
    targetExam: String(
      profile?.target_exam || metadata.target_exam || "UPSC CSE 2026"
    ),
    location: String(metadata.location || ""),
    state: String(profile?.state || metadata.state || ""),
    bio: String(metadata.bio || ""),
    dailyGoal: String(metadata.daily_goal || "12"),
    prepLevel: String(metadata.prep_level || "Intermediate"),
    publicProfile:
      typeof metadata.public_profile === "boolean"
        ? metadata.public_profile
        : true,
    emailReminders:
      typeof metadata.email_reminders === "boolean"
        ? metadata.email_reminders
        : true,
    weeklyDigest:
      typeof metadata.weekly_digest === "boolean"
        ? metadata.weekly_digest
        : true,
    streakAlerts:
      typeof metadata.streak_alerts === "boolean"
        ? metadata.streak_alerts
        : true,
  });
};

const formatDate = (value?: string) => {
  if (!value) return "Not available";
  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const toDisplayProvider = (value?: string) => {
  if (!value) return "Email";
  return value
    .split("_")
    .map(segment => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
};

const getInitials = (value: string) =>
  value
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase() || "")
    .join("") || "PB";

function SettingField({
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
      <label className="block text-[11px] uppercase tracking-[0.18em] text-[#66635e]">
        {label}
      </label>
      {hint ? <p className="mt-2 text-sm text-[#8a8880]">{hint}</p> : null}
      <div className="mt-3">{children}</div>
    </div>
  );
}

function PreferenceRow({
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
    <div className="flex items-center justify-between gap-4 border-b border-white/8 py-4">
      <div className="pr-4">
        <p className="text-sm font-medium text-[#f0ede6]">{title}</p>
        <p className="mt-1 text-sm text-[#8a8880]">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}

function AccountRow({
  label,
  detail,
  action,
}: {
  label: string;
  detail: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 border-b border-white/8 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm font-medium text-[#f0ede6]">{label}</p>
        <p className="mt-1 text-sm text-[#8a8880]">{detail}</p>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export default function Profile() {
  const { user, loading, signOut } = useAuth();
  const { questions, syncing: questionsSyncing } = useQuestionBank();
  const [pageLoading, setPageLoading] = useState(true);
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [answers, setAnswers] = useState<
    Awaited<ReturnType<typeof getAnswerAttempts>>
  >([]);
  const [settings, setSettings] = useState<EditableSettings>(defaultSettings);
  const [activeTab, setActiveTab] = useState<ActiveTab>("profile");
  const [saving, setSaving] = useState(false);
  const [saveNotice, setSaveNotice] = useState<SaveNotice | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      setPageLoading(false);
      return;
    }

    const load = async () => {
      setPageLoading(true);
      const [{ data }, answerData] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).single(),
        getAnswerAttempts(user.id),
      ]);

      const nextProfile = (data || null) as ProfileRow | null;
      setProfile(nextProfile);
      setSettings(buildSettings(nextProfile, user));
      setAnswers(answerData || []);
      setPageLoading(false);
    };

    load();
  }, [loading, user]);

  const questionProgress = useMemo(
    () => Object.values(buildQuestionProgress(answers)),
    [answers]
  );

  const totalAttempts = questionProgress.length;
  const totalSolved = questionProgress.filter(
    item => item.status === "correct"
  ).length;
  const totalUnattempted = Math.max(0, questions.length - totalAttempts);
  const accuracy =
    totalAttempts > 0 ? Math.round((totalSolved / totalAttempts) * 100) : 0;
  const streak = countCurrentStreak(answers);
  const coverage =
    questions.length > 0
      ? Math.round((totalSolved / questions.length) * 100)
      : 0;

  const achievements = useMemo(
    () => [
      {
        title: "First solve",
        description:
          totalSolved > 0
            ? "Solved your first question"
            : "Solve 1 question to unlock",
        unlocked: totalSolved > 0,
      },
      {
        title: "Streak builder",
        description:
          streak >= 3
            ? "3-day streak unlocked"
            : `${Math.max(0, 3 - streak)} more day${Math.max(0, 3 - streak) === 1 ? "" : "s"} to unlock`,
        unlocked: streak >= 3,
      },
      {
        title: "Sharp accuracy",
        description:
          accuracy >= 70 && totalAttempts >= 10
            ? "Maintained 70%+ accuracy"
            : "Reach 70% accuracy over 10 attempts",
        unlocked: accuracy >= 70 && totalAttempts >= 10,
      },
      {
        title: "100 solved",
        description:
          totalSolved >= 100
            ? "Crossed 100 solved questions"
            : `${Math.max(0, 100 - totalSolved)} more to reach 100 solved`,
        unlocked: totalSolved >= 100,
      },
    ],
    [accuracy, streak, totalAttempts, totalSolved]
  );

  const displayName =
    settings.fullName || user?.email?.split("@")[0] || "Aspirant";
  const joinedDate = formatDate(user?.created_at);
  const profileTags = [
    settings.targetExam,
    joinedDate !== "Not available" ? `Joined ${joinedDate}` : null,
    settings.location || settings.state || null,
    settings.prepLevel,
  ].filter(Boolean) as string[];

  const saveSettings = async () => {
    if (!user) return;

    const nextSettings = sanitizeSettings(settings);
    const metadata = user.user_metadata || {};
    const metadataPayload = {
      ...metadata,
      full_name: nextSettings.fullName,
      username: nextSettings.username,
      target_exam: nextSettings.targetExam,
      location: nextSettings.location,
      state: nextSettings.state,
      bio: nextSettings.bio,
      daily_goal: Number.parseInt(nextSettings.dailyGoal, 10) || 12,
      prep_level: nextSettings.prepLevel,
      public_profile: nextSettings.publicProfile,
      email_reminders: nextSettings.emailReminders,
      weekly_digest: nextSettings.weeklyDigest,
      streak_alerts: nextSettings.streakAlerts,
    };

    setSettings(nextSettings);
    setSaving(true);
    setSaveNotice(null);

    const { error: authError } = await supabase.auth.updateUser({
      data: metadataPayload,
    });

    if (authError) {
      setSaveNotice({
        tone: "error",
        message: "We couldn't save your changes right now. Please try again.",
      });
      setSaving(false);
      return;
    }

    const profilePayload = {
      full_name: nextSettings.fullName,
      username: nextSettings.username,
      target_exam: nextSettings.targetExam,
      state: nextSettings.state,
    };

    const { error: profileError } = await supabase
      .from("profiles")
      .update(profilePayload)
      .eq("id", user.id);

    if (!profileError) {
      setProfile(current => ({ ...(current || {}), ...profilePayload }));
    } else {
      console.error("Profile table sync failed:", profileError);
    }

    setSaveNotice({
      tone: "success",
      message: "Changes saved.",
    });
    setSaving(false);
  };

  const copyHandle = async () => {
    try {
      const handle = `@${sanitizeSettings(settings).username}`;
      await navigator.clipboard.writeText(handle);
      setSaveNotice({ tone: "success", message: "Profile handle copied." });
    } catch {
      setSaveNotice({
        tone: "error",
        message: "Couldn't copy the handle on this device right now.",
      });
    }
  };

  if (loading || pageLoading || questionsSyncing) {
    return (
      <AppShell shellClassName="bg-[#050505]">
        <div className="flex min-h-[62vh] items-center justify-center">
          <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.04] px-5 py-3 text-sm text-[#a39a91]">
            <Loader2 size={16} className="animate-spin text-[#c9a84c]" />
            Loading profile...
          </div>
        </div>
      </AppShell>
    );
  }

  if (!user) {
    return (
      <AppShell shellClassName="bg-[#050505]">
        <div className="mx-auto max-w-2xl py-14">
          <PageEmpty
            title="Sign in to manage your profile"
            description="Your profile, preferences, and account details live in one quiet workspace."
            actionLabel="Back to home"
            actionHref="/"
            className="rounded-[24px] border-white/10 bg-[#090807] py-14"
          />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell shellClassName="bg-[#050505]" contentClassName="max-w-none">
      <div className="relative">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(164,118,76,0.08),transparent_34%),radial-gradient(circle_at_80%_18%,rgba(120,78,42,0.14),transparent_25%),linear-gradient(180deg,#060505_0%,#090807_46%,#050505_100%)]" />
        <div className="pointer-events-none absolute inset-0 opacity-[0.09] [background-image:linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.035)_1px,transparent_1px)] [background-size:150px_150px]" />

        <div className="relative z-10 mx-auto w-full max-w-[1120px] pb-10">
          <div className="sticky top-0 z-20 -mx-4 border-b border-white/8 bg-[#141414]/92 px-4 backdrop-blur-xl md:-mx-6 md:px-6 lg:-mx-8 lg:px-8">
            <div className="mx-auto flex max-w-[1120px] items-center gap-1 overflow-x-auto">
              {[
                { key: "profile", label: "Profile" },
                { key: "settings", label: "Settings" },
                { key: "account", label: "Account" },
              ].map(item => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setActiveTab(item.key as ActiveTab)}
                  className={`border-b-2 px-4 py-4 text-sm transition ${
                    activeTab === item.key
                      ? "border-[#c9a84c] text-[#c9a84c]"
                      : "border-transparent text-[#8a8880] hover:text-[#f0ede6]"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {activeTab === "profile" ? (
            <section className="overflow-hidden">
              <div className="relative h-[190px] overflow-hidden border-b border-white/8 bg-[linear-gradient(135deg,#1a1200_0%,#2a1f00_38%,#1a1200_100%)]">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(201,168,76,0.12),transparent_55%),radial-gradient(circle_at_80%_30%,rgba(201,168,76,0.07),transparent_45%)]" />
                <div className="absolute inset-0 opacity-[0.18] [background-image:linear-gradient(to_right,rgba(201,168,76,0.16)_1px,transparent_1px),linear-gradient(to_bottom,rgba(201,168,76,0.12)_1px,transparent_1px)] [background-size:180px_180px]" />
                <button
                  type="button"
                  onClick={() => setActiveTab("settings")}
                  className="absolute right-4 top-4 inline-flex items-center gap-2 rounded-[10px] border border-white/12 bg-black/35 px-3 py-2 text-xs text-[#f0ede6] backdrop-blur-sm transition hover:bg-black/55"
                >
                  <PencilLine size={13} />
                  Edit profile
                </button>
              </div>

              <div className="border-b border-white/8 px-0 pb-8">
                <div className="px-0 sm:px-0">
                  <div className="mx-0 px-0">
                    <div className="px-0">
                      <div className="mx-0 px-0" />
                    </div>
                  </div>
                </div>

                <div className="px-0">
                  <div className="mx-auto max-w-[1120px] px-0">
                    <div className="relative px-0">
                      <div className="mx-auto w-full px-0">
                        <div className="px-0">
                          <div className="mx-auto w-full px-0" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="px-0">
                  <div className="mx-auto max-w-[1120px]">
                    <div className="-mt-10 flex flex-col gap-6 px-0 sm:-mt-12 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0">
                        <div className="relative flex h-[88px] w-[88px] items-center justify-center rounded-full border-[3px] border-[#050505] bg-[#222] text-[30px] text-[#c9a84c] shadow-[0_24px_60px_-28px_rgba(0,0,0,0.9)]">
                          <span style={{ fontFamily: "var(--font-display)" }}>
                            {getInitials(displayName)}
                          </span>
                        </div>

                        <div className="mt-4">
                          <h1
                            className="text-[2rem] leading-none tracking-[-0.04em] text-[#f0ede6] sm:text-[2.2rem]"
                            style={{ fontFamily: "var(--font-display)" }}
                          >
                            {displayName}
                          </h1>
                          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-[#5f5d58]">
                            <span>@{settings.username}</span>
                            {settings.location || settings.state ? (
                              <>
                                <span>·</span>
                                <span className="inline-flex items-center gap-1.5">
                                  <MapPin size={13} />
                                  {settings.location || settings.state}
                                  {settings.location && settings.state
                                    ? `, ${settings.state}`
                                    : ""}
                                </span>
                              </>
                            ) : null}
                          </div>
                          <p className="mt-3 max-w-[60ch] text-[15px] leading-7 text-[#8a8880]">
                            {settings.bio ||
                              "A focused profile that keeps your prep identity, progress, and settings in one place."}
                          </p>
                          <div className="mt-4 flex flex-wrap gap-2">
                            {profileTags.map((tag, index) => (
                              <span
                                key={tag}
                                className={`rounded-full border px-3 py-1.5 text-[11px] ${
                                  index === 0
                                    ? "border-[#c9a84c] bg-[#1a1200] text-[#c9a84c]"
                                    : "border-white/10 text-[#8a8880]"
                                }`}
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 pt-1">
                        <button
                          type="button"
                          onClick={() => setActiveTab("settings")}
                          className="inline-flex items-center gap-2 rounded-[10px] bg-[#c9a84c] px-4 py-2.5 text-sm font-medium text-[#0e0e0e] transition hover:bg-[#f0c040]"
                        >
                          <PencilLine size={14} />
                          Edit details
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            void copyHandle();
                          }}
                          className="inline-flex items-center gap-2 rounded-[10px] border border-white/10 px-4 py-2.5 text-sm text-[#8a8880] transition hover:bg-white/[0.04] hover:text-[#f0ede6]"
                        >
                          <Copy size={14} />
                          Copy handle
                        </button>
                        <Link href="/practice">
                          <span className="inline-flex cursor-pointer items-center gap-2 rounded-[10px] border border-white/10 px-4 py-2.5 text-sm text-[#8a8880] transition hover:bg-white/[0.04] hover:text-[#f0ede6]">
                            Continue practice
                            <ArrowRight size={14} />
                          </span>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-b border-white/8 py-8">
                <p className="text-[10px] uppercase tracking-[0.18em] text-[#5f5d58]">
                  Prep stats
                </p>
                <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  {[
                    {
                      label: "Questions solved",
                      value: formatCount(totalSolved),
                    },
                    { label: "Accuracy", value: `${accuracy}%` },
                    { label: "Day streak", value: String(streak) },
                    { label: "Bank covered", value: `${coverage}%` },
                  ].map((item, index) => (
                    <div
                      key={item.label}
                      className={`rounded-[14px] border border-white/8 bg-[#141414] px-5 py-5 text-center ${
                        index === 0
                          ? "shadow-[0_18px_40px_-28px_rgba(201,168,76,0.32)]"
                          : ""
                      }`}
                    >
                      <p
                        className={`text-[2.25rem] leading-none tracking-[-0.04em] ${
                          index === 0 ? "text-[#c9a84c]" : "text-[#f0ede6]"
                        }`}
                        style={{ fontFamily: "var(--font-display)" }}
                      >
                        {item.value}
                      </p>
                      <p className="mt-2 text-[11px] uppercase tracking-[0.14em] text-[#5f5d58]">
                        {item.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-b border-white/8 py-8">
                <p className="text-[10px] uppercase tracking-[0.18em] text-[#5f5d58]">
                  Achievements
                </p>
                <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                  {achievements.map(item => (
                    <div
                      key={item.title}
                      className={`rounded-[12px] border px-4 py-4 text-center ${
                        item.unlocked
                          ? "border-white/10 bg-[#141414]"
                          : "border-white/6 bg-[#141414]/70 opacity-45 grayscale"
                      }`}
                    >
                      <div
                        className={`mx-auto flex h-9 w-9 items-center justify-center rounded-[10px] ${
                          item.unlocked
                            ? "bg-[#1a1200] text-[#c9a84c]"
                            : "bg-[#181818] text-[#66635e]"
                        }`}
                      >
                        {item.title === "First solve" ? (
                          <Sparkles size={16} />
                        ) : item.title === "Streak builder" ? (
                          <Flame size={16} />
                        ) : item.title === "Sharp accuracy" ? (
                          <Shield size={16} />
                        ) : (
                          <Trophy size={16} />
                        )}
                      </div>
                      <p className="mt-3 text-sm font-medium text-[#f0ede6]">
                        {item.title}
                      </p>
                      <p className="mt-1 text-xs leading-5 text-[#66635e]">
                        {item.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="py-8">
                <p className="text-[10px] uppercase tracking-[0.18em] text-[#5f5d58]">
                  Profile visibility
                </p>
                <div className="mt-4 rounded-[14px] border border-white/8 bg-[#141414] px-5 py-5">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="rounded-[10px] border border-white/8 bg-[#1a1a1a] px-3 py-2 text-sm text-[#8a8880]">
                          @{settings.username}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            void copyHandle();
                          }}
                          className="inline-flex items-center gap-2 rounded-[10px] border border-white/10 px-3.5 py-2 text-sm text-[#f0ede6] transition hover:bg-white/[0.04]"
                        >
                          <Copy size={14} />
                          Copy handle
                        </button>
                      </div>
                      <p className="mt-4 max-w-[58ch] text-sm leading-6 text-[#8a8880]">
                        Public profile visibility is saved now and will be used
                        by PrepBros public profile surfaces as they roll out.
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm text-[#f0ede6]">Public profile</p>
                        <p className="text-xs text-[#66635e]">
                          {settings.publicProfile ? "Enabled" : "Private"}
                        </p>
                      </div>
                      <Switch
                        checked={settings.publicProfile}
                        onCheckedChange={checked =>
                          setSettings(current => ({
                            ...current,
                            publicProfile: checked,
                          }))
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
            </section>
          ) : null}

          {activeTab === "settings" ? (
            <section className="max-w-[720px] py-9">
              <div className="mb-8">
                <p className="text-[10px] uppercase tracking-[0.18em] text-[#5f5d58]">
                  Settings
                </p>
                <h2 className="mt-3 text-2xl tracking-[-0.04em] text-[#f0ede6]">
                  Personal and prep details
                </h2>
              </div>

              <div className="space-y-9">
                <div>
                  <p className="border-b border-white/8 pb-3 text-sm font-medium text-[#f0ede6]">
                    Personal info
                  </p>
                  <div className="mt-5 grid gap-5 md:grid-cols-2">
                    <SettingField label="Full name">
                      <Input
                        value={settings.fullName}
                        onChange={event =>
                          setSettings(current => ({
                            ...current,
                            fullName: event.target.value,
                          }))
                        }
                        placeholder="Your full name"
                        className={fieldClassName}
                      />
                    </SettingField>

                    <SettingField label="Username">
                      <Input
                        value={settings.username}
                        onChange={event =>
                          setSettings(current => ({
                            ...current,
                            username: event.target.value,
                          }))
                        }
                        placeholder="prepbros-user"
                        className={fieldClassName}
                      />
                    </SettingField>

                    <SettingField label="Location">
                      <Input
                        value={settings.location}
                        onChange={event =>
                          setSettings(current => ({
                            ...current,
                            location: event.target.value,
                          }))
                        }
                        placeholder="Hyderabad"
                        className={fieldClassName}
                      />
                    </SettingField>

                    <SettingField label="State">
                      <Input
                        value={settings.state}
                        onChange={event =>
                          setSettings(current => ({
                            ...current,
                            state: event.target.value,
                          }))
                        }
                        placeholder="Telangana"
                        className={fieldClassName}
                      />
                    </SettingField>

                    <SettingField
                      label="Bio"
                      hint="A short note about your prep focus."
                      fullWidth
                    >
                      <Textarea
                        value={settings.bio}
                        onChange={event =>
                          setSettings(current => ({
                            ...current,
                            bio: event.target.value,
                          }))
                        }
                        placeholder="Focused on consistent practice, revision, and better accuracy."
                        className={textareaClassName}
                      />
                    </SettingField>
                  </div>
                </div>

                <div>
                  <p className="border-b border-white/8 pb-3 text-sm font-medium text-[#f0ede6]">
                    Prep details
                  </p>
                  <div className="mt-5 grid gap-5 md:grid-cols-2">
                    <SettingField label="Target exam">
                      <select
                        value={settings.targetExam}
                        onChange={event =>
                          setSettings(current => ({
                            ...current,
                            targetExam: event.target.value,
                          }))
                        }
                        className={`${fieldClassName} w-full appearance-none`}
                      >
                        {EXAM_OPTIONS.map(exam => (
                          <option
                            key={exam}
                            value={exam}
                            className="bg-[#1a1a1a] text-[#f0ede6]"
                          >
                            {exam}
                          </option>
                        ))}
                      </select>
                    </SettingField>

                    <SettingField label="Prep level">
                      <select
                        value={settings.prepLevel}
                        onChange={event =>
                          setSettings(current => ({
                            ...current,
                            prepLevel: event.target.value,
                          }))
                        }
                        className={`${fieldClassName} w-full appearance-none`}
                      >
                        {PREP_LEVEL_OPTIONS.map(level => (
                          <option
                            key={level}
                            value={level}
                            className="bg-[#1a1a1a] text-[#f0ede6]"
                          >
                            {level}
                          </option>
                        ))}
                      </select>
                    </SettingField>

                    <SettingField
                      label="Daily goal"
                      hint="Set a realistic number of questions to aim for each day."
                    >
                      <Input
                        value={settings.dailyGoal}
                        onChange={event =>
                          setSettings(current => ({
                            ...current,
                            dailyGoal: clampGoal(event.target.value),
                          }))
                        }
                        inputMode="numeric"
                        className={`${fieldClassName} max-w-[200px]`}
                      />
                    </SettingField>
                  </div>
                </div>

                <div>
                  <p className="border-b border-white/8 pb-3 text-sm font-medium text-[#f0ede6]">
                    Preferences
                  </p>
                  <div className="mt-2">
                    <PreferenceRow
                      title="Public profile"
                      description="Use this preference for future public PrepBros profile surfaces."
                      checked={settings.publicProfile}
                      onCheckedChange={checked =>
                        setSettings(current => ({
                          ...current,
                          publicProfile: checked,
                        }))
                      }
                    />
                    <PreferenceRow
                      title="Email reminders"
                      description="Receive light nudges to stay consistent with practice."
                      checked={settings.emailReminders}
                      onCheckedChange={checked =>
                        setSettings(current => ({
                          ...current,
                          emailReminders: checked,
                        }))
                      }
                    />
                    <PreferenceRow
                      title="Weekly digest"
                      description="Get a simple summary of your recent progress."
                      checked={settings.weeklyDigest}
                      onCheckedChange={checked =>
                        setSettings(current => ({
                          ...current,
                          weeklyDigest: checked,
                        }))
                      }
                    />
                    <PreferenceRow
                      title="Streak alerts"
                      description="Get alerted when your streak is at risk."
                      checked={settings.streakAlerts}
                      onCheckedChange={checked =>
                        setSettings(current => ({
                          ...current,
                          streakAlerts: checked,
                        }))
                      }
                    />
                  </div>
                </div>

                <div>
                  <p className="border-b border-white/8 pb-3 text-sm font-medium text-[#f0ede6]">
                    Appearance
                  </p>
                  <div className="mt-5 flex items-center justify-between rounded-[14px] border border-white/8 bg-[#141414] px-4 py-4">
                    <div>
                      <p className="text-sm font-medium text-[#f0ede6]">
                        Theme
                      </p>
                      <p className="mt-1 text-sm text-[#8a8880]">
                        Change light, dark, or system theme for your workspace.
                      </p>
                    </div>
                    <ThemeToggle />
                  </div>
                </div>
              </div>
            </section>
          ) : null}

          {activeTab === "account" ? (
            <section className="max-w-[720px] py-9">
              <div className="mb-8">
                <p className="text-[10px] uppercase tracking-[0.18em] text-[#5f5d58]">
                  Account
                </p>
                <h2 className="mt-3 text-2xl tracking-[-0.04em] text-[#f0ede6]">
                  Subscription, identity, and access
                </h2>
              </div>

              <div className="space-y-9">
                <div>
                  <p className="border-b border-white/8 pb-3 text-sm font-medium text-[#f0ede6]">
                    Subscription
                  </p>
                  <div className="mt-2">
                    <AccountRow
                      label="Current plan"
                      detail="Free plan with access to daily practice, basic progress, and resources."
                      action={
                        <Link href="/premium">
                          <span className="inline-flex cursor-pointer items-center gap-2 rounded-[10px] bg-[#c9a84c] px-4 py-2.5 text-sm font-medium text-[#0e0e0e] transition hover:bg-[#f0c040]">
                            <Crown size={14} />
                            Upgrade to Pro
                          </span>
                        </Link>
                      }
                    />
                    <AccountRow
                      label="Question bank"
                      detail={`${formatCount(questions.length)} questions available in your current bank.`}
                      action={
                        <Link href="/practice">
                          <span className="inline-flex cursor-pointer items-center gap-2 rounded-[10px] border border-white/10 px-4 py-2.5 text-sm text-[#8a8880] transition hover:bg-white/[0.04] hover:text-[#f0ede6]">
                            Open practice
                            <ArrowRight size={14} />
                          </span>
                        </Link>
                      }
                    />
                  </div>
                </div>

                <div>
                  <p className="border-b border-white/8 pb-3 text-sm font-medium text-[#f0ede6]">
                    Account details
                  </p>
                  <div className="mt-2">
                    <AccountRow
                      label="Email"
                      detail={user.email || "Not available"}
                      action={
                        <span className="inline-flex items-center gap-2 rounded-[10px] border border-white/8 px-3 py-2 text-xs text-[#8a8880]">
                          <Mail size={13} />
                          Verified account
                        </span>
                      }
                    />
                    <AccountRow
                      label="Login method"
                      detail={toDisplayProvider(
                        String(user.app_metadata?.provider || "email")
                      )}
                    />
                    <AccountRow
                      label="Joined"
                      detail={formatDate(user.created_at)}
                    />
                    <AccountRow
                      label="Last active"
                      detail={formatDate(profile?.last_active)}
                    />
                  </div>
                </div>

                <div>
                  <p className="border-b border-white/8 pb-3 text-sm font-medium text-[#f0ede6]">
                    Actions
                  </p>
                  <div className="mt-5 flex flex-wrap gap-3">
                    <Link href="/dashboard">
                      <span className="inline-flex cursor-pointer items-center gap-2 rounded-[10px] border border-white/10 px-4 py-2.5 text-sm text-[#8a8880] transition hover:bg-white/[0.04] hover:text-[#f0ede6]">
                        Open dashboard
                      </span>
                    </Link>
                    <Link href="/support">
                      <span className="inline-flex cursor-pointer items-center gap-2 rounded-[10px] border border-white/10 px-4 py-2.5 text-sm text-[#8a8880] transition hover:bg-white/[0.04] hover:text-[#f0ede6]">
                        Contact support
                      </span>
                    </Link>
                    <button
                      type="button"
                      onClick={() => signOut()}
                      className="inline-flex items-center gap-2 rounded-[10px] border border-[rgba(217,91,91,0.28)] px-4 py-2.5 text-sm text-[#d95b5b] transition hover:bg-[rgba(217,91,91,0.08)]"
                    >
                      <LogOut size={14} />
                      Sign out
                    </button>
                  </div>
                </div>
              </div>
            </section>
          ) : null}

          <div className="mt-2 border-t border-white/8 pt-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <p
                className={`text-sm ${
                  saveNotice?.tone === "error"
                    ? "text-[#d95b5b]"
                    : "text-[#8a8880]"
                }`}
              >
                {saveNotice?.message ||
                  "Changes sync across your PrepBros account when you save them."}
              </p>

              <button
                type="button"
                onClick={() => {
                  void saveSettings();
                }}
                disabled={saving}
                className="inline-flex min-w-[168px] items-center justify-center gap-2 rounded-[10px] bg-[#c9a84c] px-5 py-3 text-sm font-medium text-[#0e0e0e] transition hover:bg-[#f0c040] disabled:opacity-70"
              >
                {saving ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    Saving
                  </>
                ) : (
                  "Save changes"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
