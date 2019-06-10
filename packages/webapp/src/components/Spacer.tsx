import { styled } from "../utils/theme";

interface ISpacer {
  horizontal?: boolean;
  layout?: boolean;
  size: string;
}

export const Spacer = styled.div<ISpacer>`
  width: ${props =>
    props.horizontal
      ? props.theme[props.layout ? "layoutTokens" : "spaceTokens"][props.size]
      : "100%"};
  height: ${props =>
    props.horizontal
      ? "1px"
      : props.theme[props.layout ? "layoutTokens" : "spaceTokens"][props.size]};
`;
