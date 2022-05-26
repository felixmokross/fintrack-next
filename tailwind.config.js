const plugin = require("tailwindcss/plugin");
const selectorParser = require("postcss-selector-parser");

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
  plugins: [
    // custom group-hover variant since Tailwind CSS does not support nested group-hovers
    plugin(function ({ addVariant }) {
      addVariant("secondary-group-hover", ({ modifySelectors, separator }) => {
        return modifySelectors(({ selector }) => {
          return selectorParser((selectors) => {
            selectors.walkClasses((sel) => {
              sel.value = `secondary-group-hover${separator}${sel.value}`;

              sel.parent.insertBefore(
                sel,
                selectorParser().astSync(".secondary-group:hover ")
              );
            });
          }).processSync(selector);
        });
      });
    }),
    require("@tailwindcss/forms"),
  ],
};
