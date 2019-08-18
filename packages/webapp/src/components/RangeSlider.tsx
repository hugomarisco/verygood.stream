import { css, styled } from "../utils/theme";

const trackStyle = css`
  height: 4px;
  background: ${props => props.theme.colors.light};
  border: none;
`;

const thumbStyle = css`
  -webkit-appearance: none;
  border: none;
  height: 16px;
  width: 16px;
  border-radius: 50%;
  background: ${props => props.theme.colors.light};
  margin-top: -6px;
  cursor: pointer;
`;

export const RangeSlider = styled.input.attrs({ type: "range" })`
  -webkit-appearance: none;

  &::-moz-range-track {
    ${trackStyle}
  }
  &::-ms-track {
    ${trackStyle}
  }
  &::-webkit-slider-runnable-track {
    ${trackStyle}
  }

  &::-moz-range-thumb {
    ${thumbStyle}
  }
  &::-ms-thumb {
    ${thumbStyle}
  }
  &::-webkit-slider-thumb {
    ${thumbStyle}
  }
`;
