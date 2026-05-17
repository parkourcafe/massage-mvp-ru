import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";
import { CITIES, MODALITIES } from "@/lib/catalog";
import { listPublicProfiles } from "@/lib/db";
import { isIndexable } from "@/lib/quality";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const urls: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, priority: 1 },
    { url: `${SITE_URL}/therapists`, lastModified: now, priority: 0.9 },
    { url: `${SITE_URL}/pricing`, lastModified: now, priority: 0.5 },
    { url: `${SITE_URL}/examples`, lastModified: now, priority: 0.5 },
  ];

  for (const m of MODALITIES) {
    urls.push({
      url: `${SITE_URL}/therapists/${m.slug}`,
      lastModified: now,
      priority: 0.7,
    });
    for (const c of CITIES) {
      urls.push({
        url: `${SITE_URL}/therapists/${m.slug}/${c.slug}`,
        lastModified: now,
        priority: 0.6,
      });
    }
  }
  for (const c of CITIES) {
    urls.push({
      url: `${SITE_URL}/therapists/${c.slug}`,
      lastModified: now,
      priority: 0.7,
    });
  }

  // Only quality-gated profiles (score >= 70) are indexed.
  for (const p of listPublicProfiles()) {
    if (isIndexable(p)) {
      urls.push({
        url: `${SITE_URL}/therapist/${p.slug}`,
        lastModified: new Date(p.updated_at),
        priority: 0.8,
      });
    }
  }

  return urls;
}
