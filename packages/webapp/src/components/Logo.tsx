import { ReactComponent as LogoSvg } from "../assets/images/logo.svg";
import { styled } from "../utils/theme";

export const Logo = styled(LogoSvg)`
  fill: ${props => props.theme.colors.light};
`;
