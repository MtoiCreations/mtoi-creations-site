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
          DEFAULT: "#3B1526",
          light: "#55223A",
        },
        secondary: {
          DEFAULT: "#D8415B",
          light: "#E8546B",
          dark: "#B22D45",
        },
        accent: {
          DEFAULT: "#F0A23D",
          light: "#FFC978",
          dark: "#C77F1F",
        },
        cream: {
          DEFAULT: "#FFF3E9",
          light: "#FFFBF7",
          dark: "#FCE0C8",
        },
        text: {
          primary: "#3B1526",
          secondary: "#7A5560",
          light: "#B08D95",
        },
        encre: "#2E1A24",
        fond: "#F4EFF2",
        surface: "#FBF9FA",
        safran: "#E9A200",
        framboise: "#A93F5B",
        lichen: "#6E7F58",
      },
      backgroundImage: {
        sunset: "linear-gradient(135deg, #FFC978 0%, #F0724F 45%, #C43852 100%)",
        "sunset-soft": "linear-gradient(135deg, #FFE8D1 0%, #FDD5C8 50%, #F5C2CE 100%)",
      },
      fontFamily: {
        serif: ["Cormorant Garamond", "Georgia", "serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Josefin Sans", "sans-serif"],
        script: ["Alex Brush", "cursive"],
        titre: ["Bricolage Grotesque", "system-ui", "sans-serif"],
        corps: ["Literata", "Georgia", "serif"],
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
