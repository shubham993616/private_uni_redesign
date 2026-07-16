/**
 * Tailwind theme — "Counsel" design system (Vidyarthi Mitra).
 *
 * Token names are PRESERVED from the previous config (primary, accent, link,
 * light-*, dark-*, success/warning/error) so every existing className keeps
 * compiling — but the VALUES now come from the approved palette:
 *   · one brand orange  (primary.DEFAULT #EA580C, hover/pressed #C2410C)
 *   · amber reserved for the commerce channel (sponsored/tiers/ratings)
 *   · ink/slate surfaces for structure, full dark-theme parity
 * Do not add colors here without updating styles/tokens.css and the design
 * documentation — no raw hex in components.
 *
 * @type {import('tailwindcss').Config}
 */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Brand orange — THE action color. DEFAULT is brand-600.
        primary: {
          DEFAULT: "#EA580C",
          light: "#F97316",   // graphic accents only — never text on white
          dark: "#C2410C",    // hover / pressed / accessible text
          50: "#FFF7ED", 100: "#FFEDD5", 200: "#FED7AA", 300: "#FDBA74",
          400: "#FB923C", 500: "#F97316", 600: "#EA580C", 700: "#C2410C",
          800: "#9A3412", 900: "#7C2D12",
        },
        // Amber — the commerce channel (Sponsored, tiers, stars). Never CTAs.
        accent: {
          DEFAULT: "#F59E0B",
          light: "#FBBF24",
          dark: "#D97706",
          50: "#FFFBEB", 100: "#FEF3C7", 200: "#FDE68A", 300: "#FCD34D",
          400: "#FBBF24", 500: "#F59E0B", 600: "#D97706", 700: "#B45309",
          800: "#92400E", 900: "#78350F",
        },
        // Surfaces
        dark: { bg: "#020817", card: "#0F172A", border: "#1E293B", text: "#F8FAFC", muted: "#94A3B8" },
        light: { bg: "#FFFFFF", card: "#F8FAFC", border: "#E2E8F0", text: "#0F172A", muted: "#64748B" },
        ink: { DEFAULT: "#0F172A", 800: "#1E293B", 700: "#334155" },
        // Semantic
        success: { DEFAULT: "#10B981", text: "#047857", tint: "#ECFDF5" },
        warning: { DEFAULT: "#F59E0B", text: "#B45309", tint: "#FFFBEB" },
        error: { DEFAULT: "#EF4444", text: "#B91C1C", tint: "#FEF2F2" },
        info: { DEFAULT: "#3B82F6", text: "#1D4ED8", tint: "#EFF6FF" },
        // Accessible link/label color (≥4.5:1 on white) — the only orange text on white.
        link: "#C2410C",
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', '"Noto Sans Devanagari"', "Inter", "system-ui", "sans-serif"],
        serif: ['"Playfair Display"', '"Noto Serif Devanagari"', "serif"],
      },
      borderRadius: {
        xl: "12px",
        "2xl": "16px",
        btn: "10px",   // buttons + inputs
        card: "16px",  // cards, modals, panels
      },
      boxShadow: {
        card: "0 1px 3px 0 rgba(15,23,42,0.08)",
        "card-hover": "0 10px 30px -10px rgba(15,23,42,0.15)",
        modal: "0 24px 60px -12px rgba(15,23,42,0.30)",
      },
      maxWidth: {
        content: "1280px", // single page container
        prose: "70ch",
      },
      transitionDuration: {
        state: "150ms",
        move: "250ms",
        overlay: "400ms",
      },
    },
  },
  plugins: [],
};
