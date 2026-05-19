// "Рядом" search core — pure, unit-testable, and privacy-first.
//
// The output cards NEVER contain a therapist's real coordinates. For
// the map we only ever attach a coarse AREA centroid (a public
// district center), not the therapist point. Precise distance maths
// happens here on the server; the client gets a rounded bucket.

import type { Profile, TherapistAvailability } from "./types";
import {
  approxDistanceKm,
  arrivalEstimate,
  findArea,
  haversineKm,
} from "./geo";

export interface NearbyFilters {
  availableNow?: boolean;
  massageType?: string;
  gender?: "female" | "male";
  priceMin?: number;
  priceMax?: number;
  language?: string;
  visit?: "villa" | "hotel" | "home" | "own";
}

export interface NearbyQuery {
  lat?: number;
  lng?: number;
  area?: string;
  radiusKm?: number;
  filters?: NearbyFilters;
}

export interface NearbyCard {
  profile_id: string;
  slug: string;
  full_name: string;
  gender: "female" | "male" | null;
  verified: boolean;
  years_experience: number;
  massage_types: string[];
  price_from: number | null;
  languages: string[];
  whatsapp: string | null;
  visit_types: string[];
  photo_url: string | null;
  available_until: string;
  available_now: boolean;
  area_label: string;
  approx_distance_km: number | null;
  arrival_min: number | null;
  arrival_max: number | null;
  // Coarse district centroid for the map — public knowledge, NOT the
  // therapist's location. null hides the marker entirely.
  area_center: { lat: number; lng: number } | null;
}

function nowHM(d = new Date()): string {
  return `${String(d.getHours()).padStart(2, "0")}:${String(
    d.getMinutes()
  ).padStart(2, "0")}`;
}

function visitTypes(p: Profile): string[] {
  const v: string[] = [];
  if (p.travels_to_client) v.push("выезд к клиенту");
  if (p.works_in_villas) v.push("вилла / загородный дом");
  if (p.works_in_hotels) v.push("отель");
  if (p.works_at_own_place) v.push("у мастера");
  if (p.works_in_salon) v.push("салон");
  return v;
}

function matchesVisit(p: Profile, visit: NearbyFilters["visit"]): boolean {
  switch (visit) {
    case "villa":
      return p.works_in_villas;
    case "hotel":
      return p.works_in_hotels;
    case "home":
      return p.travels_to_client;
    case "own":
      return p.works_at_own_place;
    default:
      return true;
  }
}

// Areas a therapist advertises serving (coarse labels only).
function servedAreas(
  a: TherapistAvailability,
  p: Profile
): string[] {
  const set = new Set<string>();
  if (a.approximate_area) set.add(a.approximate_area);
  if (a.manual_area) set.add(a.manual_area);
  if (p.home_base_area) set.add(p.home_base_area);
  if (p.district) set.add(p.district);
  for (const d of p.travel_districts ?? []) set.add(d);
  return Array.from(set);
}

function passesFilters(
  p: Profile,
  available_now: boolean,
  f: NearbyFilters | undefined
): boolean {
  if (!f) return true;
  if (f.availableNow && !available_now) return false;
  if (f.gender && p.gender !== f.gender) return false;
  if (f.priceMin != null && (p.price_from ?? 0) < f.priceMin) return false;
  if (
    f.priceMax != null &&
    p.price_from != null &&
    p.price_from > f.priceMax
  )
    return false;
  if (
    f.language &&
    !(p.languages ?? []).some(
      (l) => l.toLowerCase() === f.language!.toLowerCase()
    )
  )
    return false;
  if (
    f.massageType &&
    !(p.services ?? []).some(
      (s) =>
        s.modality?.toLowerCase().includes(f.massageType!.toLowerCase()) ||
        s.title?.toLowerCase().includes(f.massageType!.toLowerCase())
    )
  )
    return false;
  if (f.visit && !matchesVisit(p, f.visit)) return false;
  return true;
}

