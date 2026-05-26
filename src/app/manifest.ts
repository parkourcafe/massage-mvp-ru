import type { MetadataRoute } from "next";
import { SITE_NAME } from "@/lib/seo";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/app",
    name: `${SITE_NAME} — профессиональный массаж`,
    short_name: SITE_NAME,
    description:
      "Платформа независимых профессиональных массажистов. Найдите проверенного мастера или подберите с помощью AI.",
    // Installed app opens straight into the mobile app view.
    start_url: "/app",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    lang: "ru",
    categories: ["health", "medical", "lifestyle"],
    background_color: "#0c080d",
    theme_color: "#0c080d",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/icon-192", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512", sizes: "512x512", type: "image/png", purpose: "any" },
      {
        src: "/icon-512",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
