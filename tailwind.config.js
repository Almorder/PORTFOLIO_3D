export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: '#050403',
        orange: '#CC460C',
        white: '#F0EBE2',
        dim: '#C8C4BC',
      },
      fontFamily: {
        yrsa: ['Yrsa', 'serif'],
        syne: ['Syne', 'sans-serif'],
        sans: ['DM Sans', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
