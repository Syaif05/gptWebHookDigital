/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: "#2563eb" }, // biru
        accent: { DEFAULT: "#f59e0b" }, // kuning
      },
      borderRadius: { "2xl": "1rem" },
      boxShadow: { soft: "0 10px 35px rgba(2,6,23,0.08)" },
    },
  },
  plugins: [require("@tailwindcss/forms")],
};
