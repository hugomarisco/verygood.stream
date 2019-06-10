import { desktop } from "../utils/media";
import { styled } from "../utils/theme";

interface IH1 {
  translucent?: boolean;
  dark?: boolean;
}

export const H1 = styled.h1<IH1>`
  color: ${props =>
    props.dark ? props.theme.colors.black : props.theme.colors.white};
  font-family: ${props => props.theme.fonts.sansSerif};
  font-size: 34px;
  line-height: 1.18;

  letter-spacing: -1.5px;
  opacity: ${props => (props.translucent ? 0.4 : 1)};
  font-weight: normal;
  margin: 0;
  text-transform: uppercase;

  ${desktop`
    font-size: 90px;
    line-height: 1.11;
  `}
`;
