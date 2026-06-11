// Copyright (c) 2025 Devin Hunt contact@devinhunt.com
// tailwind.config.js

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
        forest: { 50:'#f2f7f2',100:'#e4efe4',200:'#c8e0c9',300:'#a5cba7',400:'#7bb17f',500:'#57935c',600:'#3d733f',700:'#315a34',800:'#29472c',900:'#233c25',950:'#122114' },
        earth:  { 50:'#faf6ef',100:'#f2eada',200:'#e6d3b3',300:'#d9b988',400:'#cb9a59',500:'#c08843',600:'#ac7039',700:'#8f5732',800:'#74472f',900:'#613c2b',950:'#351e16' },
        river:  { 50:'#f5f7f9',100:'#e8edf1',200:'#d2dbe3',300:'#b3c2cf',400:'#91aabf',500:'#738ea6',600:'#5b748c',700:'#495f74',800:'#3b4c5d',900:'#2f3a47',950:'#1d242c' },
        stone:  { 50:'#f7f6f2',100:'#eeece4',200:'#ddd9cc',300:'#c4bda9',400:'#a39a82',500:'#847b64',600:'#6a624f',700:'#554e40',800:'#3f3a30',900:'#2b2822',950:'#1a1814' },
        background: 'var(--surface-page)',
        foreground: 'var(--text-body)',
        card: { DEFAULT: 'var(--surface-card)', foreground: 'var(--text-body)' },
        ink: { strong:'var(--text-strong)', body:'var(--text-body)', muted:'var(--text-muted)', faint:'var(--text-faint)' },
        link: { DEFAULT:'var(--text-link)', hover:'var(--text-link-hover)' },
        eyebrow: 'var(--text-eyebrow)',
        accent: { DEFAULT:'var(--brand-accent)' },
        primary: { DEFAULT:'var(--brand-primary)', foreground:'#f2f7f2' },
        border: 'var(--border-hairline)',
        input: 'var(--border-default)',
        ring: 'var(--ring-focus)',
        muted: { DEFAULT:'var(--surface-sunken)', foreground:'var(--text-muted)' },
        secondary: { DEFAULT:'var(--surface-sunken)', foreground:'var(--text-body)' },
        destructive: { DEFAULT:'#a8472f', foreground:'#faf6ef' },
        popover: { DEFAULT:'var(--surface-card)', foreground:'var(--text-body)' },
        contour: 'var(--border-contour)',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'Iowan Old Style', 'Georgia', 'serif'],
        mono: ['var(--font-mono)', 'SF Mono', 'Consolas', 'monospace'],
      },
      letterSpacing: { caps: '0.14em', display: '-0.02em', mono: '0.02em' },
      lineHeight: { 'tight-display': '1.08' },
      borderRadius: { lg: '10px', md: '10px', sm: '6px' },
      keyframes: {
        'slide-in-from-top-2': { from: { transform: 'translateY(-8px)', opacity: 0 }, to: { transform: 'translateY(0)', opacity: 1 } },
        rise: { from: { opacity: 0, transform: 'translateY(14px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
      },
      animation: { rise: 'rise 0.8s ease-out forwards' },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
  ],
}
