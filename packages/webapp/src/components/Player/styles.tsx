import { styled } from "../../utils/theme";
import { TopNav } from "../TopNav";

export const PlayerWrapper = styled.div`
  position: relative;
`;

export const Video = styled.video`
  width: 100%;
`;

export const FixedNav = styled(TopNav)`
  background-image: linear-gradient(
    to top,
    rgba(0, 0, 0, 0),
    rgba(0, 0, 0, 0.8)
  );
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1;
`;
