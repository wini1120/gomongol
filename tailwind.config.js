/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'gmg-camel': '#D4A373',
        'gmg-green': '#586F50',
        'gmg-bg': '#F9F7F2',
      },
    },
  },
  plugins: [],
}