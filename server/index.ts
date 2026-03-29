import express from "express";
import { readFile } from "fs/promises";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";

import {
  generateRobotsTxt,
  generateSitemapXml,
  replaceSeoHead,
  resolveSeoMetadata,
} from "../shared/seo";
import { submitIndexNow } from "./indexNow";
import { handleSupportRequest } from "./support";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
let cachedIndexTemplate: string | null = null;

function getSeoRuntime() {
  return {
    siteName: process.env.VITE_SITE_NAME,
    siteUrl: process.env.VITE_SITE_URL,
    supportEmail: process.env.VITE_SUPPORT_EMAIL,
    googleSiteVerification: process.env.VITE_GOOGLE_SITE_VERIFICATION,
    bingSiteVerification: process.env.VITE_BING_SITE_VERIFICATION,
    twitterHandle: process.env.VITE_TWITTER_HANDLE,
    indexNowKey: process.env.INDEXNOW_KEY,
  };
}

async function getIndexTemplate(staticPath: string) {
  if (cachedIndexTemplate) return cachedIndexTemplate;

  cachedIndexTemplate = await readFile(
    path.join(staticPath, "index.html"),
    "utf8"
  );

  return cachedIndexTemplate;
}

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

  app.get("/robots.txt", (_req, res) => {
    res.type("text/plain").send(generateRobotsTxt(getSeoRuntime()));
  });

  app.get("/sitemap.xml", (_req, res) => {
    res.type("application/xml").send(generateSitemapXml(getSeoRuntime()));
  });

  app.get("/:indexNowKey.txt", (req, res, next) => {
    const configuredKey = process.env.INDEXNOW_KEY;

    if (!configuredKey || req.params.indexNowKey !== configuredKey) {
      next();
      return;
    }

    res.type("text/plain").send(configuredKey);
  });

  app.post("/api/indexnow", async (req, res) => {
    const endpointSecret = process.env.INDEXNOW_ENDPOINT_SECRET;

    if (!endpointSecret) {
      res.status(404).json({ ok: false, message: "Not found." });
      return;
    }

    const providedSecret =
      req.headers["x-indexnow-secret"] ||
      req.headers.authorization?.replace(/^Bearer\s+/i, "");

    if (providedSecret !== endpointSecret) {
      res.status(401).json({ ok: false, message: "Unauthorized." });
      return;
    }

    const urls = Array.isArray(req.body?.urls)
      ? req.body.urls.filter(
          (value: unknown): value is string => typeof value === "string"
        )
      : [];

    const result = await submitIndexNow({
      urls,
      siteUrl: process.env.VITE_SITE_URL,
      indexNowKey: process.env.INDEXNOW_KEY,
    });

    res.status(result.status).json(result);
  });

  // Serve static files from dist/public in production
  const staticPath =
    process.env.NODE_ENV === "production"
      ? path.resolve(__dirname, "public")
      : path.resolve(__dirname, "..", "dist", "public");

  app.use(express.static(staticPath));

  // Handle client-side routing - serve index.html for all routes
  app.get("*", async (req, res) => {
    const runtime = getSeoRuntime();
    const metadata = resolveSeoMetadata(req.path, runtime);
    const template = await getIndexTemplate(staticPath);

    res.setHeader("X-Robots-Tag", metadata.robots);
    res.send(replaceSeoHead(template, req.path, runtime));
  });

  const port = process.env.PORT || 3000;

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
