import { base64UrlEscape, Logger, SwarmMetadata } from "@bitstreamy/commons";
import { ChunkSpec, PPSPPClient } from "@bitstreamy/ppspp-client";
import React, { VideoHTMLAttributes } from "react";
import { IMP4Info, parseMp4Chunk } from "../../utils/parseMp4Chunk";
import { ViewportContext } from "../ViewportProvider";
import { PlayerControls } from "./components/PlayerControls";
import { FixedNav, PlayerWrapper, Video } from "./styles";

interface IPlayerProps extends VideoHTMLAttributes<HTMLVideoElement> {
  swarmMetadata: SwarmMetadata;
  liveDiscardWindow: number;
}

interface IPlayerState {
  controlsVisible: boolean;
  mediaInfo?: IMP4Info;
  mediaSourceUrl: string;
  isPaused: boolean;
}

export class Player extends React.Component<IPlayerProps, IPlayerState> {
  public static contextType = ViewportContext;
  public context!: React.ContextType<typeof ViewportContext>;

  private playerRef = React.createRef<HTMLVideoElement>();
  private hideControlsTimeout?: number;
  private mediaSource: MediaSource;
  private bufferedSegments: Buffer[];
  private sourceBuffer?: SourceBuffer;

  constructor(props: IPlayerProps) {
    super(props);

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

    this.state = {
      controlsVisible: true,
      isPaused: true,
      mediaSourceUrl: "/test.mp4" //URL.createObjectURL(this.mediaSource)
    };
  }

  public componentDidMount() {
    this.initializeClient();
  }

  public render() {
    const { controlsVisible } = this.state;
    const { desktop } = this.context;

    return (
      <PlayerWrapper
        onMouseEnter={this.showControls}
        onMouseLeave={this.hideControls}
        onMouseMove={this.showControls}
      >
        {desktop && controlsVisible && <FixedNav scrollToBottomButton />}

        <Video
          ref={this.playerRef}
          src={this.state.mediaSourceUrl}
          controls={!desktop}
          {...this.props}
        />

        {desktop && controlsVisible && (
          <PlayerControls
            onPlayPause={this.handlePlayPause}
            onFullScreen={this.handleFullScreen}
            isPaused={this.state.isPaused}
          />
        )}
      </PlayerWrapper>
    );
  }

  private handlePlayPause = () => {
    if (this.playerRef.current) {
      if (this.playerRef.current.paused) {
        this.playerRef.current.play();
      } else {
        this.playerRef.current.pause();
      }
    }

    this.setState({
      isPaused: this.playerRef.current ? this.playerRef.current.paused : true
    });
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
    // this.setState({ controlsVisible: false });
  };

  private get mimeCodec(): string | undefined {
    const codecs =
      this.state.mediaInfo &&
      this.state.mediaInfo.tracks.map(track => track.codec).join(", ");

    return codecs && `video/mp4; codecs="${codecs}"`;
  }

  private initializeClient() {
    const { swarmMetadata, liveDiscardWindow } = this.props;

    if (swarmMetadata.contentIntegrityProtectionMethod === undefined) {
      throw new Error("ContentIntegrityProtectionMethod is not defined");
    }

    const client = new PPSPPClient(
      swarmMetadata,
      { liveDiscardWindow },
      `${process.env.REACT_APP_TRACKER_URL}/${base64UrlEscape(
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
          if (this.mimeCodec) {
            this.sourceBuffer = this.mediaSource.addSourceBuffer(
              this.mimeCodec
            );

            this.sourceBuffer.mode = "sequence";
          } else {
            Logger.error("Couldn't parse MIME from media info");
          }
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
