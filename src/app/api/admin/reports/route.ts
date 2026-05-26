import { NextResponse } from "next/server";
import { z } from "zod";
import { parseJsonBody, requireApiRoleAccess } from "@/lib/strand/api";
import {
  createModerationCase,
  listModerationCases,
  updateModerationCase,
} from "@/lib/strand/repository";

export const dynamic = "force-dynamic";

const schema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("create"),
    targetType: z.enum(["profile", "media", "message"]),
    reason: z.string().min(1),
    details: z.string().min(1),
  }),
  z.object({
    action: z.literal("update"),
    caseId: z.string().min(1),
    status: z.enum(["open", "in_review", "resolved", "escalated"]).optional(),
    priority: z.enum(["low", "medium", "high", "critical"]).optional(),
    assignedReviewer: z.string().optional(),
    actionTaken: z.string().optional(),
  }),
]);

export async function GET() {
  const access = await requireApiRoleAccess(["support", "admin", "kyc_reviewer"], "support");
  if (!access.ok) return access.response;

  const cases = await listModerationCases();
  return NextResponse.json({ ok: true, cases });
}

export async function POST(request: Request) {
  const access = await requireApiRoleAccess(["support", "admin", "kyc_reviewer"], "support");
  if (!access.ok) return access.response;

  const parsed = schema.safeParse(await parseJsonBody(request));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid moderation case payload." }, { status: 400 });
  }

  const result =
    parsed.data.action === "create"
      ? await createModerationCase(parsed.data)
      : await updateModerationCase(parsed.data);

  return NextResponse.json(result, { status: result.ok ? 200 : 400 });
}
