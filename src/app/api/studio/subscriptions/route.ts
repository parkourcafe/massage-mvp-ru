import { NextResponse } from "next/server";
import { z } from "zod";
import { parseJsonBody, requireApiRoleAccess } from "@/lib/strand/api";
import {
  getStudioSubscriptionSettings,
  updateStudioSubscriptionSettings,
} from "@/lib/strand/repository";

export const dynamic = "force-dynamic";

const schema = z.object({
  monthlyPrice: z.number().min(0),
  entitlementSummary: z.string().min(1),
});

export async function GET() {
  const access = await requireApiRoleAccess(["model"], "model");
  if (!access.ok) return access.response;

  const settings = await getStudioSubscriptionSettings();
  return NextResponse.json({ ok: true, settings });
}

export async function POST(request: Request) {
  const access = await requireApiRoleAccess(["model"], "model");
  if (!access.ok) return access.response;

  const parsed = schema.safeParse(await parseJsonBody(request));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid subscription settings payload." },
      { status: 400 },
    );
  }

  const result = await updateStudioSubscriptionSettings(parsed.data);
  return NextResponse.json(result, { status: result.ok ? 200 : 400 });
}
