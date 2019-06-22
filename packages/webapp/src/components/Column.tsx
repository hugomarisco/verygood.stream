import { styled } from "../utils/theme";

interface IColumn {
  span?: number[];
  offset?: number[];
}

const columnCss = (span: number) => `
  width: calc(${span * (100 / 12)}% - 2px);
  margin: 0 1px;

  &:first-child {
    margin-left: 0;
    width: calc(${span * (100 / 12)}% - 1px);
  }

  &:last-child {
    margin-right: 0;
    width: calc(${span * (100 / 12)}% - 1px);
  }
`;

export const Column = styled.div<IColumn>`
  ${props =>
    (props.span || [1])
      .map((span, i) => {
        switch (i) {
          case 0:
            return columnCss(span);
          case 1:
            return `
                @media (min-width: ${props.theme.breakpoints.tablet}) {
                  ${columnCss(span)}
                }
              `;
          case 2:
            return `
                @media (min-width: ${props.theme.breakpoints.desktop}) {
                  ${columnCss(span)}
                }
              `;
        }
      })
      .join("\n")}
`;
