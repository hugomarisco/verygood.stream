import { rgba } from "polished";
import { styled } from "../utils/theme";

export const Fieldset = styled.fieldset`
  border: none;
  color: ${props => rgba(props.theme.colors.white, 0.6)};
  margin-bottom: 60px;
  min-width: 0;
  padding: 0;
`;
