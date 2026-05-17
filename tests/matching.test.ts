import { describe, expect, it } from "vitest";
import { runMatch, passesHardFilters } from "@/lib/matching";
import { seedProfiles } from "@/lib/db/seed";
import { computeQualityScore } from "@/lib/quality";

const profiles = seedProfiles().map((p) => ({
  ...p,
  quality_score: computeQualityScore(p).score,
}));

describe("AI match for massage use case", () => {
  it("returns up to 3 ranked results", () => {
    const r = runMatch(profiles, {
      city: "Москва",
      preferred_service_type: "deep_tissue",
      pressure_preference: "strong",
      budget: 6000,
    });
    expect(r.length).toBeGreaterThan(0);
    expect(r.length).toBeLessThanOrEqual(3);
    expect(r[0].score).toBeGreaterThanOrEqual(r[r.length - 1].score);
    expect(r[0].reasons.length).toBeGreaterThan(0);
  });

  it("applies hard filter: service type must exist", () => {
    const igor = profiles.find((p) => p.slug === "igor-sotnikov")!;
    expect(
      passesHardFilters(igor, { preferred_service_type: "deep_tissue" })
    ).toBe(true);
    expect(
      passesHardFilters(igor, { preferred_service_type: "pregnancy" })
    ).toBe(false);
  });

  it("respects budget hard filter", () => {
    const r = runMatch(profiles, {
      city: "Москва",
      preferred_service_type: "deep_tissue",
      budget: 1000,
    });
    expect(r.length).toBe(0);
  });

  it("respects gender preference only when therapist shows gender", () => {
    const r = runMatch(profiles, {
      city: "Москва",
      therapist_gender_preference: "female",
    });
    expect(r.every((x) => x.profile.gender === "female")).toBe(true);
  });

  it("excludes unpublished / unapproved profiles", () => {
    const r = runMatch(profiles, { city: "Сочи" });
    expect(r.find((x) => x.profile.slug === "novyy-spetsialist")).toBeUndefined();
  });
});
