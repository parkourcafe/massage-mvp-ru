import { describe, expect, it } from "vitest";
import { existsSync } from "node:fs";
import path from "node:path";

const APP = path.resolve(__dirname, "../src/app");

function pageExists(rel: string): boolean {
  return (
    existsSync(path.join(APP, rel, "page.tsx")) ||
    existsSync(path.join(APP, rel, "route.ts"))
  );
}

describe("required routes exist", () => {
  const publicRoutes = [
    "",
    "pricing",
    "examples",
    "therapists",
    "therapists/[seg1]",
    "therapists/[seg1]/[seg2]",
    "therapist/[slug]",
    "therapist/[slug]/booking",
    "match",
    "match/results",
    "favorites",
    "booking/[token]",
  ];
  const dashboardRoutes = [
    "dashboard",
    "dashboard/profile",
    "dashboard/import",
    "dashboard/media",
    "dashboard/bookings",
    "dashboard/bookings/[id]",
    "dashboard/clients",
    "dashboard/clients/[id]",
    "dashboard/analytics",
    "dashboard/billing",
    "dashboard/support",
  ];
  const adminRoutes = [
    "admin/users",
    "admin/profiles",
    "admin/payments",
    "admin/subscriptions",
    "admin/seo",
    "admin/support-requests",
    "admin/moderation",
  ];
  const apiRoutes = [
    "api/bookings",
    "api/booking-action",
    "api/favorites",
    "api/match",
    "api/support",
    "api/import",
    "api/payments/create",
    "api/payments/webhook/yookassa",
    "api/subscriptions/cancel",
  ];

  for (const r of [
    ...publicRoutes,
    ...dashboardRoutes,
    ...adminRoutes,
    ...apiRoutes,
  ]) {
    it(`/${r} exists`, () => {
      expect(pageExists(r)).toBe(true);
    });
  }
});
