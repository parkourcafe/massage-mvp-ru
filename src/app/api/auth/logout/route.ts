import { NextResponse } from "next/server";
import { clearSupabaseAuthCookies } from "@/lib/strand/supabase-auth";
import {
  STRAND_PREVIEW_ROLE_COOKIE,
  STRAND_USER_ID_COOKIE,
} from "@/lib/strand/authz";

export const dynamic = "force-dynamic";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  clearSupabaseAuthCookies(response);

  response.cookies.set(STRAND_PREVIEW_ROLE_COOKIE, "", {
    path: "/",
    maxAge: 0,
  });
  response.cookies.set(STRAND_USER_ID_COOKIE, "", {
    path: "/",
    maxAge: 0,
  });
  response.cookies.set("mm_session", "", {
    path: "/",
    maxAge: 0,
  });

  return response;
}
