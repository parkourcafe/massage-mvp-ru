import {
  OG_CONTENT_TYPE,
  OG_SIZE,
  createOGImage,
} from "@/lib/og-helpers";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Приложение — MassageMatch";

export default function OgImage() {
  return createOGImage("Приложение", "MassageMatch — всегда под рукой");
}
