import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        brand: {
          deepNavy: "#0B132B",
          navy: "#1C2541",
          steelBlue: "#3A506B",
          cyan: "#5BC0DE",
          warmBeige: "#F4D6B0",
          amber: "#D97706",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Inter", "sans-serif"],
        display: ["var(--font-display)", "Rajdhani", "Outfit", "sans-serif"],
        arabic: ["var(--font-arabic)", "Cairo", "Tajawal", "sans-serif"],
      },
      keyframes: {
        telemetry: {
          "0%, 100%": { opacity: "0.3", transform: "scaleX(0.95)" },
          "50%": { opacity: "1", transform: "scaleX(1)" },
        },
        pulseGaze: {
          "0%, 100%": { opacity: "0.4" },
          "50%": { opacity: "0.9" },
        },
      },
      animation: {
        telemetry: "telemetry 2s ease-in-out infinite",
        pulseGaze: "pulseGaze 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
    },
  },
  plugins: [],
};

export default config;
