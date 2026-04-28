/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['Space Grotesk', 'Inter', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        // Surfaces — deep space dark
        'void': '#06060e',
        'bg-primary': '#0a0b1e',
        'bg-secondary': '#0e1025',
        'bg-elevated': '#13152e',
        'bg-card': 'rgba(14, 16, 37, 0.75)',
        'bg-card-hover': 'rgba(22, 24, 52, 0.8)',
        'bg-glass': 'rgba(12, 13, 30, 0.6)',

        // Borders — purple tinted
        'border-subtle': 'rgba(130, 60, 180, 0.15)',
        'border-default': 'rgba(160, 80, 210, 0.2)',
        'border-focus': 'rgba(192, 38, 211, 0.45)',

        // Primary accent — Fuchsia / Magenta
        'accent': '#c026d3',
        'accent-light': '#e879f9',
        'accent-dark': '#a21caf',

        // Secondary — Purple
        'accent-purple': '#a855f7',
        'accent-purple-light': '#c084fc',

        // Tertiary — Pink
        'accent-pink': '#ec4899',
        'accent-pink-light': '#f472b6',

        // Semantic
        'safe': '#10b981',
        'safe-light': '#34d399',
        'danger': '#ef4444',
        'danger-light': '#f87171',
        'warning': '#f59e0b',
        'warning-light': '#fbbf24',

        // Text
        'text-primary': '#e8ecf4',
        'text-secondary': '#9ca3bf',
        'text-muted': '#5b6080',
        'text-accent': '#e879f9',
      },
      borderRadius: {
        'sm': '8px',
        'md': '12px',
        'lg': '16px',
        'xl': '20px',
        '2xl': '24px',
      },
      boxShadow: {
        'glow-accent': '0 0 25px rgba(192,38,211,0.35), 0 0 80px rgba(192,38,211,0.08)',
        'glow-purple': '0 0 25px rgba(168,85,247,0.3), 0 0 80px rgba(168,85,247,0.06)',
        'glow-pink': '0 0 20px rgba(236,72,153,0.25), 0 0 60px rgba(236,72,153,0.06)',
        'glow-safe': '0 0 25px rgba(16,185,129,0.3), 0 0 80px rgba(16,185,129,0.06)',
        'glow-danger': '0 0 25px rgba(239,68,68,0.3), 0 0 80px rgba(239,68,68,0.06)',
        'card': '0 4px 30px rgba(0,0,0,0.4), 0 0 1px rgba(192,38,211,0.1)',
        'card-hover': '0 8px 40px rgba(0,0,0,0.5), 0 0 60px rgba(192,38,211,0.06)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'shine': 'shine-sweep 2s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        'shine-sweep': {
          '0%': { transform: 'translateX(-100%) skewX(-15deg)' },
          '100%': { transform: 'translateX(200%) skewX(-15deg)' },
        },
      },
    },
  },
  plugins: [],
}
