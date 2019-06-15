import { desktop } from "../utils/media";
import { styled } from "../utils/theme";

export interface IH4 {
  translucent?: boolean;
  dark?: boolean;
}

export const H4 = styled.h4<IH4>`
  color: ${props =>
    props.dark ? props.theme.colors.dark : props.theme.colors.light};
  font-family: ${props => props.theme.fonts.sansSerif};
  font-size: 22px;
  line-height: 1.17;
  letter-spacing: 0.5px;
  opacity: ${props => (props.translucent ? 0.4 : 1)};
  font-weight: normal;
  margin: 0;

  ${desktop`
    font-size: 36px;
    line-height: 1.14;
  `}
`;
