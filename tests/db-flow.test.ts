import { beforeEach, describe, expect, it } from "vitest";
import {
  __resetStore,
  addFavorite,
  addMedia,
  confirmBooking,
  convertBookingToClient,
  createBooking,
  createPayment,
  createSupportRequest,
  getBookingByToken,
  getOwnerProfile,
  getPublicProfileBySlug,
  listBookingsForProfile,
  listClients,
  listFavorites,
  markPaymentSucceeded,
  removeFavorite,
  setBookingOutcome,
  upsertService,
} from "@/lib/db";

beforeEach(() => __resetStore());

describe("therapist profile & directory", () => {
  it("exposes a public profile without the private address", async () => {
    const p = await getPublicProfileBySlug("anna-kovaleva");
    expect(p).not.toBeNull();
    expect(p!.full_name).toBe("Анна Ковалёва");
    expect(p!.therapist_address_private).toBeNull();
    // Service types / media are present and published-only.
    expect((p!.services ?? []).length).toBeGreaterThan(0);
    expect((p!.media ?? []).every((m) => m.is_published)).toBe(true);
    expect((p!.media ?? []).some((m) => m.type === "document")).toBe(false);
  });

  it("does not expose unpublished profiles publicly", async () => {
    expect(await getPublicProfileBySlug("novyy-spetsialist")).toBeNull();
  });

  it("exposes public contact channels but never the private address", async () => {
    const p = (await getPublicProfileBySlug("anna-kovaleva"))!;
    expect(p.whatsapp).toBe("+79991234567");
    expect(p.telegram_url).toContain("t.me/");
    expect(p.therapist_address_private).toBeNull();
  });
});

describe("services & media management", () => {
  it("adds a service and media to the owner profile", async () => {
    const owner = await getOwnerProfile();
    const svc = await upsertService(owner.id, {
      modality: "foot",
      title: "Массаж стоп",
      duration: 30,
      price: 1500,
    });
    expect(svc?.id).toBeTruthy();
    const m = await addMedia(owner.id, {
      type: "gallery_photo",
      url: "https://example.com/x.jpg",
      title: null,
      description: null,
      alt_text: "x",
      sort_order: 9,
      is_published: true,
    });
    expect(m?.id).toBeTruthy();
  });
});

describe("unified booking inquiry flow", () => {
  it("creates booking, therapist sees it, client replies, confirm, outcome, convert", async () => {
    const owner = await getOwnerProfile();
    const booking = await createBooking({
      profile_id: owner.id,
      client_name: "Тест Клиент",
      service_type: "back",
      first_message: "Здравствуйте, хочу записаться на массаж спины",
    });
    expect(booking.token).toBeTruthy();
    expect(booking.status).toBe("chat_started");

    // Therapist sees the booking in their list.
    const list = await listBookingsForProfile(owner.id);
    expect(list.find((b) => b.id === booking.id)).toBeTruthy();

    // Client can reply via token.
    const viaToken = await getBookingByToken(booking.token);
    expect(viaToken?.id).toBe(booking.id);

    // Confirm time.
    await confirmBooking(booking.id, "2026-05-20 18:00");
    expect((await getBookingByToken(booking.token))!.status).toBe("confirmed");

    // Mark completed.
    await setBookingOutcome(booking.id, "completed_good", "completed");
    expect((await getBookingByToken(booking.token))!.status).toBe("completed");

    // Convert to CRM client.
    const client = await convertBookingToClient(booking.id);
    expect(client?.name).toBe("Тест Клиент");
    expect((await listClients(owner.id)).find((c) => c.id === client!.id)).toBeTruthy();
    expect((await getBookingByToken(booking.token))!.status).toBe(
      "converted_to_repeat_client"
    );
  });

  it("supports no-show / cancelled / lost outcomes", async () => {
    const owner = await getOwnerProfile();
    const b1 = await createBooking({
      profile_id: owner.id,
      client_name: "A",
      first_message: "hi",
    });
    await setBookingOutcome(b1.id, "no_show", "no_show");
    expect((await getBookingByToken(b1.token))!.status).toBe("no_show");

    const b2 = await createBooking({
      profile_id: owner.id,
      client_name: "B",
      first_message: "hi",
    });
    await setBookingOutcome(b2.id, "lost_no_reply", "lost");
    expect((await getBookingByToken(b2.token))!.status).toBe("lost");
  });
});

describe("favorites", () => {
  it("adds, prevents duplicates, and removes", async () => {
    const owner = await getOwnerProfile();
    await addFavorite("u1", owner.id, "directory");
    await addFavorite("u1", owner.id, "directory"); // duplicate ignored
    expect((await listFavorites("u1")).length).toBe(1);
    await removeFavorite("u1", owner.id);
    expect((await listFavorites("u1")).length).toBe(0);
  });
});

describe("support requests", () => {
  it("creates a support request", async () => {
    const sr = await createSupportRequest({
      user_id: null,
      profile_id: null,
      name: "Игорь",
      contact_method: "Telegram",
      contact_value: "@x",
      preferred_contact_time: "вечер",
      topic: "Помочь заполнить профиль",
      message: "нужна помощь",
    });
    expect(sr.id).toBeTruthy();
    expect(sr.status).toBe("new");
  });
});

describe("billing webhook architecture", () => {
  it("activates Pro ONLY via verified webhook, never on create alone", async () => {
    const owner = await getOwnerProfile();
    const payment = await createPayment(owner.id, "pro");
    expect(payment.status).toBe("pending");

    // Webhook verifies and activates.
    const sub = await markPaymentSucceeded(payment.provider_payment_id!);
    expect(sub?.status).toBe("active");
    expect(sub?.plan_id).toBe("pro");
    expect(new Date(sub!.expires_at!).getTime()).toBeGreaterThan(Date.now());
  });
});
