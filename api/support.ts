import { handleSupportRequest } from "../server/support";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.status(405).json({ ok: false, message: "Method not allowed." });
    return;
  }

  const forwardedFor = req.headers["x-forwarded-for"];
  const ip =
    typeof forwardedFor === "string"
      ? forwardedFor.split(",")[0]?.trim()
      : req.socket?.remoteAddress || null;

  const result = await handleSupportRequest(req.body ?? {}, {
    ip,
    origin: req.headers.origin || req.headers.referer || null,
    userAgent: req.headers["user-agent"] || null,
  });

  res.status(result.status).json(result.body);
}
