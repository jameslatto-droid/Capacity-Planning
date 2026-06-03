/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        canvas: '#07070e',
        surface: '#0e0e1a',
        'surface-2': '#14141f',
        'border-subtle': 'rgba(255,255,255,0.06)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'glow-violet': '0 0 24px rgba(139,92,246,0.25)',
        'glow-red': '0 0 24px rgba(239,68,68,0.3)',
        'glow-emerald': '0 0 24px rgba(16,185,129,0.2)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}
