import { supabase } from "@/lib/supabase";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    umami?: {
      track: (eventName: string, data?: Record<string, unknown>) => void;
    };
  }
}

const GA_MEASUREMENT_ID =
  import.meta.env.VITE_GA_MEASUREMENT_ID || "G-GPQE4HY4J9";
const SESSION_STORAGE_KEY = "prepbros:analytics-session-id";
const PENDING_EVENTS_STORAGE_KEY = "prepbros:analytics-pending-events";
const MIN_ENGAGED_MS = 5_000;
const MAX_PENDING_EVENTS = 25;
const ANALYTICS_FLUSH_INTERVAL_MS = 5_000;

let analyticsBooted = false;
let gaBooted = false;
let lastVisibleAt = 0;
let activePath = "/";
let cachedUserId: string | null | undefined;
let pendingEvents: ProductEventInsert[] = [];
let analyticsFlushTimer: number | null = null;
let flushInFlight: Promise<void> | null = null;

type ProductEventInsert = {
  event_name: string;
  path: string;
  session_id: string;
  user_id: string | null;
  referrer: string | null;
  properties: Record<string, unknown>;
};

function setupGoogleAnalytics() {
  if (gaBooted || typeof window === "undefined" || !GA_MEASUREMENT_ID) return;

  gaBooted = true;
  window.dataLayer = window.dataLayer || [];
  window.gtag =
    window.gtag ||
    function gtag(...args: unknown[]) {
      window.dataLayer?.push(args);
    };

  window.gtag("js", new Date());
  window.gtag("config", GA_MEASUREMENT_ID, {
    send_page_view: false,
    anonymize_ip: true,
  });

  const existingScript = document.querySelector<HTMLScriptElement>(
    `script[src*="googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}"]`
  );

  if (existingScript) return;

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(
    GA_MEASUREMENT_ID
  )}`;
  document.head.appendChild(script);
}

function buildSessionId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function getSessionId() {
  if (typeof window === "undefined") return "server";

  try {
    const existing = window.sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (existing) return existing;

    const sessionId = buildSessionId();
    window.sessionStorage.setItem(SESSION_STORAGE_KEY, sessionId);
    return sessionId;
  } catch {
    return buildSessionId();
  }
}

function normalizePath(path?: string) {
  if (typeof window === "undefined") return path || "/";

  const rawPath = path || window.location.pathname;

  try {
    const url = new URL(rawPath, window.location.origin);
    return url.pathname || "/";
  } catch {
    const cleanedPath = rawPath.split("?")[0]?.split("#")[0];
    return cleanedPath || "/";
  }
}

function sanitizeProperties(data?: Record<string, unknown>) {
  if (!data) return {};

  return Object.fromEntries(
    Object.entries(data).filter(([, value]) => value !== undefined)
  );
}

function canUseSessionStorage() {
  return typeof window !== "undefined" && typeof window.sessionStorage !== "undefined";
}

function persistPendingEvents() {
  if (!canUseSessionStorage()) return;

  try {
    window.sessionStorage.setItem(
      PENDING_EVENTS_STORAGE_KEY,
      JSON.stringify(pendingEvents.slice(-MAX_PENDING_EVENTS))
    );
  } catch {
    // Ignore analytics storage failures.
  }
}

function restorePendingEvents() {
  if (!canUseSessionStorage()) return;

  try {
    const raw = window.sessionStorage.getItem(PENDING_EVENTS_STORAGE_KEY);
    if (!raw) return;

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return;

    pendingEvents = parsed.slice(-MAX_PENDING_EVENTS);
  } catch {
    pendingEvents = [];
  }
}

function scheduleAnalyticsFlush() {
  if (typeof window === "undefined") return;
  if (analyticsFlushTimer !== null) return;

  analyticsFlushTimer = window.setTimeout(() => {
    analyticsFlushTimer = null;
    void flushPendingEvents();
  }, ANALYTICS_FLUSH_INTERVAL_MS);
}

async function flushPendingEvents() {
  if (flushInFlight) {
    return flushInFlight;
  }

  if (pendingEvents.length === 0) {
    return;
  }

  const batch = pendingEvents.slice(0, MAX_PENDING_EVENTS);

  flushInFlight = Promise.resolve(
    supabase.from("product_events").insert(batch)
  )
    .then(() => {
      pendingEvents = pendingEvents.slice(batch.length);
      persistPendingEvents();
    })
    .catch(() => {
      // Analytics should never break the product experience.
    })
    .finally(() => {
      flushInFlight = null;

      if (pendingEvents.length > 0) {
        scheduleAnalyticsFlush();
      }
    });

  return flushInFlight;
}

async function resolveUserId() {
  if (cachedUserId !== undefined) return cachedUserId;

  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    cachedUserId = session?.user?.id ?? null;
  } catch {
    cachedUserId = null;
  }

  return cachedUserId;
}

async function recordEvent(eventName: string, data?: Record<string, unknown>) {
  if (typeof window === "undefined") return;

  const properties = sanitizeProperties(data);
  const path = normalizePath(
    typeof properties.path === "string" ? properties.path : activePath
  );
  const userId = await resolveUserId();

  pendingEvents.push({
    event_name: eventName,
    path,
    session_id: getSessionId(),
    user_id: userId,
    referrer: document.referrer || null,
    properties: {
      ...properties,
      path,
    },
  });
  pendingEvents = pendingEvents.slice(-MAX_PENDING_EVENTS);
  persistPendingEvents();

  if (pendingEvents.length >= 10) {
    void flushPendingEvents();
    return;
  }

  scheduleAnalyticsFlush();
}

function trackEngagedTime(reason: "hidden" | "pagehide") {
  if (typeof document === "undefined") return;
  if (!lastVisibleAt) return;

  const durationMs = Date.now() - lastVisibleAt;
  lastVisibleAt = Date.now();

  if (durationMs < MIN_ENGAGED_MS) return;

  trackEvent("session_engaged", {
    path: activePath,
    engaged_seconds: Math.round(durationMs / 1000),
    reason,
  });
}

export function setupAnalytics() {
  if (analyticsBooted || typeof window === "undefined") return;

  analyticsBooted = true;
  activePath = normalizePath(window.location.pathname);
  lastVisibleAt = Date.now();
  restorePendingEvents();

  setupGoogleAnalytics();
  void resolveUserId();

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      trackEngagedTime("hidden");
      void flushPendingEvents();
      return;
    }

    lastVisibleAt = Date.now();
  });

  window.addEventListener("pagehide", () => {
    trackEngagedTime("pagehide");
    void flushPendingEvents();
  });

  supabase.auth.onAuthStateChange((event, session) => {
    cachedUserId = session?.user?.id ?? null;

    if (event === "SIGNED_IN") {
      trackEvent("auth_session_signed_in", { path: activePath });
    }

    if (event === "SIGNED_OUT") {
      trackEvent("auth_session_signed_out", { path: activePath });
    }
  });
}

export function trackEvent(eventName: string, data?: Record<string, unknown>) {
  if (typeof window === "undefined") return;

  const properties = sanitizeProperties(data);
  const path = normalizePath(
    typeof properties.path === "string" ? properties.path : activePath
  );

  try {
    setupGoogleAnalytics();

    if (eventName === "page_view") {
      window.gtag?.("event", "page_view", {
        page_path: path,
        page_location: `${window.location.origin}${path}`,
        page_title: document.title,
      });
    } else {
      window.gtag?.("event", eventName, {
        ...properties,
        path,
      });
    }
  } catch {
    // Analytics should never break the product experience.
  }

  try {
    window.umami?.track?.(eventName, properties);
  } catch {
    // Analytics should never break the product experience.
  }

  void recordEvent(eventName, properties);
}

export function trackPage(path: string) {
  activePath = normalizePath(path);
  lastVisibleAt = Date.now();
  trackEvent("page_view", { path: activePath });
}
