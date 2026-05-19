import { NextResponse } from "next/server";
import { z } from "zod";
import { listLiveAvailability } from "@/lib/db";
import { buildNearbyResults } from "@/lib/nearby";
import { DEFAULT_RADIUS_KM } from "@/lib/geo";

export const dynamic = "force-dynamic";

const schema = z.object({
  lat: z.number().min(-90).max(90).optional(),
  lng: z.number().min(-180).max(180).optional(),
  area: z.string().trim().min(1).max(80).optional(),
  radiusKm: z.coerce.number().min(0.5).max(50).optional(),
  filters: z
    .object({
      availableNow: z.boolean().optional(),
      massageType: z.string().trim().max(60).optional(),
      gender: z.enum(["female", "male"]).optional(),
      priceMin: z.coerce.number().min(0).max(1_000_000).optional(),
      priceMax: z.coerce.number().min(0).max(1_000_000).optional(),
      language: z.string().trim().max(40).optional(),
      visit: z.enum(["villa", "hotel", "home", "own"]).optional(),
    })
    .optional(),
});

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Некорректный запрос", details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const live = await listLiveAvailability();
  const cards = buildNearbyResults(live, {
    ...parsed.data,
    radiusKm: parsed.data.radiusKm ?? DEFAULT_RADIUS_KM,
  });
  // Response intentionally carries no therapist coordinates.
  return NextResponse.json({ count: cards.length, cards });
}
