import { NextResponse } from "next/server";
import { z } from "zod";
import { parseJsonBody, requireApiRoleAccess } from "@/lib/strand/api";
import {
  listAdminKycApplicants,
  reviewAdminKycApplicant,
} from "@/lib/strand/repository";

export const dynamic = "force-dynamic";

const schema = z.object({
  applicantId: z.string().min(1),
  decision: z.enum(["approve", "reject"]),
  rejectionReason: z.string().optional(),
});

export async function GET() {
  const access = await requireApiRoleAccess(["kyc_reviewer", "admin"], "kyc_reviewer");
  if (!access.ok) return access.response;

  const applicants = await listAdminKycApplicants();
  return NextResponse.json({ ok: true, applicants });
}

export async function POST(request: Request) {
  const access = await requireApiRoleAccess(["kyc_reviewer", "admin"], "kyc_reviewer");
  if (!access.ok) return access.response;

  const parsed = schema.safeParse(await parseJsonBody(request));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid KYC review payload." }, { status: 400 });
  }

  const result = await reviewAdminKycApplicant(parsed.data);
  return NextResponse.json(result, { status: result.ok ? 200 : 400 });
}
