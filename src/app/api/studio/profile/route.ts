import { NextResponse } from "next/server";
import { z } from "zod";
import { parseJsonBody, requireApiRoleAccess } from "@/lib/strand/api";
import {
  getStudioProfileDraft,
  getStudioStatusSnapshot,
  saveStudioProfileDraft,
} from "@/lib/strand/repository";

export const dynamic = "force-dynamic";

const schema = z.object({
  displayName: z.string().min(1),
  state: z.string().min(1),
  city: z.string().min(1),
  shortBio: z.string().min(1),
  longBio: z.string().min(1),
  availability: z.string().min(1),
  subscriptionPrice: z.number().min(0),
  intent: z.enum(["save", "submit"]),
});

export async function GET() {
  const access = await requireApiRoleAccess(["model"], "model");
  if (!access.ok) return access.response;

  const [profile, snapshot] = await Promise.all([
    getStudioProfileDraft(),
    getStudioStatusSnapshot(),
  ]);

  return NextResponse.json({ ok: true, profile, snapshot });
}

export async function POST(request: Request) {
  const access = await requireApiRoleAccess(["model"], "model");
  if (!access.ok) return access.response;

  const parsed = schema.safeParse(await parseJsonBody(request));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid studio profile payload." }, { status: 400 });
  }

  const result = await saveStudioProfileDraft(parsed.data);
  return NextResponse.json(result, { status: result.ok ? 200 : 400 });
}
