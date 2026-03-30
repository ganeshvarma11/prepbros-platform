export const DEFAULT_SEO_SITE_NAME = "PrepBros";
export const DEFAULT_SEO_SITE_URL = "https://prepbros.in";
export const DEFAULT_SEO_DESCRIPTION =
  "PrepBros helps UPSC, SSC, and state exam aspirants practice daily MCQs, revisit PYQs, track progress, and improve weak topics with a focused prep system.";
export const DEFAULT_OG_IMAGE_PATH = "/assets/prepbros-og.svg";
export const DEFAULT_LOGO_IMAGE_PATH = "/assets/prepbros-logo-final.svg";
export const DEFAULT_OG_IMAGE_WIDTH = "1200";
export const DEFAULT_OG_IMAGE_HEIGHT = "630";
export const SEO_HEAD_START_MARKER = "<!-- SEO_HEAD_START -->";
export const SEO_HEAD_END_MARKER = "<!-- SEO_HEAD_END -->";

type SitemapChangeFrequency =
  | "always"
  | "hourly"
  | "daily"
  | "weekly"
  | "monthly"
  | "yearly"
  | "never";

type OpenGraphType = "website" | "article";

type StructuredDataType =
  | "WebPage"
  | "CollectionPage"
  | "ContactPage"
  | "AboutPage"
  | "WebApplication";

export type SeoRoute = {
  path: string;
  title: string;
  description: string;
  keywords?: string[];
  index: boolean;
  includeInSitemap: boolean;
  changeFrequency?: SitemapChangeFrequency;
  priority?: number;
  ogType?: OpenGraphType;
  schemaType?: StructuredDataType;
  imagePath?: string;
};

export type SeoRuntimeConfig = {
  siteName?: string;
  siteUrl?: string;
  supportEmail?: string;
  googleSiteVerification?: string;
  bingSiteVerification?: string;
  twitterHandle?: string;
  defaultImagePath?: string;
  currentIsoDate?: string;
  indexNowKey?: string;
};

type BreadcrumbItem = {
  name: string;
  item: string;
};

type JsonLd =
  | Record<string, unknown>
  | Array<Record<string, unknown>>;

export type ResolvedSeoMetadata = {
  normalizedPath: string;
  canonicalUrl: string;
  title: string;
  description: string;
  keywords?: string;
  robots: string;
  imageUrl: string;
  siteName: string;
  ogType: OpenGraphType;
  verification: {
    google?: string;
    bing?: string;
  };
  twitterHandle?: string;
  jsonLd: JsonLd;
};

const sharedKeywords = [
  "UPSC preparation",
  "SSC preparation",
  "state exam preparation",
  "daily MCQs",
  "previous year questions",
  "exam practice platform",
];

