import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        aqua: {
          50: "#F1FBFB",
          100: "#EAF8F8",
          200: "#E7F6F7",
          300: "#DDEFF0",
          400: "#B8E5E7",
          500: "#18BEEA",
          600: "#0EA5E9",
          700: "#0284C7",
          800: "#0F172A",
          900: "#0C1222",
        },
        slate: {
          DEFAULT: "#334155",
          muted: "#94A3B8",
        },
        success: "#14B8A6",
        warning: "#F59E0B",
        danger: "#EF4444",
        badge: {
          blue: "#DCEEFF",
          mint: "#D8FFF3",
          amber: "#FFF3D6",
        },
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
      boxShadow: {
        soft: "0 2px 12px rgba(0, 0, 0, 0.04)",
        card: "0 4px 20px rgba(0, 0, 0, 0.06)",
      },
      animation: {
        pulse_slow: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
