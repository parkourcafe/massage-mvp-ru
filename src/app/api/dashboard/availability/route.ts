import { legacyApiDisabled } from "@/lib/strand/api";

export const dynamic = "force-dynamic";

export async function GET() {
  return legacyApiDisabled(
    "legacy dashboard availability",
    "Replace with STRAND studio availability and compliance-aware location controls.",
  );
}

export async function POST() {
  return legacyApiDisabled(
    "legacy dashboard availability",
    "Replace with STRAND studio availability and compliance-aware location controls.",
  );
}

