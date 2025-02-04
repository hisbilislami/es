import { createTheme, MantineColorsTuple } from "@mantine/core";

const tmBlue: MantineColorsTuple = [
  "#F4FBFD",
  "#E4F4FB",
  "#CAE9F7",
  "#98D0F0",
  "#5FA3D4",
  "#3473A9",
  "#093B70",
  "#062D60",
  "#042250",
  "#021740",
];

const tmGreen: MantineColorsTuple = [
  "#F4FEF5",
  "#E9FDEC",
  "#D4FBDA",
  "#AAF7BF",
  "#7BE9A4",
  "#57D492",
  "#28B87A",
  "#1D9E73",
  "#14846A",
  "#0C6A5E",
];

export const theme = createTheme({
  primaryColor: "tmBlue",
  colors: {
    tmBlue: tmBlue,
    tmGreen: tmGreen,
  },
  fontFamily: "Avenir Next LT Pro",
  components: {},
});
