import React, { Component } from "react";
import { H5 } from "../../../../components/H5";
import { ArrowRightIcon, EyeIcon, LiveIcon } from "../../../../components/Icon";
import { ViewportContext } from "../../../../components/ViewportProvider";
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

export class LiveStreams extends Component<ILiveStreamsProps> {
  public static contextType = ViewportContext;
  public context!: React.ContextType<typeof ViewportContext>;

  public render() {
    const { streams } = this.props;
    const { tablet, desktop } = this.context;

    return (
      <div>
        <LiveStreamsTitle dark translucent>
          Now live
        </LiveStreamsTitle>

        {streams.map(stream => (
          <StreamLink key={stream.id} to={`/s/${stream.id}`}>
            <StreamTitle>
              <LiveIcon color="primary" />

              <H5 dark>{stream.title}</H5>
            </StreamTitle>

            <StreamPeers>
              <EyeIcon color="dark" translucent />

              <H5 dark>{stream.peers}</H5>

              {(tablet || desktop) && (
                <ArrowRightIcon color="dark" translucent />
              )}
            </StreamPeers>
          </StreamLink>
        ))}
      </div>
    );
  }
}
