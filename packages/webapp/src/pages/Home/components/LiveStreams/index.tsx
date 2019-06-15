import React from "react";
import { H5 } from "../../../../components/H5";
import { EyeIcon, LiveIcon } from "../../../../components/Icon";
import {
  LiveStreamsTitle,
  StreamLink,
  StreamPeers,
  StreamTitle
} from "./styles";

interface ILiveStreamInfo {
  id: string;
  title: string;
  peers: number;
}

interface ILiveStreamsProps {
  streams: ILiveStreamInfo[];
}

export const LiveStreams = (props: ILiveStreamsProps) => (
  <div>
    <LiveStreamsTitle dark translucent>
      Now live
    </LiveStreamsTitle>

    {props.streams.map(stream => (
      <StreamLink key={stream.id} to={`/s/${stream.id}`}>
        <StreamTitle>
          <LiveIcon color="primary" />

          <H5 dark>{stream.title}</H5>
        </StreamTitle>

        <StreamPeers>
          <EyeIcon color="dark" translucent />

          <H5 dark>{stream.peers}</H5>
        </StreamPeers>
      </StreamLink>
    ))}
  </div>
);
