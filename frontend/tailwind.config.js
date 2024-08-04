/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        abraham: ["AbrahamTrial", "sans-serif"],
        arbel: ["ArbelG", "sans-serif"],
      },
      colors: {
        main: "#5F6C7C",
      },
      spacing: {
        "150px": "150px",
        "20px": "20px", // Adjust this value as needed
      },
    },
  },
  plugins: [],
};
