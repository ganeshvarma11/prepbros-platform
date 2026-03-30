const DEFAULT_SITE_NAME = "PrepBros";
const DEFAULT_SUPPORT_EMAIL = "support@prepbros.in";
const DEFAULT_EFFECTIVE_DATE = "March 25, 2026";
const DEFAULT_SITE_URL = "https://prepbros.in";
const LOCAL_HOSTNAMES = new Set(["localhost", "127.0.0.1", "0.0.0.0"]);

export const siteConfig = {
  siteName: import.meta.env.VITE_SITE_NAME || DEFAULT_SITE_NAME,
  siteUrl: (import.meta.env.VITE_SITE_URL || DEFAULT_SITE_URL).replace(/\/+$/, ""),
  legalEntity: import.meta.env.VITE_LEGAL_ENTITY || DEFAULT_SITE_NAME,
  supportEmail: import.meta.env.VITE_SUPPORT_EMAIL || DEFAULT_SUPPORT_EMAIL,
  billingEmail:
    import.meta.env.VITE_BILLING_EMAIL ||
    import.meta.env.VITE_SUPPORT_EMAIL ||
    DEFAULT_SUPPORT_EMAIL,
  companyAddress:
    import.meta.env.VITE_COMPANY_ADDRESS || "Hyderabad, Telangana, India",
  governingLaw: import.meta.env.VITE_GOVERNING_LAW || "India",
  legalEffectiveDate:
    import.meta.env.VITE_LEGAL_EFFECTIVE_DATE || DEFAULT_EFFECTIVE_DATE,
  paymentProviderLabel:
    import.meta.env.VITE_PAYMENT_PROVIDER_LABEL || "our secure checkout partner",
  monthlyCheckoutUrl: import.meta.env.VITE_PRO_MONTHLY_CHECKOUT_URL || "",
  annualCheckoutUrl: import.meta.env.VITE_PRO_ANNUAL_CHECKOUT_URL || "",
};

function getConfiguredSiteOrigin() {
  try {
    return new URL(siteConfig.siteUrl).origin;
  } catch {
    return "";
  }
}

export function isLocalHostname(hostname: string) {
  return LOCAL_HOSTNAMES.has(hostname) || hostname.endsWith(".local");
}

export function getSiteOrigin() {
  if (typeof window === "undefined") return "";
  return window.location.origin || siteConfig.siteUrl;
}

export function getPreferredSiteOrigin() {
  if (typeof window !== "undefined" && isLocalHostname(window.location.hostname)) {
    return window.location.origin;
  }

  return getConfiguredSiteOrigin() || siteConfig.siteUrl;
}

export function buildPreferredSiteUrl(path: string) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${getPreferredSiteOrigin()}${normalizedPath}`;
}

export function shouldRedirectToConfiguredHost() {
  if (typeof window === "undefined") return false;
  if (isLocalHostname(window.location.hostname)) return false;

  const configuredOrigin = getConfiguredSiteOrigin();
  if (!configuredOrigin || configuredOrigin === window.location.origin) {
    return false;
  }

  return window.location.hostname.endsWith(".vercel.app");
}

export function getPolicyUrl(path: string) {
  const origin = getSiteOrigin();
  return origin ? `${origin}${path}` : path;
}

export function getCanonicalUrl(path: string) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${siteConfig.siteUrl}${normalizedPath}`;
}

export function buildMailtoLink(
  email: string,
  options?: { subject?: string; body?: string }
) {
  const params = new URLSearchParams();

  if (options?.subject) params.set("subject", options.subject);
  if (options?.body) params.set("body", options.body);

  const query = params.toString();
  return query ? `mailto:${email}?${query}` : `mailto:${email}`;
}

export function getPremiumCheckoutUrl(plan: "monthly" | "annual") {
  return plan === "monthly"
    ? siteConfig.monthlyCheckoutUrl
    : siteConfig.annualCheckoutUrl;
}

export function getPremiumSupportUrl(plan: "monthly" | "annual") {
  const label = plan === "monthly" ? "PrepBros Pro Monthly" : "PrepBros Annual";
  const params = new URLSearchParams({
    category: "Billing",
    subject: `${label} access`,
    message:
      "I want to upgrade and need help with checkout or billing. Please share the next step.",
  });

  return `/support?${params.toString()}`;
}
