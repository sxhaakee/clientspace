import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-dm-sans)", "sans-serif"],
        serif: ["var(--font-dm-serif-display)", "serif"],
        mono: ["var(--font-jetbrains-mono)", "monospace"],
      },
      colors: {
        // Dark theme tokens (Freelancer Dashboard & Auth)
        brand: {
          bg: "#0C0C0E",      // Dark background
          surface: "#121214", // Dark card surfaces
          border: "#27272A",  // Dark border
          accent: "#C8F04B",  // Electric Lime Green Accent
          text: "#FAFAF8",    // Light/White text
          muted: "#A1A1AA",   // Muted gray text
        },
        // Dark theme tokens (Client Portal)
        client: {
          bg: "#0C0C0E",      // Dark background
          surface: "#121214", // Dark card surfaces
          border: "#27272A",  // Dark border
          text: "#FAFAF8",    // Light/White text
          muted: "#A1A1AA",   // Muted gray text
        },
        success: "#3ECF8E",
        warning: "#F5A623",
        danger: "#EF4444",
      },
    },
  },
  plugins: [],
};
export default config;
