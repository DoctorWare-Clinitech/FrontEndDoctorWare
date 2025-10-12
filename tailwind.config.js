/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#e6f0ff',
          100: '#b3d1ff',
          200: '#80b3ff',
          300: '#4d94ff',
          400: '#1a75ff',
          500: '#0066CC', // Color principal
          600: '#0052a3',
          700: '#003d7a',
          800: '#002952',
          900: '#001429',
        },
        secondary: {
          50: '#e6fff9',
          100: '#b3fff0',
          200: '#80ffe6',
          300: '#4dffdd',
          400: '#1affd4',
          500: '#00CC99', // Color secundario
          600: '#00a37a',
          700: '#007a5c',
          800: '#00523d',
          900: '#00291f',
        },
        accent: '#FF6B6B',
        background: '#F8F9FA',
        text: '#212529',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
