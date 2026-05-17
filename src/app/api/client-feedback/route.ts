import { NextResponse } from "next/server";
import { z } from "zod";
import { submitClientFeedback } from "@/lib/db";
import { moderateText } from "@/lib/moderation";

export const dynamic = "force-dynamic";

const score = z.coerce.number().int().min(1).max(5).optional();

const schema = z.object({
  token: z.string().min(1),
  comfort_score: score,
  professionalism_score: score,
  cleanliness_score: score,
  punctuality_score: score,
  pressure_fit: z.enum(["too_soft", "good", "too_strong"]).optional(),
  repeat_status: z.enum(["repeat", "not_sure", "no"]).optional(),
  comment: z.string().max(2000).optional(),
});

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Некорректный запрос" }, { status: 400 });
  }
  const { token, comment, ...rest } = parsed.data;

  if (comment && comment.trim()) {
    const mod = moderateText(comment);
    if (!mod.ok) {
      return NextResponse.json(
        {
          error:
            "Комментарий содержит недопустимый контент. Только профессиональный массаж.",
        },
        { status: 422 }
      );
    }
  }

  const fb = submitClientFeedback(token, {
    ...rest,
    comment: comment?.trim() || null,
  });
  if (!fb) {
    return NextResponse.json(
      { error: "Ссылка недействительна" },
      { status: 404 }
    );
  }
  return NextResponse.json({ ok: true });
}
