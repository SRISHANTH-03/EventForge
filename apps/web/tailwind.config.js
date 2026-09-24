/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          DEFAULT: '#176B57', // Primary forest green
          dark: '#0E4F42',    // Deep green
          light: '#23856D',
        },
        teal: {
          muted: '#3B8C7A',   // Muted teal
        },
        warm: {
          white: '#FAF9F5',   // Warm white
          surface: '#FFFFFF',
          cream: '#F3EFE6',
        },
        mint: {
          soft: '#EAF4F0',    // Soft mint
          subtle: '#F2F8F5',
        },
        text: {
          main: '#25312D',    // Main text
          muted: '#68756F',   // Muted text
          light: '#8A9791',
        },
        border: {
          DEFAULT: '#D7E1DC', // Borders
          subtle: '#E6ECE9',
        },
        status: {
          success: '#176B57',
          warning: '#C05621',
          critical: '#9B2C2C',
          info: '#2B6CB0',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      boxShadow: {
        subtle: '0 1px 3px rgba(37, 49, 45, 0.05)',
        card: '0 2px 8px -2px rgba(37, 49, 45, 0.06)',
        lift: '0 8px 24px -4px rgba(37, 49, 45, 0.08)',
      },
    },
  },
  plugins: [],
};
