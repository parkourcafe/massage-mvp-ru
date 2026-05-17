import type { MetadataRoute } from "next";
import { MIN_INDEXABLE_RESULTS, SITE_URL } from "@/lib/seo";
import { CITIES, MODALITIES } from "@/lib/catalog";
import { listPublicProfiles } from "@/lib/db";
import { isIndexable } from "@/lib/quality";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const urls: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, priority: 1 },
    { url: `${SITE_URL}/therapists`, lastModified: now, priority: 0.9 },
    { url: `${SITE_URL}/pricing`, lastModified: now, priority: 0.5 },
    { url: `${SITE_URL}/examples`, lastModified: now, priority: 0.5 },
  ];

  // Only list a modality/city/combo page when it has real inventory —
  // mirrors the noindex gate on those pages so the sitemap never points
  // crawlers at thin/empty results. Same predicate as listPublicProfiles.
  const profiles = await listPublicProfiles();
  const hasModality = (key: string) => (p: (typeof profiles)[number]) =>
    (p.services ?? []).some((s) => s.is_published && s.modality === key);
  const inCity = (label: string) => (p: (typeof profiles)[number]) =>
    (p.city ?? "").toLowerCase() === label.toLowerCase();
  const enough = (n: number) => n >= MIN_INDEXABLE_RESULTS;

  for (const m of MODALITIES) {
    const byModality = profiles.filter(hasModality(m.key));
    if (enough(byModality.length)) {
      urls.push({
        url: `${SITE_URL}/therapists/${m.slug}`,
        lastModified: now,
        priority: 0.7,
      });
    }
    for (const c of CITIES) {
      if (enough(byModality.filter(inCity(c.label)).length)) {
        urls.push({
          url: `${SITE_URL}/therapists/${m.slug}/${c.slug}`,
          lastModified: now,
          priority: 0.6,
        });
      }
    }
  }
  for (const c of CITIES) {
    if (enough(profiles.filter(inCity(c.label)).length)) {
      urls.push({
        url: `${SITE_URL}/therapists/${c.slug}`,
        lastModified: now,
        priority: 0.7,
      });
    }
  }

  // Only quality-gated profiles (score >= 70) are indexed.
  for (const p of await listPublicProfiles()) {
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
