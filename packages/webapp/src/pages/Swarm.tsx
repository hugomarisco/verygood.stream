import {
  ChunkAddressingMethod,
  ContentIntegrityProtectionMethod,
  PPSPPClient,
  SwarmMetadata
} from "@bitstreamy/ppspp-client";
import MP4Box from "mp4box";
import React, { Component } from "react";
import { RouteComponentProps } from "react-router";
import { Logger } from "../Logger";

interface IMatchParams {
  swarmId: string;
}

interface ISwarmProps extends RouteComponentProps<IMatchParams> {}

interface IMP4Track {
  codec: string;
}

interface IMP4Info {
  tracks: IMP4Track[];
}

interface ISwarmState {
  mediaInfo?: IMP4Info;
}

export class Swarm extends Component<ISwarmProps, ISwarmState> {
  private mediaSource: MediaSource;
  private bufferedSegments: Buffer[];
  private sourceBuffer?: SourceBuffer;

  constructor(props: ISwarmProps) {
    super(props);

    this.state = {};

    this.bufferedSegments = [];

    this.mediaSource = new MediaSource();

    this.mediaSource.addEventListener("sourceended", () => {
      Logger.debug("Media Source ended", {
        readyState: this.mediaSource.readyState
      });
    });

    this.mediaSource.addEventListener("sourceclose", () => {
      Logger.debug("Media Source closed", {
        readyState: this.mediaSource.readyState
      });
    });

    this.mediaSource.addEventListener("error", () => {
      Logger.error("Media Source ended", {
        readyState: this.mediaSource.readyState
      });
    });
  }

  public componentDidMount() {
    this.initializeClient();
  }

  public render() {
    if (this.mimeCodec && !MediaSource.isTypeSupported(this.mimeCodec)) {
      return <div>Your browser doesn't support this media</div>;
    }

    return (
      <div>
        <video src={URL.createObjectURL(this.mediaSource)} controls />
      </div>
    );
  }

  private get mimeCodec(): string | undefined {
    const codecs =
      this.state.mediaInfo &&
      this.state.mediaInfo.tracks.map(track => track.codec).join(", ");

    return codecs && `video/mp4; codecs="${codecs}"`;
  }

  private initializeClient() {
    const swarmMetadata = new SwarmMetadata(
      Buffer.from(this.props.match.params.swarmId, "utf8"),
      0xffffffff,
      ChunkAddressingMethod["32ChunkRanges"],
      ContentIntegrityProtectionMethod.NONE
    );

    const client = new PPSPPClient(
      swarmMetadata,
      { liveDiscardWindow: 100 },
      "wss://tracker.bitstreamy.com"
    );

    client.on("peer", () => {
      client.requestChunk(0xffffffff);
    });

    client.on("chunk", (chunkIndex, data) => {
      if (chunkIndex === 0xffffffff) {
        const buffer = data.buffer.slice(
          data.byteOffset,
          data.byteLength + data.byteOffset
        );

        buffer.fileStart = 0;

        const mp4boxfile = MP4Box.createFile();

        mp4boxfile.onError = (error: Error) =>
          Logger.error("Error parsing media info", { error });

        mp4boxfile.onReady = (mediaInfo: IMP4Info) => {
          Logger.debug("Media Info", { mediaInfo });

          this.setState({ mediaInfo }, () => {
            this.mediaSource.addEventListener("sourceopen", () => {
              Logger.debug("Media Source Open", {
                readyState: this.mediaSource.readyState
              });

              if (this.mimeCodec) {
                this.sourceBuffer = this.mediaSource.addSourceBuffer(
                  this.mimeCodec
                );

                this.sourceBuffer.mode = "sequence";
              } else {
                Logger.error("Couldn't parse MIME from media info");
              }
            });
          });
        };

        mp4boxfile.appendBuffer(buffer);

        mp4boxfile.flush();
      }

      if (data.length) {
        this.bufferedSegments.push(data);

        if (
          this.state.mediaInfo &&
          this.sourceBuffer &&
          !this.sourceBuffer.updating &&
          this.mediaSource.readyState === "open"
        ) {
          this.sourceBuffer.appendBuffer(Buffer.concat(this.bufferedSegments));

          this.bufferedSegments = [];
        }
      }
    });

    client.on("error", error => Logger.error("Client error", { error }));
  }
}