// Build privacy-safe cards from the already-vetted live list (callers
// pass only active / verified / published / non-expired rows).
export function buildNearbyResults(
  live: { availability: TherapistAvailability; profile: Profile }[],
  query: NearbyQuery,
  now: Date = new Date()
): NearbyCard[] {
  const radiusKm = query.radiusKm && query.radiusKm > 0 ? query.radiusKm : 5;
  const hm = nowHM(now);
  const clientArea = findArea(query.area);
  const hasClientCoords =
    typeof query.lat === "number" && typeof query.lng === "number";

  const cards: (NearbyCard & { _dist: number | null })[] = [];

  for (const { availability: a, profile: p } of live) {
    const available_now = a.start_time <= hm && hm <= a.end_time;

    // Coarse area the therapist advertises + its public centroid.
    const areaLabel =
      a.approximate_area ||
      a.manual_area ||
      p.home_base_area ||
      p.district ||
      "район по согласованию";
    const areaGeo =
      findArea(a.approximate_area) ||
      findArea(a.manual_area) ||
      findArea(p.home_base_area) ||
      findArea(p.district);

    // Reference point for distance maths (server-only, never returned).
    let refLat: number | null = null;
    let refLng: number | null = null;
    if (
      a.location_mode === "current_location" &&
      a.latitude != null &&
      a.longitude != null
    ) {
      refLat = a.latitude;
      refLng = a.longitude;
    } else if (areaGeo) {
      refLat = areaGeo.lat;
      refLng = areaGeo.lng;
    }

    const served = servedAreas(a, p).map((s) => s.toLowerCase());
    const servesClientArea = clientArea
      ? served.includes(clientArea.label.toLowerCase())
      : false;

    let distanceKm: number | null = null;
    let visible = false;

    if (hasClientCoords && refLat != null && refLng != null) {
      const raw = haversineKm(query.lat!, query.lng!, refLat, refLng);
      distanceKm = approxDistanceKm(raw);
      const effRadius = Math.max(
        radiusKm,
        a.service_radius_km || 0,
        p.default_service_radius_km || 0
      );
      visible = raw <= effRadius || servesClientArea;
    } else if (clientArea) {
      // No coords (or hidden location) — match by served area only.
      visible = servesClientArea;
      distanceKm = null;
    } else {
      // No client location at all → show everyone live (area-only view).
      visible = true;
      distanceKm =
        hasClientCoords && refLat != null && refLng != null
          ? approxDistanceKm(
              haversineKm(query.lat!, query.lng!, refLat, refLng)
            )
          : null;
    }

    if (a.location_mode === "hidden_exact_location") {
      distanceKm = null; // never expose distance for hidden mode
    }

    if (!visible) continue;
    if (!passesFilters(p, available_now, query.filters)) continue;

    const arrival =
      distanceKm != null ? arrivalEstimate(distanceKm) : null;
    const photo =
      (p.media ?? []).find(
        (m) => m.type === "profile_photo" && m.is_published
      )?.url ?? null;

    cards.push({
      _dist: distanceKm,
      profile_id: p.id,
      slug: p.slug,
      full_name: p.full_name,
      gender: p.show_gender ? p.gender ?? null : null,
      verified: p.moderation_status === "approved",
      years_experience: p.years_experience ?? 0,
      massage_types: (p.services ?? [])
        .filter((s) => s.is_published)
        .map((s) => s.title)
        .slice(0, 4),
      price_from: p.price_from ?? null,
      languages: p.languages ?? [],
      whatsapp: p.whatsapp ?? null,
      visit_types: visitTypes(p),
      photo_url: photo,
      available_until: a.end_time,
      available_now,
      area_label: areaLabel,
      approx_distance_km: distanceKm,
      arrival_min: arrival?.min ?? null,
      arrival_max: arrival?.max ?? null,
      area_center: areaGeo ? { lat: areaGeo.lat, lng: areaGeo.lng } : null,
    });
  }

  // Sort: available now first, then nearest, then quality, then exp.
  const qById = new Map(live.map(({ profile }) => [profile.id, profile]));
  cards.sort((x, y) => {
    if (x.available_now !== y.available_now)
      return x.available_now ? -1 : 1;
    const dx = x._dist ?? Number.POSITIVE_INFINITY;
    const dy = y._dist ?? Number.POSITIVE_INFINITY;
    if (dx !== dy) return dx - dy;
    const px = qById.get(x.profile_id);
    const py = qById.get(y.profile_id);
    const qd = (py?.quality_score ?? 0) - (px?.quality_score ?? 0);
    if (qd !== 0) return qd;
    return (py?.years_experience ?? 0) - (px?.years_experience ?? 0);
  });

  return cards.map(({ _dist, ...c }) => c);
}
