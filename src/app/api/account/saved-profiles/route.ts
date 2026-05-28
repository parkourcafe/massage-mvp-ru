import { NextResponse } from "next/server";
import { z } from "zod";
import { parseJsonBody, requireApiRoleAccess } from "@/lib/strand/api";
import {
  listSavedProfiles,
  removeSavedProfileFromAccount,
  saveProfileToAccount,
} from "@/lib/strand/repository";

export const dynamic = "force-dynamic";

const schema = z.object({
  slug: z.string().min(1),
});

export async function GET() {
  const access = await requireApiRoleAccess(["client"], "client");
  if (!access.ok) return access.response;

  const profiles = await listSavedProfiles();
  return NextResponse.json({ ok: true, profiles, source: access.access.source });
}

export async function POST(request: Request) {
  const access = await requireApiRoleAccess(["client"], "client");
  if (!access.ok) return access.response;

  const parsed = schema.safeParse(await parseJsonBody(request));
  if (!parsed.success) {
    return NextResponse.json({ error: "Profile slug is required." }, { status: 400 });
  }

  const result = await saveProfileToAccount(parsed.data.slug);
  return NextResponse.json(result, { status: result.ok ? 200 : 400 });
}

export async function DELETE(request: Request) {
  const access = await requireApiRoleAccess(["client"], "client");
  if (!access.ok) return access.response;

  const parsed = schema.safeParse(await parseJsonBody(request));
  if (!parsed.success) {
    return NextResponse.json({ error: "Profile slug is required." }, { status: 400 });
  }

  const result = await removeSavedProfileFromAccount(parsed.data.slug);
  return NextResponse.json(result, { status: result.ok ? 200 : 400 });
}
