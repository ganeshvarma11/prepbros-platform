import { useEffect, useState, type ReactNode } from "react";
import { Loader2, LogOut } from "lucide-react";
import { Link } from "wouter";

import AppShell from "@/components/AppShell";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
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

const surfaceClassName =
  "rounded-[34px] bg-[linear-gradient(180deg,rgba(18,18,22,0.88)_0%,rgba(12,12,16,0.92)_100%)] px-6 py-8 shadow-[0_40px_120px_-72px_rgba(0,0,0,0.92)] md:px-10 md:py-12";
const fieldClassName =
  "h-[52px] rounded-[18px] border-transparent bg-white/[0.045] px-4 text-[15px] text-[var(--text-primary)] shadow-none placeholder:text-[var(--text-faint)] focus-visible:border-transparent focus-visible:ring-[2px] focus-visible:ring-[var(--brand)]/45";
const textareaClassName =
  "min-h-[136px] rounded-[22px] border-transparent bg-white/[0.045] px-4 py-3.5 text-[15px] text-[var(--text-primary)] shadow-none placeholder:text-[var(--text-faint)] focus-visible:border-transparent focus-visible:ring-[2px] focus-visible:ring-[var(--brand)]/45";

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
  publicProfile: boolean;
  emailReminders: boolean;
  weeklyDigest: boolean;
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
  publicProfile: true,
  emailReminders: true,
  weeklyDigest: true,
};

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
  location: settings.location.trim(),
  state: settings.state.trim(),
  bio: settings.bio.trim(),
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
    location: String(metadata.location || ""),
    state: String(profile?.state || metadata.state || ""),
    bio: String(metadata.bio || ""),
    dailyGoal: String(metadata.daily_goal || "12"),
    publicProfile:
      typeof metadata.public_profile === "boolean" ? metadata.public_profile : true,
    emailReminders:
      typeof metadata.email_reminders === "boolean" ? metadata.email_reminders : true,
    weeklyDigest:
      typeof metadata.weekly_digest === "boolean" ? metadata.weekly_digest : true,
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
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
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
      <label className="block text-sm font-medium text-[var(--text-secondary)]">{label}</label>
      {hint ? <p className="mt-2 text-sm text-[var(--text-faint)]">{hint}</p> : null}
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
    <div className="flex items-center justify-between gap-4 rounded-[22px] bg-white/[0.035] px-4 py-4">
      <div className="pr-4">
        <p className="text-sm font-medium text-[var(--text-primary)]">{title}</p>
        <p className="mt-1 text-sm text-[var(--text-faint)]">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-[22px] bg-white/[0.035] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <span className="text-sm text-[var(--text-faint)]">{label}</span>
      <span className="text-sm font-medium text-[var(--text-primary)]">{value}</span>
    </div>
  );
}

