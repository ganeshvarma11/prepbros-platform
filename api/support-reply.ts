type RawReplyPayload = {
  to?: unknown;
  subject?: unknown;
  message?: unknown;
  requestId?: unknown;
};

type ValidReplyPayload = {
  to: string;
  subject: string;
  message: string;
  requestId: string;
};

const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || "rakeshmeesa631@gmail.com").toLowerCase();
const SUPPORT_FROM_EMAIL = process.env.SUPPORT_FROM_EMAIL || "";
const SUPPORT_REPLY_TO = process.env.SUPPORT_TO_EMAIL || "support@prepbros.in";
const RESEND_API_KEY = process.env.RESEND_API_KEY || "";
const SUPABASE_URL =
  process.env.SUPABASE_URL || "https://yhnbkwyakgebycfphzrk.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const SUPABASE_AUTH_KEY =
  process.env.SUPABASE_ANON_KEY ||
  process.env.SUPABASE_PUBLISHABLE_KEY ||
  "sb_publishable_9_JHn91N7yUa6IU4ki_Y_w_ENeAXFAE";

function normalizeText(value: unknown) {
  return typeof value === "string" ? value.trim().replace(/\0/g, "") : "";
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function validateReplyPayload(payload: RawReplyPayload) {
  const to = normalizeText(payload.to).toLowerCase();
  const subject = normalizeText(payload.subject);
  const message = normalizeText(payload.message);
  const requestId = normalizeText(payload.requestId);

  if (!to || !isValidEmail(to)) {
    return { error: "Enter a valid recipient email." };
  }

  if (subject.length < 3 || subject.length > 160) {
    return { error: "Subject should be between 3 and 160 characters." };
  }

  if (message.length < 5 || message.length > 5000) {
    return { error: "Reply should be between 5 and 5000 characters." };
  }

  return {
    data: {
      to,
      subject,
      message,
      requestId,
    } satisfies ValidReplyPayload,
  };
}

async function getAuthorizedAdminEmail(token: string) {
  if (!token || !SUPABASE_URL || !SUPABASE_AUTH_KEY) return null;

  const response = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: {
      apikey: SUPABASE_AUTH_KEY,
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const details = await response.text();
    console.error("Failed to verify support reply user", details);
    return null;
  }

  const user = (await response.json()) as { email?: string | null };
  return user.email?.toLowerCase() || null;
}

function buildReplyText(payload: ValidReplyPayload) {
  return [payload.message, "", payload.requestId ? `Support Request ID: ${payload.requestId}` : ""]
    .filter(Boolean)
    .join("\n");
}

function buildReplyHtml(payload: ValidReplyPayload) {
  return `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111827">
      <p style="white-space:pre-wrap">${escapeHtml(payload.message)}</p>
      ${
        payload.requestId
          ? `<hr style="margin:20px 0;border:none;border-top:1px solid #e5e7eb" /><p style="color:#6b7280;font-size:12px">Support Request ID: ${escapeHtml(payload.requestId)}</p>`
          : ""
      }
    </div>
  `;
}

async function sendReplyEmail(payload: ValidReplyPayload) {
  if (!RESEND_API_KEY || !SUPPORT_FROM_EMAIL) {
    return { ok: false, message: "Support email is not configured yet." };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "User-Agent": "prepbros-support-reply/1.0",
    },
    body: JSON.stringify({
      from: SUPPORT_FROM_EMAIL,
      to: [payload.to],
      reply_to: SUPPORT_REPLY_TO,
      subject: payload.subject,
      html: buildReplyHtml(payload),
      text: buildReplyText(payload),
    }),
  });

  if (!response.ok) {
    const details = await response.text();
    console.error("Failed to send support reply", details);
    return { ok: false, message: "We couldn't send the reply right now." };
  }

  return { ok: true, message: "Reply sent successfully." };
}

async function persistReplyHistory(payload: ValidReplyPayload) {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !payload.requestId) {
    return false;
  }

  const insertReply = await fetch(`${SUPABASE_URL}/rest/v1/support_replies`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    },
    body: JSON.stringify([
      {
        support_request_id: payload.requestId,
        to_email: payload.to,
        subject: payload.subject,
        message: payload.message,
        sent_by_email: ADMIN_EMAIL,
      },
    ]),
  });

  if (!insertReply.ok) {
    const details = await insertReply.text();
    console.error("Failed to persist support reply", details);
    return false;
  }

  const updateRequest = await fetch(
    `${SUPABASE_URL}/rest/v1/support_requests?id=eq.${encodeURIComponent(payload.requestId)}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({
        status: "in_progress",
      }),
    }
  );

  if (!updateRequest.ok) {
    const details = await updateRequest.text();
    console.error("Failed to update support request status after reply", details);
  }

  return true;
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.status(405).json({ ok: false, message: "Method not allowed." });
    return;
  }

  const authHeader = req.headers.authorization || "";
  const token =
    typeof authHeader === "string" && authHeader.startsWith("Bearer ")
      ? authHeader.slice("Bearer ".length).trim()
      : "";

  const email = await getAuthorizedAdminEmail(token);

  if (!email) {
    res.status(401).json({ ok: false, message: "You must be signed in to reply." });
    return;
  }

  if (email !== ADMIN_EMAIL) {
    res.status(403).json({ ok: false, message: "Only the admin inbox can send replies." });
    return;
  }

  const validation = validateReplyPayload(req.body ?? {});

  if ("error" in validation) {
    res.status(400).json({ ok: false, message: validation.error });
    return;
  }

  const result = await sendReplyEmail(validation.data);

  if (!result.ok) {
    res.status(502).json(result);
    return;
  }

  const historySaved = await persistReplyHistory(validation.data);

  res.status(200).json({
    ok: true,
    message: historySaved
      ? "Reply sent successfully."
      : "Reply sent successfully, but history could not be saved.",
    historySaved,
  });
}
