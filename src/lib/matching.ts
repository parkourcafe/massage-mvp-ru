import type { Profile } from "./types";
import { modalityLabel } from "./catalog";

export interface MatchQuestionnaire {
  massage_goal?: string;
  pain_or_focus_area?: string;
  preferred_service_type?: string; // modality key
  pressure_preference?: "soft" | "medium" | "strong" | "not_sure";
  duration_preference?: number;
  therapist_gender_preference?: "no_preference" | "female" | "male";
  city?: string;
  district?: string;
  location_type?: string;
  needs_travel_to_client?: boolean;
  preferred_date?: string;
  preferred_time?: string;
  budget?: number;
  language_preference?: string;
  important_notes?: string;
  contraindications_or_health_notes?: string;
}

export interface MatchResult {
  profile: Profile;
  score: number; // 0..100
  reasons: string[]; // why this therapist fits
  risks: string[]; // what to clarify
  serviceRecommendation: string;
  price: number | null;
  district: string | null;
}

function ci(a?: string | null, b?: string | null): boolean {
  if (!a || !b) return false;
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}

function profileMinPrice(p: Profile): number | null {
  const prices = (p.services ?? [])
    .filter((s) => s.is_published && (s.price ?? 0) > 0)
    .map((s) => s.price as number);
  if (prices.length) return Math.min(...prices);
  return p.price_from ?? null;
}

function locationCompatible(p: Profile, q: MatchQuestionnaire): boolean {
  // City must match (or the therapist travels and questionnaire needs travel).
  const cityOk = q.city ? ci(p.city, q.city) : true;
  if (!cityOk) {
    // Travel-to-client therapists can still serve nearby districts only if same city.
    return false;
  }
  if (q.needs_travel_to_client && !p.travels_to_client) return false;

  switch (q.location_type) {
    case "client_home":
      return p.travels_to_client;
    case "hotel":
      return p.works_in_hotels;
    case "villa":
      return p.works_in_villas;
    case "salon":
      return p.works_in_salon;
    case "therapist_place":
      return p.works_at_own_place;
    default:
      return true; // 'discuss' or unset
  }
}

// Hard filters — a profile that fails any of these is excluded.
export function passesHardFilters(p: Profile, q: MatchQuestionnaire): boolean {
  if (!p.is_published || p.moderation_status !== "approved") return false;

  // Service type
  if (q.preferred_service_type) {
    const hasService = (p.services ?? []).some(
      (s) => s.is_published && s.modality === q.preferred_service_type
    );
    if (!hasService) return false;
  }

  // Budget
  if (q.budget && q.budget > 0) {
    const min = profileMinPrice(p);
    if (min != null && min > q.budget) return false;
  }

  // Location format
  if (!locationCompatible(p, q)) return false;

  // Gender preference (only when explicitly chosen and therapist shows it)
  if (q.therapist_gender_preference && q.therapist_gender_preference !== "no_preference") {
    if (!p.show_gender || p.gender !== q.therapist_gender_preference) return false;
  }

  return true;
}

// Soft fit score (0..100) with human-readable reasons / risks.
export function scoreProfile(p: Profile, q: MatchQuestionnaire): MatchResult {
  let score = 50;
  const reasons: string[] = [];
  const risks: string[] = [];

  // Experience
  if (p.years_experience >= 8) {
    score += 12;
    reasons.push(`Большой опыт: ${p.years_experience} лет`);
  } else if (p.years_experience >= 3) {
    score += 7;
    reasons.push(`Опыт работы: ${p.years_experience} лет`);
  } else {
    risks.push("Небольшой опыт — уточните портфолио и отзывы");
  }

  // Service match
  const matchedService = (p.services ?? []).find(
    (s) => s.is_published && s.modality === q.preferred_service_type
  );
  if (matchedService) {
    score += 12;
    reasons.push(`Делает «${modalityLabel(matchedService.modality)}»`);
  }

  // Pressure style — heuristic from services / deep tissue presence
  if (q.pressure_preference && q.pressure_preference !== "not_sure") {
    const hasDeep = (p.services ?? []).some((s) =>
      ["deep_tissue", "sports", "therapeutic"].includes(s.modality)
    );
    const hasSoft = (p.services ?? []).some((s) =>
      ["relaxing", "anti_stress", "lymphatic"].includes(s.modality)
    );
    if (q.pressure_preference === "strong" && hasDeep) {
      score += 8;
      reasons.push("Работает с сильным нажимом (глубокий/спортивный массаж)");
    } else if (q.pressure_preference === "soft" && hasSoft) {
      score += 8;
      reasons.push("Есть мягкие техники (расслабляющий/лимфодренаж)");
    } else {
      risks.push("Уточните силу нажима у специалиста");
    }
  }

  // Massage goal keyword overlap with description
  if (q.massage_goal && p.professional_description) {
    const goal = q.massage_goal.toLowerCase();
    if (
      p.professional_description.toLowerCase().includes(goal.split(" ")[0] ?? "___") ||
      (p.headline ?? "").toLowerCase().includes(goal.split(" ")[0] ?? "___")
    ) {
      score += 5;
      reasons.push("Специализация совпадает с вашей целью");
    }
  }

  // Language
  if (q.language_preference) {
    if (p.languages.some((l) => ci(l, q.language_preference))) {
      score += 4;
      reasons.push(`Говорит на языке: ${q.language_preference}`);
    } else {
      risks.push(`Уточните язык общения (${q.language_preference})`);
    }
  }

  // Certificates / media completeness
  const media = p.media ?? [];
  if (media.some((m) => m.type === "certificate" || m.type === "diploma")) {
    score += 6;
    reasons.push("Загружены сертификаты / дипломы");
  } else {
    risks.push("Нет загруженных сертификатов — попросите подтверждение квалификации");
  }
  if (media.length >= 4) {
    score += 4;
    reasons.push("Заполненный профиль с фото/видео");
  }

  // Quality score boost
  score += Math.round((p.quality_score / 100) * 8);

  // Travel convenience
  if (q.district && ci(p.district, q.district)) {
    score += 5;
    reasons.push(`Тот же район: ${p.district}`);
  } else if (q.needs_travel_to_client && p.travels_to_client) {
    score += 3;
    reasons.push("Выезжает к клиенту");
    if (p.transport_fee) risks.push(`Возможна плата за выезд: ${p.transport_fee} ₽`);
  }

  if (p.minimum_booking_price && q.budget && p.minimum_booking_price > q.budget) {
    risks.push(`Минимальная стоимость сеанса: ${p.minimum_booking_price} ₽`);
  }

  if (q.contraindications_or_health_notes) {
    risks.push(
      "Есть отметки о здоровье — обсудите противопоказания со специалистом (это не медицинская консультация)"
    );
  }

  score = Math.max(0, Math.min(100, Math.round(score)));

  const price = matchedService?.price ?? profileMinPrice(p);
  const serviceRecommendation = matchedService
    ? `${modalityLabel(matchedService.modality)}${matchedService.duration ? `, ${matchedService.duration} мин` : ""}`
    : (p.services ?? [])[0]
      ? modalityLabel((p.services ?? [])[0].modality)
      : "Обсудить со специалистом";

  return {
    profile: p,
    score,
    reasons: reasons.slice(0, 5),
    risks: risks.slice(0, 4),
    serviceRecommendation,
    price,
    district: p.district ?? null,
  };
}

export function runMatch(
  profiles: Profile[],
  q: MatchQuestionnaire,
  limit = 3
): MatchResult[] {
  return profiles
    .filter((p) => passesHardFilters(p, q))
    .map((p) => scoreProfile(p, q))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
