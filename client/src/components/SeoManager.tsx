import { useEffect } from "react";
import { useLocation } from "wouter";

import { getCanonicalUrl } from "@/lib/siteConfig";

const NO_INDEX_PATHS = new Set(["/admin", "/dashboard", "/profile"]);

function ensureMeta(name: string) {
  let meta = document.querySelector(`meta[name="${name}"]`);

  if (!(meta instanceof HTMLMetaElement)) {
    meta = document.createElement("meta");
    meta.setAttribute("name", name);
    document.head.appendChild(meta);
  }

  return meta;
}

function ensureCanonicalLink() {
  let link = document.querySelector('link[rel="canonical"]');

  if (!(link instanceof HTMLLinkElement)) {
    link = document.createElement("link");
    link.setAttribute("rel", "canonical");
    document.head.appendChild(link);
  }

  return link;
}

export default function SeoManager() {
  const [location] = useLocation();

  useEffect(() => {
    const robotsMeta = ensureMeta("robots");
    const canonicalLink = ensureCanonicalLink();

    robotsMeta.setAttribute(
      "content",
      NO_INDEX_PATHS.has(location) ? "noindex, nofollow" : "index, follow"
    );
    canonicalLink.setAttribute("href", getCanonicalUrl(location));
  }, [location]);

  return null;
}
