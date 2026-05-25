import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0c080d",
        }}
      >
        <svg width="120" height="120" viewBox="0 0 40 40">
          <path
            d="M11 14c0 6 4 9 9 11 5-2 9-5 9-11 0-3-2-5-5-5-2 0-3 1-4 2-1-1-2-2-4-2-3 0-5 2-5 5z"
            fill="#ec4889"
          />
        </svg>
      </div>
    ),
    { ...size }
  );
}
