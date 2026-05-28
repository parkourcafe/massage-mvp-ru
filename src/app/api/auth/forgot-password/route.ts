import { NextResponse } from "next/server";
import { z } from "zod";
import { getAnonClient, isSupabaseAuthConfigured } from "@/lib/supabase";
import { parseJsonBody } from "@/lib/strand/api";

export const dynamic = "force-dynamic";

const schema = z.object({
  email: z.string().email(),
});

export async function POST(request: Request) {
  const parsed = schema.safeParse(await parseJsonBody(request));
  if (!parsed.success) {
    return NextResponse.json({ error: "Valid email is required." }, { status: 400 });
  }

  if (!isSupabaseAuthConfigured) {
    return NextResponse.json({
      ok: true,
      preview: true,
      note: "Preview fallback only. Configure Supabase auth before using password reset in production.",
    });
  }

  const client = getAnonClient();
  if (!client) {
    return NextResponse.json(
      { error: "Supabase auth client is unavailable." },
      { status: 500 },
    );
  }

  const { error } = await client.auth.resetPasswordForEmail(parsed.data.email);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({
    ok: true,
    preview: false,
    note: "Password reset email requested.",
  });
}
