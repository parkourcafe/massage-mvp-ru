import { beforeEach, describe, expect, it } from "vitest";
import {
  __resetStore,
  addAvailabilitySlot,
  bookSlot,
  createBooking,
  deleteAvailabilitySlot,
  getOpenSlot,
  listOpenSlots,
  listPublicProfiles,
  nextOpenSlot,
  profileHasOpenSlotToday,
} from "@/lib/db";

const ANNA = "11111111-1111-1111-1111-111111111111";

beforeEach(() => __resetStore());

const inDays = (d: number, h = 12) => {
  const x = new Date();
  x.setDate(x.getDate() + d);
  x.setHours(h, 0, 0, 0);
  return x.toISOString();
};

describe("availability slots", () => {
  it("adds a future slot, rejects past and duplicate", async () => {
    const ok = await addAvailabilitySlot(ANNA, inDays(3, 15), 60);
    expect(ok).not.toBeNull();
    expect(ok!.status).toBe("open");

    const past = await addAvailabilitySlot(
      ANNA,
      new Date(Date.now() - 86400000).toISOString(),
      60
    );
    expect(past).toBeNull();

    const dup = await addAvailabilitySlot(ANNA, inDays(3, 15), 60);
    expect(dup).toBeNull();
  });

  it("listOpenSlots is sorted, excludes booked, feeds nextOpenSlot", async () => {
    await addAvailabilitySlot(ANNA, inDays(5, 11), 60);
    await addAvailabilitySlot(ANNA, inDays(4, 13), 60);
    const open = await listOpenSlots(ANNA);
    for (let i = 1; i < open.length; i++) {
      expect(open[i].starts_at >= open[i - 1].starts_at).toBe(true);
    }
    expect(await nextOpenSlot(ANNA)).toEqual(open[0]);
  });

  it("prevents double-booking the same slot", async () => {
    const slot = (await addAvailabilitySlot(ANNA, inDays(2, 19), 60))!;
    expect(await getOpenSlot(slot.id, ANNA)).not.toBeNull();

    const b1 = await createBooking({
      profile_id: ANNA,
      client_name: "Клиент 1",
      first_message: "Запишусь на это время",
    });
    const first = await bookSlot(slot.id, ANNA, b1.id);
    expect(first).not.toBeNull();
    expect(first!.status).toBe("booked");

    expect(await getOpenSlot(slot.id, ANNA)).toBeNull();
    const b2 = await createBooking({
      profile_id: ANNA,
      client_name: "Клиент 2",
      first_message: "Тоже хочу это время",
    });
    expect(await bookSlot(slot.id, ANNA, b2.id)).toBeNull();

    const open = await listOpenSlots(ANNA);
    expect(open.some((s) => s.id === slot.id)).toBe(false);
  });

  it("only open slots can be deleted", async () => {
    const slot = (await addAvailabilitySlot(ANNA, inDays(2, 9), 60))!;
    const b = await createBooking({
      profile_id: ANNA,
      client_name: "К",
      first_message: "x",
    });
    await bookSlot(slot.id, ANNA, b.id);
    expect(await deleteAvailabilitySlot(ANNA, slot.id)).toBe(false);

    const open = (await addAvailabilitySlot(ANNA, inDays(2, 12), 60))!;
    expect(await deleteAvailabilitySlot(ANNA, open.id)).toBe(true);
    expect((await listOpenSlots(ANNA)).some((s) => s.id === open.id)).toBe(
      false
    );
  });

  it("'available today' filter is a subset with seeded slots", async () => {
    expect(await profileHasOpenSlotToday(ANNA)).toBe(true);
    const all = await listPublicProfiles();
    const today = await listPublicProfiles({ availableToday: true });
    expect(today.length).toBeGreaterThan(0);
    expect(today.length).toBeLessThanOrEqual(all.length);
    expect(today.every((p) => all.some((a) => a.id === p.id))).toBe(true);
  });
});
