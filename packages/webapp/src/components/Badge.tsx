import { rgba } from "polished";
import { styled } from "../utils/theme";

export interface IBadgeProps {
  dark?: boolean;
}

export const Badge = styled.div<IBadgeProps>`
  padding: 0 10px;
  background: ${props =>
    rgba(props.dark ? props.theme.colors.dark : props.theme.colors.light, 0.1)};
`;
