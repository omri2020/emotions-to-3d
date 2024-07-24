/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        arbel: ["ArbelG", "sans-serif"],
      },
      spacing: {
        "150px": "150px",
        "20px": "20px", // Adjust this value as needed
      },
    },
  },
  plugins: [],
};
