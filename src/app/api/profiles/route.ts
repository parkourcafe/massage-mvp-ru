import { NextResponse } from "next/server";
import {
  getDirectoryProfile,
  listDirectoryProfiles,
} from "@/lib/strand/repository";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const slug = url.searchParams.get("slug");

  if (slug) {
    const profile = await getDirectoryProfile(slug);
    return NextResponse.json({ profile: profile ?? null }, { status: profile ? 200 : 404 });
  }

  return NextResponse.json({ profiles: await listDirectoryProfiles() });
}
