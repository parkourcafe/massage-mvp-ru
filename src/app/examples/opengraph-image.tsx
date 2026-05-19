import {
  OG_CONTENT_TYPE,
  OG_SIZE,
  createOGImage,
} from "@/lib/og-helpers";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Примеры профилей — MassageMatch";

export default function OgImage() {
  return createOGImage(
    "Примеры профилей",
    "Как выглядит сильный профиль специалиста"
  );
}
