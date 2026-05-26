import { legacyApiDisabled } from "@/lib/strand/api";

export const dynamic = "force-dynamic";

export async function POST() {
  return legacyApiDisabled(
    "payment creation",
    "Do not implement live payments here. Verify CCBill signature formula and provider docs before production work.",
    501,
  );
}

