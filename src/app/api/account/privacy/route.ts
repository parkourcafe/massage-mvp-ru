import { NextResponse } from "next/server";
import { z } from "zod";
import { parseJsonBody, requireApiRoleAccess } from "@/lib/strand/api";
import {
  getPrivacySettings,
  updatePrivacySettings,
} from "@/lib/strand/repository";

export const dynamic = "force-dynamic";

const schema = z.object({
  discreetBilling: z.boolean().optional(),
  marketingOptIn: z.boolean().optional(),
  showActiveSubscriptions: z.boolean().optional(),
  notifyOnModerationActions: z.boolean().optional(),
});

export async function GET() {
  const access = await requireApiRoleAccess(["client"], "client");
  if (!access.ok) return access.response;

  const settings = await getPrivacySettings();
  return NextResponse.json({ ok: true, settings, source: access.access.source });
}

export async function POST(request: Request) {
  const access = await requireApiRoleAccess(["client"], "client");
  if (!access.ok) return access.response;

  const parsed = schema.safeParse(await parseJsonBody(request));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid privacy settings payload." }, { status: 400 });
  }

  const result = await updatePrivacySettings(parsed.data);
  return NextResponse.json(result, { status: result.ok ? 200 : 400 });
}
