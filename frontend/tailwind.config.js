/** @type {import('tailwindcss').Config} */
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx,vue}"],
  theme: {
    extend: {
      colors: {
        white: "#fff",
        whitesmoke: {
          100: "#f5f5f5",
          200: "#eee",
        },
        gray: {
          100: "#fefefe",
          200: "#fbfbfb",
          300: "#787878",
          400: "#757575",
          500: "#2c2c2c",
          600: "#1e1e1e",
          700: "#101010",
        },
        gainsboro: {
          100: "#e4e4e4",
          200: "#d9d9d9",
        },
        darkslategray: "#484848",
        darkslateblue: {
          100: "#25356e",
          200: "#1b264f",
        },
        orangered: {
          100: "#ff6a00",
          200: "#da3a00",
        },
        pink: {
          400: "#FF86C9",
          600: "#E00A80",
        },
        black: "#000",
      },
      spacing: {
        "num-1280": "1280px",
        "num-60": "60px",
        "num-646": "646px",
        "num-30": "30px",
        "num-120": "120px",
        "num-1": "1px",
      },
      fontFamily: {
        inter: "Inter",
      },
      borderRadius: {
        "num-0": "0px",
        "num-5": "5px",
        "num-10": "10px",
        "num-8": "8px",
      },
      padding: {
        "num-10": "10px",
        "num-20": "20px",
        "num-12": "12px",
        "num-16": "16px",
        "num-30": "30px",
      },
      opacity: {
        "num-0_7": "0.7",
      },
    },
    fontSize: {
      "num-25": "1.563rem",
      "num-16": "1rem",
      "num-13": "0.813rem",
      "num-14": "0.875rem",
      "num-48": "3rem",
      "num-30": "1.875rem",
    },
  },
  corePlugins: {
    preflight: false,
  },
};
