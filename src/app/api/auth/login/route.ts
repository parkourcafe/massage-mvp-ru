import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getAnonClient, isSupabaseAuthConfigured } from "@/lib/supabase";
import {
  STRAND_PREVIEW_ROLE_COOKIE,
  STRAND_USER_ID_COOKIE,
} from "@/lib/strand/authz";
import {
  clearSupabaseAuthCookies,
  ensureStrandUserProvisioned,
  setSupabaseAuthCookies,
} from "@/lib/strand/supabase-auth";

export const dynamic = "force-dynamic";

const schema = z.object({
  email: z.string().email().optional(),
  password: z.string().min(1).max(200).optional(),
  role: z
    .enum(["client", "model", "kyc_reviewer", "support", "admin"])
    .default("client"),
});

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid auth request" }, { status: 400 });
  }

  if (isSupabaseAuthConfigured) {
    const client = getAnonClient();
    if (!client) {
      return NextResponse.json(
        { error: "Supabase auth client is unavailable" },
        { status: 500 },
      );
    }

    const { data, error } = await client.auth.signInWithPassword({
      email: parsed.data.email ?? "",
      password: parsed.data.password ?? "",
    });

    if (error || !data.user || !data.session) {
      return NextResponse.json(
        { error: error?.message ?? "Login failed" },
        { status: 401 },
      );
    }

    const provisioned = await ensureStrandUserProvisioned({
      userId: data.user.id,
      email: data.user.email ?? parsed.data.email ?? null,
      role: parsed.data.role,
    });

    const response = NextResponse.json({
      ok: true,
      preview: false,
      role: provisioned.role ?? "guest",
    });

    clearSupabaseAuthCookies(response);
    setSupabaseAuthCookies(response, data.session);
    response.cookies.set(STRAND_PREVIEW_ROLE_COOKIE, "", {
      path: "/",
      maxAge: 0,
    });
    response.cookies.set(STRAND_USER_ID_COOKIE, data.user.id, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
    });

    return response;
  }

  const response = NextResponse.json({
    ok: true,
    preview: true,
    role: parsed.data.role,
  });

  response.cookies.set(STRAND_PREVIEW_ROLE_COOKIE, parsed.data.role, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
  });
  response.cookies.set(STRAND_USER_ID_COOKIE, `preview-${randomUUID()}`, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
  });

  return response;
}
