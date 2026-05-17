import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f1f8f6",
          100: "#dcefe9",
          200: "#bcdfd4",
          300: "#8fc7b6",
          400: "#5fa994",
          500: "#3f8c79",
          600: "#2f7062",
          700: "#285a50",
          800: "#234842",
          900: "#1f3c38",
        },
      },
      fontFamily: {
        sans: ["ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Roboto", "Arial", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
