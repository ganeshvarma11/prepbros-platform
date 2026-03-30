import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type ReactNode,
} from "react";
import {
  ArrowRight,
  Copy,
  Crown,
  Flame,
  ImagePlus,
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
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
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
const PROFILE_MEDIA_BUCKET = "profile-media";
const MAX_MEDIA_SIZE_BYTES = 5 * 1024 * 1024;

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

type CropState = {
  open: boolean;
  kind: "avatar" | "banner";
  fileName: string;
  objectUrl: string;
  naturalWidth: number;
  naturalHeight: number;
  zoom: number;
  offsetX: number;
  offsetY: number;
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
  "h-[46px] rounded-[16px] border border-[var(--border)] bg-[var(--surface-1)] px-4 text-[14px] text-[var(--text-primary)] shadow-none placeholder:text-[var(--text-faint)] focus-visible:border-[var(--border-strong)] focus-visible:bg-[var(--surface-2)] focus-visible:ring-0";
const textareaClassName =
  "min-h-[110px] rounded-[16px] border border-[var(--border)] bg-[var(--surface-1)] px-4 py-3 text-[14px] text-[var(--text-primary)] shadow-none placeholder:text-[var(--text-faint)] focus-visible:border-[var(--border-strong)] focus-visible:bg-[var(--surface-2)] focus-visible:ring-0";

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

const getCropConfig = (kind: "avatar" | "banner") =>
  kind === "avatar"
    ? {
        previewWidth: 280,
        previewHeight: 280,
        outputWidth: 720,
        outputHeight: 720,
      }
    : {
        previewWidth: 420,
        previewHeight: 180,
        outputWidth: 1500,
        outputHeight: 640,
      };

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
      <label className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-faint)]">
        {label}
      </label>
      {hint ? (
        <p className="mt-2 text-sm text-[var(--text-secondary)]">{hint}</p>
      ) : null}
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
    <div className="flex items-center justify-between gap-4 border-b border-[var(--border)] py-4">
      <div className="pr-4">
        <p className="text-sm font-semibold text-[var(--text-primary)]">
          {title}
        </p>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          {description}
        </p>
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
    <div className="flex flex-col gap-4 border-b border-[var(--border)] py-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm font-semibold text-[var(--text-primary)]">
          {label}
        </p>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">{detail}</p>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

const isValidImageFile = (file: File) => file.type.startsWith("image/");

const loadImageDimensions = (src: string) =>
  new Promise<{ width: number; height: number }>((resolve, reject) => {
    const image = new Image();
    image.onload = () =>
      resolve({ width: image.naturalWidth, height: image.naturalHeight });
    image.onerror = () => reject(new Error("Failed to load image."));
    image.src = src;
  });

const buildMediaPath = ({
  userId,
  kind,
}: {
  userId: string;
  kind: "avatar" | "banner";
}) => `${kind}s/${userId}/${kind}.jpg`;

const getStoragePathFromUrl = (url: string) => {
  if (!url) return null;

  try {
    const parsed = new URL(url);
    const marker = `/storage/v1/object/public/${PROFILE_MEDIA_BUCKET}/`;
    const pathname = parsed.pathname;
    const index = pathname.indexOf(marker);
    if (index === -1) return null;
    return decodeURIComponent(pathname.slice(index + marker.length));
  } catch {
    return null;
  }
};

const exportCroppedImage = async ({ crop }: { crop: CropState }) => {
  const config = getCropConfig(crop.kind);
  const image = new Image();
  image.src = crop.objectUrl;

  await new Promise((resolve, reject) => {
    image.onload = resolve;
    image.onerror = reject;
  });

  const canvas = document.createElement("canvas");
  canvas.width = config.outputWidth;
  canvas.height = config.outputHeight;
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Canvas is not supported in this browser.");
  }

  const baseScale = Math.max(
    config.outputWidth / crop.naturalWidth,
    config.outputHeight / crop.naturalHeight
  );
  const scale = baseScale * crop.zoom;
  const scaledWidth = crop.naturalWidth * scale;
  const scaledHeight = crop.naturalHeight * scale;
  const maxOffsetX = Math.max(0, (scaledWidth - config.outputWidth) / 2);
  const maxOffsetY = Math.max(0, (scaledHeight - config.outputHeight) / 2);
  const translateX = (crop.offsetX / 100) * maxOffsetX;
  const translateY = (crop.offsetY / 100) * maxOffsetY;
  const drawX = (config.outputWidth - scaledWidth) / 2 + translateX;
  const drawY = (config.outputHeight - scaledHeight) / 2 + translateY;

  context.fillStyle = "#111111";
  context.fillRect(0, 0, config.outputWidth, config.outputHeight);
  context.drawImage(image, drawX, drawY, scaledWidth, scaledHeight);

  const blob = await new Promise<Blob | null>(resolve =>
    canvas.toBlob(resolve, "image/jpeg", 0.86)
  );

  if (!blob) {
    throw new Error("Failed to prepare the cropped image.");
  }

  return new File([blob], `${crop.kind}.jpg`, {
    type: "image/jpeg",
  });
};

