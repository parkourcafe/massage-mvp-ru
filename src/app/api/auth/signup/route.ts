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
  email: z.string().email(),
  password: z.string().min(8).max(200),
  role: z.enum(["client", "model"]).default("client"),
});

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Check email, password, and role" },
      { status: 400 },
    );
  }

  if (isSupabaseAuthConfigured) {
    const client = getAnonClient();
    if (!client) {
      return NextResponse.json(
        { error: "Supabase auth client is unavailable" },
        { status: 500 },
      );
    }

    const { data, error } = await client.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
    });

    if (error || !data.user) {
      return NextResponse.json(
        { error: error?.message ?? "Signup failed" },
        { status: 400 },
      );
    }

    const provisioned = await ensureStrandUserProvisioned({
      userId: data.user.id,
      email: data.user.email ?? parsed.data.email,
      role: parsed.data.role,
    });

    const response = NextResponse.json({
      ok: true,
      preview: false,
      role: provisioned.role ?? parsed.data.role,
      requiresEmailConfirmation: !data.session,
      note: data.session
        ? "Supabase signup completed."
        : "Signup created. Email confirmation may be required before login.",
    });

    clearSupabaseAuthCookies(response);
    if (data.session) {
      setSupabaseAuthCookies(response, data.session);
      response.cookies.set(STRAND_USER_ID_COOKIE, data.user.id, {
        path: "/",
        httpOnly: true,
        sameSite: "lax",
      });
    } else {
      response.cookies.set(STRAND_USER_ID_COOKIE, "", {
        path: "/",
        maxAge: 0,
      });
    }
    response.cookies.set(STRAND_PREVIEW_ROLE_COOKIE, "", {
      path: "/",
      maxAge: 0,
    });

    return response;
  }

  const response = NextResponse.json({
    ok: true,
    preview: true,
    role: parsed.data.role,
    note: "Preview signup only. Replace with real Supabase auth before launch.",
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
