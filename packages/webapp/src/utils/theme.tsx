import { rgba } from "polished";
import baseStyled, {
  css as baseCss,
  ThemedCssFunction,
  ThemedStyledInterface
} from "styled-components";

const colors = {
  black: "#000000",
  bloodyOrange: "#ff2727",
  white: "#ffffff"
};

export const theme = {
  colors,
  fonts: {
    sansSerif: "Roboto, sans-serif"
  },
  gridGutter: "2px",
  gridRows: 12,
  layoutTokens: {
    l: "64px",
    m: "48px",
    s: "32px",
    xl: "96px",
    xs: "24px",
    xxl: "160px",
    xxs: "16px"
  },
  spaceTokens: {
    l: "24px",
    m: "16px",
    s: "12px",
    xl: "32px",
    xs: "8px",
    xxl: "40px",
    xxs: "4px",
    xxxl: "48px",
    xxxs: "2px"
  }
};

export type Theme = typeof theme;

export const styled = baseStyled as ThemedStyledInterface<Theme>;
export const css = baseCss as ThemedCssFunction<Theme>;
