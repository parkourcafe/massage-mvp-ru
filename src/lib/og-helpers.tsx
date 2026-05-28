import { ImageResponse } from "next/og";
import { PT_SANS_BOLD_B64, PT_SANS_REGULAR_B64 } from "./og/fonts";

export const OG_SIZE = { width: 1200, height: 630 };

const fontRegular = Buffer.from(PT_SANS_REGULAR_B64, "base64");
const fontBold = Buffer.from(PT_SANS_BOLD_B64, "base64");

export function createOGImage(title: string, subtitle: string) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background:
            "radial-gradient(circle at top left, rgba(215, 195, 162, 0.16), transparent 25%), linear-gradient(135deg, #090806 0%, #11100d 55%, #1c1712 100%)",
          color: "#f4ead8",
          fontFamily: "PT Sans",
        }}
      >
        <div
          style={{
            width: "72px",
            height: "4px",
            background: "#d7c3a2",
            borderRadius: "2px",
            marginBottom: "40px",
          }}
        />
        <div
          style={{
            fontSize: "64px",
            fontWeight: 400,
            lineHeight: 1.1,
            marginBottom: "20px",
            color: "#ffffff",
            letterSpacing: "-1px",
            maxWidth: "1000px",
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontSize: "28px",
            fontWeight: 400,
            color: "#ddcfb7",
            marginBottom: "60px",
            maxWidth: "1000px",
            lineHeight: 1.3,
          }}
        >
          {subtitle}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <svg width="28" height="28" viewBox="0 0 40 40" fill="none">
            <circle
              cx="20"
              cy="20"
              r="19"
              stroke="#d7c3a2"
              strokeWidth="0.75"
              opacity="0.5"
            />
            <path
              d="M12 27c2-8 7-14 16-16-2 8-7 14-16 16z"
              fill="#d7c3a2"
            />
          </svg>
          <div
            style={{
              fontSize: "22px",
              fontWeight: 400,
              color: "#d7c3a2",
              letterSpacing: "3px",
            }}
          >
            STRAND
          </div>
        </div>
      </div>
    ),
    {
      ...OG_SIZE,
      fonts: [
        { name: "PT Sans", data: fontRegular, weight: 400, style: "normal" },
        { name: "PT Sans", data: fontBold, weight: 700, style: "normal" },
      ],
    },
  );
}

