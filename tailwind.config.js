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
          DEFAULT: '#B8814A',
          dk: '#8C5C2E',
          lt: '#FDF0E8',
          md: '#DEC0A0',
        },
        ink: {
          DEFAULT: '#1C1510',
          2: '#4A3020',
          muted: '#907060',
          hint: '#C0A888',
        },
        gy: {
          DEFAULT: '#F0B8C0',
          dk: '#C96080',
          lt: '#FFF0F2',
          md: '#E8B8C4',
          bg: '#FDEEF0',
          ink: '#2A1015',
          muted: '#9A6070',
          darkBg: '#2A1015',
        },
        bg: '#FEFAF5',
        surface: '#FFFFFF',
        border: '#E8D8C8',
        borderMd: '#D4BFA8',
        danger: {
          DEFAULT: '#C03030',
          dk: '#802020',
          lt: '#FFF0EE',
        },
        ok: {
          DEFAULT: '#2E6E50',
          lt: '#E8F4EC',
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
