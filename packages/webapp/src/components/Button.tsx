import { rgba } from "polished";
import { styled } from "../utils/theme";

export const Button = styled.button`
  border: none;
  color: ${props => props.theme.colors.light};
  background: ${props => props.theme.colors.primary};
  box-shadow: ${props =>
    `0 4px 20px 0 ${rgba(props.theme.colors.primary, 0.4)}`};
  font-weight: 500;
  line-height: 1.44;
  font-size: 18px;
  padding: ${12 / 18}em ${30 / 18}em;
  border-radius: 2em;
  letter-spacing: 0.6px;

  &:disabled {
    color: ${props => rgba(props.theme.colors.light, 0.2)};
    background: ${props => rgba(props.theme.colors.light, 0.1)};
    box-shadow: none;
  }
`;
