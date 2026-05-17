import { NextResponse } from "next/server";
import { z } from "zod";
import {
  addAvailabilitySlot,
  deleteAvailabilitySlot,
  getOwnerProfile,
  listSlotsForProfile,
} from "@/lib/db";

export const dynamic = "force-dynamic";

const addSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Некорректная дата"),
  time: z.string().regex(/^\d{2}:\d{2}$/, "Некорректное время"),
  duration: z.coerce.number().int().min(30).max(360).default(60),
});

const delSchema = z.object({ slot_id: z.string().min(1) });

export async function GET() {
  const owner = await getOwnerProfile();
  return NextResponse.json({ slots: await listSlotsForProfile(owner.id) });
}

export async function POST(req: Request) {
  const owner = await getOwnerProfile();
  const parsed = addSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Проверьте дату и время", details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const { date, time, duration } = parsed.data;
  const startsAt = new Date(`${date}T${time}`);
  const slot = await addAvailabilitySlot(
    owner.id,
    startsAt.toISOString(),
    duration
  );
  if (!slot) {
    return NextResponse.json(
      { error: "Время в прошлом или такой слот уже добавлен" },
      { status: 409 }
    );
  }
  return NextResponse.json({ ok: true, slot });
}

export async function DELETE(req: Request) {
  const owner = await getOwnerProfile();
  const parsed = delSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Не указан слот" }, { status: 400 });
  }
  const ok = await deleteAvailabilitySlot(owner.id, parsed.data.slot_id);
  if (!ok) {
    return NextResponse.json(
      { error: "Слот не найден или уже забронирован" },
      { status: 409 }
    );
  }
  return NextResponse.json({ ok: true });
}
