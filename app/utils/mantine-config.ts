import {
  Button,
  createTheme,
  Input,
  MantineColorsTuple,
  rem,
} from "@mantine/core";

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

const tmRed: MantineColorsTuple = [
  "#fff5f5",
  "#ffe3e3",
  "#ffc9c9",
  "#ffa8a8",
  "#ff8787",
  "#ff6b6b",
  "#fa5252",
  "#f03e3e",
  "#e03131",
  "#c92a2a",
];
const tmGray: MantineColorsTuple = [
  "#f8f9fa",
  "#f1f3f5",
  "#e9ecef",
  "#dee2e6",
  "#ced4da",
  "#adb5bd",
  "#868e96",
  "#495057",
  "#343a40",
  "#212529",
];
const tmDark: MantineColorsTuple = [
  "#C1C2C5",
  "#A6A7AB",
  "#909296",
  "#5c5f66",
  "#373A40",
  "#2C2E33",
  "#25262b",
  "#1A1B1E",
  "#141517",
  "#101113",
];

export const theme = createTheme({
  primaryColor: "tmBlue",
  colors: {
    tmBlue: tmBlue,
    tmGreen: tmGreen,
    tmRed: tmRed,
    tmGray: tmGray,
    tmDark: tmDark,
  },
  fontFamily: "inherit",
  components: {
    Button: Button.extend({
      vars: (theme, props) => {
        if (props.size === "sm") {
          return {
            root: {
              "--button-height": rem(32),
              "--button-padding-x": rem(16),
            },
          };
        }

        if (props.size === "md") {
          return {
            root: {
              "--button-height": rem(40),
              "--button-padding-x": rem(20),
            },
          };
        }

        if (props.size === "lg") {
          return {
            root: {
              "--button-height": rem(48),
              "--button-padding-x": rem(24),
            },
          };
        }

        return {
          root: {
            "--button-height": rem(32),
            "--button-padding-x": rem(16),
          },
        };
      },
    }),
    Input: Input.extend({
      vars: (theme, props) => {
        if (props.size === "sm") {
          return {
            wrapper: {
              "--input-height": rem(32),
            },
          };
        }

        if (props.size === "md") {
          return {
            wrapper: {
              "--input-height": rem(40),
            },
          };
        }

        return {
          wrapper: {
            "--input-height": rem(32),
          },
        };
      },
    }),
  },
});
