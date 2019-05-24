import { styled } from "./Theme";

const Button = styled.button`
  border: none;
`;

export const PrimaryButton = styled(Button)`
  color: ${props => props.theme.colors.white};
  background: ${props => props.theme.colors.bloodyOrange};
  box-shadow: ${props => props.theme.shadows.bloodyOrange40};
  font-weight: ${props => props.theme.fontWeights.medium};
  line-height: 1.44;
  font-size: ${props => props.theme.fontSizes.medium};
  padding: ${12 / 18}em ${30 / 18}em;
  border-radius: 2em;
`;
