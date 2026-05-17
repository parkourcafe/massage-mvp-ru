import { NextResponse } from "next/server";
import { z } from "zod";
import { addMedia, deleteMedia, getOwnerProfile, listMedia } from "@/lib/db";
import { moderateText } from "@/lib/moderation";
import { can } from "@/lib/plans";
import { FREE_LIMITS } from "@/lib/plans";

export const dynamic = "force-dynamic";

const MEDIA_TYPES = [
  "profile_photo",
  "gallery_photo",
  "workspace_photo",
  "equipment_photo",
  "intro_video",
  "session_video",
  "certificate",
  "diploma",
  "review_screenshot",
  "document",
] as const;

const schema = z.object({
  type: z.enum(MEDIA_TYPES),
  url: z.string().url().max(1000),
  title: z.string().max(160).optional(),
  description: z.string().max(500).optional(),
  alt_text: z.string().max(200).optional(),
});

export async function GET() {
  const owner = getOwnerProfile();
  return NextResponse.json({ media: listMedia(owner.id) });
}

export async function POST(req: Request) {
  const owner = getOwnerProfile();
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success)
    return NextResponse.json(
      { error: "Проверьте ссылку и тип медиа" },
      { status: 400 }
    );

  // Free plan: limited media.
  if (!can(owner.plan_id, "canUseMediaFull")) {
    const count = listMedia(owner.id).length;
    if (count >= FREE_LIMITS.maxMedia) {
      return NextResponse.json(
        {
          error: `На тарифе Free доступно до ${FREE_LIMITS.maxMedia} медиа. Подключите Pro.`,
        },
        { status: 403 }
      );
    }
  }

  const mod = moderateText(
    [parsed.data.title, parsed.data.description, parsed.data.alt_text]
      .filter(Boolean)
      .join(" ")
  );
  if (!mod.ok) {
    return NextResponse.json(
      {
        error:
          "Описание медиа содержит недопустимый контент. Запрещены провокационные, обнажённые и интимные материалы.",
      },
      { status: 422 }
    );
  }

  const media = addMedia(owner.id, {
    ...parsed.data,
    title: parsed.data.title ?? null,
    description: parsed.data.description ?? null,
    alt_text: parsed.data.alt_text ?? null,
    sort_order: listMedia(owner.id).length,
    is_published: true,
  });
  return NextResponse.json({ ok: true, media });
}

export async function DELETE(req: Request) {
  const owner = getOwnerProfile();
  const { id } = await req.json().catch(() => ({ id: null }));
  if (!id) return NextResponse.json({ error: "Нет id" }, { status: 400 });
  deleteMedia(owner.id, id);
  return NextResponse.json({ ok: true });
}
