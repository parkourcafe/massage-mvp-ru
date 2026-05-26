import { legacyApiDisabled } from "@/lib/strand/api";

export const dynamic = "force-dynamic";

export async function GET() {
  return legacyApiDisabled(
    "legacy dashboard client records",
    "Replace with STRAND client account APIs after account data is wired to Supabase.",
  );
}

export async function POST() {
  return legacyApiDisabled(
    "legacy dashboard client records",
    "Replace with STRAND client account APIs after account data is wired to Supabase.",
  );
}

