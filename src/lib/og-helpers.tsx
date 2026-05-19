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
            "linear-gradient(135deg, #0f1419 0%, #1a2a2e 50%, #0d2926 100%)",
          color: "#e0f0ee",
          fontFamily: "PT Sans",
        }}
      >
        {/* Акцентная полоска */}
        <div
          style={{
            width: "60px",
            height: "4px",
            background: "#5de6c8",
            borderRadius: "2px",
            marginBottom: "40px",
          }}
        />

        {/* Заголовок */}
        <div
          style={{
            fontSize: "64px",
            fontWeight: 700,
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
            color: "#7ec8b8",
            marginBottom: "60px",
            maxWidth: "1000px",
            lineHeight: 1.3,
          }}
        >
          {subtitle}
        </div>

        {/* Бренд — текстовый логотип (без SVG, Satori не гарантирует рендер) */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          {/* Сердце нарисовано на CSS: PT Sans не содержит глиф ♥, а
              вложенный SVG Satori рендерит ненадёжно. */}
          <div
            style={{
              position: "relative",
              display: "flex",
              width: "22px",
              height: "20px",
            }}
          >
            <div
              style={{
                position: "absolute",
                left: "11px",
                width: "11px",
                height: "17px",
                background: "#ec4889",
                borderRadius: "11px 11px 0 0",
                transform: "rotate(-45deg)",
                transformOrigin: "0 100%",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: "0px",
                width: "11px",
                height: "17px",
                background: "#ec4889",
                borderRadius: "11px 11px 0 0",
                transform: "rotate(45deg)",
                transformOrigin: "100% 100%",
              }}
            />
          </div>
          <div
            style={{
              fontSize: "22px",
              fontWeight: 400,
              color: "#8aa8a2",
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
