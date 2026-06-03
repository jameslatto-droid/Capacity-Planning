/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        canvas: 'var(--bg)',
        surface: 'var(--surface)',
        ink: 'var(--text)',
        muted: 'var(--text-muted)',
        faint: 'var(--text-faint)',
      },
      boxShadow: {
        'glow-violet': '0 0 24px rgba(124,58,237,0.3)',
        'glow-red':    '0 0 20px rgba(239,68,68,0.3)',
      },
    },
  },
  plugins: [],
}
