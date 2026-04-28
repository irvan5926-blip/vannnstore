/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef4ff",
          100: "#dde8ff",
          200: "#b8cfff",
          300: "#85adff",
          400: "#5285ff",
          500: "#2b62ff",
          600: "#1745e0",
          700: "#1335b3",
          800: "#142e8a",
          900: "#152b6e",
          950: "#0c1844",
        },
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
