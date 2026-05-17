import { beforeEach, describe, expect, it } from "vitest";
import {
  __resetStore,
  addTherapistPrivateNote,
  convertBookingToClient,
  createBooking,
  getClientByToken,
  getOwnerProfile,
  getPublicProfileBySlug,
  listClientFeedbackForProfile,
  listTherapistPrivateNotes,
  submitClientFeedback,
} from "@/lib/db";

beforeEach(() => __resetStore());

describe("private mutual feedback", () => {
  async function makeClient() {
    const owner = await getOwnerProfile();
    const b = await createBooking({
      profile_id: owner.id,
      client_name: "Мария",
      first_message: "hi",
    });
    const client = (await convertBookingToClient(b.id))!;
    return { owner, client };
  }

  it("issues an unguessable client token resolvable only by token", async () => {
    const { client } = await makeClient();
    expect(client.token).toBeTruthy();
    expect(client.token!.length).toBeGreaterThan(20);
    expect((await getClientByToken(client.token!))?.id).toBe(client.id);
    expect(await getClientByToken("nope")).toBeNull();
  });

  it("client submits feedback via token; owner reads it; never public", async () => {
    const { owner, client } = await makeClient();
    const fb = await submitClientFeedback(client.token!, {
      comfort_score: 5,
      professionalism_score: 5,
      pressure_fit: "good",
      repeat_status: "repeat",
      comment: "Отличный профессиональный сеанс",
    });
    expect(fb).not.toBeNull();
    expect(fb!.profile_id).toBe(owner.id);
    expect(fb!.client_id).toBe(client.id);

    const received = await listClientFeedbackForProfile(owner.id, client.id);
    expect(received.length).toBe(1);
    expect(received[0].comfort_score).toBe(5);

    // Public projection of the profile never carries feedback.
    const pub = (await getPublicProfileBySlug(owner.slug)) as unknown as Record<
      string,
      unknown
    >;
    expect(pub.feedback).toBeUndefined();
    expect("client_private_feedback" in pub).toBe(false);
  });

  it("rejects feedback for an invalid token", async () => {
    expect(await submitClientFeedback("bogus", { comfort_score: 3 })).toBeNull();
  });

  it("therapist private notes are scoped to the owning profile", async () => {
    const { owner, client } = await makeClient();
    const note = await addTherapistPrivateNote(owner.id, {
      client_id: client.id,
      how_session_went: "Хорошо",
      what_to_repeat: "Шея",
    });
    expect(note).not.toBeNull();
    expect((await listTherapistPrivateNotes(owner.id, client.id)).length).toBe(1);
    // A different profile id sees nothing.
    expect((await listTherapistPrivateNotes("other-profile", client.id)).length).toBe(
      0
    );
    // Note for a client that is not owned by the profile is refused.
    expect(
      await addTherapistPrivateNote("other-profile", { client_id: client.id })
    ).toBeNull();
  });
});
