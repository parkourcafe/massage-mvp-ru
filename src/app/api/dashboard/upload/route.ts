import { legacyApiDisabled } from "@/lib/strand/api";

export const dynamic = "force-dynamic";

export async function POST() {
  return legacyApiDisabled(
    "legacy dashboard upload",
    "Replace with STRAND studio uploads after storage and moderation pipelines are wired.",
  );
}

