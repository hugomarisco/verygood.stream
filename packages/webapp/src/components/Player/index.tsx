import {
  ChunkSpec,
  PPSPPClient,
  SwarmMetadata
} from "@bitstreamy/ppspp-client";
import React, { VideoHTMLAttributes } from "react";
import { Logger } from "../../utils/Logger";
import { IMP4Info, parseMp4Chunk } from "../../utils/parseMp4Chunk";
import { PlayerControls } from "./components/PlayerControls";
import { PlayerWrapper, Video } from "./styles";

interface IPlayerProps extends VideoHTMLAttributes<HTMLVideoElement> {
  swarmMetadata: SwarmMetadata;
  trackerUrl: string;
  liveDiscardWindow: number;
}

interface IPlayerState {
  controlsVisible: boolean;
  mediaInfo?: IMP4Info;
}

export class Player extends React.Component<IPlayerProps, IPlayerState> {
  private playerRef = React.createRef<HTMLVideoElement>();
  private hideControlsTimeout?: number;
  private mediaSource: MediaSource;
  private bufferedSegments: Buffer[];
  private sourceBuffer?: SourceBuffer;

  constructor(props: IPlayerProps) {
    super(props);

    this.state = {
      controlsVisible: true
    };

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
    return (
      <PlayerWrapper
        onMouseEnter={this.showControls}
        onMouseLeave={this.hideControls}
        onMouseMove={this.showControls}
      >
        <Video
          ref={this.playerRef}
          src="http://clips.vorwaerts-gmbh.de/big_buck_bunny.mp4"
          // src={URL.createObjectURL(this.mediaSource)}
          {...this.props}
        />

        {this.state.controlsVisible && (
          <PlayerControls
            onPlayPause={this.handlePlayPause}
            onFullScreen={this.handleFullScreen}
            isPlaying={this.isPlaying}
          />
        )}
      </PlayerWrapper>
    );
  }

  private isPlaying = () =>
    this.playerRef.current &&
    this.playerRef.current.currentTime > 0 &&
    !this.playerRef.current.paused &&
    !this.playerRef.current.ended &&
    this.playerRef.current.readyState > 2;

  private handlePlayPause = () => {
    if (this.playerRef.current) {
      if (this.playerRef.current.paused) {
        this.playerRef.current.play();
      } else {
        this.playerRef.current.pause();
      }
    }
  };

  private handleFullScreen = () => {
    if (this.playerRef.current) {
      this.playerRef.current.requestFullscreen();
    }
  };

  private showControls = () => {
    if (this.hideControlsTimeout) {
      clearTimeout(this.hideControlsTimeout);
    }

    this.hideControlsTimeout = setTimeout(this.hideControls, 3000);

    if (!this.state.controlsVisible) {
      this.setState({ controlsVisible: true });
    }
  };

  private hideControls = () => {
    this.setState({ controlsVisible: false });
  };

  private get mimeCodec(): string | undefined {
    const codecs =
      this.state.mediaInfo &&
      this.state.mediaInfo.tracks.map(track => track.codec).join(", ");

    return codecs && `video/mp4; codecs="${codecs}"`;
  }

  private initializeClient() {
    const { swarmMetadata, trackerUrl, liveDiscardWindow } = this.props;

    if (swarmMetadata.contentIntegrityProtectionMethod === undefined) {
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
