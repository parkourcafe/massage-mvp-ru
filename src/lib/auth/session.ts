import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { __setOwnerResolver, getUserById } from "@/lib/db";
import type { AuthUser } from "@/lib/types";

export const SESSION_COOKIE = "mm_session";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days

function secret(): string {
  return process.env.AUTH_SECRET || "dev-insecure-massage-mvp-secret";
}

function sign(value: string): string {
  return createHmac("sha256", secret()).update(value).digest("base64url");
}

// Token format: <userId>.<hmac(userId)> — userIds contain no dots.
export function makeSessionToken(userId: string): string {
  return `${userId}.${sign(userId)}`;
}

export function verifySessionToken(token: string | undefined): string | null {
  if (!token) return null;
  const dot = token.lastIndexOf(".");
  if (dot <= 0) return null;
  const userId = token.slice(0, dot);
  const mac = token.slice(dot + 1);
  const expected = sign(userId);
  const a = Buffer.from(mac);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  return userId;
}

export function getSessionUserId(): string | null {
  try {
    return verifySessionToken(cookies().get(SESSION_COOKIE)?.value);
  } catch {
    return null;
  }
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const uid = getSessionUserId();
  return uid ? getUserById(uid) : null;
}

export function setSessionCookie(userId: string): void {
  cookies().set(SESSION_COOKIE, makeSessionToken(userId), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export function clearSessionCookie(): void {
  cookies().set(SESSION_COOKIE, "", { path: "/", maxAge: 0 });
}

// Server-component guards.
export async function requireUser(): Promise<AuthUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireAdmin(): Promise<AuthUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "admin") redirect("/dashboard");
  return user;
}

// Make the data layer resolve the dashboard "owner" from the signed-in
// user when no explicit userId is passed. Importing this module (done by
// the dashboard/admin layouts and auth API) registers the resolver
// process-wide; it is invoked lazily inside a request scope. Unit tests
// never import this module, so getOwnerProfile keeps its pure fallback.
__setOwnerResolver(() => getSessionUserId() ?? undefined);
