import type { Profile } from "./types";

// Profile quality score (0..100). A profile is only SEO-indexed at
// /therapist/[slug] when the score is >= 70 (see src/lib/seo.ts).
export interface QualityBreakdown {
  score: number;
  parts: { key: string; label: string; points: number; max: number; ok: boolean }[];
}

export function computeQualityScore(profile: Profile): QualityBreakdown {
  const media = profile.media ?? [];
  const services = (profile.services ?? []).filter((s) => s.is_published);

  const hasProfilePhoto = media.some((m) => m.type === "profile_photo");
  const hasServices = services.length > 0;
  const hasLocation = Boolean(profile.city && profile.district);
  const hasWorkFormat =
    profile.works_at_own_place ||
    profile.travels_to_client ||
    profile.works_in_hotels ||
    profile.works_in_villas ||
    profile.works_in_salon;
  const hasPrices = services.some((s) => (s.price ?? 0) > 0) || (profile.price_from ?? 0) > 0;
  const hasExperience = profile.years_experience > 0;
  const hasCertificates = media.some(
    (m) => m.type === "certificate" || m.type === "diploma"
  );
  const hasMedia =
    media.filter((m) =>
      ["gallery_photo", "workspace_photo", "equipment_photo", "intro_video"].includes(m.type)
    ).length > 0;
  const hasSafety = Boolean(
    profile.safety_boundaries && profile.safety_boundaries.trim().length >= 20
  );
  const hasFaq = (profile.faq ?? []).length > 0;

  const parts = [
    { key: "profile_photo", label: "Фото профиля", max: 14, ok: hasProfilePhoto },
    { key: "services", label: "Услуги", max: 14, ok: hasServices },
    { key: "location", label: "Город / район", max: 10, ok: hasLocation },
    { key: "work_format", label: "Формат работы", max: 10, ok: hasWorkFormat },
    { key: "prices", label: "Цены", max: 12, ok: hasPrices },
    { key: "experience", label: "Опыт", max: 8, ok: hasExperience },
    { key: "certificates", label: "Сертификаты / дипломы", max: 12, ok: hasCertificates },
    { key: "media", label: "Медиа (фото/видео)", max: 8, ok: hasMedia },
    { key: "safety", label: "Профессиональные границы", max: 6, ok: hasSafety },
    { key: "faq", label: "FAQ", max: 6, ok: hasFaq },
  ].map((p) => ({ ...p, points: p.ok ? p.max : 0 }));

  const score = parts.reduce((sum, p) => sum + p.points, 0);
  return { score, parts };
}

export const QUALITY_INDEX_THRESHOLD = 70;

export function isIndexable(profile: Profile): boolean {
  return (
    profile.is_published &&
    profile.moderation_status === "approved" &&
    computeQualityScore(profile).score >= QUALITY_INDEX_THRESHOLD
  );
}
