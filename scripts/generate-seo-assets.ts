import { mkdir, writeFile } from "fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  generateRobotsTxt,
  generateSitemapXml,
} from "../shared/seo";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const publicDir = path.join(rootDir, "client", "public");

const runtime = {
  siteName: process.env.VITE_SITE_NAME,
  siteUrl: process.env.VITE_SITE_URL,
  supportEmail: process.env.VITE_SUPPORT_EMAIL,
  googleSiteVerification: process.env.VITE_GOOGLE_SITE_VERIFICATION,
  bingSiteVerification: process.env.VITE_BING_SITE_VERIFICATION,
  twitterHandle: process.env.VITE_TWITTER_HANDLE,
  indexNowKey: process.env.INDEXNOW_KEY,
};

await mkdir(publicDir, { recursive: true });

await writeFile(
  path.join(publicDir, "robots.txt"),
  `${generateRobotsTxt(runtime)}\n`,
  "utf8"
);

await writeFile(
  path.join(publicDir, "sitemap.xml"),
  `${generateSitemapXml(runtime)}\n`,
  "utf8"
);

if (runtime.indexNowKey) {
  await writeFile(
    path.join(publicDir, `${runtime.indexNowKey}.txt`),
    `${runtime.indexNowKey}\n`,
    "utf8"
  );
}

console.log("SEO assets generated in client/public.");
