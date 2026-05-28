import { NextResponse } from "next/server";
import { z } from "zod";
import { parseJsonBody, requireApiRoleAccess } from "@/lib/strand/api";
import {
  listAdminMediaQueue,
  reviewAdminMediaAsset,
} from "@/lib/strand/repository";

export const dynamic = "force-dynamic";

const schema = z.object({
  assetId: z.string().min(1),
  decision: z.enum(["approve", "reject", "hide"]),
  rejectionReason: z.string().optional(),
});

export async function GET() {
  const access = await requireApiRoleAccess(["support", "admin", "kyc_reviewer"], "admin");
  if (!access.ok) return access.response;

  const assets = await listAdminMediaQueue();
  return NextResponse.json({ ok: true, assets });
}

export async function POST(request: Request) {
  const access = await requireApiRoleAccess(["support", "admin", "kyc_reviewer"], "admin");
  if (!access.ok) return access.response;

  const parsed = schema.safeParse(await parseJsonBody(request));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid media review payload." }, { status: 400 });
  }

  const result = await reviewAdminMediaAsset(parsed.data);
  return NextResponse.json(result, { status: result.ok ? 200 : 400 });
}
