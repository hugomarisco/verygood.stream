import { Link as RouterLink } from "react-router-dom";
import { styled } from "../utils/theme";

export const RawLink = styled(RouterLink)`
  text-decoration: none;
  display: inline-block;
`;

export const Link = styled(RawLink)`
  padding-bottom: ${props => props.theme.spaceTokens.xxs};
  border-bottom: 1px solid ${props => props.theme.colors.light};
`;

export const ExternalRawLink = styled.a`
  text-decoration: none;
  display: inline-block;
`;

export const ExternalLink = styled(ExternalRawLink)`
  padding-bottom: ${props => props.theme.spaceTokens.xxs};
  border-bottom: 1px solid ${props => props.theme.colors.light};
`;
