import { NextResponse } from "next/server";
import { z } from "zod";
import { addTherapistPrivateNote, getClient, getOwnerProfile } from "@/lib/db";

export const dynamic = "force-dynamic";

const schema = z.object({
  client_id: z.string().min(1),
  session_date: z.string().optional(),
  service_type: z.string().max(120).optional(),
  duration: z.coerce.number().int().positive().max(360).optional(),
  focus_area: z.string().max(300).optional(),
  pressure_used: z.string().max(120).optional(),
  how_session_went: z.string().max(2000).optional(),
  what_to_repeat: z.string().max(2000).optional(),
  what_to_avoid: z.string().max(2000).optional(),
  next_step: z.string().max(500).optional(),
  private_note: z.string().max(2000).optional(),
});

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Некорректный запрос" }, { status: 400 });
  }
  const owner = getOwnerProfile();
  const client = getClient(parsed.data.client_id);
  if (!client || client.profile_id !== owner.id) {
    return NextResponse.json({ error: "Доступ запрещён" }, { status: 403 });
  }
  const note = addTherapistPrivateNote(owner.id, parsed.data);
  return NextResponse.json({ ok: true, note });
}
