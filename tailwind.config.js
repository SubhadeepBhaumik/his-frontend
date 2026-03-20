/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#edfaf4',
          100: '#d3f3e4',
          200: '#a9e6cb',
          300: '#71d2ab',
          400: '#3db888',
          500: '#1a9e6e',
          600: '#0e7f58',
          700: '#0c6548',
          800: '#0b5139',
          900: '#09402e',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px 0 rgb(0 0 0 / 0.08), 0 1px 2px -1px rgb(0 0 0 / 0.08)',
        'card-hover': '0 4px 12px 0 rgb(0 0 0 / 0.10)',
      },
    },
  },
  plugins: [],
};
