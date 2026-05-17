import { NextResponse } from "next/server";
import { z } from "zod";
import { recordContactClick, recordProfileView } from "@/lib/db";

export const dynamic = "force-dynamic";

// Anonymous, no-PII beacon from public profile pages.
const schema = z.object({
  type: z.enum(["view", "click"]),
  profileId: z.string().min(1),
  channel: z
    .enum(["whatsapp", "telegram", "vk", "instagram", "website", "booking"])
    .optional(),
  path: z.string().max(300).optional(),
});

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  const { type, profileId, channel, path } = parsed.data;
  if (type === "view") {
    recordProfileView(profileId, path);
  } else if (channel) {
    recordContactClick(profileId, channel);
  }
  return NextResponse.json({ ok: true });
}
