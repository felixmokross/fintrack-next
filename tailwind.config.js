module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      gridTemplateRows: {
        layout: "auto minmax(0, 1fr)",
        accounts: "1fr 1.618fr",
      },
      gridTemplateColumns: {
        "accounts-md": "18rem auto",
        "accounts-lg": "23rem auto",
        "accounts-xl": "42rem auto",
        "accounts-2xl": "61rem auto",
        "datepicker-days": "repeat(7, 2.5rem)",
      },
    },
  },
  plugins: [],
};
