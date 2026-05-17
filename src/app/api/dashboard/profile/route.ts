import { NextResponse } from "next/server";
import { z } from "zod";
import {
  deleteService,
  getOwnerProfile,
  updateProfile,
  upsertService,
} from "@/lib/db";

export const dynamic = "force-dynamic";

const profileSchema = z.object({
  full_name: z.string().min(1).max(120).optional(),
  headline: z.string().max(160).optional(),
  professional_description: z.string().max(4000).optional(),
  safety_boundaries: z.string().max(2000).optional(),
  gender: z.enum(["female", "male"]).optional(),
  show_gender: z.boolean().optional(),
  years_experience: z.coerce.number().int().min(0).max(70).optional(),
  city: z.string().max(120).optional(),
  district: z.string().max(120).optional(),
  nearest_landmark: z.string().max(160).optional(),
  public_location_label: z.string().max(200).optional(),
  therapist_address_private: z.string().max(300).optional(),
  works_at_own_place: z.boolean().optional(),
  travels_to_client: z.boolean().optional(),
  works_in_hotels: z.boolean().optional(),
  works_in_villas: z.boolean().optional(),
  works_in_salon: z.boolean().optional(),
  travel_districts: z.array(z.string()).optional(),
  minimum_booking_price: z.coerce.number().int().min(0).optional(),
  transport_fee: z.coerce.number().int().min(0).optional(),
  languages: z.array(z.string()).optional(),
  price_from: z.coerce.number().int().min(0).optional(),
  session_durations: z.array(z.coerce.number()).optional(),
  whatsapp: z.string().max(40).optional(),
  telegram_url: z.string().max(300).optional(),
  vk_url: z.string().max(300).optional(),
  instagram_url: z.string().max(300).optional(),
  website_url: z.string().max(300).optional(),
  is_published: z.boolean().optional(),
});

export async function PATCH(req: Request) {
  const owner = getOwnerProfile();
  const parsed = profileSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success)
    return NextResponse.json(
      { error: "Проверьте поля", details: parsed.error.flatten() },
      { status: 400 }
    );
  const updated = updateProfile(owner.id, parsed.data);
  return NextResponse.json({
    ok: true,
    quality_score: updated?.quality_score,
    moderation_status: updated?.moderation_status,
  });
}

const serviceSchema = z.object({
  id: z.string().optional(),
  modality: z.string().min(1),
  title: z.string().min(1).max(160),
  description: z.string().max(1000).optional(),
  duration: z.coerce.number().int().positive().max(360).optional(),
  price: z.coerce.number().int().min(0).optional(),
  contraindication_note: z.string().max(500).optional(),
  is_published: z.boolean().optional(),
});

export async function POST(req: Request) {
  const owner = getOwnerProfile();
  const parsed = serviceSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success)
    return NextResponse.json({ error: "Проверьте услугу" }, { status: 400 });
  const svc = upsertService(owner.id, parsed.data);
  return NextResponse.json({ ok: true, service: svc });
}

export async function DELETE(req: Request) {
  const owner = getOwnerProfile();
  const { id } = await req.json().catch(() => ({ id: null }));
  if (!id) return NextResponse.json({ error: "Нет id" }, { status: 400 });
  deleteService(owner.id, id);
  return NextResponse.json({ ok: true });
}
