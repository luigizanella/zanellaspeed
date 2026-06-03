/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./pages/**/*.{js,jsx}', './components/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: { sora: ['Sora', 'sans-serif'] },
      colors: {
        brand: '#2E3DF0',
        'brand-dark': '#1e2dd4',
        'brand-light': '#4a57f3',
      },
    },
  },
  plugins: [],
}
