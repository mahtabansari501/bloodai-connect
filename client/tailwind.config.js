/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bloodRed: '#d91e18',
        medicalBlue: '#1f3a93',
      }
    },
  },
  plugins: [],
}
