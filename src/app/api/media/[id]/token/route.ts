import { NextResponse } from "next/server";
import { resolveMediaTokenAccess } from "@/lib/strand/repository";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } },
) {
  const result = await resolveMediaTokenAccess(params.id);
  return NextResponse.json(result, { status: result.status });
}
