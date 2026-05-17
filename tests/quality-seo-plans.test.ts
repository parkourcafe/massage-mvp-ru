import { describe, expect, it } from "vitest";
import { computeQualityScore, isIndexable, QUALITY_INDEX_THRESHOLD } from "@/lib/quality";
import { isNoindexPath } from "@/lib/seo";
import { can, isPro } from "@/lib/plans";
import { seedProfiles } from "@/lib/db/seed";

describe("profile quality score", () => {
  it("scores a complete profile high enough to index", () => {
    const anna = seedProfiles().find((p) => p.slug === "anna-kovaleva")!;
    const q = computeQualityScore(anna);
    expect(q.score).toBeGreaterThanOrEqual(QUALITY_INDEX_THRESHOLD);
    expect(isIndexable({ ...anna, quality_score: q.score })).toBe(true);
  });

  it("does not index a thin / unpublished profile", () => {
    const draft = seedProfiles().find((p) => p.slug === "novyy-spetsialist")!;
    expect(isIndexable(draft)).toBe(false);
  });
});

describe("SEO noindex rules", () => {
  it("marks dashboard/admin/private routes as noindex", () => {
    for (const path of [
      "/dashboard",
      "/dashboard/bookings",
      "/dashboard/clients/1",
      "/dashboard/billing",
      "/admin/users",
      "/favorites",
      "/match/results",
      "/booking/abc123",
      "/therapist/anna-kovaleva/booking",
    ]) {
      expect(isNoindexPath(path)).toBe(true);
    }
  });

  it("keeps public marketing routes indexable", () => {
    for (const path of [
      "/",
      "/therapists",
      "/therapists/klassicheskiy",
      "/therapist/anna-kovaleva",
      "/pricing",
      "/examples",
    ]) {
      expect(isNoindexPath(path)).toBe(false);
    }
  });
});

describe("plan feature gates", () => {
  it("free plan cannot receive bookings or use CRM", () => {
    expect(can("free", "canReceiveBookings")).toBe(false);
    expect(can("free", "canUseClientCRM")).toBe(false);
    expect(can("free", "canUseSeoIndexing")).toBe(false);
  });
  it("pro plan unlocks the feature set", () => {
    expect(can("pro", "canReceiveBookings")).toBe(true);
    expect(can("pro", "canUseClientCRM")).toBe(true);
    expect(can("pro", "canUseAnalytics")).toBe(true);
    expect(isPro("pro")).toBe(true);
    expect(isPro("free")).toBe(false);
  });
});
