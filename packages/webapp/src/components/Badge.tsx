import { rgba } from "polished";
import { styled } from "../utils/theme";

export const Badge = styled.div`
  padding: 0 10px;
  background: ${props => rgba(props.theme.colors.dark, 0.1)};
`;
