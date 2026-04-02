/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#1b31e7",
        primary_container: "#3e51ff",
        surface_tint: "#3044f4",
        secondary_container: "#00ccf9",
        on_secondary_container: "#005266",
        surface: "#f7f9fb",
        surface_bright: "#f7f9fb",
        surface_container_low: "#f2f4f6",
        surface_container_lowest: "#ffffff",
        surface_container_high: "#e6e8ea",
        on_surface: "#191c1e",
        on_surface_variant: "#444556",
        outline_variant: "#c5c5d9",
        inverse_surface: "#2d3133",
        inverse_on_surface: "#eff1f3",
        primary_fixed: "#dfe0ff",
        error: "#ba1a1a",
        error_container: "#ffdad6",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "1rem",
        sm: "0.75rem",
        md: "1.5rem",
        lg: "2rem",
        full: "9999px",
      },
      boxShadow: {
        glass: "0 12px 40px rgba(25,28,30,0.04)",
        glow: "0 0 20px rgba(27,49,231,0.15)",
      },
      backdropBlur: {
        glass: "24px",
      },
      letterSpacing: {
        tight: "-0.02em",
      },
      lineHeight: {
        airy: "1.6",
      },
    },
  },
  plugins: [],
};
