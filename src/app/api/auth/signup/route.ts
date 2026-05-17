import { NextResponse } from "next/server";
import { z } from "zod";
import { createUser } from "@/lib/db";
import { moderateText } from "@/lib/moderation";
import { setSessionCookie } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(200),
  full_name: z.string().min(2).max(120),
});

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Проверьте email, имя и пароль (от 8 символов)" },
      { status: 400 }
    );
  }
  const mod = moderateText(parsed.data.full_name);
  if (!mod.ok) {
    return NextResponse.json(
      { error: "Имя содержит недопустимый контент." },
      { status: 422 }
    );
  }
  const res = createUser(
    parsed.data.email,
    parsed.data.password,
    parsed.data.full_name
  );
  if ("error" in res) {
    return NextResponse.json({ error: res.error }, { status: 409 });
  }
  setSessionCookie(res.user.id);
  return NextResponse.json({ ok: true, role: res.user.role });
}