export const seoRoutes: SeoRoute[] = [
  {
    path: "/",
    title: "Daily Practice for UPSC, SSC & State Exams",
    description:
      "PrepBros helps exam aspirants practice daily MCQs, revisit PYQs, track progress, and improve weak topics with a simple daily prep loop.",
    keywords: ["UPSC prep", "SSC prep", "daily practice", "PYQ practice"],
    index: true,
    includeInSitemap: true,
    changeFrequency: "daily",
    priority: 1,
    ogType: "website",
    schemaType: "WebPage",
  },
  {
    path: "/practice",
    title: "Practice Questions, PYQs & Topic Drills",
    description:
      "Solve topic-wise practice questions, previous year papers, and exam-specific MCQs for UPSC, SSC, TSPSC, APPSC, RRB, and IBPS.",
    keywords: ["practice questions", "MCQs", "PYQs", "topic-wise practice"],
    index: true,
    includeInSitemap: true,
    changeFrequency: "daily",
    priority: 0.95,
    ogType: "website",
    schemaType: "CollectionPage",
  },
  {
    path: "/aptitude",
    title: "Aptitude & Reasoning Practice",
    description:
      "Practice quantitative aptitude, reasoning, reading comprehension, data interpretation, and mental ability for government exams.",
    keywords: ["aptitude practice", "reasoning questions", "quantitative aptitude"],
    index: true,
    includeInSitemap: true,
    changeFrequency: "weekly",
    priority: 0.82,
    ogType: "website",
    schemaType: "CollectionPage",
  },
  {
    path: "/contests",
    title: "Exam Contests & Weekly Challenges",
    description:
      "Join weekly contests, follow upcoming exam challenges, and add time pressure and competition to your preparation routine.",
    keywords: ["exam contest", "weekly challenge", "mock competition"],
    index: true,
    includeInSitemap: true,
    changeFrequency: "weekly",
    priority: 0.76,
    ogType: "website",
    schemaType: "CollectionPage",
  },
  {
    path: "/leaderboard",
    title: "Leaderboard",
    description:
      "Leaderboard updates are still being built while PrepBros focuses on cleaner practice and progress tracking.",
    keywords: ["leaderboard", "rankings", "progress tracking"],
    index: false,
    includeInSitemap: false,
    ogType: "website",
    schemaType: "WebPage",
  },
  {
    path: "/resources",
    title: "Study Resources, Books & PDFs",
    description:
      "Browse curated study resources, books, PDFs, and channels for UPSC, SSC, and other government exam preparation paths.",
    keywords: ["study resources", "UPSC books", "SSC PDFs", "exam materials"],
    index: true,
    includeInSitemap: true,
    changeFrequency: "weekly",
    priority: 0.8,
    ogType: "website",
    schemaType: "CollectionPage",
  },
  {
    path: "/premium",
    title: "Premium Plans for Serious Aspirants",
    description:
      "Compare PrepBros plans, premium features, and billing options for aspirants who want unlimited access and stronger progress tools.",
    keywords: ["premium plan", "exam prep subscription", "PrepBros pricing"],
    index: true,
    includeInSitemap: true,
    changeFrequency: "weekly",
    priority: 0.73,
    ogType: "website",
    schemaType: "WebPage",
  },
  {
    path: "/dashboard",
    title: "Dashboard",
    description:
      "Personal dashboard for practice history, streaks, and progress insights.",
    index: false,
    includeInSitemap: false,
    ogType: "website",
    schemaType: "WebApplication",
  },
  {
    path: "/profile",
    title: "Profile",
    description: "Personal profile, preferences, and account settings.",
    index: false,
    includeInSitemap: false,
    ogType: "website",
    schemaType: "WebApplication",
  },
  {
    path: "/explore",
    title: "Explore",
    description: "Personalized practice workspace and guided starting paths.",
    index: false,
    includeInSitemap: false,
    ogType: "website",
    schemaType: "WebApplication",
  },
  {
    path: "/privacy",
    title: "Privacy Policy",
    description:
      "Read how PrepBros collects, uses, stores, and protects user data across practice, support, and billing surfaces.",
    keywords: ["privacy policy", "data protection", "user privacy"],
    index: true,
    includeInSitemap: true,
    changeFrequency: "yearly",
    priority: 0.32,
    ogType: "website",
    schemaType: "AboutPage",
  },
  {
    path: "/terms",
    title: "Terms of Service",
    description:
      "Review the rules, billing terms, rights, and platform conditions that apply to using PrepBros.",
    keywords: ["terms of service", "billing terms", "user agreement"],
    index: true,
    includeInSitemap: true,
    changeFrequency: "yearly",
    priority: 0.32,
    ogType: "website",
    schemaType: "AboutPage",
  },
  {
    path: "/support",
    title: "Support",
    description:
      "Contact PrepBros support for billing, access, question quality, and account help.",
    keywords: ["PrepBros support", "contact support", "billing help"],
    index: true,
    includeInSitemap: true,
    changeFrequency: "monthly",
    priority: 0.45,
    ogType: "website",
    schemaType: "ContactPage",
  },
  {
    path: "/status",
    title: "System Status",
    description:
      "Check the current PrepBros system status, product availability, and launch-stage reliability notes.",
    keywords: ["system status", "platform status", "uptime"],
    index: true,
    includeInSitemap: true,
    changeFrequency: "weekly",
    priority: 0.35,
    ogType: "website",
    schemaType: "WebPage",
  },
  {
    path: "/admin",
    title: "Admin",
    description: "Administrative tools for questions, resources, and contests.",
    index: false,
    includeInSitemap: false,
    ogType: "website",
    schemaType: "WebApplication",
  },
];

