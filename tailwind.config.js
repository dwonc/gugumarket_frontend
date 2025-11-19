/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#6B4F4F",
        secondary: "#8B7070",
        accent: "#A89080",
        light: "#E8D5D5",
      },
    },
  },
  plugins: [],
};
