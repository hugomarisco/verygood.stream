import { desktop } from "../utils/media";
import { styled } from "../utils/theme";

interface IH5 {
  translucent?: boolean;
  dark?: boolean;
}

export const H5 = styled.h5<IH5>`
  color: ${props =>
    props.dark ? props.theme.colors.black : props.theme.colors.white};
  font-family: ${props => props.theme.fonts.sansSerif};
  font-size: 16px;
  line-height: 1.33;
  letter-spacing: normal;
  opacity: ${props => (props.translucent ? 0.4 : 1)};
  font-weight: normal;
  margin: 0;

  ${desktop`
    font-size: 24px;
    line-height: 1.88;
    letter-spacing: 0.4px;
  `}
`;
