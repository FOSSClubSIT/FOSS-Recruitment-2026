function normalizeBaseUrl(value: string) {
  const trimmed = value.trim().replace(/\/+$/, "");
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

export function getSiteUrl() {
  const configuredUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (configuredUrl) return normalizeBaseUrl(configuredUrl);

  const vercelUrl = process.env.VERCEL_URL?.trim();
  if (vercelUrl) return normalizeBaseUrl(vercelUrl);

  if (typeof window !== "undefined") return window.location.origin;
  if (process.env.NODE_ENV === "production") {
    throw new Error("NEXT_PUBLIC_APP_URL must be configured in production.");
  }

  return "http://localhost:3000";
}

export function getPortfolioUrl(slug: string) {
  return `${getSiteUrl()}/portfolio/${encodeURIComponent(slug)}`;
}
