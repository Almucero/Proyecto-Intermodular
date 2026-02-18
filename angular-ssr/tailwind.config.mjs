/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Montserrat", "sans-serif"],
        cinzel: ["Cinzel", "serif"],
      },
    },
  },
  plugins: [],
  corePlugins: {
    preflight: false,
  },
};