export function normalizePathname(pathname: string) {
  const basePath = pathname.split("#")[0]?.split("?")[0] || "/";
  const withLeadingSlash = basePath.startsWith("/") ? basePath : `/${basePath}`;
  const normalized = withLeadingSlash.replace(/\/+$/, "");
  return normalized || "/";
}

export function buildAbsoluteUrl(siteUrl: string, pathname: string) {
  const normalizedSiteUrl = (siteUrl || DEFAULT_SEO_SITE_URL).replace(/\/+$/, "");
  const normalizedPath = normalizePathname(pathname);

  if (normalizedPath === "/") return `${normalizedSiteUrl}/`;

  return `${normalizedSiteUrl}${normalizedPath}`;
}

export function buildSeoRuntimeConfig(
  runtimeConfig: SeoRuntimeConfig = {}
) {
  return {
    siteName: runtimeConfig.siteName || DEFAULT_SEO_SITE_NAME,
    siteUrl: (runtimeConfig.siteUrl || DEFAULT_SEO_SITE_URL).replace(/\/+$/, ""),
    supportEmail: runtimeConfig.supportEmail || "support@prepbros.in",
    googleSiteVerification: runtimeConfig.googleSiteVerification || "",
    bingSiteVerification: runtimeConfig.bingSiteVerification || "",
    twitterHandle: runtimeConfig.twitterHandle || "",
    defaultImagePath: runtimeConfig.defaultImagePath || DEFAULT_OG_IMAGE_PATH,
    currentIsoDate:
      runtimeConfig.currentIsoDate || new Date().toISOString(),
    indexNowKey: runtimeConfig.indexNowKey || "",
  };
}

export function getSeoRoute(pathname: string) {
  const normalizedPath = normalizePathname(pathname);
  return (
    seoRoutes.find((route) => route.path === normalizedPath) || null
  );
}

function buildBreadcrumbs(
  siteUrl: string,
  siteName: string,
  route: SeoRoute
): BreadcrumbItem[] {
  const items: BreadcrumbItem[] = [
    {
      name: siteName,
      item: buildAbsoluteUrl(siteUrl, "/"),
    },
  ];

  if (route.path !== "/") {
    items.push({
      name: route.title,
      item: buildAbsoluteUrl(siteUrl, route.path),
    });
  }

  return items;
}

function buildPageTitle(siteName: string, route: SeoRoute | null) {
  if (!route) return `Page Not Found | ${siteName}`;
  if (route.path === "/") return `${siteName} | ${route.title}`;
  return `${route.title} | ${siteName}`;
}

function buildRobotsContent(index: boolean) {
  return index
    ? "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1"
    : "noindex, nofollow, noarchive";
}

