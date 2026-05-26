import { ImageResponse } from "next/og";

// Shared renderer for the installable-app (PWA) manifest icons. The
// brand heart sits on a full-bleed obsidian square so the same image
// also works as a maskable icon (the square is the safe area the OS
// rounds/crops).
export function pwaIcon(size: number): ImageResponse {
  const heart = Math.round(size * 0.5);
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
        <svg width={heart} height={heart} viewBox="0 0 40 40">
          <path
            d="M11 14c0 6 4 9 9 11 5-2 9-5 9-11 0-3-2-5-5-5-2 0-3 1-4 2-1-1-2-2-4-2-3 0-5 2-5 5z"
            fill="#ec4889"
          />
        </svg>
      </div>
    ),
    { width: size, height: size }
  );
}
