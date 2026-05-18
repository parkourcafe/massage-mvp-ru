import { beforeEach, describe, expect, it } from "vitest";
import {
  __resetStore,
  addBookingMessage,
  confirmBooking,
  convertBookingToClient,
  createBooking,
  getBookingById,
  getOwnerProfile,
  setBookingOutcome,
} from "@/lib/db";
import type { BookingEventType } from "@/lib/types";

const ALLOWED: BookingEventType[] = [
  "created",
  "message",
  "status_change",
  "time_proposed",
  "confirmed",
  "outcome",
  "converted_to_client",
];

beforeEach(() => __resetStore());

describe("typed booking events", () => {
  it("emits a typed, complete event history", async () => {
    const owner = await getOwnerProfile();
    const b = await createBooking({
      profile_id: owner.id,
      client_name: "Тест",
      first_message: "Здравствуйте",
    });
    await addBookingMessage(b.id, "therapist", "Специалист", "Здравствуйте, отвечаю");
    await confirmBooking(b.id, "2026-05-22 12:00");
    await setBookingOutcome(b.id, "completed_good", "completed");
    await convertBookingToClient(b.id);

    const events = (await getBookingById(b.id))!.events ?? [];
    const types = events.map((e) => e.event_type);

    expect(types.every((t) => ALLOWED.includes(t))).toBe(true);
    expect(types).toContain("created");
    expect(types.filter((t) => t === "message").length).toBe(2);
    expect(types).toContain("confirmed");
    expect(types).toContain("outcome");
    expect(types).toContain("converted_to_client");
  });
});
