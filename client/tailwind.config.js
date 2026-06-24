/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#0D1B2A',
          light: '#1B2D45',
          dark: '#080F18',
        },
        teal: {
          DEFAULT: '#00B4D8',
          dark: '#0096B8',
          light: '#48CAE4',
        },
        surface: {
          DEFAULT: '#F0F4F8',
          dark: '#E2E8F0',
        },
      },
      boxShadow: {
        card: '0 1px 3px rgba(13, 27, 42, 0.08), 0 4px 12px rgba(13, 27, 42, 0.04)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
