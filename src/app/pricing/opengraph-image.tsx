import { OG_SIZE, createOGImage } from "@/lib/og-helpers";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Тарифы — MassageMatch";

export default async function OGImage() {
  return createOGImage(
    "Тарифы",
    "Free · Pro · Expert — выберите подходящий план"
  );
}
