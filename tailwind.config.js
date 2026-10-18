/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fff1f2',
          100: '#ffe4e6',
          200: '#fecdd3',
          300: '#fda4af',
          400: '#fb7185',
          500: '#f43f5e',
          600: '#e11d48',
          700: '#be123c',
          800: '#9f1239',
          900: '#881337',
          950: '#4c0519',
          primary: '#E60026',
          dark: '#990014',
          deep: '#73000F',
          sidebarStart: '#8E0015',
          sidebarMid: '#C40D26',
          sidebarEnd: '#7A0012',
          lightBg: '#F8F9FA',
          softCard: '#FFFFFF',
        }
      },
      fontFamily: {
        sans: ['"Inter"', '"Be Vietnam Pro"', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
        serif: ['"Inter"', '"Be Vietnam Pro"', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
        mono: ['"Inter"', '"Be Vietnam Pro"', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
        'luxury': '0 10px 30px -5px rgba(220, 38, 38, 0.15)',
        'sidebar': '4px 0 24px rgba(115, 0, 15, 0.25)',
      }
    },
  },
  plugins: [],
}
