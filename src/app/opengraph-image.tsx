import { SITE_NAME } from "@/lib/seo";
import { OG_SIZE, createOGImage } from "@/lib/og-helpers";

// Sitewide default OG/social image.
export const alt = `${SITE_NAME} — professional massage marketplace`;
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function OGImage() {
  return createOGImage(SITE_NAME, "Professional massage marketplace");
}
