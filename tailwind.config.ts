import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Calm sage-teal — primary, trust, accents.
        brand: {
          50: "#f2f8f5",
          100: "#dcefe7",
          200: "#bbdfd2",
          300: "#8fc8b6",
          400: "#5fab97",
          500: "#3f8d79",
          600: "#2f7163",
          700: "#285b50",
          800: "#234943",
          900: "#1f3d39",
        },
        // Warm neutral surfaces — page background, panels, borders.
        sand: {
          50: "#faf7f2",
          100: "#f3ede3",
          200: "#e7ddcd",
          300: "#d5c7b0",
          400: "#b9a684",
          500: "#9c8763",
        },
        // Deep warm ink — headings and body text.
        ink: {
          DEFAULT: "#22201c",
          soft: "#4a463f",
          muted: "#7c766b",
        },
        // Warm clay — sparing conversion accent (primary CTA emphasis).
        clay: {
          50: "#fbf2ec",
          100: "#f3ddcd",
          400: "#cf8a5f",
          500: "#bd7349",
          600: "#a35d38",
        },
      },
      fontFamily: {
        sans: [
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "Arial",
          "sans-serif",
        ],
        // Elegant serif for display/headings (system-available — no
        // web-font fetch, so build/preview stay deterministic).
        serif: [
          "Georgia",
          "Cambria",
          '"Iowan Old Style"',
          '"Times New Roman"',
          "serif",
        ],
      },
      borderRadius: {
        xl2: "1.25rem",
      },
      boxShadow: {
        soft: "0 1px 2px rgba(34,32,28,0.04), 0 8px 24px -12px rgba(34,32,28,0.12)",
        lift: "0 4px 12px rgba(34,32,28,0.06), 0 24px 48px -24px rgba(34,32,28,0.22)",
      },
      backgroundImage: {
        "calm-hero":
          "radial-gradient(1200px 600px at 80% -10%, #dcefe7 0%, transparent 55%), linear-gradient(180deg, #faf7f2 0%, #f3ede3 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
