import type { Metadata } from "next";

export { PLATFORM_NOTICE, MEDICAL_DISCLAIMER } from "./catalog";

export const SITE_NAME = "MassageMatch";
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "http://localhost:3000";

// Routes that must NEVER be indexed (dashboard, admin, private tokens, etc.)
const NOINDEX_PREFIXES = [
  "/dashboard",
  "/admin",
  "/favorites",
  "/match/results",
  "/booking/",
  "/client/",
];

const NOINDEX_SUFFIXES = ["/booking"]; // /therapist/[slug]/booking

export function isNoindexPath(pathname: string): boolean {
  if (NOINDEX_PREFIXES.some((p) => pathname === p || pathname.startsWith(p))) {
    return true;
  }
  if (NOINDEX_SUFFIXES.some((s) => pathname.endsWith(s))) return true;
  return false;
}

export const NOINDEX: Metadata["robots"] = {
  index: false,
  follow: false,
  nocache: true,
  googleBot: { index: false, follow: false },
};

export const INDEX: Metadata["robots"] = {
  index: true,
  follow: true,
};

// A directory/landing page (modality, city, modality×city) is only
// indexed and listed in the sitemap when it has at least this many
// public profiles. Empty/near-empty pages would be thin/doorway
// content — especially penalised by Yandex.
export const MIN_INDEXABLE_RESULTS = 1;

export function pageMetadata(opts: {
  title: string;
  description?: string;
  path?: string;
  noindex?: boolean;
}): Metadata {
  const url = opts.path ? `${SITE_URL}${opts.path}` : SITE_URL;
  return {
    title: `${opts.title} — ${SITE_NAME}`,
    description: opts.description,
    alternates: { canonical: url },
    robots: opts.noindex ? NOINDEX : INDEX,
    openGraph: {
      title: opts.title,
      description: opts.description,
      url,
      siteName: SITE_NAME,
    },
  };
}
