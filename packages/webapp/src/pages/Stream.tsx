import { ChunkAddressingMethod, SwarmMetadata } from "@bitstreamy/ppspp-client";
import { parse as parseQueryString } from "query-string";
import React, { Component } from "react";
import { RouteComponentProps } from "react-router";
import { Player } from "../components/Player";
import { Logger } from "../utils/Logger";

interface IMatchParams {
  swarmId: string;
}

interface IStreamProps extends RouteComponentProps<IMatchParams> {}

interface IMP4Track {
  codec: string;
}

interface IMP4Info {
  tracks: IMP4Track[];
}

interface IStreamState {
  mediaInfo?: IMP4Info;
}

export class Stream extends Component<IStreamProps, IStreamState> {
  public render() {
    const {
      swarmId,
      liveSignatureAlgorithm,
      contentIntegrityProtectionMethod
    } = parseQueryString(this.props.location.search);

    const swarmMetadata = new SwarmMetadata(
      Buffer.from(decodeURIComponent(swarmId as string), "base64"),
      0xffffffff,
      ChunkAddressingMethod["32ChunkRanges"],
      parseInt(contentIntegrityProtectionMethod as string, 10),
      liveSignatureAlgorithm !== undefined
        ? parseInt(liveSignatureAlgorithm as string, 10)
        : liveSignatureAlgorithm
    );

    // const trackerUrl = "wss://tracker.bitstreamy.com";
    const trackerUrl = "ws://localhost:8080";
    const liveDiscardWindow = 100;

    return (
      <div>
        <Player
          swarmMetadata={swarmMetadata}
          trackerUrl={trackerUrl}
          liveDiscardWindow={liveDiscardWindow}
        />
      </div>
    );
  }
}
