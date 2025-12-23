/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/app/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: 'Roboto Mono, monospace',
        montserrat: ["var(--font-montserrat)"],
      },
    },
  },
  plugins: [],
};
