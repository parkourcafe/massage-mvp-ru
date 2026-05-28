import { legacyApiDisabled } from "@/lib/strand/api";

export const dynamic = "force-dynamic";

export async function GET() {
  return legacyApiDisabled(
    "favorites",
    "Saved profiles should be rebuilt against STRAND client accounts and DB-backed roles.",
  );
}

export async function POST() {
  return legacyApiDisabled(
    "favorites",
    "Saved profiles should be rebuilt against STRAND client accounts and DB-backed roles.",
  );
}

