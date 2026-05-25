import type { MetadataRoute } from "next";
import { SITE_NAME } from "@/lib/seo";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE_NAME} — профессиональный массаж`,
    short_name: SITE_NAME,
    description:
      "Платформа независимых профессиональных массажистов. Найдите проверенного мастера или подберите с помощью AI.",
    start_url: "/",
    display: "standalone",
    lang: "ru",
    background_color: "#0c080d",
    theme_color: "#0c080d",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