export default function Profile() {
  const { user, loading, signOut } = useAuth();
  const [pageLoading, setPageLoading] = useState(true);
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [settings, setSettings] = useState<EditableSettings>(defaultSettings);
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
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      const nextProfile = (data || null) as ProfileRow | null;

      setProfile(nextProfile);
      setSettings(buildSettings(nextProfile, user));
      setPageLoading(false);
    };

    load();
  }, [loading, user]);

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
      public_profile: nextSettings.publicProfile,
      email_reminders: nextSettings.emailReminders,
      weekly_digest: nextSettings.weeklyDigest,
    };

    setSettings(nextSettings);
    setSaving(true);
    setSaveNotice(null);

    const { error: authError } = await supabase.auth.updateUser({ data: metadataPayload });
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
      setProfile((current) => ({ ...(current || {}), ...profilePayload }));
    } else {
      console.error("Profile table sync failed:", profileError);
    }

    setSaveNotice({
      tone: "success",
      message: "Changes saved.",
    });
    setSaving(false);
  };

  if (loading || pageLoading) {
    return (
      <AppShell>
        <div className="flex min-h-[62vh] items-center justify-center">
          <div className="inline-flex items-center gap-3 rounded-full bg-white/[0.05] px-5 py-3 text-sm text-[var(--text-secondary)]">
            <Loader2 size={16} className="animate-spin text-[var(--brand)]" />
            Loading settings...
          </div>
        </div>
      </AppShell>
    );
  }

  if (!user) {
    return (
      <AppShell>
        <div className="mx-auto max-w-2xl py-14">
          <div className={`${surfaceClassName} text-center`}>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--text-faint)]">
              Profile settings
            </p>
            <h1 className="mt-5 text-4xl font-semibold tracking-[-0.06em] text-[var(--text-primary)]">
              Sign in to manage your account.
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-[var(--text-muted)]">
              Your profile, preferences, and account details live in one place.
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
      <div className="mx-auto max-w-3xl pb-10 pt-2 md:pb-14">
        <div className={surfaceClassName}>
          <header className="space-y-4 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[var(--text-faint)]">
              Settings
            </p>
            <div className="space-y-3">
              <h1 className="text-[2.2rem] font-semibold tracking-[-0.07em] text-[var(--text-primary)] md:text-[3rem]">
                {settings.fullName}
              </h1>
              <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-sm text-[var(--text-muted)]">
                <span>{user.email}</span>
                <span className="text-[var(--text-faint)]">/</span>
                <span>{settings.targetExam}</span>
              </div>
            </div>
            <p className="mx-auto max-w-xl text-sm leading-7 text-[var(--text-muted)]">
              A clean, quiet settings space focused on the details you actually update.
            </p>
          </header>

          <Tabs defaultValue="general" className="mt-12 gap-0">
            <TabsList className="mx-auto h-auto rounded-full bg-white/[0.035] p-1">
              <TabsTrigger
                value="general"
                className="rounded-full border-0 px-5 py-2.5 text-sm text-[var(--text-muted)] shadow-none data-[state=active]:bg-white/[0.08] data-[state=active]:text-[var(--text-primary)] data-[state=active]:shadow-none dark:data-[state=active]:bg-white/[0.08]"
              >
                General
              </TabsTrigger>
              <TabsTrigger
                value="preferences"
                className="rounded-full border-0 px-5 py-2.5 text-sm text-[var(--text-muted)] shadow-none data-[state=active]:bg-white/[0.08] data-[state=active]:text-[var(--text-primary)] data-[state=active]:shadow-none dark:data-[state=active]:bg-white/[0.08]"
              >
                Preferences
              </TabsTrigger>
              <TabsTrigger
                value="account"
                className="rounded-full border-0 px-5 py-2.5 text-sm text-[var(--text-muted)] shadow-none data-[state=active]:bg-white/[0.08] data-[state=active]:text-[var(--text-primary)] data-[state=active]:shadow-none dark:data-[state=active]:bg-white/[0.08]"
              >
                Account
              </TabsTrigger>
            </TabsList>

            <div className="mt-12">
              <TabsContent value="general" className="mt-0">
                <div className="grid gap-x-6 gap-y-10 md:grid-cols-2">
                  <Field label="Name">
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

                  <Field label="Exam">
                    <select
                      value={settings.targetExam}
                      onChange={(event) =>
                        setSettings((current) => ({ ...current, targetExam: event.target.value }))
                      }
                      className={`${fieldClassName} w-full appearance-none pr-10 outline-none`}
                    >
                      {EXAM_OPTIONS.map((exam) => (
                        <option key={exam} value={exam} className="bg-[var(--bg-card-strong)] text-[var(--text-primary)]">
                          {exam}
                        </option>
                      ))}
                    </select>
                  </Field>

                  <Field label="Location">
                    <Input
                      value={settings.location}
                      onChange={(event) =>
                        setSettings((current) => ({ ...current, location: event.target.value }))
                      }
                      placeholder="Hyderabad"
                      className={fieldClassName}
                    />
                  </Field>

                  <Field label="State">
                    <Input
                      value={settings.state}
                      onChange={(event) =>
                        setSettings((current) => ({ ...current, state: event.target.value }))
                      }
                      placeholder="Telangana"
                      className={fieldClassName}
                    />
                  </Field>

                  <Field
                    label="Bio"
                    hint="A short note about your prep focus."
                    fullWidth
                  >
                    <Textarea
                      value={settings.bio}
                      onChange={(event) =>
                        setSettings((current) => ({ ...current, bio: event.target.value }))
                      }
                      placeholder="Focused on consistent revision, topic-wise practice, and cleaner study systems."
                      className={textareaClassName}
                    />
                  </Field>
                </div>
              </TabsContent>

              <TabsContent value="preferences" className="mt-0">
                <div className="space-y-8">
                  <Field
                    label="Daily goal"
                    hint="Set a realistic number of questions you want to aim for each day."
                  >
                    <Input
                      value={settings.dailyGoal}
                      onChange={(event) =>
                        setSettings((current) => ({
                          ...current,
                          dailyGoal: clampGoal(event.target.value),
                        }))
                      }
                      inputMode="numeric"
                      className={`${fieldClassName} max-w-[180px]`}
                    />
                  </Field>

                  <div className="space-y-3">
                    <PreferenceRow
                      title="Public profile"
                      description="Keep your profile ready for any future public surfaces."
                      checked={settings.publicProfile}
                      onCheckedChange={(checked) =>
                        setSettings((current) => ({ ...current, publicProfile: checked }))
                      }
                    />
                    <PreferenceRow
                      title="Email reminders"
                      description="Receive light nudges to stay consistent with practice."
                      checked={settings.emailReminders}
                      onCheckedChange={(checked) =>
                        setSettings((current) => ({ ...current, emailReminders: checked }))
                      }
                    />
                    <PreferenceRow
                      title="Weekly digest"
                      description="Get a simple summary of your recent progress."
                      checked={settings.weeklyDigest}
                      onCheckedChange={(checked) =>
                        setSettings((current) => ({ ...current, weeklyDigest: checked }))
                      }
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="account" className="mt-0">
                <div className="space-y-3">
                  <MetaRow label="Email" value={user.email || "Not available"} />
                  <MetaRow
                    label="Login method"
                    value={toDisplayProvider(String(user.app_metadata?.provider || "email"))}
                  />
                  <MetaRow label="Joined" value={formatDate(user.created_at)} />
                  <MetaRow label="Last active" value={formatDate(profile?.last_active)} />
                </div>

                <div className="mt-8">
                  <button
                    type="button"
                    onClick={() => signOut()}
                    className="inline-flex items-center gap-2 text-sm text-[var(--text-muted)] transition hover:text-[var(--text-primary)]"
                  >
                    <LogOut size={14} />
                    Sign out
                  </button>
                </div>
              </TabsContent>
            </div>
          </Tabs>

          <div className="mt-12 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p
              className={`text-sm ${
                saveNotice?.tone === "error" ? "text-[var(--red)]" : "text-[var(--text-muted)]"
              }`}
            >
              {saveNotice?.message || "Changes sync across your PrepBros account."}
            </p>

            <button
              type="button"
              onClick={() => saveSettings()}
              disabled={saving}
              className="btn-primary min-w-[172px] rounded-full px-6 py-3"
            >
              {saving ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  Saving
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
