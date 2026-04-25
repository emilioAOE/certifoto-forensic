import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.ts",
  ],
  theme: {
    extend: {
      colors: {
        // Surface = grises muy claros / blancos para fondos
        surface: {
          DEFAULT: "#ffffff",
          50: "#fbfbfa",
          100: "#ffffff",
          200: "#f5f6f5",
          300: "#e7eae7",
          400: "#d2d6d2",
        },
        // Verde formal (no neon)
        accent: {
          DEFAULT: "#16a34a",   // green-600
          dim: "#15803d",       // green-700
          dark: "#166534",      // green-800
          muted: "#22c55e",     // green-500
          light: "#dcfce7",     // green-100
          softer: "#f0fdf4",    // green-50
        },
        warn: "#d97706",
        danger: "#dc2626",
        info: "#0284c7",
        muted: "#6b7280",     // gray-500
      },
      fontFamily: {
        mono: ["var(--font-geist-mono)", "monospace"],
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
