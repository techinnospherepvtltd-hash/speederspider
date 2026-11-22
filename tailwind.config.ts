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
        sans: ["'Recursive'", "var(--font-sans)", "Inter", "sans-serif"],
        display: ["'Russo One'", "var(--font-display)", "Rajdhani", "Outfit", "sans-serif"],
        arabic: ["var(--font-arabic)", "Cairo", "Tajawal", "sans-serif"],
        recursive: ["'Recursive'", "sans-serif"],
        russo: ["'Russo One'", "sans-serif"],
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
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeInDown: {
          "0%": { opacity: "0", transform: "translateY(-16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        scaleReveal: {
          "0%": { opacity: "0", transform: "scale(0.96)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        heroSlowPan: {
          "0%": { transform: "scale(1.05) translate(0%, 0%)" },
          "50%": { transform: "scale(1.08) translate(-0.8%, -0.8%)" },
          "100%": { transform: "scale(1.05) translate(0%, 0%)" },
        },
        amberGlow: {
          "0%, 100%": { boxShadow: "0 0 15px rgba(217, 119, 6, 0.25)" },
          "50%": { boxShadow: "0 0 28px rgba(217, 119, 6, 0.55)" },
        },
      },
      animation: {
        telemetry: "telemetry 2s ease-in-out infinite",
        pulseGaze: "pulseGaze 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        fadeInUp: "fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        fadeInDown: "fadeInDown 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        fadeIn: "fadeIn 0.8s ease-out forwards",
        scaleReveal: "scaleReveal 0.9s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        heroSlowPan: "heroSlowPan 22s ease-in-out infinite alternate",
        amberGlow: "amberGlow 3s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
