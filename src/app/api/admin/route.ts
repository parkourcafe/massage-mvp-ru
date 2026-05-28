import { NextResponse } from "next/server";
import {
  getAdminMetrics,
  listAuditLog,
  listModerationCases,
} from "@/lib/strand/repository";
import { requireApiRoleAccess } from "@/lib/strand/api";

export const dynamic = "force-dynamic";

export async function GET() {
  const access = await requireApiRoleAccess(["support", "admin", "kyc_reviewer"], "admin");
  if (!access.ok) return access.response;

  const [metrics, moderationCases, auditLog] = await Promise.all([
    getAdminMetrics(),
    listModerationCases(),
    listAuditLog(),
  ]);

  return NextResponse.json({
    metrics,
    moderationCases,
    auditLog,
  });
}
