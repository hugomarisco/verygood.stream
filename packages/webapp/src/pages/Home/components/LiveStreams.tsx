import React from "react";
import { Box, Flex, Image } from "rebass";
import { EyeIcon, LiveIcon } from "../../../components/Icon";
import { BigText } from "../../../components/Text";

interface ILiveStreamInfo {
  id: string;
  name: string;
  peers: number;
}

interface ILiveStreamsProps {
  streams?: ILiveStreamInfo[];
}

export const LiveStreams = (props: ILiveStreamsProps) => (
  <Flex justifyContent="space-between">
    <Box>
      <LiveIcon />
    </Box>
    <Box>
      <BigText color="black">Juventus - Roma</BigText>
    </Box>
    <Box>
      {" "}
      <BigText color="black">
        <EyeIcon color="fadeBlack40" />
        3,4 K
      </BigText>
    </Box>
    <Box />
  </Flex>
);
