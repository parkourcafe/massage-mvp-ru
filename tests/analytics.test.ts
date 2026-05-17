import { beforeEach, describe, expect, it } from "vitest";
import {
  __resetStore,
  getActivityTotals,
  getAnalytics,
  getOwnerProfile,
  logAiGeneration,
  recordContactClick,
  recordProfileView,
} from "@/lib/db";

beforeEach(() => __resetStore());

describe("analytics tracking", () => {
  it("records views and clicks and aggregates them", () => {
    const owner = getOwnerProfile();
    const before = getAnalytics(owner.id);

    recordProfileView(owner.id, "/therapist/x");
    recordProfileView(owner.id, "/therapist/x");
    recordContactClick(owner.id, "whatsapp");
    recordContactClick(owner.id, "whatsapp");
    recordContactClick(owner.id, "telegram");

    const a = getAnalytics(owner.id);
    expect(a.totalViews).toBe(before.totalViews + 2);
    expect(a.totalClicks).toBe(before.totalClicks + 3);
    expect(a.clicksByChannel.whatsapp).toBeGreaterThanOrEqual(2);
    // 14-day window present, today's bucket counts the new views.
    expect(a.viewsByDay.length).toBe(14);
    expect(a.viewsByDay.at(-1)!.count).toBeGreaterThanOrEqual(2);
  });

  it("ignores tracking for unknown profiles", () => {
    const t = getActivityTotals().totalViews;
    recordProfileView("does-not-exist");
    expect(getActivityTotals().totalViews).toBe(t);
  });

  it("logs AI generations", () => {
    const before = getActivityTotals().aiCalls;
    logAiGeneration("explain_match", false);
    logAiGeneration("import_profile", true);
    expect(getActivityTotals().aiCalls).toBe(before + 2);
  });
});
