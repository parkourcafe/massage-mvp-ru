import { legacyApiDisabled } from "@/lib/strand/api";

export const dynamic = "force-dynamic";

export async function POST() {
  return legacyApiDisabled(
    "legacy YooKassa webhook",
    "YooKassa is not part of STRAND. Replace with CCBill-specific verification after official documentation review.",
    410,
  );
}

