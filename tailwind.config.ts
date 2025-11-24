// tailwind.config.ts
import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/**/*.{ts,tsx,mdx}",
    "./app/**/*.{ts,tsx,mdx}",
    "./components/**/*.{ts,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // Semantic page colors
        background: "var(--surface)",
        foreground: "var(--text-primary)",

        // Brand tokens mapped to CSS variables (switch with .dark)
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--on-primary)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--on-secondary)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--on-accent)",
          soft: "var(--accent-soft)",
        },

        // Surfaces
        surface: {
          DEFAULT: "var(--surface)",
          alt: "var(--surface-alt)",
          raised: "var(--surface-raised)",
          muted: "var(--surface-muted)",
        },

        // Muted text and subtle UI
        muted: {
          DEFAULT: "var(--surface-muted)",
          foreground: "var(--text-muted)",
        },

        // Borders / inputs / focus ring
        border: "var(--border)",
        input: "var(--border)",
        ring: "var(--focus-outline)",

        // Status colors (useful for badges, alerts)
        success: {
          DEFAULT: "var(--success)",
          foreground: "var(--text-inverse)",
        },
        warning: {
          DEFAULT: "var(--warning)",
          foreground: "var(--text-primary)",
        },
        destructive: {
          DEFAULT: "var(--danger)",
          foreground: "var(--text-inverse)",
        },
        info: {
          DEFAULT: "var(--info)",
          foreground: "var(--text-inverse)",
        },
      },

      borderRadius: {
        lg: "0.75rem",
        xl: "1rem",
        "2xl": "1.5rem",
      },

      boxShadow: {
        card: "var(--shadow)",
        soft: "var(--shadow-lg)",
      },

      keyframes: {
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "slide-up": {
          "0%": { transform: "translateY(8px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },

      animation: {
        "fade-in": "fade-in 200ms ease-out",
        "slide-up": "slide-up 220ms ease-out",
      },

      fontFamily: {
        // you already set the real stacks in globals.css via CSS vars
        // so here you can map Tailwind's "sans" if you want:
        // sans: ["var(--font-sans)"],
      },
    },
  },
  plugins: [],
}

export default config
