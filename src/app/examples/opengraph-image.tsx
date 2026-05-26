import { OG_SIZE, createOGImage } from "@/lib/og-helpers";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "STRAND profiles";

export default async function OGImage() {
  return createOGImage("Profiles", "Editorial profile presentation for STRAND");
}

