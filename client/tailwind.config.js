/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        diamond: {
          50: "#ecfeff",
          100: "#cffafe",
          200: "#a5f3fc",
          300: "#67e8f9",
          400: "#22d3ee",
          500: "#06b6d4",
          600: "#0891b2",
          700: "#0e7490",
          800: "#155e75",
          900: "#164e63",
        },
        ink: {
          950: "#06070c",
          900: "#0b1020",
          800: "#0f1730",
        },
      },
      boxShadow: {
        glow: "0 0 30px rgba(34, 211, 238, 0.25)",
      },
    },
  },
  plugins: [],
};
