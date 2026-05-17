import { NextResponse } from "next/server";
import { getPublicProfileBySlug, listPublicProfiles } from "@/lib/db";
import { getRawProfileById, toPublicProfile } from "@/lib/db";

export const dynamic = "force-dynamic";

// Hydration endpoint for the localStorage-backed favorites page.
export async function GET(req: Request) {
  const url = new URL(req.url);
  const ids = url.searchParams.get("ids");
  if (ids) {
    const list = ids
      .split(",")
      .map((id) => getRawProfileById(id.trim()))
      .filter(
        (p): p is NonNullable<typeof p> =>
          !!p && p.is_published && p.moderation_status === "approved"
      )
      .map(toPublicProfile);
    return NextResponse.json({ profiles: list });
  }
  const slug = url.searchParams.get("slug");
  if (slug) {
    return NextResponse.json({ profile: getPublicProfileBySlug(slug) });
  }
  return NextResponse.json({ profiles: listPublicProfiles() });
}
