import { OG_SIZE, createOGImage } from "@/lib/og-helpers";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Приложение — MassageMatch";

export default async function OGImage() {
  return createOGImage("Приложение", "MassageMatch — всегда под рукой");
}
