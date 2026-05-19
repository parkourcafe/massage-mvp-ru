import { OG_SIZE, createOGImage } from "@/lib/og-helpers";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Примеры профилей — MassageMatch";

export default async function OGImage() {
  return createOGImage(
    "Примеры профилей",
    "Как выглядит сильный профиль специалиста"
  );
}
