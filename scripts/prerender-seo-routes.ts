import { mkdir, readFile, writeFile } from "fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  getIndexableSeoRoutes,
  replaceSeoHead,
} from "../shared/seo";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const distDir = path.join(rootDir, "dist", "public");
const indexPath = path.join(distDir, "index.html");

const template = await readFile(indexPath, "utf8");

await Promise.all(
  getIndexableSeoRoutes()
    .filter((route) => route.path !== "/")
    .map(async (route) => {
      const routeDir = path.join(distDir, route.path.replace(/^\/+/, ""));
      await mkdir(routeDir, { recursive: true });
      await writeFile(
        path.join(routeDir, "index.html"),
        replaceSeoHead(template, route.path),
        "utf8"
      );
    })
);

console.log("SEO route HTML generated in dist/public.");