function buildStructuredData(
  siteUrl: string,
  siteName: string,
  supportEmail: string,
  metadata: Omit<ResolvedSeoMetadata, "jsonLd">,
  route: SeoRoute | null
): JsonLd {
  const organization: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteName,
    url: siteUrl,
    logo: buildAbsoluteUrl(siteUrl, DEFAULT_LOGO_IMAGE_PATH),
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "customer support",
        email: supportEmail,
        url: buildAbsoluteUrl(siteUrl, "/support"),
      },
    ],
  };

  const webSite: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteName,
    url: siteUrl,
    description: DEFAULT_SEO_DESCRIPTION,
    potentialAction: {
      "@type": "SearchAction",
      target: `${buildAbsoluteUrl(siteUrl, "/resources")}?search={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  const page: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": route?.schemaType || "WebPage",
    name: metadata.title,
    description: metadata.description,
    url: metadata.canonicalUrl,
    inLanguage: "en-IN",
    isPartOf: {
      "@type": "WebSite",
      name: siteName,
      url: siteUrl,
    },
    primaryImageOfPage: metadata.imageUrl,
  };

  const parts: Record<string, unknown>[] = [organization, webSite, page];

  if (route && route.path !== "/") {
    parts.push({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: buildBreadcrumbs(siteUrl, siteName, route).map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: item.name,
        item: item.item,
      })),
    });
  }

  return parts;
}

export function resolveSeoMetadata(
  pathname: string,
  runtimeConfig: SeoRuntimeConfig = {}
): ResolvedSeoMetadata {
  const runtime = buildSeoRuntimeConfig(runtimeConfig);
  const route = getSeoRoute(pathname);
  const normalizedPath = normalizePathname(pathname);
  const canonicalUrl = buildAbsoluteUrl(runtime.siteUrl, normalizedPath);
  const title = buildPageTitle(runtime.siteName, route);
  const description = route?.description || DEFAULT_SEO_DESCRIPTION;
  const imageUrl = buildAbsoluteUrl(
    runtime.siteUrl,
    route?.imagePath || runtime.defaultImagePath
  );
  const robots = buildRobotsContent(route?.index ?? false);
  const keywords = [...sharedKeywords, ...(route?.keywords || [])].join(", ");

  const baseMetadata = {
    normalizedPath,
    canonicalUrl,
    title,
    description,
    keywords,
    robots,
    imageUrl,
    siteName: runtime.siteName,
    ogType: route?.ogType || "website",
    verification: {
      google: runtime.googleSiteVerification || undefined,
      bing: runtime.bingSiteVerification || undefined,
    },
    twitterHandle: runtime.twitterHandle || undefined,
  };

  return {
    ...baseMetadata,
    jsonLd: buildStructuredData(
      runtime.siteUrl,
      runtime.siteName,
      runtime.supportEmail,
      baseMetadata,
      route
    ),
  };
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function renderSeoHead(
  pathname: string,
  runtimeConfig: SeoRuntimeConfig = {}
) {
  const metadata = resolveSeoMetadata(pathname, runtimeConfig);
  const jsonLd = JSON.stringify(metadata.jsonLd).replace(/</g, "\\u003c");
  const tags = [
    `<title>${escapeHtml(metadata.title)}</title>`,
    `<meta name="description" content="${escapeHtml(metadata.description)}" />`,
    `<meta name="keywords" content="${escapeHtml(metadata.keywords || "")}" />`,
    `<meta name="robots" content="${escapeHtml(metadata.robots)}" />`,
    `<meta name="googlebot" content="${escapeHtml(metadata.robots)}" />`,
    `<meta name="author" content="${escapeHtml(metadata.siteName)}" />`,
    `<link rel="canonical" href="${escapeHtml(metadata.canonicalUrl)}" />`,
    `<meta property="og:locale" content="en_IN" />`,
    `<meta property="og:type" content="${escapeHtml(metadata.ogType)}" />`,
    `<meta property="og:site_name" content="${escapeHtml(metadata.siteName)}" />`,
    `<meta property="og:title" content="${escapeHtml(metadata.title)}" />`,
    `<meta property="og:description" content="${escapeHtml(metadata.description)}" />`,
    `<meta property="og:url" content="${escapeHtml(metadata.canonicalUrl)}" />`,
    `<meta property="og:image" content="${escapeHtml(metadata.imageUrl)}" />`,
    `<meta property="og:image:secure_url" content="${escapeHtml(metadata.imageUrl)}" />`,
    `<meta property="og:image:width" content="${DEFAULT_OG_IMAGE_WIDTH}" />`,
    `<meta property="og:image:height" content="${DEFAULT_OG_IMAGE_HEIGHT}" />`,
    `<meta property="og:image:alt" content="${escapeHtml(metadata.siteName)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${escapeHtml(metadata.title)}" />`,
    `<meta name="twitter:description" content="${escapeHtml(metadata.description)}" />`,
    `<meta name="twitter:image" content="${escapeHtml(metadata.imageUrl)}" />`,
    `<script type="application/ld+json" data-seo-schema="route">${jsonLd}</script>`,
  ];

  if (metadata.twitterHandle) {
    tags.push(
      `<meta name="twitter:site" content="${escapeHtml(metadata.twitterHandle)}" />`
    );
  }

  if (metadata.verification.google) {
    tags.push(
      `<meta name="google-site-verification" content="${escapeHtml(metadata.verification.google)}" />`
    );
  }

  if (metadata.verification.bing) {
    tags.push(
      `<meta name="msvalidate.01" content="${escapeHtml(metadata.verification.bing)}" />`
    );
  }

  return [SEO_HEAD_START_MARKER, ...tags, SEO_HEAD_END_MARKER].join("\n");
}

export function replaceSeoHead(
  html: string,
  pathname: string,
  runtimeConfig: SeoRuntimeConfig = {}
) {
  const renderedHead = renderSeoHead(pathname, runtimeConfig);
  const pattern = new RegExp(
    `${SEO_HEAD_START_MARKER}[\\s\\S]*?${SEO_HEAD_END_MARKER}`
  );

  if (pattern.test(html)) {
    return html.replace(pattern, renderedHead);
  }

  return html.replace("</head>", `${renderedHead}\n</head>`);
}

export function getIndexableSeoRoutes() {
  return seoRoutes.filter((route) => route.index && route.includeInSitemap);
}

export function generateRobotsTxt(runtimeConfig: SeoRuntimeConfig = {}) {
  const runtime = buildSeoRuntimeConfig(runtimeConfig);

  return [
    "User-agent: *",
    "Allow: /",
    "Disallow: /api/",
    "Disallow: /admin",
    "Disallow: /dashboard",
    "Disallow: /explore",
    "Disallow: /profile",
    `Sitemap: ${buildAbsoluteUrl(runtime.siteUrl, "/sitemap.xml")}`,
  ].join("\n");
}

export function generateSitemapXml(runtimeConfig: SeoRuntimeConfig = {}) {
  const runtime = buildSeoRuntimeConfig(runtimeConfig);
  const lastModified = runtime.currentIsoDate;

  const urls = getIndexableSeoRoutes()
    .map((route) => {
      const parts = [
        "  <url>",
        `    <loc>${buildAbsoluteUrl(runtime.siteUrl, route.path)}</loc>`,
        `    <lastmod>${lastModified}</lastmod>`,
      ];

      if (route.changeFrequency) {
        parts.push(`    <changefreq>${route.changeFrequency}</changefreq>`);
      }

      if (typeof route.priority === "number") {
        parts.push(`    <priority>${route.priority.toFixed(1)}</priority>`);
      }

      parts.push("  </url>");
      return parts.join("\n");
    })
    .join("\n");

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    urls,
    "</urlset>",
  ].join("\n");
}

export function getIndexNowKeyLocation(
  runtimeConfig: SeoRuntimeConfig = {}
) {
  const runtime = buildSeoRuntimeConfig(runtimeConfig);

  if (!runtime.indexNowKey) return "";

  return buildAbsoluteUrl(runtime.siteUrl, `/${runtime.indexNowKey}.txt`);
}

export function getIndexNowUrlList(runtimeConfig: SeoRuntimeConfig = {}) {
  const runtime = buildSeoRuntimeConfig(runtimeConfig);
  return getIndexableSeoRoutes().map((route) =>
    buildAbsoluteUrl(runtime.siteUrl, route.path)
  );
}
