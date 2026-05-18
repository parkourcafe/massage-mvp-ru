import { ImageResponse } from "next/og";
import { SITE_NAME } from "@/lib/seo";

// Sitewide default OG/social image. Latin-only wordmark on purpose: the
// next/og default font does not cover Cyrillic, so Russian text would
// render as tofu. Per-page Russian images would need a bundled
// Cyrillic font asset.
export const alt = `${SITE_NAME} — professional massage marketplace`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          padding: "90px",
          background: "linear-gradient(135deg, #0f172a 0%, #134e4a 100%)",
          color: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            width: 90,
            height: 10,
            borderRadius: 9999,
            background: "#14b8a6",
            marginBottom: 40,
          }}
        />
        <div style={{ fontSize: 92, fontWeight: 700, letterSpacing: -2 }}>
          {SITE_NAME}
        </div>
        <div style={{ fontSize: 38, color: "#99f6e4", marginTop: 16 }}>
          Professional massage marketplace
        </div>
      </div>
    ),
    { ...size }
  );
}
