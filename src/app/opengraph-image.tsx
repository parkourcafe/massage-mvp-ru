import { SITE_NAME } from "@/lib/seo";
import { OG_SIZE, createOGImage } from "@/lib/og-helpers";

export const alt = `${SITE_NAME} — premium private directory`;
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function OGImage() {
  return createOGImage(SITE_NAME, "Premium, private, compliance-first directory foundation");
}

