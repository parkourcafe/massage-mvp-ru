import { NextResponse } from "next/server";
import { z } from "zod";
import {
  addClientSession,
  getClient,
  getOwnerProfile,
  updateClient,
} from "@/lib/db";

export const dynamic = "force-dynamic";

const patchSchema = z.object({
  id: z.string().min(1),
  repeat_status: z
    .enum(["active", "repeat", "paused", "inactive", "lost"])
    .optional(),
  important_notes: z.string().max(1000).optional(),
  contraindication_notes: z.string().max(1000).optional(),
  preferred_service_type: z.string().optional(),
  pressure_preference: z.string().optional(),
  favorite_duration: z.coerce.number().int().positive().max(360).optional(),
});

function owns(clientId: string): boolean {
  const c = getClient(clientId);
  return !!c && c.profile_id === getOwnerProfile().id;
}

export async function PATCH(req: Request) {
  const parsed = patchSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success)
    return NextResponse.json({ error: "Некорректный запрос" }, { status: 400 });
  if (!owns(parsed.data.id))
    return NextResponse.json({ error: "Доступ запрещён" }, { status: 403 });
  const { id, ...patch } = parsed.data;
  const c = updateClient(id, patch);
  return NextResponse.json({ ok: true, client: c });
}

const sessionSchema = z.object({
  client_id: z.string().min(1),
  session_date: z.string().optional(),
  service_type: z.string().optional(),
  duration: z.coerce.number().int().positive().max(360).optional(),
  focus_area: z.string().max(300).optional(),
  pressure: z.string().optional(),
  private_note: z.string().max(2000).optional(),
  next_recommendation: z.string().max(500).optional(),
});

export async function POST(req: Request) {
  const parsed = sessionSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success)
    return NextResponse.json({ error: "Некорректный запрос" }, { status: 400 });
  if (!owns(parsed.data.client_id))
    return NextResponse.json({ error: "Доступ запрещён" }, { status: 403 });
  const s = addClientSession(parsed.data.client_id, parsed.data);
  return NextResponse.json({ ok: true, session: s });
}
