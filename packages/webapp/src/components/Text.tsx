import { color } from "styled-system";
import { styled } from "./Theme";

export const RegularText = styled.p`
  line-height: ${props => props.theme.lineHeights.small};
  font-size: ${props => props.theme.fontSizes.normal};

  ${color}
`;

export const BigText = styled.p`
  line-height: ${props => props.theme.lineHeights.small};
  font-size: ${props => props.theme.fontSizes.big};

  ${color}
`;

export const BiggerText = styled.p`
  line-height: ${props => props.theme.lineHeights.small};
  font-size: ${props => props.theme.fontSizes.bigger};

  ${color}
`;

export const BoldHeader = styled.h1`
  line-height: ${props => props.theme.lineHeights.base};
  font-size: ${props => props.theme.fontSizes.huge};

  ${color}
`;
