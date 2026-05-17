import { NextResponse } from "next/server";
import { z } from "zod";
import {
  resolveModerationFlag,
  setModerationStatus,
  updateSupportRequest,
} from "@/lib/db";

export const dynamic = "force-dynamic";

// NOTE: In production this route must be protected by an admin guard
// (ADMIN_EMAILS / Supabase auth role). MVP demo: open in local mode.
const schema = z.object({
  action: z.enum([
    "resolve_flag",
    "set_moderation",
    "update_support",
  ]),
  id: z.string().optional(),
  profileId: z.string().optional(),
  status: z.string().optional(),
  adminNote: z.string().max(1000).optional(),
});

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success)
    return NextResponse.json({ error: "Некорректный запрос" }, { status: 400 });
  const d = parsed.data;

  switch (d.action) {
    case "resolve_flag":
      if (!d.id) return NextResponse.json({ error: "Нет id" }, { status: 400 });
      resolveModerationFlag(d.id);
      return NextResponse.json({ ok: true });
    case "set_moderation":
      if (!d.profileId || !d.status)
        return NextResponse.json({ error: "Нет данных" }, { status: 400 });
      setModerationStatus(
        d.profileId,
        d.status as "pending" | "approved" | "flagged" | "rejected"
      );
      return NextResponse.json({ ok: true });
    case "update_support":
      if (!d.id || !d.status)
        return NextResponse.json({ error: "Нет данных" }, { status: 400 });
      updateSupportRequest(d.id, {
        status: d.status as "new" | "in_progress" | "done" | "cancelled",
        admin_note: d.adminNote,
      });
      return NextResponse.json({ ok: true });
  }
}
