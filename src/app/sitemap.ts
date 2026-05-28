import type { MetadataRoute } from "next";
import { states } from "@/lib/strand/data";
import { listDirectoryProfiles } from "@/lib/strand/repository";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const directoryProfiles = await listDirectoryProfiles();
  const now = new Date();
  const urls: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, priority: 1 },
    { url: `${SITE_URL}/age-gate`, lastModified: now, priority: 0.7 },
    { url: `${SITE_URL}/directory`, lastModified: now, priority: 0.9 },
    { url: `${SITE_URL}/auth`, lastModified: now, priority: 0.5 },
    { url: `${SITE_URL}/legal/terms`, lastModified: now, priority: 0.4 },
    { url: `${SITE_URL}/legal/privacy`, lastModified: now, priority: 0.4 },
    { url: `${SITE_URL}/legal/18-plus`, lastModified: now, priority: 0.4 },
    { url: `${SITE_URL}/legal/report-a-concern`, lastModified: now, priority: 0.4 },
  ];

  for (const state of states) {
    urls.push({
      url: `${SITE_URL}/directory/${state.slug}`,
      lastModified: now,
      priority: 0.7,
    });

    for (const city of state.cities) {
      urls.push({
        url: `${SITE_URL}/directory/${state.slug}/${city
          .toLowerCase()
          .replaceAll(" ", "-")}`,
        lastModified: now,
        priority: 0.6,
      });
    }
  }

  for (const profile of directoryProfiles) {
    urls.push({
      url: `${SITE_URL}/models/${profile.slug}`,
      lastModified: now,
      priority: profile.publicationStatus === "live" ? 0.8 : 0.3,
    });
  }

  return urls;
}
