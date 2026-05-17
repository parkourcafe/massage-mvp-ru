import { NextResponse } from "next/server";
import { z } from "zod";
import { addFavorite, listFavorites, removeFavorite } from "@/lib/db";

export const dynamic = "force-dynamic";

// MVP: no real auth wired. Guests use localStorage (client-side); this
// endpoint records favorites for a demo authenticated user so the DB
// path is exercised. In production this maps to the Supabase auth user.
const DEMO_USER = "demo-user";

const schema = z.object({
  profileId: z.string().min(1),
  source: z.enum(["directory", "profile", "match"]).optional(),
  matchScore: z.number().int().min(0).max(100).optional(),
});

export async function GET() {
  return NextResponse.json({ favorites: listFavorites(DEMO_USER) });
}

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success)
    return NextResponse.json({ error: "Некорректный запрос" }, { status: 400 });
  const fav = addFavorite(
    DEMO_USER,
    parsed.data.profileId,
    parsed.data.source ?? "directory",
    parsed.data.matchScore
  );
  return NextResponse.json({ ok: true, favorite: fav });
}

export async function DELETE(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success)
    return NextResponse.json({ error: "Некорректный запрос" }, { status: 400 });
  removeFavorite(DEMO_USER, parsed.data.profileId);
  return NextResponse.json({ ok: true });
}
