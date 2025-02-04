import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/{**,.client,.server}/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        "tm-blue": {
          50: "#F4FBFD",
          100: "#E4F4FB",
          200: "#CAE9F7",
          300: "#98D0F0",
          400: "#5FA3D4",
          500: "#3473A9",
          600: "#093B70",
          700: "#062D60",
          800: "#042250",
          900: "#021740",
        },
        "tm-green": {
          50: "#F4FEF5",
          100: "#E9FDEC",
          200: "#D4FBDA",
          300: "#AAF7BF",
          400: "#7BE9A4",
          500: "#57D492",
          600: "#28B87A",
          700: "#1D9E73",
          800: "#14846A",
          900: "#0C6A5E",
        },
      },
      fontFamily: {
        sans: [
          "Avenir Next LT Pro",
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
          "Apple Color Emoji",
          "Segoe UI Emoji",
          "Segoe UI Symbol",
          "Noto Color Emoji",
        ],
      },
    },
  },
  plugins: [],
} satisfies Config;
