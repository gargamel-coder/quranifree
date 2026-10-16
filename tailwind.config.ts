import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        base: "#121212",
        surface: "#1a1a1a",
        surface2: "#242424",
        accent: "#4caf7d",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        amiri: ["Amiri", "serif"],
      },
    },
  },
  plugins: [],
};
export default config;
