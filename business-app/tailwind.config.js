/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#FAF5FF',
          100: '#F3E8FF',
          200: '#E9D5FF',
          300: '#D8B4FE',
          400: '#C084FC',
          500: '#A855F7',
          600: '#9333EA',
          700: '#7E22CE',
          800: '#6B21A8',
          900: '#581C87',
          950: '#3B0764',
        },
        neon: {
          purple: '#A855F7',
          violet: '#8B5CF6',
          fuchsia: '#D946EF',
          pink: '#EC4899',
          cyan: '#06B6D4',
          emerald: '#10B981',
          amber: '#F59E0B',
        },
        dark: {
          bg: '#090614',
          surface: '#120C26',
          card: '#181033',
          cardHover: '#201642',
          border: '#281B4B',
          borderLight: '#3B2A68',
        },
        light: {
          bg: '#F8F7FF',
          surface: '#FFFFFF',
          card: '#FFFFFF',
          cardHover: '#F3F0FF',
          border: '#EDE9FE',
        }
      }
    },
  },
  plugins: [],
}
