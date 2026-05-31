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
        // Display font for headlines — refined editorial serif
        display: ["var(--font-display)", "Georgia", "serif"],
        // Body font — clean humanist sans
        body: ["var(--font-body)", "system-ui", "sans-serif"],
        // Accent — elegant small caps feel
        accent: ["var(--font-accent)", "monospace"],
      },
      colors: {
        // Brand palette — deep amber / cognac restaurant luxury
        brand: {
          50:  "#fdf8f0",
          100: "#faefd8",
          200: "#f5dba8",
          300: "#efc170",
          400: "#e89d3c",
          500: "#d4791a",
          600: "#b85e12",
          700: "#954612",
          800: "#793917",
          900: "#643016",
          950: "#3a1508",
        },
        // Warm neutral dark tones
        dark: {
          50:  "#f5f3f0",
          100: "#e8e3db",
          200: "#d2c9bc",
          300: "#b8a99a",
          400: "#9c8878",
          500: "#877160",
          600: "#72594a",
          700: "#5c463c",
          800: "#4b3a32",
          900: "#3e312c",
          950: "#1a1210",
        },
      },
      backgroundImage: {
        "grain": "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.4'/%3E%3C/svg%3E\")",
      },
      animation: {
        "float-slow": "float 8s ease-in-out infinite",
        "float-slower": "float 12s ease-in-out infinite reverse",
        "pulse-glow": "pulseGlow 3s ease-in-out infinite",
        "shimmer": "shimmer 2s linear infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px) scale(1)" },
          "50%": { transform: "translateY(-30px) scale(1.03)" },
        },
        pulseGlow: {
          "0%, 100%": { opacity: "0.4", transform: "scale(1)" },
          "50%": { opacity: "0.7", transform: "scale(1.05)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      boxShadow: {
        "luxury": "0 25px 80px -12px rgba(212, 121, 26, 0.35), 0 8px 32px -8px rgba(0,0,0,0.5)",
        "glow-amber": "0 0 40px rgba(212, 121, 26, 0.4), 0 0 80px rgba(212, 121, 26, 0.15)",
        "card": "0 4px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)",
        "inner-glow": "inset 0 1px 0 rgba(255,255,255,0.1), inset 0 -1px 0 rgba(0,0,0,0.2)",
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
};

export default config;
