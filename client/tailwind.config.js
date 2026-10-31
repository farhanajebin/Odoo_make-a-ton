/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        loopnex: {
          deepNavy: '#0B1220',
          graphite: '#151E2D',
          surface: '#1C293A',
          surfaceLight: '#243449',
          surfaceBorder: '#27384E',
          electricTeal: '#27D3C2',
          softCyan: '#72D8E8',
          violetAccent: '#8175F5',
          primaryText: '#F3F6FA',
          secondaryText: '#9AAABD',
          // Light Mode Brand tokens
          lightBg: '#F8FAFC',
          lightCard: '#FFFFFF',
          lightBorder: '#E2E8F0',
          lightTextPrimary: '#0F172A',
          lightTextSecondary: '#475569',
          lightMuted: '#64748B',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'card-dark': '0 4px 20px -2px rgba(3, 7, 18, 0.5), 0 2px 6px -1px rgba(3, 7, 18, 0.4)',
        'card-light': '0 4px 20px -2px rgba(15, 23, 42, 0.06), 0 2px 6px -1px rgba(15, 23, 42, 0.04)',
        'glow-teal': '0 0 25px -5px rgba(39, 211, 194, 0.3)',
      },
      borderRadius: {
        'xl': '0.875rem',
        '2xl': '1rem',
      },
    },
  },
  plugins: [],
};
