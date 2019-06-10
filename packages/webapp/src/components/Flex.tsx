import { styled } from "../utils/theme";

interface IFlex {
  justify?: string;
  align?: string;
}

export const Flex = styled.div<IFlex>`
  display: flex;
  justify-content: ${props => props.justify || "space-between"};
  align-items: ${props => props.align || "center"};
`;
