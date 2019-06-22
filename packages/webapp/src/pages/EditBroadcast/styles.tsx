import { rgba } from "polished";
import { H4 } from "../../components/H4";
import { Label } from "../../components/Label";
import { styled } from "../../utils/theme";

export const PageTitle = styled(H4)`
  margin-bottom: 60px;
`;

interface IHighlightableIcon {
  checked: boolean;
}

export const HighlightableIcon = styled.span<IHighlightableIcon>`
  background: ${props =>
    props.checked
      ? props.theme.colors.primary
      : rgba(props.theme.colors.light, 0.1)};
  padding: 40px;
  border-radius: 70px;
  display: inline-block;
  margin-bottom: 20px;
`;

export const CategoriesContainer = styled.div`
  display: flex;
  overflow-x: auto;
  padding-bottom: 10px;
  padding-right: 15px;
`;

export const CategoryLabel = styled(Label)`
  text-align: center;

  & + & {
    margin-left: 15px;
  }
`;

interface IPosterLabel {
  posterUrl?: string;
}

export const PosterLabel = styled(Label)<IPosterLabel>`
  background: ${props =>
    props.posterUrl
      ? `url(${props.posterUrl})`
      : rgba(props.theme.colors.light, 0.1)};
  background-size: cover;
  background-position: center center;
  padding: 20px;
  width: 100%;
  height: 220px;
`;
