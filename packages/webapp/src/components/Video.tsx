import React, { VideoHTMLAttributes } from "react";
import { css, styled } from "../utils/theme";
import { Button } from "./Button";
import { Flex } from "./Flex";
import { FullScreenIcon, PauseIcon, PlayIcon } from "./Icon";

const StyledVideo = styled.video`
  width: 100%;
`;

interface IVideoState {
  controlsVisible: boolean;
}

export class Video extends React.Component<
  VideoHTMLAttributes<HTMLVideoElement>,
  IVideoState
> {
  private playerRef = React.createRef<HTMLVideoElement>();
  private hideControlsTimeout?: number;

  constructor(props: VideoHTMLAttributes<HTMLVideoElement>) {
    super(props);

    this.state = {
      controlsVisible: true
    };
  }

  public render() {
    return (
      <div
        css={`
          position: relative;
        `}
        onMouseEnter={this.showControls}
        onMouseLeave={this.hideControls}
        onMouseMove={this.showControls}
      >
        <StyledVideo
          ref={this.playerRef}
          src="http://clips.vorwaerts-gmbh.de/big_buck_bunny.mp4"
          {...this.props}
        />

        {this.state.controlsVisible && (
          <Flex
            css={css`
              background-image: linear-gradient(
                to bottom,
                rgba(0, 0, 0, 0),
                rgba(0, 0, 0, 0.8)
              );
              height: 100px;
              position: absolute;
              bottom: 0;
              left: 0;
              right: 0;
            `}
          >
            <Button onClick={this.handlePlayPauseClick}>
              {this.isPlaying() ? <PauseIcon /> : <PlayIcon />}
            </Button>

            <Button onClick={this.handleFullScreenClick}>
              <FullScreenIcon />
            </Button>
          </Flex>
        )}
      </div>
    );
  }

  private isPlaying = () =>
    this.playerRef.current &&
    this.playerRef.current.currentTime > 0 &&
    !this.playerRef.current.paused &&
    !this.playerRef.current.ended &&
    this.playerRef.current.readyState > 2;

  private handlePlayPauseClick = (
    ev: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    if (this.playerRef.current) {
      if (this.playerRef.current.paused) {
        this.playerRef.current.play();
      } else {
        this.playerRef.current.pause();
      }
    }
  };

  private handleFullScreenClick = () => {
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
}
