import {
  ChunkSpec,
  PPSPPClient,
  SwarmMetadata
} from "@bitstreamy/ppspp-client";
import React, { Component } from "react";
import { Logger } from "../utils/Logger";
import { IMP4Info, parseMp4Chunk } from "../utils/parseMp4Chunk";

interface IPlayerProps {
  swarmMetadata: SwarmMetadata;
  trackerUrl: string;
  liveDiscardWindow: number;
}

interface ISwarmState {
  mediaInfo?: IMP4Info;
}

export class Player extends Component<IPlayerProps, ISwarmState> {
  private mediaSource: MediaSource;
  private bufferedSegments: Buffer[];
  private sourceBuffer?: SourceBuffer;

  constructor(props: IPlayerProps) {
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

    return <video src={URL.createObjectURL(this.mediaSource)} controls />;
  }

  private get mimeCodec(): string | undefined {
    const codecs =
      this.state.mediaInfo &&
      this.state.mediaInfo.tracks.map(track => track.codec).join(", ");

    return codecs && `video/mp4; codecs="${codecs}"`;
  }

  private initializeClient() {
    const { swarmMetadata, trackerUrl, liveDiscardWindow } = this.props;

    if (!swarmMetadata.contentIntegrityProtectionMethod) {
      throw new Error("ContentIntegrityProtectionMethod is not defined");
    }

    const client = new PPSPPClient(
      swarmMetadata,
      { liveDiscardWindow },
      `${trackerUrl}/${encodeURIComponent(
        swarmMetadata.swarmId.toString("base64")
      )}`
    );

    client.on("peer", () => {
      client.requestChunks(new ChunkSpec([0xffffffff, 0xffffffff]));
    });

    client.on("chunk", async (chunkSpec: ChunkSpec, data) => {
      if (!(chunkSpec.spec instanceof Array)) {
        return;
      }

      const [from, to] = chunkSpec.spec;

      if (from === 0xffffffff && to === 0xffffffff) {
        const mediaInfo = await parseMp4Chunk(data);

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
