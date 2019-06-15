import { styled } from "../utils/theme";

interface IHr {
  translucent?: boolean;
  dark?: boolean;
}

export const Hr = styled.hr<IHr>`
  border-top: 1px solid
    ${props =>
      props.dark ? props.theme.colors.dark : props.theme.colors.light};
  opacity: ${props => (props.translucent ? 0.4 : 1)};
  margin: 0;
`;
