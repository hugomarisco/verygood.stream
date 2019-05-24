import { createGlobalStyle } from "styled-components";
import { Theme } from "./Theme";

interface IGlobalStylesProps {
  theme: Theme;
}

export const GlobalStyles = createGlobalStyle<IGlobalStylesProps>`
  @import url('https://fonts.googleapis.com/css?family=Roboto:400,500&display=swap');

  body, button {
    font-family: ${props => props.theme.fonts.sansSerif};
  }

  body {
    background: ${props => props.theme.colors.black};
  }
`;
