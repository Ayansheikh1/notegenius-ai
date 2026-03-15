/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Playfair Display"', 'serif'],
        body: ['"DM Sans"', 'sans-serif'],
        mono: ['"DM Mono"', 'monospace'],
      },
      colors: {
        ink: {
          DEFAULT: '#0d0f14',
          2: '#181b24',
          3: '#222639',
        },
        amber: {
          DEFAULT: '#e8a838',
          light: '#f5c96a',
        },
        teal: '#3ecfb2',
        rose: '#e85d75',
        muted: '#8890a8',
      },
      animation: {
        'fade-slide': 'fadeSlide 0.4s ease forwards',
        'spin-slow': 'spin 2s linear infinite',
      },
      keyframes: {
        fadeSlide: {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
