/**
 * lib/og-helpers.tsx
 *
 * Хелпер для генерации OG-image в стиле MassageMatch.
 * Используется из opengraph-image.tsx на каждой странице.
 */

import { ImageResponse } from "next/og";
import { PT_SANS_BOLD_B64, PT_SANS_REGULAR_B64 } from "./og/fonts";

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

// next/og's bundled default font is Latin-only — with fontFamily
// "sans-serif" every Cyrillic glyph renders as tofu (□□□), which would
// break ~80% of these cards. We hand Satori a base64-embedded PT Sans
// (latin+cyrillic) subset instead. Inlined (not fs/fetch) so it ships
// in the bundle for both build-time and the runtime dynamic route.
const fontRegular = Buffer.from(PT_SANS_REGULAR_B64, "base64");
const fontBold = Buffer.from(PT_SANS_BOLD_B64, "base64");

/**
 * Генерирует OG-image в фирменном стиле MassageMatch.
 *
 * @param title — крупный заголовок (название страницы / типа массажа)
 * @param subtitle — подзаголовок (краткое описание / теги через ·)
 */
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
            "linear-gradient(135deg, #0c080d 0%, #1a0f1c 55%, #2a1226 100%)",
          color: "#f6eef2",
          fontFamily: "PT Sans",
        }}
      >
        {/* Акцентная полоска */}
        <div
          style={{
            width: "60px",
            height: "4px",
            background: "#ec4889",
            borderRadius: "2px",
            marginBottom: "40px",
          }}
        />

        {/* Заголовок. PT Sans-сабсет содержит только 400/700; запрошенный
            light (300) недоступен, берём ближайший 400 — визуально лёгкий
            заголовок, как в макете (не bold 700). */}
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

        {/* Подзаголовок */}
        <div
          style={{
            fontSize: "28px",
            fontWeight: 400,
            color: "#c4a9bb",
            marginBottom: "60px",
            maxWidth: "1000px",
            lineHeight: 1.3,
          }}
        >
          {subtitle}
        </div>

        {/* Бренд. Простой инлайн-SVG (solid fill/stroke, без градиентов и
            фильтров) Satori рендерит надёжно — проверено на сборке. */}
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
              stroke="#9b8593"
              strokeWidth="0.75"
              opacity="0.5"
            />
            <path
              d="M11 14c0 6 4 9 9 11 5-2 9-5 9-11 0-3-2-5-5-5-2 0-3 1-4 2-1-1-2-2-4-2-3 0-5 2-5 5z"
              fill="#ec4889"
            />
          </svg>
          <div
            style={{
              fontSize: "22px",
              fontWeight: 400,
              color: "#9b8593",
              letterSpacing: "0.5px",
            }}
          >
            MassageMatch
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
    }
  );
}
