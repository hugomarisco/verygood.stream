import { color } from "styled-system";
import { styled } from "./Theme";

export const RegularText = styled.p`
  line-height: ${props => props.theme.lineHeights.small};
  font-size: ${props => props.theme.fontSizes.normal};
  color: ${props => props.theme.colors.white};

  ${color}
`;

export const BigText = styled.p`
  line-height: ${props => props.theme.lineHeights.small};
  font-size: ${props => props.theme.fontSizes.big};
  color: ${props => props.theme.colors.white};

  ${color}
`;

export const BiggerText = styled.p`
  line-height: ${props => props.theme.lineHeights.small};
  font-size: ${props => props.theme.fontSizes.bigger};
  color: ${props => props.theme.colors.white};

  ${color}
`;

export const BoldHeader = styled.h1`
  line-height: ${props => props.theme.lineHeights.base};
  font-size: ${props => props.theme.fontSizes.huge};
  color: ${props => props.theme.colors.white};
  text-transform: uppercase;

  ${color}
`;
