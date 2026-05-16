/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      spacing: {
        navbar: "4.75rem",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
      },
      colors: {
        lx: {
          page: "var(--lx-page)",
          surface: "var(--lx-surface)",
          elevated: "var(--lx-elevated)",
          border: "var(--lx-border)",
          muted: "var(--lx-text-secondary)",
          foreground: "var(--lx-text-primary)",
        },
        brand: {
          blue: "#2563eb",
          indigo: "#4f46e5",
        },
      },
      backgroundImage: {
        brand: "linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)",
        footer:
          "linear-gradient(to right, #1e3a8a 0%, #3730a3 55%, #4f46e5 100%)",
        footerDark:
          "linear-gradient(to right, #0f172a 0%, #1e3a8a 55%, #1e40af 100%)",
      },
      boxShadow: {
        soft: "0 1px 3px 0 rgb(15 23 42 / 0.06), 0 1px 2px -1px rgb(15 23 42 / 0.06)",
        lifted:
          "0 10px 40px -12px rgb(15 23 42 / 0.12), 0 4px 16px -8px rgb(37 99 235 / 0.08)",
        "nav-scrolled":
          "0 4px 24px -8px rgb(15 23 42 / 0.1), 0 1px 0 rgb(226 232 240 / 1)",
        "nav-scrolled-dark":
          "0 8px 32px -12px rgb(0 0 0 / 0.4), 0 1px 0 rgb(31 41 55 / 0.85)",
      },
    },
  },

  plugins: [],
};
