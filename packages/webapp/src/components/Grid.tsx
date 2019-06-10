import { desktop } from "../utils/media";
import { styled } from "../utils/theme";

export const Grid = styled.div`
  max-width: 100%;
  display: grid;
  grid-row-gap: ${props => props.theme.gridGutter};
  grid-template-columns: repeat(${props => props.theme.gridRows}, 1fr);
  grid-auto-flow: column;

  ${desktop`
    max-width: 1320px;
  `}
`;

interface IGridCell {
  column: string;
  row: string;
}

export const GridCell = styled.div<IGridCell>`
  grid-row: ${props => props.row};
  grid-column: ${props => props.column};
`;
