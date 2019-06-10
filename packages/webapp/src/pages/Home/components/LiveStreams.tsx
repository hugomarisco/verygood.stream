import React from "react";
import { Flex } from "../../../components/Flex";
import { H5 } from "../../../components/H5";
import { Hr } from "../../../components/Hr";
import { EyeIcon, LiveIcon } from "../../../components/Icon";
import { RawLink } from "../../../components/Link";
import { P } from "../../../components/P";
import { Spacer } from "../../../components/Spacer";

interface ILiveStreamInfo {
  id: string;
  name: string;
  peers: number;
}

interface ILiveStreamsProps {
  streams?: ILiveStreamInfo[];
}

export const LiveStreams = (props: ILiveStreamsProps) => (
  <div>
    <P dark translucent>
      Now live
    </P>

    <Spacer layout size="xxs" />

    <Hr dark translucent />

    <RawLink to="/stream/123/edit">
      <Flex
        css={`
          padding: 25px 0;
        `}
      >
        <Flex>
          <LiveIcon />

          <Spacer horizontal size="l" />

          <H5 dark>Juventus - Roma</H5>
        </Flex>
        <Flex>
          <EyeIcon />

          <Spacer horizontal size="m" />

          <H5 dark>3,4 K</H5>

          <Spacer horizontal size="xxl" />
        </Flex>
      </Flex>
    </RawLink>
  </div>
);
