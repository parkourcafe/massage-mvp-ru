// Geo helpers for the "Рядом" (nearby) feature.
//
// Privacy model: a therapist's exact coordinates never leave the
// server. We only ever expose a coarse AREA (district centroid) and a
// rounded approximate distance. Area centroids below are public
// knowledge (district centers), not therapist locations.

export interface GeoArea {
  key: string;
  label: string;
  city: string;
  lat: number;
  lng: number;
}

// Central districts of the two cities the demo data uses. Coordinates
// are approximate district centers (public), used for coarse distance
// and area-level map markers only.
export const AREAS: GeoArea[] = [
  // Москва
  { key: "khamovniki", label: "Хамовники", city: "Москва", lat: 55.7297, lng: 37.5806 },
  { key: "arbat", label: "Арбат", city: "Москва", lat: 55.7494, lng: 37.5910 },
  { key: "yakimanka", label: "Якиманка", city: "Москва", lat: 55.7339, lng: 37.6086 },
  { key: "tverskoy", label: "Тверской", city: "Москва", lat: 55.7676, lng: 37.6010 },
  { key: "presnensky", label: "Пресненский", city: "Москва", lat: 55.7610, lng: 37.5560 },
  { key: "basmanny", label: "Басманный", city: "Москва", lat: 55.7680, lng: 37.6680 },
  { key: "zamoskvorechye", label: "Замоскворечье", city: "Москва", lat: 55.7360, lng: 37.6310 },
  // Санкт-Петербург
  { key: "centralny", label: "Центральный", city: "Санкт-Петербург", lat: 59.9311, lng: 30.3609 },
  { key: "admiralteysky", label: "Адмиралтейский", city: "Санкт-Петербург", lat: 59.9180, lng: 30.3000 },
  { key: "petrogradsky", label: "Петроградский", city: "Санкт-Петербург", lat: 59.9660, lng: 30.3120 },
  { key: "vasileostrovsky", label: "Василеостровский", city: "Санкт-Петербург", lat: 59.9410, lng: 30.2580 },
  { key: "moskovsky", label: "Московский", city: "Санкт-Петербург", lat: 59.8730, lng: 30.3210 },
  { key: "primorsky", label: "Приморский", city: "Санкт-Петербург", lat: 59.9890, lng: 30.2560 },
  { key: "nevsky", label: "Невский", city: "Санкт-Петербург", lat: 59.9090, lng: 30.4490 },
];

export const DEFAULT_RADIUS_KM = 5;

const AREA_BY_KEY = new Map(AREAS.map((a) => [a.key, a]));
const AREA_BY_LABEL = new Map(
  AREAS.map((a) => [a.label.toLowerCase(), a])
);

export function findArea(value: string | null | undefined): GeoArea | null {
  if (!value) return null;
  const v = value.trim().toLowerCase();
  return AREA_BY_KEY.get(v) ?? AREA_BY_LABEL.get(v) ?? null;
}

export function citiesWithAreas(): { city: string; areas: GeoArea[] }[] {
  const byCity = new Map<string, GeoArea[]>();
  for (const a of AREAS) {
    const list = byCity.get(a.city) ?? [];
    list.push(a);
    byCity.set(a.city, list);
  }
  return Array.from(byCity, ([city, areas]) => ({ city, areas }));
}

const R_EARTH_KM = 6371;
const toRad = (d: number) => (d * Math.PI) / 180;

// Great-circle distance in km. Server-side only.
export function haversineKm(
  aLat: number,
  aLng: number,
  bLat: number,
  bLng: number
): number {
  const dLat = toRad(bLat - aLat);
  const dLng = toRad(bLng - aLng);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(aLat)) *
      Math.cos(toRad(bLat)) *
      Math.sin(dLng / 2) ** 2;
  return R_EARTH_KM * 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
}

// Coarsen a precise distance into something safe to show a client:
// rounded to the nearest 0.5 km (so it can't be trilaterated back into
// an exact address) and never below 0.3.
export function approxDistanceKm(km: number): number {
  const rounded = Math.round(km * 2) / 2;
  return Math.max(0.3, rounded);
}

// Rough arrival window from distance, assuming city travel + prep.
export function arrivalEstimate(km: number): { min: number; max: number } {
  const base = 15; // prep / get ready
  const perKm = 4; // ~15 km/h effective city speed incl. parking
  const mid = base + km * perKm;
  return {
    min: Math.max(15, Math.round((mid - 8) / 5) * 5),
    max: Math.round((mid + 12) / 5) * 5,
  };
}
