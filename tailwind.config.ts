import type { Config } from "tailwindcss";

// ──────────────────────────────────────────────────────────────────────────
// Massaje SPB — "Drama" design system (dark obsidian canvas, hot magenta
// accent, plum/aubergine depth). Source of truth: design-system.tokens.json.
//
// The legacy semantic palettes (brand / sand / ink / clay) are intentionally
// re-mapped onto the new drama tokens rather than removed: the codebase uses
// them semantically (bg-sand-50 = page, text-ink-soft = body, bg-brand-700 =
// primary), so re-pointing the scales flips every existing utility to the
// dark theme in one move. New markup should prefer the semantic tokens
// (page / surface / card / accent / plum / heading / body / secondary).
// ──────────────────────────────────────────────────────────────────────────

const plum = {
  50: "#faf4fa",
  100: "#f1dcef",
  200: "#e0b6dc",
  300: "#c587be",
  400: "#a35a9c",
  500: "#7d3a78",
  600: "#5c2858",
  700: "#421e40",
  800: "#2d152d",
  900: "#1c0e1c",
};

const mag = {
  50: "#fdeef4",
  100: "#fbd2e4",
  200: "#f7a4c8",
  300: "#f372a8",
  400: "#ec4889",
  500: "#d72a6f",
  600: "#b41a58",
  700: "#821443",
};

const blush = {
  50: "#fbf5f1",
  100: "#f6e8e1",
  200: "#efd6cd",
  300: "#e4bbb0",
};

// Obsidian canvas + warm "bone" text on dark.
const obsidian = {
  0: "#0c080d",
  1: "#14101a",
  2: "#1d1722",
  3: "#2a2230",
  4: "#3d3344",
};

const bone = {
  0: "#f8efe8",
  1: "#ebdfd5",
  2: "#beb2ab",
  3: "#8a7f7a",
};

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // ---- raw drama scales (preferred for new markup) ----
        plum,
        mag,
        blush,
        obsidian,
        bone,

        // ---- semantic tokens ----
        page: obsidian[0],
        surface: obsidian[1],
        card: obsidian[2],
        elevated: obsidian[3],
        line: "rgba(248,239,232,0.10)",
        "line-strong": "rgba(248,239,232,0.22)",
        heading: bone[0],
        body: bone[1],
        secondary: bone[3],
        accent: {
          DEFAULT: mag[400],
          soft: "rgba(236,72,137,0.12)",
          strong: mag[300],
        },

        // ---- legacy names, re-pointed onto drama ----
        // brand → hot magenta (primary / trust / accent)
        brand: {
          50: mag[50],
          100: mag[100],
          200: mag[200],
          300: mag[300],
          400: mag[400],
          500: mag[400],
          600: mag[500],
          700: mag[400], // .btn-primary bg-brand-700 → accent
          800: mag[500], // hover
          900: mag[700],
        },
        // sand → dark surfaces / hairline borders
        sand: {
          50: obsidian[0], // page background
          100: obsidian[1], // panels / surface
          200: "rgba(248,239,232,0.10)", // hairline border
          300: "rgba(248,239,232,0.22)", // stronger border / input
          400: obsidian[4],
          500: bone[3],
        },
        // ink → warm light text on dark
        ink: {
          DEFAULT: bone[0],
          soft: bone[1],
          muted: bone[3],
        },
        // clay → plum (secondary accent)
        clay: {
          50: plum[50],
          100: plum[100],
          400: plum[400],
          500: plum[500],
          600: plum[600],
        },
      },
      fontFamily: {
        sans: [
          "var(--font-sans)",
          '"Inter"',
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "Arial",
          "sans-serif",
        ],
        serif: [
          "var(--font-serif)",
          '"Cormorant Garamond"',
          "Cormorant",
          "Georgia",
          '"Times New Roman"',
          "serif",
        ],
      },
      borderRadius: {
        xl2: "1.25rem", // 20px — card radius
      },
      boxShadow: {
        soft: "0 1px 2px rgba(0,0,0,0.4), 0 16px 32px -12px rgba(0,0,0,0.55)",
        lift: "0 8px 24px rgba(0,0,0,0.4), 0 40px 80px -24px rgba(0,0,0,0.75)",
        glow: "0 0 0 1px rgba(236,72,137,0.35), 0 18px 60px -12px rgba(236,72,137,0.4)",
      },
      backgroundImage: {
        // dramatic hero glow on the obsidian canvas
        "calm-hero":
          "radial-gradient(900px 520px at 80% -10%, rgba(236,72,137,0.16) 0%, transparent 55%), radial-gradient(700px 480px at 12% 8%, rgba(125,58,120,0.22) 0%, transparent 55%), linear-gradient(180deg, #0c080d 0%, #14101a 100%)",
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "200% 0" },
          "100%": { backgroundPosition: "-200% 0" },
        },
        "live-pulse": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.35" },
        },
      },
      animation: {
        marquee: "marquee 40s linear infinite",
        shimmer: "shimmer 4s ease infinite",
        "live-pulse": "live-pulse 1.6s ease infinite",
      },
    },
  },
  plugins: [],
};

export default config;
