import { color } from "styled-system";
import EyeIconPath from "../assets/icons/eye.svg";
import LiveIconPath from "../assets/icons/live.svg";
import { styled } from "./Theme";

const Icon = styled.img`
  ${color};
`;

export const EyeIcon = styled(Icon).attrs({ src: EyeIconPath })``;
export const LiveIcon = styled(Icon).attrs({ src: LiveIconPath })``;
