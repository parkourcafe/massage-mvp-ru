import {
  OG_CONTENT_TYPE,
  OG_SIZE,
  createOGImage,
} from "@/lib/og-helpers";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Тарифы — MassageMatch";

export default function OgImage() {
  return createOGImage(
    "Тарифы",
    "Free · Pro · Expert — выберите подходящий план"
  );
}
