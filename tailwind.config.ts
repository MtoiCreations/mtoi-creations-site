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
        primary: {
          DEFAULT: "#1A1A1A",
          light: "#2D2D2D",
        },
        secondary: {
          DEFAULT: "#8B4557",
          light: "#A85A6D",
          dark: "#6D3644",
        },
        accent: {
          DEFAULT: "#D4A5A5",
          light: "#E8C4C4",
          dark: "#B88888",
        },
        cream: {
          DEFAULT: "#F5F0EB",
          light: "#FDFBF9",
          dark: "#E8E0D8",
        },
        text: {
          primary: "#1A1A1A",
          secondary: "#6B6B6B",
          light: "#9B9B9B",
        },
      },
      fontFamily: {
        serif: ["Cormorant Garamond", "Georgia", "serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Josefin Sans", "sans-serif"],
      },
      borderRadius: {
        card: "12px",
        image: "20px",
        button: "8px",
      },
      boxShadow: {
        soft: "0 4px 20px rgba(0, 0, 0, 0.08)",
        medium: "0 8px 30px rgba(0, 0, 0, 0.12)",
        hover: "0 12px 40px rgba(0, 0, 0, 0.15)",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out",
        "slide-up": "slideUp 0.5s ease-out",
        "zoom-in": "zoomIn 0.3s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        zoomIn: {
          "0%": { transform: "scale(1)" },
          "100%": { transform: "scale(1.05)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
