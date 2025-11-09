// Copyright (c) 2025 Devin Hunt contact@devinhunt.com
// tailwind.config.js
// Configuring the topography of our styles - just like Devin maps watersheds!

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
    './hooks/**/*.{ts,tsx}',
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
        // Nature-inspired colors - organized and optimized
        forest: {
          50: '#f2f7f2',
          100: '#e4efe4',
          200: '#c8e0c9',
          300: '#a5cba7',
          400: '#7bb17f',
          500: '#57935c',
          600: '#3d733f',
          700: '#315a34',
          800: '#29472c',
          900: '#233c25',
          950: '#122114',
        },
        river: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#b9e6fe',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
          950: '#082f49',
        },
        earth: {
          50: '#faf6ef',
          100: '#f2eada',
          200: '#e6d3b3',
          300: '#d9b988',
          400: '#cb9a59',
          500: '#c08843',
          600: '#ac7039',
          700: '#8f5732',
          800: '#74472f',
          900: '#613c2b',
          950: '#351e16',
        },
        // Design system colors
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      // Enhanced z-index scale
      zIndex: {
        'dropdown': '1000',
        'sticky': '1020', 
        'fixed': '1030',
        'modal-backdrop': '1040',
        'modal': '1050',
        'popover': '1060',
        'tooltip': '1070',
        'toast': '1080',
      },
      // Enhanced animation system
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
        "fade-in": {
          from: { opacity: 0 },
          to: { opacity: 1 },
        },
        "slide-up": {
          from: { transform: "translateY(100%)" },
          to: { transform: "translateY(0)" },
        },
        "scale-in": {
          from: { transform: "scale(0.95)" },
          to: { transform: "scale(1)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.3s ease-out",
        "slide-up": "slide-up 0.3s ease-out",
        "scale-in": "scale-in 0.2s ease-out",
      },
      // Enhanced spacing system
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      // Typography improvements
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Consolas', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.75rem' }],
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    // Add custom plugin for surface elevation utilities
    function({ addUtilities, theme }) {
      const surfaceUtilities = {
        '.surface-1': {
          boxShadow: theme('boxShadow.sm'),
        },
        '.surface-2': {
          boxShadow: theme('boxShadow.md'),
        },
        '.surface-3': {
          boxShadow: theme('boxShadow.lg'),
        },
        '.surface-4': {
          boxShadow: theme('boxShadow.xl'),
        },
        '.surface-5': {
          boxShadow: theme('boxShadow.2xl'),
        },
      };
      addUtilities(surfaceUtilities);
    },
    // Add custom plugin for text shadow utilities
    function({ addUtilities }) {
      const textShadowUtilities = {
        '.text-shadow-sm': {
          textShadow: '0 1px 2px rgba(0, 0, 0, 0.5)',
        },
        '.text-shadow': {
          textShadow: '0 2px 4px rgba(0, 0, 0, 0.7)',
        },
        '.text-shadow-md': {
          textShadow: '0 2px 4px rgba(0, 0, 0, 0.7)',
        },
        '.text-shadow-lg': {
          textShadow: '0 4px 8px rgba(0, 0, 0, 0.8)',
        },
        '.text-shadow-xl': {
          textShadow: '0 8px 16px rgba(0, 0, 0, 0.9)',
        },
        '.text-shadow-none': {
          textShadow: 'none',
        },
      };
      addUtilities(textShadowUtilities);
    },
  ],
}
