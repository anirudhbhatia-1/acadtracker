/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand & Palette Tokens (design.md §3.1)
        ink: '#2B3A67',
        'chalk-teal': '#2E8B8B',
        paper: '#F3F4F7',
        'deep-ink': '#14161F',
        
        // Semantic Status Tokens (design.md §3.1)
        'status-safe': '#2F9E64',
        'status-warning': '#E8A33D',
        'status-critical': '#D64545',
        'status-info': '#3E6FD9',

        // Theme CSS Variable Bridges (design.md §10)
        bg: "var(--bg)",
        surface: "var(--surface)",
        'surface-2': "var(--surface-2)",
        border: "var(--border)",
        input: "var(--border)",
        ring: "var(--ink)",
        background: "var(--bg)",
        foreground: "var(--text)",
        
        primary: {
          DEFAULT: "var(--ink)",
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "var(--surface-2)",
          foreground: "var(--text)",
        },
        destructive: {
          DEFAULT: "var(--status-critical)",
          foreground: "#FFFFFF",
        },
        muted: {
          DEFAULT: "var(--surface-2)",
          foreground: "var(--text-muted)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "#FFFFFF",
        },
        popover: {
          DEFAULT: "var(--surface)",
          foreground: "var(--text)",
        },
        card: {
          DEFAULT: "var(--surface)",
          foreground: "var(--text)",
        },
      },
      fontFamily: {
        display: ['Fraunces', 'serif'],
        sans: ['Inter', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      borderRadius: {
        md: '6px',
        lg: '10px',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
