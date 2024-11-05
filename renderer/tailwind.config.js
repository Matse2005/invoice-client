const colors = require("tailwindcss/colors");

module.exports = {
  content: [
    "./renderer/pages/**/*.{js,ts,jsx,tsx}",
    "./renderer/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: colors.gray["100"],
        "background-hover": colors.gray["300"],
        foreground: colors.gray["900"],
        "foreground-hover": colors.gray["900"],
        primary: colors.blue["600"],
        "primary-hover": colors.blue["700"],
      },
    },
  },
  plugins: [],
};
