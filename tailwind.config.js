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
    },
  },
  plugins: [],
};
