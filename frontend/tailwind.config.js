/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: "#050a2f",
        purple: "#260048",
        glow: "#7a5cff",
      }
    },
  },
  plugins: [],
}
