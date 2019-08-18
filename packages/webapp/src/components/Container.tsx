import { desktop, tablet } from "../utils/media";
import { styled } from "../utils/theme";

export const Container = styled.div`
  width: 100%;

  ${tablet`
    width: 100%;
    max-width: 648px;
    margin: 0 auto;
  `}

  ${desktop`
    width: 100%;
    max-width: 1320px;
    margin: 0 auto;
    padding: 0 60px;
  `}
`;
