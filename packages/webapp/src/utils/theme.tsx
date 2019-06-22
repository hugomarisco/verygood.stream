import baseStyled, {
  css as baseCss,
  ThemedCssFunction,
  ThemedStyledInterface
} from "styled-components";

const colors = {
  dark: "#000000",
  light: "#ffffff",
  primary: "#ff2727"
};

export const theme = {
  breakpoints: {
    desktop: "992px",
    tablet: "768px"
  },
  colors,
  fonts: {
    sansSerif: "Roboto, sans-serif"
  },
  gridGutter: "2px",
  gridRows: 12
};

export type Theme = typeof theme;

export const styled = baseStyled as ThemedStyledInterface<Theme>;
export const css = baseCss as ThemedCssFunction<Theme>;
