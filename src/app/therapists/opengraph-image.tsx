import { OG_SIZE, createOGImage } from "@/lib/og-helpers";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Каталог массажистов — MassageMatch";

export default async function OGImage() {
  return createOGImage(
    "Каталог массажистов",
    "Независимые профессиональные массажисты с расписанием и отзывами"
  );
}
