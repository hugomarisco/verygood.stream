import { desktop } from "../utils/media";
import { styled } from "../utils/theme";

export interface IP {
  translucent?: boolean;
  dark?: boolean;
}

export const P = styled.p<IP>`
  color: ${props =>
    props.dark ? props.theme.colors.dark : props.theme.colors.light};
  font-family: ${props => props.theme.fonts.sansSerif};
  font-size: 14px;
  line-height: 1.79;
  letter-spacing: 0.2px;
  opacity: ${props => (props.translucent ? 0.4 : 1)};
  font-weight: normal;
  margin: 0;

  ${desktop`
    font-size: 16px;
    line-height: 1.38;
    letter-spacing: 0.3px;
  `}
`;
