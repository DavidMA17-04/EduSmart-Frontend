/** @type {import('tailwindcss').Config} */
/** CTP Hojancha / MEP brand — keep in sync with src/styles/brand-tokens.css */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: '#021A53',
          'navy-deep': '#01133D',
          primary: '#002E7A',
          'primary-hover': '#164687',
          'primary-light': '#EFF4FB',
          gold: '#CFAC65',
          'gold-dark': '#9B7D2E',
          'gold-light': '#F8F1E3',
          green: '#168750',
          'green-hover': '#147445',
          'green-light': '#E8F5EC',
          warning: '#B86800',
          danger: '#D32F2F',
          orange: '#E65100',
          background: '#F5F6F8',
          surface: '#FFFFFF',
          border: '#C1C5C8',
          muted: '#6B7280',
          'nav-muted': '#DBE8FF',
          'nav-accent': '#7EB6FF',
        },
      },
      fontFamily: {
        serif: ["'Merriweather'", 'Georgia', "'Times New Roman'", 'serif'],
        sans: ["'Source Sans 3'", "'Segoe UI'", 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
