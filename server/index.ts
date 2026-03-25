import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";

import { handleSupportRequest } from "./support";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const server = createServer(app);

  app.use(express.json({ limit: "64kb" }));

  app.post("/api/support", async (req, res) => {
    const forwardedFor = req.headers["x-forwarded-for"];
    const ip =
      typeof forwardedFor === "string"
        ? forwardedFor.split(",")[0]?.trim()
        : req.socket.remoteAddress || null;

    const result = await handleSupportRequest(req.body ?? {}, {
      ip,
      origin: req.headers.origin || req.headers.referer || null,
      userAgent: req.headers["user-agent"] || null,
    });

    res.status(result.status).json(result.body);
  });

  // Serve static files from dist/public in production
  const staticPath =
    process.env.NODE_ENV === "production"
      ? path.resolve(__dirname, "public")
      : path.resolve(__dirname, "..", "dist", "public");

  app.use(express.static(staticPath));

  // Handle client-side routing - serve index.html for all routes
  app.get("*", (_req, res) => {
    res.sendFile(path.join(staticPath, "index.html"));
  });

  const port = process.env.PORT || 3000;

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
