import React from "react";
import { tablet } from "../../../utils/media";
import { styled } from "../../../utils/theme";
import { Button } from "../../Button";
import { Container } from "../../Container";
import { FullScreenIcon, PauseIcon, PlayIcon } from "../../Icon";

const Wrapper = styled.div`
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
  padding: 0 30px;
`;

const Controls = styled.div`
  display: none;

  ${tablet`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 60px;
  `}
`;

const ControlsSection = styled.div`
  display: flex;
  align-items: center;
`;

export const PlayerControls = ({ onPlayPause, isPlaying, onFullScreen }) => (
  <Wrapper>
    <Container>
      <Controls>
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
      </Controls>
    </Container>
  </Wrapper>
);
