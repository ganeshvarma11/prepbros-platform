type RawSupportPayload = {
  email?: unknown;
  issue?: unknown;
  message?: unknown;
  website?: unknown;
};

type ValidSupportPayload = {
  email: string;
  issue: string;
  message: string;
  website: string;
};

type SupportRequestMeta = {
  ip?: string | null;
  origin?: string | null;
  userAgent?: string | null;
};

type SupportHandlerResult = {
  status: number;
  body: {
    ok: boolean;
    message: string;
    id?: string;
    persisted?: boolean;
    notified?: boolean;
  };
};

const SUPPORT_EMAIL = process.env.SUPPORT_TO_EMAIL || "hello@prepbros.com";
const SUPPORT_FROM_EMAIL = process.env.SUPPORT_FROM_EMAIL || "";
const RESEND_API_KEY = process.env.RESEND_API_KEY || "";
const SUPABASE_URL = process.env.SUPABASE_URL || "https://yhnbkwyakgebycfphzrk.supabase.co";
const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.SUPABASE_PUBLISHABLE_KEY ||
  "sb_publishable_9_JHn91N7yUa6IU4ki_Y_w_ENeAXFAE";

const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 5;
const rateLimitStore = new Map<string, number[]>();

function normalizeText(value: unknown) {
  return typeof value === "string" ? value.trim().replace(/\0/g, "") : "";
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isRateLimited(ip: string) {
  const now = Date.now();
  const recent = (rateLimitStore.get(ip) || []).filter((timestamp) => now - timestamp < RATE_LIMIT_WINDOW_MS);

  if (recent.length >= RATE_LIMIT_MAX_REQUESTS) {
    rateLimitStore.set(ip, recent);
    return true;
  }

  recent.push(now);
  rateLimitStore.set(ip, recent);
  return false;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function validateSupportPayload(payload: RawSupportPayload) {
  const email = normalizeText(payload.email).toLowerCase();
  const issue = normalizeText(payload.issue);
  const message = normalizeText(payload.message);
  const website = normalizeText(payload.website);

  if (website) {
    return { spam: true as const };
  }

  if (!email || !isValidEmail(email)) {
    return { error: "Enter a valid email address." };
  }

  if (issue.length < 3 || issue.length > 140) {
    return { error: "Issue should be between 3 and 140 characters." };
  }

  if (message.length < 10 || message.length > 5000) {
    return { error: "Message should be between 10 and 5000 characters." };
  }

  return {
    data: {
      email,
      issue,
      message,
      website,
    } satisfies ValidSupportPayload,
  };
}

async function persistSupportRequest(payload: ValidSupportPayload) {
  if (!SUPABASE_URL || !SUPABASE_KEY) return null;

  const response = await fetch(`${SUPABASE_URL}/rest/v1/support_requests`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      Prefer: "return=representation",
    },
    body: JSON.stringify([
      {
        email: payload.email,
        category: "General support",
        subject: payload.issue,
        message: payload.message,
        source: "support_page_api",
      },
    ]),
  });

  if (!response.ok) {
    const details = await response.text();
    console.error("Failed to persist support request", details);
    return null;
  }

  const rows = (await response.json()) as Array<{ id?: string }>;
  return rows[0]?.id || null;
}

function buildSupportEmailText(payload: ValidSupportPayload, meta: SupportRequestMeta, requestId: string | null) {
  const details = [
    `Issue: ${payload.issue}`,
    `From: ${payload.email}`,
    requestId ? `Request ID: ${requestId}` : "",
    meta.origin ? `Origin: ${meta.origin}` : "",
    meta.ip ? `IP: ${meta.ip}` : "",
    meta.userAgent ? `User-Agent: ${meta.userAgent}` : "",
    "",
    payload.message,
  ].filter(Boolean);

  return details.join("\n");
}

function buildSupportEmailHtml(payload: ValidSupportPayload, meta: SupportRequestMeta, requestId: string | null) {
  return `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111827">
      <h2 style="margin:0 0 16px">New PrepBros support request</h2>
      <p><strong>Issue:</strong> ${escapeHtml(payload.issue)}</p>
      <p><strong>From:</strong> ${escapeHtml(payload.email)}</p>
      ${requestId ? `<p><strong>Request ID:</strong> ${escapeHtml(requestId)}</p>` : ""}
      ${meta.origin ? `<p><strong>Origin:</strong> ${escapeHtml(meta.origin)}</p>` : ""}
      ${meta.ip ? `<p><strong>IP:</strong> ${escapeHtml(meta.ip)}</p>` : ""}
      ${meta.userAgent ? `<p><strong>User-Agent:</strong> ${escapeHtml(meta.userAgent)}</p>` : ""}
      <hr style="margin:20px 0;border:none;border-top:1px solid #e5e7eb" />
      <p style="white-space:pre-wrap">${escapeHtml(payload.message)}</p>
    </div>
  `;
}

async function notifySupportInbox(payload: ValidSupportPayload, meta: SupportRequestMeta, requestId: string | null) {
  if (!RESEND_API_KEY || !SUPPORT_FROM_EMAIL) return false;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "User-Agent": "prepbros-support/1.0",
    },
    body: JSON.stringify({
      from: SUPPORT_FROM_EMAIL,
      to: [SUPPORT_EMAIL],
      subject: `[PrepBros Support] ${payload.issue}`,
      html: buildSupportEmailHtml(payload, meta, requestId),
      text: buildSupportEmailText(payload, meta, requestId),
    }),
  });

  if (!response.ok) {
    const details = await response.text();
    console.error("Failed to notify support inbox", details);
    return false;
  }

  return true;
}

export async function handleSupportRequest(
  rawPayload: RawSupportPayload,
  meta: SupportRequestMeta = {},
): Promise<SupportHandlerResult> {
  const ip = meta.ip || "unknown";

  if (isRateLimited(ip)) {
    return {
      status: 429,
      body: {
        ok: false,
        message: "Too many requests from this connection. Please wait a few minutes and try again.",
      },
    };
  }

  const validation = validateSupportPayload(rawPayload);

  if ("spam" in validation) {
    return {
      status: 200,
      body: {
        ok: true,
        message: "Request submitted.",
      },
    };
  }

  if ("error" in validation) {
    const errorMessage = validation.error || "We couldn't submit this request.";

    return {
      status: 400,
      body: {
        ok: false,
        message: errorMessage,
      },
    };
  }

  const requestId = await persistSupportRequest(validation.data);
  const notified = await notifySupportInbox(validation.data, meta, requestId);
  const persisted = Boolean(requestId);

  if (!persisted && !notified) {
    return {
      status: 502,
      body: {
        ok: false,
        message: "We couldn't deliver your request right now. Please email hello@prepbros.com directly.",
      },
    };
  }

  return {
    status: 200,
    body: {
      ok: true,
      message: "Request submitted. We'll get back to you by email as soon as possible.",
      id: requestId || undefined,
      persisted,
      notified,
    },
  };
}
