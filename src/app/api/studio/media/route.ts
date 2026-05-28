import { NextResponse } from "next/server";
import { z } from "zod";
import { parseJsonBody, requireApiRoleAccess } from "@/lib/strand/api";
import {
  listStudioMediaAssets,
  mutateStudioMedia,
} from "@/lib/strand/repository";

export const dynamic = "force-dynamic";

const schema = z.object({
  assetId: z.string().optional(),
  action: z.enum(["upload_placeholder", "toggle_visibility", "resubmit"]),
});

export async function GET() {
  const access = await requireApiRoleAccess(["model"], "model");
  if (!access.ok) return access.response;

  const assets = await listStudioMediaAssets();
  return NextResponse.json({ ok: true, assets });
}

export async function POST(request: Request) {
  const access = await requireApiRoleAccess(["model"], "model");
  if (!access.ok) return access.response;

  const parsed = schema.safeParse(await parseJsonBody(request));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid media mutation payload." }, { status: 400 });
  }

  const result = await mutateStudioMedia(parsed.data);
  return NextResponse.json(result, { status: result.ok ? 200 : 400 });
}
