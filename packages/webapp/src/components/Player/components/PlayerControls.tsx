import React from "react";
import { styled } from "../../../utils/theme";
import { Button, UnstyledButton } from "../../Button";
import {
  EyeIcon,
  FullScreenIcon,
  PauseIcon,
  PlayIcon,
  UploadDownloadIcon,
  VolumeIcon
} from "../../Icon";
import { P } from "../../P";
import { RangeSlider } from "../../RangeSlider";

const Wrapper = styled.div`
  background-image: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0),
    rgba(0, 0, 0, 0.8)
  );
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 30px 60px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Controls = styled.div`
  display: flex;
  align-items: center;
`;

const PlayPauseButton = styled(Button)`
  border-radius: 100%;
  padding: 8px;
  line-height: 1;

  ${PlayIcon}, ${PauseIcon} {
    fill: ${props => props.theme.colors.dark};
  }
`;

export const PlayerControls = ({ onPlayPause, isPlaying, onFullScreen }) => (
  <Wrapper>
    <Controls>
      <PlayPauseButton onClick={onPlayPause}>
        {isPlaying() ? <PauseIcon /> : <PlayIcon />}
      </PlayPauseButton>

      <EyeIcon />

      <P>2.9K</P>

      <UploadDownloadIcon />

      <P>3.1 Mb/s</P>
    </Controls>
    <Controls>
      <VolumeIcon />

      <RangeSlider />

      <UnstyledButton onClick={onFullScreen}>
        <FullScreenIcon />
      </UnstyledButton>
    </Controls>
  </Wrapper>
);
