import { legacyApiDisabled } from "@/lib/strand/api";

export const dynamic = "force-dynamic";

export async function GET() {
  return legacyApiDisabled(
    "legacy dashboard profile editor API",
    "Replace with STRAND studio profile persistence against model_profiles.",
  );
}

export async function POST() {
  return legacyApiDisabled(
    "legacy dashboard profile editor API",
    "Replace with STRAND studio profile persistence against model_profiles.",
  );
}

