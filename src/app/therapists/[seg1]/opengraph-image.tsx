import { OG_SIZE, createOGImage } from "@/lib/og-helpers";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "STRAND directory";

export default function OgImage() {
  return createOGImage("Directory", "State and city profile discovery on STRAND");
}
