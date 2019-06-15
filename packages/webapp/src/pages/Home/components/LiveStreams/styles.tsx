import { rgba } from "polished";
import { H5 } from "../../../../components/H5";
import { RawLink } from "../../../../components/Link";
import { P } from "../../../../components/P";
import { styled } from "../../../../utils/theme";

export const LiveStreamsTitle = styled(P)`
  margin-bottom: 15px;
`;

export const StreamLink = styled(RawLink)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-top: 1px solid ${props => rgba(props.theme.colors.dark, 0.4)};
  padding: 20px 0 35px 0;
`;

const StreamSection = styled.div`
  display: flex;
  align-items: center;
`;

export const StreamTitle = styled(StreamSection)`
  ${H5} {
    margin-left: 20px;
  }
`;

export const StreamPeers = styled(StreamSection)`
  margin-right: 40px;

  ${H5} {
    margin-left: 10px;
  }
`;
