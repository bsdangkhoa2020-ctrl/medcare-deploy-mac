/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          light: '#FFF8E7',
          DEFAULT: '#E8A93C',
          dark: '#B57A1F',
        },
        ink: {
          DEFAULT: '#1F1A0F',
          muted: '#7A6F5C',
          light: '#B0A490',
        },
        danger: {
          DEFAULT: '#EF4444',
          dark: '#B91C1C',
        }
      },
      fontFamily: {
        sans: ['"Be Vietnam Pro"', 'system-ui', 'sans-serif'],
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        mono: ['"IBM Plex Sans"', 'monospace'],
      },
    },
  },
  plugins: [],
}
