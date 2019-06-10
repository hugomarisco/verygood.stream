import { CSSObject, SimpleInterpolation } from "styled-components";
import { css } from "./theme";

export const tablet = (
  first: CSSObject | TemplateStringsArray,
  ...interpolations: SimpleInterpolation[]
) => css`
  @media (min-width: 768px) {
    ${css(first, ...interpolations)}
  }
`;

export const desktop = (
  first: CSSObject | TemplateStringsArray,
  ...interpolations: SimpleInterpolation[]
) => css`
  @media (min-width: 992px) {
    ${css(first, ...interpolations)}
  }
`;
