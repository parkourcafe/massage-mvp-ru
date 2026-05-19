import { beforeEach, describe, expect, it } from "vitest";
import {
  __resetStore,
  activateAvailability,
  deactivateAvailability,
  listLiveAvailability,
  getActiveAvailability,
} from "@/lib/db";
import { buildNearbyResults } from "@/lib/nearby";
import { findArea } from "@/lib/geo";

const ANNA = "11111111-1111-1111-1111-111111111111"; // Москва, Хамовники
const IGOR = "22222222-2222-2222-2222-222222222222"; // not seeded live
const MARINA = "33333333-3333-3333-3333-333333333333"; // СПб, Центральный

function today(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(d.getDate()).padStart(2, "0")}`;
}

beforeEach(() => __resetStore());

describe("nearby — visibility rules", () => {
  it("only seeded-active therapists are live; the offline one is hidden", async () => {
    const live = await listLiveAvailability();
    const ids = live.map((l) => l.profile.id);
    expect(ids).toContain(ANNA);
    expect(ids).toContain(MARINA);
    // Igor never activated — must not appear by default.
    expect(ids).not.toContain(IGOR);
  });

  it("a therapist appears only after activating and disappears after deactivating", async () => {
    let live = await listLiveAvailability();
    expect(live.map((l) => l.profile.id)).not.toContain(IGOR);

    await activateAvailability(IGOR, {
      date: today(),
      start_time: "00:00",
      end_time: "23:59",
      location_mode: "manual_area",
      manual_area: "Пресненский",
      approximate_area: "Пресненский",
      service_radius_km: 5,
    });
    live = await listLiveAvailability();
    expect(live.map((l) => l.profile.id)).toContain(IGOR);

    await deactivateAvailability(IGOR);
    live = await listLiveAvailability();
    expect(live.map((l) => l.profile.id)).not.toContain(IGOR);
    expect(await getActiveAvailability(IGOR)).toBeNull();
  });

  it("auto-expires a window whose end_time has passed", async () => {
    await activateAvailability(IGOR, {
      date: "2020-01-01", // far past → expires_at in the past
      start_time: "10:00",
      end_time: "12:00",
      location_mode: "hidden_exact_location",
      approximate_area: "Пресненский",
      service_radius_km: 5,
    });
    const live = await listLiveAvailability();
    expect(live.map((l) => l.profile.id)).not.toContain(IGOR);
    // Lazy expiry flips status away from active.
    expect(await getActiveAvailability(IGOR)).toBeNull();
  });

  it("only one active window per therapist (re-activate replaces)", async () => {
    await activateAvailability(IGOR, {
      date: today(),
      start_time: "08:00",
      end_time: "12:00",
      location_mode: "manual_area",
      manual_area: "Пресненский",
      approximate_area: "Пресненский",
      service_radius_km: 5,
    });
    await activateAvailability(IGOR, {
      date: today(),
      start_time: "13:00",
      end_time: "20:00",
      location_mode: "manual_area",
      manual_area: "Арбат",
      approximate_area: "Арбат",
      service_radius_km: 7,
    });
    const a = await getActiveAvailability(IGOR);
    expect(a?.approximate_area).toBe("Арбат");
    const live = (await listLiveAvailability()).filter(
      (l) => l.profile.id === IGOR
    );
    expect(live).toHaveLength(1);
  });
});

describe("nearby — privacy", () => {
  it("never leaks therapist coordinates into client cards", async () => {
    const live = await listLiveAvailability();
    const cards = buildNearbyResults(live, {
      lat: 55.73,
      lng: 37.58,
      radiusKm: 50,
    });
    expect(cards.length).toBeGreaterThan(0);
    const json = JSON.stringify(cards);
    expect(json).not.toMatch(/latitude|longitude/);
    for (const c of cards) {
      expect(c).not.toHaveProperty("latitude");
      expect(c).not.toHaveProperty("longitude");
      // area_center is a coarse district centroid, not the therapist.
      const area = findArea(c.area_label);
      if (c.area_center && area) {
        expect(c.area_center.lat).toBeCloseTo(area.lat, 5);
      }
    }
  });

  it("hidden_exact_location never exposes a distance", async () => {
    await deactivateAvailability(ANNA);
    await activateAvailability(ANNA, {
      date: today(),
      start_time: "00:00",
      end_time: "23:59",
      location_mode: "hidden_exact_location",
      approximate_area: "Хамовники",
      service_radius_km: 5,
    });
    const live = await listLiveAvailability();
    const cards = buildNearbyResults(live, {
      lat: 55.73,
      lng: 37.58,
      radiusKm: 50,
    });
    const anna = cards.find((c) => c.profile_id === ANNA);
    expect(anna).toBeTruthy();
    expect(anna?.approx_distance_km).toBeNull();
  });
});

describe("nearby — search & sort", () => {
  it("sorts available-now first, then by nearest", async () => {
    const live = await listLiveAvailability();
    const cards = buildNearbyResults(live, {
      lat: 55.7297,
      lng: 37.5806, // Хамовники centroid
      radiusKm: 1000,
    });
    // available_now must be non-increasing through the list.
    const flags = cards.map((c) => (c.available_now ? 1 : 0));
    for (let i = 1; i < flags.length; i++) {
      expect(flags[i]).toBeLessThanOrEqual(flags[i - 1]);
    }
  });

  it("area fallback (no coords) matches by served area only", async () => {
    const live = await listLiveAvailability();
    const cards = buildNearbyResults(live, { area: "Центральный" });
    expect(cards.some((c) => c.profile_id === MARINA)).toBe(true);
    // Anna serves Хамовники, not Центральный.
    expect(cards.some((c) => c.profile_id === ANNA)).toBe(false);
  });

  it("service (massageType) filter matches by modality", async () => {
    const live = await listLiveAvailability();
    const lymph = buildNearbyResults(live, {
      area: "Хамовники",
      filters: { massageType: "lymphatic" },
    });
    expect(lymph.some((c) => c.profile_id === ANNA)).toBe(true);
    const sports = buildNearbyResults(live, {
      area: "Хамовники",
      filters: { massageType: "sports" },
    });
    // Anna offers classic/back/lymphatic, not sports.
    expect(sports.some((c) => c.profile_id === ANNA)).toBe(false);
  });

  it("gender filter narrows results", async () => {
    const live = await listLiveAvailability();
    const cards = buildNearbyResults(live, {
      area: "Хамовники",
      filters: { gender: "male" },
    });
    expect(cards.every((c) => c.gender !== "female")).toBe(true);
  });
});
