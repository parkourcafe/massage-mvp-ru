import {
  OG_CONTENT_TYPE,
  OG_SIZE,
  createOGImage,
} from "@/lib/og-helpers";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "AI-подбор массажиста — MassageMatch";

export default function OgImage() {
  return createOGImage(
    "AI-подбор массажиста",
    "Опишите задачу — AI предложит подходящих специалистов"
  );
}
