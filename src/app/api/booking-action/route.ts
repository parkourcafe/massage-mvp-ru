import { NextResponse } from "next/server";
import { z } from "zod";
import {
  addBookingMessage,
  confirmBooking,
  convertBookingToClient,
  getBookingById,
  getBookingByToken,
  getOwnerProfile,
  proposeTime,
  setBookingOutcome,
} from "@/lib/db";
import { moderateText } from "@/lib/moderation";
import type { Booking } from "@/lib/types";

export const dynamic = "force-dynamic";

const schema = z.object({
  role: z.enum(["client", "therapist"]),
  token: z.string().optional(),
  id: z.string().optional(),
  action: z.enum([
    "message",
    "propose_time",
    "confirm_time",
    "set_outcome",
    "convert_client",
  ]),
  body: z.string().max(2000).optional(),
  slot: z.string().max(120).optional(),
  outcome: z.string().optional(),
  status: z.string().optional(),
});

function resolveBooking(
  role: "client" | "therapist",
  token?: string,
  id?: string
): Booking | null {
  if (role === "client") {
    if (!token) return null;
    return getBookingByToken(token);
  }
  // therapist: resolve by id and verify ownership against demo owner profile.
  if (!id) return null;
  const b = getBookingById(id);
  if (!b) return null;
  const owner = getOwnerProfile();
  if (b.profile_id !== owner.id) return null;
  return b;
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Некорректный запрос" }, { status: 400 });
  }
  const { role, token, id, action } = parsed.data;
  const booking = resolveBooking(role, token, id);
  if (!booking) {
    return NextResponse.json(
      { error: "Заявка не найдена или доступ запрещён" },
      { status: 404 }
    );
  }

  switch (action) {
    case "message": {
      const text = parsed.data.body?.trim();
      if (!text)
        return NextResponse.json({ error: "Пустое сообщение" }, { status: 400 });
      const mod = moderateText(text);
      if (!mod.ok) {
        return NextResponse.json(
          {
            error:
              "Сообщение содержит недопустимый контент. Только профессиональный массаж.",
          },
          { status: 422 }
        );
      }
      addBookingMessage(
        booking.id,
        role,
        role === "therapist" ? "Специалист" : booking.client_name,
        text
      );
      break;
    }
    case "propose_time": {
      if (!parsed.data.slot)
        return NextResponse.json({ error: "Укажите время" }, { status: 400 });
      proposeTime(booking.id, role, parsed.data.slot);
      break;
    }
    case "confirm_time": {
      const slot = parsed.data.slot || booking.preferred_time_slot_1;
      if (!slot)
        return NextResponse.json({ error: "Укажите время" }, { status: 400 });
      confirmBooking(booking.id, slot);
      break;
    }
    case "set_outcome": {
      if (role !== "therapist" && parsed.data.outcome !== "cancelled_by_client") {
        return NextResponse.json({ error: "Недостаточно прав" }, { status: 403 });
      }
      setBookingOutcome(
        booking.id,
        (parsed.data.outcome ?? "completed_good") as NonNullable<Booking["outcome"]>,
        (parsed.data.status ?? "completed") as Booking["status"]
      );
      break;
    }
    case "convert_client": {
      if (role !== "therapist")
        return NextResponse.json({ error: "Недостаточно прав" }, { status: 403 });
      const client = convertBookingToClient(booking.id);
      return NextResponse.json({ ok: true, clientId: client?.id });
    }
  }

  return NextResponse.json({ ok: true });
}
