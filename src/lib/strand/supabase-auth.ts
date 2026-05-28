import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { UserRole } from "./types";
import { getAnonClient, getServiceClient, isSupabaseAuthConfigured } from "@/lib/supabase";
import { slugify } from "@/lib/util";

export const STRAND_AUTH_ACCESS_TOKEN_COOKIE = "strand_access_token";
export const STRAND_AUTH_REFRESH_TOKEN_COOKIE = "strand_refresh_token";

const USER_ROLES: UserRole[] = [
  "guest",
  "client",
  "model",
  "kyc_reviewer",
  "support",
  "admin",
];

function toUserRole(value: string | undefined | null): UserRole | null {
  if (!value) return null;
  return USER_ROLES.includes(value as UserRole) ? (value as UserRole) : null;
}

function authCookieOptions(maxAge?: number) {
  return {
    path: "/",
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    ...(maxAge != null ? { maxAge } : {}),
  };
}

function toDisplayName(email: string | null | undefined) {
  const base = email?.split("@")[0] ?? "model";
  return base
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part.slice(0, 1).toUpperCase() + part.slice(1))
    .join(" ");
}

function toModelSlug(userId: string, email: string | null | undefined) {
  const base = slugify(email?.split("@")[0] ?? "model");
  return `${base}-${userId.slice(0, 8)}`;
}

export function setSupabaseAuthCookies(
  response: NextResponse,
  session: {
    access_token: string;
    refresh_token: string;
    expires_in?: number | null;
  },
) {
  response.cookies.set(
    STRAND_AUTH_ACCESS_TOKEN_COOKIE,
    session.access_token,
    authCookieOptions(session.expires_in ?? undefined),
  );
  response.cookies.set(
    STRAND_AUTH_REFRESH_TOKEN_COOKIE,
    session.refresh_token,
    authCookieOptions(60 * 60 * 24 * 30),
  );
}

export function clearSupabaseAuthCookies(response: NextResponse) {
  response.cookies.set(STRAND_AUTH_ACCESS_TOKEN_COOKIE, "", authCookieOptions(0));
  response.cookies.set(STRAND_AUTH_REFRESH_TOKEN_COOKIE, "", authCookieOptions(0));
}

export async function getSupabaseAuthUserFromCookies() {
  if (!isSupabaseAuthConfigured) return null;

  const store = cookies();
  const accessToken = store.get(STRAND_AUTH_ACCESS_TOKEN_COOKIE)?.value;
  const refreshToken = store.get(STRAND_AUTH_REFRESH_TOKEN_COOKIE)?.value;
  const client = getAnonClient();

  if (!client || !accessToken) return null;

  if (refreshToken) {
    const { data, error } = await client.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    if (!error && data.user) {
      return {
        id: data.user.id,
        email: data.user.email ?? null,
      };
    }
  }

  const { data, error } = await client.auth.getUser(accessToken);
  if (error || !data.user) return null;

  return {
    id: data.user.id,
    email: data.user.email ?? null,
  };
}

export async function getStrandRoleForUser(userId: string) {
  const client = getServiceClient();
  if (!client) return null;

  const { data, error } = await client
    .from("users")
    .select("role")
    .eq("id", userId)
    .maybeSingle();

  if (error) return null;
  return toUserRole(data?.role);
}

export async function ensureStrandUserProvisioned(input: {
  userId: string;
  email?: string | null;
  role: UserRole;
}) {
  const client = getServiceClient();
  if (!client) {
    return { role: null as UserRole | null, provisioned: false };
  }

  const { data: existing, error: existingError } = await client
    .from("users")
    .select("role")
    .eq("id", input.userId)
    .maybeSingle();

  if (existingError) {
    return { role: null as UserRole | null, provisioned: false };
  }

  const existingRole = toUserRole(existing?.role);
  const role = existingRole ?? input.role;

  if (!existing) {
    const { error: insertUserError } = await client.from("users").insert({
      id: input.userId,
      role,
      email: input.email ?? null,
      display_name: toDisplayName(input.email),
    });

    if (insertUserError) {
      return { role: null as UserRole | null, provisioned: false };
    }
  }

  if (role === "client") {
    await client.from("clients").upsert(
      {
        user_id: input.userId,
      },
      { onConflict: "user_id" },
    );
  }

  if (role === "model") {
    const { data: existingProfile } = await client
      .from("model_profiles")
      .select("id")
      .eq("user_id", input.userId)
      .maybeSingle();

    if (!existingProfile) {
      await client.from("model_profiles").insert({
        user_id: input.userId,
        slug: toModelSlug(input.userId, input.email),
        display_name: toDisplayName(input.email),
        state: "State pending",
        city: "City pending",
        short_bio: "Profile draft created during onboarding.",
        long_bio:
          "This draft profile was provisioned automatically and should be completed before submission for moderation.",
        availability: "Availability pending",
        subscription_price_aud: 0,
        publication_status: "draft",
        kyc_status: "not_started",
      });
    }
  }

  return { role, provisioned: true };
}
