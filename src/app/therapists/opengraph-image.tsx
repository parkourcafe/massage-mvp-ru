import { OG_SIZE, createOGImage } from "@/lib/og-helpers";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "STRAND directory";

export default async function OGImage() {
  return createOGImage("Directory", "Premium private profiles across Australia");
}

