import { rgba } from "polished";
import { Box } from "../../components/Box";
import { Player } from "../../components/Player";
import { styled } from "../../utils/theme";

export const BroadcastInformationSection = styled(Box)`
  padding: 30px 0;
`;

export const VideoPlayer = styled(Player)`
  max-height: 100vh;
  margin: 0 auto;
`;

export const CategoryIconContainer = styled.div`
  background: ${props => props.theme.colors.dark};
  padding: 15px;
  border-radius: 30px;
`;

export const StreamTitle = styled.div`
  margin-left: 20px;
`;

export const StreamDetails = styled.div`
  border: 1px solid ${props => rgba(props.theme.colors.dark, 0.1)};
  padding: 20px 0;
  margin: 30px 0;
  border-left: none;
  border-right: none;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;
