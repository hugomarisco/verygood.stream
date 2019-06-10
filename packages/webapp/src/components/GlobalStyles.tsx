import { normalize } from "polished";
import { createGlobalStyle } from "styled-components";
import { Theme } from "../utils/theme";

interface IGlobalStylesProps {
  theme: Theme;
}

export const GlobalStyles = createGlobalStyle<IGlobalStylesProps>`
  @import url('https://fonts.googleapis.com/css?family=Roboto:400,500&display=swap');

  ${normalize()}

  *, *:before, *:after {
    box-sizing: inherit;
  }

  html {
    box-sizing: border-box;
  }

  body {
    color: ${props => props.theme.colors.white};
    background: ${props => props.theme.colors.black};
  }

  body, button {
    font-family: ${props => props.theme.fonts.sansSerif};
  }  
`;