export default function Profile() {
  const { user, loading, signOut } = useAuth();
  const { questions, syncing: questionsSyncing } = useQuestionBank();
  const avatarInputRef = useRef<HTMLInputElement | null>(null);
  const bannerInputRef = useRef<HTMLInputElement | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [answers, setAnswers] = useState<
    Awaited<ReturnType<typeof getAnswerAttempts>>
  >([]);
  const [settings, setSettings] = useState<EditableSettings>(defaultSettings);
  const [activeTab, setActiveTab] = useState<ActiveTab>("profile");
  const [saving, setSaving] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [bannerUrl, setBannerUrl] = useState("");
  const [uploadingMedia, setUploadingMedia] = useState<{
    avatar: boolean;
    banner: boolean;
  }>({ avatar: false, banner: false });
  const [cropState, setCropState] = useState<CropState | null>(null);
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
      setAvatarUrl(
        String(
          user.user_metadata?.avatar_url ||
            user.user_metadata?.picture ||
            user.user_metadata?.avatar ||
            ""
        )
      );
      setBannerUrl(String(user.user_metadata?.banner_url || ""));
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
      avatar_url: avatarUrl || null,
      banner_url: bannerUrl || null,
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

  const updateProfileMedia = async ({
    avatar,
    banner,
  }: {
    avatar?: string | null;
    banner?: string | null;
  }) => {
    if (!user) return { error: new Error("No active user session.") };

    const metadata = user.user_metadata || {};
    const payload = {
      ...metadata,
      ...(avatar !== undefined ? { avatar_url: avatar } : {}),
      ...(banner !== undefined ? { banner_url: banner } : {}),
    };

    const { error } = await supabase.auth.updateUser({
      data: payload,
    });

    return { error };
  };

  const uploadMedia = async ({
    file,
    kind,
    previousUrl,
  }: {
    file: File;
    kind: "avatar" | "banner";
    previousUrl?: string;
  }) => {
    if (!user) return false;

    if (!isValidImageFile(file)) {
      setSaveNotice({
        tone: "error",
        message: "Please choose an image file for your profile media.",
      });
      return false;
    }

    if (file.size > MAX_MEDIA_SIZE_BYTES) {
      setSaveNotice({
        tone: "error",
        message: "Please choose an image smaller than 5 MB.",
      });
      return false;
    }

    setUploadingMedia(current => ({ ...current, [kind]: true }));
    setSaveNotice(null);

    const path = buildMediaPath({ userId: user.id, kind });
    const { error: uploadError } = await supabase.storage
      .from(PROFILE_MEDIA_BUCKET)
      .upload(path, file, {
        upsert: true,
        cacheControl: "3600",
        contentType: "image/jpeg",
      });

    if (uploadError) {
      setSaveNotice({
        tone: "error",
        message:
          uploadError.message.includes("Bucket not found") ||
          uploadError.message.includes("not found")
            ? "The profile-media storage bucket is not set up in Supabase yet."
            : "We couldn't upload that image right now. Please try again.",
      });
      setUploadingMedia(current => ({ ...current, [kind]: false }));
      return false;
    }

    const { data } = supabase.storage
      .from(PROFILE_MEDIA_BUCKET)
      .getPublicUrl(path);
    const nextUrl = `${data.publicUrl}?t=${Date.now()}`;
    const { error: metadataError } = await updateProfileMedia({
      avatar: kind === "avatar" ? nextUrl : undefined,
      banner: kind === "banner" ? nextUrl : undefined,
    });

    if (metadataError) {
      setSaveNotice({
        tone: "error",
        message: "Image uploaded, but saving it to your profile failed.",
      });
      setUploadingMedia(current => ({ ...current, [kind]: false }));
      return false;
    }

    if (kind === "avatar") {
      setAvatarUrl(nextUrl);
    } else {
      setBannerUrl(nextUrl);
    }

    const previousPath = previousUrl
      ? getStoragePathFromUrl(previousUrl)
      : null;
    if (previousPath && previousPath !== path) {
      const { error: removeOldError } = await supabase.storage
        .from(PROFILE_MEDIA_BUCKET)
        .remove([previousPath]);
      if (removeOldError) {
        console.error("Old media cleanup failed:", removeOldError);
      }
    }

    setSaveNotice({
      tone: "success",
      message: `${kind === "avatar" ? "Profile photo" : "Banner image"} updated.`,
    });
    setUploadingMedia(current => ({ ...current, [kind]: false }));
    return true;
  };

  const handleMediaSelection =
    (kind: "avatar" | "banner") =>
    async (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      event.target.value = "";
      if (!file) return;

      if (!isValidImageFile(file)) {
        setSaveNotice({
          tone: "error",
          message: "Please choose an image file for your profile media.",
        });
        return;
      }

      if (file.size > MAX_MEDIA_SIZE_BYTES) {
        setSaveNotice({
          tone: "error",
          message: "Please choose an image smaller than 5 MB.",
        });
        return;
      }

      const objectUrl = URL.createObjectURL(file);

      try {
        const dimensions = await loadImageDimensions(objectUrl);
        setCropState({
          open: true,
          kind,
          fileName: file.name,
          objectUrl,
          naturalWidth: dimensions.width,
          naturalHeight: dimensions.height,
          zoom: 1,
          offsetX: 0,
          offsetY: 0,
        });
      } catch {
        URL.revokeObjectURL(objectUrl);
        setSaveNotice({
          tone: "error",
          message: "We couldn't prepare that image. Please try another file.",
        });
      }
    };

  const removeMedia = async (kind: "avatar" | "banner") => {
    setUploadingMedia(current => ({ ...current, [kind]: true }));
    const currentUrl = kind === "avatar" ? avatarUrl : bannerUrl;
    const { error } = await updateProfileMedia({
      avatar: kind === "avatar" ? null : undefined,
      banner: kind === "banner" ? null : undefined,
    });

    if (error) {
      setSaveNotice({
        tone: "error",
        message: `We couldn't remove the ${kind} image right now.`,
      });
      setUploadingMedia(current => ({ ...current, [kind]: false }));
      return;
    }

    if (kind === "avatar") {
      setAvatarUrl("");
    } else {
      setBannerUrl("");
    }

    const storagePath = getStoragePathFromUrl(currentUrl);
    if (storagePath) {
      const { error: removeError } = await supabase.storage
        .from(PROFILE_MEDIA_BUCKET)
        .remove([storagePath]);
      if (removeError) {
        console.error("Storage cleanup failed:", removeError);
      }
    }

    setSaveNotice({
      tone: "success",
      message: `${kind === "avatar" ? "Profile photo" : "Banner image"} removed.`,
    });
    setUploadingMedia(current => ({ ...current, [kind]: false }));
  };

  const closeCropDialog = () => {
    if (cropState?.objectUrl) {
      URL.revokeObjectURL(cropState.objectUrl);
    }
    setCropState(null);
  };

  const confirmCrop = async () => {
    if (!cropState) return;

    try {
      const processedFile = await exportCroppedImage({ crop: cropState });
      const uploaded = await uploadMedia({
        file: processedFile,
        kind: cropState.kind,
        previousUrl: cropState.kind === "avatar" ? avatarUrl : bannerUrl,
      });
      if (uploaded) {
        closeCropDialog();
      }
    } catch {
      setSaveNotice({
        tone: "error",
        message: "We couldn't crop that image. Please try again.",
      });
    }
  };

  if (loading || pageLoading || questionsSyncing) {
    return (
      <AppShell>
        <div className="flex min-h-[62vh] items-center justify-center">
          <div className="inline-flex items-center gap-3 rounded-full border border-[var(--border)] bg-[var(--surface-1)] px-5 py-3 text-sm text-[var(--text-secondary)] shadow-[var(--shadow-sm)]">
            <Loader2 size={16} className="animate-spin text-[var(--brand)]" />
            Loading profile...
          </div>
        </div>
      </AppShell>
    );
  }

  if (!user) {
    return (
      <AppShell>
        <div className="mx-auto max-w-2xl py-14">
          <PageEmpty
            title="Sign in to manage your profile"
            description="Your profile, preferences, and account details live in one quiet workspace."
            actionLabel="Back to home"
            actionHref="/"
            className="rounded-[24px] border-[var(--border)] bg-[var(--bg-card)] py-14"
          />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell contentClassName="max-w-none">
      <div className="relative overflow-x-clip">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.76),transparent_34%),radial-gradient(circle_at_80%_18%,rgba(191,219,254,0.24),transparent_25%)] dark:bg-[radial-gradient(circle_at_top_left,rgba(148,163,184,0.1),transparent_34%),radial-gradient(circle_at_80%_18%,rgba(59,130,246,0.12),transparent_25%)]" />
        <div className="pointer-events-none absolute inset-0 opacity-[0.16] [background-image:linear-gradient(to_right,rgba(148,163,184,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.08)_1px,transparent_1px)] [background-size:150px_150px] dark:opacity-[0.08]" />

        <div className="relative z-10 mx-auto w-full max-w-[1120px] pb-10">
          <input
            ref={avatarInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleMediaSelection("avatar")}
          />
          <input
            ref={bannerInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleMediaSelection("banner")}
          />
          <Dialog
            open={Boolean(cropState?.open)}
            onOpenChange={open => {
              if (!open) closeCropDialog();
            }}
          >
            <DialogContent className="max-w-[min(92vw,720px)] border-[var(--border)] bg-[var(--bg-card)] p-0 text-[var(--text-primary)]">
              {cropState ? (
                <>
                  <DialogHeader className="border-b border-[var(--border)] px-6 py-5">
                    <DialogTitle className="text-xl tracking-[-0.03em] text-[var(--text-primary)]">
                      Crop{" "}
                      {cropState.kind === "avatar" ? "profile photo" : "banner"}
                    </DialogTitle>
                    <DialogDescription className="text-sm text-[var(--text-secondary)]">
                      Adjust the framing before upload. The image will be
                      compressed automatically for faster loading.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="px-6 py-5">
                    {(() => {
                      const config = getCropConfig(cropState.kind);
                      const baseScale = Math.max(
                        config.previewWidth / cropState.naturalWidth,
                        config.previewHeight / cropState.naturalHeight
                      );
                      const scale = baseScale * cropState.zoom;
                      const scaledWidth = cropState.naturalWidth * scale;
                      const scaledHeight = cropState.naturalHeight * scale;
                      const maxOffsetX = Math.max(
                        0,
                        (scaledWidth - config.previewWidth) / 2
                      );
                      const maxOffsetY = Math.max(
                        0,
                        (scaledHeight - config.previewHeight) / 2
                      );
                      const translateX = (cropState.offsetX / 100) * maxOffsetX;
                      const translateY = (cropState.offsetY / 100) * maxOffsetY;

                      return (
                        <>
                          <div className="flex justify-center">
                            <div
                              className="relative overflow-hidden rounded-[18px] border border-[var(--border)] bg-[var(--surface-1)] shadow-[var(--shadow-md)]"
                              style={{
                                width: config.previewWidth,
                                height: config.previewHeight,
                              }}
                            >
                              <img
                                src={cropState.objectUrl}
                                alt={cropState.fileName}
                                className="pointer-events-none absolute left-1/2 top-1/2 max-w-none select-none"
                                style={{
                                  width: scaledWidth,
                                  height: scaledHeight,
                                  transform: `translate(calc(-50% + ${translateX}px), calc(-50% + ${translateY}px))`,
                                }}
                              />
                              <div className="pointer-events-none absolute inset-0 border border-[var(--border)]" />
                            </div>
                          </div>

                          <div className="mt-6 space-y-5">
                            <div>
                              <div className="mb-2 flex items-center justify-between text-sm">
                                <span className="text-[var(--text-primary)]">
                                  Zoom
                                </span>
                                <span className="text-[var(--text-secondary)]">
                                  {cropState.zoom.toFixed(2)}x
                                </span>
                              </div>
                              <Slider
                                value={[cropState.zoom]}
                                min={1}
                                max={2.5}
                                step={0.01}
                                onValueChange={([value]) =>
                                  setCropState(current =>
                                    current
                                      ? { ...current, zoom: value }
                                      : current
                                  )
                                }
                                className="[&_[data-slot=slider-range]]:bg-[var(--brand)]"
                              />
                            </div>

                            <div>
                              <div className="mb-2 flex items-center justify-between text-sm">
                                <span className="text-[var(--text-primary)]">
                                  Horizontal
                                </span>
                                <span className="text-[var(--text-secondary)]">
                                  {cropState.offsetX}%
                                </span>
                              </div>
                              <Slider
                                value={[cropState.offsetX]}
                                min={-100}
                                max={100}
                                step={1}
                                onValueChange={([value]) =>
                                  setCropState(current =>
                                    current
                                      ? { ...current, offsetX: value }
                                      : current
                                  )
                                }
                                className="[&_[data-slot=slider-range]]:bg-[var(--brand)]"
                              />
                            </div>

                            <div>
                              <div className="mb-2 flex items-center justify-between text-sm">
                                <span className="text-[var(--text-primary)]">
                                  Vertical
                                </span>
                                <span className="text-[var(--text-secondary)]">
                                  {cropState.offsetY}%
                                </span>
                              </div>
                              <Slider
                                value={[cropState.offsetY]}
                                min={-100}
                                max={100}
                                step={1}
                                onValueChange={([value]) =>
                                  setCropState(current =>
                                    current
                                      ? { ...current, offsetY: value }
                                      : current
                                  )
                                }
                                className="[&_[data-slot=slider-range]]:bg-[var(--brand)]"
                              />
                            </div>
                          </div>
                        </>
                      );
                    })()}
                  </div>

                  <DialogFooter className="border-t border-[var(--border)] px-6 py-5 sm:justify-between">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={closeCropDialog}
                      className="border border-[var(--border)] bg-transparent text-[var(--text-secondary)] hover:bg-[var(--surface-1)] hover:text-[var(--text-primary)]"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      onClick={() => {
                        void confirmCrop();
                      }}
                      className="bg-[var(--brand)] text-[var(--text-on-brand)] hover:bg-[var(--brand-light)]"
                    >
                      Use image
                    </Button>
                  </DialogFooter>
                </>
              ) : null}
            </DialogContent>
          </Dialog>

          <div className="sticky top-0 z-20 mb-6 rounded-[24px] border border-[var(--border-2)] bg-[var(--bg-card)] px-3 py-2 shadow-[var(--shadow-sm)] backdrop-blur-xl md:px-4">
            <div className="flex items-center gap-2 overflow-x-auto">
              {[
                { key: "profile", label: "Profile" },
                { key: "settings", label: "Settings" },
                { key: "account", label: "Account" },
              ].map(item => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setActiveTab(item.key as ActiveTab)}
                  className={`inline-flex items-center rounded-full border px-4 py-2.5 text-sm font-semibold transition ${
                    activeTab === item.key
                      ? "border-[var(--border-2)] bg-[var(--surface-2)] text-[var(--text-primary)] shadow-[var(--shadow-sm)]"
                      : "border-transparent bg-transparent text-[var(--text-secondary)] hover:bg-[var(--surface-1)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {activeTab === "profile" ? (
            <section className="overflow-hidden">
              <div className="relative h-[190px] overflow-hidden rounded-[28px] border border-[var(--border)] bg-[linear-gradient(135deg,#eef4fb_0%,#dfeaf6_38%,#eef4fb_100%)] dark:bg-[linear-gradient(135deg,#0f172a_0%,#1e293b_38%,#0f172a_100%)]">
                {bannerUrl ? (
                  <img
                    src={bannerUrl}
                    alt={`${displayName} banner`}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                ) : null}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(15,23,42,0.08),transparent_55%),radial-gradient(circle_at_80%_30%,rgba(37,99,235,0.08),transparent_45%)] dark:bg-[radial-gradient(circle_at_20%_50%,rgba(255,255,255,0.08),transparent_55%),radial-gradient(circle_at_80%_30%,rgba(147,197,253,0.08),transparent_45%)]" />
                <div className="absolute inset-0 opacity-[0.12] [background-image:linear-gradient(to_right,rgba(148,163,184,0.18)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.14)_1px,transparent_1px)] [background-size:180px_180px]" />
                <div className="absolute right-4 top-4 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => bannerInputRef.current?.click()}
                    disabled={uploadingMedia.banner}
                    className="inline-flex items-center gap-2 rounded-[10px] border border-[var(--border)] bg-[color:rgba(255,255,255,0.68)] px-3 py-2 text-xs text-[var(--text-primary)] backdrop-blur-sm transition hover:bg-[color:rgba(255,255,255,0.86)] disabled:opacity-70 dark:bg-[color:rgba(2,6,23,0.48)] dark:hover:bg-[color:rgba(2,6,23,0.68)]"
                  >
                    {uploadingMedia.banner ? (
                      <Loader2 size={13} className="animate-spin" />
                    ) : (
                      <ImagePlus size={13} />
                    )}
                    {bannerUrl ? "Change banner" : "Upload banner"}
                  </button>
                  {bannerUrl ? (
                    <button
                      type="button"
                      onClick={() => {
                        void removeMedia("banner");
                      }}
                      disabled={uploadingMedia.banner}
                      className="inline-flex items-center gap-2 rounded-[10px] border border-[var(--border)] bg-[color:rgba(255,255,255,0.68)] px-3 py-2 text-xs text-[var(--text-primary)] backdrop-blur-sm transition hover:bg-[color:rgba(255,255,255,0.86)] disabled:opacity-70 dark:bg-[color:rgba(2,6,23,0.48)] dark:hover:bg-[color:rgba(2,6,23,0.68)]"
                    >
                      Remove
                    </button>
                  ) : null}
                </div>
              </div>

              <div className="border-b border-[var(--border)] px-0 pb-8">
                <div className="px-0">
                  <div className="mx-auto max-w-[1120px]">
                    <div className="-mt-10 flex flex-col gap-6 px-0 sm:-mt-12 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0">
                        <div className="relative flex h-[88px] w-[88px] items-center justify-center overflow-hidden rounded-full border-[3px] border-[var(--bg-base)] bg-[var(--surface-2)] text-[30px] text-[var(--brand)] shadow-[var(--shadow-lg)]">
                          {avatarUrl ? (
                            <img
                              src={avatarUrl}
                              alt={displayName}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <span style={{ fontFamily: "var(--font-display)" }}>
                              {getInitials(displayName)}
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => avatarInputRef.current?.click()}
                            disabled={uploadingMedia.avatar}
                            className="absolute bottom-0 right-0 inline-flex h-7 w-7 items-center justify-center rounded-full border-2 border-[var(--bg-base)] bg-[var(--brand)] text-[var(--text-on-brand)] transition hover:bg-[var(--brand-light)] disabled:opacity-70"
                            aria-label="Upload profile photo"
                          >
                            {uploadingMedia.avatar ? (
                              <Loader2 size={12} className="animate-spin" />
                            ) : (
                              <PencilLine size={12} />
                            )}
                          </button>
                        </div>

                        <div className="mt-4">
                          <h1
                            className="text-[2rem] leading-none tracking-[-0.04em] text-[var(--text-primary)] sm:text-[2.2rem]"
                            style={{ fontFamily: "var(--font-display)" }}
                          >
                            {displayName}
                          </h1>
                          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-[var(--text-faint)]">
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
                          <p className="mt-3 max-w-[60ch] text-[15px] leading-7 text-[var(--text-secondary)]">
                            {settings.bio ||
                              "A focused profile that keeps your prep identity, progress, and settings in one place."}
                          </p>
                          <div className="mt-4 flex flex-wrap gap-2">
                            {profileTags.map((tag, index) => (
                              <span
                                key={tag}
                                className={`rounded-full border px-3 py-1.5 text-[11px] ${
                                  index === 0
                                    ? "border-[var(--brand-muted)] bg-[var(--brand-subtle)] text-[var(--brand)]"
                                    : "border-[var(--border)] text-[var(--text-secondary)]"
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
                          className="inline-flex items-center gap-2 rounded-[10px] bg-[var(--brand)] px-4 py-2.5 text-sm font-medium text-[var(--text-on-brand)] transition hover:bg-[var(--brand-light)]"
                        >
                          <PencilLine size={14} />
                          Edit details
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            void copyHandle();
                          }}
                          className="inline-flex items-center gap-2 rounded-[10px] border border-[var(--border)] bg-[var(--surface-1)] px-4 py-2.5 text-sm text-[var(--text-secondary)] transition hover:bg-[var(--surface-2)] hover:text-[var(--text-primary)]"
                        >
                          <Copy size={14} />
                          Copy handle
                        </button>
                        <Link href="/practice">
                          <span className="inline-flex cursor-pointer items-center gap-2 rounded-[10px] border border-[var(--border)] bg-[var(--surface-1)] px-4 py-2.5 text-sm text-[var(--text-secondary)] transition hover:bg-[var(--surface-2)] hover:text-[var(--text-primary)]">
                            Continue practice
                            <ArrowRight size={14} />
                          </span>
                        </Link>
                        {avatarUrl ? (
                          <button
                            type="button"
                            onClick={() => {
                              void removeMedia("avatar");
                            }}
                            disabled={uploadingMedia.avatar}
                            className="inline-flex items-center gap-2 rounded-[10px] border border-[var(--border)] bg-[var(--surface-1)] px-4 py-2.5 text-sm text-[var(--text-secondary)] transition hover:bg-[var(--surface-2)] hover:text-[var(--text-primary)] disabled:opacity-70"
                          >
                            Remove photo
                          </button>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-b border-[var(--border)] py-8">
                <p className="text-[10px] uppercase tracking-[0.18em] text-[var(--text-faint)]">
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
                      className={`rounded-[14px] border border-[var(--border)] bg-[var(--bg-card)] px-5 py-5 text-center ${
                        index === 0 ? "shadow-[var(--shadow-md)]" : ""
                      }`}
                    >
                      <p
                        className={`text-[2.25rem] leading-none tracking-[-0.04em] ${
                          index === 0
                            ? "text-[var(--brand)]"
                            : "text-[var(--text-primary)]"
                        }`}
                        style={{ fontFamily: "var(--font-display)" }}
                      >
                        {item.value}
                      </p>
                      <p className="mt-2 text-[11px] uppercase tracking-[0.14em] text-[var(--text-faint)]">
                        {item.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-b border-[var(--border)] py-8">
                <p className="text-[10px] uppercase tracking-[0.18em] text-[var(--text-faint)]">
                  Achievements
                </p>
                <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                  {achievements.map(item => (
                    <div
                      key={item.title}
                      className={`rounded-[12px] border px-4 py-4 text-center ${
                        item.unlocked
                          ? "border-[var(--border)] bg-[var(--bg-card)]"
                          : "border-[var(--border)] bg-[var(--surface-1)] opacity-45 grayscale"
                      }`}
                    >
                      <div
                        className={`mx-auto flex h-9 w-9 items-center justify-center rounded-[10px] ${
                          item.unlocked
                            ? "bg-[var(--brand-subtle)] text-[var(--brand)]"
                            : "bg-[var(--surface-3)] text-[var(--text-faint)]"
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
                      <p className="mt-3 text-sm font-semibold text-[var(--text-primary)]">
                        {item.title}
                      </p>
                      <p className="mt-1 text-xs leading-5 text-[var(--text-faint)]">
                        {item.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="py-8">
                <p className="text-[10px] uppercase tracking-[0.18em] text-[var(--text-faint)]">
                  Profile visibility
                </p>
                <div className="mt-4 rounded-[14px] border border-[var(--border)] bg-[var(--bg-card)] px-5 py-5">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="rounded-[10px] border border-[var(--border)] bg-[var(--surface-1)] px-3 py-2 text-sm text-[var(--text-secondary)]">
                          @{settings.username}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            void copyHandle();
                          }}
                          className="inline-flex items-center gap-2 rounded-[10px] border border-[var(--border)] px-3.5 py-2 text-sm text-[var(--text-primary)] transition hover:bg-[var(--surface-1)]"
                        >
                          <Copy size={14} />
                          Copy handle
                        </button>
                      </div>
                      <p className="mt-4 max-w-[58ch] text-sm leading-6 text-[var(--text-secondary)]">
                        Public profile visibility is saved now and will be used
                        by PrepBros public profile surfaces as they roll out.
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm text-[var(--text-primary)]">
                          Public profile
                        </p>
                        <p className="text-xs text-[var(--text-faint)]">
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
                <p className="text-[10px] uppercase tracking-[0.18em] text-[var(--text-faint)]">
                  Settings
                </p>
                <h2 className="mt-3 text-2xl tracking-[-0.04em] text-[var(--text-primary)]">
                  Personal and prep details
                </h2>
              </div>

              <div className="space-y-9">
                <div>
                  <p className="border-b border-[var(--border)] pb-3 text-sm font-semibold text-[var(--text-primary)]">
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
                  <p className="border-b border-[var(--border)] pb-3 text-sm font-semibold text-[var(--text-primary)]">
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
                            className="bg-[var(--surface-2)] text-[var(--text-primary)]"
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
                            className="bg-[var(--surface-2)] text-[var(--text-primary)]"
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
                  <p className="border-b border-[var(--border)] pb-3 text-sm font-semibold text-[var(--text-primary)]">
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
                  <p className="border-b border-[var(--border)] pb-3 text-sm font-semibold text-[var(--text-primary)]">
                    Appearance
                  </p>
                  <div className="mt-5 flex items-center justify-between rounded-[14px] border border-[var(--border)] bg-[var(--bg-card)] px-4 py-4">
                    <div>
                      <p className="text-sm font-semibold text-[var(--text-primary)]">
                        Theme
                      </p>
                      <p className="mt-1 text-sm text-[var(--text-secondary)]">
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
                <p className="text-[10px] uppercase tracking-[0.18em] text-[var(--text-faint)]">
                  Account
                </p>
                <h2 className="mt-3 text-2xl tracking-[-0.04em] text-[var(--text-primary)]">
                  Subscription, identity, and access
                </h2>
              </div>

              <div className="space-y-9">
                <div>
                  <p className="border-b border-[var(--border)] pb-3 text-sm font-semibold text-[var(--text-primary)]">
                    Subscription
                  </p>
                  <div className="mt-2">
                    <AccountRow
                      label="Current plan"
                      detail="Free plan with access to daily practice, basic progress, and resources."
                      action={
                        <Link href="/premium">
                          <span className="inline-flex cursor-pointer items-center gap-2 rounded-[10px] bg-[var(--brand)] px-4 py-2.5 text-sm font-medium text-[var(--text-on-brand)] transition hover:bg-[var(--brand-light)]">
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
                          <span className="inline-flex cursor-pointer items-center gap-2 rounded-[10px] border border-[var(--border)] px-4 py-2.5 text-sm text-[var(--text-secondary)] transition hover:bg-[var(--surface-1)] hover:text-[var(--text-primary)]">
                            Open practice
                            <ArrowRight size={14} />
                          </span>
                        </Link>
                      }
                    />
                  </div>
                </div>

                <div>
                  <p className="border-b border-[var(--border)] pb-3 text-sm font-semibold text-[var(--text-primary)]">
                    Account details
                  </p>
                  <div className="mt-2">
                    <AccountRow
                      label="Email"
                      detail={user.email || "Not available"}
                      action={
                        <span className="inline-flex items-center gap-2 rounded-[10px] border border-[var(--border)] px-3 py-2 text-xs text-[var(--text-secondary)]">
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
                  <p className="border-b border-[var(--border)] pb-3 text-sm font-semibold text-[var(--text-primary)]">
                    Actions
                  </p>
                  <div className="mt-5 flex flex-wrap gap-3">
                    <Link href="/dashboard">
                      <span className="inline-flex cursor-pointer items-center gap-2 rounded-[10px] border border-[var(--border)] px-4 py-2.5 text-sm text-[var(--text-secondary)] transition hover:bg-[var(--surface-1)] hover:text-[var(--text-primary)]">
                        Open dashboard
                      </span>
                    </Link>
                    <Link href="/support">
                      <span className="inline-flex cursor-pointer items-center gap-2 rounded-[10px] border border-[var(--border)] px-4 py-2.5 text-sm text-[var(--text-secondary)] transition hover:bg-[var(--surface-1)] hover:text-[var(--text-primary)]">
                        Contact support
                      </span>
                    </Link>
                    <button
                      type="button"
                      onClick={() => signOut()}
                      className="inline-flex items-center gap-2 rounded-[10px] border border-[rgba(220,38,38,0.18)] px-4 py-2.5 text-sm text-[var(--red)] transition hover:bg-[rgba(220,38,38,0.08)]"
                    >
                      <LogOut size={14} />
                      Sign out
                    </button>
                  </div>
                </div>
              </div>
            </section>
          ) : null}

          <div className="mt-2 border-t border-[var(--border)] pt-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <p
                className={`text-sm ${
                  saveNotice?.tone === "error"
                    ? "text-[var(--red)]"
                    : "text-[var(--text-secondary)]"
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
                className="inline-flex min-w-[168px] items-center justify-center gap-2 rounded-[10px] bg-[var(--brand)] px-5 py-3 text-sm font-medium text-[var(--text-on-brand)] transition hover:bg-[var(--brand-light)] disabled:opacity-70"
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
