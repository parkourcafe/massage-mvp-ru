import { OG_SIZE, createOGImage } from "@/lib/og-helpers";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "AI-подбор массажиста — MassageMatch";

export default async function OGImage() {
  return createOGImage(
    "AI-подбор массажиста",
    "Опишите задачу — AI предложит подходящих специалистов"
  );
}
