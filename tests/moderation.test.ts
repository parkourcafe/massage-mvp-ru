import { describe, expect, it } from "vitest";
import { moderateText, moderateProfilePayload } from "@/lib/moderation";

describe("professional boundaries moderation", () => {
  it("blocks erotic / intimate wording", () => {
    const r = moderateText("Эротический интим массаж для двоих");
    expect(r.ok).toBe(false);
    expect(r.hits.some((h) => h.severity === "block")).toBe(true);
  });

  it("blocks english adult wording", () => {
    expect(moderateText("sensual massage with happy ending").ok).toBe(false);
    expect(moderateText("adult escort service").ok).toBe(false);
  });

  it("flags suspicious titles for review (not blocked)", () => {
    const r = moderateText("Массаж только для мужчин, ночной выезд");
    expect(r.ok).toBe(true);
    expect(r.hits.some((h) => h.category === "suspicious_title")).toBe(true);
  });

  it("flags unsafe medical claims", () => {
    const r = moderateText("Гарантирую излечение, заменяет операцию");
    expect(r.hits.some((h) => h.category === "unsafe_medical")).toBe(true);
  });

  it("allows professional wellness wording", () => {
    const r = moderateText(
      "Классический лечебно-оздоровительный массаж спины, расслабляющие техники"
    );
    expect(r.ok).toBe(true);
    expect(r.hits.length).toBe(0);
  });

  it("moderates a full profile payload", () => {
    const r = moderateProfilePayload({
      full_name: "Иван",
      professional_description: "Профессиональный спортивный массаж",
      services: [{ title: "Эротический массаж", description: "" }],
    });
    expect(r.ok).toBe(false);
  });
});
