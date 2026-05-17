import { NextResponse } from "next/server";
import { z } from "zod";
import { importProfileDraft } from "@/lib/ai";
import { moderateText } from "@/lib/moderation";
import { can } from "@/lib/plans";
import { getOwnerProfile } from "@/lib/db";

export const dynamic = "force-dynamic";

const schema = z.object({ text: z.string().min(10).max(8000) });

export async function POST(req: Request) {
  const owner = await getOwnerProfile();
  if (!can(owner.plan_id, "canUseAiImport")) {
    return NextResponse.json(
      { error: "AI-импорт доступен на тарифе Pro" },
      { status: 403 }
    );
  }
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success)
    return NextResponse.json({ error: "Вставьте текст профиля" }, { status: 400 });

  const mod = moderateText(parsed.data.text);
  if (!mod.ok) {
    return NextResponse.json(
      {
        error:
          "Текст содержит недопустимый контент. Только профессиональный массаж.",
      },
      { status: 422 }
    );
  }

  const draft = await importProfileDraft(parsed.data.text);
  return NextResponse.json({ ok: true, draft });
}
