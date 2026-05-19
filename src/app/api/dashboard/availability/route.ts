import { NextResponse } from "next/server";
import { z } from "zod";
import {
  activateAvailability,
  deactivateAvailability,
  getLatestAvailability,
  getOwnerProfile,
} from "@/lib/db";
import { DEFAULT_RADIUS_KM } from "@/lib/geo";

export const dynamic = "force-dynamic";

const schema = z
  .object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Некорректная дата"),
    start_time: z.string().regex(/^\d{2}:\d{2}$/, "Некорректное время"),
    end_time: z.string().regex(/^\d{2}:\d{2}$/, "Некорректное время"),
    location_mode: z.enum([
      "current_location",
      "manual_area",
      "saved_service_area",
      "hidden_exact_location",
    ]),
    latitude: z.number().min(-90).max(90).optional(),
    longitude: z.number().min(-180).max(180).optional(),
    manual_area: z.string().trim().min(1).max(80).optional(),
    service_radius_km: z.coerce.number().min(0.5).max(50).optional(),
  })
  .refine((v) => v.start_time < v.end_time, {
    message: "Время окончания должно быть позже начала",
    path: ["end_time"],
  });

export async function GET() {
  const owner = await getOwnerProfile();
  const current = await getLatestAvailability(owner.id);
  return NextResponse.json({
    current,
    defaults: {
      home_base_area: owner.home_base_area ?? owner.district ?? null,
      default_service_radius_km:
        owner.default_service_radius_km ?? DEFAULT_RADIUS_KM,
      travel_districts: owner.travel_districts ?? [],
    },
  });
}

export async function POST(req: Request) {
  const owner = await getOwnerProfile();
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Проверьте форму", details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const v = parsed.data;

  if (
    v.location_mode === "current_location" &&
    (v.latitude == null || v.longitude == null)
  ) {
    return NextResponse.json(
      { error: "Не получены координаты — разрешите геолокацию" },
      { status: 400 }
    );
  }
  if (v.location_mode === "manual_area" && !v.manual_area) {
    return NextResponse.json(
      { error: "Укажите район" },
      { status: 400 }
    );
  }

  // Coarse public label clients will see (never the exact point).
  const approximate_area =
    v.location_mode === "manual_area"
      ? v.manual_area ?? null
      : owner.home_base_area ?? owner.district ?? null;

  const availability = await activateAvailability(owner.id, {
    date: v.date,
    start_time: v.start_time,
    end_time: v.end_time,
    location_mode: v.location_mode,
    latitude:
      v.location_mode === "current_location" ? v.latitude ?? null : null,
    longitude:
      v.location_mode === "current_location" ? v.longitude ?? null : null,
    manual_area: v.location_mode === "manual_area" ? v.manual_area : null,
    approximate_area,
    service_radius_km:
      v.service_radius_km ??
      owner.default_service_radius_km ??
      DEFAULT_RADIUS_KM,
  });

  return NextResponse.json({ ok: true, availability });
}

export async function DELETE() {
  const owner = await getOwnerProfile();
  const ok = await deactivateAvailability(owner.id);
  return NextResponse.json({ ok });
}
