import { styled } from "../utils/theme";

interface IColumn {
  span?: number;
}

export const Column = styled.div<IColumn>`
  width: calc(${({ span = 1 }) => (span || 1) * (100 / 12)}% - 2px);
  margin: 0 1px;

  &:first-child {
    margin-left: 0;
    width: calc(${({ span = 1 }) => (span || 1) * (100 / 12)}% - 1px);
  }

  &:last-child {
    margin-right: 0;
    width: calc(${({ span = 1 }) => (span || 1) * (100 / 12)}% - 1px);
  }
`;
