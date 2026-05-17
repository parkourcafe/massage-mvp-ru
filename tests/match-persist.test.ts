import { beforeEach, describe, expect, it } from "vitest";
import {
  __resetStore,
  getOwnerProfile,
  listMatchesForProfile,
  saveMatch,
} from "@/lib/db";

beforeEach(() => __resetStore());

describe("v1 match persistence", () => {
  it("saves a request with ranked results visible to the matched profile", () => {
    const owner = getOwnerProfile();
    const req = saveMatch(
      {
        massage_goal: "Снять напряжение в шее",
        pain_or_focus_area: "шея",
        preferred_service_type: "relaxing",
        city: "Москва",
        district: null,
        budget: 4000,
      },
      [
        {
          profile_id: owner.id,
          score: 87,
          service_recommendation: "Расслабляющий, 60 мин",
          reasons: ["Большой опыт"],
          risks: ["Уточнить нажим"],
        },
      ]
    );
    expect(req.id).toBeTruthy();

    const incoming = listMatchesForProfile(owner.id);
    expect(incoming.length).toBe(1);
    expect(incoming[0].rank).toBe(1);
    expect(incoming[0].score).toBe(87);
    expect(incoming[0].request?.massage_goal).toContain("напряжение");
    // Another profile sees nothing.
    expect(listMatchesForProfile("other-profile").length).toBe(0);
  });
});
