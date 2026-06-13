import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // MandoMood Brand Colors — tu logo chinh thuc
        // Logo palette: kem #F5E6C8 · nau #5C3D1E · do cam #E8634A · vang #E8A838
        bg: "#0D0D0D",
        surface: "#1A1A1A",
        surface2: "#242424",
        border: "rgba(255,255,255,0.08)",
        // Primary brand (tu logo)
        "mm-red": "#E8634A",
        "mm-brown": "#5C3D1E",
        "mm-cream": "#F5E6C8",
        "mm-gold": "#E8A838",
        // Secondary
        "mm-beige": "#F5E6D3",
        "mm-warm": "#FDF4E7",
        "mm-sage": "#8FAF8F",
        "mm-rose": "#C9878A",
      },
      fontFamily: {
        playfair: ["Playfair Display", "serif"],
        inter: ["Inter", "sans-serif"],
        noto: ["Noto Serif SC", "serif"],
        chinese: ["Noto Serif SC", "serif"],
      },
      animation: {
        "fade-up": "fadeUp 0.5s ease forwards",
        float: "float 3s ease-in-out infinite",
        pulse: "pulse 2s ease-in-out infinite",
        "slide-in": "slideIn 0.3s cubic-bezier(0.34,1.56,0.64,1)",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        float: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        slideIn: {
          "0%": { opacity: "0", transform: "translateY(10px) scale(0.95)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" },
        },
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
};

export default config;
