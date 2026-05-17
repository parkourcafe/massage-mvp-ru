import { NextResponse } from "next/server";
import { z } from "zod";
import { createBooking, getRawProfileById } from "@/lib/db";
import { moderateText } from "@/lib/moderation";
import { can } from "@/lib/plans";

export const dynamic = "force-dynamic";

const schema = z.object({
  profile_id: z.string().min(1),
  client_name: z.string().min(1).max(120),
  client_role: z.enum(["self", "for_partner", "for_family_member"]).optional(),
  contact_method: z.string().optional(),
  contact_value: z.string().max(200).optional(),
  service_type: z.string().optional(),
  massage_goal: z.string().max(500).optional(),
  focus_area: z.string().max(300).optional(),
  pressure_preference: z.string().optional(),
  duration: z.coerce.number().int().positive().max(360).optional(),
  location_type: z.string().optional(),
  city: z.string().max(120).optional(),
  district: z.string().max(120).optional(),
  address_or_landmark: z.string().max(300).optional(),
  preferred_time_slot_1: z.string().max(120).optional(),
  preferred_time_slot_2: z.string().max(120).optional(),
  preferred_time_slot_3: z.string().max(120).optional(),
  important_notes: z.string().max(800).optional(),
  first_message: z.string().min(1).max(2000),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Проверьте поля формы", details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const data = parsed.data;

  const profile = getRawProfileById(data.profile_id);
  if (!profile || !profile.is_published) {
    return NextResponse.json(
      { error: "Специалист недоступен для записи" },
      { status: 404 }
    );
  }
  if (!can(profile.plan_id, "canReceiveBookings")) {
    return NextResponse.json(
      {
        error:
          "Этот специалист пока не принимает заявки через платформу. Попробуйте другого.",
      },
      { status: 403 }
    );
  }

  // Professional-boundaries moderation on free-text fields.
  const mod = moderateText(
    [data.first_message, data.massage_goal, data.important_notes, data.focus_area]
      .filter(Boolean)
      .join(" \n ")
  );
  if (!mod.ok) {
    return NextResponse.json(
      {
        error:
          "Сообщение содержит недопустимый контент. Платформа предназначена только для профессионального оздоровительного массажа.",
      },
      { status: 422 }
    );
  }

  const booking = createBooking(data);
  return NextResponse.json({ ok: true, token: booking.token, id: booking.id });
}
