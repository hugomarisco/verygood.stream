import { CSSObject, SimpleInterpolation } from "styled-components";
import { css } from "./theme";

export const tablet = (
  first: CSSObject | TemplateStringsArray,
  ...interpolations: SimpleInterpolation[]
) => css`
  @media (min-width: ${props => props.theme.breakpoints.tablet}) {
    ${css(first, ...interpolations)}
  }
`;

export const desktop = (
  first: CSSObject | TemplateStringsArray,
  ...interpolations: SimpleInterpolation[]
) => css`
  @media (min-width: ${props => props.theme.breakpoints.desktop}) {
    ${css(first, ...interpolations)}
  }
`;
