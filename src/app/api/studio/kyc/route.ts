import { NextResponse } from "next/server";
import { z } from "zod";
import { parseJsonBody, requireApiRoleAccess } from "@/lib/strand/api";
import {
  getStudioKycVerification,
  submitStudioKycVerification,
} from "@/lib/strand/repository";

export const dynamic = "force-dynamic";

const schema = z.object({
  governmentIdLabel: z.string().min(1),
  selfieLabel: z.string().min(1),
  intent: z.enum(["start", "submit", "resubmit"]),
});

export async function GET() {
  const access = await requireApiRoleAccess(["model"], "model");
  if (!access.ok) return access.response;

  const verification = await getStudioKycVerification();
  return NextResponse.json({ ok: true, verification });
}

export async function POST(request: Request) {
  const access = await requireApiRoleAccess(["model"], "model");
  if (!access.ok) return access.response;

  const parsed = schema.safeParse(await parseJsonBody(request));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid KYC submission payload." }, { status: 400 });
  }

  const result = await submitStudioKycVerification(parsed.data);
  return NextResponse.json(result, { status: result.ok ? 200 : 400 });
}
