import { useEffect } from "react";
import { useLocation } from "wouter";

import {
  resolveSeoMetadata,
} from "@shared/seo";
import { siteConfig } from "@/lib/siteConfig";

const GOOGLE_SITE_VERIFICATION = import.meta.env.VITE_GOOGLE_SITE_VERIFICATION;
const BING_SITE_VERIFICATION = import.meta.env.VITE_BING_SITE_VERIFICATION;
const TWITTER_HANDLE = import.meta.env.VITE_TWITTER_HANDLE;

function ensureMetaByName(name: string) {
  let meta = document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);

  if (!(meta instanceof HTMLMetaElement)) {
    meta = document.createElement("meta");
    meta.setAttribute("name", name);
    document.head.appendChild(meta);
  }

  return meta;
}

function ensureMetaByProperty(property: string) {
  let meta = document.querySelector<HTMLMetaElement>(
    `meta[property="${property}"]`
  );

  if (!(meta instanceof HTMLMetaElement)) {
    meta = document.createElement("meta");
    meta.setAttribute("property", property);
    document.head.appendChild(meta);
  }

  return meta;
}

function ensureCanonicalLink() {
  let link = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');

  if (!(link instanceof HTMLLinkElement)) {
    link = document.createElement("link");
    link.setAttribute("rel", "canonical");
    document.head.appendChild(link);
  }

  return link;
}

function ensureRouteSchemaScript() {
  let script = document.querySelector<HTMLScriptElement>(
    'script[data-seo-schema="route"]'
  );

  if (!(script instanceof HTMLScriptElement)) {
    script = document.createElement("script");
    script.type = "application/ld+json";
    script.dataset.seoSchema = "route";
    document.head.appendChild(script);
  }

  return script;
}

function setMetaContent(
  meta: HTMLMetaElement,
  value?: string
) {
  if (!value) {
    meta.remove();
    return;
  }

  meta.setAttribute("content", value);
}

export default function SeoManager() {
  const [location] = useLocation();

  useEffect(() => {
    const metadata = resolveSeoMetadata(location, {
      siteName: siteConfig.siteName,
      siteUrl: siteConfig.siteUrl,
      supportEmail: siteConfig.supportEmail,
      googleSiteVerification: GOOGLE_SITE_VERIFICATION,
      bingSiteVerification: BING_SITE_VERIFICATION,
      twitterHandle: TWITTER_HANDLE,
    });

    document.title = metadata.title;

    setMetaContent(ensureMetaByName("description"), metadata.description);
    setMetaContent(ensureMetaByName("keywords"), metadata.keywords);
    setMetaContent(ensureMetaByName("robots"), metadata.robots);
    setMetaContent(ensureMetaByName("googlebot"), metadata.robots);
    setMetaContent(ensureMetaByName("author"), metadata.siteName);
    setMetaContent(
      ensureMetaByName("google-site-verification"),
      metadata.verification.google
    );
    setMetaContent(
      ensureMetaByName("msvalidate.01"),
      metadata.verification.bing
    );
    setMetaContent(ensureMetaByName("twitter:card"), "summary_large_image");
    setMetaContent(ensureMetaByName("twitter:title"), metadata.title);
    setMetaContent(
      ensureMetaByName("twitter:description"),
      metadata.description
    );
    setMetaContent(ensureMetaByName("twitter:image"), metadata.imageUrl);
    setMetaContent(
      ensureMetaByName("twitter:site"),
      metadata.twitterHandle
    );

    setMetaContent(ensureMetaByProperty("og:locale"), "en_IN");
    setMetaContent(ensureMetaByProperty("og:type"), metadata.ogType);
    setMetaContent(
      ensureMetaByProperty("og:site_name"),
      metadata.siteName
    );
    setMetaContent(ensureMetaByProperty("og:title"), metadata.title);
    setMetaContent(
      ensureMetaByProperty("og:description"),
      metadata.description
    );
    setMetaContent(ensureMetaByProperty("og:url"), metadata.canonicalUrl);
    setMetaContent(ensureMetaByProperty("og:image"), metadata.imageUrl);
    setMetaContent(
      ensureMetaByProperty("og:image:secure_url"),
      metadata.imageUrl
    );
    setMetaContent(ensureMetaByProperty("og:image:width"), "512");
    setMetaContent(ensureMetaByProperty("og:image:height"), "512");
    setMetaContent(
      ensureMetaByProperty("og:image:alt"),
      metadata.siteName
    );

    ensureCanonicalLink().setAttribute("href", metadata.canonicalUrl);
    ensureRouteSchemaScript().textContent = JSON.stringify(metadata.jsonLd);
  }, [location]);

  return null;
}
