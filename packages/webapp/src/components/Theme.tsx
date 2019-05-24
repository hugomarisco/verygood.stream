import { rgba } from "polished";
import baseStyled, { ThemedStyledInterface } from "styled-components";

const colors = {
  black: "#000000",
  bloodyOrange: "#ff2727",
  fadeBlack40: rgba("#000000", 0.4),
  fadeWhite40: rgba("#ffffff", 0.4),
  white: "#ffffff"
};

export const theme = {
  colors,
  fontSizes: {
    big: "24px",
    bigger: "36px",
    huge: "66px",
    medium: "18px",
    normal: "16px"
  },
  fontWeights: {
    medium: 500,
    normal: 400
  },
  fonts: {
    sansSerif: "Roboto, sans-serif"
  },
  lineHeights: {
    base: 1,
    normal: 1.5,
    small: 1.3
  },
  shadows: {
    bloodyOrange40: `0 4px 20px 0 ${rgba(colors.bloodyOrange, 0.4)}`
  }
};

export type Theme = typeof theme;

export const styled = baseStyled as ThemedStyledInterface<Theme>;
