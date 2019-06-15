import React from "react";
import { tablet } from "../../../utils/media";
import { styled } from "../../../utils/theme";
import { Button } from "../../Button";
import { FullScreenIcon, PauseIcon, PlayIcon } from "../../Icon";

const PlayerControlsContainer = styled.div`
  max-width: 1320px;
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

  justify-content: space-between;
  align-items: center;
  display: none;

  ${tablet`
    display: flex;
  `}
`;

const ControlsSection = styled.div`
  display: flex;
  align-items: center;
`;

export const PlayerControls = ({ onPlayPause, isPlaying, onFullScreen }) => (
  <PlayerControlsContainer>
    <ControlsSection>
      <Button onClick={onPlayPause}>
        {isPlaying() ? <PauseIcon /> : <PlayIcon />}
      </Button>
    </ControlsSection>

    <ControlsSection>
      <Button onClick={onFullScreen}>
        <FullScreenIcon />
      </Button>
    </ControlsSection>
  </PlayerControlsContainer>
);
