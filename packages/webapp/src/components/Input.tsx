import { rgba } from "polished";
import { desktop } from "../utils/media";
import { styled } from "../utils/theme";

export const Input = styled.input<{}>`
  padding: 12px 0 20px 0;
  line-height: 1.33;
  color: ${props => props.theme.colors.white};
  font-size: 16px;
  font-family: ${props => props.theme.fonts.sansSerif};
  background: transparent;
  border: none;
  border-bottom: 1px solid ${props => rgba(props.theme.colors.white, 0.4)};
  display: block;
  width: 100%;

  ${desktop`
    font-size: 24px;
  `}

  &:focus {
    outline: none;
    border-bottom: 1px solid ${props => props.theme.colors.bloodyOrange};
  }

  &::placeholder {
    color: ${props => rgba(props.theme.colors.white, 0.4)};
  }
`;
