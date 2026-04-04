import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.ts",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: "#0a0e17",
          50: "#0d1220",
          100: "#0f1520",
          200: "#151d2e",
          300: "#1c2740",
          400: "#243352",
        },
        accent: {
          DEFAULT: "#00ff88",
          dim: "#00cc6a",
          muted: "#00994f",
        },
        warn: "#ffaa00",
        danger: "#ff4444",
        info: "#44aaff",
        muted: "#6b7b95",
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
