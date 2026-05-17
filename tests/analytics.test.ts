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
  it("records views and clicks and aggregates them", async () => {
    const owner = await getOwnerProfile();
    const before = await getAnalytics(owner.id);

    await recordProfileView(owner.id, "/therapist/x");
    await recordProfileView(owner.id, "/therapist/x");
    await recordContactClick(owner.id, "whatsapp");
    await recordContactClick(owner.id, "whatsapp");
    await recordContactClick(owner.id, "telegram");

    const a = await getAnalytics(owner.id);
    expect(a.totalViews).toBe(before.totalViews + 2);
    expect(a.totalClicks).toBe(before.totalClicks + 3);
    expect(a.clicksByChannel.whatsapp).toBeGreaterThanOrEqual(2);
    // 14-day window present, today's bucket counts the new views.
    expect(a.viewsByDay.length).toBe(14);
    expect(a.viewsByDay.at(-1)!.count).toBeGreaterThanOrEqual(2);
  });

  it("ignores tracking for unknown profiles", async () => {
    const t = (await getActivityTotals()).totalViews;
    await recordProfileView("does-not-exist");
    expect((await getActivityTotals()).totalViews).toBe(t);
  });

  it("logs AI generations", async () => {
    const before = (await getActivityTotals()).aiCalls;
    await logAiGeneration("explain_match", false);
    await logAiGeneration("import_profile", true);
    expect((await getActivityTotals()).aiCalls).toBe(before + 2);
  });
});
