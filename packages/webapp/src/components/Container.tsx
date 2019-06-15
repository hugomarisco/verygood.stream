import { desktop } from "../utils/media";
import { styled } from "../utils/theme";

export const Container = styled.div`
  width: 100%;

  ${desktop`
    width: 1320px;
    margin: 0 auto;
  `}
`;
