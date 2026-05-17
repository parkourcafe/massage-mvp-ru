import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupportRequest, getOwnerProfile } from "@/lib/db";
import { SUPPORT_TOPICS } from "@/lib/catalog";
import { moderateText } from "@/lib/moderation";

export const dynamic = "force-dynamic";

const schema = z.object({
  name: z.string().min(1).max(120),
  contact_method: z.string().max(40).optional(),
  contact_value: z.string().max(200).optional(),
  preferred_contact_time: z.string().max(120).optional(),
  topic: z.string().min(1),
  message: z.string().max(2000).optional(),
});

export async function POST(req: Request) {
  const owner = getOwnerProfile();
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success)
    return NextResponse.json({ error: "Заполните форму" }, { status: 400 });

  if (!SUPPORT_TOPICS.includes(parsed.data.topic)) {
    return NextResponse.json({ error: "Неизвестная тема" }, { status: 400 });
  }

  const mod = moderateText(parsed.data.message);
  if (!mod.ok) {
    return NextResponse.json(
      { error: "Сообщение содержит недопустимый контент." },
      { status: 422 }
    );
  }

  const sr = createSupportRequest({
    user_id: owner.user_id ?? null,
    profile_id: owner.id,
    name: parsed.data.name,
    contact_method: parsed.data.contact_method ?? null,
    contact_value: parsed.data.contact_value ?? null,
    preferred_contact_time: parsed.data.preferred_contact_time ?? null,
    topic: parsed.data.topic,
    message: parsed.data.message ?? null,
  });
  return NextResponse.json({ ok: true, id: sr.id });
}
