
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#7b1e3a', // maroon primary
          light: '#9c2a4c',
          dark: '#5b152a'
        }
      }
    },
  },
  plugins: [],
}
