import { NextResponse } from "next/server";
import { z } from "zod";
import { parseJsonBody } from "@/lib/strand/api";
import { createModerationCase } from "@/lib/strand/repository";

export const dynamic = "force-dynamic";

const schema = z.object({
  targetType: z.enum(["profile", "media", "message"]),
  reason: z.string().min(1),
  details: z.string().min(1),
});

export async function POST(request: Request) {
  const parsed = schema.safeParse(await parseJsonBody(request));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid report payload." }, { status: 400 });
  }

  const result = await createModerationCase(parsed.data);
  return NextResponse.json(
    {
      ...result,
      message: result.ok
        ? "Concern submitted into the moderation case queue."
        : result.message,
    },
    { status: result.ok ? 200 : 400 },
  );
}
